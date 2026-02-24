// Analytics & Creator Intelligence Store - Comprehensive analytics with localStorage persistence
// Covers: Demographics, Bot Detection, Audience Quality, Niche Overlap, Competitor Brands,
// Sentiment Analysis, Virality Prediction, Seasonal Trends, Content Format Split, Consistency Streaks

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
// 1. AUDIENCE DEMOGRAPHICS
// ==================================================================================
const initialDemographics = {
    'cr-001': {
        creatorId: 'cr-001',
        ageBrackets: { '13-17': 4, '18-24': 32, '25-34': 38, '35-44': 18, '45-54': 6, '55+': 2 },
        genderSplit: { male: 28, female: 66, other: 6 },
        topLocations: [
            { city: 'Mumbai', pct: 24 },
            { city: 'Delhi', pct: 16 },
            { city: 'Bangalore', pct: 11 },
            { city: 'Pune', pct: 8 },
            { city: 'Hyderabad', pct: 7 },
        ],
        topCountries: [
            { country: 'India', pct: 88 },
            { country: 'United States', pct: 4 },
            { country: 'United Kingdom', pct: 3 },
            { country: 'UAE', pct: 2 },
            { country: 'Canada', pct: 1.5 },
        ],
        updatedAt: '2026-02-20',
    },
    'cr-002': {
        creatorId: 'cr-002',
        ageBrackets: { '13-17': 12, '18-24': 38, '25-34': 30, '35-44': 14, '45-54': 4, '55+': 2 },
        genderSplit: { male: 74, female: 22, other: 4 },
        topLocations: [
            { city: 'Bangalore', pct: 22 },
            { city: 'Hyderabad', pct: 14 },
            { city: 'Delhi', pct: 13 },
            { city: 'Mumbai', pct: 11 },
            { city: 'Chennai', pct: 8 },
        ],
        topCountries: [
            { country: 'India', pct: 82 },
            { country: 'United States', pct: 7 },
            { country: 'United Kingdom', pct: 3 },
            { country: 'Germany', pct: 2 },
            { country: 'Singapore', pct: 2 },
        ],
        updatedAt: '2026-02-18',
    },
    'cr-003': {
        creatorId: 'cr-003',
        ageBrackets: { '13-17': 6, '18-24': 28, '25-34': 36, '35-44': 20, '45-54': 7, '55+': 3 },
        genderSplit: { male: 35, female: 60, other: 5 },
        topLocations: [
            { city: 'Hyderabad', pct: 26 },
            { city: 'Bangalore', pct: 14 },
            { city: 'Chennai', pct: 10 },
            { city: 'Mumbai', pct: 9 },
            { city: 'Delhi', pct: 8 },
        ],
        topCountries: [
            { country: 'India', pct: 91 },
            { country: 'United States', pct: 3 },
            { country: 'UAE', pct: 2 },
            { country: 'Australia', pct: 1.5 },
            { country: 'United Kingdom', pct: 1 },
        ],
        updatedAt: '2026-02-19',
    },
    'cr-004': {
        creatorId: 'cr-004',
        ageBrackets: { '13-17': 5, '18-24': 26, '25-34': 34, '35-44': 22, '45-54': 9, '55+': 4 },
        genderSplit: { male: 48, female: 47, other: 5 },
        topLocations: [
            { city: 'Chennai', pct: 28 },
            { city: 'Bangalore', pct: 14 },
            { city: 'Hyderabad', pct: 11 },
            { city: 'Mumbai', pct: 9 },
            { city: 'Coimbatore', pct: 7 },
        ],
        topCountries: [
            { country: 'India', pct: 90 },
            { country: 'United States', pct: 3 },
            { country: 'Singapore', pct: 2.5 },
            { country: 'UAE', pct: 2 },
            { country: 'Malaysia', pct: 1 },
        ],
        updatedAt: '2026-02-17',
    },
    'cr-005': {
        creatorId: 'cr-005',
        ageBrackets: { '13-17': 3, '18-24': 30, '25-34': 35, '35-44': 20, '45-54': 8, '55+': 4 },
        genderSplit: { male: 40, female: 55, other: 5 },
        topLocations: [
            { city: 'Delhi', pct: 20 },
            { city: 'Mumbai', pct: 15 },
            { city: 'Jaipur', pct: 12 },
            { city: 'Goa', pct: 9 },
            { city: 'Bangalore', pct: 8 },
        ],
        topCountries: [
            { country: 'India', pct: 84 },
            { country: 'United States', pct: 5 },
            { country: 'United Kingdom', pct: 4 },
            { country: 'Australia', pct: 2 },
            { country: 'Thailand', pct: 2 },
        ],
        updatedAt: '2026-02-15',
    },
    'cr-006': {
        creatorId: 'cr-006',
        ageBrackets: { '13-17': 18, '18-24': 42, '25-34': 26, '35-44': 10, '45-54': 3, '55+': 1 },
        genderSplit: { male: 56, female: 38, other: 6 },
        topLocations: [
            { city: 'Pune', pct: 21 },
            { city: 'Mumbai', pct: 18 },
            { city: 'Delhi', pct: 14 },
            { city: 'Bangalore', pct: 11 },
            { city: 'Ahmedabad', pct: 7 },
        ],
        topCountries: [
            { country: 'India', pct: 92 },
            { country: 'United States', pct: 3 },
            { country: 'Nepal', pct: 1.5 },
            { country: 'UAE', pct: 1 },
            { country: 'United Kingdom', pct: 1 },
        ],
        updatedAt: '2026-02-21',
    },
}

// ==================================================================================
// 2. FAKE FOLLOWER / BOT DETECTION SCORE
// ==================================================================================
const initialBotDetection = {
    'cr-001': {
        creatorId: 'cr-001',
        botScore: 12,
        suspiciousSignals: ['minor follower growth spike in Dec 2025'],
        followerToEngagementRatio: 0.087,
        estimatedRealFollowers: 457600,
        lastChecked: '2026-02-18',
    },
    'cr-002': {
        creatorId: 'cr-002',
        botScore: 8,
        suspiciousSignals: [],
        followerToEngagementRatio: 0.15,
        estimatedRealFollowers: 1104000,
        lastChecked: '2026-02-19',
    },
    'cr-003': {
        creatorId: 'cr-003',
        botScore: 22,
        suspiciousSignals: ['engagement spike anomaly', 'low comment quality'],
        followerToEngagementRatio: 0.09,
        estimatedRealFollowers: 241800,
        lastChecked: '2026-02-17',
    },
    'cr-004': {
        creatorId: 'cr-004',
        botScore: 15,
        suspiciousSignals: ['follower growth spike in Oct 2025'],
        followerToEngagementRatio: 0.122,
        estimatedRealFollowers: 663000,
        lastChecked: '2026-02-20',
    },
    'cr-005': {
        creatorId: 'cr-005',
        botScore: 38,
        suspiciousSignals: ['engagement spike anomaly', 'follower growth spike', 'low comment quality', 'suspicious follower geography'],
        followerToEngagementRatio: 0.071,
        estimatedRealFollowers: 260400,
        lastChecked: '2026-02-16',
    },
    'cr-006': {
        creatorId: 'cr-006',
        botScore: 10,
        suspiciousSignals: [],
        followerToEngagementRatio: 0.135,
        estimatedRealFollowers: 801000,
        lastChecked: '2026-02-21',
    },
}

// ==================================================================================
// 3. AUDIENCE QUALITY SCORE DATA
//    Weighted: realFollowerPct (40%) + activeCommenterPct (30%) + engagementAuthenticity (30%)
// ==================================================================================
const initialAudienceQuality = {
    'cr-001': { creatorId: 'cr-001', realFollowerPct: 88, activeCommenterPct: 72, engagementAuthenticity: 91, updatedAt: '2026-02-18' },
    'cr-002': { creatorId: 'cr-002', realFollowerPct: 92, activeCommenterPct: 78, engagementAuthenticity: 94, updatedAt: '2026-02-19' },
    'cr-003': { creatorId: 'cr-003', realFollowerPct: 78, activeCommenterPct: 55, engagementAuthenticity: 68, updatedAt: '2026-02-17' },
    'cr-004': { creatorId: 'cr-004', realFollowerPct: 85, activeCommenterPct: 70, engagementAuthenticity: 82, updatedAt: '2026-02-20' },
    'cr-005': { creatorId: 'cr-005', realFollowerPct: 62, activeCommenterPct: 44, engagementAuthenticity: 56, updatedAt: '2026-02-16' },
    'cr-006': { creatorId: 'cr-006', realFollowerPct: 90, activeCommenterPct: 80, engagementAuthenticity: 92, updatedAt: '2026-02-21' },
}

// ==================================================================================
// 4. CREATOR NICHE OVERLAP MAP (base data - overlap computed dynamically)
// ==================================================================================
const initialNicheOverlap = {
    creatorNiches: {
        'cr-001': { niche: 'Lifestyle', subNiches: ['Fashion', 'Beauty', 'Travel', 'Food'], audienceInterests: ['fashion', 'skincare', 'lifestyle', 'travel', 'beauty'] },
        'cr-002': { niche: 'Tech', subNiches: ['Gadgets', 'Gaming', 'Programming'], audienceInterests: ['technology', 'gadgets', 'gaming', 'science', 'coding'] },
        'cr-003': { niche: 'Fitness', subNiches: ['Gym', 'Yoga', 'Nutrition'], audienceInterests: ['fitness', 'health', 'nutrition', 'wellness', 'gym'] },
        'cr-004': { niche: 'Food', subNiches: ['Street Food', 'Restaurant Reviews', 'Cooking'], audienceInterests: ['food', 'cooking', 'restaurants', 'travel', 'street food'] },
        'cr-005': { niche: 'Travel', subNiches: ['Budget Travel', 'Luxury', 'Adventure'], audienceInterests: ['travel', 'adventure', 'photography', 'lifestyle', 'hotels'] },
        'cr-006': { niche: 'Comedy', subNiches: ['Sketch Comedy', 'Memes', 'Roasts'], audienceInterests: ['comedy', 'entertainment', 'memes', 'bollywood', 'trending'] },
    },
    pairwiseOverlap: {
        'cr-001|cr-002': { sharedAudiencePct: 8, commonInterests: [] },
        'cr-001|cr-003': { sharedAudiencePct: 18, commonInterests: ['health', 'lifestyle'] },
        'cr-001|cr-004': { sharedAudiencePct: 22, commonInterests: ['food', 'lifestyle'] },
        'cr-001|cr-005': { sharedAudiencePct: 35, commonInterests: ['travel', 'lifestyle', 'photography'] },
        'cr-001|cr-006': { sharedAudiencePct: 14, commonInterests: ['entertainment'] },
        'cr-002|cr-003': { sharedAudiencePct: 10, commonInterests: ['gadgets'] },
        'cr-002|cr-004': { sharedAudiencePct: 6, commonInterests: [] },
        'cr-002|cr-005': { sharedAudiencePct: 7, commonInterests: [] },
        'cr-002|cr-006': { sharedAudiencePct: 15, commonInterests: ['trending'] },
        'cr-003|cr-004': { sharedAudiencePct: 16, commonInterests: ['nutrition', 'health'] },
        'cr-003|cr-005': { sharedAudiencePct: 12, commonInterests: ['adventure'] },
        'cr-003|cr-006': { sharedAudiencePct: 9, commonInterests: [] },
        'cr-004|cr-005': { sharedAudiencePct: 28, commonInterests: ['travel', 'food'] },
        'cr-004|cr-006': { sharedAudiencePct: 11, commonInterests: ['entertainment'] },
        'cr-005|cr-006': { sharedAudiencePct: 13, commonInterests: ['lifestyle'] },
    },
}

// ==================================================================================
// 5. COMPETITOR BRAND ANALYSIS
// ==================================================================================
const initialCompetitorBrands = {
    'cr-001': {
        creatorId: 'cr-001',
        brands: [
            { id: 'cb-001', brandName: 'Nykaa', platform: 'Instagram', date: '2025-11-15', contentType: 'Reel', estimatedReach: 92000, isCompetitor: false },
            { id: 'cb-002', brandName: 'Mamaearth', platform: 'Instagram', date: '2025-12-20', contentType: 'Static', estimatedReach: 45000, isCompetitor: true },
            { id: 'cb-003', brandName: 'Sugar Cosmetics', platform: 'Instagram', date: '2025-10-05', contentType: 'Reel', estimatedReach: 68000, isCompetitor: true },
            { id: 'cb-004', brandName: 'Lakme', platform: 'Instagram', date: '2025-08-18', contentType: 'Carousel', estimatedReach: 55000, isCompetitor: true },
            { id: 'cb-005', brandName: 'Forest Essentials', platform: 'Instagram', date: '2025-06-10', contentType: 'Story', estimatedReach: 38000, isCompetitor: false },
        ],
    },
    'cr-002': {
        creatorId: 'cr-002',
        brands: [
            { id: 'cb-006', brandName: 'Samsung', platform: 'YouTube', date: '2025-09-10', contentType: 'Dedicated Video', estimatedReach: 320000, isCompetitor: true },
            { id: 'cb-007', brandName: 'OnePlus', platform: 'YouTube', date: '2025-07-22', contentType: 'Dedicated Video', estimatedReach: 280000, isCompetitor: true },
            { id: 'cb-008', brandName: 'Boat', platform: 'YouTube', date: '2025-11-05', contentType: 'Integration', estimatedReach: 195000, isCompetitor: false },
            { id: 'cb-009', brandName: 'Apple', platform: 'YouTube', date: '2025-05-15', contentType: 'Shorts', estimatedReach: 210000, isCompetitor: true },
            { id: 'cb-010', brandName: 'Nothing', platform: 'YouTube', date: '2026-01-08', contentType: 'Dedicated Video', estimatedReach: 245000, isCompetitor: true },
        ],
    },
    'cr-003': {
        creatorId: 'cr-003',
        brands: [
            { id: 'cb-011', brandName: 'MuscleBlaze', platform: 'Instagram', date: '2025-09-25', contentType: 'Reel', estimatedReach: 32000, isCompetitor: false },
            { id: 'cb-012', brandName: 'Healthkart', platform: 'Instagram', date: '2025-08-12', contentType: 'Story', estimatedReach: 25000, isCompetitor: true },
            { id: 'cb-013', brandName: 'Cult.fit', platform: 'Instagram', date: '2025-11-30', contentType: 'Reel', estimatedReach: 28000, isCompetitor: false },
        ],
    },
    'cr-004': {
        creatorId: 'cr-004',
        brands: [
            { id: 'cb-014', brandName: 'Swiggy', platform: 'YouTube', date: '2025-10-20', contentType: 'Dedicated Video', estimatedReach: 150000, isCompetitor: true },
            { id: 'cb-015', brandName: 'Zomato', platform: 'YouTube', date: '2025-08-05', contentType: 'Integration', estimatedReach: 120000, isCompetitor: true },
            { id: 'cb-016', brandName: 'ITC', platform: 'YouTube', date: '2025-12-12', contentType: 'Dedicated Video', estimatedReach: 135000, isCompetitor: false },
            { id: 'cb-017', brandName: 'EatSure', platform: 'YouTube', date: '2025-06-20', contentType: 'Shorts', estimatedReach: 88000, isCompetitor: true },
            { id: 'cb-018', brandName: 'Blinkit', platform: 'Instagram', date: '2026-01-15', contentType: 'Reel', estimatedReach: 95000, isCompetitor: false },
        ],
    },
    'cr-005': {
        creatorId: 'cr-005',
        brands: [
            { id: 'cb-019', brandName: 'MakeMyTrip', platform: 'Instagram', date: '2025-08-15', contentType: 'Reel', estimatedReach: 42000, isCompetitor: true },
            { id: 'cb-020', brandName: 'Airbnb', platform: 'Instagram', date: '2025-07-10', contentType: 'Carousel', estimatedReach: 38000, isCompetitor: false },
            { id: 'cb-021', brandName: 'Cleartrip', platform: 'Instagram', date: '2025-11-22', contentType: 'Story', estimatedReach: 30000, isCompetitor: true },
            { id: 'cb-022', brandName: 'Booking.com', platform: 'Instagram', date: '2025-05-18', contentType: 'Reel', estimatedReach: 35000, isCompetitor: true },
        ],
    },
    'cr-006': {
        creatorId: 'cr-006',
        brands: [
            { id: 'cb-023', brandName: 'Cred', platform: 'Instagram', date: '2025-12-01', contentType: 'Reel', estimatedReach: 250000, isCompetitor: false },
            { id: 'cb-024', brandName: 'Dunzo', platform: 'Instagram', date: '2025-11-15', contentType: 'Reel', estimatedReach: 210000, isCompetitor: false },
            { id: 'cb-025', brandName: 'Zepto', platform: 'Instagram', date: '2025-09-28', contentType: 'Reel', estimatedReach: 190000, isCompetitor: true },
            { id: 'cb-026', brandName: 'Swiggy Instamart', platform: 'Instagram', date: '2025-07-20', contentType: 'Story', estimatedReach: 165000, isCompetitor: true },
            { id: 'cb-027', brandName: 'PhonePe', platform: 'Instagram', date: '2026-01-20', contentType: 'Reel', estimatedReach: 230000, isCompetitor: false },
        ],
    },
}

// ==================================================================================
// 6. CONTENT SENTIMENT ANALYSIS
// ==================================================================================
const initialContentSentiment = {
    'cr-001': {
        creatorId: 'cr-001',
        posts: [
            { postId: 'p-s001', date: '2026-01-20', positive: 74, neutral: 18, negative: 8, topPositiveKeywords: ['love', 'amazing', 'genuine', 'beautiful'], topNegativeKeywords: ['expensive', 'ad'], overallSentiment: 78 },
            { postId: 'p-s002', date: '2026-01-28', positive: 68, neutral: 22, negative: 10, topPositiveKeywords: ['helpful', 'great', 'pretty'], topNegativeKeywords: ['sponsored', 'overrated'], overallSentiment: 72 },
            { postId: 'p-s003', date: '2026-02-08', positive: 80, neutral: 14, negative: 6, topPositiveKeywords: ['stunning', 'must-try', 'authentic', 'gorgeous'], topNegativeKeywords: ['pricey'], overallSentiment: 84 },
        ],
        overallSentiment: 78,
    },
    'cr-002': {
        creatorId: 'cr-002',
        posts: [
            { postId: 'p-s004', date: '2025-12-15', positive: 70, neutral: 20, negative: 10, topPositiveKeywords: ['honest', 'detailed', 'best review'], topNegativeKeywords: ['biased', 'too long'], overallSentiment: 74 },
            { postId: 'p-s005', date: '2026-01-05', positive: 65, neutral: 25, negative: 10, topPositiveKeywords: ['informative', 'technical', 'clear'], topNegativeKeywords: ['boring', 'slow'], overallSentiment: 70 },
            { postId: 'p-s006', date: '2026-01-20', positive: 72, neutral: 19, negative: 9, topPositiveKeywords: ['thorough', 'real-world', 'recommended'], topNegativeKeywords: ['sponsored'], overallSentiment: 76 },
        ],
        overallSentiment: 73,
    },
    'cr-003': {
        creatorId: 'cr-003',
        posts: [
            { postId: 'p-s007', date: '2025-11-10', positive: 78, neutral: 15, negative: 7, topPositiveKeywords: ['motivating', 'inspiring', 'strong', 'goals'], topNegativeKeywords: ['unrealistic'], overallSentiment: 80 },
            { postId: 'p-s008', date: '2026-01-18', positive: 60, neutral: 28, negative: 12, topPositiveKeywords: ['helpful', 'form check'], topNegativeKeywords: ['dangerous', 'wrong form', 'not safe'], overallSentiment: 62 },
        ],
        overallSentiment: 71,
    },
    'cr-004': {
        creatorId: 'cr-004',
        posts: [
            { postId: 'p-s009', date: '2025-11-20', positive: 82, neutral: 12, negative: 6, topPositiveKeywords: ['yummy', 'must try', 'authentic', 'delicious'], topNegativeKeywords: ['unhealthy'], overallSentiment: 85 },
            { postId: 'p-s010', date: '2026-01-10', positive: 76, neutral: 18, negative: 6, topPositiveKeywords: ['foodie', 'best ever', 'mouth-watering'], topNegativeKeywords: ['overpriced'], overallSentiment: 80 },
            { postId: 'p-s011', date: '2026-02-05', positive: 84, neutral: 10, negative: 6, topPositiveKeywords: ['hidden gem', 'amazing taste', 'real review'], topNegativeKeywords: ['biased'], overallSentiment: 86 },
        ],
        overallSentiment: 84,
    },
    'cr-005': {
        creatorId: 'cr-005',
        posts: [
            { postId: 'p-s012', date: '2025-08-15', positive: 70, neutral: 20, negative: 10, topPositiveKeywords: ['wanderlust', 'beautiful', 'dreamy'], topNegativeKeywords: ['ad', 'fake', 'sponsored'], overallSentiment: 72 },
            { postId: 'p-s013', date: '2025-10-25', positive: 55, neutral: 25, negative: 20, topPositiveKeywords: ['nice views'], topNegativeKeywords: ['ghosted brand', 'unreliable', 'scam'], overallSentiment: 52 },
        ],
        overallSentiment: 62,
    },
    'cr-006': {
        creatorId: 'cr-006',
        posts: [
            { postId: 'p-s014', date: '2025-12-01', positive: 88, neutral: 8, negative: 4, topPositiveKeywords: ['hilarious', 'funny', 'relatable', 'LOL', 'dead'], topNegativeKeywords: ['copied'], overallSentiment: 90 },
            { postId: 'p-s015', date: '2025-12-15', positive: 82, neutral: 12, negative: 6, topPositiveKeywords: ['so funny', 'ROFL', 'creative'], topNegativeKeywords: ['offensive'], overallSentiment: 84 },
            { postId: 'p-s016', date: '2026-01-10', positive: 86, neutral: 9, negative: 5, topPositiveKeywords: ['viral material', 'genius', 'share-worthy'], topNegativeKeywords: ['repetitive'], overallSentiment: 88 },
            { postId: 'p-s017', date: '2026-02-02', positive: 90, neutral: 7, negative: 3, topPositiveKeywords: ['best content', 'legend', 'laughing'], topNegativeKeywords: [], overallSentiment: 92 },
        ],
        overallSentiment: 89,
    },
}

// ==================================================================================
// 7. VIRALITY PREDICTION SCORE
// ==================================================================================
const initialViralityPrediction = {
    'cr-001': { creatorId: 'cr-001', viralityScore: 58, factors: { contentConsistency: 72, trendAlignment: 65, engagementVelocity: 48, audienceGrowthRate: 45 }, predictedNextPostReach: 52000, confidence: 68, updatedAt: '2026-02-20' },
    'cr-002': { creatorId: 'cr-002', viralityScore: 74, factors: { contentConsistency: 80, trendAlignment: 78, engagementVelocity: 70, audienceGrowthRate: 68 }, predictedNextPostReach: 210000, confidence: 75, updatedAt: '2026-02-19' },
    'cr-003': { creatorId: 'cr-003', viralityScore: 42, factors: { contentConsistency: 50, trendAlignment: 38, engagementVelocity: 40, audienceGrowthRate: 35 }, predictedNextPostReach: 30000, confidence: 55, updatedAt: '2026-02-17' },
    'cr-004': { creatorId: 'cr-004', viralityScore: 65, factors: { contentConsistency: 75, trendAlignment: 60, engagementVelocity: 62, audienceGrowthRate: 58 }, predictedNextPostReach: 110000, confidence: 70, updatedAt: '2026-02-20' },
    'cr-005': { creatorId: 'cr-005', viralityScore: 35, factors: { contentConsistency: 28, trendAlignment: 42, engagementVelocity: 32, audienceGrowthRate: 30 }, predictedNextPostReach: 22000, confidence: 45, updatedAt: '2026-02-16' },
    'cr-006': { creatorId: 'cr-006', viralityScore: 88, factors: { contentConsistency: 85, trendAlignment: 92, engagementVelocity: 90, audienceGrowthRate: 82 }, predictedNextPostReach: 280000, confidence: 82, updatedAt: '2026-02-21' },
}

// ==================================================================================
// 8. SEASONAL PERFORMANCE TRENDS
// ==================================================================================
const initialSeasonalTrends = {
    'cr-001': {
        creatorId: 'cr-001',
        monthly: {
            jan: { avgViews: 42000, avgEngagement: 7.8, postCount: 12 }, feb: { avgViews: 44000, avgEngagement: 8.1, postCount: 10 },
            mar: { avgViews: 48000, avgEngagement: 8.5, postCount: 14 }, apr: { avgViews: 46000, avgEngagement: 8.2, postCount: 11 },
            may: { avgViews: 40000, avgEngagement: 7.5, postCount: 9 }, jun: { avgViews: 38000, avgEngagement: 7.2, postCount: 8 },
            jul: { avgViews: 36000, avgEngagement: 7.0, postCount: 7 }, aug: { avgViews: 39000, avgEngagement: 7.4, postCount: 10 },
            sep: { avgViews: 43000, avgEngagement: 8.0, postCount: 12 }, oct: { avgViews: 50000, avgEngagement: 8.8, postCount: 15 },
            nov: { avgViews: 55000, avgEngagement: 9.2, postCount: 16 }, dec: { avgViews: 52000, avgEngagement: 9.0, postCount: 14 },
        },
        bestMonths: ['nov', 'oct', 'dec'], worstMonths: ['jul', 'jun', 'may'],
    },
    'cr-002': {
        creatorId: 'cr-002',
        monthly: {
            jan: { avgViews: 170000, avgEngagement: 14.2, postCount: 4 }, feb: { avgViews: 165000, avgEngagement: 13.8, postCount: 4 },
            mar: { avgViews: 180000, avgEngagement: 15.0, postCount: 5 }, apr: { avgViews: 190000, avgEngagement: 15.5, postCount: 5 },
            may: { avgViews: 175000, avgEngagement: 14.5, postCount: 4 }, jun: { avgViews: 160000, avgEngagement: 13.5, postCount: 3 },
            jul: { avgViews: 155000, avgEngagement: 13.0, postCount: 3 }, aug: { avgViews: 168000, avgEngagement: 14.0, postCount: 4 },
            sep: { avgViews: 185000, avgEngagement: 15.2, postCount: 5 }, oct: { avgViews: 200000, avgEngagement: 16.0, postCount: 6 },
            nov: { avgViews: 210000, avgEngagement: 16.5, postCount: 6 }, dec: { avgViews: 195000, avgEngagement: 15.8, postCount: 5 },
        },
        bestMonths: ['nov', 'oct', 'dec'], worstMonths: ['jul', 'jun', 'feb'],
    },
    'cr-003': {
        creatorId: 'cr-003',
        monthly: {
            jan: { avgViews: 32000, avgEngagement: 9.5, postCount: 14 }, feb: { avgViews: 30000, avgEngagement: 9.2, postCount: 12 },
            mar: { avgViews: 28000, avgEngagement: 8.8, postCount: 11 }, apr: { avgViews: 26000, avgEngagement: 8.5, postCount: 10 },
            may: { avgViews: 24000, avgEngagement: 8.0, postCount: 8 }, jun: { avgViews: 22000, avgEngagement: 7.5, postCount: 7 },
            jul: { avgViews: 20000, avgEngagement: 7.0, postCount: 6 }, aug: { avgViews: 25000, avgEngagement: 8.2, postCount: 10 },
            sep: { avgViews: 28000, avgEngagement: 8.8, postCount: 12 }, oct: { avgViews: 30000, avgEngagement: 9.2, postCount: 13 },
            nov: { avgViews: 27000, avgEngagement: 8.6, postCount: 11 }, dec: { avgViews: 26000, avgEngagement: 8.4, postCount: 10 },
        },
        bestMonths: ['jan', 'oct', 'feb'], worstMonths: ['jul', 'jun', 'may'],
    },
    'cr-004': {
        creatorId: 'cr-004',
        monthly: {
            jan: { avgViews: 88000, avgEngagement: 11.5, postCount: 6 }, feb: { avgViews: 85000, avgEngagement: 11.0, postCount: 5 },
            mar: { avgViews: 92000, avgEngagement: 12.0, postCount: 7 }, apr: { avgViews: 95000, avgEngagement: 12.5, postCount: 7 },
            may: { avgViews: 90000, avgEngagement: 11.8, postCount: 6 }, jun: { avgViews: 82000, avgEngagement: 10.8, postCount: 5 },
            jul: { avgViews: 80000, avgEngagement: 10.5, postCount: 4 }, aug: { avgViews: 86000, avgEngagement: 11.2, postCount: 6 },
            sep: { avgViews: 98000, avgEngagement: 12.8, postCount: 7 }, oct: { avgViews: 110000, avgEngagement: 13.5, postCount: 8 },
            nov: { avgViews: 115000, avgEngagement: 14.0, postCount: 9 }, dec: { avgViews: 120000, avgEngagement: 14.5, postCount: 10 },
        },
        bestMonths: ['dec', 'nov', 'oct'], worstMonths: ['jul', 'jun', 'feb'],
    },
    'cr-005': {
        creatorId: 'cr-005',
        monthly: {
            jan: { avgViews: 35000, avgEngagement: 7.0, postCount: 6 }, feb: { avgViews: 32000, avgEngagement: 6.8, postCount: 5 },
            mar: { avgViews: 38000, avgEngagement: 7.5, postCount: 8 }, apr: { avgViews: 42000, avgEngagement: 8.0, postCount: 9 },
            may: { avgViews: 48000, avgEngagement: 8.8, postCount: 10 }, jun: { avgViews: 50000, avgEngagement: 9.2, postCount: 11 },
            jul: { avgViews: 45000, avgEngagement: 8.5, postCount: 9 }, aug: { avgViews: 40000, avgEngagement: 7.8, postCount: 7 },
            sep: { avgViews: 36000, avgEngagement: 7.2, postCount: 6 }, oct: { avgViews: 44000, avgEngagement: 8.2, postCount: 10 },
            nov: { avgViews: 38000, avgEngagement: 7.5, postCount: 7 }, dec: { avgViews: 46000, avgEngagement: 8.5, postCount: 10 },
        },
        bestMonths: ['jun', 'may', 'dec'], worstMonths: ['feb', 'jan', 'sep'],
    },
    'cr-006': {
        creatorId: 'cr-006',
        monthly: {
            jan: { avgViews: 115000, avgEngagement: 13.0, postCount: 10 }, feb: { avgViews: 110000, avgEngagement: 12.5, postCount: 9 },
            mar: { avgViews: 120000, avgEngagement: 13.5, postCount: 11 }, apr: { avgViews: 125000, avgEngagement: 14.0, postCount: 12 },
            may: { avgViews: 118000, avgEngagement: 13.2, postCount: 10 }, jun: { avgViews: 105000, avgEngagement: 12.0, postCount: 8 },
            jul: { avgViews: 100000, avgEngagement: 11.5, postCount: 7 }, aug: { avgViews: 112000, avgEngagement: 12.8, postCount: 9 },
            sep: { avgViews: 130000, avgEngagement: 14.2, postCount: 12 }, oct: { avgViews: 140000, avgEngagement: 15.0, postCount: 14 },
            nov: { avgViews: 150000, avgEngagement: 15.5, postCount: 15 }, dec: { avgViews: 145000, avgEngagement: 15.2, postCount: 13 },
        },
        bestMonths: ['nov', 'dec', 'oct'], worstMonths: ['jul', 'jun', 'aug'],
    },
}

// ==================================================================================
// 9. STORY vs REEL vs POST PERFORMANCE SPLIT
// ==================================================================================
const initialContentFormatSplit = {
    'cr-001': { creatorId: 'cr-001', formats: [
        { contentFormat: 'Reel', avgViews: 72000, avgEngagement: 9.8, count: 48, avgReach: 85000 },
        { contentFormat: 'Story', avgViews: 28000, avgEngagement: 4.2, count: 120, avgReach: 35000 },
        { contentFormat: 'Static', avgViews: 18000, avgEngagement: 5.5, count: 22, avgReach: 24000 },
        { contentFormat: 'Carousel', avgViews: 32000, avgEngagement: 6.8, count: 15, avgReach: 40000 },
    ] },
    'cr-002': { creatorId: 'cr-002', formats: [
        { contentFormat: 'Video', avgViews: 220000, avgEngagement: 16.5, count: 35, avgReach: 310000 },
        { contentFormat: 'Reel', avgViews: 145000, avgEngagement: 12.0, count: 18, avgReach: 180000 },
        { contentFormat: 'Story', avgViews: 60000, avgEngagement: 5.8, count: 80, avgReach: 75000 },
        { contentFormat: 'Carousel', avgViews: 42000, avgEngagement: 8.2, count: 8, avgReach: 55000 },
    ] },
    'cr-003': { creatorId: 'cr-003', formats: [
        { contentFormat: 'Reel', avgViews: 34000, avgEngagement: 10.2, count: 55, avgReach: 42000 },
        { contentFormat: 'Story', avgViews: 15000, avgEngagement: 3.8, count: 95, avgReach: 20000 },
        { contentFormat: 'Static', avgViews: 12000, avgEngagement: 5.0, count: 30, avgReach: 16000 },
        { contentFormat: 'Carousel', avgViews: 22000, avgEngagement: 7.5, count: 12, avgReach: 28000 },
        { contentFormat: 'Video', avgViews: 25000, avgEngagement: 8.0, count: 5, avgReach: 30000 },
    ] },
    'cr-004': { creatorId: 'cr-004', formats: [
        { contentFormat: 'Video', avgViews: 130000, avgEngagement: 14.0, count: 42, avgReach: 165000 },
        { contentFormat: 'Reel', avgViews: 95000, avgEngagement: 11.5, count: 20, avgReach: 115000 },
        { contentFormat: 'Story', avgViews: 45000, avgEngagement: 5.0, count: 60, avgReach: 55000 },
        { contentFormat: 'Static', avgViews: 28000, avgEngagement: 6.5, count: 10, avgReach: 35000 },
    ] },
    'cr-005': { creatorId: 'cr-005', formats: [
        { contentFormat: 'Reel', avgViews: 48000, avgEngagement: 8.5, count: 35, avgReach: 58000 },
        { contentFormat: 'Story', avgViews: 22000, avgEngagement: 3.5, count: 75, avgReach: 28000 },
        { contentFormat: 'Carousel', avgViews: 35000, avgEngagement: 7.0, count: 18, avgReach: 42000 },
        { contentFormat: 'Static', avgViews: 15000, avgEngagement: 4.8, count: 14, avgReach: 20000 },
    ] },
    'cr-006': { creatorId: 'cr-006', formats: [
        { contentFormat: 'Reel', avgViews: 165000, avgEngagement: 15.8, count: 68, avgReach: 200000 },
        { contentFormat: 'Story', avgViews: 55000, avgEngagement: 6.0, count: 100, avgReach: 70000 },
        { contentFormat: 'Static', avgViews: 30000, avgEngagement: 7.2, count: 10, avgReach: 38000 },
        { contentFormat: 'Carousel', avgViews: 42000, avgEngagement: 8.5, count: 8, avgReach: 52000 },
        { contentFormat: 'Video', avgViews: 180000, avgEngagement: 16.0, count: 5, avgReach: 220000 },
    ] },
}

// ==================================================================================
// 10. CREATOR CONSISTENCY STREAK
// ==================================================================================
const initialConsistencyStreak = {
    'cr-001': { creatorId: 'cr-001', currentStreak: 14, longestStreak: 22, lastPostDate: '2026-02-22', averagePostsPerWeek: 3.2, consistencyScore: 78 },
    'cr-002': { creatorId: 'cr-002', currentStreak: 18, longestStreak: 30, lastPostDate: '2026-02-21', averagePostsPerWeek: 1.5, consistencyScore: 82 },
    'cr-003': { creatorId: 'cr-003', currentStreak: 6, longestStreak: 15, lastPostDate: '2026-02-18', averagePostsPerWeek: 2.8, consistencyScore: 52 },
    'cr-004': { creatorId: 'cr-004', currentStreak: 20, longestStreak: 28, lastPostDate: '2026-02-23', averagePostsPerWeek: 2.0, consistencyScore: 85 },
    'cr-005': { creatorId: 'cr-005', currentStreak: 0, longestStreak: 12, lastPostDate: '2026-01-05', averagePostsPerWeek: 1.8, consistencyScore: 22 },
    'cr-006': { creatorId: 'cr-006', currentStreak: 24, longestStreak: 35, lastPostDate: '2026-02-24', averagePostsPerWeek: 3.5, consistencyScore: 92 },
}


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

export function getCreatorAnalytics(creatorId) {
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

export function getPostPerformance(creatorId) {
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

export function getAudienceDemographics(creatorId) {
    const demo = getDemographics(creatorId)
    if (!demo) return { age: { '18-24': 30, '25-34': 35, '35-44': 20, '45+': 15 }, gender: { Male: 45, Female: 50, Other: 5 }, location: { Mumbai: 22, Delhi: 16, Bangalore: 12, Pune: 10, Others: 40 } }
    const age = demo.ageBrackets || {}
    const gender = {}
    if (demo.genderSplit) { Object.entries(demo.genderSplit).forEach(([k, v]) => { gender[k.charAt(0).toUpperCase() + k.slice(1)] = v }) }
    const location = {}
    if (demo.topLocations) { demo.topLocations.forEach(l => { location[l.city] = l.pct }) }
    return { age, gender, location }
}

export function getSentimentAnalysis(creatorId) {
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
