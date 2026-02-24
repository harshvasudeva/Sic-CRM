import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Eye, AlertTriangle, Search, Building2, Calendar, TrendingUp, Users, Shield } from 'lucide-react'
import { getCreators } from '../../stores/influencerStore'
import { getCompetitorAnalysis } from '../../stores/analyticsStore'

const styles = {
    page: { padding: '24px', maxWidth: 1400, margin: '0 auto' },
    header: { marginBottom: 28 },
    title: { fontSize: '1.6rem', fontWeight: 700, color: '#fff', marginBottom: 4 },
    gradient: { background: 'linear-gradient(135deg, #f59e0b, #ef4444)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
    subtitle: { fontSize: '0.85rem', color: '#94a3b8' },
    summaryGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 },
    summaryCard: {
        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 16, padding: '20px 16px', textAlign: 'center',
    },
    summaryIcon: { width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' },
    summaryValue: { fontSize: '1.4rem', fontWeight: 700, color: '#fff' },
    summaryLabel: { fontSize: '0.75rem', color: '#94a3b8', marginTop: 2 },
    filterBar: {
        display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24,
        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 12, padding: '12px 16px',
    },
    filterLabel: { fontSize: '0.8rem', color: '#94a3b8', flexShrink: 0 },
    filterSelect: {
        padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)',
        background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '0.8rem', outline: 'none', cursor: 'pointer',
    },
    layout: { display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24 },
    card: {
        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 16, padding: 24, marginBottom: 24,
    },
    cardTitle: { fontSize: '0.95rem', fontWeight: 600, color: '#fff', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 },
    creatorCard: {
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 14, padding: 20, marginBottom: 12, transition: 'border-color 0.15s',
    },
    creatorHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
    creatorName: { fontSize: '1rem', fontWeight: 700, color: '#fff' },
    creatorMeta: { fontSize: '0.75rem', color: '#94a3b8', marginTop: 2 },
    riskFlag: {
        display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 8,
        background: 'rgba(239,68,68,0.15)', color: '#ef4444', fontSize: '0.75rem', fontWeight: 600,
    },
    noRisk: {
        display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 8,
        background: 'rgba(16,185,129,0.15)', color: '#10b981', fontSize: '0.75rem', fontWeight: 600,
    },
    brandList: { display: 'flex', flexWrap: 'wrap', gap: 6 },
    brandTag: {
        display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 8,
        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
        fontSize: '0.75rem', color: '#94a3b8',
    },
    timeline: { position: 'relative', paddingLeft: 24 },
    timelineLine: { position: 'absolute', left: 6, top: 0, bottom: 0, width: 2, background: 'rgba(255,255,255,0.08)' },
    timelineItem: { position: 'relative', paddingBottom: 20, paddingLeft: 12 },
    timelineDot: (recent) => ({
        position: 'absolute', left: -21, top: 4, width: 12, height: 12, borderRadius: '50%',
        background: recent ? '#ef4444' : 'rgba(99,102,241,0.4)', border: `2px solid ${recent ? '#ef4444' : 'rgba(99,102,241,0.6)'}`,
    }),
    timelineBrand: { fontSize: '0.9rem', fontWeight: 600, color: '#fff' },
    timelineDate: { fontSize: '0.75rem', color: '#94a3b8' },
    timelineType: { fontSize: '0.75rem', color: '#6366f1', marginTop: 2 },
    tooltipStyle: { background: '#1e1e2d', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 },
    empty: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 60, color: '#94a3b8', gap: 12, fontSize: '0.85rem' },
}

function isRecent(dateStr) {
    const d = new Date(dateStr)
    const now = new Date()
    const diff = (now - d) / (1000 * 60 * 60 * 24)
    return diff <= 90
}

export default function CompetitorAnalysis() {
    const [creators, setCreators] = useState([])
    const [competitorMap, setCompetitorMap] = useState({})
    const [brandFilter, setBrandFilter] = useState('All')
    const [selectedCreatorId, setSelectedCreatorId] = useState(null)

    useEffect(() => {
        const all = getCreators()
        setCreators(all)
        const data = getCompetitorAnalysis()
        setCompetitorMap(data || {})
    }, [])

    // Collect all unique competitor brands
    const allBrands = useMemo(() => {
        const brands = new Set()
        Object.values(competitorMap).forEach(cd => {
            cd.competitorBrands.forEach(b => brands.add(b.brand))
        })
        return ['All', ...Array.from(brands).sort()]
    }, [competitorMap])

    // Filter creators by selected brand
    const filteredCreators = useMemo(() => {
        return creators.filter(c => {
            const cd = competitorMap[c.id]
            if (!cd) return false
            if (brandFilter === 'All') return true
            return cd.competitorBrands.some(b => b.brand === brandFilter)
        })
    }, [creators, competitorMap, brandFilter])

    // Brand frequency for chart
    const brandFrequency = useMemo(() => {
        const freq = {}
        Object.values(competitorMap).forEach(cd => {
            cd.competitorBrands.forEach(b => {
                freq[b.brand] = (freq[b.brand] || 0) + 1
            })
        })
        return Object.entries(freq)
            .sort((a, b) => b[1] - a[1])
            .map(([brand, count]) => ({ brand, count }))
    }, [competitorMap])

    // Summary stats
    const creatorsWithCompWork = Object.keys(competitorMap).filter(id => competitorMap[id].competitorBrands.length > 0).length
    const mostCommon = brandFrequency.length ? brandFrequency[0].brand : '--'
    const avgDeals = creatorsWithCompWork > 0
        ? (Object.values(competitorMap).reduce((s, cd) => s + cd.competitorBrands.length, 0) / creatorsWithCompWork).toFixed(1)
        : 0

    // Timeline for selected creator
    const selectedCreator = creators.find(c => c.id === selectedCreatorId)
    const selectedCompData = selectedCreatorId ? competitorMap[selectedCreatorId] : null
    const sortedTimeline = selectedCompData
        ? [...selectedCompData.competitorBrands].sort((a, b) => new Date(b.date) - new Date(a.date))
        : []

    return (
        <div style={styles.page}>
            <motion.div style={styles.header} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 style={styles.title}><span style={styles.gradient}>Competitor</span> Analysis</h1>
                <p style={styles.subtitle}>Track which creators have worked with competitor brands and identify potential conflicts</p>
            </motion.div>

            {/* Summary */}
            <motion.div style={styles.summaryGrid} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                {[
                    { icon: Users, label: 'Creators with Competitor Work', value: creatorsWithCompWork, color: '#6366f1' },
                    { icon: Building2, label: 'Most Common Competitor', value: mostCommon, color: '#f59e0b' },
                    { icon: TrendingUp, label: 'Avg Competitor Deals', value: avgDeals, color: '#10b981' },
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

            {/* Brand Filter */}
            <div style={styles.filterBar}>
                <Building2 size={16} color="#94a3b8" />
                <span style={styles.filterLabel}>Filter by Competitor Brand:</span>
                <select style={styles.filterSelect} value={brandFilter} onChange={e => setBrandFilter(e.target.value)}>
                    {allBrands.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                    {filteredCreators.length} creator{filteredCreators.length !== 1 ? 's' : ''} found
                </span>
            </div>

            <div style={styles.layout}>
                {/* Creator Cards + Chart */}
                <div>
                    {/* Creator Cards */}
                    {filteredCreators.length === 0 ? (
                        <div style={{ ...styles.card, ...styles.empty }}>
                            <Eye size={48} />
                            <div>No creators found for this filter</div>
                        </div>
                    ) : (
                        filteredCreators.map((c, i) => {
                            const cd = competitorMap[c.id]
                            if (!cd) return null
                            const brands = brandFilter === 'All' ? cd.competitorBrands : cd.competitorBrands.filter(b => b.brand === brandFilter)
                            const hasRecent = brands.some(b => isRecent(b.date))
                            return (
                                <motion.div
                                    key={c.id}
                                    style={{ ...styles.creatorCard, borderColor: selectedCreatorId === c.id ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.08)', cursor: 'pointer' }}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.15 + i * 0.05 }}
                                    onClick={() => setSelectedCreatorId(c.id)}
                                >
                                    <div style={styles.creatorHeader}>
                                        <div>
                                            <div style={styles.creatorName}>{c.name}</div>
                                            <div style={styles.creatorMeta}>{c.handle} | {c.platform} | {c.niche}</div>
                                        </div>
                                        {hasRecent ? (
                                            <span style={styles.riskFlag}><AlertTriangle size={12} /> Recent Competitor</span>
                                        ) : (
                                            <span style={styles.noRisk}><Shield size={12} /> Clear</span>
                                        )}
                                    </div>
                                    <div style={styles.brandList}>
                                        {brands.map((b, bi) => (
                                            <span key={bi} style={{ ...styles.brandTag, borderColor: isRecent(b.date) ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.08)' }}>
                                                <Building2 size={10} />
                                                {b.brand}
                                                <span style={{ fontSize: '0.65rem', color: isRecent(b.date) ? '#ef4444' : '#94a3b8' }}>
                                                    {b.date}
                                                </span>
                                            </span>
                                        ))}
                                    </div>
                                </motion.div>
                            )
                        })
                    )}

                    {/* Brand Frequency Chart */}
                    <motion.div style={styles.card} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                        <div style={styles.cardTitle}><TrendingUp size={16} /> Competitor Brand Frequency</div>
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={brandFrequency} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} allowDecimals={false} />
                                <YAxis type="category" dataKey="brand" tick={{ fontSize: 11, fill: '#94a3b8' }} width={100} />
                                <Tooltip contentStyle={styles.tooltipStyle} />
                                <Bar dataKey="count" fill="#6366f1" radius={[0, 6, 6, 0]} name="Collaborations" />
                            </BarChart>
                        </ResponsiveContainer>
                    </motion.div>
                </div>

                {/* Timeline Panel */}
                <motion.div style={styles.card} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                    <div style={styles.cardTitle}><Calendar size={16} /> Collaboration Timeline</div>
                    {!selectedCreator || !selectedCompData ? (
                        <div style={{ ...styles.empty, padding: '40px 0' }}>
                            <Calendar size={40} />
                            <div>Select a creator to view timeline</div>
                        </div>
                    ) : (
                        <AnimatePresence mode="wait">
                            <motion.div key={selectedCreatorId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <div style={{ textAlign: 'center', marginBottom: 20 }}>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>{selectedCreator.name}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{selectedCreator.handle}</div>
                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: 4 }}>
                                        {selectedCompData.competitorBrands.length} competitor collaboration{selectedCompData.competitorBrands.length !== 1 ? 's' : ''}
                                    </div>
                                </div>

                                <div style={styles.timeline}>
                                    <div style={styles.timelineLine} />
                                    {sortedTimeline.map((item, i) => {
                                        const recent = isRecent(item.date)
                                        return (
                                            <motion.div
                                                key={i}
                                                style={styles.timelineItem}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.1 }}
                                            >
                                                <div style={styles.timelineDot(recent)} />
                                                <div style={styles.timelineBrand}>
                                                    {item.brand}
                                                    {recent && <span style={{ marginLeft: 8, fontSize: '0.65rem', color: '#ef4444', fontWeight: 600 }}>RECENT</span>}
                                                </div>
                                                <div style={styles.timelineDate}>{new Date(item.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
                                                <div style={styles.timelineType}>Content: {item.type}</div>
                                            </motion.div>
                                        )
                                    })}
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    )}
                </motion.div>
            </div>
        </div>
    )
}
