import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Flame, Trophy, TrendingUp, AlertTriangle, ChevronDown, Users, Target, BarChart3 } from 'lucide-react'
import { getCreators } from '../../stores/influencerStore'

const card = {
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 12,
  padding: 24,
}

function generateConsistencyData(creators) {
  return creators.map((c, idx) => {
    const seed = c.id || idx + 1
    const currentStreak = 3 + (seed * 7) % 20
    const longestStreak = currentStreak + (seed * 3) % 15
    const avgPostsWeek = (2 + (seed * 11) % 40) / 10 + 1
    const consistencyScore = Math.min(100, Math.round(40 + (seed * 13) % 55))
    const weeksData = Array.from({ length: 12 }, (_, w) => {
      const posted = ((seed * (w + 1) * 17) % 10) > 3
      return posted
    })
    return {
      ...c,
      currentStreak,
      longestStreak,
      avgPostsWeek: avgPostsWeek.toFixed(1),
      consistencyScore,
      weeksData,
      streakAlert: currentStreak < 3 ? 'at-risk' : currentStreak > 14 ? 'hot' : 'normal',
    }
  }).sort((a, b) => b.consistencyScore - a.consistencyScore)
}

function CalendarGrid({ weeks }) {
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {weeks.map((posted, i) => (
        <div key={i} style={{
          width: 14, height: 14, borderRadius: 3,
          background: posted ? 'rgba(99,102,241,0.7)' : 'rgba(255,255,255,0.06)',
          border: posted ? '1px solid rgba(99,102,241,0.4)' : '1px solid rgba(255,255,255,0.05)',
        }} title={`Week ${i + 1}: ${posted ? 'Active' : 'Inactive'}`} />
      ))}
    </div>
  )
}

export default function ConsistencyTracker() {
  const [creators, setCreators] = useState([])
  const [sortBy, setSortBy] = useState('score')

  useEffect(() => {
    const all = getCreators()
    setCreators(all)
  }, [])

  const data = useMemo(() => generateConsistencyData(creators), [creators])

  const sorted = useMemo(() => {
    const arr = [...data]
    if (sortBy === 'score') arr.sort((a, b) => b.consistencyScore - a.consistencyScore)
    else if (sortBy === 'streak') arr.sort((a, b) => b.currentStreak - a.currentStreak)
    else if (sortBy === 'posts') arr.sort((a, b) => parseFloat(b.avgPostsWeek) - parseFloat(a.avgPostsWeek))
    return arr
  }, [data, sortBy])

  const topPerformers = sorted.slice(0, 3)
  const atRisk = data.filter(d => d.streakAlert === 'at-risk')

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
      style={{ padding: 24, color: '#fff', minHeight: '100vh' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Consistency Tracker</h1>
      <p style={{ color: '#94a3b8', marginBottom: 24 }}>Monitor creator posting consistency and streaks</p>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { icon: Users, label: 'Total Creators', value: data.length, color: '#6366f1' },
          { icon: Trophy, label: 'Top Score', value: topPerformers[0]?.consistencyScore || 0, color: '#f59e0b' },
          { icon: Flame, label: 'Longest Streak', value: `${Math.max(...data.map(d => d.longestStreak), 0)}w`, color: '#ef4444' },
          { icon: AlertTriangle, label: 'At Risk', value: atRisk.length, color: '#f97316' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            style={card}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <s.icon size={18} color={s.color} />
              <span style={{ color: '#94a3b8', fontSize: 13 }}>{s.label}</span>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Streak Alerts */}
      {atRisk.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          style={{ ...card, marginBottom: 24, background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.25)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <AlertTriangle size={18} color="#f97316" />
            <h3 style={{ fontSize: 15, fontWeight: 600, color: '#f97316' }}>Streak Alerts - At Risk Creators</h3>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {atRisk.map(c => (
              <span key={c.id || c.name} style={{
                padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                background: 'rgba(249,115,22,0.15)', color: '#f97316', border: '1px solid rgba(249,115,22,0.2)',
              }}>
                {c.name} - {c.currentStreak}w streak
              </span>
            ))}
          </div>
        </motion.div>
      )}

      {/* Sort Controls */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[
          { key: 'score', label: 'Score', icon: Target },
          { key: 'streak', label: 'Streak', icon: Flame },
          { key: 'posts', label: 'Posts/Week', icon: BarChart3 },
        ].map(s => (
          <button key={s.key} onClick={() => setSortBy(s.key)} style={{
            ...card, padding: '8px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            background: sortBy === s.key ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.05)',
            border: sortBy === s.key ? '1px solid rgba(99,102,241,0.4)' : '1px solid rgba(255,255,255,0.1)',
            color: sortBy === s.key ? '#6366f1' : '#94a3b8', fontSize: 13, fontWeight: 500,
          }}>
            <s.icon size={14} /> {s.label}
          </button>
        ))}
      </div>

      {/* Leaderboard */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} style={card}>
        <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>Creator Leaderboard</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {/* Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 120px 200px 100px 100px 80px', gap: 12, padding: '8px 12px' }}>
            {['#', 'Creator', 'Score', 'Activity (12 weeks)', 'Streak', 'Longest', 'Posts/w'].map(h => (
              <span key={h} style={{ color: '#94a3b8', fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>{h}</span>
            ))}
          </div>
          {sorted.map((c, i) => (
            <motion.div key={c.id || i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 + i * 0.03 }}
              style={{
                display: 'grid', gridTemplateColumns: '40px 1fr 120px 200px 100px 100px 80px', gap: 12, padding: '12px',
                borderRadius: 8, alignItems: 'center',
                background: i < 3 ? 'rgba(99,102,241,0.06)' : 'transparent',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
              }}>
              <span style={{
                fontWeight: 700, fontSize: 14,
                color: i === 0 ? '#f59e0b' : i === 1 ? '#94a3b8' : i === 2 ? '#cd7f32' : '#64748b',
              }}>
                {i < 3 ? ['1st', '2nd', '3rd'][i] : i + 1}
              </span>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{c.name}</div>
                <div style={{ fontSize: 11, color: '#94a3b8' }}>{c.platform || 'Instagram'}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 60, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.1)', overflow: 'hidden',
                }}>
                  <div style={{
                    width: `${c.consistencyScore}%`, height: '100%', borderRadius: 3,
                    background: c.consistencyScore > 75 ? '#10b981' : c.consistencyScore > 50 ? '#f59e0b' : '#ef4444',
                  }} />
                </div>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{c.consistencyScore}</span>
              </div>
              <CalendarGrid weeks={c.weeksData} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Flame size={14} color={c.streakAlert === 'hot' ? '#ef4444' : c.streakAlert === 'at-risk' ? '#f97316' : '#94a3b8'} />
                <span style={{ fontSize: 13, fontWeight: 600 }}>{c.currentStreak}w</span>
              </div>
              <span style={{ fontSize: 13, color: '#94a3b8' }}>{c.longestStreak}w</span>
              <span style={{ fontSize: 13, fontWeight: 500 }}>{c.avgPostsWeek}</span>
            </motion.div>
          ))}
          {sorted.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
              <Calendar size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
              <p>No creators found. Add creators to track consistency.</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
