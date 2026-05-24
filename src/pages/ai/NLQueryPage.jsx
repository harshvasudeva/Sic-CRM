import { useState } from 'react'
import { Search, Send, Database, Sparkles } from 'lucide-react'
import { processNLQuery } from '../../stores/aiEngineStore'

export default function NLQueryPage() {
  const [query, setQuery] = useState('')
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    const result = processNLQuery(query)
    setHistory([{ query, result, timestamp: new Date() }, ...history])
    setQuery('')
    setLoading(false)
  }

  const examples = [
    'Show me total revenue this quarter',
    'Which customers have overdue invoices?',
    'Top 10 selling products by quantity',
    'How many new leads this month?',
    'Average deal size by sales rep',
  ]

  const s = {
    page: { padding: '20px 24px', maxWidth: 800 },
    header: { marginBottom: 20 },
    title: { fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 },
    subtitle: { fontSize: 12, color: 'var(--text-secondary)', marginTop: 4 },
    form: { display: 'flex', gap: 8, marginBottom: 16 },
    input: { flex: 1, padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: 13 },
    submitBtn: { padding: '10px 16px', borderRadius: 8, border: 'none', background: 'var(--accent)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600 },
    examples: { display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 },
    exampleBtn: { padding: '4px 10px', borderRadius: 4, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-secondary)', fontSize: 11, cursor: 'pointer' },
    resultCard: { padding: 14, borderRadius: 8, background: 'var(--bg-secondary)', border: '1px solid var(--border)', marginBottom: 10 },
    resultQuery: { fontSize: 12, fontWeight: 600, color: 'var(--accent)', marginBottom: 6 },
    resultIntent: { fontSize: 11, color: 'var(--text-secondary)', marginBottom: 4 },
    resultData: { fontSize: 11, color: 'var(--text-primary)', background: 'var(--bg-primary)', padding: 8, borderRadius: 4, whiteSpace: 'pre-wrap', maxHeight: 200, overflow: 'auto' },
    time: { fontSize: 10, color: 'var(--text-secondary)', marginTop: 6 },
    empty: { padding: 40, textAlign: 'center', color: 'var(--text-secondary)' },
  }

  return (
    <div style={s.page}>
      <div style={s.header}>
        <h1 style={s.title}><Sparkles size={20} /> Natural Language Query</h1>
        <div style={s.subtitle}>Ask questions about your business data in plain English</div>
      </div>
      <form style={s.form} onSubmit={handleSubmit}>
        <input style={s.input} value={query} onChange={e => setQuery(e.target.value)} placeholder="Ask anything about your data..." />
        <button style={s.submitBtn} type="submit" disabled={loading}>
          <Send size={14} /> {loading ? 'Thinking...' : 'Ask'}
        </button>
      </form>
      <div style={s.examples}>
        {examples.map(ex => (
          <button key={ex} style={s.exampleBtn} onClick={() => setQuery(ex)}>{ex}</button>
        ))}
      </div>
      {history.length === 0 && (
        <div style={s.empty}>
          <Database size={32} style={{ opacity: 0.3, marginBottom: 8 }} />
          <div style={{ fontSize: 13 }}>Ask a question to get started</div>
        </div>
      )}
      {history.map((h, i) => (
        <div key={i} style={s.resultCard}>
          <div style={s.resultQuery}>{h.query}</div>
          <div style={s.resultIntent}>Intent: {h.result?.intent || 'unknown'}</div>
          <div style={s.resultData}>
            {h.result?.message || JSON.stringify(h.result?.data || h.result, null, 2)}
          </div>
          <div style={s.time}>{h.timestamp.toLocaleTimeString()}</div>
        </div>
      ))}
    </div>
  )
}
