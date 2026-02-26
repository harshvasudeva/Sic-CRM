/**
 * NextActionTray - Floating tray showing the user's next actions / follow-ups.
 * Pulls from CRM reminders, pending approvals, overdue invoices, etc.
 * Roadmap item B23.
 *
 * @param {Array} actions - [{id, title, subtitle, type, dueAt, priority, entityType, entityId}]
 * @param {Function} onAction - Called with action object when user clicks
 * @param {Function} onDismiss - Called with action id to dismiss
 * @param {Function} onSnooze - Called with { id, snoozeUntil }
 */
import { useState, useMemo } from 'react'
import { ChevronUp, ChevronDown, Clock, AlertTriangle, CheckCircle, Phone, Mail, FileText, DollarSign, X, BellOff } from 'lucide-react'

const PRIORITY_COLORS = { urgent: '#ef4444', high: '#f59e0b', medium: '#3b82f6', low: '#6b7280' }
const TYPE_ICONS = {
  call: Phone,
  email: Mail,
  approval: CheckCircle,
  invoice: DollarSign,
  task: FileText,
  reminder: Clock,
  overdue: AlertTriangle,
}

export default function NextActionTray({ actions = [], onAction, onDismiss, onSnooze }) {
  const [expanded, setExpanded] = useState(true)
  const [filter, setFilter] = useState('all')

  const sorted = useMemo(() => {
    const priorityWeight = { urgent: 0, high: 1, medium: 2, low: 3 }
    let list = [...actions]
    if (filter !== 'all') list = list.filter(a => a.type === filter)
    return list.sort((a, b) => {
      const pw = (priorityWeight[a.priority] ?? 2) - (priorityWeight[b.priority] ?? 2)
      if (pw !== 0) return pw
      return new Date(a.dueAt || 0) - new Date(b.dueAt || 0)
    })
  }, [actions, filter])

  const overdue = actions.filter(a => a.dueAt && new Date(a.dueAt) < new Date()).length
  const types = [...new Set(actions.map(a => a.type))].filter(Boolean)

  const relTime = (d) => {
    if (!d) return ''
    const diff = new Date(d) - new Date()
    const m = Math.floor(Math.abs(diff) / 60000)
    const past = diff < 0
    if (m < 60) return past ? `${m}m overdue` : `in ${m}m`
    if (m < 1440) return past ? `${Math.floor(m / 60)}h overdue` : `in ${Math.floor(m / 60)}h`
    const days = Math.floor(m / 1440)
    return past ? `${days}d overdue` : `in ${days}d`
  }

  const s = {
    tray: {
      position: 'fixed', bottom: 16, right: 16, width: 320, zIndex: 90,
      background: 'var(--bg-primary)', border: '1px solid var(--border)',
      borderRadius: 10, boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
      display: 'flex', flexDirection: 'column', maxHeight: expanded ? 420 : 44,
      overflow: 'hidden', transition: 'max-height 0.2s ease',
    },
    header: {
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '10px 12px', cursor: 'pointer', borderBottom: expanded ? '1px solid var(--border)' : 'none',
      background: 'var(--bg-secondary)', borderRadius: expanded ? '10px 10px 0 0' : 10,
      flexShrink: 0,
    },
    headerLeft: { display: 'flex', alignItems: 'center', gap: 6 },
    headerTitle: { fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' },
    badge: (color) => ({
      fontSize: 10, fontWeight: 700, color: '#fff', background: color || 'var(--accent)',
      borderRadius: 8, padding: '1px 6px', minWidth: 16, textAlign: 'center',
    }),
    filters: { display: 'flex', gap: 4, padding: '6px 12px', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' },
    filterBtn: (active) => ({
      padding: '2px 8px', borderRadius: 4, border: 'none', cursor: 'pointer',
      fontSize: 10, fontWeight: 600, background: active ? 'var(--accent)' : 'var(--bg-secondary)',
      color: active ? '#fff' : 'var(--text-secondary)',
    }),
    list: { flex: 1, overflow: 'auto', padding: '4px 0' },
    item: {
      display: 'flex', gap: 8, padding: '8px 12px', cursor: 'pointer',
      borderBottom: '1px solid var(--border)', alignItems: 'flex-start',
    },
    iconWrap: (color) => ({
      width: 26, height: 26, borderRadius: '50%', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: (color || '#6b7280') + '18', color: color || '#6b7280',
      flexShrink: 0,
    }),
    body: { flex: 1, minWidth: 0 },
    actionTitle: { fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    subtitle: { fontSize: 11, color: 'var(--text-secondary)', marginTop: 1 },
    due: (overdue) => ({ fontSize: 10, color: overdue ? '#ef4444' : 'var(--text-secondary)', marginTop: 2, fontWeight: overdue ? 600 : 400 }),
    actions: { display: 'flex', gap: 2, flexShrink: 0, marginTop: 2 },
    smallBtn: { background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 2 },
    empty: { padding: 20, textAlign: 'center', fontSize: 12, color: 'var(--text-secondary)' },
    priorityDot: (color) => ({ width: 4, height: '100%', minHeight: 32, borderRadius: 2, background: color, flexShrink: 0 }),
  }

  return (
    <div style={s.tray}>
      <div style={s.header} onClick={() => setExpanded(!expanded)}>
        <div style={s.headerLeft}>
          <Clock size={14} style={{ color: 'var(--accent)' }} />
          <span style={s.headerTitle}>Next Actions</span>
          <span style={s.badge('var(--accent)')}>{actions.length}</span>
          {overdue > 0 && <span style={s.badge('#ef4444')}>{overdue} overdue</span>}
        </div>
        {expanded ? <ChevronDown size={14} style={{ color: 'var(--text-secondary)' }} /> : <ChevronUp size={14} style={{ color: 'var(--text-secondary)' }} />}
      </div>
      {expanded && (
        <>
          {types.length > 1 && (
            <div style={s.filters}>
              <button style={s.filterBtn(filter === 'all')} onClick={() => setFilter('all')}>All</button>
              {types.map(t => (
                <button key={t} style={s.filterBtn(filter === t)} onClick={() => setFilter(t)}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          )}
          <div style={s.list}>
            {sorted.length === 0 && <div style={s.empty}>No pending actions</div>}
            {sorted.map(a => {
              const Icon = TYPE_ICONS[a.type] || Clock
              const pColor = PRIORITY_COLORS[a.priority] || '#6b7280'
              const isOverdue = a.dueAt && new Date(a.dueAt) < new Date()
              return (
                <div key={a.id} style={s.item} onClick={() => onAction?.(a)}>
                  <div style={s.priorityDot(pColor)} />
                  <div style={s.iconWrap(pColor)}><Icon size={12} /></div>
                  <div style={s.body}>
                    <div style={s.actionTitle}>{a.title}</div>
                    {a.subtitle && <div style={s.subtitle}>{a.subtitle}</div>}
                    {a.dueAt && <div style={s.due(isOverdue)}>{relTime(a.dueAt)}</div>}
                  </div>
                  <div style={s.actions}>
                    <button style={s.smallBtn} title="Snooze 1h" onClick={e => {
                      e.stopPropagation()
                      const snooze = new Date(Date.now() + 3600000).toISOString()
                      onSnooze?.({ id: a.id, snoozeUntil: snooze })
                    }}><BellOff size={12} /></button>
                    <button style={s.smallBtn} title="Dismiss" onClick={e => {
                      e.stopPropagation()
                      onDismiss?.(a.id)
                    }}><X size={12} /></button>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
