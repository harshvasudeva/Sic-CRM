// Team & Collaboration Store with localStorage persistence

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
    workspaces: 'sic-team-workspaces',
    sharedLists: 'sic-team-shared-lists',
    activityFeed: 'sic-team-activity-feed',
    profileComments: 'sic-team-profile-comments',
    campaignAssignments: 'sic-team-campaign-assignments'
}

const initialWorkspaces = [
    {
        id: 'ws-001',
        name: 'Sic Marketing Agency',
        ownerId: 'usr-001',
        members: [
            { userId: 'usr-001', name: 'Harsh V', email: 'harsh@sic.agency', role: 'Admin', joinedAt: '2025-10-01' },
            { userId: 'usr-002', name: 'Priya Mehta', email: 'priya@sic.agency', role: 'Editor', joinedAt: '2025-10-15' },
            { userId: 'usr-003', name: 'Arjun Nair', email: 'arjun@sic.agency', role: 'Viewer', joinedAt: '2025-11-01' }
        ],
        createdAt: '2025-10-01'
    }
]

const initialSharedLists = [
    { id: 'sl-001', workspaceId: 'ws-001', name: 'Top Beauty Creators', creatorIds: ['cr-001', 'cr-003'], createdBy: 'usr-001', createdByName: 'Harsh V', sharedWith: ['usr-002', 'usr-003'], createdAt: '2025-12-01' },
    { id: 'sl-002', workspaceId: 'ws-001', name: 'Tech Campaign Shortlist', creatorIds: ['cr-002', 'cr-004'], createdBy: 'usr-002', createdByName: 'Priya Mehta', sharedWith: ['usr-001'], createdAt: '2026-01-05' }
]

const initialActivityFeed = [
    { id: 'af-001', workspaceId: 'ws-001', userId: 'usr-001', userName: 'Harsh V', action: 'launched', targetType: 'campaign', targetId: 'camp-001', targetName: 'Nykaa Summer Glow', timestamp: '2026-01-15T10:30:00' },
    { id: 'af-002', workspaceId: 'ws-001', userId: 'usr-002', userName: 'Priya Mehta', action: 'favorited', targetType: 'creator', targetId: 'cr-002', targetName: 'Rohan Verma', timestamp: '2026-01-14T14:20:00' },
    { id: 'af-003', workspaceId: 'ws-001', userId: 'usr-003', userName: 'Arjun Nair', action: 'searched', targetType: 'search', targetId: null, targetName: 'fitness creators Mumbai', timestamp: '2026-01-14T09:00:00' },
    { id: 'af-004', workspaceId: 'ws-001', userId: 'usr-001', userName: 'Harsh V', action: 'commented', targetType: 'creator', targetId: 'cr-006', targetName: 'Aditya Kapoor', timestamp: '2026-01-13T16:45:00' },
    { id: 'af-005', workspaceId: 'ws-001', userId: 'usr-002', userName: 'Priya Mehta', action: 'launched', targetType: 'campaign', targetId: 'camp-002', targetName: 'OnePlus 14 Launch', timestamp: '2026-01-12T11:00:00' }
]

const initialProfileComments = [
    { id: 'pc-001', creatorId: 'cr-001', userId: 'usr-001', userName: 'Harsh V', text: 'Great creator for beauty campaigns. Very professional.', createdAt: '2026-01-10T10:00:00' },
    { id: 'pc-002', creatorId: 'cr-006', userId: 'usr-001', userName: 'Harsh V', text: 'Comedy angle works perfectly for FMCG brands.', createdAt: '2026-01-13T16:45:00' },
    { id: 'pc-003', creatorId: 'cr-002', userId: 'usr-002', userName: 'Priya Mehta', text: 'Spoke to his manager - available for March campaigns.', createdAt: '2026-01-14T15:00:00' }
]

const initialCampaignAssignments = [
    { id: 'ca-001', campaignId: 'camp-001', campaignName: 'Nykaa Summer Glow', assigneeId: 'usr-002', assigneeName: 'Priya Mehta', assignedBy: 'usr-001', assignedByName: 'Harsh V', status: 'in_progress', dueDate: '2026-02-28', notes: 'Handle all creator communications' },
    { id: 'ca-002', campaignId: 'camp-002', campaignName: 'OnePlus 14 Launch', assigneeId: 'usr-001', assigneeName: 'Harsh V', assignedBy: 'usr-001', assignedByName: 'Harsh V', status: 'assigned', dueDate: '2026-03-31', notes: 'High priority - direct client relationship' }
]

// Workspaces
export function getWorkspaces() { return getStore(STORAGE_KEYS.workspaces, initialWorkspaces) }
export function createWorkspace(data) {
    const workspaces = getStore(STORAGE_KEYS.workspaces, initialWorkspaces)
    const ws = { ...data, id: genId('ws'), members: data.members || [], createdAt: today() }
    workspaces.push(ws)
    setStore(STORAGE_KEYS.workspaces, workspaces)
    return ws
}
export function addMember(workspaceId, member) {
    const workspaces = getStore(STORAGE_KEYS.workspaces, initialWorkspaces)
    const i = workspaces.findIndex(w => w.id === workspaceId)
    if (i === -1) return null
    const m = { ...member, userId: member.userId || genId('usr'), joinedAt: today() }
    workspaces[i].members.push(m)
    setStore(STORAGE_KEYS.workspaces, workspaces)
    return m
}
export function removeMember(workspaceId, userId) {
    const workspaces = getStore(STORAGE_KEYS.workspaces, initialWorkspaces)
    const i = workspaces.findIndex(w => w.id === workspaceId)
    if (i === -1) return false
    workspaces[i].members = workspaces[i].members.filter(m => m.userId !== userId)
    setStore(STORAGE_KEYS.workspaces, workspaces)
    return true
}

// Shared Lists
export function getSharedLists(workspaceId) {
    const lists = getStore(STORAGE_KEYS.sharedLists, initialSharedLists)
    return workspaceId ? lists.filter(l => l.workspaceId === workspaceId) : lists
}
export function createSharedList(data) {
    const lists = getStore(STORAGE_KEYS.sharedLists, initialSharedLists)
    const list = { ...data, id: genId('sl'), creatorIds: data.creatorIds || [], sharedWith: data.sharedWith || [], createdAt: today() }
    lists.push(list)
    setStore(STORAGE_KEYS.sharedLists, lists)
    return list
}
export function updateSharedList(id, data) {
    const lists = getStore(STORAGE_KEYS.sharedLists, initialSharedLists)
    const i = lists.findIndex(l => l.id === id)
    if (i === -1) return null
    lists[i] = { ...lists[i], ...data }
    setStore(STORAGE_KEYS.sharedLists, lists)
    return lists[i]
}
export function deleteSharedList(id) {
    const lists = getStore(STORAGE_KEYS.sharedLists, initialSharedLists).filter(l => l.id !== id)
    setStore(STORAGE_KEYS.sharedLists, lists)
    return true
}

// Activity Feed
export function getActivityFeed(workspaceId) {
    const feed = getStore(STORAGE_KEYS.activityFeed, initialActivityFeed)
    const filtered = workspaceId ? feed.filter(a => a.workspaceId === workspaceId) : feed
    return filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
}
export function logActivity(data) {
    const feed = getStore(STORAGE_KEYS.activityFeed, initialActivityFeed)
    feed.unshift({ ...data, id: genId('af'), timestamp: new Date().toISOString() })
    if (feed.length > 200) feed.length = 200
    setStore(STORAGE_KEYS.activityFeed, feed)
}

// Profile Comments
export function getProfileComments(creatorId) {
    const comments = getStore(STORAGE_KEYS.profileComments, initialProfileComments)
    return creatorId ? comments.filter(c => c.creatorId === creatorId) : comments
}
export function addProfileComment(data) {
    const comments = getStore(STORAGE_KEYS.profileComments, initialProfileComments)
    const comment = { ...data, id: genId('pc'), createdAt: new Date().toISOString() }
    comments.push(comment)
    setStore(STORAGE_KEYS.profileComments, comments)
    return comment
}
export function deleteProfileComment(id) {
    const comments = getStore(STORAGE_KEYS.profileComments, initialProfileComments).filter(c => c.id !== id)
    setStore(STORAGE_KEYS.profileComments, comments)
    return true
}

// Campaign Assignments
export function getCampaignAssignments(filters = {}) {
    let assignments = getStore(STORAGE_KEYS.campaignAssignments, initialCampaignAssignments)
    if (filters.assigneeId) assignments = assignments.filter(a => a.assigneeId === filters.assigneeId)
    if (filters.status) assignments = assignments.filter(a => a.status === filters.status)
    if (filters.campaignId) assignments = assignments.filter(a => a.campaignId === filters.campaignId)
    return assignments
}
export function assignCampaign(data) {
    const assignments = getStore(STORAGE_KEYS.campaignAssignments, initialCampaignAssignments)
    const assignment = { ...data, id: genId('ca'), status: 'assigned' }
    assignments.push(assignment)
    setStore(STORAGE_KEYS.campaignAssignments, assignments)
    return assignment
}
export function updateAssignment(id, data) {
    const assignments = getStore(STORAGE_KEYS.campaignAssignments, initialCampaignAssignments)
    const i = assignments.findIndex(a => a.id === id)
    if (i === -1) return null
    assignments[i] = { ...assignments[i], ...data }
    setStore(STORAGE_KEYS.campaignAssignments, assignments)
    return assignments[i]
}
export function deleteAssignment(id) {
    const assignments = getStore(STORAGE_KEYS.campaignAssignments, initialCampaignAssignments).filter(a => a.id !== id)
    setStore(STORAGE_KEYS.campaignAssignments, assignments)
    return true
}
