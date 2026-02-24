import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileText, Download, Share2, TrendingUp, Users, Eye, Heart, MessageSquare, DollarSign, Target, Award, BarChart3, ArrowUp, ArrowDown, Copy, Check } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts'
import { getCampaigns, compareCampaigns, getCampaignROI, getCreators } from '../../stores/influencerStore'
import { getCurrency } from '../../stores/settingsStore'

const card = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 20 }
const selectStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px', color: '#fff', fontSize: 13, outline: 'none' }
const btnPrimary = { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }
const btnSecondary = { background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

export default function PostCampaignReport() {
    const [campaigns, setCampaigns] = useState([])
    const [selectedCampaign, setSelectedCampaign] = useState('')
    const [creatorsMap, setCreatorsMap] = useState({})
    const [compData, setCompData] = useState(null)
    const [copied, setCopied] = useState(false)

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
        const n = Number(v)
        if (n >= 100000) return `${sym}${(n / 100000).toFixed(1)}L`
        if (n >= 1000) return `${sym}${(n / 1000).toFixed(1)}K`
        return `${sym}${n}`
    }

    const formatNum = n => {
        if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
        if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
        return String(n)
    }

    const handlePrint = () => { window.print() }

    const handleShareLink = () => {
        const url = window.location.href + `?campaign=${selectedCampaign}`
        navigator.clipboard.writeText(url)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    // Creator performance data
    const creatorPerf = campaign ? campaign.creators.map((cr, i) => {
        const creator = creatorsMap[cr.creatorId]
        const insights = cr.contentInsights || { views: 0, likes: 0, comments: 0, shares: 0 }
        const eng = insights.likes + insights.comments + insights.shares
        return {
            name: creator?.name || 'Unknown',
            views: insights.views,
            likes: insights.likes,
            comments: insights.comments,
            shares: insights.shares,
            engagement: eng,
            fee: cr.totalFee,
            cpe: eng > 0 ? Math.round(cr.totalFee / eng) : 0,
            deliverables: cr.deliverables.length,
            delivered: cr.deliverables.filter(d => d.status === 'Delivered' || d.status === 'Approved').length,
            color: COLORS[i % COLORS.length],
        }
    }) : []

    // Engagement breakdown pie
    const engPie = compData ? [
        { name: 'Likes', value: compData.metrics.likes, color: '#6366f1' },
        { name: 'Comments', value: compData.metrics.comments, color: '#10b981' },
        { name: 'Shares', value: compData.metrics.shares, color: '#f59e0b' },
    ] : []

    // Budget analysis
    const budgetPie = campaign ? [
        { name: 'Spent', value: campaign.spent, color: '#6366f1' },
        { name: 'Remaining', value: Math.max(0, campaign.budget - campaign.spent), color: '#374151' },
    ] : []

    // Creator ranking bar chart
    const rankingData = [...creatorPerf].sort((a, b) => b.engagement - a.engagement).map(c => ({
        name: c.name.split(' ')[0],
        Engagement: c.engagement,
        Views: c.views,
    }))

    // ROI trend (simulated)
    const roiTrend = compData ? Array.from({ length: 6 }, (_, i) => ({
        week: `Week ${i + 1}`,
        roi: Math.round((parseFloat(compData.roi) || 0) * (0.3 + i * 0.14 + Math.random() * 0.1)),
        engagement: Math.round(compData.metrics.engagement * (0.1 + i * 0.18 + Math.random() * 0.08)),
    })) : []

    // Radar for audience insights (simulated)
    const audienceRadar = [
        { metric: 'Reach', value: 75 + Math.round(Math.random() * 25) },
        { metric: 'Relevance', value: 60 + Math.round(Math.random() * 30) },
        { metric: 'Engagement', value: 50 + Math.round(Math.random() * 40) },
        { metric: 'Sentiment', value: 65 + Math.round(Math.random() * 25) },
        { metric: 'Brand Fit', value: 70 + Math.round(Math.random() * 20) },
    ]

    const sectionTitle = { fontSize: 18, fontWeight: 700, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 12 }

    if (!campaign || !compData) {
        return (
            <div style={{ padding: '24px 32px', color: '#fff', minHeight: '100vh' }}>
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
                    <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}><span style={{ background: 'linear-gradient(135deg, #6366f1, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Post-Campaign</span> Report</h1>
                    <p style={{ color: '#94a3b8', margin: '4px 0 0' }}>Select a campaign to generate report</p>
                </motion.div>
                <select style={selectStyle} value={selectedCampaign} onChange={e => setSelectedCampaign(e.target.value)}>
                    {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <div style={{ ...card, textAlign: 'center', color: '#64748b', padding: 60, marginTop: 20 }}>Loading campaign data...</div>
            </div>
        )
    }

    return (
        <div style={{ padding: '24px 32px', color: '#fff', minHeight: '100vh' }}>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
                <div>
                    <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}><span style={{ background: 'linear-gradient(135deg, #6366f1, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Post-Campaign</span> Report</h1>
                    <p style={{ color: '#94a3b8', margin: '4px 0 0' }}>Comprehensive campaign analysis and insights</p>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <select style={selectStyle} value={selectedCampaign} onChange={e => setSelectedCampaign(e.target.value)}>
                        {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <button style={btnPrimary} onClick={handlePrint}><Download size={14} /> Download PDF</button>
                    <button style={btnSecondary} onClick={handleShareLink}>
                        {copied ? <><Check size={14} color="#10b981" /> Copied</> : <><Share2 size={14} /> Share</>}
                    </button>
                </div>
            </motion.div>

            {/* Executive Summary */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ ...card, marginBottom: 20 }}>
                <h2 style={sectionTitle}><FileText size={18} /> Executive Summary</h2>
                <div style={{ borderLeft: '3px solid #6366f1', paddingLeft: 16, marginBottom: 16 }}>
                    <h3 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 4px' }}>{campaign.name}</h3>
                    <div style={{ fontSize: 13, color: '#94a3b8' }}>{campaign.brand} | {campaign.platform} | {campaign.objective} | {campaign.startDate} to {campaign.endDate}</div>
                </div>
                <p style={{ fontSize: 14, color: '#cbd5e1', lineHeight: 1.7, margin: 0 }}>
                    The {campaign.name} campaign for {campaign.brand} ran from {campaign.startDate} to {campaign.endDate} on {campaign.platform}
                    with a total budget of {formatCurrency(campaign.budget)}. The campaign engaged {campaign.creators.length} creator(s),
                    achieving {formatNum(compData.metrics.views)} total views and {formatNum(compData.metrics.engagement)} total engagements.
                    The overall ROI stands at {compData.roi}% with a cost per engagement of {sym}{compData.cpe}.
                    Budget utilization reached {compData.budgetUtilization}%.
                </p>
            </motion.div>

            {/* KPIs */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 12, marginBottom: 20 }}>
                {[
                    { label: 'Total Reach', value: formatNum(compData.metrics.views), icon: Eye, color: '#6366f1' },
                    { label: 'Engagement', value: formatNum(compData.metrics.engagement), icon: Heart, color: '#10b981' },
                    { label: 'CPE', value: `${sym}${compData.cpe}`, icon: DollarSign, color: '#f59e0b' },
                    { label: 'ROI', value: `${compData.roi}%`, icon: TrendingUp, color: parseFloat(compData.roi) >= 0 ? '#10b981' : '#ef4444' },
                    { label: 'Budget Used', value: `${compData.budgetUtilization}%`, icon: Target, color: '#8b5cf6' },
                    { label: 'Creators', value: campaign.creators.length, icon: Users, color: '#06b6d4' },
                ].map((kpi, i) => (
                    <motion.div key={kpi.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} style={card}>
                        <kpi.icon size={18} color={kpi.color} style={{ marginBottom: 8 }} />
                        <div style={{ fontSize: 20, fontWeight: 700, color: kpi.color }}>{kpi.value}</div>
                        <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{kpi.label}</div>
                    </motion.div>
                ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                {/* ROI Trend */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={card}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 8 }}><TrendingUp size={16} /> ROI Trend</h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <LineChart data={roiTrend}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                            <XAxis dataKey="week" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} />
                            <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} />
                            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff', fontSize: 12 }} />
                            <Legend />
                            <Line type="monotone" dataKey="roi" stroke="#6366f1" strokeWidth={2} name="ROI %" dot={{ r: 3 }} />
                            <Line type="monotone" dataKey="engagement" stroke="#10b981" strokeWidth={2} name="Engagement" dot={{ r: 3 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Engagement Breakdown */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={card}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 8 }}><Heart size={16} /> Engagement Breakdown</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie data={engPie} cx="50%" cy="50%" outerRadius={75} innerRadius={45} dataKey="value" paddingAngle={2}>
                                {engPie.map((d, i) => <Cell key={i} fill={d.color} />)}
                            </Pie>
                            <Tooltip formatter={v => formatNum(v)} contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff', fontSize: 12 }} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
                        {engPie.map(d => (
                            <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                                <div style={{ width: 10, height: 10, borderRadius: '50%', background: d.color }} />
                                <span style={{ color: '#94a3b8' }}>{d.name}: {formatNum(d.value)}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Creator Performance */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ ...card, marginBottom: 20 }}>
                <h2 style={sectionTitle}><Users size={18} /> Creator Performance</h2>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                {['Creator', 'Views', 'Likes', 'Comments', 'Shares', 'Engagement', 'Fee', 'CPE', 'Deliverables'].map(h => (
                                    <th key={h} style={{ textAlign: 'left', padding: '10px 10px', fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {creatorPerf.map((cr, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <td style={{ padding: '10px', fontSize: 13, fontWeight: 500 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: cr.color }} />
                                            {cr.name}
                                        </div>
                                    </td>
                                    <td style={{ padding: '10px', fontSize: 13 }}>{formatNum(cr.views)}</td>
                                    <td style={{ padding: '10px', fontSize: 13 }}>{formatNum(cr.likes)}</td>
                                    <td style={{ padding: '10px', fontSize: 13 }}>{cr.comments}</td>
                                    <td style={{ padding: '10px', fontSize: 13 }}>{cr.shares}</td>
                                    <td style={{ padding: '10px', fontSize: 13, fontWeight: 600, color: '#10b981' }}>{formatNum(cr.engagement)}</td>
                                    <td style={{ padding: '10px', fontSize: 13 }}>{formatCurrency(cr.fee)}</td>
                                    <td style={{ padding: '10px', fontSize: 13, color: cr.cpe > 10 ? '#ef4444' : '#10b981' }}>{sym}{cr.cpe}</td>
                                    <td style={{ padding: '10px', fontSize: 13 }}>{cr.delivered}/{cr.deliverables}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                {/* Creator Ranking */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={card}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 8 }}><Award size={16} color="#f59e0b" /> Creator Ranking</h3>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={rankingData} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                            <XAxis type="number" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} />
                            <YAxis dataKey="name" type="category" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} width={60} />
                            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff', fontSize: 12 }} />
                            <Bar dataKey="Engagement" fill="#6366f1" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Budget Analysis */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={card}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 8 }}><DollarSign size={16} /> Budget Analysis</h3>
                    <ResponsiveContainer width="100%" height={160}>
                        <PieChart>
                            <Pie data={budgetPie} cx="50%" cy="50%" outerRadius={60} innerRadius={40} dataKey="value" paddingAngle={2}>
                                {budgetPie.map((d, i) => <Cell key={i} fill={d.color} />)}
                            </Pie>
                            <Tooltip formatter={v => formatCurrency(v)} contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff', fontSize: 12 }} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div style={{ display: 'grid', gap: 6, marginTop: 8 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                            <span style={{ color: '#94a3b8' }}>Total Budget</span>
                            <span style={{ fontWeight: 600 }}>{formatCurrency(campaign.budget)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                            <span style={{ color: '#94a3b8' }}>Total Spent</span>
                            <span style={{ fontWeight: 600, color: '#6366f1' }}>{formatCurrency(campaign.spent)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                            <span style={{ color: '#94a3b8' }}>Remaining</span>
                            <span style={{ fontWeight: 600, color: '#10b981' }}>{formatCurrency(campaign.budget - campaign.spent)}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                            <span style={{ color: '#94a3b8' }}>Utilization</span>
                            <span style={{ fontWeight: 600 }}>{compData.budgetUtilization}%</span>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Audience Insights */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ ...card, marginBottom: 20 }}>
                <h2 style={sectionTitle}><Eye size={18} /> Audience Insights</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                    <ResponsiveContainer width="100%" height={250}>
                        <RadarChart data={audienceRadar}>
                            <PolarGrid stroke="rgba(255,255,255,0.1)" />
                            <PolarAngleAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                            <PolarRadiusAxis tick={{ fill: '#64748b', fontSize: 10 }} domain={[0, 100]} />
                            <Radar dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} strokeWidth={2} />
                            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff', fontSize: 12 }} />
                        </RadarChart>
                    </ResponsiveContainer>
                    <div style={{ display: 'grid', gap: 12, alignContent: 'center' }}>
                        {audienceRadar.map(item => (
                            <div key={item.metric}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                                    <span style={{ color: '#94a3b8' }}>{item.metric}</span>
                                    <span style={{ fontWeight: 600, color: item.value > 70 ? '#10b981' : item.value > 50 ? '#f59e0b' : '#ef4444' }}>{item.value}/100</span>
                                </div>
                                <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                                    <motion.div initial={{ width: 0 }} animate={{ width: `${item.value}%` }} transition={{ duration: 0.6 }} style={{ height: '100%', background: item.value > 70 ? '#10b981' : item.value > 50 ? '#f59e0b' : '#ef4444', borderRadius: 3 }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.div>

            {/* Recommendations */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ ...card, marginBottom: 20 }}>
                <h2 style={sectionTitle}><BarChart3 size={18} /> Recommendations</h2>
                <div style={{ display: 'grid', gap: 10 }}>
                    {[
                        { title: 'Top Performer', desc: creatorPerf.length > 0 ? `${creatorPerf.sort((a, b) => b.engagement - a.engagement)[0].name} delivered the highest engagement. Consider increasing their allocation in future campaigns.` : 'No creator data available.', color: '#10b981' },
                        { title: 'Budget Efficiency', desc: compData.budgetUtilization > 80 ? 'Budget was well utilized. The campaign spent efficiently across creators.' : 'Consider allocating more budget or adding more creators to improve spend efficiency.', color: '#6366f1' },
                        { title: 'Content Strategy', desc: `${campaign.platform} performed well for ${campaign.objective}. ${compData.metrics.views > 50000 ? 'Consider scaling this format.' : 'Experiment with different content types for better reach.'}`, color: '#f59e0b' },
                        { title: 'ROI Assessment', desc: parseFloat(compData.roi) > 50 ? 'Excellent ROI. This campaign strategy is worth repeating.' : parseFloat(compData.roi) > 0 ? 'Positive ROI achieved. Minor optimizations could improve returns.' : 'ROI is below expectations. Review creator selection and content strategy.', color: '#8b5cf6' },
                    ].map((rec, i) => (
                        <div key={i} style={{ padding: '14px 16px', borderRadius: 8, background: rec.color + '08', borderLeft: `4px solid ${rec.color}` }}>
                            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, color: rec.color }}>{rec.title}</div>
                            <div style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.6 }}>{rec.desc}</div>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Before/After Metrics */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={card}>
                <h2 style={sectionTitle}><Target size={18} /> Before vs After</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                    {[
                        { label: 'Brand Awareness', before: '32%', after: `${32 + Math.round(compData.metrics.views / 10000)}%`, up: true },
                        { label: 'Engagement Rate', before: '2.1%', after: `${(2.1 + compData.metrics.engagement / 50000).toFixed(1)}%`, up: true },
                        { label: 'Cost Efficiency', before: `${sym}15`, after: `${sym}${compData.cpe}`, up: compData.cpe < 15 },
                        { label: 'Creator Network', before: '0', after: `${campaign.creators.length}`, up: true },
                    ].map((m, i) => (
                        <div key={i} style={{ textAlign: 'center', padding: 16, borderRadius: 8, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                            <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 8 }}>{m.label}</div>
                            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12 }}>
                                <div>
                                    <div style={{ fontSize: 11, color: '#64748b' }}>Before</div>
                                    <div style={{ fontSize: 18, fontWeight: 600, color: '#94a3b8' }}>{m.before}</div>
                                </div>
                                <div style={{ color: m.up ? '#10b981' : '#ef4444' }}>{m.up ? <ArrowUp size={16} /> : <ArrowDown size={16} />}</div>
                                <div>
                                    <div style={{ fontSize: 11, color: '#64748b' }}>After</div>
                                    <div style={{ fontSize: 18, fontWeight: 700, color: m.up ? '#10b981' : '#ef4444' }}>{m.after}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    )
}
