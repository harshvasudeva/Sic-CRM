/**
 * Platform Orchestrator
 * Unified interface for fetching/syncing data across all social platforms.
 * Handles token refresh, data normalization, and DB persistence.
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const instagram = require('./instagram')
const youtube = require('./youtube')
const tiktok = require('./tiktok')
const twitter = require('./twitter')

const platformServices = { instagram, youtube, tiktok, twitter }

class PlatformOrchestrator {
  /**
   * Get platform API config from DB
   */
  async getConfig(platform) {
    const config = await prisma.platformApiConfig.findUnique({ where: { platform } })
    if (!config || !config.isActive) return null
    return config
  }

  /**
   * Save/update platform API config
   */
  async setConfig(platform, { clientId, clientSecret, apiKey, redirectUri, scopes, metadata }) {
    return prisma.platformApiConfig.upsert({
      where: { platform },
      create: { platform, clientId, clientSecret, apiKey, redirectUri, scopes, metadata, isActive: true },
      update: { clientId, clientSecret, apiKey, redirectUri, scopes, metadata, isActive: true },
    })
  }

  /**
   * Get OAuth authorization URL for a platform
   */
  async getAuthUrl(platform, state = '') {
    const config = await this.getConfig(platform)
    if (!config) throw new Error(`Platform ${platform} is not configured`)

    const redirectUri = config.redirectUri || `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/influencer/oauth/callback/${platform}`

    switch (platform) {
      case 'instagram':
        return instagram.getAuthUrl(config.clientId, redirectUri, state)
      case 'youtube':
        return youtube.getAuthUrl(config.clientId, redirectUri, state)
      case 'tiktok':
        return tiktok.getAuthUrl(config.clientId, redirectUri, state)
      case 'twitter':
        return twitter.getAuthUrl(config.clientId, redirectUri, state)
      default:
        throw new Error(`Unsupported platform: ${platform}`)
    }
  }

  /**
   * Handle OAuth callback — exchange code for tokens, persist
   */
  async handleOAuthCallback(platform, code, socialAccountId, codeVerifier = null) {
    const config = await this.getConfig(platform)
    if (!config) throw new Error(`Platform ${platform} is not configured`)
    const redirectUri = config.redirectUri || `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/influencer/oauth/callback/${platform}`

    let tokens
    switch (platform) {
      case 'instagram': {
        const initial = await instagram.exchangeCode(code, config.clientId, config.clientSecret, redirectUri)
        tokens = await instagram.exchangeToken(initial.access_token, config.clientId, config.clientSecret)
        break
      }
      case 'youtube':
        tokens = await youtube.exchangeCode(code, config.clientId, config.clientSecret, redirectUri)
        break
      case 'tiktok':
        tokens = await tiktok.exchangeCode(code, config.clientId, config.clientSecret, redirectUri)
        break
      case 'twitter':
        tokens = await twitter.exchangeCode(code, config.clientId, config.clientSecret, redirectUri, codeVerifier)
        break
      default:
        throw new Error(`Unsupported platform: ${platform}`)
    }

    // Persist tokens to the social account
    if (socialAccountId) {
      await prisma.socialAccount.update({
        where: { id: socialAccountId },
        data: {
          accessToken: tokens.access_token || tokens.accessToken,
          refreshToken: tokens.refresh_token || tokens.refreshToken,
          tokenExpiry: tokens.expires_in
            ? new Date(Date.now() + (tokens.expires_in || 3600) * 1000)
            : null,
        },
      })
    }

    return tokens
  }

  /**
   * Ensure valid token — refresh if expired
   */
  async ensureValidToken(socialAccount) {
    if (!socialAccount.tokenExpiry || new Date(socialAccount.tokenExpiry) > new Date()) {
      return socialAccount.accessToken
    }

    // Token expired — refresh it
    if (!socialAccount.refreshToken) {
      throw new Error(`Token expired for ${socialAccount.platform}:${socialAccount.handle} and no refresh token available`)
    }

    const config = await this.getConfig(socialAccount.platform)
    if (!config) throw new Error(`Platform ${socialAccount.platform} not configured`)

    let newTokens
    switch (socialAccount.platform) {
      case 'instagram':
        newTokens = await instagram.refreshToken(socialAccount.refreshToken)
        break
      case 'youtube':
        newTokens = await youtube.refreshToken(socialAccount.refreshToken, config.clientId, config.clientSecret)
        break
      case 'tiktok':
        newTokens = await tiktok.refreshToken(socialAccount.refreshToken, config.clientId, config.clientSecret)
        break
      case 'twitter':
        newTokens = await twitter.refreshToken(socialAccount.refreshToken, config.clientId, config.clientSecret)
        break
    }

    const accessToken = newTokens.access_token || newTokens.accessToken
    await prisma.socialAccount.update({
      where: { id: socialAccount.id },
      data: {
        accessToken,
        refreshToken: newTokens.refresh_token || newTokens.refreshToken || socialAccount.refreshToken,
        tokenExpiry: newTokens.expires_in
          ? new Date(Date.now() + (newTokens.expires_in || 3600) * 1000)
          : null,
      },
    })

    return accessToken
  }

  /**
   * Fetch profile from platform API and update DB
   */
  async syncProfile(socialAccountId) {
    const account = await prisma.socialAccount.findUnique({
      where: { id: socialAccountId },
      include: { creator: true },
    })
    if (!account) throw new Error('Social account not found')

    const config = await this.getConfig(account.platform)
    let profile

    switch (account.platform) {
      case 'instagram': {
        const token = await this.ensureValidToken(account)
        profile = await instagram.getProfile(token, account.platformUserId || 'me')
        break
      }
      case 'youtube': {
        if (account.accessToken) {
          const token = await this.ensureValidToken(account)
          profile = await youtube.getMyChannel(token)
        } else if (config?.apiKey) {
          if (account.platformUserId) {
            profile = await youtube.getChannelById(account.platformUserId, config.apiKey)
          } else {
            profile = await youtube.getChannelByHandle(account.handle, config.apiKey)
          }
        } else {
          throw new Error('YouTube requires either OAuth token or API key')
        }
        break
      }
      case 'tiktok': {
        const token = await this.ensureValidToken(account)
        profile = await tiktok.getProfile(token)
        break
      }
      case 'twitter': {
        // Twitter can use bearer token for public data
        if (config?.apiKey) {
          profile = await twitter.getUserByUsername(account.handle, config.apiKey)
        } else if (account.accessToken) {
          const token = await this.ensureValidToken(account)
          profile = await twitter.getUserByUsername(account.handle, token)
        } else {
          throw new Error('Twitter requires bearer token or API key')
        }
        break
      }
      default:
        throw new Error(`Unsupported platform: ${account.platform}`)
    }

    // Update social account with fetched data
    const updated = await prisma.socialAccount.update({
      where: { id: socialAccountId },
      data: {
        platformUserId: profile.platformUserId || account.platformUserId,
        followers: profile.followers || account.followers,
        bio: profile.bio,
        profilePicUrl: profile.profilePicUrl,
        isVerified: profile.isVerified || false,
        platformData: profile.platformData || profile.raw || {},
        lastSyncedAt: new Date(),
      },
    })

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    await prisma.creatorAnalyticsSnapshot.upsert({
      where: {
        creatorId_platform_date: {
          creatorId: account.creatorId,
          platform: account.platform,
          date: today,
        },
      },
      create: {
        creatorId: account.creatorId,
        platform: account.platform,
        date: today,
        followers: profile.followers || 0,
        avgViews: account.avgViews || 0,
        engagementRate: updated.engagementRate,
        platformData: profile.platformData || {},
      },
      update: {
        followers: profile.followers || 0,
        avgViews: account.avgViews || 0,
        engagementRate: updated.engagementRate,
        platformData: profile.platformData || {},
      },
    })

    return { account: updated, profile }
  }

  /**
   * Fetch media/content from platform and persist
   */
  async syncContent(socialAccountId) {
    const account = await prisma.socialAccount.findUnique({ where: { id: socialAccountId } })
    if (!account) throw new Error('Social account not found')

    const config = await this.getConfig(account.platform)
    let posts = []

    switch (account.platform) {
      case 'instagram': {
        const token = await this.ensureValidToken(account)
        posts = await instagram.getMedia(token, account.platformUserId || 'me', 25)
        break
      }
      case 'youtube': {
        if (config?.apiKey && account.platformUserId) {
          posts = await youtube.getChannelVideos(account.platformUserId, config.apiKey, 20)
        } else if (account.accessToken) {
          const token = await this.ensureValidToken(account)
          const ch = await youtube.getMyChannel(token)
          posts = await youtube.getChannelVideos(ch.platformUserId, config?.apiKey || token, 20)
        }
        break
      }
      case 'tiktok': {
        const token = await this.ensureValidToken(account)
        const result = await tiktok.getVideos(token, 0, 20)
        posts = result.videos
        break
      }
      case 'twitter': {
        const bearerToken = config?.apiKey || account.accessToken
        if (!bearerToken) throw new Error('Twitter requires bearer token')
        if (!account.platformUserId) throw new Error('Twitter user ID required')
        const result = await twitter.getUserTweets(account.platformUserId, bearerToken, 20)
        posts = result.tweets
        break
      }
    }

    // Upsert posts into DB
    let synced = 0
    for (const post of posts) {
      if (post.platformPostId) {
        await prisma.contentPost.upsert({
          where: {
            platformPostId_socialAccountId: {
              platformPostId: post.platformPostId,
              socialAccountId,
            },
          },
          create: {
            socialAccountId,
            platformPostId: post.platformPostId,
            type: post.type,
            title: post.title,
            caption: post.caption?.substring(0, 5000),
            url: post.url,
            thumbnailUrl: post.thumbnailUrl,
            views: post.views || 0,
            likes: post.likes || 0,
            comments: post.comments || 0,
            shares: post.shares || 0,
            saves: post.saves || 0,
            publishedAt: post.publishedAt ? new Date(post.publishedAt) : null,
            platformData: post.raw || {},
          },
          update: {
            views: post.views || 0,
            likes: post.likes || 0,
            comments: post.comments || 0,
            shares: post.shares || 0,
            saves: post.saves || 0,
            platformData: post.raw || {},
          },
        })
      } else {
        await prisma.contentPost.create({
          data: {
            socialAccountId,
            type: post.type,
            title: post.title,
            caption: post.caption?.substring(0, 5000),
            url: post.url,
            thumbnailUrl: post.thumbnailUrl,
            views: post.views || 0,
            likes: post.likes || 0,
            comments: post.comments || 0,
            shares: post.shares || 0,
            saves: post.saves || 0,
            publishedAt: post.publishedAt ? new Date(post.publishedAt) : null,
            platformData: post.raw || {},
          },
        })
      }
      synced++
    }

    // Update avg views on social account
    if (posts.length > 0) {
      const avgViews = Math.round(posts.reduce((s, p) => s + (p.views || 0), 0) / posts.length)
      const totalEngagement = posts.reduce((s, p) => s + (p.likes || 0) + (p.comments || 0) + (p.shares || 0), 0)
      const totalViews = posts.reduce((s, p) => s + (p.views || 0), 0)
      const engagementRate = totalViews > 0 ? (totalEngagement / totalViews) * 100 : 0

      await prisma.socialAccount.update({
        where: { id: socialAccountId },
        data: { avgViews, engagementRate },
      })
    }

    return { syncedPosts: synced, totalFetched: posts.length }
  }

  /**
   * Full sync: profile + content for a social account
   */
  async fullSync(socialAccountId) {
    const profileResult = await this.syncProfile(socialAccountId)
    const contentResult = await this.syncContent(socialAccountId)
    return { profile: profileResult, content: contentResult }
  }

  /**
   * Sync all active social accounts for a creator
   */
  async syncCreator(creatorId) {
    const accounts = await prisma.socialAccount.findMany({
      where: { creatorId },
    })

    const results = []
    for (const account of accounts) {
      try {
        const result = await this.fullSync(account.id)
        results.push({ accountId: account.id, platform: account.platform, status: 'success', ...result })
      } catch (err) {
        results.push({ accountId: account.id, platform: account.platform, status: 'error', error: err.message })
      }
    }

    // Compute aggregate creator score
    await this._updateCreatorScore(creatorId)

    return results
  }

  /**
   * Fetch public profile by handle (no OAuth needed for some platforms)
   * Used for adding new creators by just entering their handle
   */
  async fetchPublicProfile(platform, handle) {
    const config = await this.getConfig(platform)

    switch (platform) {
      case 'youtube': {
        if (!config?.apiKey) throw new Error('YouTube API key required. Configure it in Platform Settings.')
        return await youtube.getChannelByHandle(handle, config.apiKey)
      }
      case 'twitter': {
        if (!config?.apiKey) throw new Error('Twitter bearer token required. Configure it in Platform Settings.')
        return await twitter.getUserByUsername(handle, config.apiKey)
      }
      case 'instagram':
        throw new Error('Instagram requires OAuth authentication. Use the Connect flow.')
      case 'tiktok':
        throw new Error('TikTok requires OAuth authentication. Use the Connect flow.')
      default:
        throw new Error(`Unsupported platform: ${platform}`)
    }
  }

  /**
   * Update aggregate creator score based on all social accounts
   */
  async _updateCreatorScore(creatorId) {
    const accounts = await prisma.socialAccount.findMany({
      where: { creatorId },
      select: { followers: true, avgViews: true, engagementRate: true },
    })

    const totalFollowers = accounts.reduce((s, a) => s + (a.followers || 0), 0)
    const avgEngagement = accounts.length > 0
      ? accounts.reduce((s, a) => s + (a.engagementRate || 0), 0) / accounts.length
      : 0
    const avgViews = accounts.length > 0
      ? accounts.reduce((s, a) => s + (a.avgViews || 0), 0) / accounts.length
      : 0

    // Simple score: reach (40%) + engagement (40%) + consistency (20%)
    let score = 0
    if (totalFollowers > 1000000) score += 40
    else if (totalFollowers > 500000) score += 30
    else if (totalFollowers > 100000) score += 20
    else if (totalFollowers > 10000) score += 10
    else score += 5

    if (avgEngagement > 5) score += 40
    else if (avgEngagement > 3) score += 30
    else if (avgEngagement > 1) score += 20
    else score += 10

    // Multi-platform bonus
    score += Math.min(accounts.length * 5, 20)

    score = Math.min(score, 100)
    const tier = score >= 80 ? 'platinum' : score >= 60 ? 'gold' : score >= 40 ? 'silver' : 'bronze'

    await prisma.creator.update({
      where: { id: creatorId },
      data: { creatorScore: score, creatorTier: tier },
    })
  }
}

module.exports = new PlatformOrchestrator()
