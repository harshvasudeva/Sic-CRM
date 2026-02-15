import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
    BarChart3, TrendingUp, Users, Eye, Heart, MessageSquare, Share2,
    ChevronLeft, Calendar, PieChart
} from 'lucide-react'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart as RPieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { getCreatorsWithScores } from '../../stores/influencerStore'
import { getCreatorAnalytics, getPostPerformance, getAudienceDemographics, getSentimentAnalysis } from '../../stores/analyticsStore'
import CreatorScoreCard from '../../components/influencer/CreatorScoreCard'

const PIE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4']

function CreatorAnalytics() {
    const navigate = useNavigate()
    const [creators, setCreators] = useState([])
    const [selectedCreator, setSelectedCreator] = useState(null)
    const [analytics, setAnalytics] = useState(null)
    const [posts, setPosts] = useState([])
    const [demographics, setDemographics] = useState(null)
    const [sentiment, setSentiment] = useState(null)
    const [dateRange, setDateRange] = useState(30)

    useEffect(() => {
        const all = getCreatorsWithScores()
        setCreators(all)
        if (all.length) selectCreator(all[0].id)
    }, [])

    function selectCreator(id) {
        const creator = creators.find(c => c.id === id) || getCreatorsWithScores().find(c => c.id === id)
        setSelectedCreator(creator)
        const a = getCreatorAnalytics(id)
        setAnalytics(a)
        setPosts(getPostPerformance(id))
        setDemographics(getAudienceDemographics(id))
        setSentiment(getSentimentAnalysis(id))
    }

    const formatNum = (n) => {
        if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
        if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
        return String(n)
    }

    const followerData = analytics?.followerGrowth?.slice(-dateRange) || []
    const engagementData = analytics?.engagementRate?.slice(-dateRange) || []
    const viewsData = analytics?.avgViews?.slice(-dateRange) || []

    const ageData = demographics ? Object.entries(demographics.age).map(([key, val]) => ({ name: key, value: val })) : []
    const genderData = demographics ? Object.entries(demographics.gender).map(([key, val]) => ({ name: key, value: val })) : []
    const locationData = demographics ? Object.entries(demographics.location).map(([key, val]) => ({ name: key, value: val })) : []

    const totalPostViews = posts.reduce((s, p) => s + p.views, 0)
    const totalPostLikes = posts.reduce((s, p) => s + p.likes, 0)
    const totalPostComments = posts.reduce((s, p) => s + p.comments, 0)
    const totalPostShares = posts.reduce((s, p) => s + p.shares, 0)

    return (
        <div className="page">
            <motion.div className="page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <div>
                    <h1 className="page-title"><span className="gradient-text">Creator</span> Analytics</h1>
                    <p className="page-description">Deep-dive into creator performance, audience, and engagement metrics</p>
                </div>
                <button className="btn-secondary" onClick={() => navigate('/influencer/creators')}>
                    <ChevronLeft size={16} /> Back to Creators
                </button>
            </motion.div>

            <div className="ca-layout">
                {/* Creator Selector */}
                <div className="ca-sidebar">
                    <h3 className="ca-sidebar-title">Select Creator</h3>
                    {creators.map(c => (
                        <button key={c.id} className={`ca-creator-btn ${selectedCreator?.id === c.id ? 'active' : ''}`}
                            onClick={() => selectCreator(c.id)}>
                            <div className="ca-cr-avatar">{c.name.charAt(0)}</div>
                            <div className="ca-cr-info">
                                <div className="ca-cr-name">{c.name}</div>
                                <div className="ca-cr-meta">{c.platform} &bull; {formatNum(c.followers)}</div>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Main Content */}
                <div className="ca-main">
                    {!selectedCreator || !analytics ? (
                        <div className="ca-empty"><BarChart3 size={48} /><p>Select a creator to view analytics</p></div>
                    ) : (
                        <>
                            {/* Top: Score Card + Stats */}
                            <div className="ca-top-grid">
                                <CreatorScoreCard creator={selectedCreator} />
                                <div className="ca-stats-grid">
                                    {[
                                        { icon: Eye, label: 'Total Views', value: formatNum(totalPostViews), color: '#6366f1' },
                                        { icon: Heart, label: 'Total Likes', value: formatNum(totalPostLikes), color: '#ef4444' },
                                        { icon: MessageSquare, label: 'Comments', value: formatNum(totalPostComments), color: '#10b981' },
                                        { icon: Share2, label: 'Shares', value: formatNum(totalPostShares), color: '#3b82f6' },
                                    ].map((stat, i) => (
                                        <motion.div key={i} className="ca-stat" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                                            <div className="ca-stat-icon" style={{ background: `${stat.color}20`, color: stat.color }}><stat.icon size={18} /></div>
                                            <div className="ca-stat-val">{stat.value}</div>
                                            <div className="ca-stat-label">{stat.label}</div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>

                            {/* Date Range */}
                            <div className="ca-date-range">
                                <Calendar size={14} />
                                {[7, 14, 30].map(d => (
                                    <button key={d} className={`ca-range-btn ${dateRange === d ? 'active' : ''}`}
                                        onClick={() => setDateRange(d)}>{d}D</button>
                                ))}
                            </div>

                            {/* Charts */}
                            <div className="ca-charts-grid">
                                <motion.div className="ca-chart-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                                    <h3><TrendingUp size={16} /> Follower Growth</h3>
                                    <ResponsiveContainer width="100%" height={220}>
                                        <AreaChart data={followerData}>
                                            <defs><linearGradient id="followerGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} /><stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                                            </linearGradient></defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#888' }} tickFormatter={d => d.slice(5)} />
                                            <YAxis tick={{ fontSize: 10, fill: '#888' }} tickFormatter={formatNum} />
                                            <Tooltip contentStyle={{ background: '#1e1e2d', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
                                            <Area type="monotone" dataKey="value" stroke="#6366f1" fill="url(#followerGrad)" strokeWidth={2} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </motion.div>

                                <motion.div className="ca-chart-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                                    <h3><BarChart3 size={16} /> Engagement Rate (%)</h3>
                                    <ResponsiveContainer width="100%" height={220}>
                                        <LineChart data={engagementData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#888' }} tickFormatter={d => d.slice(5)} />
                                            <YAxis tick={{ fontSize: 10, fill: '#888' }} />
                                            <Tooltip contentStyle={{ background: '#1e1e2d', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
                                            <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} dot={false} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </motion.div>
                            </div>

                            {/* Post Performance */}
                            <motion.div className="ca-chart-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                                <h3><Eye size={16} /> Post Performance</h3>
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart data={posts}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                        <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#888' }} tickFormatter={d => d.slice(5)} />
                                        <YAxis tick={{ fontSize: 10, fill: '#888' }} tickFormatter={formatNum} />
                                        <Tooltip contentStyle={{ background: '#1e1e2d', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
                                        <Legend />
                                        <Bar dataKey="views" fill="#6366f1" radius={[4,4,0,0]} />
                                        <Bar dataKey="likes" fill="#ef4444" radius={[4,4,0,0]} />
                                        <Bar dataKey="comments" fill="#10b981" radius={[4,4,0,0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </motion.div>

                            {/* Demographics */}
                            <div className="ca-demo-grid">
                                {[
                                    { title: 'Age Distribution', data: ageData },
                                    { title: 'Gender Split', data: genderData },
                                    { title: 'Top Locations', data: locationData },
                                ].map((chart, ci) => (
                                    <motion.div key={ci} className="ca-chart-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 + ci * 0.05 }}>
                                        <h3><PieChart size={16} /> {chart.title}</h3>
                                        <ResponsiveContainer width="100%" height={200}>
                                            <RPieChart>
                                                <Pie data={chart.data} cx="50%" cy="50%" outerRadius={70} innerRadius={35} dataKey="value" label={({ name, value }) => `${name}: ${value}%`}>
                                                    {chart.data.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                                                </Pie>
                                                <Tooltip contentStyle={{ background: '#1e1e2d', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
                                            </RPieChart>
                                        </ResponsiveContainer>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Sentiment */}
                            {sentiment && (
                                <motion.div className="ca-chart-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                                    <h3><MessageSquare size={16} /> Audience Sentiment</h3>
                                    <div className="ca-sentiment">
                                        <div className="ca-sentiment-bars">
                                            {[
                                                { label: 'Positive', value: sentiment.positive, color: '#10b981' },
                                                { label: 'Neutral', value: sentiment.neutral, color: '#f59e0b' },
                                                { label: 'Negative', value: sentiment.negative, color: '#ef4444' },
                                            ].map((s, i) => (
                                                <div key={i} className="ca-sent-row">
                                                    <span className="ca-sent-label">{s.label}</span>
                                                    <div className="ca-sent-bar-bg">
                                                        <motion.div className="ca-sent-bar" style={{ background: s.color }}
                                                            initial={{ width: 0 }} animate={{ width: `${s.value}%` }} transition={{ duration: 0.6, delay: i * 0.1 }} />
                                                    </div>
                                                    <span className="ca-sent-val">{s.value}%</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="ca-keywords">
                                            <span className="ca-kw-label">Top Keywords:</span>
                                            {sentiment.keywords.map((kw, i) => (
                                                <span key={i} className="ca-kw-chip">{kw}</span>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </>
                    )}
                </div>
            </div>

            <style>{`
                .ca-layout { display: grid; grid-template-columns: 240px 1fr; gap: 24px; }
                .ca-sidebar {
                    background: rgba(30,30,45,0.6); border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 16px; padding: 16px; position: sticky; top: 20px; max-height: calc(100vh - 120px); overflow-y: auto;
                }
                .ca-sidebar-title { font-size: 0.8rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; }
                .ca-creator-btn {
                    display: flex; align-items: center; gap: 10px; width: 100%;
                    padding: 10px; border-radius: 10px; border: none; background: none;
                    cursor: pointer; transition: all 0.15s; color: var(--text-secondary);
                }
                .ca-creator-btn:hover { background: rgba(255,255,255,0.05); }
                .ca-creator-btn.active { background: rgba(99,102,241,0.15); color: var(--text-primary); }
                .ca-cr-avatar {
                    width: 32px; height: 32px; border-radius: 8px; flex-shrink: 0;
                    background: rgba(99,102,241,0.15); color: var(--accent-primary);
                    display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.8rem;
                }
                .ca-cr-info { text-align: left; }
                .ca-cr-name { font-size: 0.8rem; font-weight: 600; }
                .ca-cr-meta { font-size: 0.7rem; color: var(--text-muted); }
                .ca-main { min-width: 0; }
                .ca-empty { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px; color: var(--text-muted); gap: 12px; }
                .ca-top-grid { display: grid; grid-template-columns: 280px 1fr; gap: 20px; margin-bottom: 20px; }
                .ca-stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
                .ca-stat {
                    background: rgba(30,30,45,0.6); border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 14px; padding: 16px; text-align: center;
                }
                .ca-stat-icon { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin: 0 auto 8px; }
                .ca-stat-val { font-size: 1.3rem; font-weight: 700; color: var(--text-primary); }
                .ca-stat-label { font-size: 0.75rem; color: var(--text-muted); margin-top: 2px; }
                .ca-date-range { display: flex; align-items: center; gap: 8px; margin-bottom: 20px; color: var(--text-muted); }
                .ca-range-btn {
                    padding: 4px 12px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1);
                    background: none; color: var(--text-secondary); font-size: 0.75rem; cursor: pointer;
                }
                .ca-range-btn.active { background: rgba(99,102,241,0.15); color: var(--accent-primary); border-color: rgba(99,102,241,0.3); }
                .ca-charts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
                .ca-chart-card {
                    background: rgba(30,30,45,0.6); border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 16px; padding: 20px; margin-bottom: 20px;
                }
                .ca-chart-card h3 { display: flex; align-items: center; gap: 8px; font-size: 0.9rem; font-weight: 600; color: var(--text-primary); margin-bottom: 16px; }
                .ca-demo-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 20px; }
                .ca-demo-grid .ca-chart-card { margin-bottom: 0; }
                .ca-sentiment { display: flex; flex-direction: column; gap: 16px; }
                .ca-sentiment-bars { display: flex; flex-direction: column; gap: 10px; }
                .ca-sent-row { display: flex; align-items: center; gap: 12px; }
                .ca-sent-label { width: 70px; font-size: 0.8rem; color: var(--text-secondary); }
                .ca-sent-bar-bg { flex: 1; height: 8px; background: rgba(255,255,255,0.05); border-radius: 4px; overflow: hidden; }
                .ca-sent-bar { height: 100%; border-radius: 4px; }
                .ca-sent-val { width: 40px; font-size: 0.8rem; font-weight: 600; color: var(--text-primary); text-align: right; }
                .ca-keywords { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
                .ca-kw-label { font-size: 0.8rem; color: var(--text-muted); }
                .ca-kw-chip { padding: 4px 10px; border-radius: 16px; font-size: 0.75rem; background: rgba(99,102,241,0.1); color: var(--accent-primary); }
                @media (max-width: 1100px) { .ca-layout { grid-template-columns: 1fr; } .ca-sidebar { position: static; max-height: none; } }
                @media (max-width: 900px) {
                    .ca-top-grid { grid-template-columns: 1fr; }
                    .ca-charts-grid { grid-template-columns: 1fr; }
                    .ca-demo-grid { grid-template-columns: 1fr; }
                }
            `}</style>
        </div>
    )
}

export default CreatorAnalytics
