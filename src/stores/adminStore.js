// Admin & Operations Store with localStorage persistence

const STORAGE_KEYS = {
    users: 'sic-admin-users',
    refreshSchedule: 'sic-admin-refresh-schedule',
    importHistory: 'sic-admin-import-history',
    platformMetrics: 'sic-admin-platform-metrics',
    adminActions: 'sic-admin-actions'
}

function getStore(key, initial) {
    try {
        const stored = localStorage.getItem(key)
        if (stored) return JSON.parse(stored)
        localStorage.setItem(key, JSON.stringify(initial))
        return initial
    } catch {
        return initial
    }
}

function setStore(key, data) {
    localStorage.setItem(key, JSON.stringify(data))
}

function genId(prefix) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

const today = () => new Date().toISOString().split('T')[0]

// ==================== INITIAL DATA ====================

const initialUsers = [
    { id: 'usr-001', name: 'Harsh Vasudeva', email: 'harsh@siccrm.com', role: 'Admin', status: 'Active', plan: 'Enterprise', lastActive: '2026-02-24', createdAt: '2025-01-01', activity: 342 },
    { id: 'usr-002', name: 'Priya Mehta', email: 'priya@siccrm.com', role: 'Manager', status: 'Active', plan: 'Pro', lastActive: '2026-02-23', createdAt: '2025-03-15', activity: 218 },
    { id: 'usr-003', name: 'Rohan Singh', email: 'rohan@siccrm.com', role: 'User', status: 'Active', plan: 'Basic', lastActive: '2026-02-22', createdAt: '2025-06-10', activity: 156 },
    { id: 'usr-004', name: 'Ananya Gupta', email: 'ananya@siccrm.com', role: 'User', status: 'Suspended', plan: 'Basic', lastActive: '2026-01-15', createdAt: '2025-08-20', activity: 45 },
    { id: 'usr-005', name: 'Karthik Rao', email: 'karthik@siccrm.com', role: 'Manager', status: 'Active', plan: 'Pro', lastActive: '2026-02-24', createdAt: '2025-04-05', activity: 289 },
    { id: 'usr-006', name: 'Sneha Joshi', email: 'sneha@company.co', role: 'User', status: 'Active', plan: 'Pro', lastActive: '2026-02-20', createdAt: '2025-09-12', activity: 102 },
    { id: 'usr-007', name: 'Amit Patel', email: 'amit@agency.in', role: 'User', status: 'Active', plan: 'Basic', lastActive: '2026-02-18', createdAt: '2025-11-01', activity: 67 },
]

const initialRefreshSchedule = {
    frequency: 'Daily',
    time: '02:00',
    lastRefresh: '2026-02-24T02:00:00Z',
    creatorsRefreshed: 156,
    failures: 2,
    history: [
        { date: '2026-02-24', refreshed: 156, failed: 2, duration: '4m 32s' },
        { date: '2026-02-23', refreshed: 158, failed: 0, duration: '4m 18s' },
        { date: '2026-02-22', refreshed: 155, failed: 3, duration: '4m 45s' },
        { date: '2026-02-21', refreshed: 158, failed: 0, duration: '4m 12s' },
        { date: '2026-02-20', refreshed: 157, failed: 1, duration: '4m 28s' },
        { date: '2026-02-19', refreshed: 158, failed: 0, duration: '4m 08s' },
        { date: '2026-02-18', refreshed: 156, failed: 2, duration: '4m 38s' },
    ]
}

const initialImportHistory = [
    { id: 'imp-001', fileName: 'creators_jan_2026.csv', date: '2026-01-15', totalRows: 250, success: 238, failed: 8, duplicates: 4, status: 'Completed' },
    { id: 'imp-002', fileName: 'youtube_creators.csv', date: '2026-01-28', totalRows: 180, success: 175, failed: 3, duplicates: 2, status: 'Completed' },
    { id: 'imp-003', fileName: 'instagram_batch.csv', date: '2026-02-10', totalRows: 320, success: 310, failed: 5, duplicates: 5, status: 'Completed' },
]

const initialPlatformMetrics = {
    totalUsers: 1247,
    activeUsers: 892,
    totalCampaigns: 346,
    activeCampaigns: 42,
    totalSearches: 15890,
    revenue: 2450000,
    mrr: 245000,
    userGrowth: [
        { month: 'Sep', users: 680 }, { month: 'Oct', users: 780 }, { month: 'Nov', users: 890 },
        { month: 'Dec', users: 980 }, { month: 'Jan', users: 1120 }, { month: 'Feb', users: 1247 }
    ],
    campaignActivity: [
        { month: 'Sep', created: 32, completed: 28 }, { month: 'Oct', created: 45, completed: 38 },
        { month: 'Nov', created: 52, completed: 44 }, { month: 'Dec', created: 38, completed: 35 },
        { month: 'Jan', created: 58, completed: 48 }, { month: 'Feb', created: 42, completed: 30 }
    ],
    topSearched: [
        { name: 'Tech Reviewers', searches: 1245 }, { name: 'Beauty Influencers', searches: 980 },
        { name: 'Food Bloggers', searches: 875 }, { name: 'Fitness Creators', searches: 720 },
        { name: 'Travel Vloggers', searches: 645 }
    ],
    activityHeatmap: Array.from({ length: 7 }, (_, day) =>
        Array.from({ length: 24 }, (_, hour) => ({
            day, hour, value: Math.floor(Math.random() * 100)
        }))
    ).flat()
}

// ==================== PLATFORM METRICS ====================

export function getPlatformMetrics() {
    return getStore(STORAGE_KEYS.platformMetrics, initialPlatformMetrics)
}

// ==================== USER MANAGEMENT ====================

export function getUsers(filters = {}) {
    let users = getStore(STORAGE_KEYS.users, initialUsers)
    if (filters.role) users = users.filter(u => u.role === filters.role)
    if (filters.status) users = users.filter(u => u.status === filters.status)
    if (filters.search) {
        const q = filters.search.toLowerCase()
        users = users.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
    }
    return users
}

export function getUser(id) {
    const users = getStore(STORAGE_KEYS.users, initialUsers)
    return users.find(u => u.id === id) || null
}

export function createUser(data) {
    const users = getStore(STORAGE_KEYS.users, initialUsers)
    const user = {
        id: genId('usr'),
        name: data.name || '',
        email: data.email || '',
        role: data.role || 'User',
        status: 'Active',
        plan: data.plan || 'Basic',
        lastActive: today(),
        createdAt: today(),
        activity: 0,
        ...data
    }
    users.push(user)
    setStore(STORAGE_KEYS.users, users)
    return user
}

export function updateUser(id, data) {
    const users = getStore(STORAGE_KEYS.users, initialUsers)
    const idx = users.findIndex(u => u.id === id)
    if (idx === -1) return null
    users[idx] = { ...users[idx], ...data }
    setStore(STORAGE_KEYS.users, users)
    return users[idx]
}

export function suspendUser(id) {
    return updateUser(id, { status: 'Suspended' })
}

export function reactivateUser(id) {
    return updateUser(id, { status: 'Active' })
}

export function deleteUser(id) {
    let users = getStore(STORAGE_KEYS.users, initialUsers)
    users = users.filter(u => u.id !== id)
    setStore(STORAGE_KEYS.users, users)
}

// ==================== REFRESH SCHEDULE ====================

export function getRefreshSchedule() {
    return getStore(STORAGE_KEYS.refreshSchedule, initialRefreshSchedule)
}

export function updateRefreshSchedule(data) {
    const schedule = getStore(STORAGE_KEYS.refreshSchedule, initialRefreshSchedule)
    const updated = { ...schedule, ...data }
    setStore(STORAGE_KEYS.refreshSchedule, updated)
    return updated
}

// ==================== IMPORT ====================

export function getImportHistory() {
    return getStore(STORAGE_KEYS.importHistory, initialImportHistory)
}

export function addImportRecord(record) {
    const history = getStore(STORAGE_KEYS.importHistory, initialImportHistory)
    const entry = {
        id: genId('imp'),
        date: today(),
        status: 'Completed',
        ...record
    }
    history.unshift(entry)
    setStore(STORAGE_KEYS.importHistory, history)
    return entry
}

export function bulkImportCreators(rows) {
    // Simulated import - returns summary
    const success = Math.floor(rows.length * 0.95)
    const failed = Math.floor(rows.length * 0.03)
    const duplicates = rows.length - success - failed
    return { total: rows.length, success, failed, duplicates }
}

// ==================== ADMIN ACTIONS LOG ====================

export function getAdminActions() {
    return getStore(STORAGE_KEYS.adminActions, [
        { id: 'act-001', action: 'User suspended', target: 'ananya@siccrm.com', by: 'Harsh Vasudeva', date: '2026-02-20T14:30:00Z' },
        { id: 'act-002', action: 'Bulk import completed', target: '320 creators', by: 'System', date: '2026-02-10T08:00:00Z' },
        { id: 'act-003', action: 'Refresh schedule updated', target: 'Daily @ 02:00', by: 'Harsh Vasudeva', date: '2026-02-05T10:15:00Z' },
        { id: 'act-004', action: 'New user invited', target: 'amit@agency.in', by: 'Priya Mehta', date: '2026-01-28T16:45:00Z' },
        { id: 'act-005', action: 'Role changed to Manager', target: 'karthik@siccrm.com', by: 'Harsh Vasudeva', date: '2026-01-20T09:00:00Z' },
    ])
}

export function logAdminAction(action) {
    const actions = getAdminActions()
    actions.unshift({
        id: genId('act'),
        date: new Date().toISOString(),
        ...action
    })
    setStore(STORAGE_KEYS.adminActions, actions)
}
