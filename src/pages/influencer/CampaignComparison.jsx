import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { BarChart3, ChevronLeft, Eye, Heart, MessageSquare, Share2, IndianRupee, Target, TrendingUp, Users } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts'
import { getCampaigns, compareCampaigns } from '../../stores/influencerStore'
import { getCurrency } from '../../stores/settingsStore'

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444']

function CampaignComparison() {
    const navigate = useNavigate()
    const [campaigns, setCampaigns] = useState([])
    const [selected, setSelected] = useState([])
    const [comparison, setComparison] = useState([])

    useEffect(() => { setCampaigns(getCampaigns()) }, [])

    function toggleCampaign(id) {
        const next = selected.includes(id) ? selected.filter(s => s !== id) : selected.length < 3 ? [...selected, id] : selected
        setSelected(next)
        if (next.length >= 2) setComparison(compareCampaigns(next))
        else setComparison([])
    }

    const formatCurrency = (val) => {
        const s = getCurrency().symbol
        if (val >= 100000) return `${s}${(val / 100000).toFixed(1)}L`
        if (val >= 1000) return `${s}${(val / 1000).toFixed(1)}K`
        return `${s}${val}`
    }

    const formatNum = (n) => {
        if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
        if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
        return String(n)
    }

    const barData = comparison.map(c => ({
        name: c.name.length > 15 ? c.name.slice(0, 15) + '...' : c.name,
        Views: c.metrics.views,
        Likes: c.metrics.likes,
        Comments: c.metrics.comments,
        Shares: c.metrics.shares,
    }))

    const radarData = comparison.length ? [
        { metric: 'Views', ...Object.fromEntries(comparison.map((c, i) => [`c${i}`, c.metrics.views > 0 ? Math.min(c.metrics.views / 1000, 100) : 0])) },
        { metric: 'Engagement', ...Object.fromEntries(comparison.map((c, i) => [`c${i}`, c.metrics.engagement > 0 ? Math.min(c.metrics.engagement / 100, 100) : 0])) },
        { metric: 'ROI', ...Object.fromEntries(comparison.map((c, i) => [`c${i}`, Math.max(0, Math.min(parseFloat(c.roi) || 0, 100))])) },
        { metric: 'Budget Used', ...Object.fromEntries(comparison.map((c, i) => [`c${i}`, c.budgetUtilization])) },
        { metric: 'Creators', ...Object.fromEntries(comparison.map((c, i) => [`c${i}`, c.creators.length * 20])) },
    ] : []

    return (
        <div className="page">
            <motion.div className="page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <div>
                    <h1 className="page-title"><span className="gradient-text">Campaign</span> Comparison</h1>
                    <p className="page-description">Compare 2-3 campaigns side by side for performance analysis</p>
                </div>
                <button className="btn-secondary" onClick={() => navigate('/influencer/campaigns')}>
                    <ChevronLeft size={16} /> Back to Campaigns
                </button>
            </motion.div>

            {/* Campaign Selector */}
            <div className="cc-selector">
                <h3>Select 2-3 campaigns to compare</h3>
                <div className="cc-campaign-list">
                    {campaigns.map(c => (
                        <button key={c.id} className={`cc-camp-btn ${selected.includes(c.id) ? 'active' : ''}`}
                            onClick={() => toggleCampaign(c.id)}>
                            <div className="cc-camp-check">{selected.includes(c.id) ? '✓' : ''}</div>
                            <div>
                                <div className="cc-camp-name">{c.name}</div>
                                <div className="cc-camp-meta">{c.brand} &bull; {c.platform} &bull; {formatCurrency(c.budget)}</div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {comparison.length >= 2 && (
                <>
                    {/* Metrics Table */}
                    <motion.div className="cc-table-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <h3><Target size={16} /> Side-by-Side Metrics</h3>
                        <div className="cc-table-wrap">
                            <table className="cc-table">
                                <thead>
                                    <tr>
                                        <th>Metric</th>
                                        {comparison.map((c, i) => (
                                            <th key={i} style={{ color: COLORS[i] }}>{c.name.length > 20 ? c.name.slice(0, 20) + '...' : c.name}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {[
                                        { label: 'Brand', icon: Users, get: c => c.brand },
                                        { label: 'Platform', icon: Target, get: c => c.platform },
                                        { label: 'Budget', icon: IndianRupee, get: c => formatCurrency(c.budget) },
                                        { label: 'Spent', icon: IndianRupee, get: c => formatCurrency(c.spent) },
                                        { label: 'Budget Used', icon: TrendingUp, get: c => `${c.budgetUtilization}%` },
                                        { label: 'Creators', icon: Users, get: c => c.creators.length },
                                        { label: 'Views', icon: Eye, get: c => formatNum(c.metrics.views) },
                                        { label: 'Likes', icon: Heart, get: c => formatNum(c.metrics.likes) },
                                        { label: 'Comments', icon: MessageSquare, get: c => formatNum(c.metrics.comments) },
                                        { label: 'Shares', icon: Share2, get: c => formatNum(c.metrics.shares) },
                                        { label: 'Total Engagement', icon: TrendingUp, get: c => formatNum(c.metrics.engagement) },
                                        { label: 'Cost per Engagement', icon: IndianRupee, get: c => c.cpe > 0 ? `${getCurrency().symbol}${c.cpe}` : 'N/A' },
                                        { label: 'ROI', icon: BarChart3, get: c => `${c.roi}%` },
                                    ].map((row, ri) => (
                                        <tr key={ri}>
                                            <td><row.icon size={14} /> {row.label}</td>
                                            {comparison.map((c, ci) => <td key={ci}>{row.get(c)}</td>)}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>

                    {/* Charts */}
                    <div className="cc-charts-grid">
                        <motion.div className="cc-chart-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                            <h3><BarChart3 size={16} /> Engagement Breakdown</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={barData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#888' }} />
                                    <YAxis tick={{ fontSize: 10, fill: '#888' }} tickFormatter={formatNum} />
                                    <Tooltip contentStyle={{ background: '#1e1e2d', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
                                    <Legend />
                                    <Bar dataKey="Views" fill="#6366f1" radius={[4,4,0,0]} />
                                    <Bar dataKey="Likes" fill="#ef4444" radius={[4,4,0,0]} />
                                    <Bar dataKey="Comments" fill="#10b981" radius={[4,4,0,0]} />
                                    <Bar dataKey="Shares" fill="#3b82f6" radius={[4,4,0,0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </motion.div>

                        <motion.div className="cc-chart-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                            <h3><Target size={16} /> Performance Radar</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <RadarChart data={radarData}>
                                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                                    <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: '#aaa' }} />
                                    <PolarRadiusAxis tick={{ fontSize: 9, fill: '#666' }} />
                                    {comparison.map((c, i) => (
                                        <Radar key={i} name={c.name} dataKey={`c${i}`} stroke={COLORS[i]} fill={COLORS[i]} fillOpacity={0.15} strokeWidth={2} />
                                    ))}
                                    <Legend />
                                    <Tooltip contentStyle={{ background: '#1e1e2d', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </motion.div>
                    </div>
                </>
            )}

            {selected.length === 1 && (
                <div className="cc-hint">Select at least one more campaign to compare</div>
            )}

            <style>{`
                .cc-selector {
                    background: rgba(30,30,45,0.6); border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 16px; padding: 20px; margin-bottom: 24px;
                }
                .cc-selector h3 { font-size: 0.9rem; margin-bottom: 14px; color: var(--text-primary); }
                .cc-campaign-list { display: flex; flex-wrap: wrap; gap: 10px; }
                .cc-camp-btn {
                    display: flex; align-items: center; gap: 10px; padding: 12px 16px;
                    border-radius: 12px; border: 1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.02);
                    cursor: pointer; transition: all 0.15s; text-align: left; color: var(--text-secondary);
                }
                .cc-camp-btn:hover { border-color: rgba(99,102,241,0.3); }
                .cc-camp-btn.active { border-color: #6366f1; background: rgba(99,102,241,0.1); }
                .cc-camp-check {
                    width: 24px; height: 24px; border-radius: 6px; border: 2px solid rgba(255,255,255,0.2);
                    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
                    font-size: 0.8rem; color: #6366f1; font-weight: 700;
                }
                .cc-camp-btn.active .cc-camp-check { border-color: #6366f1; background: rgba(99,102,241,0.2); }
                .cc-camp-name { font-size: 0.85rem; font-weight: 600; color: var(--text-primary); }
                .cc-camp-meta { font-size: 0.7rem; color: var(--text-muted); margin-top: 2px; }
                .cc-table-card {
                    background: rgba(30,30,45,0.6); border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 16px; padding: 20px; margin-bottom: 24px;
                }
                .cc-table-card h3 { display: flex; align-items: center; gap: 8px; font-size: 0.9rem; margin-bottom: 16px; }
                .cc-table-wrap { overflow-x: auto; }
                .cc-table { width: 100%; border-collapse: collapse; }
                .cc-table th { padding: 10px 14px; font-size: 0.8rem; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.08); font-weight: 600; }
                .cc-table td {
                    padding: 10px 14px; font-size: 0.85rem; color: var(--text-secondary);
                    border-bottom: 1px solid rgba(255,255,255,0.03);
                }
                .cc-table td:first-child { display: flex; align-items: center; gap: 8px; font-weight: 500; color: var(--text-primary); white-space: nowrap; }
                .cc-charts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px; }
                .cc-chart-card {
                    background: rgba(30,30,45,0.6); border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 16px; padding: 20px;
                }
                .cc-chart-card h3 { display: flex; align-items: center; gap: 8px; font-size: 0.9rem; margin-bottom: 16px; color: var(--text-primary); }
                .cc-hint { text-align: center; padding: 40px; color: var(--text-muted); font-size: 0.9rem; }
                @media (max-width: 900px) { .cc-charts-grid { grid-template-columns: 1fr; } }
            `}</style>
        </div>
    )
}

export default CampaignComparison
