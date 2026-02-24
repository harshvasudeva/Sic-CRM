import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, AlertTriangle, Users, CheckCircle, XCircle, Search, RefreshCw } from 'lucide-react'
import { getCreators } from '../../stores/influencerStore'
import { getBotScores } from '../../stores/analyticsStore'

const styles = {
    page: { padding: '24px', maxWidth: 1400, margin: '0 auto' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 },
    title: { fontSize: '1.6rem', fontWeight: 700, color: '#fff', marginBottom: 4 },
    gradient: { background: 'linear-gradient(135deg, #ef4444, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
    subtitle: { fontSize: '0.85rem', color: '#94a3b8' },
    runBtn: {
        display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 12,
        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none', color: '#fff',
        fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', transition: 'transform 0.15s',
    },
    summaryGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 },
    summaryCard: {
        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 16, padding: '20px 16px', textAlign: 'center',
    },
    summaryIcon: { width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' },
    summaryValue: { fontSize: '1.4rem', fontWeight: 700, color: '#fff' },
    summaryLabel: { fontSize: '0.75rem', color: '#94a3b8', marginTop: 2 },
    layout: { display: 'grid', gridTemplateColumns: '1fr 400px', gap: 24 },
    card: {
        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 16, padding: 24,
    },
    cardTitle: { fontSize: '0.95rem', fontWeight: 600, color: '#fff', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 },
    searchWrap: { position: 'relative', marginBottom: 16 },
    searchInput: {
        width: '100%', padding: '10px 16px 10px 38px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)',
        background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '0.85rem', outline: 'none', boxSizing: 'border-box',
    },
    searchIcon: { position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' },
    table: { width: '100%', borderCollapse: 'separate', borderSpacing: '0 4px' },
    th: { padding: '8px 12px', fontSize: '0.7rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left' },
    tr: { cursor: 'pointer', transition: 'background 0.15s' },
    td: { padding: '12px', fontSize: '0.85rem', color: '#fff' },
    scoreBadge: (score) => ({
        display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 8, fontWeight: 700, fontSize: '0.8rem',
        background: score < 30 ? 'rgba(16,185,129,0.15)' : score < 60 ? 'rgba(245,158,11,0.15)' : 'rgba(239,68,68,0.15)',
        color: score < 30 ? '#10b981' : score < 60 ? '#f59e0b' : '#ef4444',
    }),
    riskBadge: (level) => {
        const colors = { Low: '#10b981', Medium: '#f59e0b', High: '#ef4444', Critical: '#dc2626' }
        const c = colors[level] || '#94a3b8'
        return { display: 'inline-block', padding: '3px 10px', borderRadius: 6, fontSize: '0.75rem', fontWeight: 600, background: `${c}20`, color: c }
    },
    detailSection: { marginBottom: 20 },
    detailLabel: { fontSize: '0.75rem', color: '#94a3b8', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' },
    gauge: { position: 'relative', width: 180, height: 100, margin: '0 auto 20px', overflow: 'hidden' },
    gaugeValue: { position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)', fontSize: '1.8rem', fontWeight: 700, color: '#fff' },
    signalList: { listStyle: 'none', padding: 0, margin: 0 },
    signalItem: { display: 'flex', alignItems: 'flex-start', gap: 8, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.8rem', color: '#94a3b8' },
    statRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' },
    statLabel: { fontSize: '0.8rem', color: '#94a3b8' },
    statValue: { fontSize: '0.9rem', fontWeight: 600, color: '#fff' },
    scanning: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 60, color: '#94a3b8', gap: 16 },
    empty: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 200, color: '#94a3b8', gap: 12 },
}

function formatNum(n) {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
    return String(n)
}

export default function BotDetection() {
    const [creators, setCreators] = useState([])
    const [allScores, setAllScores] = useState({})
    const [selectedId, setSelectedId] = useState(null)
    const [search, setSearch] = useState('')
    const [scanning, setScanning] = useState(false)

    useEffect(() => {
        const all = getCreators()
        setCreators(all)
        const scores = getBotScores()
        setAllScores(scores || {})
    }, [])

    const filteredCreators = creators.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) || c.handle.toLowerCase().includes(search.toLowerCase())
    )

    const selectedCreator = creators.find(c => c.id === selectedId)
    const selectedScore = selectedId ? allScores[selectedId] : null

    const creatorsChecked = Object.keys(allScores).length
    const avgBotScore = creatorsChecked > 0 ? Math.round(Object.values(allScores).reduce((s, v) => s + v.botScore, 0) / creatorsChecked) : 0
    const highRiskCount = Object.values(allScores).filter(v => v.riskLevel === 'High' || v.riskLevel === 'Critical').length
    const cleanCount = Object.values(allScores).filter(v => v.riskLevel === 'Low').length

    function handleRunCheck() {
        setScanning(true)
        setTimeout(() => setScanning(false), 2500)
    }

    const gaugeColor = (score) => score < 30 ? '#10b981' : score < 60 ? '#f59e0b' : '#ef4444'

    return (
        <div style={styles.page}>
            <motion.div style={styles.header} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <div>
                    <h1 style={styles.title}><span style={styles.gradient}>Bot Detection</span> Dashboard</h1>
                    <p style={styles.subtitle}>Identify fake followers and suspicious engagement patterns across creators</p>
                </div>
                <button style={styles.runBtn} onClick={handleRunCheck}>
                    <RefreshCw size={16} /> Run Check
                </button>
            </motion.div>

            {/* Summary */}
            <motion.div style={styles.summaryGrid} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                {[
                    { icon: Users, label: 'Creators Checked', value: creatorsChecked, color: '#6366f1' },
                    { icon: Shield, label: 'Avg Bot Score', value: avgBotScore, color: '#f59e0b' },
                    { icon: AlertTriangle, label: 'High Risk', value: highRiskCount, color: '#ef4444' },
                    { icon: CheckCircle, label: 'Clean Creators', value: cleanCount, color: '#10b981' },
                ].map((card, i) => (
                    <motion.div key={i} style={styles.summaryCard} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 + i * 0.05 }}>
                        <div style={{ ...styles.summaryIcon, background: `${card.color}20`, color: card.color }}>
                            <card.icon size={20} />
                        </div>
                        <div style={styles.summaryValue}>{card.value}</div>
                        <div style={styles.summaryLabel}>{card.label}</div>
                    </motion.div>
                ))}
            </motion.div>

            {scanning ? (
                <motion.div style={styles.scanning} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}>
                        <RefreshCw size={48} color="#6366f1" />
                    </motion.div>
                    <div style={{ fontSize: '1rem', fontWeight: 600, color: '#fff' }}>Scanning creator profiles...</div>
                    <div style={{ fontSize: '0.8rem' }}>Analyzing follower patterns, engagement ratios, and comment quality</div>
                </motion.div>
            ) : (
                <div style={styles.layout}>
                    {/* Creator Table */}
                    <motion.div style={styles.card} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <div style={styles.cardTitle}><Shield size={16} /> Creator Bot Scores</div>
                        <div style={styles.searchWrap}>
                            <Search size={16} style={styles.searchIcon} />
                            <input
                                style={styles.searchInput}
                                placeholder="Search creators..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={styles.table}>
                                <thead>
                                    <tr>
                                        <th style={styles.th}>Creator</th>
                                        <th style={styles.th}>Platform</th>
                                        <th style={styles.th}>Followers</th>
                                        <th style={styles.th}>Bot Score</th>
                                        <th style={styles.th}>Risk</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCreators.map(c => {
                                        const score = allScores[c.id]
                                        return (
                                            <tr
                                                key={c.id}
                                                style={{ ...styles.tr, background: selectedId === c.id ? 'rgba(99,102,241,0.1)' : 'transparent' }}
                                                onClick={() => setSelectedId(c.id)}
                                                onMouseEnter={e => { if (selectedId !== c.id) e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
                                                onMouseLeave={e => { if (selectedId !== c.id) e.currentTarget.style.background = 'transparent' }}
                                            >
                                                <td style={styles.td}>
                                                    <div style={{ fontWeight: 600 }}>{c.name}</div>
                                                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{c.handle}</div>
                                                </td>
                                                <td style={styles.td}>{c.platform}</td>
                                                <td style={styles.td}>{formatNum(c.followers)}</td>
                                                <td style={styles.td}>
                                                    {score ? <span style={styles.scoreBadge(score.botScore)}>{score.botScore}</span> : '--'}
                                                </td>
                                                <td style={styles.td}>
                                                    {score ? <span style={styles.riskBadge(score.riskLevel)}>{score.riskLevel}</span> : '--'}
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>

                    {/* Detail Panel */}
                    <motion.div style={styles.card} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                        {!selectedCreator || !selectedScore ? (
                            <div style={styles.empty}>
                                <Shield size={40} />
                                <div style={{ fontSize: '0.85rem' }}>Select a creator to view bot analysis</div>
                            </div>
                        ) : (
                            <AnimatePresence mode="wait">
                                <motion.div key={selectedId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                    <div style={{ textAlign: 'center', marginBottom: 16 }}>
                                        <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>{selectedCreator.name}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{selectedCreator.handle}</div>
                                    </div>

                                    {/* Gauge */}
                                    <div style={styles.gauge}>
                                        <svg viewBox="0 0 180 100" style={{ width: 180, height: 100 }}>
                                            <path d="M 10 90 A 80 80 0 0 1 170 90" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="12" strokeLinecap="round" />
                                            <motion.path
                                                d="M 10 90 A 80 80 0 0 1 170 90"
                                                fill="none"
                                                stroke={gaugeColor(selectedScore.botScore)}
                                                strokeWidth="12"
                                                strokeLinecap="round"
                                                strokeDasharray="251"
                                                initial={{ strokeDashoffset: 251 }}
                                                animate={{ strokeDashoffset: 251 - (selectedScore.botScore / 100) * 251 }}
                                                transition={{ duration: 0.8 }}
                                            />
                                        </svg>
                                        <div style={styles.gaugeValue}>{selectedScore.botScore}</div>
                                    </div>

                                    <div style={{ textAlign: 'center', marginBottom: 20 }}>
                                        <span style={styles.riskBadge(selectedScore.riskLevel)}>{selectedScore.riskLevel} Risk</span>
                                    </div>

                                    {/* Stats */}
                                    <div style={styles.detailSection}>
                                        <div style={styles.statRow}>
                                            <span style={styles.statLabel}>Total Followers</span>
                                            <span style={styles.statValue}>{formatNum(selectedCreator.followers)}</span>
                                        </div>
                                        <div style={styles.statRow}>
                                            <span style={styles.statLabel}>Estimated Real Followers</span>
                                            <span style={{ ...styles.statValue, color: '#10b981' }}>{formatNum(selectedScore.estimatedRealFollowers)}</span>
                                        </div>
                                        <div style={styles.statRow}>
                                            <span style={styles.statLabel}>Follower:Engagement Ratio</span>
                                            <span style={styles.statValue}>{selectedScore.followerEngagementRatio}%</span>
                                        </div>
                                        <div style={styles.statRow}>
                                            <span style={styles.statLabel}>Estimated Fake</span>
                                            <span style={{ ...styles.statValue, color: '#ef4444' }}>{formatNum(selectedCreator.followers - selectedScore.estimatedRealFollowers)}</span>
                                        </div>
                                    </div>

                                    {/* Suspicious Signals */}
                                    <div style={styles.detailSection}>
                                        <div style={styles.detailLabel}>Suspicious Signals</div>
                                        {selectedScore.suspiciousSignals.length === 0 ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#10b981', fontSize: '0.85rem' }}>
                                                <CheckCircle size={16} /> No suspicious signals detected
                                            </div>
                                        ) : (
                                            <ul style={styles.signalList}>
                                                {selectedScore.suspiciousSignals.map((signal, i) => (
                                                    <motion.li key={i} style={styles.signalItem} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
                                                        <XCircle size={14} color="#ef4444" style={{ flexShrink: 0, marginTop: 2 }} />
                                                        {signal}
                                                    </motion.li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        )}
                    </motion.div>
                </div>
            )}
        </div>
    )
}
