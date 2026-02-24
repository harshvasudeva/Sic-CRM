import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Activity, Search, Rocket, Heart, Eye, MessageSquare, Filter, Clock, TrendingUp, Users } from 'lucide-react'
import { getActivityFeed } from '../../stores/teamStore'

const s = {
  page: { padding: '24px', maxWidth: 1000, margin: '0 auto' },
  title: { fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: 4 },
  card: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 16 },
  statGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 24 },
  filters: { display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' },
  chip: (active) => ({ padding: '6px 14px', borderRadius: 20, fontSize: '0.8rem', cursor: 'pointer', border: '1px solid', borderColor: active ? '#6366f1' : 'rgba(255,255,255,0.1)', background: active ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)', color: active ? '#818cf8' : '#94a3b8' }),
  timeline: { position: 'relative', paddingLeft: 32 },
  dot: { position: 'absolute', left: 8, width: 12, height: 12, borderRadius: '50%', border: '2px solid #6366f1', background: '#1e1e2e', top: 6 },
  line: { position: 'absolute', left: 13, top: 20, bottom: 0, width: 2, background: 'rgba(99,102,241,0.2)' },
  item: { position: 'relative', paddingBottom: 20 },
  itemContent: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 16px' }
}

const actionIcons = { searched: Search, favorited: Heart, launched: Rocket, commented: MessageSquare }
const actionColors = { searched: '#06b6d4', favorited: '#ec4899', launched: '#10b981', commented: '#f59e0b' }

function timeAgo(ts) {
  const diff = Date.now() - new Date(ts).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

function getTimeGroup(ts) {
  const d = new Date(ts), now = new Date()
  const diffDays = Math.floor((now - d) / 86400000)
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return 'This Week'
  return 'Earlier'
}

export default function TeamActivityFeed() {
  const [feed, setFeed] = useState([])
  const [filter, setFilter] = useState('all')

  useEffect(() => { setFeed(getActivityFeed()) }, [])

  const filtered = filter === 'all' ? feed : feed.filter(a => a.action === filter)
  const grouped = {}
  filtered.forEach(item => {
    const group = getTimeGroup(item.timestamp)
    if (!grouped[group]) grouped[group] = []
    grouped[group].push(item)
  })

  const actionCounts = feed.reduce((acc, a) => { acc[a.action] = (acc[a.action] || 0) + 1; return acc }, {})

  return (
    <div style={s.page}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={s.title}><Activity size={22} style={{ color: '#6366f1', marginRight: 8, verticalAlign: 'middle' }} />Team Activity Feed</h1>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginBottom: 20 }}>See what your team has been doing</p>
      </motion.div>

      <div style={s.statGrid}>
        {[{ label: 'Total Actions', value: feed.length, icon: TrendingUp, color: '#6366f1' },
          { label: 'Team Members', value: [...new Set(feed.map(f => f.userId))].length, icon: Users, color: '#10b981' },
          { label: 'Today', value: feed.filter(f => getTimeGroup(f.timestamp) === 'Today').length, icon: Clock, color: '#f59e0b' }
        ].map((stat, i) => (
          <motion.div key={i} style={s.card} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <stat.icon size={18} style={{ color: stat.color, marginBottom: 6 }} />
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff' }}>{stat.value}</div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <div style={s.filters}>
        <Filter size={16} style={{ color: '#94a3b8', alignSelf: 'center' }} />
        {['all', 'searched', 'favorited', 'launched', 'commented'].map(f => (
          <button key={f} style={s.chip(filter === f)} onClick={() => setFilter(f)}>
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)} {f !== 'all' && `(${actionCounts[f] || 0})`}
          </button>
        ))}
      </div>

      {Object.entries(grouped).map(([group, items]) => (
        <div key={group} style={{ marginBottom: 24 }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>{group}</div>
          <div style={s.timeline}>
            {items.map((item, i) => {
              const Icon = actionIcons[item.action] || Activity
              const color = actionColors[item.action] || '#6366f1'
              return (
                <motion.div key={item.id} style={s.item} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                  <div style={{ ...s.dot, borderColor: color }} />
                  {i < items.length - 1 && <div style={s.line} />}
                  <div style={s.itemContent}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Icon size={14} style={{ color }} />
                      <span style={{ color: '#fff', fontWeight: 500, fontSize: '0.9rem' }}>{item.userName}</span>
                      <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{item.action}</span>
                      <span style={{ color: '#e2e8f0', fontWeight: 500, fontSize: '0.85rem' }}>{item.targetName}</span>
                      <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: '#64748b' }}>{timeAgo(item.timestamp)}</span>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      ))}
      {filtered.length === 0 && <div style={{ textAlign: 'center', color: '#94a3b8', padding: 40 }}>No activity found</div>}
    </div>
  )
}
