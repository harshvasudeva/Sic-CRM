import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'
import { Shield, TrendingUp, Award, Star, Users } from 'lucide-react'
import { getCreators } from '../../stores/influencerStore'
import { getAudienceQualityScores } from '../../stores/analyticsStore'

const styles = {
    page: { padding: '24px', maxWidth: 1400, margin: '0 auto' },
    header: { marginBottom: 28 },
    title: { fontSize: '1.6rem', fontWeight: 700, color: '#fff', marginBottom: 4 },
    gradient: { background: 'linear-gradient(135deg, #10b981, #06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
    subtitle: { fontSize: '0.85rem', color: '#94a3b8' },
    highlightGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 },
    highlightCard: {
        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 16, padding: 20, position: 'relative', overflow: 'hidden',
    },
    highlightRank: {
        position: 'absolute', top: 12, right: 16, fontSize: '2.4rem', fontWeight: 800,
        color: 'rgba(255,255,255,0.06)', lineHeight: 1,
    },
    highlightName: { fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: 4 },
    highlightHandle: { fontSize: '0.75rem', color: '#94a3b8', marginBottom: 12 },
    highlightScore: { fontSize: '2rem', fontWeight: 800 },
    highlightLabel: { fontSize: '0.7rem', color: '#94a3b8', marginTop: 2 },
    layout: { display: 'grid', gridTemplateColumns: '380px 1fr', gap: 24 },
    card: {
        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 16, padding: 24,
    },
    cardTitle: { fontSize: '0.95rem', fontWeight: 600, color: '#fff', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 },
    creatorRow: {
        display: 'flex', alignItems: 'center', gap: 12, padding: '12px 10px', borderRadius: 10,
        cursor: 'pointer', transition: 'background 0.15s', marginBottom: 2,
    },
    avatar: {
        width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 700, fontSize: '0.85rem', flexShrink: 0,
    },
    creatorInfo: { flex: 1, minWidth: 0 },
    creatorName: { fontSize: '0.85rem', fontWeight: 600, color: '#fff' },
    creatorMeta: { fontSize: '0.7rem', color: '#94a3b8' },
    scoreBar: { display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 },
    scoreBarBg: { width: 60, height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' },
    scoreBarFill: { height: '100%', borderRadius: 3, transition: 'width 0.5s' },
    scoreNum: { fontSize: '0.85rem', fontWeight: 700, minWidth: 28, textAlign: 'right' },
    tierBadge: (tier) => {
        const map = {
            Premium: { bg: 'rgba(16,185,129,0.15)', color: '#10b981' },
            Good: { bg: 'rgba(99,102,241,0.15)', color: '#6366f1' },
            Average: { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' },
            Poor: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444' },
        }
        const s = map[tier] || map.Average
        return { display: 'inline-block', padding: '3px 10px', borderRadius: 6, fontSize: '0.7rem', fontWeight: 600, background: s.bg, color: s.color }
    },
    radarCard: { marginBottom: 24 },
    comparisonCard: {},
    tooltipStyle: { background: '#1e1e2d', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 },
}

function getTier(score) {
    if (score >= 80) return 'Premium'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Average'
    return 'Poor'
}

function getTierColor(score) {
    if (score >= 80) return '#10b981'
    if (score >= 60) return '#6366f1'
    if (score >= 40) return '#f59e0b'
    return '#ef4444'
}

function formatNum(n) {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
    return String(n)
}

export default function AudienceQuality() {
    const [creators, setCreators] = useState([])
    const [qualityMap, setQualityMap] = useState({})
    const [selectedId, setSelectedId] = useState(null)

    useEffect(() => {
        const all = getCreators()
        const scores = getAudienceQualityScores()
        setCreators(all)
        setQualityMap(scores || {})
        if (all.length) setSelectedId(all[0].id)
    }, [])

    // Sort creators by quality score descending
    const sortedCreators = [...creators].sort((a, b) => {
        const sa = qualityMap[a.id]?.qualityScore || 0
        const sb = qualityMap[b.id]?.qualityScore || 0
        return sb - sa
    })

    const top3 = sortedCreators.slice(0, 3)
    const selectedCreator = creators.find(c => c.id === selectedId)
    const selectedQuality = selectedId ? qualityMap[selectedId] : null

    const radarData = selectedQuality ? [
        { metric: 'Real Followers', value: selectedQuality.realFollowers },
        { metric: 'Active Commenters', value: selectedQuality.activeCommenters },
        { metric: 'Engagement Auth.', value: selectedQuality.engagementAuthenticity },
        { metric: 'Content Relevance', value: selectedQuality.contentRelevance },
        { metric: 'Audience Retention', value: selectedQuality.audienceRetention },
    ] : []

    const comparisonData = sortedCreators.map(c => ({
        name: c.name.split(' ')[0],
        score: qualityMap[c.id]?.qualityScore || 0,
    }))

    return (
        <div style={styles.page}>
            <motion.div style={styles.header} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 style={styles.title}><span style={styles.gradient}>Audience Quality</span> Scores</h1>
                <p style={styles.subtitle}>Evaluate the authenticity and engagement quality of each creator's audience</p>
            </motion.div>

            {/* Top 3 Highlight */}
            <motion.div style={styles.highlightGrid} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                {top3.map((c, i) => {
                    const q = qualityMap[c.id]
                    const score = q?.qualityScore || 0
                    return (
                        <motion.div
                            key={c.id}
                            style={{ ...styles.highlightCard, borderColor: i === 0 ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.1)' }}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.15 + i * 0.08 }}
                        >
                            <div style={styles.highlightRank}>#{i + 1}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                {i === 0 && <Award size={18} color="#f59e0b" />}
                                <span style={styles.highlightName}>{c.name}</span>
                            </div>
                            <div style={styles.highlightHandle}>{c.handle} | {c.platform}</div>
                            <div style={{ ...styles.highlightScore, color: getTierColor(score) }}>{score}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                                <span style={styles.tierBadge(getTier(score))}>{getTier(score)}</span>
                                <span style={styles.highlightLabel}>Quality Tier</span>
                            </div>
                        </motion.div>
                    )
                })}
            </motion.div>

            <div style={styles.layout}>
                {/* Creator List */}
                <motion.div style={styles.card} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <div style={styles.cardTitle}><Users size={16} /> Creators by Quality</div>
                    {sortedCreators.map((c, i) => {
                        const q = qualityMap[c.id]
                        const score = q?.qualityScore || 0
                        const isActive = selectedId === c.id
                        return (
                            <motion.div
                                key={c.id}
                                style={{ ...styles.creatorRow, background: isActive ? 'rgba(99,102,241,0.1)' : 'transparent' }}
                                onClick={() => setSelectedId(c.id)}
                                onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
                                onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 + i * 0.04 }}
                            >
                                <div style={{ ...styles.avatar, background: `${getTierColor(score)}20`, color: getTierColor(score) }}>
                                    {c.name.charAt(0)}
                                </div>
                                <div style={styles.creatorInfo}>
                                    <div style={styles.creatorName}>{c.name}</div>
                                    <div style={styles.creatorMeta}>{c.platform} | {formatNum(c.followers)} | <span style={styles.tierBadge(getTier(score))}>{getTier(score)}</span></div>
                                </div>
                                <div style={styles.scoreBar}>
                                    <div style={styles.scoreBarBg}>
                                        <div style={{ ...styles.scoreBarFill, width: `${score}%`, background: getTierColor(score) }} />
                                    </div>
                                    <div style={{ ...styles.scoreNum, color: getTierColor(score) }}>{score}</div>
                                </div>
                            </motion.div>
                        )
                    })}
                </motion.div>

                {/* Detail: Radar + Comparison */}
                <div>
                    {selectedCreator && selectedQuality ? (
                        <>
                            <motion.div style={{ ...styles.card, ...styles.radarCard }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                                <div style={styles.cardTitle}>
                                    <Star size={16} />
                                    {selectedCreator.name} - Quality Breakdown
                                    <span style={{ ...styles.tierBadge(getTier(selectedQuality.qualityScore)), marginLeft: 8 }}>
                                        {getTier(selectedQuality.qualityScore)} ({selectedQuality.qualityScore})
                                    </span>
                                </div>
                                <ResponsiveContainer width="100%" height={320}>
                                    <RadarChart data={radarData}>
                                        <PolarGrid stroke="rgba(255,255,255,0.08)" />
                                        <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                        <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                        <Radar name="Score" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} strokeWidth={2} />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </motion.div>

                            <motion.div style={{ ...styles.card, ...styles.comparisonCard }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                                <div style={styles.cardTitle}><TrendingUp size={16} /> Score Comparison</div>
                                <ResponsiveContainer width="100%" height={260}>
                                    <BarChart data={comparisonData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                        <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} domain={[0, 100]} />
                                        <Tooltip contentStyle={styles.tooltipStyle} />
                                        <Bar dataKey="score" radius={[6, 6, 0, 0]}
                                            fill="#6366f1"
                                            label={{ position: 'top', fontSize: 11, fill: '#94a3b8' }}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </motion.div>
                        </>
                    ) : (
                        <div style={{ ...styles.card, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400, color: '#94a3b8' }}>
                            <div style={{ textAlign: 'center' }}>
                                <Shield size={48} style={{ marginBottom: 12 }} />
                                <div>Select a creator to view quality breakdown</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
