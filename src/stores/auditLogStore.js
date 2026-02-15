const STORAGE_KEY = 'sic-audit-log'
const MAX_ENTRIES = 500

function getLog() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  } catch { return [] }
}

function saveLog(log) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(log.slice(0, MAX_ENTRIES)))
}

export function logAction(action, details = {}) {
  const entry = {
    id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    action,
    module: details.module || 'system',
    entity: details.entity || null,
    entityId: details.entityId || null,
    entityName: details.entityName || null,
    changes: details.changes || null,
    user: details.user || localStorage.getItem('sic-user-name') || 'System',
    timestamp: new Date().toISOString(),
    ip: null,
  }

  const log = getLog()
  log.unshift(entry)
  saveLog(log)

  // Also try to send to API
  try {
    fetch('http://localhost:5000/api/audit-log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('sic-token')}`,
      },
      body: JSON.stringify(entry),
    }).catch(() => {})
  } catch {}

  return entry
}

export function getAuditLog(filters = {}) {
  let log = getLog()

  if (filters.module) {
    log = log.filter(e => e.module === filters.module)
  }
  if (filters.action) {
    log = log.filter(e => e.action === filters.action)
  }
  if (filters.entity) {
    log = log.filter(e => e.entity === filters.entity)
  }
  if (filters.entityId) {
    log = log.filter(e => e.entityId === filters.entityId)
  }
  if (filters.user) {
    log = log.filter(e => e.user.toLowerCase().includes(filters.user.toLowerCase()))
  }
  if (filters.from) {
    log = log.filter(e => new Date(e.timestamp) >= new Date(filters.from))
  }
  if (filters.to) {
    log = log.filter(e => new Date(e.timestamp) <= new Date(filters.to))
  }
  if (filters.search) {
    const s = filters.search.toLowerCase()
    log = log.filter(e =>
      e.action.toLowerCase().includes(s) ||
      (e.entityName || '').toLowerCase().includes(s) ||
      (e.module || '').toLowerCase().includes(s)
    )
  }

  const total = log.length
  const page = filters.page || 1
  const limit = filters.limit || 50
  const offset = (page - 1) * limit

  return {
    entries: log.slice(offset, offset + limit),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  }
}

export function getEntityHistory(entity, entityId) {
  return getLog().filter(e => e.entity === entity && e.entityId === entityId)
}

export function clearAuditLog() {
  localStorage.removeItem(STORAGE_KEY)
}

export const AUDIT_ACTIONS = {
  CREATE: 'created',
  UPDATE: 'updated',
  DELETE: 'deleted',
  VIEW: 'viewed',
  EXPORT: 'exported',
  IMPORT: 'imported',
  LOGIN: 'logged_in',
  LOGOUT: 'logged_out',
  STATUS_CHANGE: 'status_changed',
  ASSIGN: 'assigned',
  APPROVE: 'approved',
  REJECT: 'rejected',
  SEND: 'sent',
  PRINT: 'printed',
}
