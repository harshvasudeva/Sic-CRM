import { useState, useMemo } from 'react'
import { CheckCircle, XCircle, Clock, AlertTriangle, ChevronRight } from 'lucide-react'
import { getApprovalRequests, approveRequest, rejectRequest } from '../../stores/workflowEngine'
import ApprovalWidget from '../../components/ApprovalWidget'

export default function ApprovalCenter() {
  const [requests, setRequests] = useState(getApprovalRequests())
  const [filter, setFilter] = useState('pending')
  const [selected, setSelected] = useState(null)

  const filtered = useMemo(() => {
    if (filter === 'all') return requests
    return requests.filter(r => r.status === filter)
  }, [requests, filter])

  const stats = {
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
  }

  const handleApprove = (id, comment) => {
    approveRequest(id, 'current_user', comment)
    setRequests(getApprovalRequests())
    setSelected(null)
  }

  const handleReject = (id, comment) => {
    rejectRequest(id, 'current_user', comment)
    setRequests(getApprovalRequests())
    setSelected(null)
  }

  const s = {
    page: { padding: '20px 24px' },
    title: { fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20 },
    stats: { display: 'flex', gap: 12, marginBottom: 16 },
    statBox: (color) => ({ flex: 1, padding: 12, borderRadius: 8, background: 'var(--bg-secondary)', border: '1px solid var(--border)', textAlign: 'center' }),
    statNum: (color) => ({ fontSize: 20, fontWeight: 700, color }),
    statLabel: { fontSize: 11, color: 'var(--text-secondary)' },
    filters: { display: 'flex', gap: 6, marginBottom: 16 },
    filterBtn: (active) => ({ padding: '5px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600, background: active ? 'var(--accent)' : 'var(--bg-secondary)', color: active ? '#fff' : 'var(--text-secondary)' }),
    list: { display: 'flex', flexDirection: 'column', gap: 8 },
    item: { padding: 14, borderRadius: 8, background: 'var(--bg-secondary)', border: '1px solid var(--border)', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    itemLeft: { flex: 1 },
    itemTitle: { fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' },
    itemMeta: { fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 },
    statusBadge: (status) => {
      const colors = { pending: '#f59e0b', approved: '#10b981', rejected: '#ef4444' }
      return { fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 4, background: (colors[status] || '#6b7280') + '20', color: colors[status] || '#6b7280' }
    },
    empty: { padding: 40, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 },
  }

  return (
    <div style={s.page}>
      <h1 style={s.title}>Approval Center</h1>
      <div style={s.stats}>
        <div style={s.statBox('#f59e0b')}><div style={s.statNum('#f59e0b')}>{stats.pending}</div><div style={s.statLabel}>Pending</div></div>
        <div style={s.statBox('#10b981')}><div style={s.statNum('#10b981')}>{stats.approved}</div><div style={s.statLabel}>Approved</div></div>
        <div style={s.statBox('#ef4444')}><div style={s.statNum('#ef4444')}>{stats.rejected}</div><div style={s.statLabel}>Rejected</div></div>
      </div>
      <div style={s.filters}>
        {['pending', 'approved', 'rejected', 'all'].map(f => (
          <button key={f} style={s.filterBtn(filter === f)} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>
      <div style={s.list}>
        {filtered.length === 0 && <div style={s.empty}>No approval requests found</div>}
        {filtered.map(req => (
          <div key={req.id} style={s.item} onClick={() => setSelected(req)}>
            <div style={s.itemLeft}>
              <div style={s.itemTitle}>{req.title || `Approval #${req.id.slice(0, 8)}`}</div>
              <div style={s.itemMeta}>
                {req.entityType} &middot; Requested {new Date(req.createdAt).toLocaleDateString()}
              </div>
            </div>
            <span style={s.statusBadge(req.status)}>{req.status}</span>
            <ChevronRight size={14} style={{ color: 'var(--text-secondary)', marginLeft: 8 }} />
          </div>
        ))}
      </div>
    </div>
  )
}
