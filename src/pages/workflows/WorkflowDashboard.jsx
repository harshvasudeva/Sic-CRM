import { useState, useMemo } from 'react'
import { Play, Pause, Plus, Activity, CheckCircle, XCircle, Clock, Settings, Zap } from 'lucide-react'
import { getWorkflowDefinitions, getWorkflowExecutions, toggleWorkflow } from '../../stores/workflowEngine'

export default function WorkflowDashboard() {
  const [definitions, setDefinitions] = useState(getWorkflowDefinitions())
  const executions = getExecutions()
  const [filter, setFilter] = useState('all')

  const filtered = useMemo(() => {
    if (filter === 'all') return definitions
    if (filter === 'active') return definitions.filter(d => d.isActive)
    if (filter === 'inactive') return definitions.filter(d => !d.isActive)
    return definitions
  }, [definitions, filter])

  const stats = useMemo(() => ({
    total: definitions.length,
    active: definitions.filter(d => d.isActive).length,
    executions: executions.length,
    completed: executions.filter(e => e.status === 'completed').length,
    failed: executions.filter(e => e.status === 'failed').length,
  }), [definitions, executions])

  const handleToggle = (id) => {
    toggleWorkflow(id)
    setDefinitions(getWorkflowDefinitions())
  }

  const s = {
    page: { padding: '20px 24px' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    title: { fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' },
    stats: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 20 },
    stat: (color) => ({ padding: 14, borderRadius: 8, background: 'var(--bg-secondary)', border: '1px solid var(--border)', textAlign: 'center' }),
    statNum: (color) => ({ fontSize: 22, fontWeight: 700, color }),
    statLabel: { fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 },
    filters: { display: 'flex', gap: 6, marginBottom: 16 },
    filterBtn: (active) => ({ padding: '5px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600, background: active ? 'var(--accent)' : 'var(--bg-secondary)', color: active ? '#fff' : 'var(--text-secondary)' }),
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 },
    card: { padding: 14, borderRadius: 8, background: 'var(--bg-secondary)', border: '1px solid var(--border)' },
    cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    cardTitle: { fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' },
    badge: (active) => ({ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 4, background: active ? '#10b98120' : '#6b728020', color: active ? '#10b981' : '#6b7280' }),
    cardDesc: { fontSize: 11, color: 'var(--text-secondary)', marginBottom: 8 },
    cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    toggleBtn: (active) => ({ padding: '4px 10px', borderRadius: 4, border: 'none', cursor: 'pointer', fontSize: 10, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, background: active ? '#ef444420' : '#10b98120', color: active ? '#ef4444' : '#10b981' }),
    meta: { fontSize: 10, color: 'var(--text-secondary)' },
  }

  return (
    <div style={s.page}>
      <div style={s.header}>
        <h1 style={s.title}><Zap size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} />Workflow Automation</h1>
      </div>
      <div style={s.stats}>
        <div style={s.stat()}><div style={s.statNum('var(--accent)')}>{stats.total}</div><div style={s.statLabel}>Total Workflows</div></div>
        <div style={s.stat()}><div style={s.statNum('#10b981')}>{stats.active}</div><div style={s.statLabel}>Active</div></div>
        <div style={s.stat()}><div style={s.statNum('#3b82f6')}>{stats.executions}</div><div style={s.statLabel}>Executions</div></div>
        <div style={s.stat()}><div style={s.statNum('#10b981')}>{stats.completed}</div><div style={s.statLabel}>Completed</div></div>
        <div style={s.stat()}><div style={s.statNum('#ef4444')}>{stats.failed}</div><div style={s.statLabel}>Failed</div></div>
      </div>
      <div style={s.filters}>
        {['all', 'active', 'inactive'].map(f => (
          <button key={f} style={s.filterBtn(filter === f)} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>
      <div style={s.grid}>
        {filtered.map(wf => (
          <div key={wf.id} style={s.card}>
            <div style={s.cardHeader}>
              <div style={s.cardTitle}>{wf.name}</div>
              <span style={s.badge(wf.isActive)}>{wf.isActive ? 'Active' : 'Inactive'}</span>
            </div>
            <div style={s.cardDesc}>{wf.description || `Trigger: ${wf.triggerEvent}`}</div>
            <div style={s.cardFooter}>
              <span style={s.meta}>{wf.steps?.length || 0} steps</span>
              <button style={s.toggleBtn(wf.isActive)} onClick={() => handleToggle(wf.id)}>
                {wf.isActive ? <><Pause size={10} /> Disable</> : <><Play size={10} /> Enable</>}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
