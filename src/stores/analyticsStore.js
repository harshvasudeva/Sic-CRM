// Analytics & Creator Intelligence Store - API-backed with localStorage cache
// Covers: Demographics, Bot Detection, Audience Quality, Niche Overlap, Competitor Brands,
// Sentiment Analysis, Virality Prediction, Seasonal Trends, Content Format Split, Consistency Streaks

import api from '../utils/api.js'

// ==================== HELPERS ====================
function getStore(key, initial) {
    const stored = localStorage.getItem(key)
    if (stored) return JSON.parse(stored)
    localStorage.setItem(key, JSON.stringify(initial))
    return initial
}
function setStore(key, data) { localStorage.setItem(key, JSON.stringify(data)) }
function genId(prefix) { return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` }

const today = () => new Date().toISOString().split('T')[0]

// Try API first, fall back to localStorage on network error
async function apiWithFallback(apiCall, fallbackFn) {
    try {
        return await apiCall()
    } catch {
        return typeof fallbackFn === 'function' ? fallbackFn() : fallbackFn
    }
}

// ==================== STORAGE KEYS ====================
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

// ==================================================================================
// INITIAL DATA (empty — populated dynamically from API or user actions)
// ==================================================================================
const initialDemographics = {}
const initialBotDetection = {}
const initialAudienceQuality = {}
const initialNicheOverlap = { creatorNiches: {}, pairwiseOverlap: {} }
const initialCompetitorBrands = {}
const initialContentSentiment = {}
const initialViralityPrediction = {}
const initialSeasonalTrends = {}
const initialContentFormatSplit = {}
const initialConsistencyStreak = {}



// ==================================================================================
// EXPORTED FUNCTIONS
// ==================================================================================

// ---------- 1. Audience Demographics ----------
export function getDemographics(creatorId) {
    const all = getStore(KEYS.demographics, initialDemographics)
    return creatorId ? (all[creatorId] || null) : all
}

export function getAllDemographics() {
    return getStore(KEYS.demographics, initialDemographics)
}

export function updateDemographics(creatorId, data) {
    const all = getStore(KEYS.demographics, initialDemographics)
    all[creatorId] = { ...all[creatorId], creatorId, ...data, updatedAt: today() }
    setStore(KEYS.demographics, all)
    return all[creatorId]
}

export function deleteDemographics(creatorId) {
    const all = getStore(KEYS.demographics, initialDemographics)
    delete all[creatorId]
    setStore(KEYS.demographics, all)
    return true
}

// ---------- 2. Bot Detection ----------
export function getBotDetection(creatorId) {
    const all = getStore(KEYS.botDetection, initialBotDetection)
    return creatorId ? (all[creatorId] || null) : all
}

export function getAllBotDetection() {
    return getStore(KEYS.botDetection, initialBotDetection)
}

export function updateBotDetection(creatorId, data) {
    const all = getStore(KEYS.botDetection, initialBotDetection)
    all[creatorId] = { ...all[creatorId], creatorId, ...data, lastChecked: today() }
    setStore(KEYS.botDetection, all)
    return all[creatorId]
}

export function deleteBotDetection(creatorId) {
    const all = getStore(KEYS.botDetection, initialBotDetection)
    delete all[creatorId]
    setStore(KEYS.botDetection, all)
    return true
}

export function runBotCheck(creatorId, followerCount, engagementRate) {
    const ratio = engagementRate / 100
    const suspicious = []
    if (ratio > 0.25) suspicious.push('engagement spike anomaly')
    if (ratio < 0.02) suspicious.push('abnormally low engagement')
    const botScore = Math.max(0, Math.min(100, Math.round(100 - (ratio * 500) + (suspicious.length * 15))))
    const estimatedReal = Math.round(followerCount * (1 - botScore / 100))
    const result = { creatorId, botScore, suspiciousSignals: suspicious, followerToEngagementRatio: parseFloat(ratio.toFixed(4)), estimatedRealFollowers: estimatedReal, lastChecked: today() }
    const all = getStore(KEYS.botDetection, initialBotDetection)
    all[creatorId] = result
    setStore(KEYS.botDetection, all)
    return result
}

// ---------- 3. Audience Quality Score ----------
export function getAudienceQuality(creatorId) {
    const all = getStore(KEYS.audienceQuality, initialAudienceQuality)
    return creatorId ? (all[creatorId] || null) : all
}

export function getAllAudienceQuality() {
    return getStore(KEYS.audienceQuality, initialAudienceQuality)
}

export function updateAudienceQuality(creatorId, data) {
    const all = getStore(KEYS.audienceQuality, initialAudienceQuality)
    all[creatorId] = { ...all[creatorId], creatorId, ...data, updatedAt: today() }
    setStore(KEYS.audienceQuality, all)
    return all[creatorId]
}

export function deleteAudienceQuality(creatorId) {
    const all = getStore(KEYS.audienceQuality, initialAudienceQuality)
    delete all[creatorId]
    setStore(KEYS.audienceQuality, all)
    return true
}

export function calculateAudienceQualityScore(creatorId) {
    const data = getAudienceQuality(creatorId)
    if (!data) return null
    const score = Math.round((data.realFollowerPct * 0.4) + (data.activeCommenterPct * 0.3) + (data.engagementAuthenticity * 0.3))
    return Math.max(0, Math.min(100, score))
}

export function calculateAllAudienceQualityScores() {
    const all = getStore(KEYS.audienceQuality, initialAudienceQuality)
    const results = {}
    for (const creatorId of Object.keys(all)) {
        const d = all[creatorId]
        results[creatorId] = {
            creatorId,
            score: Math.max(0, Math.min(100, Math.round((d.realFollowerPct * 0.4) + (d.activeCommenterPct * 0.3) + (d.engagementAuthenticity * 0.3)))),
            breakdown: { realFollowerPct: d.realFollowerPct, activeCommenterPct: d.activeCommenterPct, engagementAuthenticity: d.engagementAuthenticity },
        }
    }
    return results
}

// ---------- 4. Niche Overlap Map ----------
export function getNicheOverlapData() {
    return getStore(KEYS.nicheOverlap, initialNicheOverlap)
}

export function getCreatorNiche(creatorId) {
    const data = getStore(KEYS.nicheOverlap, initialNicheOverlap)
    return data.creatorNiches[creatorId] || null
}

export function updateCreatorNiche(creatorId, nicheData) {
    const data = getStore(KEYS.nicheOverlap, initialNicheOverlap)
    data.creatorNiches[creatorId] = { ...data.creatorNiches[creatorId], ...nicheData }
    setStore(KEYS.nicheOverlap, data)
    return data.creatorNiches[creatorId]
}

export function calculateNicheOverlap(creatorIds) {
    if (!creatorIds || creatorIds.length < 2) return { error: 'Need at least 2 creator IDs' }
    const data = getStore(KEYS.nicheOverlap, initialNicheOverlap)
    const overlapMatrix = {}
    const pairs = []
    for (let i = 0; i < creatorIds.length; i++) {
        for (let j = i + 1; j < creatorIds.length; j++) {
            const a = creatorIds[i], b = creatorIds[j]
            const pairKey = `${a}|${b}`, reversePairKey = `${b}|${a}`
            const pairData = data.pairwiseOverlap[pairKey] || data.pairwiseOverlap[reversePairKey] || { sharedAudiencePct: 0, commonInterests: [] }
            const sharedPct = pairData.sharedAudiencePct
            let recommendation = 'distinct'
            if (sharedPct >= 30) recommendation = 'avoid'
            else if (sharedPct >= 15) recommendation = 'ok'
            pairs.push({ creators: [a, b], sharedAudiencePct: sharedPct, commonInterests: pairData.commonInterests, recommendation })
            if (!overlapMatrix[a]) overlapMatrix[a] = {}
            if (!overlapMatrix[b]) overlapMatrix[b] = {}
            overlapMatrix[a][b] = sharedPct
            overlapMatrix[b][a] = sharedPct
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

export function updatePairwiseOverlap(creatorA, creatorB, overlapData) {
    const data = getStore(KEYS.nicheOverlap, initialNicheOverlap)
    const pairKey = `${creatorA}|${creatorB}`
    data.pairwiseOverlap[pairKey] = { ...data.pairwiseOverlap[pairKey], ...overlapData }
    setStore(KEYS.nicheOverlap, data)
    return data.pairwiseOverlap[pairKey]
}

// ---------- 5. Competitor Brand Analysis ----------
export function getCompetitorBrands(creatorId) {
    const all = getStore(KEYS.competitorBrands, initialCompetitorBrands)
    if (creatorId) { const entry = all[creatorId]; return entry ? entry.brands : [] }
    return all
}

export function getAllCompetitorBrands() {
    return getStore(KEYS.competitorBrands, initialCompetitorBrands)
}

export function addCompetitorBrand(creatorId, brandData) {
    const all = getStore(KEYS.competitorBrands, initialCompetitorBrands)
    if (!all[creatorId]) all[creatorId] = { creatorId, brands: [] }
    const newBrand = { ...brandData, id: genId('cb') }
    all[creatorId].brands.push(newBrand)
    setStore(KEYS.competitorBrands, all)
    return newBrand
}

export function updateCompetitorBrand(creatorId, brandId, data) {
    const all = getStore(KEYS.competitorBrands, initialCompetitorBrands)
    if (!all[creatorId]) return null
    const idx = all[creatorId].brands.findIndex(b => b.id === brandId)
    if (idx === -1) return null
    all[creatorId].brands[idx] = { ...all[creatorId].brands[idx], ...data }
    setStore(KEYS.competitorBrands, all)
    return all[creatorId].brands[idx]
}

export function deleteCompetitorBrand(creatorId, brandId) {
    const all = getStore(KEYS.competitorBrands, initialCompetitorBrands)
    if (!all[creatorId]) return false
    all[creatorId].brands = all[creatorId].brands.filter(b => b.id !== brandId)
    setStore(KEYS.competitorBrands, all)
    return true
}

export function getCompetitorBrandsByBrandName(brandName) {
    const all = getStore(KEYS.competitorBrands, initialCompetitorBrands)
    const results = []
    for (const creatorId of Object.keys(all)) {
        const matches = all[creatorId].brands.filter(b => b.brandName.toLowerCase().includes(brandName.toLowerCase()))
        matches.forEach(m => results.push({ ...m, creatorId }))
    }
    return results
}

export function getCreatorsWhoWorkedWithCompetitors(creatorId) {
    const all = getStore(KEYS.competitorBrands, initialCompetitorBrands)
    if (!all[creatorId]) return []
    return all[creatorId].brands.filter(b => b.isCompetitor)
}

// ---------- 6. Content Sentiment Analysis ----------
export function getContentSentiment(creatorId) {
    const all = getStore(KEYS.contentSentiment, initialContentSentiment)
    return creatorId ? (all[creatorId] || null) : all
}

export function getAllContentSentiment() {
    return getStore(KEYS.contentSentiment, initialContentSentiment)
}

export function addSentimentPost(creatorId, postData) {
    const all = getStore(KEYS.contentSentiment, initialContentSentiment)
    if (!all[creatorId]) all[creatorId] = { creatorId, posts: [], overallSentiment: 0 }
    const newPost = { ...postData, postId: genId('p-s') }
    all[creatorId].posts.push(newPost)
    const posts = all[creatorId].posts
    all[creatorId].overallSentiment = Math.round(posts.reduce((s, p) => s + p.overallSentiment, 0) / posts.length)
    setStore(KEYS.contentSentiment, all)
    return newPost
}

export function updateSentimentPost(creatorId, postId, data) {
    const all = getStore(KEYS.contentSentiment, initialContentSentiment)
    if (!all[creatorId]) return null
    const idx = all[creatorId].posts.findIndex(p => p.postId === postId)
    if (idx === -1) return null
    all[creatorId].posts[idx] = { ...all[creatorId].posts[idx], ...data }
    const posts = all[creatorId].posts
    all[creatorId].overallSentiment = Math.round(posts.reduce((s, p) => s + p.overallSentiment, 0) / posts.length)
    setStore(KEYS.contentSentiment, all)
    return all[creatorId].posts[idx]
}

export function deleteSentimentPost(creatorId, postId) {
    const all = getStore(KEYS.contentSentiment, initialContentSentiment)
    if (!all[creatorId]) return false
    all[creatorId].posts = all[creatorId].posts.filter(p => p.postId !== postId)
    const posts = all[creatorId].posts
    all[creatorId].overallSentiment = posts.length > 0 ? Math.round(posts.reduce((s, p) => s + p.overallSentiment, 0) / posts.length) : 0
    setStore(KEYS.contentSentiment, all)
    return true
}

export function deleteCreatorSentiment(creatorId) {
    const all = getStore(KEYS.contentSentiment, initialContentSentiment)
    delete all[creatorId]
    setStore(KEYS.contentSentiment, all)
    return true
}

// ---------- 7. Virality Prediction Score ----------
export function getViralityPrediction(creatorId) {
    const all = getStore(KEYS.viralityPrediction, initialViralityPrediction)
    return creatorId ? (all[creatorId] || null) : all
}

export function getAllViralityPredictions() {
    return getStore(KEYS.viralityPrediction, initialViralityPrediction)
}

export function updateViralityPrediction(creatorId, data) {
    const all = getStore(KEYS.viralityPrediction, initialViralityPrediction)
    all[creatorId] = { ...all[creatorId], creatorId, ...data, updatedAt: today() }
    if (data.factors) {
        const f = all[creatorId].factors
        all[creatorId].viralityScore = Math.round((f.contentConsistency * 0.25) + (f.trendAlignment * 0.30) + (f.engagementVelocity * 0.25) + (f.audienceGrowthRate * 0.20))
    }
    setStore(KEYS.viralityPrediction, all)
    return all[creatorId]
}

export function deleteViralityPrediction(creatorId) {
    const all = getStore(KEYS.viralityPrediction, initialViralityPrediction)
    delete all[creatorId]
    setStore(KEYS.viralityPrediction, all)
    return true
}

export function recalculateViralityScore(creatorId) {
    const all = getStore(KEYS.viralityPrediction, initialViralityPrediction)
    const entry = all[creatorId]
    if (!entry || !entry.factors) return null
    const f = entry.factors
    entry.viralityScore = Math.round((f.contentConsistency * 0.25) + (f.trendAlignment * 0.30) + (f.engagementVelocity * 0.25) + (f.audienceGrowthRate * 0.20))
    entry.updatedAt = today()
    setStore(KEYS.viralityPrediction, all)
    return entry
}

// ---------- 8. Seasonal Performance Trends ----------
export function getSeasonalTrends(creatorId) {
    const all = getStore(KEYS.seasonalTrends, initialSeasonalTrends)
    return creatorId ? (all[creatorId] || null) : all
}

export function getAllSeasonalTrends() {
    return getStore(KEYS.seasonalTrends, initialSeasonalTrends)
}

export function updateSeasonalTrends(creatorId, data) {
    const all = getStore(KEYS.seasonalTrends, initialSeasonalTrends)
    all[creatorId] = { ...all[creatorId], creatorId, ...data }
    setStore(KEYS.seasonalTrends, all)
    return all[creatorId]
}

export function deleteSeasonalTrends(creatorId) {
    const all = getStore(KEYS.seasonalTrends, initialSeasonalTrends)
    delete all[creatorId]
    setStore(KEYS.seasonalTrends, all)
    return true
}

export function updateMonthlyPerformance(creatorId, month, monthData) {
    const all = getStore(KEYS.seasonalTrends, initialSeasonalTrends)
    if (!all[creatorId]) all[creatorId] = { creatorId, monthly: {}, bestMonths: [], worstMonths: [] }
    all[creatorId].monthly[month] = { ...all[creatorId].monthly[month], ...monthData }
    const months = Object.entries(all[creatorId].monthly).map(([m, d]) => ({ month: m, avgViews: d.avgViews })).sort((a, b) => b.avgViews - a.avgViews)
    all[creatorId].bestMonths = months.slice(0, 3).map(m => m.month)
    all[creatorId].worstMonths = months.slice(-3).reverse().map(m => m.month)
    setStore(KEYS.seasonalTrends, all)
    return all[creatorId]
}

// ---------- 9. Content Format Split ----------
export function getContentFormatSplit(creatorId) {
    const all = getStore(KEYS.contentFormatSplit, initialContentFormatSplit)
    return creatorId ? (all[creatorId] || null) : all
}

export function getAllContentFormatSplits() {
    return getStore(KEYS.contentFormatSplit, initialContentFormatSplit)
}

export function updateContentFormatSplit(creatorId, formatsArray) {
    const all = getStore(KEYS.contentFormatSplit, initialContentFormatSplit)
    all[creatorId] = { creatorId, formats: formatsArray }
    setStore(KEYS.contentFormatSplit, all)
    return all[creatorId]
}

export function deleteContentFormatSplit(creatorId) {
    const all = getStore(KEYS.contentFormatSplit, initialContentFormatSplit)
    delete all[creatorId]
    setStore(KEYS.contentFormatSplit, all)
    return true
}

export function addContentFormat(creatorId, formatData) {
    const all = getStore(KEYS.contentFormatSplit, initialContentFormatSplit)
    if (!all[creatorId]) all[creatorId] = { creatorId, formats: [] }
    all[creatorId].formats.push(formatData)
    setStore(KEYS.contentFormatSplit, all)
    return all[creatorId]
}

export function updateSingleContentFormat(creatorId, contentFormat, data) {
    const all = getStore(KEYS.contentFormatSplit, initialContentFormatSplit)
    if (!all[creatorId]) return null
    const idx = all[creatorId].formats.findIndex(f => f.contentFormat === contentFormat)
    if (idx === -1) return null
    all[creatorId].formats[idx] = { ...all[creatorId].formats[idx], ...data }
    setStore(KEYS.contentFormatSplit, all)
    return all[creatorId].formats[idx]
}

export function getBestContentFormat(creatorId) {
    const data = getContentFormatSplit(creatorId)
    if (!data || !data.formats || data.formats.length === 0) return null
    return [...data.formats].sort((a, b) => b.avgEngagement - a.avgEngagement)[0]
}

// ---------- 10. Consistency Streak ----------
export function getConsistencyStreak(creatorId) {
    const all = getStore(KEYS.consistencyStreak, initialConsistencyStreak)
    return creatorId ? (all[creatorId] || null) : all
}

export function getAllConsistencyStreaks() {
    return getStore(KEYS.consistencyStreak, initialConsistencyStreak)
}

export function updateConsistencyStreak(creatorId, data) {
    const all = getStore(KEYS.consistencyStreak, initialConsistencyStreak)
    all[creatorId] = { ...all[creatorId], creatorId, ...data }
    if (all[creatorId].currentStreak > (all[creatorId].longestStreak || 0)) all[creatorId].longestStreak = all[creatorId].currentStreak
    setStore(KEYS.consistencyStreak, all)
    return all[creatorId]
}

export function deleteConsistencyStreak(creatorId) {
    const all = getStore(KEYS.consistencyStreak, initialConsistencyStreak)
    delete all[creatorId]
    setStore(KEYS.consistencyStreak, all)
    return true
}

export function recordPost(creatorId) {
    const all = getStore(KEYS.consistencyStreak, initialConsistencyStreak)
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


// ==================================================================================
// COMPATIBILITY / ALIAS FUNCTIONS (used by page components)
// ==================================================================================

export function getBotScores() {
    return getAllBotDetection()
}

export function getAudienceQualityScores() {
    const all = getAllAudienceQuality()
    const scores = calculateAllAudienceQualityScores()
    const result = {}
    Object.entries(all).forEach(([id, data]) => {
        const qScore = scores[id]?.score || data.overallQualityScore || 65
        result[id] = {
            qualityScore: qScore,
            realFollowers: data.realFollowerPct || 78,
            activeCommenters: data.activeCommenters || 62,
            engagementAuthenticity: data.engagementAuthenticity || 71,
            contentRelevance: data.contentRelevance || 80,
            audienceRetention: data.audienceRetention || 68,
            tier: qScore >= 80 ? 'Premium' : qScore >= 60 ? 'Good' : qScore >= 40 ? 'Average' : 'Low',
        }
    })
    return result
}

export function getCompetitorAnalysis() {
    const all = getAllCompetitorBrands()
    const result = {}
    Object.entries(all).forEach(([id, brands]) => {
        result[id] = { competitorBrands: Array.isArray(brands) ? brands : brands.brands || [] }
    })
    return result
}

export function getNicheOverlap(creatorIds) {
    return calculateNicheOverlap(creatorIds)
}

export async function getCreatorAnalytics(creatorId) {
    // Try fetching real analytics snapshots from API
    const apiData = await apiWithFallback(
        () => api.get(`/influencer/creators/${creatorId}/analytics`),
        null
    )
    if (apiData && Array.isArray(apiData) && apiData.length > 0) {
        // Transform API snapshots into time-series format
        const sorted = [...apiData].sort((a, b) => new Date(a.snapshotDate) - new Date(b.snapshotDate))
        return {
            followerGrowth: sorted.map(s => ({ date: s.snapshotDate?.split('T')[0], value: s.followers || 0 })),
            engagementRate: sorted.map(s => ({ date: s.snapshotDate?.split('T')[0], value: s.engagementRate || 0 })),
            avgViews: sorted.map(s => ({ date: s.snapshotDate?.split('T')[0], value: s.avgViews || 0 })),
        }
    }
    // Fallback: generate placeholder time series
    const genTimeSeries = (days, minVal, maxVal) => {
        const data = []
        const now = Date.now()
        for (let i = days; i >= 0; i--) {
            const d = new Date(now - i * 86400000)
            data.push({ date: d.toISOString().split('T')[0], value: Math.round(minVal + Math.random() * (maxVal - minVal)) })
        }
        return data
    }
    const demo = getDemographics(creatorId)
    const baseFollowers = demo ? 150000 : 50000
    return {
        followerGrowth: genTimeSeries(30, baseFollowers, baseFollowers * 1.05),
        engagementRate: genTimeSeries(30, 2.5, 6.8),
        avgViews: genTimeSeries(30, 8000, 45000),
    }
}

export async function getPostPerformance(creatorId) {
    // Try fetching real content posts from API
    const apiPosts = await apiWithFallback(
        () => api.get(`/influencer/creators/${creatorId}/posts?limit=15`),
        null
    )
    if (apiPosts && Array.isArray(apiPosts) && apiPosts.length > 0) {
        return apiPosts.map(p => ({
            date: (p.publishedAt || p.createdAt)?.split('T')[0],
            views: p.views || 0,
            likes: p.likes || 0,
            comments: p.comments || 0,
            shares: p.shares || 0,
            title: p.title || p.caption || '',
            type: p.contentType || 'Post',
        }))
    }
    // Fallback: generate placeholder posts
    const posts = []
    const now = Date.now()
    for (let i = 12; i >= 0; i--) {
        const d = new Date(now - i * 86400000 * 3)
        posts.push({
            date: d.toISOString().split('T')[0],
            views: Math.round(10000 + Math.random() * 40000),
            likes: Math.round(500 + Math.random() * 4000),
            comments: Math.round(50 + Math.random() * 500),
            shares: Math.round(20 + Math.random() * 300),
        })
    }
    return posts
}

export async function getAudienceDemographics(creatorId) {
    // Try fetching demographics from API (platform-synced data)
    const apiDemo = await apiWithFallback(
        () => api.get(`/influencer/creators/${creatorId}`),
        null
    )
    if (apiDemo && apiDemo.socialAccounts && apiDemo.socialAccounts.length > 0) {
        // Extract demographics from the creator's social accounts metadata
        const meta = apiDemo.socialAccounts[0]?.metadata || {}
        if (meta.demographics) {
            const d = meta.demographics
            return {
                age: d.ageBrackets || d.age || {},
                gender: d.genderSplit || d.gender || {},
                location: d.topLocations
                    ? Object.fromEntries(d.topLocations.map(l => [l.city, l.pct]))
                    : d.location || {},
            }
        }
    }
    // Fall back to localStorage demographics store
    const demo = getDemographics(creatorId)
    if (!demo) return { age: { '18-24': 30, '25-34': 35, '35-44': 20, '45+': 15 }, gender: { Male: 45, Female: 50, Other: 5 }, location: { Mumbai: 22, Delhi: 16, Bangalore: 12, Pune: 10, Others: 40 } }
    const age = demo.ageBrackets || {}
    const gender = {}
    if (demo.genderSplit) { Object.entries(demo.genderSplit).forEach(([k, v]) => { gender[k.charAt(0).toUpperCase() + k.slice(1)] = v }) }
    const location = {}
    if (demo.topLocations) { demo.topLocations.forEach(l => { location[l.city] = l.pct }) }
    return { age, gender, location }
}

export async function getSentimentAnalysis(creatorId) {
    // Try fetching post data from API to compute sentiment
    const apiPosts = await apiWithFallback(
        () => api.get(`/influencer/creators/${creatorId}/posts?limit=20`),
        null
    )
    if (apiPosts && Array.isArray(apiPosts) && apiPosts.length > 0) {
        // Derive sentiment from API post engagement metrics
        const total = apiPosts.length
        const positive = Math.round(apiPosts.filter(p => (p.likes || 0) > (p.views || 1) * 0.05).length / total * 100)
        const negative = Math.round(apiPosts.filter(p => (p.likes || 0) < (p.views || 1) * 0.01).length / total * 100)
        const neutral = 100 - positive - negative
        return { positive, neutral: Math.max(0, neutral), negative, keywords: ['engaging', 'quality', 'authentic'] }
    }
    // Fall back to localStorage sentiment store
    const sent = getContentSentiment(creatorId)
    if (!sent) return { positive: 62, neutral: 28, negative: 10, keywords: ['authentic', 'helpful', 'creative', 'inspiring', 'fun'] }
    const posts = sent.posts || []
    const total = posts.length || 1
    const positive = Math.round(posts.filter(p => (p.sentimentScore || 0) > 0.3).length / total * 100)
    const negative = Math.round(posts.filter(p => (p.sentimentScore || 0) < -0.3).length / total * 100)
    const neutral = 100 - positive - negative
    const keywords = sent.topKeywords || posts.flatMap(p => p.keywords || []).slice(0, 8)
    return { positive, neutral, negative, keywords: keywords.length > 0 ? keywords : ['engaging', 'quality', 'authentic'] }
}

// ==================================================================================
// AGGREGATE / DASHBOARD FUNCTIONS
// ==================================================================================

export function getCreatorIntelligenceSummary(creatorId) {
    return {
        demographics: getDemographics(creatorId),
        botDetection: getBotDetection(creatorId),
        audienceQualityScore: calculateAudienceQualityScore(creatorId),
        audienceQualityData: getAudienceQuality(creatorId),
        niche: getCreatorNiche(creatorId),
        competitorBrands: getCompetitorBrands(creatorId),
        sentiment: getContentSentiment(creatorId),
        viralityPrediction: getViralityPrediction(creatorId),
        seasonalTrends: getSeasonalTrends(creatorId),
        contentFormatSplit: getContentFormatSplit(creatorId),
        consistencyStreak: getConsistencyStreak(creatorId),
        bestContentFormat: getBestContentFormat(creatorId),
    }
}

export function getAnalyticsDashboardStats() {
    const allBot = getStore(KEYS.botDetection, initialBotDetection)
    const allQuality = getStore(KEYS.audienceQuality, initialAudienceQuality)
    const allVirality = getStore(KEYS.viralityPrediction, initialViralityPrediction)
    const allStreak = getStore(KEYS.consistencyStreak, initialConsistencyStreak)
    const allSentiment = getStore(KEYS.contentSentiment, initialContentSentiment)
    const creatorIds = [...new Set([...Object.keys(allBot), ...Object.keys(allQuality), ...Object.keys(allVirality), ...Object.keys(allStreak), ...Object.keys(allSentiment)])]
    const avgBotScore = creatorIds.length > 0 ? Math.round(creatorIds.reduce((s, id) => s + (allBot[id]?.botScore || 0), 0) / creatorIds.length) : 0
    const avgSentiment = creatorIds.length > 0 ? Math.round(creatorIds.reduce((s, id) => s + (allSentiment[id]?.overallSentiment || 0), 0) / creatorIds.length) : 0
    const avgVirality = creatorIds.length > 0 ? Math.round(creatorIds.reduce((s, id) => s + (allVirality[id]?.viralityScore || 0), 0) / creatorIds.length) : 0
    const avgConsistency = creatorIds.length > 0 ? Math.round(creatorIds.reduce((s, id) => s + (allStreak[id]?.consistencyScore || 0), 0) / creatorIds.length) : 0
    const qualityScores = calculateAllAudienceQualityScores()
    const avgQuality = Object.keys(qualityScores).length > 0 ? Math.round(Object.values(qualityScores).reduce((s, q) => s + q.score, 0) / Object.keys(qualityScores).length) : 0
    const highRiskCreators = creatorIds.filter(id => (allBot[id]?.botScore || 0) >= 30)
    const topPerformers = creatorIds.map(id => ({ id, viralityScore: allVirality[id]?.viralityScore || 0 })).sort((a, b) => b.viralityScore - a.viralityScore).slice(0, 3)
    return { totalCreatorsTracked: creatorIds.length, avgBotScore, avgSentiment, avgVirality, avgConsistency, avgQuality, highRiskCreators, topPerformers }
}

export function resetAnalyticsStore(section) {
    const resetMap = {
        demographics: () => setStore(KEYS.demographics, initialDemographics),
        botDetection: () => setStore(KEYS.botDetection, initialBotDetection),
        audienceQuality: () => setStore(KEYS.audienceQuality, initialAudienceQuality),
        nicheOverlap: () => setStore(KEYS.nicheOverlap, initialNicheOverlap),
        competitorBrands: () => setStore(KEYS.competitorBrands, initialCompetitorBrands),
        contentSentiment: () => setStore(KEYS.contentSentiment, initialContentSentiment),
        viralityPrediction: () => setStore(KEYS.viralityPrediction, initialViralityPrediction),
        seasonalTrends: () => setStore(KEYS.seasonalTrends, initialSeasonalTrends),
        contentFormatSplit: () => setStore(KEYS.contentFormatSplit, initialContentFormatSplit),
        consistencyStreak: () => setStore(KEYS.consistencyStreak, initialConsistencyStreak),
    }
    if (section && resetMap[section]) { resetMap[section](); return true }
    Object.values(resetMap).forEach(fn => fn())
    return true
}
