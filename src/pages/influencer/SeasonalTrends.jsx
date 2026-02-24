import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Calendar, TrendingUp, TrendingDown, Sun, Snowflake, Leaf, Cloud, Award, AlertTriangle } from 'lucide-react'
import { getCreators } from '../../stores/influencerStore'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const SEASONAL_DATA = {
    'cr-001': {
        monthly: [
            { month: 'Jan', views: 42000, engagement: 4.2, posts: 12 },
            { month: 'Feb', views: 48000, engagement: 4.8, posts: 14 },
            { month: 'Mar', views: 55000, engagement: 5.1, posts: 15 },
            { month: 'Apr', views: 62000, engagement: 5.5, posts: 16 },
            { month: 'May', views: 58000, engagement: 5.2, posts: 14 },
            { month: 'Jun', views: 45000, engagement: 4.0, posts: 10 },
            { month: 'Jul', views: 40000, engagement: 3.8, posts: 9 },
            { month: 'Aug', views: 43000, engagement: 4.1, posts: 11 },
            { month: 'Sep', views: 50000, engagement: 4.6, posts: 13 },
            { month: 'Oct', views: 65000, engagement: 5.8, posts: 18 },
            { month: 'Nov', views: 72000, engagement: 6.2, posts: 20 },
            { month: 'Dec', views: 68000, engagement: 5.9, posts: 17 },
        ],
        recommendation: 'Priya performs best in Oct-Dec (festive season). Schedule major beauty brand campaigns during Diwali/Christmas. Summer months (Jun-Jul) see a dip - consider reducing campaign load or running lighter content.',
    },
    'cr-002': {
        monthly: [
            { month: 'Jan', views: 180000, engagement: 6.5, posts: 8 },
            { month: 'Feb', views: 175000, engagement: 6.2, posts: 7 },
            { month: 'Mar', views: 195000, engagement: 7.0, posts: 9 },
            { month: 'Apr', views: 165000, engagement: 5.8, posts: 7 },
            { month: 'May', views: 155000, engagement: 5.5, posts: 6 },
            { month: 'Jun', views: 160000, engagement: 5.7, posts: 7 },
            { month: 'Jul', views: 200000, engagement: 7.2, posts: 10 },
            { month: 'Aug', views: 220000, engagement: 7.8, posts: 11 },
            { month: 'Sep', views: 210000, engagement: 7.5, posts: 10 },
            { month: 'Oct', views: 230000, engagement: 8.0, posts: 12 },
            { month: 'Nov', views: 240000, engagement: 8.2, posts: 12 },
            { month: 'Dec', views: 185000, engagement: 6.4, posts: 8 },
        ],
        recommendation: 'Rohan peaks during Jul-Nov when major tech launches happen (Samsung Unpacked, Apple Event, Diwali sales). Best months for tech brand campaigns. Q1 is steady but Q2 (Apr-Jun) dips slightly.',
    },
    'cr-003': {
        monthly: [
            { month: 'Jan', views: 35000, engagement: 5.5, posts: 18 },
            { month: 'Feb', views: 32000, engagement: 5.2, posts: 16 },
            { month: 'Mar', views: 28000, engagement: 4.8, posts: 14 },
            { month: 'Apr', views: 26000, engagement: 4.5, posts: 12 },
            { month: 'May', views: 22000, engagement: 4.0, posts: 10 },
            { month: 'Jun', views: 20000, engagement: 3.8, posts: 8 },
            { month: 'Jul', views: 24000, engagement: 4.2, posts: 11 },
            { month: 'Aug', views: 28000, engagement: 4.7, posts: 14 },
            { month: 'Sep', views: 30000, engagement: 5.0, posts: 16 },
            { month: 'Oct', views: 27000, engagement: 4.6, posts: 13 },
            { month: 'Nov', views: 25000, engagement: 4.3, posts: 12 },
            { month: 'Dec', views: 22000, engagement: 3.9, posts: 9 },
        ],
        recommendation: 'Ananya performs best in Jan (New Year fitness resolutions) and Sep (back-to-routine). Summer months are weakest. Schedule supplement/fitness brand campaigns in Jan or Sep for maximum impact.',
    },
    'cr-004': {
        monthly: [
            { month: 'Jan', views: 88000, engagement: 5.8, posts: 10 },
            { month: 'Feb', views: 92000, engagement: 6.0, posts: 11 },
            { month: 'Mar', views: 98000, engagement: 6.3, posts: 12 },
            { month: 'Apr', views: 85000, engagement: 5.5, posts: 9 },
            { month: 'May', views: 80000, engagement: 5.2, posts: 8 },
            { month: 'Jun', views: 75000, engagement: 5.0, posts: 8 },
            { month: 'Jul', views: 82000, engagement: 5.4, posts: 9 },
            { month: 'Aug', views: 95000, engagement: 6.2, posts: 11 },
            { month: 'Sep', views: 100000, engagement: 6.5, posts: 12 },
            { month: 'Oct', views: 115000, engagement: 7.2, posts: 14 },
            { month: 'Nov', views: 120000, engagement: 7.5, posts: 15 },
            { month: 'Dec', views: 110000, engagement: 7.0, posts: 13 },
        ],
        recommendation: 'Karthik\'s food content peaks during festive season (Oct-Dec) and has a secondary spike in Aug-Sep. Food delivery brands (Swiggy/Zomato) should target these months. Summer (May-Jun) is the weakest period.',
    },
    'cr-005': {
        monthly: [
            { month: 'Jan', views: 30000, engagement: 3.5, posts: 6 },
            { month: 'Feb', views: 35000, engagement: 3.8, posts: 7 },
            { month: 'Mar', views: 42000, engagement: 4.5, posts: 9 },
            { month: 'Apr', views: 48000, engagement: 5.0, posts: 10 },
            { month: 'May', views: 55000, engagement: 5.5, posts: 12 },
            { month: 'Jun', views: 52000, engagement: 5.3, posts: 11 },
            { month: 'Jul', views: 38000, engagement: 4.0, posts: 7 },
            { month: 'Aug', views: 32000, engagement: 3.6, posts: 6 },
            { month: 'Sep', views: 40000, engagement: 4.3, posts: 8 },
            { month: 'Oct', views: 50000, engagement: 5.2, posts: 11 },
            { month: 'Nov', views: 45000, engagement: 4.8, posts: 9 },
            { month: 'Dec', views: 55000, engagement: 5.6, posts: 12 },
        ],
        recommendation: 'Sneha\'s travel content peaks in Apr-Jun (summer vacations) and Dec (holiday travel). Jul-Aug (monsoon) sees lowest engagement. Schedule travel brand campaigns for May or Dec. Note: reliability issues may affect delivery.',
    },
    'cr-006': {
        monthly: [
            { month: 'Jan', views: 110000, engagement: 7.0, posts: 14 },
            { month: 'Feb', views: 105000, engagement: 6.8, posts: 13 },
            { month: 'Mar', views: 115000, engagement: 7.2, posts: 15 },
            { month: 'Apr', views: 120000, engagement: 7.5, posts: 16 },
            { month: 'May', views: 118000, engagement: 7.3, posts: 15 },
            { month: 'Jun', views: 108000, engagement: 6.9, posts: 13 },
            { month: 'Jul', views: 112000, engagement: 7.1, posts: 14 },
            { month: 'Aug', views: 125000, engagement: 7.8, posts: 17 },
            { month: 'Sep', views: 130000, engagement: 8.0, posts: 18 },
            { month: 'Oct', views: 140000, engagement: 8.5, posts: 20 },
            { month: 'Nov', views: 150000, engagement: 8.8, posts: 22 },
            { month: 'Dec', views: 145000, engagement: 8.6, posts: 21 },
        ],
        recommendation: 'Aditya\'s comedy content is consistently strong year-round with peaks in Oct-Dec (festive mood boosts comedy engagement). He maintains high output even in off-months. Ideal for always-on campaigns.',
    },
}

function getHeatColor(value, min, max) {
    const ratio = (value - min) / (max - min || 1)
    if (ratio >= 0.8) return { bg: 'rgba(16,185,129,0.35)', color: '#10b981' }
    if (ratio >= 0.6) return { bg: 'rgba(16,185,129,0.2)', color: '#10b981' }
    if (ratio >= 0.4) return { bg: 'rgba(245,158,11,0.2)', color: '#f59e0b' }
    if (ratio >= 0.2) return { bg: 'rgba(239,68,68,0.15)', color: '#ef4444' }
    return { bg: 'rgba(239,68,68,0.25)', color: '#ef4444' }
}

const tooltipStyle = {
    background: '#1e1e2d',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: 8,
    fontSize: 12,
    color: '#fff',
}

const formatNum = (n) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
    return String(n)
}

export default function SeasonalTrends() {
    const [creators, setCreators] = useState([])
    const [selectedId, setSelectedId] = useState(null)

    useEffect(() => {
        const all = getCreators()
        setCreators(all)
        if (all.length > 0) setSelectedId(all[0].id)
    }, [])

    const data = selectedId ? SEASONAL_DATA[selectedId] : null
    const selectedCreator = creators.find(c => c.id === selectedId)

    const { bestMonth, worstMonth, viewsMin, viewsMax, engMin, engMax } = useMemo(() => {
        if (!data) return { bestMonth: null, worstMonth: null, viewsMin: 0, viewsMax: 0, engMin: 0, engMax: 0 }
        const sorted = [...data.monthly].sort((a, b) => b.views - a.views)
        const views = data.monthly.map(m => m.views)
        const engs = data.monthly.map(m => m.engagement)
        return {
            bestMonth: sorted[0],
            worstMonth: sorted[sorted.length - 1],
            viewsMin: Math.min(...views),
            viewsMax: Math.max(...views),
            engMin: Math.min(...engs),
            engMax: Math.max(...engs),
        }
    }, [data])

    return (
        <div style={{ padding: 24, maxWidth: 1400, margin: '0 auto' }}>
            <motion.div style={{ marginBottom: 28 }} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 style={{ fontSize: '1.6rem', fontWeight: 700, color: '#fff', marginBottom: 4 }}>
                    <span style={{ background: 'linear-gradient(135deg, #f59e0b, #10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Seasonal</span> Trends
                </h1>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Identify peak and off-peak months for each creator to optimize campaign timing</p>
            </motion.div>

            {/* Creator Selector */}
            <motion.div
                style={{
                    display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24,
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 12, padding: '12px 16px',
                }}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            >
                <Calendar size={16} color="#94a3b8" />
                <span style={{ fontSize: '0.8rem', color: '#94a3b8', flexShrink: 0 }}>Select Creator:</span>
                <select
                    style={{
                        padding: '6px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)',
                        background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '0.8rem', outline: 'none', cursor: 'pointer',
                    }}
                    value={selectedId || ''}
                    onChange={e => setSelectedId(e.target.value)}
                >
                    {creators.map(c => (
                        <option key={c.id} value={c.id} style={{ background: '#1e1e2d' }}>{c.name} ({c.niche})</option>
                    ))}
                </select>
            </motion.div>

            {!data ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 80, color: '#94a3b8', gap: 12 }}>
                    <Calendar size={48} />
                    <p>No seasonal data available</p>
                </div>
            ) : (
                <>
                    {/* Best / Worst Month Cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
                        <motion.div
                            style={{
                                background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)',
                                borderRadius: 16, padding: 24, display: 'flex', alignItems: 'center', gap: 20,
                            }}
                            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
                        >
                            <div style={{
                                width: 56, height: 56, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: 'rgba(16,185,129,0.15)', color: '#10b981', flexShrink: 0,
                            }}>
                                <Award size={28} />
                            </div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Best Month</div>
                                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff' }}>{bestMonth?.month}</div>
                                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 2 }}>
                                    {formatNum(bestMonth?.views)} views | {bestMonth?.engagement}% engagement | {bestMonth?.posts} posts
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            style={{
                                background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                                borderRadius: 16, padding: 24, display: 'flex', alignItems: 'center', gap: 20,
                            }}
                            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}
                        >
                            <div style={{
                                width: 56, height: 56, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                background: 'rgba(239,68,68,0.15)', color: '#ef4444', flexShrink: 0,
                            }}>
                                <AlertTriangle size={28} />
                            </div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Worst Month</div>
                                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff' }}>{worstMonth?.month}</div>
                                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: 2 }}>
                                    {formatNum(worstMonth?.views)} views | {worstMonth?.engagement}% engagement | {worstMonth?.posts} posts
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* 12-Month Line Chart */}
                    <motion.div
                        style={{
                            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 16, padding: 24, marginBottom: 24,
                        }}
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                    >
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <TrendingUp size={16} /> Monthly Performance (12-Month)
                        </h3>
                        <ResponsiveContainer width="100%" height={280}>
                            <LineChart data={data.monthly}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                                <YAxis yAxisId="views" tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={formatNum} />
                                <YAxis yAxisId="engagement" orientation="right" tick={{ fontSize: 10, fill: '#94a3b8' }} tickFormatter={v => `${v}%`} />
                                <Tooltip contentStyle={tooltipStyle} formatter={(v, name) => name === 'views' ? formatNum(v) : `${v}%`} />
                                <Legend />
                                <Line yAxisId="views" type="monotone" dataKey="views" stroke="#6366f1" strokeWidth={2.5} dot={{ fill: '#6366f1', r: 4 }} name="Avg Views" />
                                <Line yAxisId="engagement" type="monotone" dataKey="engagement" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981', r: 3 }} name="Engagement %" />
                            </LineChart>
                        </ResponsiveContainer>
                    </motion.div>

                    {/* Heat Grid */}
                    <motion.div
                        style={{
                            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: 16, padding: 24, marginBottom: 24,
                        }}
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    >
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Sun size={16} color="#f59e0b" /> Seasonal Heat Map
                        </h3>

                        {/* Views Heat Grid */}
                        <div style={{ marginBottom: 20 }}>
                            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: 10, fontWeight: 600 }}>Views</div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 6 }}>
                                {data.monthly.map((m, i) => {
                                    const hc = getHeatColor(m.views, viewsMin, viewsMax)
                                    return (
                                        <motion.div
                                            key={i}
                                            style={{
                                                background: hc.bg, borderRadius: 10, padding: '12px 6px', textAlign: 'center',
                                                border: '1px solid rgba(255,255,255,0.06)', cursor: 'default',
                                            }}
                                            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.25 + i * 0.03 }}
                                            title={`${m.month}: ${formatNum(m.views)} views`}
                                        >
                                            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: 4 }}>{m.month}</div>
                                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: hc.color }}>{formatNum(m.views)}</div>
                                        </motion.div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Engagement Heat Grid */}
                        <div>
                            <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: 10, fontWeight: 600 }}>Engagement Rate</div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 6 }}>
                                {data.monthly.map((m, i) => {
                                    const hc = getHeatColor(m.engagement, engMin, engMax)
                                    return (
                                        <motion.div
                                            key={i}
                                            style={{
                                                background: hc.bg, borderRadius: 10, padding: '12px 6px', textAlign: 'center',
                                                border: '1px solid rgba(255,255,255,0.06)', cursor: 'default',
                                            }}
                                            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.35 + i * 0.03 }}
                                            title={`${m.month}: ${m.engagement}% engagement`}
                                        >
                                            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: 4 }}>{m.month}</div>
                                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: hc.color }}>{m.engagement}%</div>
                                        </motion.div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Legend */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 16, justifyContent: 'center' }}>
                            {[
                                { label: 'Lowest', bg: 'rgba(239,68,68,0.25)' },
                                { label: 'Low', bg: 'rgba(239,68,68,0.15)' },
                                { label: 'Medium', bg: 'rgba(245,158,11,0.2)' },
                                { label: 'High', bg: 'rgba(16,185,129,0.2)' },
                                { label: 'Highest', bg: 'rgba(16,185,129,0.35)' },
                            ].map((item, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.7rem', color: '#94a3b8' }}>
                                    <div style={{ width: 14, height: 14, borderRadius: 4, background: item.bg }} />
                                    {item.label}
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Recommendation */}
                    <motion.div
                        style={{
                            background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
                            borderRadius: 16, padding: 24, display: 'flex', alignItems: 'flex-start', gap: 16,
                        }}
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                    >
                        <div style={{
                            width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                            background: 'rgba(99,102,241,0.15)', color: '#6366f1',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Leaf size={22} />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff', marginBottom: 6 }}>Seasonal Recommendation</div>
                            <p style={{ fontSize: '0.8rem', color: '#c4b5fd', lineHeight: 1.7, margin: 0 }}>{data.recommendation}</p>
                        </div>
                    </motion.div>

                    {/* Seasonal Icons Row */}
                    <motion.div
                        style={{
                            display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginTop: 24,
                        }}
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
                    >
                        {[
                            { icon: Snowflake, label: 'Winter (Jan-Feb)', months: [0, 1], color: '#3b82f6' },
                            { icon: Sun, label: 'Summer (Mar-Jun)', months: [2, 3, 4, 5], color: '#f59e0b' },
                            { icon: Cloud, label: 'Monsoon (Jul-Sep)', months: [6, 7, 8], color: '#6b7280' },
                            { icon: Leaf, label: 'Festive (Oct-Dec)', months: [9, 10, 11], color: '#10b981' },
                        ].map((season, si) => {
                            const avgViews = Math.round(season.months.reduce((s, mi) => s + data.monthly[mi].views, 0) / season.months.length)
                            const avgEng = (season.months.reduce((s, mi) => s + data.monthly[mi].engagement, 0) / season.months.length).toFixed(1)
                            return (
                                <motion.div
                                    key={si}
                                    style={{
                                        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: 14, padding: 20, textAlign: 'center',
                                    }}
                                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 + si * 0.05 }}
                                >
                                    <div style={{
                                        width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        margin: '0 auto 10px', background: `${season.color}20`, color: season.color,
                                    }}>
                                        <season.icon size={20} />
                                    </div>
                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: 4 }}>{season.label}</div>
                                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff' }}>{formatNum(avgViews)}</div>
                                    <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>avg views | {avgEng}% eng</div>
                                </motion.div>
                            )
                        })}
                    </motion.div>
                </>
            )}
        </div>
    )
}
