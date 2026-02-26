import { useState } from 'react'
import { Brain, TrendingUp, AlertTriangle, Search, Zap, BarChart3, Target, Shield } from 'lucide-react'
import { runDeduplication, runAnomalyDetection, runPredictiveProcurement, getAIStats } from '../../stores/aiEngineStore'

export default function AIInsights() {
  const [stats] = useState(getAIStats())
  const [loading, setLoading] = useState(null)
  const [results, setResults] = useState(null)

  const runAction = async (action, fn) => {
    setLoading(action)
    setResults(null)
    try {
      const res = fn()
      setResults({ action, data: res })
    } catch (err) {
      setResults({ action, error: err.message })
    }
    setLoading(null)
  }

  const modules = [
    { id: 'dedup', title: 'Deduplication', desc: 'Find and merge duplicate records', icon: Search, color: '#8b5cf6', action: () => runAction('dedup', () => runDeduplication('partner')) },
    { id: 'anomaly', title: 'Anomaly Detection', desc: 'Detect unusual patterns in transactions', icon: AlertTriangle, color: '#ef4444', action: () => runAction('anomaly', () => runAnomalyDetection('transaction_amount')) },
    { id: 'procurement', title: 'Smart Procurement', desc: 'Predict stock needs and reorder points', icon: Target, color: '#10b981', action: () => runAction('procurement', () => runPredictiveProcurement()) },
    { id: 'pricing', title: 'Dynamic Pricing', desc: 'AI-suggested pricing based on demand', icon: TrendingUp, color: '#f59e0b' },
    { id: 'dunning', title: 'Auto Dunning', desc: 'Automated payment reminder sequences', icon: Zap, color: '#3b82f6' },
    { id: 'reconcile', title: 'Bank Reconciliation', desc: 'AI-matched bank transactions', icon: BarChart3, color: '#06b6d4' },
  ]

  const s = {
    page: { padding: '20px 24px' },
    header: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 },
    title: { fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' },
    subtitle: { fontSize: 12, color: 'var(--text-secondary)' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12, marginBottom: 20 },
    card: { padding: 16, borderRadius: 8, background: 'var(--bg-secondary)', border: '1px solid var(--border)', cursor: 'pointer' },
    cardHeader: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 },
    iconWrap: (color) => ({ width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', background: color + '18', color }),
    cardTitle: { fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' },
    cardDesc: { fontSize: 11, color: 'var(--text-secondary)' },
    runBtn: { marginTop: 10, padding: '5px 12px', borderRadius: 4, border: 'none', background: 'var(--accent)', color: '#fff', fontSize: 11, fontWeight: 600, cursor: 'pointer' },
    resultsBox: { marginTop: 16, padding: 16, borderRadius: 8, background: 'var(--bg-secondary)', border: '1px solid var(--border)' },
    resultsTitle: { fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 },
    pre: { fontSize: 11, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', maxHeight: 300, overflow: 'auto' },
  }

  return (
    <div style={s.page}>
      <div style={s.header}>
        <Brain size={24} style={{ color: 'var(--accent)' }} />
        <div>
          <h1 style={s.title}>AI Insights</h1>
          <div style={s.subtitle}>Machine learning powered business intelligence</div>
        </div>
      </div>
      <div style={s.grid}>
        {modules.map(m => (
          <div key={m.id} style={s.card}>
            <div style={s.cardHeader}>
              <div style={s.iconWrap(m.color)}><m.icon size={18} /></div>
              <div>
                <div style={s.cardTitle}>{m.title}</div>
                <div style={s.cardDesc}>{m.desc}</div>
              </div>
            </div>
            {m.action && (
              <button style={s.runBtn} onClick={m.action} disabled={loading === m.id}>
                {loading === m.id ? 'Running...' : 'Run Analysis'}
              </button>
            )}
          </div>
        ))}
      </div>
      {results && (
        <div style={s.resultsBox}>
          <div style={s.resultsTitle}>Results: {results.action}</div>
          <pre style={s.pre}>
            {results.error ? `Error: ${results.error}` : JSON.stringify(results.data, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
