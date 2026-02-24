import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Youtube, Users, Eye, Clock, DollarSign, TrendingUp, Search,
  Play, BarChart3, MousePointerClick, ArrowUpDown
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const card = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }
const accent = '#6366f1'
const muted = '#94a3b8'
const ytRed = '#ff0000'

const sampleCreators = [
  {
    id: 'yt-001', name: 'Tech Rohan Official', handle: '@TechRohanOfficial',
    subscribers: 1800000, avgViews: 320000, watchTime: '8:42', cpm: 4.50, ctr: 6.2,
    niche: 'Tech Reviews', city: 'Bangalore', verified: true,
    revenueEstimate: 14400,
    videos: [
      { title: 'iPhone 17 Pro Max Review', views: 890000, likes: 45000, date: '2026-02-15' },
      { title: 'Best Budget Phones 2026', views: 620000, likes: 32000, date: '2026-02-08' },
      { title: 'Galaxy S26 Ultra vs iPhone 17', views: 1200000, likes: 68000, date: '2026-01-28' },
      { title: 'Top 10 Gadgets Under 5000', views: 450000, likes: 28000, date: '2026-01-20' },
      { title: 'OnePlus 14 Unboxing', views: 380000, likes: 22000, date: '2026-01-12' },
      { title: 'Best Wireless Earbuds 2026', views: 290000, likes: 18000, date: '2026-01-05' },
      { title: 'MacBook Pro M5 Review', views: 520000, likes: 35000, date: '2025-12-28' },
      { title: 'Camera Comparison: Pixel vs Samsung', views: 410000, likes: 24000, date: '2025-12-18' },
      { title: 'Best Laptops for Students', views: 340000, likes: 20000, date: '2025-12-10' },
      { title: 'Smart Home Setup Guide', views: 270000, likes: 16000, date: '2025-12-01' }
    ],
    growth: [
      { month: 'Sep', subs: 1420000 }, { month: 'Oct', subs: 1510000 },
      { month: 'Nov', subs: 1590000 }, { month: 'Dec', subs: 1660000 },
      { month: 'Jan', subs: 1740000 }, { month: 'Feb', subs: 1800000 }
    ]
  },
  {
    id: 'yt-002', name: 'Kavita Vlogs', handle: '@KavitaVlogs',
    subscribers: 950000, avgViews: 180000, watchTime: '12:15', cpm: 3.20, ctr: 5.8,
    niche: 'Travel & Lifestyle', city: 'Mumbai', verified: true,
    revenueEstimate: 5760,
    videos: [
      { title: 'Bali on a Budget', views: 420000, likes: 35000, date: '2026-02-12' },
      { title: 'Goa Travel Guide 2026', views: 380000, likes: 28000, date: '2026-02-01' },
      { title: 'Japan Cherry Blossom Season', views: 520000, likes: 42000, date: '2026-01-22' },
      { title: 'Best Cafes in Mumbai', views: 210000, likes: 18000, date: '2026-01-15' },
      { title: 'Thailand Street Food Tour', views: 340000, likes: 29000, date: '2026-01-08' },
      { title: 'Ladakh Road Trip Vlog', views: 290000, likes: 24000, date: '2025-12-28' },
      { title: 'Kerala Houseboat Experience', views: 180000, likes: 15000, date: '2025-12-20' },
      { title: 'Rajasthan Heritage Tour', views: 250000, likes: 20000, date: '2025-12-12' },
      { title: 'Vietnam on $30/day', views: 310000, likes: 26000, date: '2025-12-05' },
      { title: 'Best Hidden Beaches in India', views: 160000, likes: 13000, date: '2025-11-28' }
    ],
    growth: [
      { month: 'Sep', subs: 680000 }, { month: 'Oct', subs: 740000 },
      { month: 'Nov', subs: 790000 }, { month: 'Dec', subs: 840000 },
      { month: 'Jan', subs: 900000 }, { month: 'Feb', subs: 950000 }
    ]
  },
  {
    id: 'yt-003', name: 'Chef Arjun', handle: '@ChefArjun',
    subscribers: 620000, avgViews: 95000, watchTime: '10:30', cpm: 2.80, ctr: 4.5,
    niche: 'Cooking & Food', city: 'Chennai', verified: false,
    revenueEstimate: 2660,
    videos: [
      { title: 'Perfect Biryani Recipe', views: 280000, likes: 22000, date: '2026-02-10' },
      { title: '10 South Indian Breakfast Ideas', views: 190000, likes: 15000, date: '2026-02-02' },
      { title: 'Street Food at Home', views: 150000, likes: 12000, date: '2026-01-25' },
      { title: 'Dosa Mastery Guide', views: 210000, likes: 18000, date: '2026-01-18' },
      { title: 'Quick Dinner Recipes', views: 120000, likes: 9500, date: '2026-01-10' },
      { title: 'Restaurant Style Paneer', views: 95000, likes: 7800, date: '2026-01-02' },
      { title: 'Authentic Filter Coffee', views: 180000, likes: 14000, date: '2025-12-25' },
      { title: 'Christmas Special Cake', views: 130000, likes: 10000, date: '2025-12-18' },
      { title: 'Healthy Meal Prep Ideas', views: 85000, likes: 6500, date: '2025-12-10' },
      { title: 'Budget Cooking Challenge', views: 110000, likes: 8800, date: '2025-12-01' }
    ],
    growth: [
      { month: 'Sep', subs: 410000 }, { month: 'Oct', subs: 450000 },
      { month: 'Nov', subs: 490000 }, { month: 'Dec', subs: 530000 },
      { month: 'Jan', subs: 580000 }, { month: 'Feb', subs: 620000 }
    ]
  }
]

const fmt = (n) => {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`
  return String(n)
}

const customTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ ...card, padding: '8px 12px', fontSize: 12 }}>
      <div style={{ color: muted, marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color }}>{p.name}: {typeof p.value === 'number' ? fmt(p.value) : p.value}</div>
      ))}
    </div>
  )
}

export default function YouTubeCreators() {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  const [sortBy, setSortBy] = useState('subscribers')

  const filtered = sampleCreators
    .filter(c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.handle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.niche.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => b[sortBy] - a[sortBy])

  return (
    <div style={{ padding: 24, color: '#fff', maxWidth: 1200, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <Youtube size={28} color={ytRed} />
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>YouTube Creators</h1>
        </div>
        <p style={{ color: muted, fontSize: 14, marginBottom: 24 }}>
          Browse YouTube channels, analyze performance, and estimate revenue
        </p>
      </motion.div>

      {/* Search & Sort */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={16} color={muted} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by name, handle, or niche..."
            style={{
              width: '100%', padding: '10px 12px 10px 36px', borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)',
              color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box'
            }}
          />
        </div>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{
          padding: '10px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)',
          background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: 13, outline: 'none', cursor: 'pointer'
        }}>
          <option value="subscribers">Subscribers</option>
          <option value="avgViews">Avg Views</option>
          <option value="cpm">CPM</option>
          <option value="ctr">CTR</option>
          <option value="revenueEstimate">Revenue</option>
        </select>
      </motion.div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Channels', value: sampleCreators.length, icon: Youtube, color: ytRed },
          { label: 'Avg Subs', value: fmt(Math.round(sampleCreators.reduce((s, c) => s + c.subscribers, 0) / sampleCreators.length)), icon: Users, color: '#8b5cf6' },
          { label: 'Avg Views', value: fmt(Math.round(sampleCreators.reduce((s, c) => s + c.avgViews, 0) / sampleCreators.length)), icon: Eye, color: '#06b6d4' },
          { label: 'Avg CPM', value: `$${(sampleCreators.reduce((s, c) => s + c.cpm, 0) / sampleCreators.length).toFixed(2)}`, icon: DollarSign, color: '#10b981' },
          { label: 'Avg CTR', value: `${(sampleCreators.reduce((s, c) => s + c.ctr, 0) / sampleCreators.length).toFixed(1)}%`, icon: MousePointerClick, color: '#f59e0b' }
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}
            style={{ ...card, padding: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: `${stat.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <stat.icon size={16} color={stat.color} />
            </div>
            <div>
              <div style={{ fontSize: 10, color: muted, textTransform: 'uppercase' }}>{stat.label}</div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{stat.value}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Creator Cards */}
      {filtered.map((creator, ci) => (
        <motion.div
          key={creator.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 + ci * 0.08 }}
          style={{ ...card, padding: 20, marginBottom: 16 }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', gap: 14 }}>
              <div style={{
                width: 56, height: 56, borderRadius: 12, background: `linear-gradient(135deg, ${ytRed}, #ff6666)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 20
              }}>
                {creator.name.charAt(0)}
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                  <span style={{ fontWeight: 700, fontSize: 16 }}>{creator.name}</span>
                  {creator.verified && (
                    <span style={{ background: '#ef444422', color: ytRed, fontSize: 10, padding: '2px 6px', borderRadius: 4, fontWeight: 600 }}>Verified</span>
                  )}
                </div>
                <div style={{ color: muted, fontSize: 13 }}>{creator.handle} | {creator.niche} | {creator.city}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 20 }}>
              {[
                { label: 'Subscribers', value: fmt(creator.subscribers) },
                { label: 'Avg Views', value: fmt(creator.avgViews) },
                { label: 'Watch Time', value: creator.watchTime },
                { label: 'CPM', value: `$${creator.cpm}` },
                { label: 'CTR', value: `${creator.ctr}%` }
              ].map((m, mi) => (
                <div key={mi} style={{ textAlign: 'center', minWidth: 65 }}>
                  <div style={{ color: muted, fontSize: 10, textTransform: 'uppercase', marginBottom: 2 }}>{m.label}</div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{m.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue Estimate */}
          <div style={{
            marginTop: 14, padding: '10px 14px', borderRadius: 8,
            background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <DollarSign size={16} color="#10b981" />
              <span style={{ fontSize: 13, color: '#10b981', fontWeight: 600 }}>
                Estimated Monthly Revenue: ${creator.revenueEstimate.toLocaleString()}
              </span>
            </div>
            <button
              onClick={() => setExpandedId(expandedId === creator.id ? null : creator.id)}
              style={{
                padding: '4px 12px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.15)',
                background: 'transparent', color: '#fff', cursor: 'pointer', fontSize: 12
              }}
            >
              {expandedId === creator.id ? 'Collapse' : 'View Videos & Growth'}
            </button>
          </div>

          {/* Expanded Section */}
          {expandedId === creator.id && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: 16 }}>
              {/* Video Performance Table */}
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Video Performance (Last 10)</div>
              <div style={{ overflowX: 'auto', marginBottom: 20 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                      {['#', 'Title', 'Views', 'Likes', 'Eng Rate', 'Date'].map(h => (
                        <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontSize: 11, color: muted, fontWeight: 600 }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {creator.videos.map((vid, vi) => (
                      <tr key={vi} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '8px 10px', fontSize: 12, color: muted }}>{vi + 1}</td>
                        <td style={{ padding: '8px 10px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Play size={12} color={ytRed} /> {vid.title}
                        </td>
                        <td style={{ padding: '8px 10px', fontSize: 12, fontWeight: 600 }}>{fmt(vid.views)}</td>
                        <td style={{ padding: '8px 10px', fontSize: 12 }}>{fmt(vid.likes)}</td>
                        <td style={{ padding: '8px 10px', fontSize: 12, color: '#10b981' }}>
                          {(vid.likes / vid.views * 100).toFixed(1)}%
                        </td>
                        <td style={{ padding: '8px 10px', fontSize: 12, color: muted }}>{vid.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Subscriber Growth Chart */}
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>Subscriber Growth</div>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={creator.growth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="month" tick={{ fill: muted, fontSize: 11 }} />
                  <YAxis tick={{ fill: muted, fontSize: 11 }} tickFormatter={fmt} />
                  <Tooltip content={customTooltip} />
                  <Line type="monotone" dataKey="subs" stroke={ytRed} strokeWidth={2} dot={{ r: 3, fill: ytRed }} name="Subscribers" />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>
          )}
        </motion.div>
      ))}
    </div>
  )
}
