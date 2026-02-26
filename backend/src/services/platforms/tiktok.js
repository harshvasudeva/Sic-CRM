/**
 * TikTok API Service
 * Uses TikTok's Content Posting API / Research API / Login Kit
 *
 * Required: TikTok Developer App (https://developers.tiktok.com)
 * Auth: OAuth 2.0 via Login Kit for user data, API Key for public data
 *
 * Endpoints used:
 *   - User Info: /v2/user/info/
 *   - Video List: /v2/video/list/
 *   - Video Query: /v2/video/query/ (Research API)
 */

const BASE_URL = 'https://open.tiktokapis.com/v2'
const AUTH_URL = 'https://www.tiktok.com/v2/auth/authorize'
const TOKEN_URL = 'https://open.tiktokapis.com/v2/oauth/token/'

class TikTokService {
  /**
   * Get user profile info
   * Fields: display_name, bio_description, avatar_url, follower_count, following_count,
   *         likes_count, video_count, is_verified
   */
  async getProfile(accessToken) {
    const fields = 'open_id,union_id,display_name,bio_description,avatar_url,avatar_large_url,profile_deep_link,follower_count,following_count,likes_count,video_count,is_verified'
    const url = `${BASE_URL}/user/info/?fields=${fields}`
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(`TikTok profile fetch failed: ${err.error?.message || res.statusText}`)
    }
    const data = await res.json()
    const user = data.data?.user || {}
    return {
      platformUserId: user.open_id || user.union_id,
      handle: user.display_name, // TikTok doesn't return @handle via API, use display_name
      name: user.display_name,
      bio: user.bio_description,
      followers: user.follower_count || 0,
      following: user.following_count || 0,
      totalLikes: user.likes_count || 0,
      videoCount: user.video_count || 0,
      profilePicUrl: user.avatar_large_url || user.avatar_url,
      isVerified: user.is_verified || false,
      profileUrl: user.profile_deep_link,
      platformData: {
        followerCount: user.follower_count,
        followingCount: user.following_count,
        likesCount: user.likes_count,
        videoCount: user.video_count,
      },
      raw: user,
    }
  }

  /**
   * Get user's videos (requires user.info.basic scope + video.list)
   */
  async getVideos(accessToken, cursor = 0, maxCount = 20) {
    const fields = 'id,title,video_description,create_time,cover_image_url,share_url,duration,like_count,comment_count,share_count,view_count'
    const url = `${BASE_URL}/video/list/?fields=${fields}`
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ cursor, max_count: maxCount }),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(`TikTok videos fetch failed: ${err.error?.message || res.statusText}`)
    }
    const data = await res.json()
    const videos = data.data?.videos || []
    return {
      videos: videos.map(v => ({
        platformPostId: v.id,
        type: 'video',
        title: v.title || v.video_description,
        caption: v.video_description,
        url: v.share_url,
        thumbnailUrl: v.cover_image_url,
        views: v.view_count || 0,
        likes: v.like_count || 0,
        comments: v.comment_count || 0,
        shares: v.share_count || 0,
        duration: v.duration,
        publishedAt: v.create_time ? new Date(v.create_time * 1000).toISOString() : null,
        raw: v,
      })),
      cursor: data.data?.cursor,
      hasMore: data.data?.has_more,
    }
  }

  /**
   * Build OAuth authorization URL
   * Scopes: user.info.basic, user.info.profile, user.info.stats, video.list
   */
  getAuthUrl(clientKey, redirectUri, state = '') {
    const scopes = 'user.info.basic,user.info.profile,user.info.stats,video.list'
    return `${AUTH_URL}?client_key=${clientKey}&response_type=code&scope=${scopes}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`
  }

  /**
   * Exchange OAuth code for access token
   */
  async exchangeCode(code, clientKey, clientSecret, redirectUri) {
    const res = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_key: clientKey,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(`TikTok OAuth failed: ${err.error || res.statusText}`)
    }
    const data = await res.json()
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
      openId: data.open_id,
      scope: data.scope,
      tokenType: data.token_type,
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken, clientKey, clientSecret) {
    const res = await fetch(TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_key: clientKey,
        client_secret: clientSecret,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(`TikTok refresh failed: ${err.error || res.statusText}`)
    }
    return await res.json()
  }
}

module.exports = new TikTokService()
