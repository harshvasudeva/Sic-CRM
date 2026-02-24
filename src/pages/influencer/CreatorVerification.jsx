import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ShieldCheck, CheckCircle, XCircle, Clock, Users, BarChart3,
  Eye, FileText, UserCheck, AlertTriangle, Search, BadgeCheck
} from 'lucide-react'
import { getCreators, verifyCreator } from '../../stores/influencerStore'

const card = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12 }
const accent = '#6366f1'
const muted = '#94a3b8'

const verificationStatusConfig = {
  verified: { bg: '#10b98122', color: '#10b981', icon: CheckCircle, label: 'Verified' },
  rejected: { bg: '#ef444422', color: '#ef4444', icon: XCircle, label: 'Rejected' },
  unverified: { bg: '#f59e0b22', color: '#f59e0b', icon: Clock, label: 'Pending' }
}

const checklistItems = [
  { id: 'stats', label: 'Statistics Verified', desc: 'Follower count and engagement rates match public data' },
  { id: 'identity', label: 'Identity Confirmed', desc: 'Creator identity verified through platform or ID check' },
  { id: 'content', label: 'Content Reviewed', desc: 'Content quality and brand safety check completed' },
  { id: 'audience', label: 'Audience Quality', desc: 'Audience authenticity check (no fake followers)' },
  { id: 'brand', label: 'Brand Safety', desc: 'No controversial or harmful content found' }
]

const fmt = (n) => {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`
  return String(n)
}

export default function CreatorVerification() {
  const [creators, setCreators] = useState([])
  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCreator, setSelectedCreator] = useState(null)
  const [checklist, setChecklist] = useState({})
  const [processing, setProcessing] = useState(null)

  useEffect(() => {
    const data = getCreators().map(c => ({
      ...c,
      verificationStatus: c.verificationStatus || 'unverified'
    }))
    setCreators(data)
  }, [])

  const filtered = creators
    .filter(c => filter === 'all' || c.verificationStatus === filter)
    .filter(c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.handle.toLowerCase().includes(searchQuery.toLowerCase())
    )

  const stats = {
    total: creators.length,
    verified: creators.filter(c => c.verificationStatus === 'verified').length,
    pending: creators.filter(c => c.verificationStatus === 'unverified').length,
    rejected: creators.filter(c => c.verificationStatus === 'rejected').length
  }

  const handleVerify = (creatorId, status) => {
    setProcessing(creatorId)
    setTimeout(() => {
      verifyCreator(creatorId, status)
      setCreators(prev => prev.map(c => c.id === creatorId ? { ...c, verificationStatus: status } : c))
      setProcessing(null)
      if (selectedCreator?.id === creatorId) {
        setSelectedCreator(prev => ({ ...prev, verificationStatus: status }))
      }
    }, 800)
  }

  const toggleCheck = (creatorId, checkId) => {
    setChecklist(prev => ({
      ...prev,
      [creatorId]: {
        ...(prev[creatorId] || {}),
        [checkId]: !(prev[creatorId]?.[checkId])
      }
    }))
  }

  const getChecklistProgress = (creatorId) => {
    const checks = checklist[creatorId] || {}
    const completed = Object.values(checks).filter(Boolean).length
    return { completed, total: checklistItems.length, pct: Math.round((completed / checklistItems.length) * 100) }
  }

  return (
    <div style={{ padding: 24, color: '#fff', maxWidth: 1200, margin: '0 auto' }}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <ShieldCheck size={28} color={accent} />
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Creator Verification</h1>
        </div>
        <p style={{ color: muted, fontSize: 14, marginBottom: 24 }}>
          Review and verify creators in your database
        </p>
      </motion.div>

      {/* Stats Dashboard */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total Creators', value: stats.total, icon: Users, color: accent },
          { label: 'Verified', value: stats.verified, icon: CheckCircle, color: '#10b981' },
          { label: 'Pending Review', value: stats.pending, icon: Clock, color: '#f59e0b' },
          { label: 'Rejected', value: stats.rejected, icon: XCircle, color: '#ef4444' }
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            style={{ ...card, padding: 16, display: 'flex', alignItems: 'center', gap: 12 }}
          >
            <div style={{ width: 40, height: 40, borderRadius: 8, background: `${stat.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <stat.icon size={18} color={stat.color} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: muted, textTransform: 'uppercase' }}>{stat.label}</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: stat.color }}>{stat.value}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filter & Search */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        style={{ display: 'flex', gap: 10, marginBottom: 20 }}
      >
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={16} color={muted} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search creators..."
            style={{
              width: '100%', padding: '10px 12px 10px 36px', borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)',
              color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box'
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {['all', 'unverified', 'verified', 'rejected'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '8px 14px', borderRadius: 8, border: 'none',
                background: filter === f ? accent : 'rgba(255,255,255,0.05)',
                color: '#fff', cursor: 'pointer', fontSize: 12, fontWeight: 500, textTransform: 'capitalize'
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedCreator ? '1fr 1fr' : '1fr', gap: 20 }}>
        {/* Creator Queue */}
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: muted }}>
            Verification Queue ({filtered.length})
          </div>
          <div style={{ display: 'grid', gap: 10 }}>
            {filtered.map((creator, i) => {
              const st = verificationStatusConfig[creator.verificationStatus] || verificationStatusConfig.unverified
              const StIcon = st.icon
              const isSelected = selectedCreator?.id === creator.id

              return (
                <motion.div
                  key={creator.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => setSelectedCreator(creator)}
                  style={{
                    ...card, padding: 16, cursor: 'pointer',
                    border: isSelected ? `1px solid ${accent}` : card.border,
                    transition: 'border-color 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 42, height: 42, borderRadius: 10,
                        background: `${accent}22`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: 16, color: accent
                      }}>
                        {creator.name.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{creator.name}</div>
                        <div style={{ color: muted, fontSize: 12 }}>{creator.handle} | {creator.platform} | {fmt(creator.followers)} followers</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        background: st.bg, color: st.color, padding: '3px 10px',
                        borderRadius: 20, fontSize: 11, fontWeight: 600
                      }}>
                        <StIcon size={12} /> {st.label}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Detail Panel */}
        <AnimatePresence>
          {selectedCreator && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              style={{ position: 'sticky', top: 24, alignSelf: 'start' }}
            >
              <div style={{ ...card, padding: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 12, background: `${accent}22`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: 22, color: accent
                  }}>
                    {selectedCreator.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 18 }}>{selectedCreator.name}</div>
                    <div style={{ color: muted, fontSize: 13 }}>{selectedCreator.handle} | {selectedCreator.platform}</div>
                  </div>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
                  {[
                    { label: 'Followers', value: fmt(selectedCreator.followers) },
                    { label: 'Avg Views', value: fmt(selectedCreator.avgViews || 0) },
                    { label: 'Niche', value: selectedCreator.niche }
                  ].map((s, si) => (
                    <div key={si} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: 10, textAlign: 'center' }}>
                      <div style={{ fontSize: 10, color: muted, textTransform: 'uppercase', marginBottom: 2 }}>{s.label}</div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{s.value}</div>
                    </div>
                  ))}
                </div>

                {/* Verification Checklist */}
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Verification Checklist</div>
                <div style={{ marginBottom: 10 }}>
                  {(() => {
                    const progress = getChecklistProgress(selectedCreator.id)
                    return (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: 12, color: muted }}>{progress.completed}/{progress.total} completed</span>
                          <span style={{ fontSize: 12, fontWeight: 600, color: progress.pct === 100 ? '#10b981' : accent }}>{progress.pct}%</span>
                        </div>
                        <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.08)' }}>
                          <div style={{ height: '100%', borderRadius: 3, background: progress.pct === 100 ? '#10b981' : accent, width: `${progress.pct}%`, transition: 'width 0.3s' }} />
                        </div>
                      </div>
                    )
                  })()}
                </div>
                <div style={{ display: 'grid', gap: 6, marginBottom: 20 }}>
                  {checklistItems.map(item => {
                    const checked = checklist[selectedCreator.id]?.[item.id]
                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleCheck(selectedCreator.id, item.id)}
                        style={{
                          background: checked ? 'rgba(16,185,129,0.06)' : 'rgba(255,255,255,0.03)',
                          border: `1px solid ${checked ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)'}`,
                          borderRadius: 8, padding: '10px 12px', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: 10
                        }}
                      >
                        <div style={{
                          width: 20, height: 20, borderRadius: 4,
                          border: `2px solid ${checked ? '#10b981' : 'rgba(255,255,255,0.2)'}`,
                          background: checked ? '#10b981' : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                        }}>
                          {checked && <CheckCircle size={12} color="#fff" />}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500, textDecoration: checked ? 'line-through' : 'none', opacity: checked ? 0.7 : 1 }}>{item.label}</div>
                          <div style={{ fontSize: 11, color: muted }}>{item.desc}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Badge Display */}
                <div style={{ marginBottom: 20, display: 'flex', gap: 8 }}>
                  {['verified', 'unverified', 'rejected'].map(status => {
                    const cfg = verificationStatusConfig[status]
                    const active = selectedCreator.verificationStatus === status
                    return (
                      <div key={status} style={{
                        padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                        background: active ? cfg.bg : 'rgba(255,255,255,0.03)',
                        color: active ? cfg.color : muted,
                        border: `1px solid ${active ? cfg.color + '44' : 'rgba(255,255,255,0.06)'}`,
                        display: 'flex', alignItems: 'center', gap: 4
                      }}>
                        <BadgeCheck size={14} /> {cfg.label}
                      </div>
                    )
                  })}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => handleVerify(selectedCreator.id, 'verified')}
                    disabled={processing === selectedCreator.id}
                    style={{
                      flex: 1, padding: '10px 16px', borderRadius: 8, border: 'none',
                      background: '#10b981', color: '#fff', cursor: 'pointer',
                      fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                    }}
                  >
                    <CheckCircle size={14} /> {processing === selectedCreator.id ? 'Processing...' : 'Approve'}
                  </button>
                  <button
                    onClick={() => handleVerify(selectedCreator.id, 'rejected')}
                    disabled={processing === selectedCreator.id}
                    style={{
                      flex: 1, padding: '10px 16px', borderRadius: 8, border: 'none',
                      background: '#ef4444', color: '#fff', cursor: 'pointer',
                      fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                    }}
                  >
                    <XCircle size={14} /> Reject
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
