// Subscription & Billing Store with localStorage persistence

function getStore(key, initial) {
    const stored = localStorage.getItem(key)
    if (stored) return JSON.parse(stored)
    localStorage.setItem(key, JSON.stringify(initial))
    return initial
}
function setStore(key, data) { localStorage.setItem(key, JSON.stringify(data)) }
function genId(prefix) { return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,7)}` }
const today = () => new Date().toISOString().split('T')[0]

const STORAGE_KEYS = {
    subscription: 'sic-subscription-current',
    usage: 'sic-subscription-usage',
    billingHistory: 'sic-subscription-billing',
    creatorDbStats: 'sic-subscription-db-stats'
}

const plans = [
    {
        id: 'free', name: 'Free', price: 0, period: 'month',
        searchesPerMonth: 50, creatorsLimit: 10, campaignsLimit: 2, teamMembers: 1,
        features: ['Basic creator search', 'Up to 10 creators', '2 campaigns', 'Basic analytics', 'Email support']
    },
    {
        id: 'pro', name: 'Pro', price: 49, period: 'month',
        searchesPerMonth: 500, creatorsLimit: -1, campaignsLimit: 20, teamMembers: 5,
        features: ['Unlimited creator search', 'Unlimited creators', '20 campaigns', 'Advanced analytics', 'AI matching', 'Campaign builder', 'Report builder', 'Priority support', 'API access (100 req/day)']
    },
    {
        id: 'enterprise', name: 'Enterprise', price: 199, period: 'month',
        searchesPerMonth: -1, creatorsLimit: -1, campaignsLimit: -1, teamMembers: -1,
        features: ['Everything in Pro', 'Unlimited campaigns', 'Unlimited team members', 'Custom integrations', 'Dedicated account manager', 'White-label reports', 'Full API access', 'SSO/SAML', 'SLA guarantee', 'Custom features']
    }
]

const initialSubscription = {
    planId: 'pro',
    planName: 'Pro',
    status: 'active',
    startDate: '2025-11-01',
    endDate: '2026-11-01',
    trialEndsAt: null,
    billingCycle: 'monthly',
    nextBillingDate: '2026-03-01',
    paymentMethod: { type: 'card', last4: '4242', brand: 'Visa', expiry: '12/27' }
}

const initialUsage = {
    period: '2026-02',
    searchesUsed: 187,
    creatorsAdded: 6,
    campaignsCreated: 3,
    exportsUsed: 12,
    apiCallsUsed: 45,
    dailyUsage: [
        { date: '2026-02-01', searches: 8, exports: 1 },
        { date: '2026-02-02', searches: 12, exports: 0 },
        { date: '2026-02-03', searches: 5, exports: 2 },
        { date: '2026-02-04', searches: 15, exports: 1 },
        { date: '2026-02-05', searches: 9, exports: 0 },
        { date: '2026-02-06', searches: 11, exports: 1 },
        { date: '2026-02-07', searches: 7, exports: 0 },
        { date: '2026-02-08', searches: 14, exports: 2 },
        { date: '2026-02-09', searches: 10, exports: 1 },
        { date: '2026-02-10', searches: 6, exports: 0 },
        { date: '2026-02-11', searches: 13, exports: 1 },
        { date: '2026-02-12', searches: 8, exports: 0 },
        { date: '2026-02-13', searches: 11, exports: 1 },
        { date: '2026-02-14', searches: 9, exports: 0 },
        { date: '2026-02-15', searches: 7, exports: 1 },
        { date: '2026-02-16', searches: 12, exports: 0 },
        { date: '2026-02-17', searches: 10, exports: 1 },
        { date: '2026-02-18', searches: 6, exports: 0 },
        { date: '2026-02-19', searches: 8, exports: 0 },
        { date: '2026-02-20', searches: 5, exports: 0 }
    ]
}

const initialBillingHistory = [
    { id: 'bill-001', invoiceNumber: 'SIC-2026-001', amount: 49, date: '2026-02-01', status: 'paid', planName: 'Pro', downloadUrl: '#' },
    { id: 'bill-002', invoiceNumber: 'SIC-2026-002', amount: 49, date: '2026-01-01', status: 'paid', planName: 'Pro', downloadUrl: '#' },
    { id: 'bill-003', invoiceNumber: 'SIC-2025-012', amount: 49, date: '2025-12-01', status: 'paid', planName: 'Pro', downloadUrl: '#' },
    { id: 'bill-004', invoiceNumber: 'SIC-2025-011', amount: 49, date: '2025-11-01', status: 'paid', planName: 'Pro', downloadUrl: '#' }
]

const initialCreatorDbStats = {
    totalCreators: 6,
    addedThisMonth: 2,
    lastUpdated: '2026-02-20',
    byPlatform: { Instagram: 4, YouTube: 2, TikTok: 0 },
    byNiche: { Lifestyle: 1, Tech: 1, Fitness: 1, Food: 1, Travel: 1, Comedy: 1 },
    byTier: { nano: 0, micro: 2, macro: 3, mega: 1 },
    growthHistory: [
        { month: '2025-09', count: 1 }, { month: '2025-10', count: 2 }, { month: '2025-11', count: 3 },
        { month: '2025-12', count: 4 }, { month: '2026-01', count: 4 }, { month: '2026-02', count: 6 }
    ]
}

// Subscription
export function getSubscription() { return getStore(STORAGE_KEYS.subscription, initialSubscription) }
export function upgradePlan(planId) {
    const sub = getStore(STORAGE_KEYS.subscription, initialSubscription)
    const plan = plans.find(p => p.id === planId)
    if (!plan) return null
    sub.planId = plan.id
    sub.planName = plan.name
    sub.startDate = today()
    sub.status = 'active'
    setStore(STORAGE_KEYS.subscription, sub)
    return sub
}
export function cancelSubscription() {
    const sub = getStore(STORAGE_KEYS.subscription, initialSubscription)
    sub.status = 'cancelled'
    setStore(STORAGE_KEYS.subscription, sub)
    return sub
}
export function startTrial() {
    const sub = { planId: 'pro', planName: 'Pro (Trial)', status: 'trial', startDate: today(), trialEndsAt: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0], billingCycle: 'monthly', paymentMethod: null }
    setStore(STORAGE_KEYS.subscription, sub)
    return sub
}

// Plans
export function getPlans() { return plans }
export function getPlan(planId) { return plans.find(p => p.id === planId) || null }

// Usage
export function getUsage() { return getStore(STORAGE_KEYS.usage, initialUsage) }
export function trackUsage(type) {
    const usage = getStore(STORAGE_KEYS.usage, initialUsage)
    if (type === 'search') usage.searchesUsed++
    else if (type === 'creator') usage.creatorsAdded++
    else if (type === 'campaign') usage.campaignsCreated++
    else if (type === 'export') usage.exportsUsed++
    else if (type === 'api') usage.apiCallsUsed++
    setStore(STORAGE_KEYS.usage, usage)
    return usage
}
export function getRemainingQuota() {
    const usage = getStore(STORAGE_KEYS.usage, initialUsage)
    const sub = getStore(STORAGE_KEYS.subscription, initialSubscription)
    const plan = plans.find(p => p.id === sub.planId) || plans[0]
    return {
        searches: plan.searchesPerMonth === -1 ? Infinity : plan.searchesPerMonth - usage.searchesUsed,
        creators: plan.creatorsLimit === -1 ? Infinity : plan.creatorsLimit - usage.creatorsAdded,
        campaigns: plan.campaignsLimit === -1 ? Infinity : plan.campaignsLimit - usage.campaignsCreated,
        searchesPct: plan.searchesPerMonth === -1 ? 0 : Math.round(usage.searchesUsed / plan.searchesPerMonth * 100),
        creatorsPct: plan.creatorsLimit === -1 ? 0 : Math.round(usage.creatorsAdded / plan.creatorsLimit * 100),
        campaignsPct: plan.campaignsLimit === -1 ? 0 : Math.round(usage.campaignsCreated / plan.campaignsLimit * 100)
    }
}

// Billing History
export function getBillingHistory() { return getStore(STORAGE_KEYS.billingHistory, initialBillingHistory) }
export function addBillingRecord(data) {
    const history = getStore(STORAGE_KEYS.billingHistory, initialBillingHistory)
    history.unshift({ ...data, id: genId('bill'), date: today() })
    setStore(STORAGE_KEYS.billingHistory, history)
}

// Creator DB Stats
export function getCreatorDbStats() { return getStore(STORAGE_KEYS.creatorDbStats, initialCreatorDbStats) }
export function updateCreatorDbStats(data) {
    const stats = getStore(STORAGE_KEYS.creatorDbStats, initialCreatorDbStats)
    Object.assign(stats, data, { lastUpdated: today() })
    setStore(STORAGE_KEYS.creatorDbStats, stats)
    return stats
}

// Feature availability check
export function isFeatureAvailable(feature) {
    const sub = getStore(STORAGE_KEYS.subscription, initialSubscription)
    const plan = plans.find(p => p.id === sub.planId) || plans[0]
    const proFeatures = ['AI matching', 'Campaign builder', 'Report builder', 'API access', 'Advanced analytics', 'Bulk import', 'Scheduled reports']
    const enterpriseFeatures = ['Custom integrations', 'White-label reports', 'SSO/SAML', 'SLA guarantee', 'Custom features', 'Unlimited API']
    if (enterpriseFeatures.includes(feature)) return sub.planId === 'enterprise'
    if (proFeatures.includes(feature)) return sub.planId === 'pro' || sub.planId === 'enterprise'
    return true
}
