import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ClipboardList, UserCheck, Clock, CheckCircle, AlertCircle, BarChart3 } from 'lucide-react'
import { getCampaignAssignments, assignCampaign, updateAssignment } from '../../stores/teamStore'
import { getCampaigns } from '../../stores/influencerStore'

const s = {
  page: { padding: '24px', maxWidth: 1100, margin: '0 auto' },
  title: { fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: 20 },
  card: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 16 },
  statGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 24 },
  table: { width: '100%', borderCollapse: 'separate', borderSpacing: '0 4px' },
  th: { textAlign: 'left', padding: '8px 12px', color: '#94a3b8', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' },
  td: { padding: '12px', color: '#e2e8f0', fontSize: '0.85rem', background: 'rgba(255,255,255,0.03)', borderTop: '1px solid rgba(255,255,255,0.05)' },
  statusBadge: (status) => {
    const colors = { assigned: { bg: 'rgba(59,130,246,0.2)', color: '#60a5fa' }, in_progress: { bg: 'rgba(245,158,11,0.2)', color: '#fbbf24' }, completed: { bg: 'rgba(16,185,129,0.2)', color: '#34d399' } }
    const c = colors[status] || colors.assigned
    return { padding: '3px 10px', borderRadius: 12, fontSize: '0.75rem', background: c.bg, color: c.color, display: 'inline-block' }
  },
  select: { padding: '6px 10px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '0.8rem' },
  avatar: { width: 28, height: 28, borderRadius: '50%', background: '#6366f1', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.65rem', fontWeight: 600, marginRight: 8 }
}

const teamMembers = [
  { id: 'usr-001', name: 'Harsh V' },
  { id: 'usr-002', name: 'Priya Mehta' },
  { id: 'usr-003', name: 'Arjun Nair' }
]

export default function CampaignAssignments() {
  const [assignments, setAssignments] = useState([])
  const [campaigns, setCampaigns] = useState([])

  useEffect(() => {
    setAssignments(getCampaignAssignments())
    setCampaigns(getCampaigns())
  }, [])

  const handleStatusChange = (id, status) => {
    updateAssignment(id, { status })
    setAssignments(getCampaignAssignments())
  }

  const stats = {
    total: assignments.length,
    assigned: assignments.filter(a => a.status === 'assigned').length,
    inProgress: assignments.filter(a => a.status === 'in_progress').length,
    completed: assignments.filter(a => a.status === 'completed').length
  }

  const workload = teamMembers.map(m => ({
    ...m,
    count: assignments.filter(a => a.assigneeId === m.id && a.status !== 'completed').length
  }))

  return (
    <div style={s.page}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={s.title}><ClipboardList size={22} style={{ color: '#6366f1', marginRight: 8, verticalAlign: 'middle' }} />Campaign Assignments</h1>
      </motion.div>

      <div style={s.statGrid}>
        {[{ label: 'Total Assignments', value: stats.total, icon: ClipboardList, color: '#6366f1' },
          { label: 'Assigned', value: stats.assigned, icon: UserCheck, color: '#3b82f6' },
          { label: 'In Progress', value: stats.inProgress, icon: Clock, color: '#f59e0b' },
          { label: 'Completed', value: stats.completed, icon: CheckCircle, color: '#10b981' }
        ].map((stat, i) => (
          <motion.div key={i} style={s.card} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <stat.icon size={18} style={{ color: stat.color, marginBottom: 6 }} />
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff' }}>{stat.value}</div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20 }}>
        <motion.div style={s.card} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h3 style={{ color: '#fff', fontSize: '1rem', marginBottom: 12 }}>Assignments</h3>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Campaign</th>
                <th style={s.th}>Assignee</th>
                <th style={s.th}>Status</th>
                <th style={s.th}>Due Date</th>
                <th style={s.th}>Notes</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((a, i) => (
                <motion.tr key={a.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
                  <td style={s.td}>
                    <div style={{ fontWeight: 500 }}>{a.campaignName}</div>
                  </td>
                  <td style={s.td}>
                    <span style={s.avatar}>{a.assigneeName?.split(' ').map(n => n[0]).join('')}</span>
                    {a.assigneeName}
                  </td>
                  <td style={s.td}>
                    <select style={s.select} value={a.status} onChange={e => handleStatusChange(a.id, e.target.value)}>
                      <option value="assigned">Assigned</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </td>
                  <td style={s.td}>{a.dueDate}</td>
                  <td style={{ ...s.td, fontSize: '0.8rem', color: '#94a3b8', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.notes}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {assignments.length === 0 && <div style={{ color: '#94a3b8', textAlign: 'center', padding: 32 }}>No assignments yet</div>}
        </motion.div>

        <motion.div style={s.card} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
          <h3 style={{ color: '#fff', fontSize: '1rem', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 6 }}><BarChart3 size={16} /> Workload</h3>
          {workload.map((m, i) => (
            <div key={m.id} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: '#e2e8f0', fontSize: '0.85rem' }}>{m.name}</span>
                <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{m.count} active</span>
              </div>
              <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.1)' }}>
                <motion.div
                  style={{ height: '100%', borderRadius: 3, background: m.count > 3 ? '#ef4444' : m.count > 1 ? '#f59e0b' : '#10b981' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(m.count * 25, 100)}%` }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                />
              </div>
            </div>
          ))}
          {workload.every(m => m.count === 0) && <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>All team members are free</div>}
        </motion.div>
      </div>
    </div>
  )
}
