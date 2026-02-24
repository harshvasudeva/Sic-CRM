import { useState } from 'react'
import { motion } from 'framer-motion'
import { Key, Copy, RefreshCw, Shield, Globe, Webhook, CheckCircle } from 'lucide-react'

const s = {
  page: { padding: '24px', maxWidth: 1000, margin: '0 auto' },
  title: { fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: 20 },
  card: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 20, marginBottom: 16 },
  cardTitle: { fontSize: '1rem', fontWeight: 600, color: '#fff', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 },
  input: { width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '0.9rem', fontFamily: 'monospace' },
  btn: { padding: '8px 16px', borderRadius: 8, background: '#6366f1', color: '#fff', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' },
  btnSec: { padding: '8px 16px', borderRadius: 8, background: 'rgba(255,255,255,0.1)', color: '#e2e8f0', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '8px 12px', color: '#94a3b8', fontSize: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.1)' },
  td: { padding: '10px 12px', color: '#e2e8f0', fontSize: '0.85rem', borderBottom: '1px solid rgba(255,255,255,0.05)' },
  meter: { height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.1)', marginTop: 6 },
  meterFill: (pct) => ({ height: '100%', borderRadius: 3, width: `${pct}%`, background: pct > 80 ? '#ef4444' : pct > 50 ? '#f59e0b' : '#10b981' }),
  method: (m) => ({ padding: '2px 8px', borderRadius: 4, fontSize: '0.7rem', fontWeight: 600, fontFamily: 'monospace', background: m === 'GET' ? 'rgba(16,185,129,0.2)' : m === 'POST' ? 'rgba(59,130,246,0.2)' : 'rgba(245,158,11,0.2)', color: m === 'GET' ? '#34d399' : m === 'POST' ? '#60a5fa' : '#fbbf24' })
}

const endpoints = [
  { method: 'GET', path: '/api/v1/creators', desc: 'List all creators with filters' },
  { method: 'GET', path: '/api/v1/creators/:id', desc: 'Get single creator details' },
  { method: 'GET', path: '/api/v1/campaigns', desc: 'List campaigns' },
  { method: 'POST', path: '/api/v1/search', desc: 'Search creators with filters' },
  { method: 'GET', path: '/api/v1/analytics/:creatorId', desc: 'Get creator analytics' },
  { method: 'POST', path: '/api/v1/campaigns', desc: 'Create a campaign' },
  { method: 'PUT', path: '/api/v1/campaigns/:id', desc: 'Update a campaign' },
  { method: 'GET', path: '/api/v1/reports', desc: 'Generate reports' }
]

export default function ApiAccess() {
  const [apiKey] = useState('sk_live_' + 'x'.repeat(24) + 'a4f2')
  const [copied, setCopied] = useState(false)
  const [webhookUrl, setWebhookUrl] = useState('')
  const [ipWhitelist, setIpWhitelist] = useState('0.0.0.0/0')

  const masked = apiKey.slice(0, 8) + '*'.repeat(24) + apiKey.slice(-4)
  const usage = { today: 47, limit: 1000, quota: 95 }

  const handleCopy = () => {
    navigator.clipboard?.writeText(apiKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={s.page}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={s.title}><Key size={22} style={{ color: '#6366f1', marginRight: 8, verticalAlign: 'middle' }} />API Access</h1>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: 20 }}>Enterprise API access for programmatic creator database queries</p>
      </motion.div>

      <motion.div style={s.card} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div style={s.cardTitle}><Key size={16} /> API Key</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input style={s.input} value={masked} readOnly />
          <button style={s.btn} onClick={handleCopy}>
            {copied ? <><CheckCircle size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
          </button>
          <button style={s.btnSec}><RefreshCw size={14} /> Regenerate</button>
        </div>
        <p style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: 8 }}>Keep this key secret. Regenerating will invalidate the old key.</p>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
        {[{ label: 'Requests Today', value: usage.today, max: usage.limit, pct: Math.round(usage.today / usage.limit * 100) },
          { label: 'Rate Limit', value: '100 req/min', pct: 0 },
          { label: 'Monthly Quota', value: `${usage.quota}%`, pct: usage.quota }
        ].map((stat, i) => (
          <motion.div key={i} style={s.card} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{stat.label}</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff' }}>{typeof stat.value === 'number' ? `${stat.value} / ${stat.max}` : stat.value}</div>
            {stat.pct > 0 && <div style={s.meter}><div style={s.meterFill(stat.pct)} /></div>}
          </motion.div>
        ))}
      </div>

      <motion.div style={s.card} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <div style={s.cardTitle}><Globe size={16} /> API Endpoints</div>
        <table style={s.table}>
          <thead><tr><th style={s.th}>Method</th><th style={s.th}>Endpoint</th><th style={s.th}>Description</th></tr></thead>
          <tbody>
            {endpoints.map((ep, i) => (
              <tr key={i}>
                <td style={s.td}><span style={s.method(ep.method)}>{ep.method}</span></td>
                <td style={{ ...s.td, fontFamily: 'monospace', fontSize: '0.8rem' }}>{ep.path}</td>
                <td style={s.td}>{ep.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <motion.div style={s.card} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <div style={s.cardTitle}><Webhook size={16} /> Webhook Configuration</div>
          <label style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: 6, display: 'block' }}>Webhook URL</label>
          <input style={s.input} placeholder="https://your-app.com/webhook" value={webhookUrl} onChange={e => setWebhookUrl(e.target.value)} />
          <p style={{ color: '#64748b', fontSize: '0.75rem', marginTop: 6 }}>We'll POST events (new creators, campaign updates) to this URL</p>
        </motion.div>

        <motion.div style={s.card} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
          <div style={s.cardTitle}><Shield size={16} /> IP Whitelist</div>
          <label style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: 6, display: 'block' }}>Allowed IPs (one per line)</label>
          <textarea style={{ ...s.input, minHeight: 80, resize: 'vertical' }} value={ipWhitelist} onChange={e => setIpWhitelist(e.target.value)} />
          <p style={{ color: '#64748b', fontSize: '0.75rem', marginTop: 6 }}>Use 0.0.0.0/0 to allow all IPs</p>
        </motion.div>
      </div>
    </div>
  )
}
