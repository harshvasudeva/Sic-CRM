import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell
} from 'recharts'
import { Image, Film, Layers, Video, LayoutGrid, Award, Users, ChevronDown } from 'lucide-react'
import { getCreators } from '../../stores/influencerStore'

const FORMATS = ['Reel', 'Story', 'Static', 'Carousel', 'Video']
const FORMAT_COLORS = { Reel: '#6366f1', Story: '#f59e0b', Static: '#10b981', Carousel: '#ec4899', Video: '#3b82f6' }
const FORMAT_ICONS = { Reel: Film, Story: Layers, Static: Image, Carousel: LayoutGrid, Video: Video }

const card = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 12,
  padding: 24,
}

function generateFormatData(creator) {
  const seed = creator ? creator.id || 1 : 1
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return months.map((m, i) => ({
    month: m,
    Reel: 8 + ((seed * (i + 1) * 7) % 15),
    Story: 12 + ((seed * (i + 2) * 3) % 20),
    Static: 3 + ((seed * (i + 3) * 5) % 8),
    Carousel: 2 + ((seed * (i + 1) * 11) % 6),
    Video: 1 + ((seed * (i + 2) * 9) % 5),
  }))
}

function generateComparisonTable(data) {
  return FORMATS.map(fmt => {
    const total = data.reduce((s, d) => s + d[fmt], 0)
    const avgEng = (2.1 + (fmt.length * 0.3)).toFixed(1)
    const avgReach = Math.round(total * 120 + fmt.length * 500)
    return { format: fmt, totalPosts: total, avgEngagement: avgEng + '%', avgReach: avgReach.toLocaleString(), icon: FORMAT_ICONS[fmt] }
  })
}

export default function ContentFormatSplit() {
  const [creators, setCreators] = useState([])
  const [selectedCreator, setSelectedCreator] = useState(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  useEffect(() => {
    const all = getCreators()
    setCreators(all)
    if (all.length > 0) setSelectedCreator(all[0])
  }, [])

  const formatData = useMemo(() => generateFormatData(selectedCreator), [selectedCreator])
  const comparison = useMemo(() => generateComparisonTable(formatData), [formatData])

  const pieData = useMemo(() => {
    return FORMATS.map(fmt => ({
      name: fmt,
      value: formatData.reduce((s, d) => s + d[fmt], 0),
    }))
  }, [formatData])

  const bestFormat = useMemo(() => {
    return comparison.reduce((best, cur) => cur.totalPosts > best.totalPosts ? cur : best, comparison[0])
  }, [comparison])

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
      style={{ padding: 24, color: '#fff', minHeight: '100vh' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Content Format Split</h1>
      <p style={{ color: '#94a3b8', marginBottom: 24 }}>Analyze posting patterns by content format</p>

      {/* Creator Selector */}
      <div style={{ position: 'relative', marginBottom: 24, maxWidth: 320 }}>
        <button onClick={() => setDropdownOpen(!dropdownOpen)} style={{
          ...card, width: '100%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          color: '#fff', fontSize: 14,
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Users size={16} color="#6366f1" />
            {selectedCreator?.name || 'Select Creator'}
          </span>
          <ChevronDown size={16} color="#94a3b8" />
        </button>
        {dropdownOpen && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            style={{ ...card, position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, marginTop: 4, padding: 8, maxHeight: 200, overflowY: 'auto' }}>
            {creators.map(c => (
              <div key={c.id} onClick={() => { setSelectedCreator(c); setDropdownOpen(false) }}
                style={{ padding: '8px 12px', borderRadius: 8, cursor: 'pointer', color: selectedCreator?.id === c.id ? '#6366f1' : '#fff', fontSize: 13 }}
                onMouseEnter={e => e.target.style.background = 'rgba(99,102,241,0.15)'}
                onMouseLeave={e => e.target.style.background = 'transparent'}>
                {c.name}
              </div>
            ))}
            {creators.length === 0 && <div style={{ padding: 12, color: '#94a3b8', fontSize: 13 }}>No creators found</div>}
          </motion.div>
        )}
      </div>

      {/* Best Format Badge */}
      {bestFormat && (
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} style={{
          ...card, display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 24, background: 'rgba(99,102,241,0.12)',
          border: '1px solid rgba(99,102,241,0.3)',
        }}>
          <Award size={20} color="#6366f1" />
          <div>
            <div style={{ fontSize: 12, color: '#94a3b8' }}>Best Performing Format</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#6366f1' }}>{bestFormat.format}</div>
          </div>
          <div style={{ marginLeft: 16, fontSize: 13, color: '#94a3b8' }}>
            {bestFormat.totalPosts} posts | {bestFormat.avgEngagement} avg engagement
          </div>
        </motion.div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        {/* Stacked Bar Chart */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} style={card}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Monthly Format Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={formatData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#1e1e2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} />
              <Legend />
              {FORMATS.map(fmt => (
                <Bar key={fmt} dataKey={fmt} stackId="a" fill={FORMAT_COLORS[fmt]} radius={fmt === 'Video' ? [4, 4, 0, 0] : [0, 0, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Pie Chart */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} style={card}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Overall Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={110} paddingAngle={3} dataKey="value">
                {pieData.map((entry, idx) => (
                  <Cell key={idx} fill={FORMAT_COLORS[entry.name]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#1e1e2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Comparison Table */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={card}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Format Comparison</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Format', 'Total Posts', 'Avg Engagement', 'Avg Reach'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {comparison.map((row, i) => {
              const Icon = row.icon
              return (
                <motion.tr key={row.format} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 + i * 0.05 }}
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: FORMAT_COLORS[row.format] }} />
                    <Icon size={16} color={FORMAT_COLORS[row.format]} />
                    <span style={{ fontWeight: 500 }}>{row.format}</span>
                    {row.format === bestFormat?.format && (
                      <span style={{ fontSize: 10, background: 'rgba(99,102,241,0.2)', color: '#6366f1', padding: '2px 8px', borderRadius: 12, fontWeight: 600 }}>BEST</span>
                    )}
                  </td>
                  <td style={{ padding: '12px 16px', fontWeight: 600 }}>{row.totalPosts}</td>
                  <td style={{ padding: '12px 16px', color: '#10b981' }}>{row.avgEngagement}</td>
                  <td style={{ padding: '12px 16px', color: '#94a3b8' }}>{row.avgReach}</td>
                </motion.tr>
              )
            })}
          </tbody>
        </table>
      </motion.div>
    </motion.div>
  )
}
