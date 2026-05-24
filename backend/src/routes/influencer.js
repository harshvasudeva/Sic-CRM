/**
 * Influencer Module API Routes
 * Complete CRUD for creators, social accounts, campaigns, deals, content,
 * plus platform OAuth and sync endpoints.
 */
const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { authMiddleware } = require('../middleware/auth')
const orchestrator = require('../services/platforms/orchestrator')
const analyticsService = require('../services/influencerAnalytics')

router.use(authMiddleware)

// =====================================================
// PLATFORM CONFIG (Admin)
// =====================================================

/** GET /platforms - List configured platforms */
router.get('/platforms', async (req, res) => {
  try {
    const configs = await prisma.platformApiConfig.findMany({
      select: { id: true, platform: true, isActive: true, redirectUri: true, scopes: true, updatedAt: true },
    })
    res.json(configs)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/** POST /platforms - Save platform API config */
router.post('/platforms', async (req, res) => {
  try {
    const { platform, clientId, clientSecret, apiKey, redirectUri, scopes, metadata } = req.body
    if (!platform) return res.status(400).json({ error: 'platform is required' })

    const config = await orchestrator.setConfig(platform, { clientId, clientSecret, apiKey, redirectUri, scopes, metadata })
    res.json({ message: `${platform} configured`, config: { id: config.id, platform: config.platform, isActive: config.isActive } })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/** DELETE /platforms/:platform - Disable a platform */
router.delete('/platforms/:platform', async (req, res) => {
  try {
    await prisma.platformApiConfig.update({
      where: { platform: req.params.platform },
      data: { isActive: false },
    })
    res.json({ message: `${req.params.platform} disabled` })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// =====================================================
// OAUTH
// =====================================================

/** GET /oauth/url/:platform - Get OAuth authorization URL */
router.get('/oauth/url/:platform', async (req, res) => {
  try {
    const { socialAccountId } = req.query
    const state = JSON.stringify({ socialAccountId, userId: req.user?.id })
    const url = await orchestrator.getAuthUrl(req.params.platform, Buffer.from(state).toString('base64'))
    res.json({ authUrl: url, platform: req.params.platform })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

/** GET /oauth/callback/:platform - Handle OAuth callback */
router.get('/oauth/callback/:platform', async (req, res) => {
  try {
    const { code, state, code_verifier } = req.query
    let socialAccountId = null
    if (state) {
      try {
        const decoded = JSON.parse(Buffer.from(state, 'base64').toString())
        socialAccountId = decoded.socialAccountId
      } catch {}
    }

    const tokens = await orchestrator.handleOAuthCallback(req.params.platform, code, socialAccountId, code_verifier)
    // Redirect to frontend with success
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
    res.redirect(`${frontendUrl}/influencer/settings?connected=${req.params.platform}&success=true`)
  } catch (err) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
    res.redirect(`${frontendUrl}/influencer/settings?error=${encodeURIComponent(err.message)}`)
  }
})

// =====================================================
// CREATORS CRUD
// =====================================================

/** GET /creators - List all creators */
router.get('/creators', async (req, res) => {
  try {
    const { search, platform, niche, status, city, sort = 'createdAt', order = 'desc', page = 1, limit = 50 } = req.query
    const where = { isActive: true }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { contactEmail: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
      ]
    }
    if (niche) where.niche = { contains: niche, mode: 'insensitive' }
    if (status) where.status = status
    if (city) where.city = { contains: city, mode: 'insensitive' }

    // Filter by platform requires joining social accounts
    const include = {
      socialAccounts: {
        select: { id: true, platform: true, handle: true, followers: true, avgViews: true, engagementRate: true, profilePicUrl: true, isVerified: true, lastSyncedAt: true },
      },
      _count: { select: { dealHistory: true, campaignCreators: true } },
    }

    if (platform) {
      where.socialAccounts = { some: { platform: platform.toLowerCase() } }
    }

    const [creators, total] = await Promise.all([
      prisma.creator.findMany({
        where,
        include,
        orderBy: { [sort]: order },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      }),
      prisma.creator.count({ where }),
    ])

    res.json({
      creators,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/** GET /creators/:id - Get single creator with full social account data */
router.get('/creators/:id', async (req, res) => {
  try {
    const creator = await prisma.creator.findUnique({
      where: { id: req.params.id },
      include: {
        socialAccounts: {
          include: {
            contentPosts: { orderBy: { publishedAt: 'desc' }, take: 20 },
          },
        },
        dealHistory: { orderBy: { date: 'desc' } },
        campaignCreators: {
          include: { campaign: { select: { id: true, name: true, brand: true, status: true } } },
        },
        analytics: { orderBy: { date: 'desc' }, take: 30 },
      },
    })
    if (!creator) return res.status(404).json({ error: 'Creator not found' })
    res.json(creator)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/** POST /creators - Create a new creator */
router.post('/creators', async (req, res) => {
  try {
    const { name, niche, city, contactEmail, contactWhatsApp, status, negotiationNotes, labels, brandsWorkedWith, socialAccounts } = req.body
    if (!name) return res.status(400).json({ error: 'name is required' })

    const creator = await prisma.creator.create({
      data: {
        name,
        niche,
        city,
        contactEmail,
        contactWhatsApp,
        status: status || 'Cold',
        negotiationNotes,
        labels: labels || [],
        brandsWorkedWith: brandsWorkedWith || [],
        socialAccounts: socialAccounts?.length ? {
          create: socialAccounts.map(sa => ({
            platform: sa.platform.toLowerCase(),
            handle: sa.handle,
            platformUserId: sa.platformUserId,
            followers: sa.followers || 0,
            avgViews: sa.avgViews || 0,
          })),
        } : undefined,
      },
      include: { socialAccounts: true },
    })

    for (const sa of creator.socialAccounts) {
      if ((sa.platform === 'youtube' || sa.platform === 'twitter') && sa.handle && !sa.accessToken) {
        orchestrator.fetchPublicProfile(sa.platform, sa.handle)
          .then(async (profile) => {
            if (profile) {
              await prisma.socialAccount.update({
                where: { id: sa.id },
                data: {
                  platformUserId: profile.platformUserId || sa.platformUserId,
                  followers: profile.followers || sa.followers,
                  bio: profile.bio,
                  profilePicUrl: profile.profilePicUrl,
                  isVerified: profile.isVerified || false,
                  platformData: profile.platformData || {},
                  lastSyncedAt: new Date(),
                },
              })

              const today = new Date()
              today.setHours(0, 0, 0, 0)
              await prisma.creatorAnalyticsSnapshot.upsert({
                where: {
                  creatorId_platform_date: {
                    creatorId: creator.id,
                    platform: sa.platform,
                    date: today,
                  },
                },
                create: {
                  creatorId: creator.id,
                  platform: sa.platform,
                  date: today,
                  followers: profile.followers || 0,
                  platformData: profile.platformData || {},
                },
                update: {
                  followers: profile.followers || 0,
                  platformData: profile.platformData || {},
                },
              })

              await orchestrator._updateCreatorScore(creator.id)
            }
          })
          .catch(() => {})
      }
    }

    res.status(201).json(creator)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/** PUT /creators/:id - Update creator */
router.put('/creators/:id', async (req, res) => {
  try {
    const { name, niche, city, contactEmail, contactWhatsApp, status, negotiationNotes, labels, brandsWorkedWith, tracked } = req.body
    const creator = await prisma.creator.update({
      where: { id: req.params.id },
      data: { name, niche, city, contactEmail, contactWhatsApp, status, negotiationNotes, labels, brandsWorkedWith, tracked },
      include: { socialAccounts: true },
    })
    res.json(creator)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

/** DELETE /creators/:id - Soft delete creator */
router.delete('/creators/:id', async (req, res) => {
  try {
    await prisma.creator.update({ where: { id: req.params.id }, data: { isActive: false } })
    res.json({ message: 'Creator deleted' })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// =====================================================
// SOCIAL ACCOUNTS
// =====================================================

/** POST /creators/:id/social-accounts - Add a social account to a creator */
router.post('/creators/:id/social-accounts', async (req, res) => {
  try {
    const { platform, handle, platformUserId } = req.body
    if (!platform || !handle) return res.status(400).json({ error: 'platform and handle are required' })

    const account = await prisma.socialAccount.create({
      data: {
        creatorId: req.params.id,
        platform: platform.toLowerCase(),
        handle,
        platformUserId,
      },
    })
    res.status(201).json(account)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/** DELETE /social-accounts/:id - Remove a social account */
router.delete('/social-accounts/:id', async (req, res) => {
  try {
    await prisma.socialAccount.delete({ where: { id: req.params.id } })
    res.json({ message: 'Social account removed' })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

/** POST /social-accounts/:id/sync - Sync a single social account (profile + content) */
router.post('/social-accounts/:id/sync', async (req, res) => {
  try {
    const result = await orchestrator.fullSync(req.params.id)
    res.json({ message: 'Sync complete', ...result })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/** POST /creators/:id/sync - Sync all social accounts for a creator */
router.post('/creators/:id/sync', async (req, res) => {
  try {
    const results = await orchestrator.syncCreator(req.params.id)
    res.json({ message: 'Creator sync complete', results })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// =====================================================
// PUBLIC PROFILE LOOKUP (no OAuth needed for YouTube/Twitter)
// =====================================================

/** GET /lookup/:platform/:handle - Fetch public profile by handle */
router.get('/lookup/:platform/:handle', async (req, res) => {
  try {
    const profile = await orchestrator.fetchPublicProfile(req.params.platform, req.params.handle)
    res.json(profile)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

/** POST /creators/import-from-platform - Create creator from platform profile lookup */
router.post('/creators/import-from-platform', async (req, res) => {
  try {
    const { platform, handle, name, niche, city } = req.body
    if (!platform || !handle) return res.status(400).json({ error: 'platform and handle required' })

    // Try to fetch public profile
    let profile = null
    try {
      profile = await orchestrator.fetchPublicProfile(platform.toLowerCase(), handle)
    } catch (e) {
      // Not all platforms support public lookup, proceed with manual data
    }

    const creator = await prisma.creator.create({
      data: {
        name: name || profile?.name || handle,
        niche,
        city,
        socialAccounts: {
          create: [{
            platform: platform.toLowerCase(),
            handle,
            platformUserId: profile?.platformUserId,
            followers: profile?.followers || 0,
            bio: profile?.bio,
            profilePicUrl: profile?.profilePicUrl,
            isVerified: profile?.isVerified || false,
            platformData: profile?.platformData || {},
            lastSyncedAt: profile ? new Date() : null,
          }],
        },
      },
      include: { socialAccounts: true },
    })

    res.status(201).json(creator)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// =====================================================
// CONTENT POSTS
// =====================================================

/** GET /social-accounts/:id/posts - Get content posts for a social account */
router.get('/social-accounts/:id/posts', async (req, res) => {
  try {
    const { sort = 'publishedAt', order = 'desc', limit = 50 } = req.query
    const posts = await prisma.contentPost.findMany({
      where: { socialAccountId: req.params.id },
      orderBy: { [sort]: order },
      take: Number(limit),
    })
    res.json(posts)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/** GET /creators/:id/posts - Get all content posts across all platforms for a creator */
router.get('/creators/:id/posts', async (req, res) => {
  try {
    const { platform, sort = 'publishedAt', order = 'desc', limit = 50 } = req.query
    const where = { socialAccount: { creatorId: req.params.id } }
    if (platform) where.socialAccount.platform = platform.toLowerCase()

    const posts = await prisma.contentPost.findMany({
      where,
      include: { socialAccount: { select: { platform: true, handle: true } } },
      orderBy: { [sort]: order },
      take: Number(limit),
    })
    res.json(posts)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// =====================================================
// ANALYTICS
// =====================================================

/** GET /creators/:id/analytics - Get analytics snapshots for a creator */
router.get('/creators/:id/analytics', async (req, res) => {
  try {
    const { platform, days = 30 } = req.query
    const where = {
      creatorId: req.params.id,
      date: { gte: new Date(Date.now() - Number(days) * 86400000) },
    }
    if (platform) where.platform = platform.toLowerCase()

    const snapshots = await prisma.creatorAnalyticsSnapshot.findMany({
      where,
      orderBy: { date: 'asc' },
    })

    // Compute growth
    let followerGrowth = []
    if (snapshots.length >= 2) {
      const first = snapshots[0]
      const last = snapshots[snapshots.length - 1]
      followerGrowth = snapshots.map(s => ({ date: s.date, followers: s.followers, platform: s.platform }))
    }

    res.json({
      snapshots,
      followerGrowth,
      summary: {
        dataPoints: snapshots.length,
        latestFollowers: snapshots[snapshots.length - 1]?.followers || 0,
        earliestFollowers: snapshots[0]?.followers || 0,
        growth: snapshots.length >= 2
          ? snapshots[snapshots.length - 1].followers - snapshots[0].followers
          : 0,
      },
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/** GET /creators/:id/growth - Growth metrics (follower trends, velocity, projections) */
router.get('/creators/:id/growth', async (req, res) => {
  try {
    const { days = 90 } = req.query
    const result = await analyticsService.computeGrowthMetrics(req.params.id, Number(days))
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/** GET /creators/:id/engagement-quality - Engagement quality metrics */
router.get('/creators/:id/engagement-quality', async (req, res) => {
  try {
    const result = await analyticsService.computeEngagementQuality(req.params.id)
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/** GET /creators/:id/rate-card - Suggested pricing based on stats */
router.get('/creators/:id/rate-card', async (req, res) => {
  try {
    const result = await analyticsService.computeRateCard(req.params.id)
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/** GET /creators/:id/anomalies - Fraud and anomaly detection */
router.get('/creators/:id/anomalies', async (req, res) => {
  try {
    const result = await analyticsService.detectAnomalies(req.params.id)
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/** GET /creators/:id/performance-summary - Aggregated dashboard data */
router.get('/creators/:id/performance-summary', async (req, res) => {
  try {
    const result = await analyticsService.getPerformanceSummary(req.params.id)
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/** GET /creators/compare - Compare multiple creators side by side */
router.get('/creators/compare', async (req, res) => {
  try {
    const { ids } = req.query
    if (!ids) return res.status(400).json({ error: 'ids query parameter required (comma-separated)' })
    const creatorIds = ids.split(',').map(id => id.trim()).filter(Boolean)
    const result = await analyticsService.compareCreators(creatorIds)
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// =====================================================
// TRACKING TOGGLE
// =====================================================

/** POST /creators/:id/track - Enable daily sync for a creator */
router.post('/creators/:id/track', async (req, res) => {
  try {
    const creator = await prisma.creator.update({
      where: { id: req.params.id },
      data: { tracked: true },
      select: { id: true, name: true, tracked: true },
    })
    res.json(creator)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

/** DELETE /creators/:id/track - Disable daily sync for a creator */
router.delete('/creators/:id/track', async (req, res) => {
  try {
    const creator = await prisma.creator.update({
      where: { id: req.params.id },
      data: { tracked: false },
      select: { id: true, name: true, tracked: true },
    })
    res.json(creator)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// =====================================================
// DEALS
// =====================================================

/** GET /creators/:id/deals - Get deal history */
router.get('/creators/:id/deals', async (req, res) => {
  try {
    const deals = await prisma.creatorDeal.findMany({
      where: { creatorId: req.params.id },
      orderBy: { date: 'desc' },
    })
    res.json(deals)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/** POST /creators/:id/deals - Add a deal */
router.post('/creators/:id/deals', async (req, res) => {
  try {
    const { brand, amount, deliverables, status, date } = req.body
    const deal = await prisma.creatorDeal.create({
      data: {
        creatorId: req.params.id,
        brand: brand || '',
        amount: amount || 0,
        deliverables,
        status: status || 'Pending',
        date: date ? new Date(date) : new Date(),
      },
    })
    res.status(201).json(deal)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/** PATCH /deals/:id - Update deal status */
router.patch('/deals/:id', async (req, res) => {
  try {
    const deal = await prisma.creatorDeal.update({
      where: { id: req.params.id },
      data: req.body,
    })
    res.json(deal)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// =====================================================
// CAMPAIGNS
// =====================================================

/** GET /campaigns - List campaigns */
router.get('/campaigns', async (req, res) => {
  try {
    const { status, search, page = 1, limit = 25 } = req.query
    const where = {}
    if (status) where.status = status
    if (search) where.name = { contains: search, mode: 'insensitive' }

    const [campaigns, total] = await Promise.all([
      prisma.influencerCampaign.findMany({
        where,
        include: {
          creators: {
            include: {
              creator: { select: { id: true, name: true, creatorTier: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      }),
      prisma.influencerCampaign.count({ where }),
    ])

    res.json({ campaigns, total, page: Number(page), pages: Math.ceil(total / Number(limit)) })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/** GET /campaigns/:id */
router.get('/campaigns/:id', async (req, res) => {
  try {
    const campaign = await prisma.influencerCampaign.findUnique({
      where: { id: req.params.id },
      include: {
        creators: {
          include: {
            creator: {
              include: { socialAccounts: { select: { platform: true, handle: true, followers: true, profilePicUrl: true } } },
            },
          },
        },
      },
    })
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' })
    res.json(campaign)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/** POST /campaigns */
router.post('/campaigns', async (req, res) => {
  try {
    const { name, brand, platform, budget, startDate, endDate, deliverables, creatorIds } = req.body
    if (!name) return res.status(400).json({ error: 'name is required' })

    const campaign = await prisma.influencerCampaign.create({
      data: {
        name,
        brand,
        platform,
        budget: budget || 0,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        deliverables,
        creators: creatorIds?.length ? {
          create: creatorIds.map(cid => ({ creatorId: cid })),
        } : undefined,
      },
      include: { creators: { include: { creator: { select: { id: true, name: true } } } } },
    })
    res.status(201).json(campaign)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/** PUT /campaigns/:id */
router.put('/campaigns/:id', async (req, res) => {
  try {
    const { name, brand, platform, budget, startDate, endDate, status, deliverables, paymentStatus } = req.body
    const campaign = await prisma.influencerCampaign.update({
      where: { id: req.params.id },
      data: {
        name, brand, platform, budget, status, deliverables, paymentStatus,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
      },
    })
    res.json(campaign)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

/** DELETE /campaigns/:id */
router.delete('/campaigns/:id', async (req, res) => {
  try {
    await prisma.influencerCampaign.delete({ where: { id: req.params.id } })
    res.json({ message: 'Campaign deleted' })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

/** POST /campaigns/:id/creators - Add creator to campaign */
router.post('/campaigns/:id/creators', async (req, res) => {
  try {
    const { creatorId, rate, deliverables } = req.body
    const entry = await prisma.campaignCreator.create({
      data: { campaignId: req.params.id, creatorId, rate, deliverables },
      include: { creator: { select: { id: true, name: true } } },
    })
    res.status(201).json(entry)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// =====================================================
// BULK SYNC
// =====================================================

/** POST /sync/all - Sync all creators with active social accounts */
router.post('/sync/all', async (req, res) => {
  try {
    const { dailyProfileSync } = require('../scheduler/syncQueue')
    const result = await dailyProfileSync()
    res.json({ message: 'Sync initiated', ...result })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// =====================================================
// STATS / DASHBOARD
// =====================================================

/** GET /stats - Dashboard statistics */
router.get('/stats', async (req, res) => {
  try {
    const [
      totalCreators,
      totalCampaigns,
      activeCampaigns,
      platformCounts,
      statusCounts,
    ] = await Promise.all([
      prisma.creator.count({ where: { isActive: true } }),
      prisma.influencerCampaign.count(),
      prisma.influencerCampaign.count({ where: { status: 'Active' } }),
      prisma.socialAccount.groupBy({ by: ['platform'], _count: true }),
      prisma.creator.groupBy({ by: ['status'], _count: true, where: { isActive: true } }),
    ])

    const totalFollowers = await prisma.socialAccount.aggregate({ _sum: { followers: true } })
    const avgEngagement = await prisma.socialAccount.aggregate({ _avg: { engagementRate: true } })

    // Recent syncs
    const recentSyncs = await prisma.socialAccount.findMany({
      where: { lastSyncedAt: { not: null } },
      select: { id: true, platform: true, handle: true, lastSyncedAt: true },
      orderBy: { lastSyncedAt: 'desc' },
      take: 10,
    })

    res.json({
      totalCreators,
      totalCampaigns,
      activeCampaigns,
      totalFollowers: totalFollowers._sum.followers || 0,
      avgEngagementRate: Number((avgEngagement._avg.engagementRate || 0).toFixed(2)),
      platformBreakdown: platformCounts.reduce((acc, p) => { acc[p.platform] = p._count; return acc }, {}),
      statusBreakdown: statusCounts.reduce((acc, s) => { acc[s.status] = s._count; return acc }, {}),
      recentSyncs,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
