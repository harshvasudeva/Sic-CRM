// CRM Store with localStorage persistence

const STORAGE_KEYS = {
    leads: 'sic-crm-leads',
    opportunities: 'sic-crm-opportunities',
    contacts: 'sic-crm-contacts',
    activities: 'sic-crm-activities',
    pipelines: 'sic-crm-pipelines'
}

// ==================== PIPELINES ====================
const initialPipelines = [
    { id: 'pipe-001', name: 'Sales Pipeline', stages: ['New', 'Qualified', 'Proposal', 'Negotiation', 'Won', 'Lost'] },
    { id: 'pipe-002', name: 'Enterprise Pipeline', stages: ['Discovery', 'Demo', 'POC', 'Contract', 'Closed Won', 'Closed Lost'] }
]

// ==================== LEADS ====================
const initialLeads = [
    {
        id: 'lead-001',
        name: 'John Carter',
        company: 'TechStart Inc',
        email: 'john.carter@techstart.io',
        phone: '+1-555-0201',
        source: 'website',
        status: 'new',
        score: 85,
        assignedTo: 'emp-002',
        notes: 'Interested in enterprise solution',
        tags: ['enterprise', 'high-priority'],
        createdAt: '2026-01-10',
        lastContact: '2026-01-12'
    },
    {
        id: 'lead-002',
        name: 'Emily Watson',
        company: 'Global Retail Co',
        email: 'emily.w@globalretail.com',
        phone: '+1-555-0202',
        source: 'referral',
        status: 'contacted',
        score: 72,
        assignedTo: 'emp-002',
        notes: 'Referred by existing customer',
        tags: ['retail', 'mid-market'],
        createdAt: '2026-01-08',
        lastContact: '2026-01-14'
    },
    {
        id: 'lead-003',
        name: 'Michael Zhang',
        company: 'Innovation Labs',
        email: 'm.zhang@innovationlabs.co',
        phone: '+1-555-0203',
        source: 'linkedin',
        status: 'qualified',
        score: 90,
        assignedTo: 'emp-002',
        notes: 'Ready for demo',
        tags: ['tech', 'startup'],
        createdAt: '2026-01-05',
        lastContact: '2026-01-13'
    },
    {
        id: 'lead-004',
        name: 'Sarah Miller',
        company: 'HealthPlus Medical',
        email: 'sarah.m@healthplus.org',
        phone: '+1-555-0204',
        source: 'trade_show',
        status: 'new',
        score: 65,
        assignedTo: null,
        notes: 'Met at industry conference',
        tags: ['healthcare'],
        createdAt: '2026-01-12',
        lastContact: null
    },
    {
        id: 'lead-005',
        name: 'David Kim',
        company: 'FinanceFlow',
        email: 'd.kim@financeflow.com',
        phone: '+1-555-0205',
        source: 'cold_call',
        status: 'unqualified',
        score: 30,
        assignedTo: 'emp-002',
        notes: 'Not a good fit - too small',
        tags: ['finance'],
        createdAt: '2026-01-03',
        lastContact: '2026-01-04'
    }
]

// ==================== OPPORTUNITIES ====================
const initialOpportunities = [
    {
        id: 'opp-001',
        name: 'TechStart Enterprise Deal',
        company: 'TechStart Inc',
        contactId: 'lead-001',
        value: 75000,
        pipeline: 'pipe-001',
        stage: 'Proposal',
        probability: 60,
        expectedClose: '2026-02-28',
        assignedTo: 'emp-002',
        notes: 'Proposal sent, awaiting feedback',
        createdAt: '2026-01-10',
        updatedAt: '2026-01-14'
    },
    {
        id: 'opp-002',
        name: 'Global Retail Expansion',
        company: 'Global Retail Co',
        contactId: 'lead-002',
        value: 120000,
        pipeline: 'pipe-001',
        stage: 'Negotiation',
        probability: 80,
        expectedClose: '2026-01-31',
        assignedTo: 'emp-002',
        notes: 'Final pricing discussion',
        createdAt: '2026-01-08',
        updatedAt: '2026-01-15'
    },
    {
        id: 'opp-003',
        name: 'Innovation Labs POC',
        company: 'Innovation Labs',
        contactId: 'lead-003',
        value: 45000,
        pipeline: 'pipe-002',
        stage: 'POC',
        probability: 50,
        expectedClose: '2026-03-15',
        assignedTo: 'emp-002',
        notes: 'Running proof of concept',
        createdAt: '2026-01-05',
        updatedAt: '2026-01-12'
    },
    {
        id: 'opp-004',
        name: 'HealthPlus Integration',
        company: 'HealthPlus Medical',
        contactId: 'lead-004',
        value: 200000,
        pipeline: 'pipe-002',
        stage: 'Discovery',
        probability: 20,
        expectedClose: '2026-04-30',
        assignedTo: 'emp-002',
        notes: 'Initial discussions',
        createdAt: '2026-01-12',
        updatedAt: '2026-01-12'
    }
]

// ==================== CONTACTS ====================
const initialContacts = [
    {
        id: 'cont-001',
        firstName: 'John',
        lastName: 'Carter',
        email: 'john.carter@techstart.io',
        phone: '+1-555-0201',
        company: 'TechStart Inc',
        title: 'CTO',
        type: 'customer',
        address: '100 Tech Blvd, San Francisco, CA',
        notes: 'Key decision maker',
        tags: ['decision-maker', 'technical'],
        createdAt: '2026-01-10'
    },
    {
        id: 'cont-002',
        firstName: 'Emily',
        lastName: 'Watson',
        email: 'emily.w@globalretail.com',
        phone: '+1-555-0202',
        company: 'Global Retail Co',
        title: 'VP of Operations',
        type: 'prospect',
        address: '500 Commerce Way, New York, NY',
        notes: 'Budget holder',
        tags: ['budget-holder'],
        createdAt: '2026-01-08'
    },
    {
        id: 'cont-003',
        firstName: 'Michael',
        lastName: 'Zhang',
        email: 'm.zhang@innovationlabs.co',
        phone: '+1-555-0203',
        company: 'Innovation Labs',
        title: 'CEO',
        type: 'prospect',
        address: '200 Innovation Drive, Austin, TX',
        notes: 'Startup founder',
        tags: ['c-level', 'startup'],
        createdAt: '2026-01-05'
    }
]

// ==================== ACTIVITIES ====================
const initialActivities = [
    {
        id: 'act-001',
        type: 'call',
        subject: 'Discovery call with John',
        contactId: 'cont-001',
        opportunityId: 'opp-001',
        date: '2026-01-12',
        duration: 30,
        notes: 'Discussed requirements',
        completed: true,
        assignedTo: 'emp-002'
    },
    {
        id: 'act-002',
        type: 'meeting',
        subject: 'Product demo for Global Retail',
        contactId: 'cont-002',
        opportunityId: 'opp-002',
        date: '2026-01-14',
        duration: 60,
        notes: 'Showed full platform',
        completed: true,
        assignedTo: 'emp-002'
    },
    {
        id: 'act-003',
        type: 'email',
        subject: 'Follow-up proposal',
        contactId: 'cont-001',
        opportunityId: 'opp-001',
        date: '2026-01-15',
        duration: null,
        notes: 'Sent pricing proposal',
        completed: true,
        assignedTo: 'emp-002'
    },
    {
        id: 'act-004',
        type: 'task',
        subject: 'Prepare contract for Global Retail',
        contactId: 'cont-002',
        opportunityId: 'opp-002',
        date: '2026-01-16',
        duration: null,
        notes: 'Draft contract for review',
        completed: false,
        assignedTo: 'emp-002'
    }
]

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

// ==================== API HELPERS ====================
const API_URL = 'http://localhost:5000/api/crm'

async function apiCall(endpoint, method = 'GET', body = null) {
    try {
        const options = {
            method,
            headers: { 'Content-Type': 'application/json' }
        }
        if (body) options.body = JSON.stringify(body)
        const res = await fetch(`${API_URL}${endpoint}`, options)
        if (!res.ok) throw new Error(`API Error: ${res.status}`)
        return await res.json()
    } catch (e) {
        console.warn(`Backend unavailable for ${endpoint}, using local storage fallback.`, e)
        return null
    }
}

// ==================== LEADS CRUD ====================
export async function getLeads(filters = {}) {
    // Try API
    const query = new URLSearchParams(filters).toString()
    const apiData = await apiCall(`/leads?${query}`)
    if (apiData) return apiData

    // Fallback
    let leads = getStore(STORAGE_KEYS.leads, initialLeads)
    if (filters.status) leads = leads.filter(l => l.status === filters.status)
    if (filters.assignedTo) leads = leads.filter(l => l.assignedTo === filters.assignedTo)
    if (filters.source) leads = leads.filter(l => l.source === filters.source)
    return leads
}

export async function getLead(id) {
    const apiData = await apiCall(`/leads/${id}`)
    if (apiData) return apiData
    return (await getLeads()).find(l => l.id === id) // Re-use getLeads fallback
}

export async function createLead(data) {
    const apiData = await apiCall('/leads', 'POST', data)
    if (apiData) return apiData

    // Fallback
    const leads = getStore(STORAGE_KEYS.leads, initialLeads) // Use direct sync getStore for fallback to avoid circular await in fallback
    const newLead = {
        ...data,
        id: `lead-${Date.now()}`,
        score: data.score || 50,
        status: 'new',
        createdAt: new Date().toISOString().split('T')[0],
        lastContact: null,
        tags: data.tags || []
    }
    leads.push(newLead)
    setStore(STORAGE_KEYS.leads, leads)
    return newLead
}

export async function updateLead(id, data) {
    const apiData = await apiCall(`/leads/${id}`, 'PATCH', data) // Assuming PATCH support
    if (apiData) return apiData

    // Fallback
    const leads = getStore(STORAGE_KEYS.leads, initialLeads)
    const index = leads.findIndex(l => l.id === id)
    if (index === -1) return null
    leads[index] = { ...leads[index], ...data }
    setStore(STORAGE_KEYS.leads, leads)
    return leads[index]
}

export async function deleteLead(id) {
    const apiRes = await apiCall(`/leads/${id}`, 'DELETE')
    if (apiRes) return true

    // Fallback
    const leads = getStore(STORAGE_KEYS.leads, initialLeads).filter(l => l.id !== id)
    setStore(STORAGE_KEYS.leads, leads)
    return true
}

export async function convertLeadToOpportunity(leadId, opportunityData) {
    // This is a complex transaction. In API, it might be a single endpoint /leads/:id/convert
    // For now, we simulate it with sequential calls or fallback

    // Try dedicated API endpoint if it exists (assuming future implementation), otherwise rely on component calls?
    // Actually, let's implement the logic using our async primitives.

    const lead = await getLead(leadId)
    if (!lead) return null

    await updateLead(leadId, { status: 'converted' })

    const opportunity = await createOpportunity({
        name: opportunityData.name || `${lead.company} Deal`,
        company: lead.company,
        contactId: leadId,
        value: opportunityData.value || 0,
        pipeline: opportunityData.pipeline || 'pipe-001',
        stage: 'New',
        probability: 10,
        expectedClose: opportunityData.expectedClose,
        assignedTo: lead.assignedTo,
        notes: lead.notes
    })

    return opportunity
}

// ==================== OPPORTUNITIES CRUD ====================
export async function getOpportunities(filters = {}) {
    const query = new URLSearchParams(filters).toString()
    const apiData = await apiCall(`/opportunities?${query}`)
    if (apiData) return apiData

    // Fallback
    let opps = getStore(STORAGE_KEYS.opportunities, initialOpportunities)
    if (filters.pipeline) opps = opps.filter(o => o.pipeline === filters.pipeline)
    if (filters.stage) opps = opps.filter(o => o.stage === filters.stage)
    return opps
}

export async function getOpportunity(id) {
    const apiData = await apiCall(`/opportunities/${id}`)
    if (apiData) return apiData
    return (await getOpportunities()).find(o => o.id === id)
}

export async function createOpportunity(data) {
    const apiData = await apiCall('/opportunities', 'POST', data)
    if (apiData) return apiData

    const opps = getStore(STORAGE_KEYS.opportunities, initialOpportunities)
    const newOpp = {
        ...data,
        id: `opp-${Date.now()}`,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
    }
    opps.push(newOpp)
    setStore(STORAGE_KEYS.opportunities, opps)
    return newOpp
}

export async function updateOpportunity(id, data) {
    const apiData = await apiCall(`/opportunities/${id}`, 'PATCH', data)
    if (apiData) return apiData

    const opps = getStore(STORAGE_KEYS.opportunities, initialOpportunities)
    const index = opps.findIndex(o => o.id === id)
    if (index === -1) return null
    opps[index] = { ...opps[index], ...data, updatedAt: new Date().toISOString().split('T')[0] }
    setStore(STORAGE_KEYS.opportunities, opps)
    return opps[index]
}

export async function deleteOpportunity(id) {
    const apiRes = await apiCall(`/opportunities/${id}`, 'DELETE')
    if (apiRes) return true

    const opps = getStore(STORAGE_KEYS.opportunities, initialOpportunities).filter(o => o.id !== id)
    setStore(STORAGE_KEYS.opportunities, opps)
    return true
}

export async function moveOpportunityStage(id, newStage) {
    return updateOpportunity(id, { stage: newStage })
}

// ==================== CONTACTS CRUD ====================
export async function getContacts(filters = {}) {
    const query = new URLSearchParams(filters).toString()
    const apiData = await apiCall(`/contacts?${query}`)
    if (apiData) return apiData

    let contacts = getStore(STORAGE_KEYS.contacts, initialContacts)
    if (filters.type) contacts = contacts.filter(c => c.type === filters.type)
    return contacts
}

export async function createContact(data) {
    const apiData = await apiCall('/contacts', 'POST', data)
    if (apiData) return apiData

    const contacts = getStore(STORAGE_KEYS.contacts, initialContacts)
    const newContact = {
        ...data,
        id: `cont-${Date.now()}`,
        createdAt: new Date().toISOString().split('T')[0],
        tags: data.tags || []
    }
    contacts.push(newContact)
    setStore(STORAGE_KEYS.contacts, contacts)
    return newContact
}

export async function updateContact(id, data) {
    const apiData = await apiCall(`/contacts/${id}`, 'PATCH', data)
    if (apiData) return apiData

    const contacts = getStore(STORAGE_KEYS.contacts, initialContacts)
    const index = contacts.findIndex(c => c.id === id)
    if (index === -1) return null
    contacts[index] = { ...contacts[index], ...data }
    setStore(STORAGE_KEYS.contacts, contacts)
    return contacts[index]
}

export async function deleteContact(id) {
    const apiRes = await apiCall(`/contacts/${id}`, 'DELETE')
    if (apiRes) return true

    const contacts = getStore(STORAGE_KEYS.contacts, initialContacts).filter(c => c.id !== id)
    setStore(STORAGE_KEYS.contacts, contacts)
    return true
}

// ==================== ACTIVITIES CRUD ====================
// Note: Activities might require complex filtering in API.
export async function getActivities(filters = {}) {
    const query = new URLSearchParams(filters).toString()
    const apiData = await apiCall(`/activities?${query}`)
    if (apiData) return apiData

    let activities = getStore(STORAGE_KEYS.activities, initialActivities)
    if (filters.contactId) activities = activities.filter(a => a.contactId === filters.contactId)
    if (filters.completed !== undefined) activities = activities.filter(a => a.completed === filters.completed)
    return activities
}

export async function createActivity(data) {
    const apiData = await apiCall('/activities', 'POST', data)
    if (apiData) return apiData

    const activities = getStore(STORAGE_KEYS.activities, initialActivities)
    const newActivity = {
        ...data,
        id: `act-${Date.now()}`,
        completed: false
    }
    activities.push(newActivity)
    setStore(STORAGE_KEYS.activities, activities)
    return newActivity
}

export async function completeActivity(id) {
    const apiData = await apiCall(`/activities/${id}/chk`, 'POST') // Hypothetical endpoint
    if (apiData) return apiData

    const activities = getStore(STORAGE_KEYS.activities, initialActivities)
    const index = activities.findIndex(a => a.id === id)
    if (index === -1) return null
    activities[index].completed = true
    setStore(STORAGE_KEYS.activities, activities)
    return activities[index]
}

// ==================== PIPELINES ====================
export async function getPipelines() {
    const apiData = await apiCall('/pipelines')
    if (apiData) return apiData

    return getStore(STORAGE_KEYS.pipelines, initialPipelines)
}

// ==================== STATISTICS ====================
export async function getCRMStats() {
    // Try specialized stats endpoint
    const apiData = await apiCall('/stats')
    if (apiData) return apiData

    // Fallback: Compute locally
    const leads = await getLeads()
    const opportunities = await getOpportunities()
    const contacts = await getContacts()
    const activities = await getActivities()

    const totalValue = opportunities.reduce((sum, o) => sum + o.value, 0)
    const weightedValue = opportunities.reduce((sum, o) => sum + (o.value * (o.probability || 0) / 100), 0)

    return {
        totalLeads: leads.length,
        newLeads: leads.filter(l => l.status === 'new').length,
        qualifiedLeads: leads.filter(l => l.status === 'qualified').length,
        totalOpportunities: opportunities.length,
        pipelineValue: totalValue,
        weightedValue: weightedValue,
        totalContacts: contacts.length,
        pendingActivities: activities.filter(a => !a.completed).length,
        completedActivities: activities.filter(a => a.completed).length,
        avgDealSize: opportunities.length > 0 ? totalValue / opportunities.length : 0,
        conversionRate: leads.length > 0 ? (leads.filter(l => l.status === 'converted').length / leads.length * 100) : 0,
        leadsBySource: getLeadsBySource(leads),
        opportunitiesByStage: getOpportunitiesByStage(opportunities)
    }
}

function getLeadsBySource(leads) {
    const sources = {}
    leads.forEach(l => {
        sources[l.source] = (sources[l.source] || 0) + 1
    })
    return sources
}

function getOpportunitiesByStage(opps) {
    const stages = {}
    opps.forEach(o => {
        stages[o.stage] = (stages[o.stage] || 0) + 1
    })
    return stages
}
