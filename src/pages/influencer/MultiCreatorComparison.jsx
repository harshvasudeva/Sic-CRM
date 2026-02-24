import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, Plus, X, Star, Trophy, Download, BarChart3 } from 'lucide-react'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from 'recharts'
import { getCreatorsWithScores, getCreatorTierLabel, getCreatorTierColor } from '../../stores/influencerStore'
import { getCurrency } from '../../stores/settingsStore'

const card = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 20 }
const selectStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px', color: '#fff', fontSize: 13, outline: 'none', flex: 1 }
const btnPrimary = { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }
const btnSecondary = { background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export default function MultiCreatorComparison() {
    const [allCreators, setAllCreators] = useState([])
    const [selectedIds, setSelectedIds] = useState([])
    const [addingId, setAddingId] = useState('')

    const sym = getCurrency().symbol

    useEffect(() => { setAllCreators(getCreatorsWithScores()) }, [])

    const selectedCreators = allCreators.filter(c => selectedIds.includes(c.id))
    const availableCreators = allCreators.filter(c => !selectedIds.includes(c.id))

    const addCreator = () => {
        if (addingId && selectedIds.length < 5 && !selectedIds.includes(addingId)) {
            setSelectedIds(prev => [...prev, addingId])
            setAddingId('')
        }
    }

    const removeCreator = id => setSelectedIds(prev => prev.filter(x => x !== id))

    const formatNum = n => {
        if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
        if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
        return String(n)
    }

    const formatCurrency = v => {
        if (v >= 100000) return `${sym}${(v / 100000).toFixed(1)}L`
        if (v >= 1000) return `${sym}${(v / 1000).toFixed(1)}K`
        return `${sym}${v}`
    }

    // Radar chart data
    const radarData = selectedCreators.length > 0 ? [
        { metric: 'Engagement', ...Object.fromEntries(selectedCreators.map(c => [c.id, c.creatorScore.engagement])) },
        { metric: 'Audience', ...Object.fromEntries(selectedCreators.map(c => [c.id, c.creatorScore.audienceQuality])) },
        { metric: 'Reliability', ...Object.fromEntries(selectedCreators.map(c => [c.id, c.creatorScore.reliability])) },
        { metric: 'Completeness', ...Object.fromEntries(selectedCreators.map(c => [c.id, c.creatorScore.completeness])) },
        { metric: 'Overall', ...Object.fromEntries(selectedCreators.map(c => [c.id, c.creatorScore.total])) },
    ] : []

    // Bar chart data
    const barMetrics = [
        { key: 'followers', label: 'Followers' },
        { key: 'avgViews', label: 'Avg Views' },
        { key: 'lastQuotedRate', label: 'Rate' },
    ]
    const barData = barMetrics.map(m => {
        const entry = { metric: m.label }
        selectedCreators.forEach(c => { entry[c.name] = c[m.key] || 0 })
        return entry
    })

    // Best for recommendations
    const getBestFor = () => {
        if (selectedCreators.length < 2) return []
        const metrics = [
            { label: 'Most Followers', key: 'followers', format: formatNum },
            { label: 'Highest Avg Views', key: 'avgViews', format: formatNum },
            { label: 'Best Engagement Rate', key: 'engRate', format: v => v.toFixed(1) + '%' },
            { label: 'Highest Score', key: 'score', format: v => v + '/100' },
            { label: 'Lowest Rate (Best Value)', key: 'lastQuotedRate', format: formatCurrency, lowest: true },
        ]
        return metrics.map(m => {
            let best
            if (m.key === 'engRate') {
                best = selectedCreators.reduce((a, b) => {
                    const aRate = a.followers > 0 ? (a.avgViews / a.followers) * 100 : 0
                    const bRate = b.followers > 0 ? (b.avgViews / b.followers) * 100 : 0
                    return aRate >= bRate ? a : b
                })
                return { ...m, winner: best.name, value: m.format(best.followers > 0 ? (best.avgViews / best.followers) * 100 : 0) }
            }
            if (m.key === 'score') {
                best = selectedCreators.reduce((a, b) => a.creatorScore.total >= b.creatorScore.total ? a : b)
                return { ...m, winner: best.name, value: m.format(best.creatorScore.total) }
            }
            if (m.lowest) {
                best = selectedCreators.reduce((a, b) => (a[m.key] || Infinity) <= (b[m.key] || Infinity) ? a : b)
            } else {
                best = selectedCreators.reduce((a, b) => (a[m.key] || 0) >= (b[m.key] || 0) ? a : b)
            }
            return { ...m, winner: best.name, value: m.format(best[m.key] || 0) }
        })
    }

    const exportCSV = () => {
        const headers = ['Name', 'Handle', 'Platform', 'Followers', 'Avg Views', 'Engagement Rate', 'Tier', 'Score', 'Niche', 'City', 'Rate']
        const rows = selectedCreators.map(c => [
            c.name, c.handle, c.platform, c.followers, c.avgViews,
            c.followers > 0 ? ((c.avgViews / c.followers) * 100).toFixed(1) + '%' : '0%',
            getCreatorTierLabel(c.creatorTier), c.creatorScore.total, c.niche, c.city, c.lastQuotedRate
        ])
        const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `creator-comparison-${Date.now()}.csv`
        a.click()
        URL.revokeObjectURL(url)
    }

    return (
        <div style={{ padding: '24px 32px', color: '#fff', minHeight: '100vh' }}>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}><span style={{ background: 'linear-gradient(135deg, #6366f1, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Creator</span> Comparison</h1>
                <p style={{ color: '#94a3b8', margin: '4px 0 0' }}>Compare up to 5 creators side by side</p>
            </motion.div>

            {/* Creator Selector */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ ...card, marginBottom: 20 }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14 }}>
                    <select style={selectStyle} value={addingId} onChange={e => setAddingId(e.target.value)}>
                        <option value="">Select a creator to add...</option>
                        {availableCreators.map(c => <option key={c.id} value={c.id}>{c.name} ({c.handle}) - {c.platform}</option>)}
                    </select>
                    <button style={{ ...btnPrimary, opacity: !addingId || selectedIds.length >= 5 ? 0.4 : 1 }} onClick={addCreator} disabled={!addingId || selectedIds.length >= 5}>
                        <Plus size={14} /> Add
                    </button>
                    {selectedCreators.length > 0 && (
                        <button style={btnSecondary} onClick={exportCSV}><Download size={14} /> Export CSV</button>
                    )}
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {selectedCreators.map((c, i) => (
                        <motion.div key={c.id} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 20, background: COLORS[i % COLORS.length] + '20', border: `1px solid ${COLORS[i % COLORS.length]}40` }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i % COLORS.length] }} />
                            <span style={{ fontSize: 13, fontWeight: 500 }}>{c.name}</span>
                            <button onClick={() => removeCreator(c.id)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0, display: 'flex' }}><X size={14} /></button>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {selectedCreators.length >= 2 && (
                <>
                    {/* Comparison Table */}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ ...card, marginBottom: 16, overflowX: 'auto' }}>
                        <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 14px' }}>Detailed Comparison</h3>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                    <th style={{ textAlign: 'left', padding: '10px 12px', fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>Metric</th>
                                    {selectedCreators.map((c, i) => (
                                        <th key={c.id} style={{ textAlign: 'center', padding: '10px 12px', fontSize: 13, fontWeight: 600 }}>
                                            <span style={{ color: COLORS[i % COLORS.length] }}>{c.name}</span>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { label: 'Followers', get: c => formatNum(c.followers) },
                                    { label: 'Avg Views', get: c => formatNum(c.avgViews) },
                                    { label: 'Engagement Rate', get: c => c.followers > 0 ? ((c.avgViews / c.followers) * 100).toFixed(1) + '%' : '0%' },
                                    { label: 'Tier', get: c => getCreatorTierLabel(c.creatorTier) },
                                    { label: 'Score', get: c => c.creatorScore.total + '/100' },
                                    { label: 'Niche', get: c => c.niche },
                                    { label: 'City', get: c => c.city },
                                    { label: 'Platform', get: c => c.platform },
                                    { label: 'Rate', get: c => formatCurrency(c.lastQuotedRate) },
                                    { label: 'Lowest Closed', get: c => formatCurrency(c.lowestClosedRate || 0) },
                                    { label: 'Deals Completed', get: c => (c.dealHistory || []).filter(d => d.status === 'Completed').length },
                                    { label: 'Brands Worked', get: c => (c.brandsWorkedWith || []).length },
                                ].map(row => (
                                    <tr key={row.label} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '10px 12px', fontSize: 12, color: '#94a3b8' }}>{row.label}</td>
                                        {selectedCreators.map(c => (
                                            <td key={c.id} style={{ padding: '10px 12px', fontSize: 13, textAlign: 'center' }}>{row.get(c)}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </motion.div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                        {/* Radar Chart */}
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={card}>
                            <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 14px' }}>Score Radar</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <RadarChart data={radarData}>
                                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                                    <PolarAngleAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                    <PolarRadiusAxis tick={{ fill: '#64748b', fontSize: 10 }} domain={[0, 100]} />
                                    {selectedCreators.map((c, i) => (
                                        <Radar key={c.id} name={c.name} dataKey={c.id} stroke={COLORS[i % COLORS.length]} fill={COLORS[i % COLORS.length]} fillOpacity={0.15} strokeWidth={2} />
                                    ))}
                                    <Legend />
                                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff', fontSize: 12 }} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </motion.div>

                        {/* Bar Chart */}
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={card}>
                            <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 8 }}><BarChart3 size={16} /> Key Metrics</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={barData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                                    <XAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} />
                                    <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} />
                                    <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff', fontSize: 12 }} />
                                    <Legend />
                                    {selectedCreators.map((c, i) => (
                                        <Bar key={c.id} dataKey={c.name} fill={COLORS[i % COLORS.length]} radius={[4, 4, 0, 0]} />
                                    ))}
                                </BarChart>
                            </ResponsiveContainer>
                        </motion.div>
                    </div>

                    {/* Best For Recommendations */}
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={card}>
                        <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 8 }}><Trophy size={16} color="#f59e0b" /> Best For Recommendations</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                            {getBestFor().map((rec, i) => (
                                <div key={i} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: 14, border: '1px solid rgba(255,255,255,0.06)' }}>
                                    <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>{rec.label}</div>
                                    <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 2 }}>{rec.winner}</div>
                                    <div style={{ fontSize: 12, color: '#10b981' }}>{rec.value}</div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </>
            )}

            {selectedCreators.length < 2 && (
                <div style={{ ...card, textAlign: 'center', color: '#64748b', padding: 60 }}>
                    <Users size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
                    <div style={{ fontSize: 16, fontWeight: 500, marginBottom: 4 }}>Select at least 2 creators to compare</div>
                    <div style={{ fontSize: 13 }}>You can compare up to 5 creators side by side</div>
                </div>
            )}
        </div>
    )
}
