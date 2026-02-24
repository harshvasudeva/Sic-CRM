import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Music2, Users, Eye, Heart, Repeat2, Search, Filter, ArrowUpDown,
  ExternalLink, TrendingUp, Play, BarChart3
} from 'lucide-react'

const card = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }
const accent = '#6366f1'
const muted = '#94a3b8'
const tiktokPink = '#ff0050'

const sampleCreators = [
  {
    id: 'tt-001', name: 'Rahul Dance King', handle: '@rahuldanceking',
    followers: 2800000, avgViews: 450000, likesRatio: 12.5, duets: 3200,
    niche: 'Dance & Comedy', city: 'Mumbai', verified: true,
    categories: ['Dance', 'Comedy', 'Transitions'],
    topVideos: [
      { title: 'Viral dance challenge', views: 8500000, likes: 920000 },
      { title: 'Comedy skit with friends', views: 3200000, likes: 340000 },
      { title: 'Transition compilation', views: 5100000, likes: 580000 }
    ],
    monthlyGrowth: [
      { month: 'Sep', followers: 2200000 }, { month: 'Oct', followers: 2350000 },
      { month: 'Nov', followers: 2500000 }, { month: 'Dec', followers: 2620000 },
      { month: 'Jan', followers: 2710000 }, { month: 'Feb', followers: 2800000 }
    ]
  },
  {
    id: 'tt-002', name: 'Kavya Kitchen', handle: '@kavyaskitchen',
    followers: 1500000, avgViews: 280000, likesRatio: 9.8, duets: 1800,
    niche: 'Food & Recipes', city: 'Delhi', verified: true,
    categories: ['Recipes', 'Quick Meals', 'Street Food'],
    topVideos: [
      { title: 'Street food tour Delhi', views: 4200000, likes: 380000 },
      { title: '5-min dinner recipe', views: 2800000, likes: 310000 },
      { title: 'Chai making secrets', views: 3500000, likes: 420000 }
    ],
    monthlyGrowth: [
      { month: 'Sep', followers: 980000 }, { month: 'Oct', followers: 1080000 },
      { month: 'Nov', followers: 1190000 }, { month: 'Dec', followers: 1300000 },
      { month: 'Jan', followers: 1400000 }, { month: 'Feb', followers: 1500000 }
    ]
  },
  {
    id: 'tt-003', name: 'Siddharth Fitness', handle: '@sidfit',
    followers: 920000, avgViews: 165000, likesRatio: 11.2, duets: 950,
    niche: 'Fitness & Health', city: 'Bangalore', verified: false,
    categories: ['Workout Routines', 'Nutrition Tips', 'Transformation'],
    topVideos: [
      { title: '30-day ab challenge', views: 2100000, likes: 245000 },
      { title: 'Protein meal prep', views: 1800000, likes: 190000 },
      { title: 'Home workout no equipment', views: 2500000, likes: 280000 }
    ],
    monthlyGrowth: [
      { month: 'Sep', followers: 620000 }, { month: 'Oct', followers: 690000 },
      { month: 'Nov', followers: 750000 }, { month: 'Dec', followers: 810000 },
      { month: 'Jan', followers: 870000 }, { month: 'Feb', followers: 920000 }
    ]
  }
]

const fmt = (n) => {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`
  return String(n)
}

export default function TikTokCreators() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCreator, setSelectedCreator] = useState(null)
  const [sortBy, setSortBy] = useState('followers')
  const [importStatus, setImportStatus] = useState({})

  const filtered = sampleCreators
    .filter(c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.handle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.niche.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => b[sortBy] - a[sortBy])

  const handleImport = (id) => {
    setImportStatus(prev => ({ ...prev, [id]: 'importing' }))
    setTimeout(() => {
      setImportStatus(prev => ({ ...prev, [id]: 'imported' }))
    }, 1500)
  }

  return (
    <div style={{ padding: 24, color: '#fff', maxWidth: 1200, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <Music2 size={28} color={tiktokPink} />
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>TikTok Creators</h1>
        </div>
        <p style={{ color: muted, fontSize: 14, marginBottom: 24 }}>
          Discover and import TikTok creators for your campaigns
        </p>
      </motion.div>

      {/* Search & Filters */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        style={{ display: 'flex', gap: 10, marginBottom: 24 }}
      >
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={16} color={muted} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by name, handle, or niche..."
            style={{
              width: '100%', padding: '10px 12px 10px 36px', borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)',
              color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box'
            }}
          />
        </div>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          style={{
            padding: '10px 14px', borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)',
            color: '#fff', fontSize: 13, outline: 'none', cursor: 'pointer'
          }}
        >
          <option value="followers">Sort: Followers</option>
          <option value="avgViews">Sort: Avg Views</option>
          <option value="likesRatio">Sort: Likes Ratio</option>
          <option value="duets">Sort: Duets</option>
        </select>
      </motion.div>

      {/* Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total Creators', value: sampleCreators.length, icon: Users, color: tiktokPink },
          { label: 'Avg Followers', value: fmt(Math.round(sampleCreators.reduce((s, c) => s + c.followers, 0) / sampleCreators.length)), icon: Users, color: '#8b5cf6' },
          { label: 'Avg Views', value: fmt(Math.round(sampleCreators.reduce((s, c) => s + c.avgViews, 0) / sampleCreators.length)), icon: Eye, color: '#06b6d4' },
          { label: 'Avg Likes Ratio', value: `${(sampleCreators.reduce((s, c) => s + c.likesRatio, 0) / sampleCreators.length).toFixed(1)}%`, icon: Heart, color: '#ef4444' }
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            style={{ ...card, padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}
          >
            <div style={{ width: 38, height: 38, borderRadius: 8, background: `${stat.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <stat.icon size={18} color={stat.color} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: muted, textTransform: 'uppercase' }}>{stat.label}</div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{stat.value}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Creator Cards */}
      <div style={{ display: 'grid', gap: 16 }}>
        {filtered.map((creator, i) => (
          <motion.div
            key={creator.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.08 }}
            style={{ ...card, padding: 20 }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', gap: 14, flex: 1 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 12,
                  background: `linear-gradient(135deg, ${tiktokPink}, #00f2ea)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: 20
                }}>
                  {creator.name.charAt(0)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                    <span style={{ fontWeight: 700, fontSize: 16 }}>{creator.name}</span>
                    {creator.verified && (
                      <span style={{ background: '#00f2ea22', color: '#00f2ea', fontSize: 10, padding: '2px 6px', borderRadius: 4, fontWeight: 600 }}>
                        Verified
                      </span>
                    )}
                  </div>
                  <div style={{ color: muted, fontSize: 13, marginBottom: 6 }}>{creator.handle} | {creator.city}</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {creator.categories.map((cat, ci) => (
                      <span key={ci} style={{
                        background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: 4,
                        fontSize: 11, color: '#d1d5db'
                      }}>
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Metrics */}
              <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
                {[
                  { label: 'Followers', value: fmt(creator.followers), icon: Users },
                  { label: 'Avg Views', value: fmt(creator.avgViews), icon: Eye },
                  { label: 'Likes Ratio', value: `${creator.likesRatio}%`, icon: Heart },
                  { label: 'Duets', value: fmt(creator.duets), icon: Repeat2 }
                ].map((m, mi) => (
                  <div key={mi} style={{ textAlign: 'center', minWidth: 70 }}>
                    <div style={{ color: muted, fontSize: 10, textTransform: 'uppercase', marginBottom: 2 }}>{m.label}</div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{m.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Videos */}
            <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: 12, color: muted, marginBottom: 8, fontWeight: 600 }}>Top Videos</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {creator.topVideos.map((vid, vi) => (
                  <div key={vi} style={{
                    background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: 10,
                    display: 'flex', alignItems: 'center', gap: 8
                  }}>
                    <Play size={14} color={tiktokPink} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {vid.title}
                      </div>
                      <div style={{ fontSize: 11, color: muted }}>{fmt(vid.views)} views | {fmt(vid.likes)} likes</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div style={{ marginTop: 14, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setSelectedCreator(selectedCreator === creator.id ? null : creator.id)}
                style={{
                  padding: '6px 14px', borderRadius: 6,
                  border: '1px solid rgba(255,255,255,0.15)', background: 'transparent',
                  color: '#fff', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4
                }}
              >
                <BarChart3 size={12} /> Compare
              </button>
              <button
                onClick={() => handleImport(creator.id)}
                disabled={importStatus[creator.id] === 'imported'}
                style={{
                  padding: '6px 14px', borderRadius: 6, border: 'none',
                  background: importStatus[creator.id] === 'imported' ? '#10b981' : tiktokPink,
                  color: '#fff', cursor: importStatus[creator.id] === 'imported' ? 'default' : 'pointer',
                  fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4
                }}
              >
                {importStatus[creator.id] === 'importing' ? 'Importing...'
                  : importStatus[creator.id] === 'imported' ? 'Imported'
                  : <><ExternalLink size={12} /> Import to CRM</>}
              </button>
            </div>

            {/* Dual-platform comparison */}
            {selectedCreator === creator.id && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 10 }}>TikTok vs Instagram Comparison</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                  {[
                    { metric: 'Followers', tiktok: fmt(creator.followers), instagram: fmt(Math.round(creator.followers * 0.6)) },
                    { metric: 'Avg Views', tiktok: fmt(creator.avgViews), instagram: fmt(Math.round(creator.avgViews * 0.35)) },
                    { metric: 'Eng. Rate', tiktok: `${creator.likesRatio}%`, instagram: `${(creator.likesRatio * 0.7).toFixed(1)}%` },
                    { metric: 'CPV Est.', tiktok: '$0.02', instagram: '$0.05' }
                  ].map((row, ri) => (
                    <div key={ri} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: 10, textAlign: 'center' }}>
                      <div style={{ fontSize: 10, color: muted, marginBottom: 4 }}>{row.metric}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                        <div><div style={{ fontSize: 9, color: tiktokPink }}>TikTok</div><div style={{ fontSize: 13, fontWeight: 600 }}>{row.tiktok}</div></div>
                        <div><div style={{ fontSize: 9, color: '#E1306C' }}>Instagram</div><div style={{ fontSize: 13, fontWeight: 600 }}>{row.instagram}</div></div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}
