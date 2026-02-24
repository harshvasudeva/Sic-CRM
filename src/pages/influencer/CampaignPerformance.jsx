import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Eye, Heart, MessageSquare, Share2, DollarSign, Target, BarChart3, Users, ArrowUp, ArrowDown } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, Legend, FunnelChart } from 'recharts'
import { getCampaigns, compareCampaigns, getCampaignROI, getCreators } from '../../stores/influencerStore'
import { getCurrency } from '../../stores/settingsStore'

const card = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 20 }
const selectStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px', color: '#fff', fontSize: 13, outline: 'none' }
const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

function AnimatedCounter({ value, prefix = '', suffix = '', duration = 1500 }) {
    const [display, setDisplay] = useState(0)
    const ref = useRef(null)
    useEffect(() => {
        const target = Number(value) || 0
        let start = 0
        const startTime = performance.now()
        const animate = now => {
            const progress = Math.min((now - startTime) / duration, 1)
            const eased = 1 - Math.pow(1 - progress, 3)
            setDisplay(Math.round(start + (target - start) * eased))
            if (progress < 1) ref.current = requestAnimationFrame(animate)
        }
        ref.current = requestAnimationFrame(animate)
        return () => cancelAnimationFrame(ref.current)
    }, [value, duration])
    const formatVal = v => {
        if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`
        if (v >= 1000) return `${(v / 1000).toFixed(1)}K`
        return String(v)
    }
    return <span>{prefix}{formatVal(display)}{suffix}</span>
}

export default function CampaignPerformance() {
    const [campaigns, setCampaigns] = useState([])
    const [creatorsMap, setCreatorsMap] = useState({})
    const [selectedCampaign, setSelectedCampaign] = useState('')
    const [compData, setCompData] = useState(null)

    const sym = getCurrency().symbol

    useEffect(() => {
        const camps = getCampaigns()
        setCampaigns(camps)
        if (camps.length > 0) setSelectedCampaign(camps[0].id)
        const crs = getCreators()
        const map = {}
        crs.forEach(c => { map[c.id] = c })
        setCreatorsMap(map)
    }, [])

    useEffect(() => {
        if (selectedCampaign) {
            const result = compareCampaigns([selectedCampaign])
            setCompData(result[0] || null)
        }
    }, [selectedCampaign])

    const campaign = campaigns.find(c => c.id === selectedCampaign)

    const formatCurrency = v => {
        if (v >= 100000) return `${sym}${(v / 100000).toFixed(1)}L`
        if (v >= 1000) return `${sym}${(v / 1000).toFixed(1)}K`
        return `${sym}${v}`
    }

    const kpis = compData ? [
        { label: 'Total Reach', value: compData.metrics.views, icon: Eye, color: '#6366f1', prefix: '' },
        { label: 'Engagement', value: compData.metrics.engagement, icon: Heart, color: '#10b981', prefix: '' },
        { label: 'CPE', value: compData.cpe, icon: DollarSign, color: '#f59e0b', prefix: sym },
        { label: 'CPM', value: compData.metrics.views > 0 ? Math.round(compData.metrics.views > 0 ? (campaign?.spent || 0) / compData.metrics.views * 1000 : 0) : 0, icon: Target, color: '#8b5cf6', prefix: sym },
        { label: 'ROI', value: parseFloat(compData.roi) || 0, icon: TrendingUp, color: parseFloat(compData.roi) >= 0 ? '#10b981' : '#ef4444', suffix: '%' },
    ] : []

    // Simulated performance data over time
    const lineData = compData ? Array.from({ length: 7 }, (_, i) => ({
        day: `Day ${i + 1}`,
        views: Math.round(compData.metrics.views * (0.08 + Math.random() * 0.18)),
        engagement: Math.round(compData.metrics.engagement * (0.08 + Math.random() * 0.18)),
    })) : []

    // Creator performance breakdown
    const creatorBreakdown = campaign ? campaign.creators.map((cr, i) => {
        const creator = creatorsMap[cr.creatorId]
        const insights = cr.contentInsights || { views: 0, likes: 0, comments: 0, shares: 0 }
        return {
            name: creator?.name || 'Unknown',
            views: insights.views,
            likes: insights.likes,
            comments: insights.comments,
            shares: insights.shares,
            engagement: insights.likes + insights.comments + insights.shares,
            fee: cr.totalFee,
            cpe: (insights.likes + insights.comments + insights.shares) > 0 ? Math.round(cr.totalFee / (insights.likes + insights.comments + insights.shares)) : 0,
            color: COLORS[i % COLORS.length],
        }
    }) : []

    // Budget gauge
    const budgetPct = campaign ? Math.round((campaign.spent / campaign.budget) * 100) : 0

    // Engagement funnel
    const funnelData = compData ? [
        { name: 'Views', value: compData.metrics.views, fill: '#6366f1' },
        { name: 'Likes', value: compData.metrics.likes, fill: '#8b5cf6' },
        { name: 'Comments', value: compData.metrics.comments, fill: '#a78bfa' },
        { name: 'Shares', value: compData.metrics.shares, fill: '#c4b5fd' },
    ] : []

    return (
        <div style={{ padding: '24px 32px', color: '#fff', minHeight: '100vh' }}>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}><span style={{ background: 'linear-gradient(135deg, #6366f1, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Campaign</span> Performance</h1>
                <p style={{ color: '#94a3b8', margin: '4px 0 0' }}>Real-time ROI tracking and analytics dashboard</p>
            </motion.div>

            <div style={{ marginBottom: 20 }}>
                <select style={selectStyle} value={selectedCampaign} onChange={e => setSelectedCampaign(e.target.value)}>
                    {campaigns.map(c => <option key={c.id} value={c.id}>{c.name} ({c.brand})</option>)}
                </select>
            </div>

            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 14, marginBottom: 20 }}>
                {kpis.map((kpi, i) => (
                    <motion.div key={kpi.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} style={card}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 10, background: kpi.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <kpi.icon size={18} color={kpi.color} />
                            </div>
                        </div>
                        <div style={{ fontSize: 22, fontWeight: 700, color: kpi.color }}>
                            <AnimatedCounter value={kpi.value} prefix={kpi.prefix || ''} suffix={kpi.suffix || ''} />
                        </div>
                        <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{kpi.label}</div>
                    </motion.div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 16, marginBottom: 16 }}>
                {/* Line Chart */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={card}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}><TrendingUp size={16} /> Performance Over Time</h3>
                    <ResponsiveContainer width="100%" height={260}>
                        <LineChart data={lineData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                            <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} />
                            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} />
                            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff', fontSize: 12 }} />
                            <Legend />
                            <Line type="monotone" dataKey="views" stroke="#6366f1" strokeWidth={2} dot={false} />
                            <Line type="monotone" dataKey="engagement" stroke="#10b981" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Budget Gauge + Funnel */}
                <div style={{ display: 'grid', gap: 16 }}>
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={card}>
                        <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8 }}><DollarSign size={16} /> Budget Utilization</h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <div style={{ position: 'relative', width: 90, height: 90 }}>
                                <svg viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                                    <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
                                    <motion.circle cx="50" cy="50" r="42" fill="none" stroke={budgetPct > 90 ? '#ef4444' : budgetPct > 70 ? '#f59e0b' : '#6366f1'} strokeWidth="10" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 42}`} initial={{ strokeDashoffset: 2 * Math.PI * 42 }} animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - budgetPct / 100) }} transition={{ duration: 1 }} />
                                </svg>
                                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700 }}>{budgetPct}%</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 13, color: '#94a3b8' }}>Spent: <span style={{ color: '#fff', fontWeight: 600 }}>{formatCurrency(campaign?.spent || 0)}</span></div>
                                <div style={{ fontSize: 13, color: '#94a3b8' }}>Budget: <span style={{ color: '#fff', fontWeight: 600 }}>{formatCurrency(campaign?.budget || 0)}</span></div>
                                <div style={{ fontSize: 13, color: '#94a3b8' }}>Remaining: <span style={{ color: '#10b981', fontWeight: 600 }}>{formatCurrency((campaign?.budget || 0) - (campaign?.spent || 0))}</span></div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={card}>
                        <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: 8 }}><BarChart3 size={16} /> Engagement Funnel</h3>
                        <div style={{ display: 'grid', gap: 6 }}>
                            {funnelData.map((item, i) => {
                                const maxVal = funnelData[0]?.value || 1
                                const pct = maxVal > 0 ? (item.value / maxVal) * 100 : 0
                                return (
                                    <div key={item.name}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
                                            <span style={{ color: '#94a3b8' }}>{item.name}</span>
                                            <span style={{ fontWeight: 600 }}>{item.value >= 1000 ? (item.value / 1000).toFixed(1) + 'K' : item.value}</span>
                                        </div>
                                        <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                                            <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: i * 0.1, duration: 0.6 }} style={{ height: '100%', background: item.fill, borderRadius: 3 }} />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Creator Breakdown Table */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={card}>
                <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 8 }}><Users size={16} /> Creator-Wise Performance</h3>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                {['Creator', 'Views', 'Likes', 'Comments', 'Shares', 'Engagement', 'Fee', 'CPE'].map(h => (
                                    <th key={h} style={{ textAlign: 'left', padding: '10px 12px', fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {creatorBreakdown.map((cr, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '10px 12px', fontSize: 13 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: cr.color }} />
                                            <span style={{ fontWeight: 500 }}>{cr.name}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '10px 12px', fontSize: 13 }}>{cr.views >= 1000 ? (cr.views / 1000).toFixed(1) + 'K' : cr.views}</td>
                                    <td style={{ padding: '10px 12px', fontSize: 13 }}>{cr.likes >= 1000 ? (cr.likes / 1000).toFixed(1) + 'K' : cr.likes}</td>
                                    <td style={{ padding: '10px 12px', fontSize: 13 }}>{cr.comments}</td>
                                    <td style={{ padding: '10px 12px', fontSize: 13 }}>{cr.shares}</td>
                                    <td style={{ padding: '10px 12px', fontSize: 13, fontWeight: 600, color: '#10b981' }}>{cr.engagement >= 1000 ? (cr.engagement / 1000).toFixed(1) + 'K' : cr.engagement}</td>
                                    <td style={{ padding: '10px 12px', fontSize: 13 }}>{formatCurrency(cr.fee)}</td>
                                    <td style={{ padding: '10px 12px', fontSize: 13, color: cr.cpe > 10 ? '#ef4444' : '#10b981' }}>{sym}{cr.cpe}</td>
                                </tr>
                            ))}
                            {creatorBreakdown.length === 0 && (
                                <tr><td colSpan={8} style={{ padding: 20, textAlign: 'center', color: '#64748b' }}>No creator data available</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    )
}
