import api from '../utils/api.js'

const KEYS = {
  demographics: 'sic-analytics-demographics',
  botDetection: 'sic-analytics-bot-detection',
  audienceQuality: 'sic-analytics-audience-quality',
  nicheOverlap: 'sic-analytics-niche-overlap',
  competitorBrands: 'sic-analytics-competitor-brands',
  contentSentiment: 'sic-analytics-content-sentiment',
  viralityPrediction: 'sic-analytics-virality-prediction',
  seasonalTrends: 'sic-analytics-seasonal-trends',
  contentFormatSplit: 'sic-analytics-content-format-split',
  consistencyStreak: 'sic-analytics-consistency-streak',
}

function getStore(key, initial) {
  const stored = localStorage.getItem(key)
  if (stored) return JSON.parse(stored)
  localStorage.setItem(key, JSON.stringify(initial))
  return initial
}
function setStore(key, data) { localStorage.setItem(key, JSON.stringify(data)) }
function genId(prefix) { return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` }
const today = () => new Date().toISOString().split('T')[0]

function emptyTimeSeries(days) {
  const data = []
  const now = Date.now()
  for (let i = days; i >= 0; i--) {
    const d = new Date(now - i * 86400000)
    data.push({ date: d.toISOString().split('T')[0], value: 0 })
  }
  return data
}

export async function getGrowthMetrics(creatorId, days = 90) {
  const data = await api.get(`/influencer/creators/${creatorId}/growth?days=${days}`)
  return data
}

export async function getEngagementQuality(creatorId) {
  const data = await api.get(`/influencer/creators/${creatorId}/engagement-quality`)
  return data
}

export async function getRateCard(creatorId) {
  const data = await api.get(`/influencer/creators/${creatorId}/rate-card`)
  return data
}

export async function getAnomalyReport(creatorId) {
  const data = await api.get(`/influencer/creators/${creatorId}/anomalies`)
  return data
}

export async function getPerformanceSummary(creatorId) {
  const data = await api.get(`/influencer/creators/${creatorId}/performance-summary`)
  return data
}

export async function compareCreators(creatorIds) {
  const ids = creatorIds.join(',')
  const data = await api.get(`/influencer/creators/compare?ids=${ids}`)
  return data
}

export async function toggleTracking(creatorId, tracked) {
  if (tracked) {
    return api.post(`/influencer/creators/${creatorId}/track`, {})
  } else {
    return api.delete(`/influencer/creators/${creatorId}/track`)
  }
}

export async function getCreatorAnalytics(creatorId) {
  const data = await api.get(`/influencer/creators/${creatorId}/analytics`)
  if (data.snapshots && data.snapshots.length > 0) {
    const byPlatform = {}
    for (const s of data.snapshots) {
      if (!byPlatform[s.platform]) byPlatform[s.platform] = []
      byPlatform[s.platform].push(s)
    }
    const followerGrowth = data.snapshots.map(s => ({
      date: s.date?.split('T')[0],
      value: s.followers || 0,
      platform: s.platform,
    }))
    const engagementRate = data.snapshots
      .filter(s => s.engagementRate != null)
      .map(s => ({ date: s.date?.split('T')[0], value: s.engagementRate, platform: s.platform }))
    const avgViews = data.snapshots
      .filter(s => s.avgViews != null && s.avgViews > 0)
      .map(s => ({ date: s.date?.split('T')[0], value: s.avgViews, platform: s.platform }))
    return {
      followerGrowth,
      engagementRate,
      avgViews,
      summary: data.summary,
      byPlatform,
    }
  }
  return {
    followerGrowth: [],
    engagementRate: [],
    avgViews: [],
    summary: data.summary || { dataPoints: 0, latestFollowers: 0, growth: 0 },
    byPlatform: {},
  }
}

export async function getPostPerformance(creatorId) {
  const posts = await api.get(`/influencer/creators/${creatorId}/posts?limit=30`)
  if (Array.isArray(posts) && posts.length > 0) {
    return posts.map(p => ({
      id: p.id,
      date: (p.publishedAt || p.createdAt)?.split('T')[0],
      views: p.views || 0,
      likes: p.likes || 0,
      comments: p.comments || 0,
      shares: p.shares || 0,
      saves: p.saves || 0,
      title: p.title || p.caption?.substring(0, 60) || '',
      type: p.type || 'Post',
      platform: p.socialAccount?.platform,
      engagementRate: p.engagementRate,
      url: p.url,
      thumbnailUrl: p.thumbnailUrl,
    }))
  }
  return []
}

export async function getAudienceDemographics(creatorId) {
  try {
    const creator = await api.get(`/influencer/creators/${creatorId}`)
    if (creator.socialAccounts && creator.socialAccounts.length > 0) {
      for (const sa of creator.socialAccounts) {
        if (sa.platformData?.demographics) {
          const d = sa.platformData.demographics
          return {
            age: d.ageBrackets || d.age || {},
            gender: d.genderSplit || d.gender || {},
            location: d.topLocations
              ? Object.fromEntries(d.topLocations.map(l => [l.city || l.name, l.pct || l.value]))
              : d.location || {},
            source: `${sa.platform} (OAuth)`,
          }
        }
      }
    }
  } catch {}
  const demo = getStore(KEYS.demographics, {})[creatorId]
  if (demo) {
    const age = demo.ageBrackets || {}
    const gender = {}
    if (demo.genderSplit) Object.entries(demo.genderSplit).forEach(([k, v]) => { gender[k.charAt(0).toUpperCase() + k.slice(1)] = v })
    const location = {}
    if (demo.topLocations) demo.topLocations.forEach(l => { location[l.city] = l.pct })
    return { age, gender, location, source: 'manual' }
  }
  return null
}

export async function getSentimentAnalysis(creatorId) {
  try {
    const posts = await api.get(`/influencer/creators/${creatorId}/posts?limit=20`)
    if (Array.isArray(posts) && posts.length > 0) {
      const total = posts.length
      const positive = Math.round(posts.filter(p => (p.likes || 0) > (p.views || 1) * 0.05).length / total * 100)
      const negative = Math.round(posts.filter(p => (p.likes || 0) < (p.views || 1) * 0.01).length / total * 100)
      const neutral = Math.max(0, 100 - positive - negative)
      const topPosts = [...posts].sort((a, b) => (b.likes || 0) - (a.likes || 0)).slice(0, 5)
      const keywords = topPosts.flatMap(p => {
        const caption = p.caption || ''
        return caption.split(/\s+/).filter(w => w.length > 4).slice(0, 3)
      }).slice(0, 8)
      return { positive, neutral, negative, keywords: keywords.length > 0 ? keywords : ['engaging', 'quality', 'authentic'], postCount: total }
    }
  } catch {}
  const sent = getStore(KEYS.contentSentiment, {})[creatorId]
  if (sent) {
    const posts = sent.posts || []
    const total = posts.length || 1
    const positive = Math.round(posts.filter(p => (p.sentimentScore || 0) > 0.3).length / total * 100)
    const negative = Math.round(posts.filter(p => (p.sentimentScore || 0) < -0.3).length / total * 100)
    return { positive, neutral: Math.max(0, 100 - positive - negative), negative, keywords: sent.topKeywords || [] }
  }
  return null
}

export function getDemographics(creatorId) {
  const all = getStore(KEYS.demographics, {})
  return creatorId ? (all[creatorId] || null) : all
}
export function updateDemographics(creatorId, data) {
  const all = getStore(KEYS.demographics, {})
  all[creatorId] = { ...all[creatorId], creatorId, ...data, updatedAt: today() }
  setStore(KEYS.demographics, all)
  return all[creatorId]
}

export function getBotDetection(creatorId) {
  const all = getStore(KEYS.botDetection, {})
  return creatorId ? (all[creatorId] || null) : all
}
export function runBotCheck(creatorId, followerCount, engagementRate) {
  const ratio = engagementRate / 100
  const suspicious = []
  if (ratio > 0.25) suspicious.push('engagement spike anomaly')
  if (ratio < 0.02) suspicious.push('abnormally low engagement')
  const botScore = Math.max(0, Math.min(100, Math.round(100 - (ratio * 500) + (suspicious.length * 15))))
  const estimatedReal = Math.round(followerCount * (1 - botScore / 100))
  const result = { creatorId, botScore, suspiciousSignals: suspicious, followerToEngagementRatio: parseFloat(ratio.toFixed(4)), estimatedRealFollowers: estimatedReal, lastChecked: today() }
  const all = getStore(KEYS.botDetection, {})
  all[creatorId] = result
  setStore(KEYS.botDetection, all)
  return result
}
export function getBotScores() { return getStore(KEYS.botDetection, {}) }

export function getAudienceQuality(creatorId) {
  const all = getStore(KEYS.audienceQuality, {})
  return creatorId ? (all[creatorId] || null) : all
}
export function updateAudienceQuality(creatorId, data) {
  const all = getStore(KEYS.audienceQuality, {})
  all[creatorId] = { ...all[creatorId], creatorId, ...data, updatedAt: today() }
  setStore(KEYS.audienceQuality, all)
  return all[creatorId]
}
export function getAudienceQualityScores() {
  const all = getStore(KEYS.audienceQuality, {})
  const result = {}
  Object.entries(all).forEach(([id, data]) => {
    const qScore = Math.max(0, Math.min(100, Math.round((data.realFollowerPct * 0.4) + (data.activeCommenterPct * 0.3) + (data.engagementAuthenticity * 0.3))))
    result[id] = {
      qualityScore: qScore,
      realFollowers: data.realFollowerPct || 78,
      activeCommenters: data.activeCommenters || 62,
      engagementAuthenticity: data.engagementAuthenticity || 71,
      tier: qScore >= 80 ? 'Premium' : qScore >= 60 ? 'Good' : qScore >= 40 ? 'Average' : 'Low',
    }
  })
  return result
}

export function getNicheOverlap(creatorIds) { return calculateNicheOverlap(creatorIds) }
export function calculateNicheOverlap(creatorIds) {
  if (!creatorIds || creatorIds.length < 2) return { error: 'Need at least 2 creator IDs' }
  const data = getStore(KEYS.nicheOverlap, { creatorNiches: {}, pairwiseOverlap: {} })
  const overlapMatrix = {}
  const pairs = []
  for (let i = 0; i < creatorIds.length; i++) {
    for (let j = i + 1; j < creatorIds.length; j++) {
      const a = creatorIds[i], b = creatorIds[j]
      const pairKey = `${a}|${b}`, reversePairKey = `${b}|${a}`
      const pairData = data.pairwiseOverlap[pairKey] || data.pairwiseOverlap[reversePairKey] || { sharedAudiencePct: 0, commonInterests: [] }
      let recommendation = 'distinct'
      if (pairData.sharedAudiencePct >= 30) recommendation = 'avoid'
      else if (pairData.sharedAudiencePct >= 15) recommendation = 'ok'
      pairs.push({ creators: [a, b], sharedAudiencePct: pairData.sharedAudiencePct, commonInterests: pairData.commonInterests, recommendation })
      if (!overlapMatrix[a]) overlapMatrix[a] = {}
      if (!overlapMatrix[b]) overlapMatrix[b] = {}
      overlapMatrix[a][b] = pairData.sharedAudiencePct
      overlapMatrix[b][a] = pairData.sharedAudiencePct
    }
  }
  for (const id of creatorIds) { if (!overlapMatrix[id]) overlapMatrix[id] = {}; overlapMatrix[id][id] = 100 }
  return {
    creatorIds, pairs, overlapMatrix,
    summary: {
      avgOverlap: pairs.length > 0 ? Math.round(pairs.reduce((s, p) => s + p.sharedAudiencePct, 0) / pairs.length) : 0,
      highOverlapPairs: pairs.filter(p => p.recommendation === 'avoid'),
      distinctPairs: pairs.filter(p => p.recommendation === 'distinct'),
    },
  }
}

export function getCompetitorBrands(creatorId) {
  const all = getStore(KEYS.competitorBrands, {})
  if (creatorId) { const entry = all[creatorId]; return entry ? entry.brands : [] }
  return all
}
export function addCompetitorBrand(creatorId, brandData) {
  const all = getStore(KEYS.competitorBrands, {})
  if (!all[creatorId]) all[creatorId] = { creatorId, brands: [] }
  const newBrand = { ...brandData, id: genId('cb') }
  all[creatorId].brands.push(newBrand)
  setStore(KEYS.competitorBrands, all)
  return newBrand
}
export function getCompetitorAnalysis() {
  const all = getStore(KEYS.competitorBrands, {})
  const result = {}
  Object.entries(all).forEach(([id, brands]) => {
    result[id] = { competitorBrands: Array.isArray(brands) ? brands : brands.brands || [] }
  })
  return result
}

export function getViralityPrediction(creatorId) {
  const all = getStore(KEYS.viralityPrediction, {})
  return creatorId ? (all[creatorId] || null) : all
}
export function updateViralityPrediction(creatorId, data) {
  const all = getStore(KEYS.viralityPrediction, {})
  all[creatorId] = { ...all[creatorId], creatorId, ...data, updatedAt: today() }
  if (data.factors) {
    const f = all[creatorId].factors
    all[creatorId].viralityScore = Math.round((f.contentConsistency * 0.25) + (f.trendAlignment * 0.30) + (f.engagementVelocity * 0.25) + (f.audienceGrowthRate * 0.20))
  }
  setStore(KEYS.viralityPrediction, all)
  return all[creatorId]
}

export function getSeasonalTrends(creatorId) {
  const all = getStore(KEYS.seasonalTrends, {})
  return creatorId ? (all[creatorId] || null) : all
}
export function updateMonthlyPerformance(creatorId, month, monthData) {
  const all = getStore(KEYS.seasonalTrends, {})
  if (!all[creatorId]) all[creatorId] = { creatorId, monthly: {}, bestMonths: [], worstMonths: [] }
  all[creatorId].monthly[month] = { ...all[creatorId].monthly[month], ...monthData }
  const months = Object.entries(all[creatorId].monthly).map(([m, d]) => ({ month: m, avgViews: d.avgViews })).sort((a, b) => b.avgViews - a.avgViews)
  all[creatorId].bestMonths = months.slice(0, 3).map(m => m.month)
  all[creatorId].worstMonths = months.slice(-3).reverse().map(m => m.month)
  setStore(KEYS.seasonalTrends, all)
  return all[creatorId]
}

export function getContentFormatSplit(creatorId) {
  const all = getStore(KEYS.contentFormatSplit, {})
  return creatorId ? (all[creatorId] || null) : all
}
export function getBestContentFormat(creatorId) {
  const data = getContentFormatSplit(creatorId)
  if (!data || !data.formats || data.formats.length === 0) return null
  return [...data.formats].sort((a, b) => b.avgEngagement - a.avgEngagement)[0]
}

export function getConsistencyStreak(creatorId) {
  const all = getStore(KEYS.consistencyStreak, {})
  return creatorId ? (all[creatorId] || null) : all
}
export function recordPost(creatorId) {
  const all = getStore(KEYS.consistencyStreak, {})
  if (!all[creatorId]) {
    all[creatorId] = { creatorId, currentStreak: 1, longestStreak: 1, lastPostDate: today(), averagePostsPerWeek: 1, consistencyScore: 10 }
  } else {
    const last = all[creatorId].lastPostDate ? new Date(all[creatorId].lastPostDate) : null
    const now = new Date()
    const daysSince = last ? Math.floor((now - last) / (1000 * 60 * 60 * 24)) : 999
    if (daysSince <= 7) { all[creatorId].currentStreak = (all[creatorId].currentStreak || 0) + 1 } else { all[creatorId].currentStreak = 1 }
    if (all[creatorId].currentStreak > (all[creatorId].longestStreak || 0)) all[creatorId].longestStreak = all[creatorId].currentStreak
    all[creatorId].lastPostDate = today()
    const streakFactor = Math.min(all[creatorId].currentStreak / 30, 1) * 60
    const frequencyFactor = Math.min(all[creatorId].averagePostsPerWeek / 5, 1) * 40
    all[creatorId].consistencyScore = Math.round(streakFactor + frequencyFactor)
  }
  setStore(KEYS.consistencyStreak, all)
  return all[creatorId]
}

export function getCreatorIntelligenceSummary(creatorId) {
  return {
    demographics: getDemographics(creatorId),
    botDetection: getBotDetection(creatorId),
    audienceQualityScore: getAudienceQuality(creatorId),
    audienceQualityData: getAudienceQuality(creatorId),
    viralityPrediction: getViralityPrediction(creatorId),
    seasonalTrends: getSeasonalTrends(creatorId),
    contentFormatSplit: getContentFormatSplit(creatorId),
    consistencyStreak: getConsistencyStreak(creatorId),
    bestContentFormat: getBestContentFormat(creatorId),
  }
}

export function getAnalyticsDashboardStats() {
  const allBot = getStore(KEYS.botDetection, {})
  const allQuality = getStore(KEYS.audienceQuality, {})
  const allVirality = getStore(KEYS.viralityPrediction, {})
  const allStreak = getStore(KEYS.consistencyStreak, {})
  const allSentiment = getStore(KEYS.contentSentiment, {})
  const creatorIds = [...new Set([...Object.keys(allBot), ...Object.keys(allQuality), ...Object.keys(allVirality), ...Object.keys(allStreak), ...Object.keys(allSentiment)])]
  const avgBotScore = creatorIds.length > 0 ? Math.round(creatorIds.reduce((s, id) => s + (allBot[id]?.botScore || 0), 0) / creatorIds.length) : 0
  const avgSentiment = creatorIds.length > 0 ? Math.round(creatorIds.reduce((s, id) => s + (allSentiment[id]?.overallSentiment || 0), 0) / creatorIds.length) : 0
  const avgVirality = creatorIds.length > 0 ? Math.round(creatorIds.reduce((s, id) => s + (allVirality[id]?.viralityScore || 0), 0) / creatorIds.length) : 0
  const avgConsistency = creatorIds.length > 0 ? Math.round(creatorIds.reduce((s, id) => s + (allStreak[id]?.consistencyScore || 0), 0) / creatorIds.length) : 0
  const qualityScores = getAudienceQualityScores()
  const avgQuality = Object.keys(qualityScores).length > 0 ? Math.round(Object.values(qualityScores).reduce((s, q) => s + q.qualityScore, 0) / Object.keys(qualityScores).length) : 0
  const highRiskCreators = creatorIds.filter(id => (allBot[id]?.botScore || 0) >= 30)
  const topPerformers = creatorIds.map(id => ({ id, viralityScore: allVirality[id]?.viralityScore || 0 })).sort((a, b) => b.viralityScore - a.viralityScore).slice(0, 3)
  return { totalCreatorsTracked: creatorIds.length, avgBotScore, avgSentiment, avgVirality, avgConsistency, avgQuality, highRiskCreators, topPerformers }
}

export function resetAnalyticsStore(section) {
  const resetMap = {
    demographics: () => setStore(KEYS.demographics, {}),
    botDetection: () => setStore(KEYS.botDetection, {}),
    audienceQuality: () => setStore(KEYS.audienceQuality, {}),
    nicheOverlap: () => setStore(KEYS.nicheOverlap, { creatorNiches: {}, pairwiseOverlap: {} }),
    competitorBrands: () => setStore(KEYS.competitorBrands, {}),
    contentSentiment: () => setStore(KEYS.contentSentiment, {}),
    viralityPrediction: () => setStore(KEYS.viralityPrediction, {}),
    seasonalTrends: () => setStore(KEYS.seasonalTrends, {}),
    contentFormatSplit: () => setStore(KEYS.contentFormatSplit, {}),
    consistencyStreak: () => setStore(KEYS.consistencyStreak, {}),
  }
  if (section && resetMap[section]) { resetMap[section](); return true }
  Object.values(resetMap).forEach(fn => fn())
  return true
}
