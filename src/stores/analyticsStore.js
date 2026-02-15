// Analytics Store - Creator and campaign performance analytics with localStorage persistence

const STORAGE_KEY = 'sic-influencer-analytics'

function getStore() {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialAnalytics))
    return initialAnalytics
}

function setStore(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

// Generate mock time-series data for last N days
function generateDailyData(baseValue, variance, days = 30) {
    const data = []
    const now = new Date()
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now)
        date.setDate(date.getDate() - i)
        const noise = (Math.random() - 0.5) * 2 * variance
        const trend = (days - i) * (baseValue * 0.005)
        data.push({
            date: date.toISOString().split('T')[0],
            value: Math.round(baseValue + noise + trend),
        })
    }
    return data
}

const initialAnalytics = {
    'cr-001': {
        followerGrowth: generateDailyData(520000, 2000),
        engagementRate: generateDailyData(8.6, 1.5),
        avgViews: generateDailyData(45000, 5000),
        demographics: {
            age: { '13-17': 5, '18-24': 35, '25-34': 40, '35-44': 15, '45+': 5 },
            gender: { Male: 30, Female: 65, Other: 5 },
            location: { Mumbai: 25, Delhi: 18, Bangalore: 12, Hyderabad: 8, Other: 37 },
            interests: ['Fashion', 'Beauty', 'Lifestyle', 'Travel', 'Food'],
        },
        postPerformance: [
            { id: 'p1', type: 'Reel', date: '2026-01-20', views: 92000, likes: 8500, comments: 320, shares: 450, platform: 'Instagram' },
            { id: 'p2', type: 'Story', date: '2026-01-22', views: 35000, likes: 0, comments: 0, shares: 0, platform: 'Instagram' },
            { id: 'p3', type: 'Reel', date: '2026-01-28', views: 78000, likes: 7200, comments: 280, shares: 380, platform: 'Instagram' },
            { id: 'p4', type: 'Carousel', date: '2026-02-01', views: 45000, likes: 4100, comments: 150, shares: 200, platform: 'Instagram' },
            { id: 'p5', type: 'Reel', date: '2026-02-08', views: 105000, likes: 9800, comments: 410, shares: 520, platform: 'Instagram' },
        ],
        sentiment: { positive: 72, neutral: 20, negative: 8, keywords: ['love', 'amazing', 'genuine', 'beautiful', 'helpful'] },
    },
    'cr-002': {
        followerGrowth: generateDailyData(1200000, 8000),
        engagementRate: generateDailyData(15, 2),
        avgViews: generateDailyData(180000, 15000),
        demographics: {
            age: { '13-17': 15, '18-24': 40, '25-34': 30, '35-44': 12, '45+': 3 },
            gender: { Male: 72, Female: 25, Other: 3 },
            location: { Bangalore: 20, Delhi: 15, Mumbai: 14, Hyderabad: 10, Other: 41 },
            interests: ['Tech', 'Gadgets', 'Gaming', 'Programming', 'Science'],
        },
        postPerformance: [
            { id: 'p6', type: 'Video', date: '2025-12-15', views: 320000, likes: 28000, comments: 1200, shares: 800, platform: 'YouTube' },
            { id: 'p7', type: 'Shorts', date: '2026-01-05', views: 180000, likes: 15000, comments: 600, shares: 450, platform: 'YouTube' },
            { id: 'p8', type: 'Video', date: '2026-01-20', views: 250000, likes: 22000, comments: 980, shares: 650, platform: 'YouTube' },
        ],
        sentiment: { positive: 68, neutral: 22, negative: 10, keywords: ['honest', 'detailed', 'technical', 'best', 'recommended'] },
    },
    'cr-004': {
        followerGrowth: generateDailyData(780000, 5000),
        engagementRate: generateDailyData(12.1, 2),
        avgViews: generateDailyData(95000, 8000),
        demographics: {
            age: { '13-17': 8, '18-24': 30, '25-34': 35, '35-44': 20, '45+': 7 },
            gender: { Male: 45, Female: 50, Other: 5 },
            location: { Chennai: 28, Bangalore: 15, Hyderabad: 12, Mumbai: 10, Other: 35 },
            interests: ['Food', 'Cooking', 'Travel', 'Restaurant Reviews', 'Street Food'],
        },
        postPerformance: [
            { id: 'p9', type: 'Video', date: '2025-11-20', views: 150000, likes: 14000, comments: 800, shares: 500, platform: 'YouTube' },
            { id: 'p10', type: 'Shorts', date: '2026-01-10', views: 95000, likes: 8500, comments: 420, shares: 300, platform: 'YouTube' },
        ],
        sentiment: { positive: 80, neutral: 14, negative: 6, keywords: ['yummy', 'must try', 'authentic', 'delicious', 'foodie'] },
    },
    'cr-006': {
        followerGrowth: generateDailyData(890000, 6000),
        engagementRate: generateDailyData(13.4, 2.5),
        avgViews: generateDailyData(120000, 12000),
        demographics: {
            age: { '13-17': 20, '18-24': 45, '25-34': 25, '35-44': 8, '45+': 2 },
            gender: { Male: 55, Female: 40, Other: 5 },
            location: { Pune: 22, Mumbai: 18, Delhi: 15, Bangalore: 12, Other: 33 },
            interests: ['Comedy', 'Entertainment', 'Memes', 'Bollywood', 'Trending'],
        },
        postPerformance: [
            { id: 'p11', type: 'Reel', date: '2025-12-01', views: 250000, likes: 22000, comments: 890, shares: 1200, platform: 'Instagram' },
            { id: 'p12', type: 'Reel', date: '2025-12-15', views: 180000, likes: 16000, comments: 650, shares: 800, platform: 'Instagram' },
            { id: 'p13', type: 'Reel', date: '2026-01-10', views: 210000, likes: 19000, comments: 780, shares: 950, platform: 'Instagram' },
        ],
        sentiment: { positive: 85, neutral: 10, negative: 5, keywords: ['hilarious', 'funny', 'relatable', 'LOL', 'viral'] },
    },
}

export function getCreatorAnalytics(creatorId) {
    const store = getStore()
    return store[creatorId] || null
}

export function getCreatorMetrics(creatorId, days = 30) {
    const analytics = getCreatorAnalytics(creatorId)
    if (!analytics) return null
    return {
        followerGrowth: analytics.followerGrowth.slice(-days),
        engagementRate: analytics.engagementRate.slice(-days),
        avgViews: analytics.avgViews.slice(-days),
    }
}

export function getPostPerformance(creatorId) {
    const analytics = getCreatorAnalytics(creatorId)
    return analytics?.postPerformance || []
}

export function getAudienceDemographics(creatorId) {
    const analytics = getCreatorAnalytics(creatorId)
    return analytics?.demographics || null
}

export function getEngagementTrends(creatorId, days = 30) {
    const analytics = getCreatorAnalytics(creatorId)
    if (!analytics) return []
    return analytics.engagementRate.slice(-days)
}

export function getSentimentAnalysis(creatorId) {
    const analytics = getCreatorAnalytics(creatorId)
    return analytics?.sentiment || null
}

export function getAllAnalyticsCreatorIds() {
    return Object.keys(getStore())
}
