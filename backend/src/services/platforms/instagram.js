/**
 * Instagram Graph API Service
 * Uses Meta Graph API v21.0 to fetch Instagram Business/Creator account data.
 *
 * Required: Facebook App with Instagram Graph API permissions
 * Scopes: instagram_basic, instagram_manage_insights, pages_show_list, pages_read_engagement
 *
 * Flow:
 *   1. User connects via OAuth → we get a short-lived token
 *   2. Exchange for long-lived token (60 days)
 *   3. Use token to fetch profile, media, insights
 */

const BASE_URL = 'https://graph.instagram.com'
const GRAPH_URL = 'https://graph.facebook.com/v21.0'

class InstagramService {
  /**
   * Exchange short-lived token for long-lived token
   */
  async exchangeToken(shortLivedToken, clientId, clientSecret) {
    const url = `${GRAPH_URL}/oauth/access_token?grant_type=fb_exchange_token&client_id=${clientId}&client_secret=${clientSecret}&fb_exchange_token=${shortLivedToken}`
    const res = await fetch(url)
    if (!res.ok) {
      const err = await res.json()
      throw new Error(`Instagram token exchange failed: ${err.error?.message || res.statusText}`)
    }
    const data = await res.json()
    return {
      accessToken: data.access_token,
      tokenType: data.token_type,
      expiresIn: data.expires_in, // ~5184000 seconds (60 days)
    }
  }

  /**
   * Refresh a long-lived token (can only be done once per token, and token must be at least 24hrs old)
   */
  async refreshToken(longLivedToken) {
    const url = `${GRAPH_URL}/oauth/access_token?grant_type=ig_refresh_token&access_token=${longLivedToken}`
    const res = await fetch(url)
    if (!res.ok) {
      const err = await res.json()
      throw new Error(`Instagram token refresh failed: ${err.error?.message || res.statusText}`)
    }
    return await res.json()
  }

  /**
   * Get Instagram Business/Creator profile
   * Returns: id, username, name, biography, followers_count, follows_count, media_count, profile_picture_url
   */
  async getProfile(accessToken, igUserId = 'me') {
    const fields = 'id,username,name,biography,followers_count,follows_count,media_count,profile_picture_url,website'
    const url = `${GRAPH_URL}/${igUserId}?fields=${fields}&access_token=${accessToken}`
    const res = await fetch(url)
    if (!res.ok) {
      const err = await res.json()
      throw new Error(`Instagram profile fetch failed: ${err.error?.message || res.statusText}`)
    }
    const data = await res.json()
    return {
      platformUserId: data.id,
      handle: data.username,
      name: data.name,
      bio: data.biography,
      followers: data.followers_count,
      following: data.follows_count,
      mediaCount: data.media_count,
      profilePicUrl: data.profile_picture_url,
      website: data.website,
      raw: data,
    }
  }

  /**
   * Get user media (posts, reels, stories)
   * Returns array of media objects with engagement metrics
   */
  async getMedia(accessToken, igUserId = 'me', limit = 25) {
    const fields = 'id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count'
    const url = `${GRAPH_URL}/${igUserId}/media?fields=${fields}&limit=${limit}&access_token=${accessToken}`
    const res = await fetch(url)
    if (!res.ok) {
      const err = await res.json()
      throw new Error(`Instagram media fetch failed: ${err.error?.message || res.statusText}`)
    }
    const data = await res.json()
    return (data.data || []).map(m => ({
      platformPostId: m.id,
      type: this._mapMediaType(m.media_type),
      caption: m.caption,
      url: m.permalink,
      thumbnailUrl: m.thumbnail_url || m.media_url,
      likes: m.like_count || 0,
      comments: m.comments_count || 0,
      publishedAt: m.timestamp,
      raw: m,
    }))
  }

  /**
   * Get insights for a specific media post
   * Metrics: impressions, reach, engagement, saved, video_views (for videos/reels)
   */
  async getMediaInsights(accessToken, mediaId, mediaType = 'IMAGE') {
    const metrics = mediaType === 'VIDEO' || mediaType === 'REEL'
      ? 'impressions,reach,saved,video_views,plays'
      : 'impressions,reach,saved'
    const url = `${GRAPH_URL}/${mediaId}/insights?metric=${metrics}&access_token=${accessToken}`
    const res = await fetch(url)
    if (!res.ok) {
      // Insights may not be available for all posts
      return null
    }
    const data = await res.json()
    const insights = {}
    ;(data.data || []).forEach(m => {
      insights[m.name] = m.values?.[0]?.value || 0
    })
    return insights
  }

  /**
   * Get account-level insights (audience demographics, reach, impressions)
   * Period: day, week, days_28
   */
  async getAccountInsights(accessToken, igUserId, period = 'days_28') {
    const metrics = 'impressions,reach,profile_views,follower_count'
    const url = `${GRAPH_URL}/${igUserId}/insights?metric=${metrics}&period=${period}&access_token=${accessToken}`
    const res = await fetch(url)
    if (!res.ok) {
      const err = await res.json()
      throw new Error(`Instagram insights fetch failed: ${err.error?.message || res.statusText}`)
    }
    const data = await res.json()
    const insights = {}
    ;(data.data || []).forEach(m => {
      insights[m.name] = m.values?.map(v => ({ value: v.value, endTime: v.end_time })) || []
    })
    return insights
  }

  /**
   * Get audience demographics (age, gender, city, country)
   * Only available for accounts with 100+ followers
   */
  async getAudienceDemographics(accessToken, igUserId) {
    const metrics = 'audience_city,audience_country,audience_gender_age'
    const url = `${GRAPH_URL}/${igUserId}/insights?metric=${metrics}&period=lifetime&access_token=${accessToken}`
    const res = await fetch(url)
    if (!res.ok) return null
    const data = await res.json()
    const demographics = {}
    ;(data.data || []).forEach(m => {
      demographics[m.name] = m.values?.[0]?.value || {}
    })

    // Transform into standard format
    return {
      topCities: this._transformDemographic(demographics.audience_city),
      topCountries: this._transformDemographic(demographics.audience_country),
      genderAge: this._transformGenderAge(demographics.audience_gender_age),
    }
  }

  /**
   * Build OAuth authorization URL
   */
  getAuthUrl(clientId, redirectUri, state = '') {
    const scopes = 'instagram_basic,instagram_manage_insights,pages_show_list,pages_read_engagement'
    return `https://www.facebook.com/v21.0/dialog/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopes}&response_type=code&state=${state}`
  }

  /**
   * Exchange OAuth code for access token
   */
  async exchangeCode(code, clientId, clientSecret, redirectUri) {
    const url = `${GRAPH_URL}/oauth/access_token`
    const params = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      code,
      grant_type: 'authorization_code',
    })
    const res = await fetch(url, { method: 'POST', body: params })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(`Instagram OAuth failed: ${err.error?.message || res.statusText}`)
    }
    return await res.json()
  }

  /**
   * Get linked Instagram Business Account from Facebook Page token
   */
  async getLinkedIgAccount(accessToken) {
    // First get pages
    const pagesRes = await fetch(`${GRAPH_URL}/me/accounts?access_token=${accessToken}`)
    if (!pagesRes.ok) throw new Error('Failed to get Facebook pages')
    const pages = await pagesRes.json()

    const igAccounts = []
    for (const page of (pages.data || [])) {
      const igRes = await fetch(
        `${GRAPH_URL}/${page.id}?fields=instagram_business_account{id,username,name,profile_picture_url,followers_count}&access_token=${accessToken}`
      )
      if (igRes.ok) {
        const data = await igRes.json()
        if (data.instagram_business_account) {
          igAccounts.push({
            pageId: page.id,
            pageName: page.name,
            igAccount: data.instagram_business_account,
          })
        }
      }
    }
    return igAccounts
  }

  // --- Helpers ---

  _mapMediaType(apiType) {
    const map = { IMAGE: 'static', VIDEO: 'reel', CAROUSEL_ALBUM: 'carousel', REEL: 'reel' }
    return map[apiType] || 'static'
  }

  _transformDemographic(data) {
    if (!data || typeof data !== 'object') return []
    return Object.entries(data)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10)
  }

  _transformGenderAge(data) {
    if (!data || typeof data !== 'object') return { male: {}, female: {}, other: {} }
    const result = { male: {}, female: {}, other: {} }
    Object.entries(data).forEach(([key, value]) => {
      const [gender, age] = key.split('.')
      const genderKey = gender === 'M' ? 'male' : gender === 'F' ? 'female' : 'other'
      result[genderKey][age] = value
    })
    return result
  }
}

module.exports = new InstagramService()
