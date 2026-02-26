/**
 * NotificationCenter - Global notification bell + dropdown panel.
 * @param {Array} notifications - Array of notification objects
 * @param {Function} onMarkRead - Called with notification id
 * @param {Function} onMarkAllRead - Called to mark all as read
 * @param {Function} onDismiss - Called with { id, entityType, entityId } for navigation
 */
import { useState, useMemo, useRef, useEffect } from 'react'
import { Bell, AlertTriangle, Calendar, Clock, CheckCircle, DollarSign, Settings, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const TYPE_ICONS = {
  low_stock: AlertTriangle,
  leave_request: Calendar,
  crm_reminder: Bell,
  approval_needed: CheckCircle,
  payment_received: DollarSign,
  system: Settings,
}
const TYPE_COLORS = {
  low_stock: '#f59e0b',
  leave_request: '#8b5cf6',
  crm_reminder: '#3b82f6',
  approval_needed: '#10b981',
  payment_received: '#10b981',
  system: '#6b7280',
}

function groupByDate(items) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const yesterday = today - 86400000
  const groups = { Today: [], Yesterday: [], Earlier: [] }
  items.forEach(n => {
    const t = new Date(n.createdAt).getTime()
    if (t >= today) groups.Today.push(n)
    else if (t >= yesterday) groups.Yesterday.push(n)
    else groups.Earlier.push(n)
  })
  return groups
}

export default function NotificationCenter({ notifications = [], onMarkRead, onMarkAllRead, onDismiss }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const unreadCount = useMemo(() => notifications.filter(n => !n.isRead).length, [notifications])
  const groups = useMemo(() => groupByDate(notifications), [notifications])

  useEffect(() => {
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const s = {
    wrap: { position: 'relative', display: 'inline-block' },
    bellBtn: { background: 'none', border: 'none', cursor: 'pointer', position: 'relative', padding: 4, color: 'var(--text-secondary)' },
    badge: { position: 'absolute', top: -2, right: -2, background: '#ef4444', color: '#fff', fontSize: 9, fontWeight: 700, borderRadius: '50%', width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' },
    panel: { position: 'absolute', top: '100%', right: 0, marginTop: 8, width: 340, maxHeight: 440, background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.25)', zIndex: 100, overflow: 'hidden', display: 'flex', flexDirection: 'column' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderBottom: '1px solid var(--border)' },
    title: { fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' },
    markAll: { background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: 'var(--accent)' },
    list: { flex: 1, overflowY: 'auto' },
    groupLabel: { fontSize: 10, fontWeight: 600, color: 'var(--text-secondary)', padding: '6px 12px', textTransform: 'uppercase', letterSpacing: 0.5 },
    item: (read) => ({
      display: 'flex', gap: 8, padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid var(--border)',
      background: read ? 'transparent' : 'var(--accent)08', opacity: read ? 0.7 : 1,
    }),
    iconWrap: (color) => ({ width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: (color || '#6b7280') + '20', color: color || '#6b7280', flexShrink: 0 }),
    body: { flex: 1, minWidth: 0 },
    ntitle: { fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' },
    msg: { fontSize: 11, color: 'var(--text-secondary)', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    time: { fontSize: 10, color: 'var(--text-secondary)', marginTop: 2 },
    dot: { width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0, marginTop: 4 },
    empty: { padding: 24, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 12 },
  }

  const relTime = (d) => {
    if (!d) return ''
    const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000)
    if (m < 1) return 'just now'
    if (m < 60) return `${m}m ago`
    if (m < 1440) return `${Math.floor(m / 60)}h ago`
    return `${Math.floor(m / 1440)}d ago`
  }

  return (
    <div style={s.wrap} ref={ref}>
      <button style={s.bellBtn} onClick={() => setOpen(!open)}>
        <Bell size={18} />
        {unreadCount > 0 && <span style={s.badge}>{unreadCount > 9 ? '9+' : unreadCount}</span>}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div style={s.panel} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>
            <div style={s.header}>
              <span style={s.title}>Notifications</span>
              {unreadCount > 0 && <button style={s.markAll} onClick={onMarkAllRead}>Mark all read</button>}
            </div>
            <div style={s.list}>
              {notifications.length === 0 && <div style={s.empty}>No notifications</div>}
              {Object.entries(groups).map(([label, items]) => items.length > 0 && (
                <div key={label}>
                  <div style={s.groupLabel}>{label}</div>
                  {items.map(n => {
                    const Icon = TYPE_ICONS[n.type] || Bell
                    const color = TYPE_COLORS[n.type] || '#6b7280'
                    return (
                      <div key={n.id} style={s.item(n.isRead)} onClick={() => { onMarkRead?.(n.id); onDismiss?.(n) }}>
                        <div style={s.iconWrap(color)}><Icon size={13} /></div>
                        <div style={s.body}>
                          <div style={s.ntitle}>{n.title}</div>
                          {n.message && <div style={s.msg}>{n.message}</div>}
                          <div style={s.time}>{relTime(n.createdAt)}</div>
                        </div>
                        {!n.isRead && <div style={s.dot} />}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
