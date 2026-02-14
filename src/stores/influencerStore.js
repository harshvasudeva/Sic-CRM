// Influencer Marketing Store with localStorage persistence

const STORAGE_KEYS = {
    creators: 'sic-influencer-creators',
    campaigns: 'sic-influencer-campaigns',
    deals: 'sic-influencer-deals',
    outreach: 'sic-influencer-outreach',
    contentSchedule: 'sic-influencer-content-schedule',
    invoices: 'sic-influencer-invoices',
    salesLeads: 'sic-influencer-sales-leads',
    labels: 'sic-influencer-labels'
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

// ==================== LABELS ====================
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

// ==================== CREATORS ====================
const initialCreators = [
    {
        id: 'cr-001',
        name: 'Priya Sharma',
        platform: 'Instagram',
        handle: '@priyasharma_lifestyle',
        followers: 520000,
        avgViews: 45000,
        reelViews: [42000, 48000, 51000, 39000, 44000, 47000, 50000, 43000, 46000, 41000],
        niche: 'Lifestyle',
        city: 'Mumbai',
        contactWhatsApp: '+91-98765-43210',
        contactEmail: 'priya@creators.in',
        lastQuotedRate: 80000,
        lowestClosedRate: 55000,
        suggestedCPV: null,
        brandsWorkedWith: ['Nykaa', 'Mamaearth', 'Sugar Cosmetics'],
        negotiationNotes: 'Prefers 50% advance. Flexible on deliverables for long-term brands.',
        status: 'Closed',
        labels: ['lbl-1', 'lbl-8'],
        dealHistory: [
            { id: 'deal-001', brand: 'Nykaa', amount: 60000, date: '2025-11-15', deliverables: '2 Reels + 3 Stories', status: 'Completed' },
            { id: 'deal-002', brand: 'Mamaearth', amount: 55000, date: '2025-12-20', deliverables: '1 Reel + 1 Static', status: 'Completed' },
        ],
        createdAt: '2025-10-01',
        updatedAt: '2026-01-10'
    },
    {
        id: 'cr-002',
        name: 'Rohan Verma',
        platform: 'YouTube',
        handle: '@TechRohan',
        followers: 1200000,
        avgViews: 180000,
        reelViews: [175000, 190000, 165000, 185000, 200000, 170000, 195000, 180000, 160000, 188000],
        niche: 'Tech',
        city: 'Bangalore',
        contactWhatsApp: '+91-91234-56789',
        contactEmail: 'rohan@techcreators.com',
        lastQuotedRate: 250000,
        lowestClosedRate: 200000,
        suggestedCPV: null,
        brandsWorkedWith: ['Samsung', 'OnePlus', 'Boat'],
        negotiationNotes: 'Wants creative freedom. No script reading. Prefers product integration style.',
        status: 'Talking',
        labels: ['lbl-1', 'lbl-5'],
        dealHistory: [
            { id: 'deal-003', brand: 'Samsung', amount: 220000, date: '2025-09-10', deliverables: '1 Dedicated Video', status: 'Completed' },
        ],
        createdAt: '2025-08-15',
        updatedAt: '2026-01-14'
    },
    {
        id: 'cr-003',
        name: 'Ananya Reddy',
        platform: 'Instagram',
        handle: '@ananya_fitness',
        followers: 310000,
        avgViews: 28000,
        reelViews: [25000, 30000, 27000, 32000, 26000, 29000, 24000, 31000, 28000, 27000],
        niche: 'Fitness',
        city: 'Hyderabad',
        contactWhatsApp: '+91-87654-32109',
        contactEmail: 'ananya@fitmail.in',
        lastQuotedRate: 45000,
        lowestClosedRate: 30000,
        suggestedCPV: null,
        brandsWorkedWith: ['MuscleBlaze', 'Healthkart'],
        negotiationNotes: 'Open to barter. Responds slow on email, prefer WhatsApp.',
        status: 'Cold',
        labels: ['lbl-6'],
        dealHistory: [],
        createdAt: '2025-11-05',
        updatedAt: '2026-01-08'
    },
    {
        id: 'cr-004',
        name: 'Karthik Iyer',
        platform: 'YouTube',
        handle: '@FoodieKarthik',
        followers: 780000,
        avgViews: 95000,
        reelViews: [88000, 102000, 91000, 97000, 85000, 100000, 93000, 96000, 90000, 98000],
        niche: 'Food',
        city: 'Chennai',
        contactWhatsApp: '+91-76543-21098',
        contactEmail: 'karthik@foodvlog.in',
        lastQuotedRate: 150000,
        lowestClosedRate: 120000,
        suggestedCPV: null,
        brandsWorkedWith: ['Swiggy', 'Zomato', 'ITC'],
        negotiationNotes: 'Always negotiates hard. Give first offer at 1.3x to land at target.',
        status: 'Talking',
        labels: ['lbl-2'],
        dealHistory: [
            { id: 'deal-004', brand: 'Swiggy', amount: 130000, date: '2025-10-20', deliverables: '2 YouTube Videos', status: 'Completed' },
        ],
        createdAt: '2025-07-20',
        updatedAt: '2026-01-12'
    },
    {
        id: 'cr-005',
        name: 'Sneha Joshi',
        platform: 'Instagram',
        handle: '@sneha_travels',
        followers: 420000,
        avgViews: 38000,
        reelViews: [35000, 40000, 37000, 42000, 36000, 39000, 34000, 41000, 38000, 37000],
        niche: 'Travel',
        city: 'Delhi',
        contactWhatsApp: '+91-65432-10987',
        contactEmail: 'sneha@wanderlust.co',
        lastQuotedRate: 70000,
        lowestClosedRate: 50000,
        suggestedCPV: null,
        brandsWorkedWith: ['MakeMyTrip', 'Airbnb'],
        negotiationNotes: 'Ghosted last campaign midway. Be cautious. Get written commitment.',
        status: 'Ghosted',
        labels: ['lbl-3', 'lbl-7'],
        dealHistory: [
            { id: 'deal-005', brand: 'MakeMyTrip', amount: 55000, date: '2025-08-15', deliverables: '3 Reels + Blog', status: 'Partial' },
        ],
        createdAt: '2025-06-10',
        updatedAt: '2026-01-05'
    },
    {
        id: 'cr-006',
        name: 'Aditya Kapoor',
        platform: 'Instagram',
        handle: '@aditya_comedy',
        followers: 890000,
        avgViews: 120000,
        reelViews: [110000, 130000, 115000, 125000, 118000, 122000, 108000, 128000, 120000, 114000],
        niche: 'Comedy',
        city: 'Pune',
        contactWhatsApp: '+91-54321-09876',
        contactEmail: 'aditya@laughmail.com',
        lastQuotedRate: 180000,
        lowestClosedRate: 140000,
        suggestedCPV: null,
        brandsWorkedWith: ['Cred', 'Dunzo', 'Zepto'],
        negotiationNotes: 'Only does funny integration. No hard sells. Best for awareness campaigns.',
        status: 'Closed',
        labels: ['lbl-1', 'lbl-2', 'lbl-8'],
        dealHistory: [
            { id: 'deal-006', brand: 'Cred', amount: 150000, date: '2025-12-01', deliverables: '1 Reel + 2 Stories', status: 'Completed' },
            { id: 'deal-007', brand: 'Dunzo', amount: 140000, date: '2025-11-15', deliverables: '1 Reel', status: 'Completed' },
        ],
        createdAt: '2025-05-20',
        updatedAt: '2026-01-15'
    },
]

// ==================== CAMPAIGNS ====================
const initialCampaigns = [
    {
        id: 'camp-001',
        name: 'Nykaa Summer Glow',
        brand: 'Nykaa',
        status: 'Active',
        brief: 'Promote summer skincare range. Focus on SPF products and hydration routines.',
        platform: 'Instagram',
        budget: 500000,
        spent: 315000,
        startDate: '2026-01-01',
        endDate: '2026-02-28',
        objective: 'Brand Awareness',
        creators: [
            {
                creatorId: 'cr-001',
                deliverables: [
                    { type: 'Reel', quantity: 2, status: 'Delivered', dueDate: '2026-01-20' },
                    { type: 'Story', quantity: 3, status: 'Delivered', dueDate: '2026-01-25' },
                ],
                totalFee: 80000,
                paymentStatus: 'Paid',
                contentInsights: { views: 92000, likes: 8500, comments: 320, shares: 450 }
            },
            {
                creatorId: 'cr-003',
                deliverables: [
                    { type: 'Reel', quantity: 1, status: 'In Progress', dueDate: '2026-02-10' },
                    { type: 'Static', quantity: 2, status: 'Pending', dueDate: '2026-02-15' },
                ],
                totalFee: 35000,
                paymentStatus: 'Partial',
                contentInsights: null
            },
        ],
        createdAt: '2025-12-20',
        updatedAt: '2026-01-15'
    },
    {
        id: 'camp-002',
        name: 'OnePlus 14 Launch',
        brand: 'OnePlus',
        status: 'Planning',
        brief: 'Build hype around OnePlus 14 launch. Unboxing, first impressions, camera tests.',
        platform: 'YouTube',
        budget: 800000,
        spent: 0,
        startDate: '2026-02-15',
        endDate: '2026-03-31',
        objective: 'Product Launch',
        creators: [
            {
                creatorId: 'cr-002',
                deliverables: [
                    { type: 'Dedicated Video', quantity: 1, status: 'Pending', dueDate: '2026-03-01' },
                    { type: 'Shorts', quantity: 2, status: 'Pending', dueDate: '2026-03-10' },
                ],
                totalFee: 250000,
                paymentStatus: 'Unpaid',
                contentInsights: null
            },
        ],
        createdAt: '2026-01-10',
        updatedAt: '2026-01-14'
    },
    {
        id: 'camp-003',
        name: 'Cred Rewards Push',
        brand: 'Cred',
        status: 'Completed',
        brief: 'Funny content around bill payments and rewards. Comedy angle.',
        platform: 'Instagram',
        budget: 350000,
        spent: 290000,
        startDate: '2025-11-01',
        endDate: '2025-12-15',
        objective: 'App Downloads',
        creators: [
            {
                creatorId: 'cr-006',
                deliverables: [
                    { type: 'Reel', quantity: 1, status: 'Delivered', dueDate: '2025-11-20' },
                    { type: 'Story', quantity: 2, status: 'Delivered', dueDate: '2025-11-25' },
                ],
                totalFee: 150000,
                paymentStatus: 'Paid',
                contentInsights: { views: 250000, likes: 22000, comments: 890, shares: 1200 }
            },
        ],
        createdAt: '2025-10-15',
        updatedAt: '2025-12-20'
    },
]

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

// ==================== CREATORS CRUD ====================
export function getCreators(filters = {}) {
    let creators = getStore(STORAGE_KEYS.creators, initialCreators)
    creators = creators.map(c => ({
        ...c,
        avgViews: calculateSmartAvgViews(c.reelViews),
        suggestedCPV: calculateSuggestedCPV(calculateSmartAvgViews(c.reelViews))
    }))
    if (filters.platform) creators = creators.filter(c => c.platform === filters.platform)
    if (filters.niche) creators = creators.filter(c => c.niche === filters.niche)
    if (filters.status) creators = creators.filter(c => c.status === filters.status)
    if (filters.city) creators = creators.filter(c => c.city === filters.city)
    if (filters.label) creators = creators.filter(c => c.labels && c.labels.includes(filters.label))
    if (filters.search) {
        const s = filters.search.toLowerCase()
        creators = creators.filter(c =>
            c.name.toLowerCase().includes(s) ||
            c.handle.toLowerCase().includes(s) ||
            c.niche.toLowerCase().includes(s) ||
            c.city.toLowerCase().includes(s)
        )
    }
    return creators
}

export function getCreator(id) {
    const creators = getCreators()
    return creators.find(c => c.id === id) || null
}

export function createCreator(data) {
    const creators = getStore(STORAGE_KEYS.creators, initialCreators)
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

export function updateCreator(id, data) {
    const creators = getStore(STORAGE_KEYS.creators, initialCreators)
    const index = creators.findIndex(c => c.id === id)
    if (index === -1) return null
    creators[index] = { ...creators[index], ...data, updatedAt: today() }
    setStore(STORAGE_KEYS.creators, creators)
    return creators[index]
}

export function deleteCreator(id) {
    const creators = getStore(STORAGE_KEYS.creators, initialCreators).filter(c => c.id !== id)
    setStore(STORAGE_KEYS.creators, creators)
    return true
}

export function addDealToCreator(creatorId, deal) {
    const creators = getStore(STORAGE_KEYS.creators, initialCreators)
    const index = creators.findIndex(c => c.id === creatorId)
    if (index === -1) return null
    const newDeal = { ...deal, id: genId('deal') }
    creators[index].dealHistory = [...(creators[index].dealHistory || []), newDeal]
    creators[index].updatedAt = today()
    setStore(STORAGE_KEYS.creators, creators)
    return newDeal
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

// ==================== CAMPAIGNS CRUD ====================
export function getCampaigns(filters = {}) {
    let campaigns = getStore(STORAGE_KEYS.campaigns, initialCampaigns)
    if (filters.status) campaigns = campaigns.filter(c => c.status === filters.status)
    if (filters.brand) campaigns = campaigns.filter(c => c.brand.toLowerCase().includes(filters.brand.toLowerCase()))
    if (filters.platform) campaigns = campaigns.filter(c => c.platform === filters.platform)
    return campaigns
}

export function getCampaign(id) {
    return getCampaigns().find(c => c.id === id) || null
}

export function createCampaign(data) {
    const campaigns = getStore(STORAGE_KEYS.campaigns, initialCampaigns)
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

export function updateCampaign(id, data) {
    const campaigns = getStore(STORAGE_KEYS.campaigns, initialCampaigns)
    const index = campaigns.findIndex(c => c.id === id)
    if (index === -1) return null
    campaigns[index] = { ...campaigns[index], ...data, updatedAt: today() }
    setStore(STORAGE_KEYS.campaigns, campaigns)
    return campaigns[index]
}

export function deleteCampaign(id) {
    const campaigns = getStore(STORAGE_KEYS.campaigns, initialCampaigns).filter(c => c.id !== id)
    setStore(STORAGE_KEYS.campaigns, campaigns)
    return true
}

export function addCreatorToCampaign(campaignId, creatorData) {
    const campaigns = getStore(STORAGE_KEYS.campaigns, initialCampaigns)
    const index = campaigns.findIndex(c => c.id === campaignId)
    if (index === -1) return null
    campaigns[index].creators.push(creatorData)
    campaigns[index].updatedAt = today()
    setStore(STORAGE_KEYS.campaigns, campaigns)
    return campaigns[index]
}

export function updateCampaignCreator(campaignId, creatorId, data) {
    const campaigns = getStore(STORAGE_KEYS.campaigns, initialCampaigns)
    const cIndex = campaigns.findIndex(c => c.id === campaignId)
    if (cIndex === -1) return null
    const crIndex = campaigns[cIndex].creators.findIndex(cr => cr.creatorId === creatorId)
    if (crIndex === -1) return null
    campaigns[cIndex].creators[crIndex] = { ...campaigns[cIndex].creators[crIndex], ...data }
    campaigns[cIndex].updatedAt = today()
    setStore(STORAGE_KEYS.campaigns, campaigns)
    return campaigns[cIndex]
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

// ==================== STATS ====================
export function getInfluencerStats() {
    const creators = getCreators()
    const campaigns = getCampaigns()
    const invoices = getInvoices()
    const salesLeads = getSalesLeads()
    const outreach = getOutreachList()

    const totalCreators = creators.length
    const activeCampaigns = campaigns.filter(c => c.status === 'Active').length
    const totalCampaignBudget = campaigns.reduce((s, c) => s + c.budget, 0)
    const totalSpent = campaigns.reduce((s, c) => s + c.spent, 0)
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
