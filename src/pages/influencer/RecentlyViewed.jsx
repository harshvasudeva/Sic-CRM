import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Clock, Eye, Pin, Trash2, ExternalLink, UserPlus, Mail } from 'lucide-react'
import { getCreators } from '../../stores/influencerStore'

const STORAGE_KEY = 'sic-recently-viewed'

function getRecentlyViewed() {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) return JSON.parse(stored)
  const creators = getCreators()
  const initial = creators.slice(0, 5).map((c, i) => ({
    creatorId: c.id, name: c.name, handle: c.handle, platform: c.platform, niche: c.niche,
    viewedAt: new Date(Date.now() - i * 3600000 * (i + 1)).toISOString(), pinned: i === 0
  }))
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initial))
  return initial
}

const s = {
  page: { padding: '24px', maxWidth: 1100, margin: '0 auto' },
  title: { fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: 20 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  btn: { padding: '8px 16px', borderRadius: 8, background: '#6366f1', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 },
  card: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 16, position: 'relative' },
  avatar: { width: 40, height: 40, borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.85rem', fontWeight: 600 },
  pinBadge: { position: 'absolute', top: 8, right: 8 },
  actions: { display: 'flex', gap: 6, marginTop: 12 },
  actionBtn: { padding: '5px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.08)', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: 4 }
}

function timeAgo(ts) {
  const diff = Date.now() - new Date(ts).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function RecentlyViewed() {
  const [items, setItems] = useState([])

  useEffect(() => { setItems(getRecentlyViewed()) }, [])

  const save = (data) => { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); setItems(data) }
  const togglePin = (id) => save(items.map(i => i.creatorId === id ? { ...i, pinned: !i.pinned } : i))
  const remove = (id) => save(items.filter(i => i.creatorId !== id))
  const clearAll = () => save([])

  const sorted = [...items].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1
    if (!a.pinned && b.pinned) return 1
    return new Date(b.viewedAt) - new Date(a.viewedAt)
  })

  return (
    <div style={s.page}>
      <motion.div style={s.header} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div>
          <h1 style={s.title}><Clock size={22} style={{ color: '#6366f1', marginRight: 8, verticalAlign: 'middle' }} />Recently Viewed</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: -12 }}>Quick access to profiles you've visited recently</p>
        </div>
        {items.length > 0 && <button style={{ ...s.btn, background: 'rgba(239,68,68,0.2)', color: '#ef4444' }} onClick={clearAll}><Trash2 size={14} /> Clear All</button>}
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        {[{ label: 'Recently Viewed', value: items.length, icon: Eye },
          { label: 'Pinned', value: items.filter(i => i.pinned).length, icon: Pin },
          { label: 'Platforms', value: [...new Set(items.map(i => i.platform))].length, icon: ExternalLink }
        ].map((stat, i) => (
          <motion.div key={i} style={s.card} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <stat.icon size={16} style={{ color: '#6366f1', marginBottom: 6 }} />
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff' }}>{stat.value}</div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <div style={s.grid}>
        {sorted.map((item, i) => (
          <motion.div key={item.creatorId} style={{ ...s.card, borderColor: item.pinned ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.1)' }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
            {item.pinned && <div style={s.pinBadge}><Pin size={14} style={{ color: '#fbbf24' }} /></div>}
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8 }}>
              <div style={s.avatar}>{item.name.split(' ').map(n => n[0]).join('')}</div>
              <div>
                <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem' }}>{item.name}</div>
                <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{item.handle}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <span style={{ padding: '2px 8px', borderRadius: 8, fontSize: '0.7rem', background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}>{item.platform}</span>
              <span style={{ padding: '2px 8px', borderRadius: 8, fontSize: '0.7rem', background: 'rgba(255,255,255,0.08)', color: '#94a3b8' }}>{item.niche}</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: 8 }}><Clock size={12} style={{ marginRight: 4, verticalAlign: 'middle' }} />Viewed {timeAgo(item.viewedAt)}</div>
            <div style={s.actions}>
              <button style={s.actionBtn}><Eye size={12} /> View</button>
              <button style={s.actionBtn}><UserPlus size={12} /> Add to Campaign</button>
              <button style={s.actionBtn}><Mail size={12} /> Outreach</button>
              <button style={{ ...s.actionBtn, marginLeft: 'auto' }} onClick={() => togglePin(item.creatorId)}>
                <Pin size={12} /> {item.pinned ? 'Unpin' : 'Pin'}
              </button>
              <button style={{ ...s.actionBtn, color: '#ef4444' }} onClick={() => remove(item.creatorId)}><Trash2 size={12} /></button>
            </div>
          </motion.div>
        ))}
      </div>

      {items.length === 0 && <div style={{ textAlign: 'center', color: '#94a3b8', padding: 40 }}>No recently viewed profiles. Start browsing creators!</div>}
    </div>
  )
}
