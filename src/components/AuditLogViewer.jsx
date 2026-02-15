import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  History, Search, Filter, ChevronLeft, ChevronRight,
  Plus, Edit3, Trash2, Eye, Download, Upload, LogIn, LogOut,
  ArrowRightCircle, CheckCircle, XCircle, Send, Printer
} from 'lucide-react'
import { getAuditLog, AUDIT_ACTIONS } from '../stores/auditLogStore'
import { relativeDate } from '../utils/formatters'

const ACTION_ICONS = {
  [AUDIT_ACTIONS.CREATE]: Plus,
  [AUDIT_ACTIONS.UPDATE]: Edit3,
  [AUDIT_ACTIONS.DELETE]: Trash2,
  [AUDIT_ACTIONS.VIEW]: Eye,
  [AUDIT_ACTIONS.EXPORT]: Download,
  [AUDIT_ACTIONS.IMPORT]: Upload,
  [AUDIT_ACTIONS.LOGIN]: LogIn,
  [AUDIT_ACTIONS.LOGOUT]: LogOut,
  [AUDIT_ACTIONS.STATUS_CHANGE]: ArrowRightCircle,
  [AUDIT_ACTIONS.APPROVE]: CheckCircle,
  [AUDIT_ACTIONS.REJECT]: XCircle,
  [AUDIT_ACTIONS.SEND]: Send,
  [AUDIT_ACTIONS.PRINT]: Printer,
}

const ACTION_COLORS = {
  [AUDIT_ACTIONS.CREATE]: '#10b981',
  [AUDIT_ACTIONS.UPDATE]: '#3b82f6',
  [AUDIT_ACTIONS.DELETE]: '#ef4444',
  [AUDIT_ACTIONS.VIEW]: '#6b7280',
  [AUDIT_ACTIONS.EXPORT]: '#8b5cf6',
  [AUDIT_ACTIONS.IMPORT]: '#06b6d4',
  [AUDIT_ACTIONS.LOGIN]: '#10b981',
  [AUDIT_ACTIONS.LOGOUT]: '#f59e0b',
  [AUDIT_ACTIONS.STATUS_CHANGE]: '#f59e0b',
  [AUDIT_ACTIONS.APPROVE]: '#10b981',
  [AUDIT_ACTIONS.REJECT]: '#ef4444',
  [AUDIT_ACTIONS.SEND]: '#3b82f6',
  [AUDIT_ACTIONS.PRINT]: '#6b7280',
}

function AuditLogViewer({ entityFilter, entityIdFilter }) {
  const [search, setSearch] = useState('')
  const [moduleFilter, setModuleFilter] = useState('')
  const [actionFilter, setActionFilter] = useState('')
  const [page, setPage] = useState(1)
  const [data, setData] = useState({ entries: [], total: 0, totalPages: 0 })

  const loadLog = useCallback(() => {
    const filters = {
      page,
      limit: 30,
      search: search || undefined,
      module: moduleFilter || undefined,
      action: actionFilter || undefined,
      entity: entityFilter || undefined,
      entityId: entityIdFilter || undefined,
    }
    setData(getAuditLog(filters))
  }, [page, search, moduleFilter, actionFilter, entityFilter, entityIdFilter])

  useEffect(() => {
    loadLog()
  }, [loadLog])

  useEffect(() => {
    setPage(1)
  }, [search, moduleFilter, actionFilter])

  const formatChanges = (changes) => {
    if (!changes) return null
    if (typeof changes === 'string') return changes
    if (typeof changes === 'object') {
      return Object.entries(changes).map(([key, val]) => (
        <span key={key} style={{
          display: 'inline-block', padding: '1px 6px', marginRight: '4px',
          borderRadius: '4px', fontSize: '0.7rem',
          background: 'var(--bg-tertiary)', color: 'var(--text-secondary)',
        }}>
          {key}: {typeof val === 'object' ? `${val.from} → ${val.to}` : String(val)}
        </span>
      ))
    }
    return null
  }

  return (
    <div>
      {/* Filters */}
      {!entityFilter && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
          <div style={{
            flex: '1 1 200px', display: 'flex', alignItems: 'center', gap: '8px',
            padding: '8px 12px', background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)', borderRadius: '8px',
          }}>
            <Search size={14} style={{ color: 'var(--text-muted)' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search audit log..."
              style={{
                flex: 1, border: 'none', background: 'transparent',
                color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none',
              }}
            />
          </div>

          <select
            value={moduleFilter}
            onChange={e => setModuleFilter(e.target.value)}
            style={{
              padding: '8px 12px', background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)', borderRadius: '8px',
              color: 'var(--text-primary)', fontSize: '0.8rem',
            }}
          >
            <option value="">All Modules</option>
            {['sales', 'crm', 'hr', 'inventory', 'accounting', 'system'].map(m => (
              <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>
            ))}
          </select>

          <select
            value={actionFilter}
            onChange={e => setActionFilter(e.target.value)}
            style={{
              padding: '8px 12px', background: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)', borderRadius: '8px',
              color: 'var(--text-primary)', fontSize: '0.8rem',
            }}
          >
            <option value="">All Actions</option>
            {Object.values(AUDIT_ACTIONS).map(a => (
              <option key={a} value={a}>{a.replace('_', ' ')}</option>
            ))}
          </select>
        </div>
      )}

      {/* Log entries */}
      {data.entries.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <History size={40} style={{ opacity: 0.3, marginBottom: '8px' }} />
          <p>No audit log entries found.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {data.entries.map((entry, idx) => {
            const Icon = ACTION_ICONS[entry.action] || History
            const color = ACTION_COLORS[entry.action] || '#6b7280'
            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.02 }}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: '12px',
                  padding: '10px 14px', borderRadius: '8px',
                  background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
                }}
              >
                <div style={{
                  width: 28, height: 28, borderRadius: '8px',
                  background: color + '20', color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, marginTop: '2px',
                }}>
                  <Icon size={14} />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                      {entry.user}
                    </span>
                    <span style={{
                      padding: '1px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 500,
                      background: color + '20', color,
                    }}>
                      {entry.action.replace('_', ' ')}
                    </span>
                    {entry.entity && (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {entry.entity}
                      </span>
                    )}
                    {entry.entityName && (
                      <span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                        "{entry.entityName}"
                      </span>
                    )}
                  </div>
                  {entry.changes && (
                    <div style={{ marginTop: '4px' }}>
                      {formatChanges(entry.changes)}
                    </div>
                  )}
                </div>

                <div style={{ flexShrink: 0, textAlign: 'right' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {relativeDate(entry.timestamp)}
                  </div>
                  {entry.module && (
                    <div style={{
                      fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px',
                      textTransform: 'uppercase', letterSpacing: '0.5px',
                    }}>
                      {entry.module}
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      )}

      {/* Pagination */}
      {data.totalPages > 1 && (
        <div style={{
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          gap: '12px', marginTop: '16px',
        }}>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page <= 1}
            style={{
              padding: '6px 10px', borderRadius: '8px',
              background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
              color: page <= 1 ? 'var(--text-muted)' : 'var(--text-primary)',
            }}
          >
            <ChevronLeft size={14} />
          </button>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Page {page} of {data.totalPages} ({data.total} entries)
          </span>
          <button
            onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
            disabled={page >= data.totalPages}
            style={{
              padding: '6px 10px', borderRadius: '8px',
              background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
              color: page >= data.totalPages ? 'var(--text-muted)' : 'var(--text-primary)',
            }}
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  )
}

export default AuditLogViewer
