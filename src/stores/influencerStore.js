// Influencer Marketing Store — API-backed with localStorage fallback
import api from '../utils/api.js'

const STORAGE_KEYS = {
    creators: 'sic-influencer-creators',
    campaigns: 'sic-influencer-campaigns',
    deals: 'sic-influencer-deals',
    outreach: 'sic-influencer-outreach',
    contentSchedule: 'sic-influencer-content-schedule',
    invoices: 'sic-influencer-invoices',
    salesLeads: 'sic-influencer-sales-leads',
    labels: 'sic-influencer-labels',
    platformConfigs: 'sic-influencer-platform-configs',
}

// ==================== HELPERS ====================
function getStore(key, initial) {
    const stored = localStorage.getItem(key)
    if (stored) return JSON.parse(stored)
    localStorage.setItem(key, JSON.stringify(initial))
    return initial
}

function setStore(key, data) {
    localStorage.setItem(key, JSON.stringify(data))
}

function genId(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

const today = () => new Date().toISOString().split('T')[0]

// Try API first, fall back to localStorage on network error
async function apiWithFallback(apiCall, fallbackFn) {
    try {
        return await apiCall()
    } catch (err) {
        console.warn('[InfluencerStore] API unavailable, using localStorage fallback:', err.message)
        return fallbackFn()
    }
}

// ==================== LABELS (localStorage only) ====================
const initialLabels = [
    { id: 'lbl-1', name: 'Top Creator', color: '#10b981' },
    { id: 'lbl-2', name: 'Reliable', color: '#6366f1' },
    { id: 'lbl-3', name: 'Risky', color: '#ef4444' },
    { id: 'lbl-4', name: 'New Talent', color: '#f59e0b' },
    { id: 'lbl-5', name: 'Premium', color: '#8b5cf6' },
    { id: 'lbl-6', name: 'Budget Friendly', color: '#06b6d4' },
    { id: 'lbl-7', name: 'Ghosted Before', color: '#f97316' },
    { id: 'lbl-8', name: 'Repeat Collab', color: '#22c55e' },
]

// ==================== CREATORS (API-backed) ====================

// Normalize API creator to match frontend shape
function normalizeCreator(c) {
    const avgViews = c.avgViews || calculateSmartAvgViews(c.reelViews || [])
    return {
        id: c.id,
        name: c.name,
        platform: c.socialAccounts?.[0]?.platform || c.platform || 'Instagram',
        handle: c.socialAccounts?.[0]?.handle || c.handle || '',
        followers: c.socialAccounts?.[0]?.followers || c.followers || 0,
        avgViews,
        reelViews: c.reelViews || [],
        niche: c.niche || '',
        city: c.city || '',
        contactWhatsApp: c.contactWhatsApp || '',
        contactEmail: c.contactEmail || '',
        lastQuotedRate: c.lastQuotedRate || 0,
        lowestClosedRate: c.lowestClosedRate || 0,
        suggestedCPV: calculateSuggestedCPV(avgViews),
        rateCard: c.rateCard || null,
        tracked: c.tracked !== false,
        brandsWorkedWith: c.brandsWorkedWith || [],
        negotiationNotes: c.negotiationNotes || '',
        status: c.status || 'Cold',
        labels: c.labels || [],
        dealHistory: (c.dealHistory || []).map(d => ({
            id: d.id,
            brand: d.brand,
            amount: Number(d.amount),
            date: d.date,
            deliverables: d.deliverables,
            status: d.status,
        })),
        verificationStatus: c.verificationStatus || 'unverified',
        creatorScore: c.creatorScore || 0,
        creatorTier: c.creatorTier || 'nano',
        socialAccounts: c.socialAccounts || [],
        profilePicUrl: c.socialAccounts?.[0]?.profilePicUrl || c.profilePicUrl || '',
        bio: c.socialAccounts?.[0]?.bio || c.bio || '',
        engagementRate: c.socialAccounts?.[0]?.engagementRate || c.engagementRate || 0,
        lastSyncedAt: c.socialAccounts?.[0]?.lastSyncedAt || null,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
    }
}

// ==================== CAMPAIGNS (API-backed) ====================

// ==================== OUTREACH ====================
const initialOutreach = [
    {
        id: 'out-001',
        creatorId: 'cr-003',
        creatorName: 'Ananya Reddy',
        channel: 'Email',
        status: 'Sent',
        messages: [
            { type: 'cold', text: 'Hi Ananya! Love your fitness content. We\'re working with a health brand that would be a perfect fit...', sentAt: '2026-01-10T10:00:00', opened: true },
        ],
        followUps: [
            { scheduledAt: '2026-01-13T10:00:00', status: 'Sent', text: 'Hey Ananya, just following up on my previous email...' },
            { scheduledAt: '2026-01-16T10:00:00', status: 'Pending', text: 'Hi Ananya, I know you\'re busy. Quick question...' },
        ],
        lastReply: null,
        reminderDate: '2026-01-19',
        createdAt: '2026-01-10'
    },
    {
        id: 'out-002',
        creatorId: 'cr-004',
        creatorName: 'Karthik Iyer',
        channel: 'LinkedIn',
        status: 'Replied',
        messages: [
            { type: 'cold', text: 'Hi Karthik! Big fan of your food reviews. We have an exciting campaign...', sentAt: '2026-01-08T14:00:00', opened: true },
        ],
        followUps: [
            { scheduledAt: '2026-01-11T14:00:00', status: 'Sent', text: 'Hey Karthik, following up on the campaign opportunity...' },
        ],
        lastReply: '2026-01-12T09:30:00',
        reminderDate: null,
        createdAt: '2026-01-08'
    },
]

// ==================== CONTENT SCHEDULE ====================
const initialContentSchedule = [
    {
        id: 'cs-001',
        campaignId: 'camp-001',
        creatorId: 'cr-001',
        creatorName: 'Priya Sharma',
        contentType: 'Reel',
        platform: 'Instagram',
        scheduledDate: '2026-01-20',
        scheduledTime: '18:00',
        status: 'Published',
        caption: 'Summer skincare routine with @nykaa_official ☀️',
        hashtags: '#nykaa #summerskincare #spf',
        notes: 'Performed well. Good engagement.',
        publishedUrl: null,
    },
    {
        id: 'cs-002',
        campaignId: 'camp-001',
        creatorId: 'cr-003',
        creatorName: 'Ananya Reddy',
        contentType: 'Reel',
        platform: 'Instagram',
        scheduledDate: '2026-02-10',
        scheduledTime: '12:00',
        status: 'Scheduled',
        caption: 'Post-workout skincare with @nykaa_official 💪',
        hashtags: '#fitness #skincare #nykaa',
        notes: 'Draft approved by brand.',
        publishedUrl: null,
    },
    {
        id: 'cs-003',
        campaignId: 'camp-002',
        creatorId: 'cr-002',
        creatorName: 'Rohan Verma',
        contentType: 'Dedicated Video',
        platform: 'YouTube',
        scheduledDate: '2026-03-01',
        scheduledTime: '17:00',
        status: 'Draft',
        caption: 'OnePlus 14 - Is this the BEST phone of 2026?',
        hashtags: '#oneplus14 #techreview',
        notes: 'Script under review.',
        publishedUrl: null,
    },
]

// ==================== INVOICES ====================
const initialInvoices = [
    {
        id: 'inv-001',
        invoiceNumber: 'INF-2026-001',
        creatorId: 'cr-001',
        creatorName: 'Priya Sharma',
        campaignId: 'camp-001',
        campaignName: 'Nykaa Summer Glow',
        amount: 80000,
        gst: 14400,
        tds: 8000,
        totalPayable: 86400,
        status: 'Paid',
        issueDate: '2026-01-25',
        dueDate: '2026-02-10',
        paidDate: '2026-02-05',
        paymentMethod: 'Bank Transfer',
        notes: 'Payment completed on time.',
    },
    {
        id: 'inv-002',
        invoiceNumber: 'INF-2026-002',
        creatorId: 'cr-003',
        creatorName: 'Ananya Reddy',
        campaignId: 'camp-001',
        campaignName: 'Nykaa Summer Glow',
        amount: 35000,
        gst: 6300,
        tds: 3500,
        totalPayable: 37800,
        status: 'Pending',
        issueDate: '2026-01-28',
        dueDate: '2026-02-15',
        paidDate: null,
        paymentMethod: null,
        notes: '50% advance paid. Remaining on delivery.',
    },
    {
        id: 'inv-003',
        invoiceNumber: 'INF-2026-003',
        creatorId: 'cr-006',
        creatorName: 'Aditya Kapoor',
        campaignId: 'camp-003',
        campaignName: 'Cred Rewards Push',
        amount: 150000,
        gst: 27000,
        tds: 15000,
        totalPayable: 162000,
        status: 'Paid',
        issueDate: '2025-12-01',
        dueDate: '2025-12-15',
        paidDate: '2025-12-12',
        paymentMethod: 'Bank Transfer',
        notes: '',
    },
]

// ==================== SALES LEADS ====================
const initialSalesLeads = [
    {
        id: 'sl-001',
        brandName: 'Boat Lifestyle',
        contactPerson: 'Rahul Mehta',
        email: 'rahul@boat.in',
        phone: '+91-98765-11111',
        industry: 'Electronics',
        budget: 500000,
        source: 'LinkedIn',
        status: 'Qualified',
        stage: 'Proposal Sent',
        notes: 'Interested in 5 creator campaign for new earbuds launch.',
        lastFollowUp: '2026-01-14',
        nextFollowUp: '2026-01-18',
        dealValue: 500000,
        probability: 70,
        createdAt: '2026-01-05',
    },
    {
        id: 'sl-002',
        brandName: 'Plum Goodness',
        contactPerson: 'Megha Jain',
        email: 'megha@plumgoodness.com',
        phone: '+91-98765-22222',
        industry: 'Beauty',
        budget: 300000,
        source: 'Referral',
        status: 'New',
        stage: 'Discovery',
        notes: 'Vegan beauty brand. Looking for micro-influencers.',
        lastFollowUp: null,
        nextFollowUp: '2026-01-17',
        dealValue: 300000,
        probability: 30,
        createdAt: '2026-01-12',
    },
    {
        id: 'sl-003',
        brandName: 'Zepto',
        contactPerson: 'Arjun Singh',
        email: 'arjun@zepto.co',
        phone: '+91-98765-33333',
        industry: 'Quick Commerce',
        budget: 1000000,
        source: 'Cold Outreach',
        status: 'Negotiation',
        stage: 'Contract Review',
        notes: 'Large campaign budget. Wants comedy creators + food creators mix.',
        lastFollowUp: '2026-01-15',
        nextFollowUp: '2026-01-20',
        dealValue: 1000000,
        probability: 85,
        createdAt: '2025-12-20',
    },
]

// ==================== UTILITY: Calculate Avg Views (excluding pinned/viral) ====================
export function calculateSmartAvgViews(reelViews = []) {
    if (!reelViews.length) return 0
    const last10 = reelViews.slice(-10)
    if (last10.length < 3) return Math.round(last10.reduce((s, v) => s + v, 0) / last10.length)

    const sorted = [...last10].sort((a, b) => a - b)
    const median = sorted[Math.floor(sorted.length / 2)]
    const threshold = median * 2.5
    const filtered = last10.filter(v => v <= threshold)
    if (!filtered.length) return Math.round(median)
    return Math.round(filtered.reduce((s, v) => s + v, 0) / filtered.length)
}

export function calculateSuggestedCPV(avgViews, cpvRate = 0.5) {
    return Math.round(avgViews * cpvRate)
}

// ==================== CREATORS CRUD (async, API-backed) ====================
export async function getCreators(filters = {}) {
    return apiWithFallback(
        async () => {
            const params = new URLSearchParams()
            if (filters.platform) params.set('platform', filters.platform)
            if (filters.niche) params.set('niche', filters.niche)
            if (filters.status) params.set('status', filters.status)
            if (filters.city) params.set('city', filters.city)
            if (filters.search) params.set('search', filters.search)
            const qs = params.toString()
            const res = await api.get(`/influencer/creators${qs ? '?' + qs : ''}`)
            const creators = (res.data || res).map(normalizeCreator)
            // Cache in localStorage for offline access
            setStore(STORAGE_KEYS.creators, creators)
            return creators
        },
        () => {
            let creators = getStore(STORAGE_KEYS.creators, [])
            creators = creators.map(c => ({
                ...c,
                avgViews: calculateSmartAvgViews(c.reelViews || []),
                suggestedCPV: calculateSuggestedCPV(calculateSmartAvgViews(c.reelViews || []))
            }))
            if (filters.platform) creators = creators.filter(c => c.platform === filters.platform)
            if (filters.niche) creators = creators.filter(c => c.niche === filters.niche)
            if (filters.status) creators = creators.filter(c => c.status === filters.status)
            if (filters.city) creators = creators.filter(c => c.city === filters.city)
            if (filters.label) creators = creators.filter(c => c.labels?.includes(filters.label))
            if (filters.search) {
                const s = filters.search.toLowerCase()
                creators = creators.filter(c =>
                    c.name?.toLowerCase().includes(s) ||
                    c.handle?.toLowerCase().includes(s) ||
                    c.niche?.toLowerCase().includes(s) ||
                    c.city?.toLowerCase().includes(s)
                )
            }
            return creators
        }
    )
}

export async function getCreator(id) {
    return apiWithFallback(
        async () => {
            const res = await api.get(`/influencer/creators/${id}`)
            return normalizeCreator(res.data || res)
        },
        () => {
            const creators = getStore(STORAGE_KEYS.creators, [])
            const c = creators.find(c => c.id == id)
            return c ? { ...c, avgViews: calculateSmartAvgViews(c.reelViews || []), suggestedCPV: calculateSuggestedCPV(calculateSmartAvgViews(c.reelViews || [])) } : null
        }
    )
}

export async function createCreator(data) {
    return apiWithFallback(
        async () => {
            const res = await api.post('/influencer/creators', data)
            return normalizeCreator(res.data || res)
        },
        () => {
            const creators = getStore(STORAGE_KEYS.creators, [])
            const newCreator = {
                ...data,
                id: genId('cr'),
                reelViews: data.reelViews || [],
                brandsWorkedWith: data.brandsWorkedWith || [],
                negotiationNotes: data.negotiationNotes || '',
                labels: data.labels || [],
                dealHistory: [],
                status: data.status || 'Cold',
                createdAt: today(),
                updatedAt: today()
            }
            creators.push(newCreator)
            setStore(STORAGE_KEYS.creators, creators)
            return newCreator
        }
    )
}

export async function updateCreator(id, data) {
    return apiWithFallback(
        async () => {
            const res = await api.put(`/influencer/creators/${id}`, data)
            return normalizeCreator(res.data || res)
        },
        () => {
            const creators = getStore(STORAGE_KEYS.creators, [])
            const index = creators.findIndex(c => c.id == id)
            if (index === -1) return null
            creators[index] = { ...creators[index], ...data, updatedAt: today() }
            setStore(STORAGE_KEYS.creators, creators)
            return creators[index]
        }
    )
}

export async function deleteCreator(id) {
    return apiWithFallback(
        async () => {
            await api.delete(`/influencer/creators/${id}`)
            return true
        },
        () => {
            const creators = getStore(STORAGE_KEYS.creators, []).filter(c => c.id != id)
            setStore(STORAGE_KEYS.creators, creators)
            return true
        }
    )
}

export async function addDealToCreator(creatorId, deal) {
    return apiWithFallback(
        async () => {
            const res = await api.post(`/influencer/creators/${creatorId}/deals`, deal)
            return res.data || res
        },
        () => {
            const creators = getStore(STORAGE_KEYS.creators, [])
            const index = creators.findIndex(c => c.id == creatorId)
            if (index === -1) return null
            const newDeal = { ...deal, id: genId('deal') }
            creators[index].dealHistory = [...(creators[index].dealHistory || []), newDeal]
            creators[index].updatedAt = today()
            setStore(STORAGE_KEYS.creators, creators)
            return newDeal
        }
    )
}

// ==================== LABELS CRUD ====================
export function getLabels() {
    return getStore(STORAGE_KEYS.labels, initialLabels)
}

export function createLabel(data) {
    const labels = getStore(STORAGE_KEYS.labels, initialLabels)
    const newLabel = { ...data, id: genId('lbl') }
    labels.push(newLabel)
    setStore(STORAGE_KEYS.labels, labels)
    return newLabel
}

export function deleteLabel(id) {
    const labels = getStore(STORAGE_KEYS.labels, initialLabels).filter(l => l.id !== id)
    setStore(STORAGE_KEYS.labels, labels)
    return true
}

// ==================== CAMPAIGNS CRUD (async, API-backed) ====================
export async function getCampaigns(filters = {}) {
    return apiWithFallback(
        async () => {
            const params = new URLSearchParams()
            if (filters.status) params.set('status', filters.status)
            if (filters.brand) params.set('brand', filters.brand)
            if (filters.platform) params.set('platform', filters.platform)
            const qs = params.toString()
            const res = await api.get(`/influencer/campaigns${qs ? '?' + qs : ''}`)
            const campaigns = res.data || res
            setStore(STORAGE_KEYS.campaigns, campaigns)
            return campaigns
        },
        () => {
            let campaigns = getStore(STORAGE_KEYS.campaigns, [])
            if (filters.status) campaigns = campaigns.filter(c => c.status === filters.status)
            if (filters.brand) campaigns = campaigns.filter(c => c.brand?.toLowerCase().includes(filters.brand.toLowerCase()))
            if (filters.platform) campaigns = campaigns.filter(c => c.platform === filters.platform)
            return campaigns
        }
    )
}

export async function getCampaign(id) {
    return apiWithFallback(
        async () => {
            const res = await api.get(`/influencer/campaigns/${id}`)
            return res.data || res
        },
        () => {
            const campaigns = getStore(STORAGE_KEYS.campaigns, [])
            return campaigns.find(c => c.id == id) || null
        }
    )
}

export async function createCampaign(data) {
    return apiWithFallback(
        async () => {
            const res = await api.post('/influencer/campaigns', data)
            return res.data || res
        },
        () => {
            const campaigns = getStore(STORAGE_KEYS.campaigns, [])
            const newCampaign = {
                ...data,
                id: genId('camp'),
                creators: data.creators || [],
                spent: 0,
                status: data.status || 'Planning',
                createdAt: today(),
                updatedAt: today()
            }
            campaigns.push(newCampaign)
            setStore(STORAGE_KEYS.campaigns, campaigns)
            return newCampaign
        }
    )
}

export async function updateCampaign(id, data) {
    return apiWithFallback(
        async () => {
            const res = await api.put(`/influencer/campaigns/${id}`, data)
            return res.data || res
        },
        () => {
            const campaigns = getStore(STORAGE_KEYS.campaigns, [])
            const index = campaigns.findIndex(c => c.id == id)
            if (index === -1) return null
            campaigns[index] = { ...campaigns[index], ...data, updatedAt: today() }
            setStore(STORAGE_KEYS.campaigns, campaigns)
            return campaigns[index]
        }
    )
}

export async function deleteCampaign(id) {
    return apiWithFallback(
        async () => {
            await api.delete(`/influencer/campaigns/${id}`)
            return true
        },
        () => {
            const campaigns = getStore(STORAGE_KEYS.campaigns, []).filter(c => c.id != id)
            setStore(STORAGE_KEYS.campaigns, campaigns)
            return true
        }
    )
}

export async function addCreatorToCampaign(campaignId, creatorData) {
    return apiWithFallback(
        async () => {
            const res = await api.post(`/influencer/campaigns/${campaignId}/creators`, creatorData)
            return res.data || res
        },
        () => {
            const campaigns = getStore(STORAGE_KEYS.campaigns, [])
            const index = campaigns.findIndex(c => c.id == campaignId)
            if (index === -1) return null
            campaigns[index].creators.push(creatorData)
            campaigns[index].updatedAt = today()
            setStore(STORAGE_KEYS.campaigns, campaigns)
            return campaigns[index]
        }
    )
}

export async function updateCampaignCreator(campaignId, creatorId, data) {
    return apiWithFallback(
        async () => {
            const res = await api.put(`/influencer/campaigns/${campaignId}/creators/${creatorId}`, data)
            return res.data || res
        },
        () => {
            const campaigns = getStore(STORAGE_KEYS.campaigns, [])
            const cIndex = campaigns.findIndex(c => c.id == campaignId)
            if (cIndex === -1) return null
            const crIndex = campaigns[cIndex].creators.findIndex(cr => cr.creatorId == creatorId)
            if (crIndex === -1) return null
            campaigns[cIndex].creators[crIndex] = { ...campaigns[cIndex].creators[crIndex], ...data }
            campaigns[cIndex].updatedAt = today()
            setStore(STORAGE_KEYS.campaigns, campaigns)
            return campaigns[cIndex]
        }
    )
}

// ==================== OUTREACH CRUD ====================
export function getOutreachList(filters = {}) {
    let outreach = getStore(STORAGE_KEYS.outreach, initialOutreach)
    if (filters.status) outreach = outreach.filter(o => o.status === filters.status)
    if (filters.channel) outreach = outreach.filter(o => o.channel === filters.channel)
    return outreach
}

export function createOutreach(data) {
    const outreach = getStore(STORAGE_KEYS.outreach, initialOutreach)
    const newOutreach = {
        ...data,
        id: genId('out'),
        messages: data.messages || [],
        followUps: data.followUps || [],
        lastReply: null,
        status: 'Draft',
        createdAt: today()
    }
    outreach.push(newOutreach)
    setStore(STORAGE_KEYS.outreach, outreach)
    return newOutreach
}

export function updateOutreach(id, data) {
    const outreach = getStore(STORAGE_KEYS.outreach, initialOutreach)
    const index = outreach.findIndex(o => o.id === id)
    if (index === -1) return null
    outreach[index] = { ...outreach[index], ...data }
    setStore(STORAGE_KEYS.outreach, outreach)
    return outreach[index]
}

export function deleteOutreach(id) {
    const outreach = getStore(STORAGE_KEYS.outreach, initialOutreach).filter(o => o.id !== id)
    setStore(STORAGE_KEYS.outreach, outreach)
    return true
}

// ==================== CONTENT SCHEDULE CRUD ====================
export function getContentSchedule(filters = {}) {
    let schedule = getStore(STORAGE_KEYS.contentSchedule, initialContentSchedule)
    if (filters.campaignId) schedule = schedule.filter(s => s.campaignId === filters.campaignId)
    if (filters.creatorId) schedule = schedule.filter(s => s.creatorId === filters.creatorId)
    if (filters.status) schedule = schedule.filter(s => s.status === filters.status)
    if (filters.platform) schedule = schedule.filter(s => s.platform === filters.platform)
    return schedule
}

export function createContentScheduleItem(data) {
    const schedule = getStore(STORAGE_KEYS.contentSchedule, initialContentSchedule)
    const newItem = {
        ...data,
        id: genId('cs'),
        status: data.status || 'Draft',
    }
    schedule.push(newItem)
    setStore(STORAGE_KEYS.contentSchedule, schedule)
    return newItem
}

export function updateContentScheduleItem(id, data) {
    const schedule = getStore(STORAGE_KEYS.contentSchedule, initialContentSchedule)
    const index = schedule.findIndex(s => s.id === id)
    if (index === -1) return null
    schedule[index] = { ...schedule[index], ...data }
    setStore(STORAGE_KEYS.contentSchedule, schedule)
    return schedule[index]
}

export function deleteContentScheduleItem(id) {
    const schedule = getStore(STORAGE_KEYS.contentSchedule, initialContentSchedule).filter(s => s.id !== id)
    setStore(STORAGE_KEYS.contentSchedule, schedule)
    return true
}

// ==================== INVOICES CRUD ====================
export function getInvoices(filters = {}) {
    let invoices = getStore(STORAGE_KEYS.invoices, initialInvoices)
    if (filters.status) invoices = invoices.filter(i => i.status === filters.status)
    if (filters.creatorId) invoices = invoices.filter(i => i.creatorId === filters.creatorId)
    if (filters.campaignId) invoices = invoices.filter(i => i.campaignId === filters.campaignId)
    return invoices
}

export function createInvoice(data) {
    const invoices = getStore(STORAGE_KEYS.invoices, initialInvoices)
    const count = invoices.length + 1
    const newInvoice = {
        ...data,
        id: genId('inv'),
        invoiceNumber: `INF-2026-${String(count).padStart(3, '0')}`,
        gst: Math.round(data.amount * 0.18),
        tds: Math.round(data.amount * 0.10),
        totalPayable: Math.round(data.amount * 1.18 - data.amount * 0.10),
        status: data.status || 'Pending',
        paidDate: null,
        paymentMethod: null,
    }
    invoices.push(newInvoice)
    setStore(STORAGE_KEYS.invoices, invoices)
    return newInvoice
}

export function updateInvoice(id, data) {
    const invoices = getStore(STORAGE_KEYS.invoices, initialInvoices)
    const index = invoices.findIndex(i => i.id === id)
    if (index === -1) return null
    invoices[index] = { ...invoices[index], ...data }
    setStore(STORAGE_KEYS.invoices, invoices)
    return invoices[index]
}

// ==================== SALES LEADS CRUD ====================
export function getSalesLeads(filters = {}) {
    let leads = getStore(STORAGE_KEYS.salesLeads, initialSalesLeads)
    if (filters.status) leads = leads.filter(l => l.status === filters.status)
    if (filters.industry) leads = leads.filter(l => l.industry === filters.industry)
    if (filters.stage) leads = leads.filter(l => l.stage === filters.stage)
    return leads
}

export function createSalesLead(data) {
    const leads = getStore(STORAGE_KEYS.salesLeads, initialSalesLeads)
    const newLead = {
        ...data,
        id: genId('sl'),
        status: data.status || 'New',
        stage: data.stage || 'Discovery',
        probability: data.probability || 20,
        createdAt: today(),
    }
    leads.push(newLead)
    setStore(STORAGE_KEYS.salesLeads, leads)
    return newLead
}

export function updateSalesLead(id, data) {
    const leads = getStore(STORAGE_KEYS.salesLeads, initialSalesLeads)
    const index = leads.findIndex(l => l.id === id)
    if (index === -1) return null
    leads[index] = { ...leads[index], ...data }
    setStore(STORAGE_KEYS.salesLeads, leads)
    return leads[index]
}

export function deleteSalesLead(id) {
    const leads = getStore(STORAGE_KEYS.salesLeads, initialSalesLeads).filter(l => l.id !== id)
    setStore(STORAGE_KEYS.salesLeads, leads)
    return true
}

// ==================== CAMPAIGN GENERATOR ====================
export function generateCampaignIdea(input) {
    const { brandName, industry, budget, objective, platform } = input
    const budgetNum = Number(budget) || 300000
    const isLowBudget = budgetNum < 200000
    const isMidBudget = budgetNum >= 200000 && budgetNum < 500000
    const isHighBudget = budgetNum >= 500000

    const creatorMix = isLowBudget
        ? [{ type: 'Micro (10K-50K)', count: 5, costEach: Math.round(budgetNum * 0.15) },
           { type: 'Nano (1K-10K)', count: 8, costEach: Math.round(budgetNum * 0.04) }]
        : isMidBudget
        ? [{ type: 'Mid (50K-200K)', count: 3, costEach: Math.round(budgetNum * 0.18) },
           { type: 'Micro (10K-50K)', count: 5, costEach: Math.round(budgetNum * 0.08) }]
        : [{ type: 'Macro (200K-1M)', count: 2, costEach: Math.round(budgetNum * 0.2) },
           { type: 'Mid (50K-200K)', count: 4, costEach: Math.round(budgetNum * 0.1) },
           { type: 'Micro (10K-50K)', count: 6, costEach: Math.round(budgetNum * 0.03) }]

    const objectiveAngles = {
        'Brand Awareness': [
            `${brandName} x Creator Challenge - Start a relatable trend around everyday ${industry.toLowerCase()} moments`,
            `"Day in My Life with ${brandName}" series - Authentic lifestyle integration`,
            `Before/After transformation content showcasing ${brandName}'s impact`,
        ],
        'Product Launch': [
            `Exclusive unboxing & first impressions series with ${brandName}`,
            `Creator vs Creator comparison content featuring the new product`,
            `"Real People, Real Reviews" - Honest first reactions from ${platform} creators`,
        ],
        'App Downloads': [
            `"You won't believe this hack" - Show hidden features of ${brandName} app`,
            `Creator challenge: Complete a task using ONLY the ${brandName} app`,
            `Collab reels showing real savings/results from using ${brandName}`,
        ],
        'Lead Generation': [
            `Expert tips series: Industry insights powered by ${brandName}`,
            `Case study content: How ${brandName} solved real problems`,
            `Q&A sessions featuring ${brandName}'s solutions in ${industry.toLowerCase()}`,
        ],
        'Sales': [
            `Limited-time creator discount codes with ${brandName}`,
            `"Why I switched to ${brandName}" - Genuine testimonial content`,
            `Festive/seasonal campaign tie-in with ${brandName} products`,
        ],
    }

    const angles = objectiveAngles[objective] || objectiveAngles['Brand Awareness']
    const campaignName = `${brandName} x ${platform} ${objective} Campaign`

    const totalCreatorCost = creatorMix.reduce((s, m) => s + (m.count * m.costEach), 0)
    const platformCost = Math.round(budgetNum * 0.15)
    const agencyFee = Math.round(budgetNum * 0.10)

    const costSplit = [
        { item: 'Creator Fees', amount: totalCreatorCost },
        { item: 'Platform/Boosting', amount: platformCost },
        { item: 'Agency Fee', amount: agencyFee },
        { item: 'Buffer', amount: budgetNum - totalCreatorCost - platformCost - agencyFee },
    ]

    const deliverables = platform === 'YouTube'
        ? ['Dedicated Videos', 'YouTube Shorts', 'Community Posts', 'Pinned Comments']
        : ['Reels', 'Stories', 'Static Posts', 'Carousel Posts']

    const emailPitch = `Hi Team ${brandName},

We are a creator marketing agency specialising in ${industry.toLowerCase()} brands on ${platform}. We've put together a campaign idea for ${brandName} focused on ${objective.toLowerCase()}.

Campaign: "${campaignName}"
Our approach involves ${creatorMix.map(m => `${m.count} ${m.type} creators`).join(' + ')} creating authentic ${deliverables.slice(0, 2).join(' & ').toLowerCase()} content. Total budget: ₹${(budgetNum / 100000).toFixed(1)}L.

The campaign will drive real engagement through relatable, ${industry.toLowerCase()}-focused content that resonates with your target audience.

Would love to discuss this further. Available for a quick call this week?

Warm regards,
[Your Name]`

    const whatsAppPitch = `Hey! 👋 We've got an exciting ${platform} campaign idea for ${brandName} - ${creatorMix.map(m => `${m.count} ${m.type.split(' ')[0]} creators`).join(' + ')} creating ${deliverables[0].toLowerCase()} content focused on ${objective.toLowerCase()}. Budget: ₹${(budgetNum / 100000).toFixed(1)}L. Can we do a quick call?`

    return {
        campaignName,
        contentAngles: angles,
        creatorMix,
        costSplit,
        deliverables,
        emailPitch,
        whatsAppPitch,
        totalBudget: budgetNum,
    }
}

// ==================== COLD MESSAGE GENERATOR ====================
export function generateColdMessages(creatorName, brand, platform = 'Email') {
    const openers = [
        `Hi ${creatorName}! Been following your content and absolutely love the authenticity. We're working with ${brand} on something exciting and your style is a perfect match. Would love to chat!`,
        `Hey ${creatorName}! Quick one - ${brand} is launching a creator campaign and your audience aligns perfectly with their TG. Interested in hearing more?`,
        `Hello ${creatorName}! ${brand} is looking for creators who can tell genuine stories, and your content immediately came to mind. Would you be open to a collab conversation?`,
    ]

    const followUps = [
        `Hey ${creatorName}, just circling back on the ${brand} opportunity. No pressure at all - just wanted to make sure this didn't get buried. Let me know if you're keen and I'll share the brief!`,
        `Hi ${creatorName}! Following up on my last message about ${brand}. Happy to share more details or hop on a quick 5-min call. What works for you?`,
    ]

    return { openers, followUps }
}

// ==================== CREATOR VERIFICATION & SCORING ====================
export function getCreatorTier(followerCount) {
    if (followerCount >= 1000000) return 'mega'
    if (followerCount >= 100000) return 'macro'
    if (followerCount >= 10000) return 'micro'
    return 'nano'
}

export function getCreatorTierLabel(tier) {
    return { nano: 'Nano (1K-10K)', micro: 'Micro (10K-100K)', macro: 'Macro (100K-1M)', mega: 'Mega (1M+)' }[tier] || tier
}

export function getCreatorTierColor(tier) {
    return { nano: '#6b7280', micro: '#3b82f6', macro: '#8b5cf6', mega: '#f59e0b' }[tier] || '#6b7280'
}

export function calculateCreatorScore(creator) {
    // Engagement rate (40%) - based on avgViews/followers ratio
    const avgViews = calculateSmartAvgViews(creator.reelViews)
    const engagementRate = creator.followers > 0 ? (avgViews / creator.followers) : 0
    const engagementScore = Math.min(engagementRate * 10, 1) * 40 // 10%+ engagement = perfect score

    // Audience quality (30%) - based on follower count tiers
    const tier = getCreatorTier(creator.followers)
    const tierScores = { nano: 15, micro: 22, macro: 27, mega: 30 }
    const audienceScore = tierScores[tier] || 15

    // Reliability (20%) - based on deal completion history
    const deals = creator.dealHistory || []
    const completedDeals = deals.filter(d => d.status === 'Completed').length
    const totalDeals = deals.length
    const reliabilityRate = totalDeals > 0 ? completedDeals / totalDeals : 0.5
    const reliabilityScore = reliabilityRate * 20

    // Profile completeness (10%) - based on fields filled
    let filled = 0
    if (creator.name) filled++
    if (creator.handle) filled++
    if (creator.contactEmail) filled++
    if (creator.contactWhatsApp) filled++
    if (creator.niche) filled++
    if (creator.city) filled++
    if (creator.brandsWorkedWith?.length) filled++
    if (creator.reelViews?.length) filled++
    const completenessScore = (filled / 8) * 10

    const total = Math.round(engagementScore + audienceScore + reliabilityScore + completenessScore)
    return {
        total: Math.min(total, 100),
        engagement: Math.round(engagementScore / 40 * 100),
        audienceQuality: Math.round(audienceScore / 30 * 100),
        reliability: Math.round(reliabilityScore / 20 * 100),
        completeness: Math.round(completenessScore / 10 * 100),
    }
}

export async function verifyCreator(creatorId, status = 'verified') {
    return updateCreator(creatorId, { verificationStatus: status })
}

export async function getCreatorsWithScores(filters = {}) {
    const creators = await getCreators(filters)
    return creators.map(c => ({
        ...c,
        creatorTier: getCreatorTier(c.followers),
        creatorScore: calculateCreatorScore(c),
        verificationStatus: c.verificationStatus || 'unverified'
    }))
}

// ==================== CAMPAIGN BRIEF TEMPLATES ====================
const briefTemplates = [
    {
        id: 'tpl-product-launch',
        name: 'Product Launch',
        icon: '🚀',
        objective: 'Product Launch',
        brief: 'Create excitement around the new product launch. Focus on unboxing, first impressions, and key features. Show authentic reactions and usage in daily life.',
        contentSpecs: { postType: 'Reel', hashtags: ['#NewLaunch', '#Unboxing', '#FirstLook'], mentions: [] },
        deliverables: ['1 Unboxing Reel', '2 Stories', '1 Static Post'],
        messaging: 'Focus on genuine reactions, highlight key features, show real-life usage.',
        duration: '2 weeks',
    },
    {
        id: 'tpl-brand-awareness',
        name: 'Brand Awareness',
        icon: '📢',
        objective: 'Brand Awareness',
        brief: 'Introduce the brand to a wider audience through authentic storytelling. Creators should naturally integrate the brand into their lifestyle content.',
        contentSpecs: { postType: 'Reel', hashtags: ['#Ad', '#BrandPartner'], mentions: [] },
        deliverables: ['2 Reels', '3 Stories', '1 Carousel'],
        messaging: 'Natural integration, storytelling approach, show brand values.',
        duration: '3 weeks',
    },
    {
        id: 'tpl-sales-promo',
        name: 'Sales Promo',
        icon: '💰',
        objective: 'Sales',
        brief: 'Drive direct sales with creator discount codes and limited-time offers. Include clear CTAs and show product benefits with testimonials.',
        contentSpecs: { postType: 'Reel', hashtags: ['#Sale', '#Deal', '#LimitedOffer'], mentions: [] },
        deliverables: ['1 Reel with CTA', '2 Stories with Swipe-Up', '1 Post'],
        messaging: 'Clear CTA, discount code, urgency, testimonial style.',
        duration: '1 week',
    },
    {
        id: 'tpl-event-sponsorship',
        name: 'Event Sponsorship',
        icon: '🎪',
        objective: 'Brand Awareness',
        brief: 'Cover the sponsored event with behind-the-scenes content, live updates, and post-event recaps. Tag the brand and event in all posts.',
        contentSpecs: { postType: 'Story', hashtags: ['#Event', '#Sponsored'], mentions: [] },
        deliverables: ['5+ Stories', '1 Reel Recap', '2 Static Posts'],
        messaging: 'Live coverage, BTS content, event highlights, brand visibility.',
        duration: '3 days',
    },
    {
        id: 'tpl-app-downloads',
        name: 'App Downloads',
        icon: '📱',
        objective: 'App Downloads',
        brief: 'Show the app in action with screen recordings, features walkthrough, and real user benefits. Include download link in bio/swipe-up.',
        contentSpecs: { postType: 'Reel', hashtags: ['#App', '#TechTip', '#HowTo'], mentions: [] },
        deliverables: ['1 Demo Reel', '2 Stories', '1 Feature Walkthrough'],
        messaging: 'Show features, real benefits, easy tutorial style.',
        duration: '2 weeks',
    },
]

export function getBriefTemplates() { return briefTemplates }

export function getBriefTemplate(id) { return briefTemplates.find(t => t.id === id) || null }

export function applyBriefTemplate(templateId, brandName = '', platformOverride = '') {
    const template = getBriefTemplate(templateId)
    if (!template) return null
    return {
        brief: template.brief.replace(/the brand/g, brandName || 'the brand'),
        objective: template.objective,
        contentSpecs: {
            ...template.contentSpecs,
            mentions: brandName ? [`@${brandName.toLowerCase().replace(/\s+/g, '')}`] : [],
        },
        deliverables: template.deliverables,
        messaging: template.messaging,
        duration: template.duration,
    }
}

// ==================== CAMPAIGN COMPARISON ====================
export async function compareCampaigns(campaignIds) {
    const all = await getCampaigns()
    return campaignIds.map(id => {
        const c = all.find(camp => camp.id === id)
        if (!c) return null
        const creators = c.creators || []
        const totalViews = creators.reduce((s, cr) => s + (cr.contentInsights?.views || 0), 0)
        const totalLikes = creators.reduce((s, cr) => s + (cr.contentInsights?.likes || 0), 0)
        const totalComments = creators.reduce((s, cr) => s + (cr.contentInsights?.comments || 0), 0)
        const totalShares = creators.reduce((s, cr) => s + (cr.contentInsights?.shares || 0), 0)
        const totalEngagement = totalLikes + totalComments + totalShares
        const cpe = totalEngagement > 0 ? Math.round(c.spent / totalEngagement) : 0
        const roi = c.spent > 0 ? ((totalEngagement * 2 - c.spent) / c.spent * 100).toFixed(1) : 0
        return {
            ...c,
            metrics: { views: totalViews, likes: totalLikes, comments: totalComments, shares: totalShares, engagement: totalEngagement },
            cpe,
            roi,
            budgetUtilization: c.budget > 0 ? Math.round(c.spent / c.budget * 100) : 0
        }
    }).filter(Boolean)
}

export async function getCampaignROI(campaignId) {
    const result = await compareCampaigns([campaignId])
    return result.length ? { roi: result[0].roi, cpe: result[0].cpe } : { roi: 0, cpe: 0 }
}

// ==================== STATS (async, API-backed) ====================
export async function getInfluencerStats() {
    return apiWithFallback(
        async () => {
            const res = await api.get('/influencer/stats')
            return res.data || res
        },
        async () => {
            const creators = await getCreators()
            const campaigns = await getCampaigns()
            const invoices = getInvoices()
            const salesLeads = getSalesLeads()
            const outreach = getOutreachList()

            const totalCreators = creators.length
            const activeCampaigns = campaigns.filter(c => c.status === 'Active').length
            const totalCampaignBudget = campaigns.reduce((s, c) => s + (c.budget || 0), 0)
            const totalSpent = campaigns.reduce((s, c) => s + (c.spent || 0), 0)
            const totalInvoiceValue = invoices.reduce((s, i) => s + i.amount, 0)
            const pendingPayments = invoices.filter(i => i.status === 'Pending').reduce((s, i) => s + i.totalPayable, 0)
            const pipelineValue = salesLeads.reduce((s, l) => s + (l.dealValue * l.probability / 100), 0)
            const pendingOutreach = outreach.filter(o => o.status === 'Sent' || o.status === 'Draft').length

            const creatorsByStatus = {}
            creators.forEach(c => { creatorsByStatus[c.status] = (creatorsByStatus[c.status] || 0) + 1 })

            const creatorsByPlatform = {}
            creators.forEach(c => { creatorsByPlatform[c.platform] = (creatorsByPlatform[c.platform] || 0) + 1 })

            return {
                totalCreators,
                activeCampaigns,
                totalCampaignBudget,
                totalSpent,
                totalInvoiceValue,
                pendingPayments,
                pipelineValue,
                pendingOutreach,
                creatorsByStatus,
                creatorsByPlatform,
            }
        }
    )
}

// ==================== PLATFORM API INTEGRATION ====================

// Get configured platforms
export async function getPlatformConfigs() {
    return apiWithFallback(
        async () => {
            const res = await api.get('/influencer/platforms')
            const configs = res.data || res
            setStore(STORAGE_KEYS.platformConfigs, configs)
            return configs
        },
        () => getStore(STORAGE_KEYS.platformConfigs, [])
    )
}

// Configure a platform's API credentials
export async function configurePlatform(data) {
    const res = await api.post('/influencer/platforms', data)
    return res.data || res
}

// Remove a platform config
export async function removePlatformConfig(platform) {
    await api.delete(`/influencer/platforms/${platform}`)
    return true
}

// Get OAuth URL for a platform
export async function getOAuthUrl(platform, redirectUri) {
    const params = new URLSearchParams()
    if (redirectUri) params.set('redirectUri', redirectUri)
    const qs = params.toString()
    const res = await api.get(`/influencer/oauth/url/${platform}${qs ? '?' + qs : ''}`)
    return res.data || res
}

// Handle OAuth callback
export async function handleOAuthCallback(platform, code, state) {
    const res = await api.get(`/influencer/oauth/callback/${platform}?code=${encodeURIComponent(code)}${state ? '&state=' + encodeURIComponent(state) : ''}`)
    return res.data || res
}

// Add a social account to a creator
export async function addSocialAccount(creatorId, data) {
    const res = await api.post(`/influencer/creators/${creatorId}/social-accounts`, data)
    return res.data || res
}

// Remove a social account
export async function removeSocialAccount(accountId) {
    await api.delete(`/influencer/social-accounts/${accountId}`)
    return true
}

// Sync a single social account from its platform API
export async function syncSocialAccount(accountId) {
    const res = await api.post(`/influencer/social-accounts/${accountId}/sync`)
    return res.data || res
}

// Sync all social accounts for a creator
export async function syncCreator(creatorId) {
    const res = await api.post(`/influencer/creators/${creatorId}/sync`)
    return res.data || res
}

// Sync ALL creators across all platforms
export async function syncAllCreators() {
    const res = await api.post('/influencer/sync/all')
    return res.data || res
}

// Lookup a public profile from a platform (no OAuth needed for YouTube/Twitter)
export async function lookupPlatformProfile(platform, handle) {
    const res = await api.get(`/influencer/lookup/${platform}/${encodeURIComponent(handle)}`)
    return res.data || res
}

// Import a creator from platform lookup data directly into DB
export async function importFromPlatform(data) {
    const res = await api.post('/influencer/creators/import-from-platform', data)
    return normalizeCreator(res.data || res)
}

// Get content posts for a social account
export async function getSocialAccountPosts(accountId, params = {}) {
    const qs = new URLSearchParams(params).toString()
    const res = await api.get(`/influencer/social-accounts/${accountId}/posts${qs ? '?' + qs : ''}`)
    return res.data || res
}

// Get all posts for a creator across all accounts
export async function getCreatorPosts(creatorId, params = {}) {
    const qs = new URLSearchParams(params).toString()
    const res = await api.get(`/influencer/creators/${creatorId}/posts${qs ? '?' + qs : ''}`)
    return res.data || res
}

// Get analytics snapshots for a creator
export async function getCreatorAnalytics(creatorId, params = {}) {
    const qs = new URLSearchParams(params).toString()
    const res = await api.get(`/influencer/creators/${creatorId}/analytics${qs ? '?' + qs : ''}`)
    return res.data || res
}

// Get deal history for a creator
export async function getCreatorDeals(creatorId) {
    const res = await api.get(`/influencer/creators/${creatorId}/deals`)
    return res.data || res
}

// Update a deal
export async function updateDeal(dealId, data) {
    const res = await api.put(`/influencer/deals/${dealId}`, data)
    return res.data || res
}

export async function toggleCreatorTracking(creatorId, tracked) {
    try {
        if (tracked) {
            await api.post(`/influencer/creators/${creatorId}/track`, {})
        } else {
            await api.delete(`/influencer/creators/${creatorId}/track`)
        }
        const creators = getStore(STORAGE_KEYS.creators, [])
        const idx = creators.findIndex(c => c.id === creatorId)
        if (idx !== -1) {
            creators[idx].tracked = tracked
            setStore(STORAGE_KEYS.creators, creators)
        }
        return { id: creatorId, tracked }
    } catch (err) {
        console.error('Toggle tracking error:', err.message)
        return null
    }
}

export async function getCreatorGrowth(creatorId, days = 90) {
    const res = await api.get(`/influencer/creators/${creatorId}/growth?days=${days}`)
    return res
}

export async function getCreatorEngagementQuality(creatorId) {
    const res = await api.get(`/influencer/creators/${creatorId}/engagement-quality`)
    return res
}

export async function getCreatorRateCard(creatorId) {
    const res = await api.get(`/influencer/creators/${creatorId}/rate-card`)
    return res
}

export async function getCreatorAnomalies(creatorId) {
    const res = await api.get(`/influencer/creators/${creatorId}/anomalies`)
    return res
}

export async function getCreatorPerformanceSummary(creatorId) {
    const res = await api.get(`/influencer/creators/${creatorId}/performance-summary`)
    return res
}
