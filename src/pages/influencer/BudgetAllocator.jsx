import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { DollarSign, Users, Lightbulb, Check, Sliders, PieChart as PieIcon, ArrowRight, RefreshCw } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts'
import { getCreatorsWithScores, getCreatorTierLabel, getCreatorTierColor } from '../../stores/influencerStore'
import { getCurrency } from '../../stores/settingsStore'

const card = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 20 }
const input = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 14px', color: '#fff', width: '100%', fontSize: 14, outline: 'none' }
const btnPrimary = { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }
const btnSecondary = { background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6']

export default function BudgetAllocator() {
    const [allCreators, setAllCreators] = useState([])
    const [selectedIds, setSelectedIds] = useState([])
    const [totalBudget, setTotalBudget] = useState(500000)
    const [allocations, setAllocations] = useState({})
    const [recommended, setRecommended] = useState({})
    const [applied, setApplied] = useState(false)

    const sym = getCurrency().symbol

    useEffect(() => { setAllCreators(getCreatorsWithScores()) }, [])

    const selectedCreators = allCreators.filter(c => selectedIds.includes(c.id))

    const formatCurrency = v => {
        const n = Number(v)
        if (n >= 100000) return `${sym}${(n / 100000).toFixed(1)}L`
        if (n >= 1000) return `${sym}${(n / 1000).toFixed(1)}K`
        return `${sym}${n}`
    }

    const toggleCreator = id => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
    }

    const calculateRecommended = () => {
        if (selectedCreators.length === 0) return
        // Weighted allocation based on followers (40%), engagement (35%), score (25%)
        const scores = selectedCreators.map(c => {
            const engRate = c.followers > 0 ? (c.avgViews / c.followers) * 100 : 0
            const weight = (c.followers / 1000000) * 0.4 + engRate * 0.35 + (c.creatorScore.total / 100) * 0.25
            return { id: c.id, weight: Math.max(weight, 0.1) }
        })
        const totalWeight = scores.reduce((s, x) => s + x.weight, 0)
        const rec = {}
        scores.forEach(s => { rec[s.id] = Math.round((s.weight / totalWeight) * totalBudget) })
        // Adjust rounding errors
        const recTotal = Object.values(rec).reduce((s, v) => s + v, 0)
        if (recTotal !== totalBudget && scores.length > 0) {
            rec[scores[0].id] += totalBudget - recTotal
        }
        setRecommended(rec)
        setAllocations(rec)
    }

    useEffect(() => {
        if (selectedCreators.length > 0) calculateRecommended()
    }, [selectedIds, totalBudget])

    const handleSliderChange = (id, value) => {
        const numVal = Number(value)
        setAllocations(prev => ({ ...prev, [id]: numVal }))
    }

    const totalAllocated = Object.values(allocations).reduce((s, v) => s + v, 0)
    const remaining = totalBudget - totalAllocated

    const pieData = selectedCreators.map((c, i) => ({
        name: c.name,
        value: allocations[c.id] || 0,
        color: COLORS[i % COLORS.length],
    })).filter(d => d.value > 0)
    if (remaining > 0) pieData.push({ name: 'Unallocated', value: remaining, color: '#374151' })

    const comparisonData = selectedCreators.map((c, i) => ({
        name: c.name.split(' ')[0],
        Recommended: recommended[c.id] || 0,
        Actual: allocations[c.id] || 0,
    }))

    const tips = []
    selectedCreators.forEach(c => {
        const engRate = c.followers > 0 ? (c.avgViews / c.followers) * 100 : 0
        const alloc = allocations[c.id] || 0
        const rec = recommended[c.id] || 0
        if (engRate > 8 && alloc < rec) tips.push(`${c.name} has high engagement (${engRate.toFixed(1)}%). Consider increasing their budget.`)
        if (c.creatorScore.reliability < 50) tips.push(`${c.name} has low reliability score. Consider a milestone-based payment structure.`)
        if (alloc > c.lastQuotedRate * 1.5) tips.push(`${c.name}'s allocation exceeds 1.5x their quoted rate. Negotiate or redistribute.`)
    })
    if (remaining < 0) tips.push(`Budget is over-allocated by ${formatCurrency(Math.abs(remaining))}. Reduce some allocations.`)
    if (remaining > totalBudget * 0.3) tips.push(`${formatCurrency(remaining)} (${Math.round(remaining / totalBudget * 100)}%) of budget is unallocated. Consider adding more creators.`)

    return (
        <div style={{ padding: '24px 32px', color: '#fff', minHeight: '100vh' }}>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}><span style={{ background: 'linear-gradient(135deg, #6366f1, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Budget</span> Allocator</h1>
                <p style={{ color: '#94a3b8', margin: '4px 0 0' }}>AI-recommended budget split based on creator performance metrics</p>
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                {/* Budget & Creator Selection */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={card}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 8 }}><DollarSign size={16} /> Total Budget</h3>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16 }}>
                        <span style={{ fontSize: 13, color: '#94a3b8' }}>{sym}</span>
                        <input style={{ ...input, fontSize: 20, fontWeight: 700, textAlign: 'center' }} type="number" value={totalBudget} onChange={e => setTotalBudget(Number(e.target.value) || 0)} />
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
                        {[100000, 300000, 500000, 1000000].map(v => (
                            <button key={v} onClick={() => setTotalBudget(v)} style={{ padding: '4px 12px', borderRadius: 20, border: totalBudget === v ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.1)', background: totalBudget === v ? 'rgba(99,102,241,0.15)' : 'transparent', color: totalBudget === v ? '#a78bfa' : '#64748b', fontSize: 12, cursor: 'pointer' }}>
                                {formatCurrency(v)}
                            </button>
                        ))}
                    </div>

                    <h3 style={{ fontSize: 15, fontWeight: 600, margin: '16px 0 10px', display: 'flex', alignItems: 'center', gap: 8 }}><Users size={16} /> Select Creators</h3>
                    <div style={{ maxHeight: 250, overflowY: 'auto', display: 'grid', gap: 6 }}>
                        {allCreators.map(c => {
                            const selected = selectedIds.includes(c.id)
                            return (
                                <div key={c.id} onClick={() => toggleCreator(c.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, cursor: 'pointer', background: selected ? 'rgba(99,102,241,0.08)' : 'transparent', border: selected ? '1px solid rgba(99,102,241,0.3)' : '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ width: 20, height: 20, borderRadius: 4, background: selected ? '#6366f1' : 'rgba(255,255,255,0.05)', border: selected ? 'none' : '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        {selected && <Check size={12} color="#fff" />}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ fontSize: 13, fontWeight: 500 }}>{c.name}</div>
                                        <div style={{ fontSize: 11, color: '#64748b' }}>{c.platform} - {c.niche} - Score: {c.creatorScore.total}</div>
                                    </div>
                                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 12, background: getCreatorTierColor(c.creatorTier) + '20', color: getCreatorTierColor(c.creatorTier), fontWeight: 600 }}>{getCreatorTierLabel(c.creatorTier)}</span>
                                </div>
                            )
                        })}
                    </div>
                </motion.div>

                {/* Allocation Pie Chart */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={card}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 8 }}><PieIcon size={16} /> Budget Allocation</h3>
                    {pieData.length > 0 ? (
                        <>
                            <ResponsiveContainer width="100%" height={240}>
                                <PieChart>
                                    <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} innerRadius={55} dataKey="value" paddingAngle={2}>
                                        {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                                    </Pie>
                                    <Tooltip formatter={v => formatCurrency(v)} contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff', fontSize: 12 }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                                {pieData.map(d => (
                                    <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11 }}>
                                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color }} />
                                        <span style={{ color: '#94a3b8' }}>{d.name}: {formatCurrency(d.value)}</span>
                                    </div>
                                ))}
                            </div>
                            <div style={{ textAlign: 'center', marginTop: 12, fontSize: 13, color: remaining < 0 ? '#ef4444' : remaining > 0 ? '#f59e0b' : '#10b981', fontWeight: 600 }}>
                                {remaining === 0 ? 'Fully Allocated' : remaining > 0 ? `${formatCurrency(remaining)} remaining` : `Over by ${formatCurrency(Math.abs(remaining))}`}
                            </div>
                        </>
                    ) : (
                        <div style={{ textAlign: 'center', color: '#64748b', padding: 60 }}>Select creators to see allocation</div>
                    )}
                </motion.div>
            </div>

            {/* Sliders */}
            {selectedCreators.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ ...card, marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}><Sliders size={16} /> Manual Adjustments</h3>
                        <button style={btnSecondary} onClick={calculateRecommended}><RefreshCw size={14} /> Reset to Recommended</button>
                    </div>
                    <div style={{ display: 'grid', gap: 14 }}>
                        {selectedCreators.map((c, i) => {
                            const val = allocations[c.id] || 0
                            const pct = totalBudget > 0 ? Math.round((val / totalBudget) * 100) : 0
                            return (
                                <div key={c.id}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[i % COLORS.length] }} />
                                            <span style={{ fontSize: 13, fontWeight: 500 }}>{c.name}</span>
                                            <span style={{ fontSize: 11, color: '#64748b' }}>{c.platform}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <span style={{ fontSize: 13, fontWeight: 600, color: COLORS[i % COLORS.length] }}>{formatCurrency(val)}</span>
                                            <span style={{ fontSize: 11, color: '#64748b' }}>({pct}%)</span>
                                        </div>
                                    </div>
                                    <input type="range" min={0} max={totalBudget} step={1000} value={val} onChange={e => handleSliderChange(c.id, e.target.value)} style={{ width: '100%', accentColor: COLORS[i % COLORS.length] }} />
                                </div>
                            )
                        })}
                    </div>
                </motion.div>
            )}

            {/* Comparison Chart & Tips */}
            {selectedCreators.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16 }}>
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={card}>
                        <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 14px' }}>Recommended vs Actual</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={comparisonData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} />
                                <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} />
                                <Tooltip formatter={v => formatCurrency(v)} contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff', fontSize: 12 }} />
                                <Legend />
                                <Bar dataKey="Recommended" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Actual" fill="#10b981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={card}>
                        <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 8 }}><Lightbulb size={16} color="#f59e0b" /> Optimization Tips</h3>
                        {tips.length > 0 ? (
                            <div style={{ display: 'grid', gap: 8 }}>
                                {tips.map((tip, i) => (
                                    <div key={i} style={{ padding: '10px 12px', borderRadius: 8, background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)', fontSize: 12, color: '#cbd5e1', lineHeight: 1.5 }}>
                                        {tip}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ fontSize: 13, color: '#64748b', textAlign: 'center', padding: 20 }}>Allocation looks good! No optimization suggestions.</div>
                        )}
                        <button style={{ ...btnPrimary, width: '100%', justifyContent: 'center', marginTop: 16 }} onClick={() => { setApplied(true); setTimeout(() => setApplied(false), 2000) }}>
                            {applied ? <><Check size={14} /> Applied to Campaign</> : <><ArrowRight size={14} /> Apply to Campaign</>}
                        </button>
                    </motion.div>
                </div>
            )}

            {selectedCreators.length === 0 && (
                <div style={{ ...card, textAlign: 'center', color: '#64748b', padding: 50 }}>
                    <DollarSign size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
                    <div style={{ fontSize: 15, fontWeight: 500 }}>Select creators and set a budget to begin</div>
                </div>
            )}
        </div>
    )
}
