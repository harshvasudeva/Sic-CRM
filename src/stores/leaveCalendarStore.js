/**
 * Employee Leave Calendar Store - manage leave types, balances, and requests.
 */

const STORAGE_KEY = 'sic_crm_leave_calendar'

const DEFAULT_LEAVE_TYPES = [
  { id: 'casual', name: 'Casual Leave', code: 'CL', annual: 12, color: '#3b82f6', paid: true },
  { id: 'sick', name: 'Sick Leave', code: 'SL', annual: 10, color: '#ef4444', paid: true },
  { id: 'earned', name: 'Earned Leave', code: 'EL', annual: 15, color: '#22c55e', paid: true },
  { id: 'maternity', name: 'Maternity Leave', code: 'ML', annual: 180, color: '#ec4899', paid: true },
  { id: 'paternity', name: 'Paternity Leave', code: 'PL', annual: 15, color: '#8b5cf6', paid: true },
  { id: 'unpaid', name: 'Leave Without Pay', code: 'LWP', annual: 365, color: '#6b7280', paid: false },
  { id: 'comp', name: 'Compensatory Off', code: 'CO', annual: 0, color: '#f59e0b', paid: true },
]

function getStore() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
    const defaults = { leaveTypes: DEFAULT_LEAVE_TYPES, requests: [], balances: {} }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults))
    return defaults
  } catch {
    return { leaveTypes: DEFAULT_LEAVE_TYPES, requests: [], balances: {} }
  }
}

function save(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function getLeaveTypes() {
  return getStore().leaveTypes
}

export function getLeaveBalance(employeeId) {
  const store = getStore()
  if (!store.balances[employeeId]) {
    const balance = {}
    for (const lt of store.leaveTypes) {
      balance[lt.id] = { total: lt.annual, used: 0, remaining: lt.annual }
    }
    store.balances[employeeId] = balance
    save(store)
  }
  return store.balances[employeeId]
}

export function requestLeave(request) {
  const store = getStore()
  const newRequest = {
    ...request,
    id: `lr_${Date.now()}`,
    status: 'pending',
    createdAt: new Date().toISOString(),
    days: calculateDays(request.startDate, request.endDate),
  }
  store.requests.push(newRequest)
  save(store)
  return newRequest
}

export function approveLeave(requestId) {
  const store = getStore()
  const idx = store.requests.findIndex(r => r.id === requestId)
  if (idx === -1) return null

  const request = store.requests[idx]
  store.requests[idx].status = 'approved'
  store.requests[idx].approvedAt = new Date().toISOString()

  // Deduct from balance
  if (store.balances[request.employeeId]?.[request.leaveType]) {
    store.balances[request.employeeId][request.leaveType].used += request.days
    store.balances[request.employeeId][request.leaveType].remaining -= request.days
  }

  save(store)
  return store.requests[idx]
}

export function rejectLeave(requestId, reason = '') {
  const store = getStore()
  const idx = store.requests.findIndex(r => r.id === requestId)
  if (idx === -1) return null

  store.requests[idx].status = 'rejected'
  store.requests[idx].rejectReason = reason
  store.requests[idx].rejectedAt = new Date().toISOString()

  save(store)
  return store.requests[idx]
}

export function getLeaveRequests(filters = {}) {
  let requests = getStore().requests
  if (filters.employeeId) requests = requests.filter(r => r.employeeId === filters.employeeId)
  if (filters.status) requests = requests.filter(r => r.status === filters.status)
  if (filters.month) {
    requests = requests.filter(r => {
      const start = new Date(r.startDate)
      return start.getMonth() === filters.month - 1
    })
  }
  return requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

export function getCalendarEvents(year, month) {
  const store = getStore()
  return store.requests
    .filter(r => r.status === 'approved')
    .filter(r => {
      const start = new Date(r.startDate)
      const end = new Date(r.endDate)
      const monthStart = new Date(year, month - 1, 1)
      const monthEnd = new Date(year, month, 0)
      return start <= monthEnd && end >= monthStart
    })
    .map(r => ({
      ...r,
      color: store.leaveTypes.find(lt => lt.id === r.leaveType)?.color || '#6b7280',
    }))
}

function calculateDays(start, end) {
  const s = new Date(start)
  const e = new Date(end)
  const diff = Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1
  return Math.max(1, diff)
}
