/**
 * Twitter/X API v2 Service
 * Fetches user profiles, tweets, and engagement metrics.
 *
 * Required: Twitter Developer Account with API v2 access
 * Auth: OAuth 2.0 (PKCE) for user context, Bearer token for app-only
 *
 * Endpoints:
 *   - Users: /2/users/:id, /2/users/by/username/:username
 *   - Tweets: /2/users/:id/tweets
 *   - Metrics: public_metrics, non_public_metrics (requires OAuth)
 */

const BASE_URL = 'https://api.x.com/2'
const AUTH_URL = 'https://twitter.com/i/oauth2/authorize'
const TOKEN_URL = 'https://api.x.com/2/oauth2/token'

class TwitterService {
  /**
   * Get user by username (app-only bearer token)
   */
  async getUserByUsername(username, bearerToken) {
    const cleanUsername = username.startsWith('@') ? username.slice(1) : username
    const fields = 'id,name,username,description,profile_image_url,public_metrics,verified,verified_type,created_at,location,url,pinned_tweet_id'
    const url = `${BASE_URL}/users/by/username/${cleanUsername}?user.fields=${fields}`
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${bearerToken}` },
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(`Twitter user fetch failed: ${err.detail || err.title || res.statusText}`)
    }
    const data = await res.json()
    const user = data.data
    if (!user) throw new Error(`Twitter user not found: @${cleanUsername}`)
    return this._normalizeUser(user)
  }

  /**
   * Get user by ID (app-only bearer token)
   */
  async getUserById(userId, bearerToken) {
    const fields = 'id,name,username,description,profile_image_url,public_metrics,verified,verified_type,created_at,location,url,pinned_tweet_id'
    const url = `${BASE_URL}/users/${userId}?user.fields=${fields}`
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${bearerToken}` },
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(`Twitter user fetch failed: ${err.detail || err.title || res.statusText}`)
    }
    const data = await res.json()
    return this._normalizeUser(data.data)
  }

  /**
   * Get user's recent tweets
   */
  async getUserTweets(userId, bearerToken, maxResults = 20, paginationToken = null) {
    const tweetFields = 'id,text,created_at,public_metrics,referenced_tweets,source,entities,attachments'
    const mediaFields = 'media_key,type,url,preview_image_url,public_metrics'
    let url = `${BASE_URL}/users/${userId}/tweets?tweet.fields=${tweetFields}&media.fields=${mediaFields}&expansions=attachments.media_keys&max_results=${maxResults}`
    if (paginationToken) url += `&pagination_token=${paginationToken}`

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${bearerToken}` },
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(`Twitter tweets fetch failed: ${err.detail || err.title || res.statusText}`)
    }
    const data = await res.json()
    const mediaMap = {}
    ;(data.includes?.media || []).forEach(m => { mediaMap[m.media_key] = m })

    const tweets = (data.data || []).map(t => {
      const mediaKeys = t.attachments?.media_keys || []
      const media = mediaKeys.map(k => mediaMap[k]).filter(Boolean)
      const metrics = t.public_metrics || {}

      return {
        platformPostId: t.id,
        type: this._getTweetType(t, media),
        title: null,
        caption: t.text,
        url: `https://x.com/i/status/${t.id}`,
        thumbnailUrl: media[0]?.preview_image_url || media[0]?.url || null,
        views: metrics.impression_count || 0,
        likes: metrics.like_count || 0,
        comments: metrics.reply_count || 0,
        shares: metrics.retweet_count + (metrics.quote_count || 0),
        saves: metrics.bookmark_count || 0,
        publishedAt: t.created_at,
        raw: t,
      }
    })

    return {
      tweets,
      nextToken: data.meta?.next_token || null,
      resultCount: data.meta?.result_count || 0,
    }
  }

  /**
   * Build OAuth 2.0 authorization URL (PKCE)
   */
  getAuthUrl(clientId, redirectUri, state = '', codeChallenge = '') {
    const scopes = 'tweet.read users.read offline.access'
    return `${AUTH_URL}?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&state=${state}&code_challenge=${codeChallenge}&code_challenge_method=S256`
  }

  /**
   * Exchange OAuth code for access token
   */
  async exchangeCode(code, clientId, clientSecret, redirectUri, codeVerifier) {
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
    const res = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${credentials}`,
      },
      body: new URLSearchParams({
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
      }),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(`Twitter OAuth failed: ${err.error_description || res.statusText}`)
    }
    return await res.json()
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken, clientId, clientSecret) {
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
    const res = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${credentials}`,
      },
      body: new URLSearchParams({
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(`Twitter refresh failed: ${err.error_description || res.statusText}`)
    }
    return await res.json()
  }

  // --- Helpers ---

  _normalizeUser(user) {
    const metrics = user.public_metrics || {}
    return {
      platformUserId: user.id,
      handle: `@${user.username}`,
      name: user.name,
      bio: user.description,
      followers: metrics.followers_count || 0,
      following: metrics.following_count || 0,
      totalTweets: metrics.tweet_count || 0,
      totalListed: metrics.listed_count || 0,
      profilePicUrl: user.profile_image_url?.replace('_normal', '_400x400'),
      isVerified: user.verified || false,
      verifiedType: user.verified_type, // blue, business, government
      location: user.location,
      website: user.url,
      createdAt: user.created_at,
      platformData: {
        followersCount: metrics.followers_count,
        followingCount: metrics.following_count,
        tweetCount: metrics.tweet_count,
        listedCount: metrics.listed_count,
        verifiedType: user.verified_type,
      },
      raw: user,
    }
  }

  _getTweetType(tweet, media) {
    if (tweet.referenced_tweets?.some(r => r.type === 'retweeted')) return 'retweet'
    if (tweet.referenced_tweets?.some(r => r.type === 'replied_to')) return 'reply'
    if (media.some(m => m.type === 'video')) return 'video'
    if (media.some(m => m.type === 'photo')) return 'photo'
    return 'tweet'
  }
}

module.exports = new TwitterService()
