/**
 * UniversalTimeline - Shared timeline for activities/comments across any module.
 * @param {string} entityType - Type of parent entity
 * @param {string} entityId - ID of parent entity
 * @param {Array} activities - Array of activity objects
 * @param {Function} onAddActivity - Callback to add an activity
 * @param {Function} onAddComment - Callback to add a comment
 */
import { useState, useMemo, useCallback } from 'react'
import { Phone, Mail, Calendar, FileText, CheckSquare, MessageSquare, Plus, Send, Filter } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const TYPE_CONFIG = {
  call: { icon: Phone, color: '#3b82f6', label: 'Call' },
  email: { icon: Mail, color: '#8b5cf6', label: 'Email' },
  meeting: { icon: Calendar, color: '#f59e0b', label: 'Meeting' },
  note: { icon: FileText, color: '#6b7280', label: 'Note' },
  task: { icon: CheckSquare, color: '#10b981', label: 'Task' },
  comment: { icon: MessageSquare, color: '#ec4899', label: 'Comment' },
}

const FILTERS = ['All', 'Calls', 'Emails', 'Meetings', 'Notes', 'Comments']
const FILTER_MAP = { Calls: 'call', Emails: 'email', Meetings: 'meeting', Notes: 'note', Comments: 'comment' }

function relativeTime(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days}d ago`
  return new Date(dateStr).toLocaleDateString()
}

export default function UniversalTimeline({ entityType, entityId, activities = [], onAddActivity, onAddComment }) {
  const [activeFilter, setActiveFilter] = useState('All')
  const [noteText, setNoteText] = useState('')
  const [expanded, setExpanded] = useState(null)

  const filtered = useMemo(() => {
    const sorted = [...activities].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    if (activeFilter === 'All') return sorted
    const typeKey = FILTER_MAP[activeFilter]
    return sorted.filter(a => a.type === typeKey)
  }, [activities, activeFilter])

  const handleAddNote = useCallback(() => {
    if (!noteText.trim()) return
    onAddComment?.({ entityType, entityId, type: 'note', subject: 'Note', description: noteText.trim(), createdAt: new Date().toISOString(), createdBy: 'Current User' })
    setNoteText('')
  }, [noteText, entityType, entityId, onAddComment])

  const s = {
    container: { background: 'var(--bg-secondary)', borderRadius: 8, border: '1px solid var(--border)', overflow: 'hidden' },
    filters: { display: 'flex', gap: 4, padding: '8px 12px', borderBottom: '1px solid var(--border)', flexWrap: 'wrap' },
    filterBtn: (active) => ({ padding: '4px 10px', borderRadius: 12, border: 'none', fontSize: 12, cursor: 'pointer', background: active ? 'var(--accent)' : 'transparent', color: active ? '#fff' : 'var(--text-secondary)', fontWeight: active ? 600 : 400 }),
    list: { maxHeight: 400, overflowY: 'auto', padding: '8px 0' },
    item: { display: 'flex', gap: 10, padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid var(--border)' },
    iconWrap: (color) => ({ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: color + '20', color, flexShrink: 0 }),
    body: { flex: 1, minWidth: 0 },
    title: { fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' },
    desc: { fontSize: 12, color: 'var(--text-secondary)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    descFull: { fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 },
    meta: { fontSize: 11, color: 'var(--text-secondary)', marginTop: 4, display: 'flex', gap: 8 },
    addArea: { display: 'flex', gap: 8, padding: '10px 12px', borderTop: '1px solid var(--border)', alignItems: 'flex-end' },
    textarea: { flex: 1, background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text-primary)', padding: '6px 8px', fontSize: 12, resize: 'none', minHeight: 36, fontFamily: 'inherit' },
    sendBtn: { padding: '6px 12px', background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 },
    empty: { padding: 24, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 },
  }

  return (
    <div style={s.container}>
      <div style={s.filters}>
        {FILTERS.map(f => (
          <button key={f} style={s.filterBtn(activeFilter === f)} onClick={() => setActiveFilter(f)}>{f}</button>
        ))}
      </div>
      <div style={s.list}>
        {filtered.length === 0 && <div style={s.empty}>No activities yet</div>}
        <AnimatePresence>
          {filtered.map((act, i) => {
            const cfg = TYPE_CONFIG[act.type] || TYPE_CONFIG.note
            const Icon = cfg.icon
            const isExpanded = expanded === act.id
            return (
              <motion.div key={act.id || i} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} style={s.item} onClick={() => setExpanded(isExpanded ? null : act.id)}>
                <div style={s.iconWrap(cfg.color)}><Icon size={15} /></div>
                <div style={s.body}>
                  <div style={s.title}>{act.subject || cfg.label}</div>
                  <div style={isExpanded ? s.descFull : s.desc}>{act.description || act.notes || ''}</div>
                  <div style={s.meta}>
                    <span>{act.createdBy || 'System'}</span>
                    <span>{relativeTime(act.createdAt)}</span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
      {onAddComment && (
        <div style={s.addArea}>
          <textarea style={s.textarea} placeholder="Add a note..." value={noteText} onChange={e => setNoteText(e.target.value)} rows={1} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddNote() } }} />
          <button style={s.sendBtn} onClick={handleAddNote}><Send size={13} /> Add</button>
        </div>
      )}
    </div>
  )
}
