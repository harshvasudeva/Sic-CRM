import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Users, Target, Search, DollarSign, TrendingUp, Activity,
    Shield, Clock, Server, Database, Wifi, CheckCircle
} from 'lucide-react'
import {
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts'

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899']
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function AdminDashboard() {
    const [metrics, setMetrics] = useState(null)
    const [actions, setActions] = useState([])

    useEffect(() => {
        try {
            const { getPlatformMetrics, getAdminActions } = require('../../stores/adminStore')
            setMetrics(getPlatformMetrics())
            setActions(getAdminActions() || [])
        } catch {
            setMetrics({
                totalUsers: 0, activeUsers: 0, totalCampaigns: 0, activeCampaigns: 0,
                totalSearches: 0, revenue: 0, mrr: 0,
                userGrowth: [], campaignActivity: [], topSearched: [], activityHeatmap: []
            })
            setActions([])
        }
    }, [])

    const formatNum = (n) => {
        if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
        if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
        return String(n || 0)
    }

    const formatCurrency = (n) => {
        if (n >= 10000000) return `$${(n / 1000000).toFixed(1)}M`
        if (n >= 100000) return `$${(n / 1000).toFixed(0)}K`
        if (n >= 1000) return `$${(n / 1000).toFixed(1)}K`
        return `$${n}`
    }

    const systemHealth = [
        { label: 'API Server', status: 'healthy', icon: Server },
        { label: 'Database', status: 'healthy', icon: Database },
        { label: 'CDN', status: 'healthy', icon: Wifi },
        { label: 'Auth Service', status: 'healthy', icon: Shield },
    ]

    // Generate heatmap data from metrics
    const heatmapData = metrics?.activityHeatmap || []
    const heatmapMax = Math.max(...heatmapData.map(d => d.value), 1)

    const getHeatmapColor = (value) => {
        const intensity = value / heatmapMax
        if (intensity > 0.75) return '#6366f1'
        if (intensity > 0.5) return 'rgba(99,102,241,0.6)'
        if (intensity > 0.25) return 'rgba(99,102,241,0.3)'
        return 'rgba(255,255,255,0.05)'
    }

    const s = {
        container: { padding: '24px', maxWidth: '1400px', margin: '0 auto' },
        header: { marginBottom: '24px' },
        title: { fontSize: '28px', fontWeight: 700, color: '#fff', margin: 0 },
        subtitle: { fontSize: '14px', color: '#94a3b8', marginTop: '4px' },
        panel: { background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', padding: '20px' },
        sectionTitle: { fontSize: '14px', fontWeight: 600, color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' },
        kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '20px' },
        kpiCard: (color) => ({
            background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', padding: '18px',
            borderLeft: `3px solid ${color}`
        }),
        kpiValue: { fontSize: '26px', fontWeight: 700, color: '#fff' },
        kpiLabel: { fontSize: '12px', color: '#94a3b8', marginTop: '2px' },
        kpiIcon: { marginBottom: '8px' },
        chartGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' },
        bottomGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px' },
        table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
        th: { padding: '8px 12px', textAlign: 'left', color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.1)', fontWeight: 600, fontSize: '12px' },
        td: { padding: '8px 12px', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.05)' },
        healthRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' },
        healthDot: { width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' },
        actionItem: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '12px' },
        heatmapGrid: { display: 'grid', gridTemplateColumns: 'repeat(24, 1fr)', gap: '2px' },
        heatmapCell: (value) => ({
            width: '100%', aspectRatio: '1', borderRadius: '2px',
            background: getHeatmapColor(value)
        }),
        heatmapLabel: { fontSize: '10px', color: '#64748b', textAlign: 'right', paddingRight: '6px' },
    }

    if (!metrics) return <div style={{ color: '#94a3b8', padding: '40px', textAlign: 'center' }}>Loading...</div>

    return (
        <div style={s.container}>
            <motion.div style={s.header} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 style={s.title}><span className="gradient-text">Admin</span> Dashboard</h1>
                <p style={s.subtitle}>Platform-wide metrics, user activity, and system health</p>
            </motion.div>

            {/* KPI Cards */}
            <div style={s.kpiGrid}>
                {[
                    { icon: Users, label: 'Total Users', value: formatNum(metrics.totalUsers), color: '#6366f1' },
                    { icon: Target, label: 'Active Campaigns', value: metrics.activeCampaigns, color: '#10b981' },
                    { icon: Search, label: 'Total Searches', value: formatNum(metrics.totalSearches), color: '#06b6d4' },
                    { icon: DollarSign, label: 'Revenue', value: formatCurrency(metrics.revenue), color: '#f59e0b' },
                    { icon: TrendingUp, label: 'MRR', value: formatCurrency(metrics.mrr), color: '#ec4899' },
                ].map((kpi, i) => (
                    <motion.div key={i} style={s.kpiCard(kpi.color)} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                        <div style={s.kpiIcon}><kpi.icon size={20} color={kpi.color} /></div>
                        <div style={s.kpiValue}>{kpi.value}</div>
                        <div style={s.kpiLabel}>{kpi.label}</div>
                    </motion.div>
                ))}
            </div>

            {/* Charts Row */}
            <div style={s.chartGrid}>
                {/* User Growth */}
                <motion.div style={s.panel} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <div style={s.sectionTitle}><TrendingUp size={16} color="#6366f1" /> User Growth</div>
                    <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={metrics.userGrowth}>
                            <defs>
                                <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                            <XAxis dataKey="month" stroke="#64748b" fontSize={11} tick={{ fill: '#94a3b8' }} />
                            <YAxis stroke="#64748b" fontSize={11} tick={{ fill: '#94a3b8' }} />
                            <Tooltip contentStyle={{ background: '#1e1e2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                            <Area type="monotone" dataKey="users" stroke="#6366f1" strokeWidth={2} fill="url(#userGrad)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Campaign Activity */}
                <motion.div style={s.panel} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                    <div style={s.sectionTitle}><Target size={16} color="#10b981" /> Campaign Activity</div>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={metrics.campaignActivity}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                            <XAxis dataKey="month" stroke="#64748b" fontSize={11} tick={{ fill: '#94a3b8' }} />
                            <YAxis stroke="#64748b" fontSize={11} tick={{ fill: '#94a3b8' }} />
                            <Tooltip contentStyle={{ background: '#1e1e2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                            <Bar dataKey="created" fill="#6366f1" radius={[4, 4, 0, 0]} name="Created" />
                            <Bar dataKey="completed" fill="#10b981" radius={[4, 4, 0, 0]} name="Completed" />
                        </BarChart>
                    </ResponsiveContainer>
                </motion.div>
            </div>

            {/* Bottom 3 Columns */}
            <div style={s.bottomGrid}>
                {/* Top Searched */}
                <motion.div style={s.panel} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <div style={s.sectionTitle}><Search size={16} color="#06b6d4" /> Top Searched Creators</div>
                    <table style={s.table}>
                        <thead>
                            <tr>
                                <th style={s.th}>Category</th>
                                <th style={s.th}>Searches</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(metrics.topSearched || []).map((item, i) => (
                                <tr key={i}>
                                    <td style={s.td}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: COLORS[i % COLORS.length] }} />
                                            {item.name}
                                        </div>
                                    </td>
                                    <td style={s.td}>{formatNum(item.searches)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </motion.div>

                {/* Activity Heatmap */}
                <motion.div style={s.panel} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                    <div style={s.sectionTitle}><Activity size={16} color="#f59e0b" /> User Activity Heatmap</div>
                    <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                        <span>12AM</span><span>6AM</span><span>12PM</span><span>6PM</span><span>11PM</span>
                    </div>
                    {Array.from({ length: 7 }, (_, dayIdx) => (
                        <div key={dayIdx} style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                            <span style={s.heatmapLabel}>{DAYS[dayIdx]}</span>
                            <div style={{ ...s.heatmapGrid, flex: 1 }}>
                                {heatmapData.filter(d => d.day === dayIdx).map((d, i) => (
                                    <div key={i} style={s.heatmapCell(d.value)} title={`${DAYS[dayIdx]} ${d.hour}:00 - ${d.value} actions`} />
                                ))}
                            </div>
                        </div>
                    ))}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px', fontSize: '10px', color: '#64748b' }}>
                        <span>Less</span>
                        {[0.1, 0.3, 0.6, 1].map((v, i) => (
                            <div key={i} style={{ width: '12px', height: '12px', borderRadius: '2px', background: getHeatmapColor(v * heatmapMax) }} />
                        ))}
                        <span>More</span>
                    </div>
                </motion.div>

                {/* System Health + Recent Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <motion.div style={s.panel} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                        <div style={s.sectionTitle}><Shield size={16} color="#10b981" /> System Health</div>
                        {systemHealth.map((item, i) => (
                            <div key={i} style={s.healthRow}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', fontSize: '13px' }}>
                                    <item.icon size={14} color="#94a3b8" />
                                    {item.label}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <CheckCircle size={14} color="#10b981" />
                                    <span style={{ color: '#10b981', fontSize: '12px', fontWeight: 600 }}>Healthy</span>
                                </div>
                            </div>
                        ))}
                    </motion.div>

                    <motion.div style={s.panel} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
                        <div style={s.sectionTitle}><Clock size={16} color="#ec4899" /> Recent Admin Actions</div>
                        {actions.slice(0, 5).map(act => (
                            <div key={act.id} style={s.actionItem}>
                                <div>
                                    <div style={{ color: '#fff', fontWeight: 500 }}>{act.action}</div>
                                    <div style={{ color: '#64748b', fontSize: '11px' }}>{act.target} | by {act.by}</div>
                                </div>
                                <div style={{ color: '#64748b', whiteSpace: 'nowrap' }}>{new Date(act.date).toLocaleDateString()}</div>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </div>
        </div>
    )
}

export default AdminDashboard
