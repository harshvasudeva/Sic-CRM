import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Target, Users, CheckCircle, AlertTriangle, XCircle, Sparkles } from 'lucide-react'
import { getCreators } from '../../stores/influencerStore'
import { getNicheOverlap } from '../../stores/analyticsStore'

const styles = {
    page: { padding: '24px', maxWidth: 1400, margin: '0 auto' },
    header: { marginBottom: 28 },
    title: { fontSize: '1.6rem', fontWeight: 700, color: '#fff', marginBottom: 4 },
    gradient: { background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
    subtitle: { fontSize: '0.85rem', color: '#94a3b8' },
    selectorCard: {
        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 16, padding: 24, marginBottom: 24,
    },
    selectorTitle: { fontSize: '0.95rem', fontWeight: 600, color: '#fff', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 },
    selectorHint: { fontSize: '0.75rem', color: '#94a3b8', marginBottom: 12 },
    chipGrid: { display: 'flex', flexWrap: 'wrap', gap: 8 },
    chip: (active) => ({
        display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10,
        border: `1px solid ${active ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.1)'}`,
        background: active ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)',
        color: active ? '#a5b4fc' : '#94a3b8', fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.15s',
        fontWeight: active ? 600 : 400,
    }),
    summaryRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 },
    card: {
        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 16, padding: 24,
    },
    cardTitle: { fontSize: '0.95rem', fontWeight: 600, color: '#fff', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 },
    matrixWrap: { overflowX: 'auto' },
    table: { width: '100%', borderCollapse: 'separate', borderSpacing: 0 },
    thCorner: { padding: 10, background: 'rgba(255,255,255,0.03)', borderRadius: '12px 0 0 0' },
    th: { padding: '10px 12px', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textAlign: 'center', background: 'rgba(255,255,255,0.03)' },
    thRow: { padding: '10px 12px', fontSize: '0.8rem', fontWeight: 600, color: '#fff', textAlign: 'left', background: 'rgba(255,255,255,0.03)' },
    td: { padding: '10px 12px', textAlign: 'center', fontSize: '0.85rem', borderBottom: '1px solid rgba(255,255,255,0.05)' },
    overlapCell: (pct) => ({
        fontWeight: 700,
        color: pct >= 50 ? '#ef4444' : pct >= 30 ? '#f59e0b' : '#10b981',
    }),
    recBadge: (rec) => {
        const map = {
            Avoid: { bg: 'rgba(239,68,68,0.15)', color: '#ef4444' },
            OK: { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' },
            Distinct: { bg: 'rgba(16,185,129,0.15)', color: '#10b981' },
        }
        const s = map[rec] || map.OK
        return { display: 'inline-block', padding: '2px 8px', borderRadius: 6, fontSize: '0.7rem', fontWeight: 600, background: s.bg, color: s.color }
    },
    vennContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200, position: 'relative', margin: '20px 0' },
    vennCircle: (color, left, top, size) => ({
        position: 'absolute', left, top, width: size, height: size, borderRadius: '50%',
        border: `2px solid ${color}`, background: `${color}15`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.7rem', fontWeight: 600, color,
    }),
    diversityCard: {
        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 16, padding: 24, textAlign: 'center',
    },
    diversityScore: { fontSize: '3rem', fontWeight: 800, marginBottom: 4 },
    diversityLabel: { fontSize: '0.85rem', color: '#94a3b8' },
    bestCombo: {
        background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
        borderRadius: 16, padding: 24, marginTop: 16,
    },
    bestComboTitle: { fontSize: '0.95rem', fontWeight: 600, color: '#10b981', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 },
    bestComboNames: { display: 'flex', flexWrap: 'wrap', gap: 8 },
    nameTag: { padding: '6px 12px', borderRadius: 8, background: 'rgba(16,185,129,0.15)', color: '#10b981', fontSize: '0.8rem', fontWeight: 600 },
    empty: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 60, color: '#94a3b8', gap: 12, fontSize: '0.85rem' },
}

const CIRCLE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export default function NicheOverlap() {
    const [creators, setCreators] = useState([])
    const [selectedIds, setSelectedIds] = useState([])
    const [overlapData, setOverlapData] = useState({})

    useEffect(() => {
        const all = getCreators()
        setCreators(all)
        // Pre-select first 3
        if (all.length >= 3) {
            setSelectedIds([all[0].id, all[1].id, all[2].id])
        } else if (all.length >= 2) {
            setSelectedIds([all[0].id, all[1].id])
        }
    }, [])

    useEffect(() => {
        if (selectedIds.length >= 2) {
            const data = getNicheOverlap(selectedIds)
            setOverlapData(data)
        } else {
            setOverlapData({})
        }
    }, [selectedIds])

    function toggleCreator(id) {
        setSelectedIds(prev => {
            if (prev.includes(id)) return prev.filter(x => x !== id)
            if (prev.length >= 5) return prev
            return [...prev, id]
        })
    }

    const selectedCreators = selectedIds.map(id => creators.find(c => c.id === id)).filter(Boolean)

    // Campaign diversity score: average inverse overlap (higher = more diverse)
    const diversityScore = useMemo(() => {
        const pairs = Object.values(overlapData)
        if (!pairs.length) return 0
        const avgOverlap = pairs.reduce((s, p) => s + p.overlapPct, 0) / pairs.length
        return Math.round(100 - avgOverlap)
    }, [overlapData])

    // Best combo: find pair with lowest overlap
    const bestCombo = useMemo(() => {
        if (selectedIds.length < 2) return null
        let bestKey = null
        let bestVal = 999
        for (const [key, val] of Object.entries(overlapData)) {
            if (val.overlapPct < bestVal) {
                bestVal = val.overlapPct
                bestKey = key
            }
        }
        if (!bestKey) return null
        const [id1, id2] = bestKey.split('_')
        const c1 = creators.find(c => c.id === id1)
        const c2 = creators.find(c => c.id === id2)
        return { names: [c1?.name, c2?.name].filter(Boolean), overlap: bestVal }
    }, [overlapData, creators, selectedIds])

    // Venn layout positions
    const vennPositions = useMemo(() => {
        const count = selectedCreators.length
        if (count === 0) return []
        const cx = 160, cy = 90, radius = 60
        return selectedCreators.map((c, i) => {
            const angle = (2 * Math.PI * i / count) - Math.PI / 2
            const x = cx + radius * Math.cos(angle) - 45
            const y = cy + radius * Math.sin(angle) - 45
            return { ...c, x, y }
        })
    }, [selectedCreators])

    return (
        <div style={styles.page}>
            <motion.div style={styles.header} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 style={styles.title}><span style={styles.gradient}>Niche Overlap</span> Analysis</h1>
                <p style={styles.subtitle}>Visualize audience overlap between creators to maximize campaign reach</p>
            </motion.div>

            {/* Creator Multi-Select */}
            <motion.div style={styles.selectorCard} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <div style={styles.selectorTitle}><Users size={16} /> Select Creators (2-5)</div>
                <div style={styles.selectorHint}>Pick 2 to 5 creators to analyze their audience overlap</div>
                <div style={styles.chipGrid}>
                    {creators.map(c => (
                        <motion.div
                            key={c.id}
                            style={styles.chip(selectedIds.includes(c.id))}
                            onClick={() => toggleCreator(c.id)}
                            whileTap={{ scale: 0.95 }}
                        >
                            {selectedIds.includes(c.id) && <CheckCircle size={14} />}
                            {c.name} ({c.niche})
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {selectedIds.length < 2 ? (
                <div style={styles.empty}>
                    <Target size={48} />
                    <div>Select at least 2 creators to see overlap analysis</div>
                </div>
            ) : (
                <>
                    <div style={styles.summaryRow}>
                        {/* Overlap Matrix */}
                        <motion.div style={styles.card} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                            <div style={styles.cardTitle}><Target size={16} /> Overlap Matrix</div>
                            <div style={styles.matrixWrap}>
                                <table style={styles.table}>
                                    <thead>
                                        <tr>
                                            <th style={styles.thCorner}></th>
                                            {selectedCreators.map(c => (
                                                <th key={c.id} style={styles.th}>{c.name.split(' ')[0]}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedCreators.map((rowC, ri) => (
                                            <tr key={rowC.id}>
                                                <td style={styles.thRow}>{rowC.name.split(' ')[0]}</td>
                                                {selectedCreators.map((colC, ci) => {
                                                    if (ri === ci) {
                                                        return <td key={colC.id} style={{ ...styles.td, color: '#94a3b8' }}>--</td>
                                                    }
                                                    const key1 = `${rowC.id}_${colC.id}`
                                                    const key2 = `${colC.id}_${rowC.id}`
                                                    const pair = overlapData[key1] || overlapData[key2]
                                                    if (!pair) return <td key={colC.id} style={styles.td}>--</td>
                                                    return (
                                                        <td key={colC.id} style={styles.td}>
                                                            <div style={styles.overlapCell(pair.overlapPct)}>{pair.overlapPct}%</div>
                                                            <div style={{ marginTop: 4 }}>
                                                                <span style={styles.recBadge(pair.recommendation)}>{pair.recommendation}</span>
                                                            </div>
                                                        </td>
                                                    )
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>

                        {/* Visual Overlap + Diversity + Best Combo */}
                        <div>
                            <motion.div style={styles.card} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                                <div style={styles.cardTitle}><Target size={16} /> Audience Overlap Visual</div>
                                <div style={styles.vennContainer}>
                                    {vennPositions.map((c, i) => (
                                        <motion.div
                                            key={c.id}
                                            style={styles.vennCircle(CIRCLE_COLORS[i % CIRCLE_COLORS.length], c.x, c.y, 90)}
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ delay: 0.3 + i * 0.1, type: 'spring' }}
                                        >
                                            {c.name.split(' ')[0]}
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>

                            <motion.div style={{ ...styles.diversityCard, marginTop: 16 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                                <div style={{ ...styles.diversityScore, color: diversityScore >= 70 ? '#10b981' : diversityScore >= 50 ? '#f59e0b' : '#ef4444' }}>
                                    {diversityScore}
                                </div>
                                <div style={styles.diversityLabel}>Campaign Diversity Score</div>
                                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 4 }}>
                                    {diversityScore >= 70 ? 'Great mix! Minimal audience overlap.' : diversityScore >= 50 ? 'Decent diversity. Some overlap exists.' : 'High overlap. Consider different creators.'}
                                </div>
                            </motion.div>

                            {bestCombo && (
                                <motion.div style={styles.bestCombo} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                                    <div style={styles.bestComboTitle}><Sparkles size={16} /> Best Combo for Maximum Reach</div>
                                    <div style={styles.bestComboNames}>
                                        {bestCombo.names.map((name, i) => (
                                            <span key={i} style={styles.nameTag}>{name}</span>
                                        ))}
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 8 }}>
                                        Only {bestCombo.overlap}% audience overlap - maximum unique reach
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
