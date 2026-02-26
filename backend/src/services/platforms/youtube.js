/**
 * YouTube Data API v3 Service
 * Fetches channel stats, videos, analytics for YouTube creators.
 *
 * Required: Google Cloud project with YouTube Data API v3 enabled
 * Auth: OAuth 2.0 for channel-owner data, API Key for public data
 *
 * Public data (API key only): channel info, public video stats
 * Channel-owner data (OAuth): analytics, revenue, demographics
 */

const BASE_URL = 'https://www.googleapis.com/youtube/v3'
const ANALYTICS_URL = 'https://youtubeanalytics.googleapis.com/v2'
const OAUTH_URL = 'https://oauth2.googleapis.com'

class YouTubeService {
  /**
   * Get channel info by channel ID (public, API key only)
   */
  async getChannelById(channelId, apiKey) {
    const parts = 'snippet,statistics,brandingSettings,contentDetails'
    const url = `${BASE_URL}/channels?part=${parts}&id=${channelId}&key=${apiKey}`
    const res = await fetch(url)
    if (!res.ok) {
      const err = await res.json()
      throw new Error(`YouTube channel fetch failed: ${err.error?.message || res.statusText}`)
    }
    const data = await res.json()
    const ch = data.items?.[0]
    if (!ch) throw new Error(`YouTube channel not found: ${channelId}`)
    return this._normalizeChannel(ch)
  }

  /**
   * Search for channel by handle/username (public, API key only)
   */
  async searchChannel(query, apiKey) {
    const url = `${BASE_URL}/search?part=snippet&type=channel&q=${encodeURIComponent(query)}&maxResults=5&key=${apiKey}`
    const res = await fetch(url)
    if (!res.ok) {
      const err = await res.json()
      throw new Error(`YouTube search failed: ${err.error?.message || res.statusText}`)
    }
    const data = await res.json()
    return (data.items || []).map(item => ({
      channelId: item.snippet.channelId || item.id?.channelId,
      name: item.snippet.channelTitle || item.snippet.title,
      description: item.snippet.description,
      thumbnailUrl: item.snippet.thumbnails?.default?.url,
    }))
  }

  /**
   * Get channel by handle (@username) — resolves to channel ID
   */
  async getChannelByHandle(handle, apiKey) {
    const cleanHandle = handle.startsWith('@') ? handle : `@${handle}`
    const url = `${BASE_URL}/channels?part=snippet,statistics,brandingSettings,contentDetails&forHandle=${encodeURIComponent(cleanHandle)}&key=${apiKey}`
    const res = await fetch(url)
    if (!res.ok) {
      const err = await res.json()
      throw new Error(`YouTube handle lookup failed: ${err.error?.message || res.statusText}`)
    }
    const data = await res.json()
    const ch = data.items?.[0]
    if (!ch) throw new Error(`YouTube channel not found for handle: ${handle}`)
    return this._normalizeChannel(ch)
  }

  /**
   * Get recent videos from a channel (public, API key only)
   */
  async getChannelVideos(channelId, apiKey, maxResults = 20) {
    // Step 1: Get uploads playlist ID
    const chUrl = `${BASE_URL}/channels?part=contentDetails&id=${channelId}&key=${apiKey}`
    const chRes = await fetch(chUrl)
    if (!chRes.ok) throw new Error('Failed to get channel details')
    const chData = await chRes.json()
    const uploadsPlaylistId = chData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads
    if (!uploadsPlaylistId) throw new Error('No uploads playlist found')

    // Step 2: Get playlist items
    const plUrl = `${BASE_URL}/playlistItems?part=snippet,contentDetails&playlistId=${uploadsPlaylistId}&maxResults=${maxResults}&key=${apiKey}`
    const plRes = await fetch(plUrl)
    if (!plRes.ok) throw new Error('Failed to get playlist items')
    const plData = await plRes.json()

    const videoIds = (plData.items || []).map(i => i.contentDetails.videoId).join(',')
    if (!videoIds) return []

    // Step 3: Get video statistics
    const vUrl = `${BASE_URL}/videos?part=snippet,statistics,contentDetails&id=${videoIds}&key=${apiKey}`
    const vRes = await fetch(vUrl)
    if (!vRes.ok) throw new Error('Failed to get video details')
    const vData = await vRes.json()

    return (vData.items || []).map(v => ({
      platformPostId: v.id,
      type: this._getVideoType(v.contentDetails?.duration),
      title: v.snippet.title,
      caption: v.snippet.description,
      url: `https://www.youtube.com/watch?v=${v.id}`,
      thumbnailUrl: v.snippet.thumbnails?.high?.url || v.snippet.thumbnails?.default?.url,
      views: parseInt(v.statistics.viewCount || '0'),
      likes: parseInt(v.statistics.likeCount || '0'),
      comments: parseInt(v.statistics.commentCount || '0'),
      publishedAt: v.snippet.publishedAt,
      duration: v.contentDetails.duration,
      raw: v,
    }))
  }

  /**
   * Get channel analytics (requires OAuth token from channel owner)
   */
  async getChannelAnalytics(accessToken, startDate, endDate) {
    const metrics = 'views,estimatedMinutesWatched,averageViewDuration,likes,subscribersGained,subscribersLost'
    const dimensions = 'day'
    const url = `${ANALYTICS_URL}/reports?ids=channel==MINE&startDate=${startDate}&endDate=${endDate}&metrics=${metrics}&dimensions=${dimensions}&sort=day&access_token=${accessToken}`
    const res = await fetch(url)
    if (!res.ok) {
      const err = await res.json()
      throw new Error(`YouTube analytics failed: ${err.error?.message || res.statusText}`)
    }
    const data = await res.json()
    return {
      columnHeaders: data.columnHeaders?.map(h => h.name) || [],
      rows: data.rows || [],
    }
  }

  /**
   * Get audience demographics (requires OAuth)
   */
  async getAudienceDemographics(accessToken, startDate, endDate) {
    const results = {}

    // Age group + gender
    const ageUrl = `${ANALYTICS_URL}/reports?ids=channel==MINE&startDate=${startDate}&endDate=${endDate}&metrics=viewerPercentage&dimensions=ageGroup,gender&sort=gender,ageGroup&access_token=${accessToken}`
    const ageRes = await fetch(ageUrl)
    if (ageRes.ok) {
      const ageData = await ageRes.json()
      results.ageGender = (ageData.rows || []).map(r => ({
        ageGroup: r[0],
        gender: r[1],
        percentage: r[2],
      }))
    }

    // Country
    const countryUrl = `${ANALYTICS_URL}/reports?ids=channel==MINE&startDate=${startDate}&endDate=${endDate}&metrics=views&dimensions=country&sort=-views&maxResults=20&access_token=${accessToken}`
    const countryRes = await fetch(countryUrl)
    if (countryRes.ok) {
      const countryData = await countryRes.json()
      results.topCountries = (countryData.rows || []).map(r => ({
        country: r[0],
        views: r[1],
      }))
    }

    return results
  }

  /**
   * Build OAuth authorization URL
   */
  getAuthUrl(clientId, redirectUri, state = '') {
    const scopes = [
      'https://www.googleapis.com/auth/youtube.readonly',
      'https://www.googleapis.com/auth/yt-analytics.readonly',
    ].join(' ')
    return `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scopes)}&access_type=offline&prompt=consent&state=${state}`
  }

  /**
   * Exchange OAuth code for tokens
   */
  async exchangeCode(code, clientId, clientSecret, redirectUri) {
    const res = await fetch(`${OAUTH_URL}/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(`YouTube OAuth failed: ${err.error_description || res.statusText}`)
    }
    return await res.json()
  }

  /**
   * Refresh OAuth token
   */
  async refreshToken(refreshToken, clientId, clientSecret) {
    const res = await fetch(`${OAUTH_URL}/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'refresh_token',
      }),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(`YouTube token refresh failed: ${err.error_description || res.statusText}`)
    }
    return await res.json()
  }

  /**
   * Get authenticated user's own channel
   */
  async getMyChannel(accessToken) {
    const parts = 'snippet,statistics,brandingSettings,contentDetails'
    const url = `${BASE_URL}/channels?part=${parts}&mine=true`
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!res.ok) throw new Error('Failed to get authenticated channel')
    const data = await res.json()
    const ch = data.items?.[0]
    if (!ch) throw new Error('No channel found for authenticated user')
    return this._normalizeChannel(ch)
  }

  // --- Helpers ---

  _normalizeChannel(ch) {
    return {
      platformUserId: ch.id,
      handle: ch.snippet.customUrl || `@${ch.snippet.title}`,
      name: ch.snippet.title,
      bio: ch.snippet.description,
      followers: parseInt(ch.statistics.subscriberCount || '0'),
      profilePicUrl: ch.snippet.thumbnails?.high?.url || ch.snippet.thumbnails?.default?.url,
      totalViews: parseInt(ch.statistics.viewCount || '0'),
      videoCount: parseInt(ch.statistics.videoCount || '0'),
      isVerified: false, // YouTube API doesn't expose verification directly
      country: ch.snippet.country,
      keywords: ch.brandingSettings?.channel?.keywords,
      uploadsPlaylistId: ch.contentDetails?.relatedPlaylists?.uploads,
      platformData: {
        subscriberCount: parseInt(ch.statistics.subscriberCount || '0'),
        viewCount: parseInt(ch.statistics.viewCount || '0'),
        videoCount: parseInt(ch.statistics.videoCount || '0'),
        hiddenSubscriberCount: ch.statistics.hiddenSubscriberCount,
      },
      raw: ch,
    }
  }

  _getVideoType(duration) {
    if (!duration) return 'video'
    // ISO 8601 duration: PT#M#S
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
    if (!match) return 'video'
    const hours = parseInt(match[1] || '0')
    const minutes = parseInt(match[2] || '0')
    const seconds = parseInt(match[3] || '0')
    const totalSeconds = hours * 3600 + minutes * 60 + seconds
    if (totalSeconds <= 60) return 'short'
    return 'video'
  }
}

module.exports = new YouTubeService()
