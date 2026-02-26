import { useState, useMemo } from 'react'
import { AlertTriangle, CheckCircle, Shield, TrendingUp } from 'lucide-react'
import { getAnomalyAlerts, resolveAnomaly } from '../../stores/aiEngineStore'

export default function AnomalyDashboard() {
  const [alerts, setAlerts] = useState(getAnomalyAlerts())
  const [filter, setFilter] = useState('all')

  const filtered = useMemo(() => {
    if (filter === 'all') return alerts
    if (filter === 'unresolved') return alerts.filter(a => !a.isResolved)
    if (filter === 'high') return alerts.filter(a => a.severity === 'high')
    return alerts
  }, [alerts, filter])

  const handleResolve = (id) => {
    resolveAnomaly(id)
    setAlerts(getAnomalyAlerts())
  }

  const s = {
    page: { padding: '20px 24px' },
    title: { fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 },
    filters: { display: 'flex', gap: 6, marginBottom: 16 },
    filterBtn: (active) => ({ padding: '5px 14px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600, background: active ? 'var(--accent)' : 'var(--bg-secondary)', color: active ? '#fff' : 'var(--text-secondary)' }),
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { textAlign: 'left', padding: '8px 12px', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '2px solid var(--border)', background: 'var(--bg-secondary)' },
    td: { padding: '8px 12px', fontSize: 12, color: 'var(--text-primary)', borderBottom: '1px solid var(--border)' },
    severity: (s) => ({ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 4, background: s === 'high' ? '#ef444420' : s === 'medium' ? '#f59e0b20' : '#6b728020', color: s === 'high' ? '#ef4444' : s === 'medium' ? '#f59e0b' : '#6b7280' }),
    resolveBtn: { padding: '3px 8px', borderRadius: 4, border: 'none', cursor: 'pointer', fontSize: 10, fontWeight: 600, background: '#10b98120', color: '#10b981' },
    empty: { padding: 40, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 },
  }

  return (
    <div style={s.page}>
      <h1 style={s.title}><Shield size={20} /> Anomaly Detection</h1>
      <div style={s.filters}>
        {['all', 'unresolved', 'high'].map(f => (
          <button key={f} style={s.filterBtn(filter === f)} onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <div style={s.empty}>No anomalies detected</div>
      ) : (
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Type</th>
              <th style={s.th}>Expected</th>
              <th style={s.th}>Actual</th>
              <th style={s.th}>Deviation</th>
              <th style={s.th}>Severity</th>
              <th style={s.th}>Date</th>
              <th style={s.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(a => (
              <tr key={a.id}>
                <td style={s.td}>{a.metricType}</td>
                <td style={s.td}>{typeof a.expectedValue === 'number' ? a.expectedValue.toFixed(2) : a.expectedValue}</td>
                <td style={s.td}>{typeof a.actualValue === 'number' ? a.actualValue.toFixed(2) : a.actualValue}</td>
                <td style={s.td}>{a.deviation ? `${a.deviation}σ` : '-'}</td>
                <td style={s.td}><span style={s.severity(a.severity)}>{a.severity}</span></td>
                <td style={s.td}>{new Date(a.createdAt).toLocaleDateString()}</td>
                <td style={s.td}>
                  {!a.isResolved ? (
                    <button style={s.resolveBtn} onClick={() => handleResolve(a.id)}>Resolve</button>
                  ) : <CheckCircle size={14} style={{ color: '#10b981' }} />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
