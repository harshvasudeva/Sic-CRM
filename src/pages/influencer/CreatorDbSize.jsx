import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Database, TrendingUp, Users, Clock, BarChart3, PieChart as PieIcon } from 'lucide-react'
import {
  LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { getCreatorDbStats } from '../../stores/subscriptionStore'
import { getCreators } from '../../stores/influencerStore'

const card = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }
const accent = '#6366f1'
const muted = '#94a3b8'
const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6']

const customTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ ...card, padding: '8px 12px', fontSize: 12 }}>
      <div style={{ color: muted, marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || '#fff' }}>
          {p.name}: {p.value}
        </div>
      ))}
    </div>
  )
}

function PieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) {
  if (percent < 0.05) return null
  const RADIAN = Math.PI / 180
  const radius = innerRadius + (outerRadius - innerRadius) * 1.4
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="#d1d5db" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={11}>
      {name} ({(percent * 100).toFixed(0)}%)
    </text>
  )
}

export default function CreatorDbSize() {
  const [stats, setStats] = useState(null)
  const [creators, setCreators] = useState([])

  useEffect(() => {
    setStats(getCreatorDbStats())
    setCreators(getCreators())
  }, [])

  if (!stats) return null

  const platformData = Object.entries(stats.byPlatform || {}).map(([name, value]) => ({ name, value }))
  const nicheData = Object.entries(stats.byNiche || {}).map(([name, value]) => ({ name, value }))
  const tierData = Object.entries(stats.byTier || {}).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }))

  const kpis = [
    { label: 'Total Creators', value: stats.totalCreators, icon: Users, color: '#6366f1' },
    { label: 'Added This Month', value: stats.addedThisMonth, icon: TrendingUp, color: '#10b981' },
    { label: 'Platforms', value: Object.keys(stats.byPlatform || {}).length, icon: Database, color: '#8b5cf6' },
    { label: 'Niches Covered', value: Object.keys(stats.byNiche || {}).length, icon: BarChart3, color: '#06b6d4' }
  ]

  return (
    <div style={{ padding: 24, color: '#fff', maxWidth: 1200, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Creator Database Size</h1>
        <p style={{ color: muted, fontSize: 14, marginBottom: 24 }}>
          Overview of your creator database growth and composition
        </p>
      </motion.div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {kpis.map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            style={{ ...card, padding: 20, display: 'flex', alignItems: 'center', gap: 14 }}
          >
            <div style={{ width: 44, height: 44, borderRadius: 10, background: `${kpi.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <kpi.icon size={22} color={kpi.color} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: muted, textTransform: 'uppercase', letterSpacing: 0.5 }}>{kpi.label}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: kpi.color }}>{kpi.value}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Big Number */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
        style={{ ...card, padding: 32, textAlign: 'center', marginBottom: 28, background: `linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.05))` }}
      >
        <Database size={32} color={accent} style={{ marginBottom: 8 }} />
        <div style={{ fontSize: 56, fontWeight: 900, color: accent }}>{stats.totalCreators}</div>
        <div style={{ color: muted, fontSize: 14 }}>Total Creators in Database</div>
        <div style={{ color: '#10b981', fontSize: 13, marginTop: 6 }}>
          +{stats.addedThisMonth} added this month
        </div>
      </motion.div>

      {/* Growth Chart */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        style={{ ...card, padding: 20, marginBottom: 28 }}
      >
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <TrendingUp size={18} color={accent} /> Database Growth
        </h2>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={stats.growthHistory || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="month" tick={{ fill: muted, fontSize: 11 }} />
            <YAxis tick={{ fill: muted, fontSize: 11 }} />
            <Tooltip content={customTooltip} />
            <Line type="monotone" dataKey="count" stroke={accent} strokeWidth={2} dot={{ r: 4, fill: accent }} name="Creators" />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Pie Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 28 }}>
        {[
          { title: 'By Platform', data: platformData, icon: PieIcon },
          { title: 'By Niche', data: nicheData, icon: BarChart3 },
          { title: 'By Tier', data: tierData, icon: Users }
        ].map((chart, ci) => (
          <motion.div
            key={ci}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + ci * 0.1 }}
            style={{ ...card, padding: 20 }}
          >
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
              <chart.icon size={16} color={accent} /> {chart.title}
            </h3>
            {chart.data.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={chart.data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={PieLabel}>
                    {chart.data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={customTooltip} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', color: muted, fontSize: 13 }}>
                No data yet
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Last Updated */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
        style={{ ...card, padding: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
      >
        <Clock size={14} color={muted} />
        <span style={{ color: muted, fontSize: 12 }}>Last updated: {stats.lastUpdated}</span>
      </motion.div>

      {/* Creator List Preview */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
        style={{ ...card, padding: 20, marginTop: 20 }}
      >
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 14 }}>Recent Creators</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {creators.slice(0, 6).map((cr) => (
            <div key={cr.id} style={{ ...card, padding: 14 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>{cr.name}</div>
              <div style={{ color: muted, fontSize: 12 }}>{cr.handle} | {cr.platform}</div>
              <div style={{ color: accent, fontSize: 12, marginTop: 4 }}>
                {cr.followers >= 1000000 ? `${(cr.followers / 1000000).toFixed(1)}M` : `${(cr.followers / 1000).toFixed(0)}K`} followers
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
