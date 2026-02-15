import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
    Users, Megaphone, IndianRupee, Send, TrendingUp, Calendar,
    UserPlus, Target, FileText, Clock, ChevronRight, BarChart3,
    Zap, Eye, MessageSquare
} from 'lucide-react'
import { getInfluencerStats, getCreators, getCampaigns, getOutreachList, getCreatorsWithScores, getCreatorTierColor } from '../../stores/influencerStore'

function InfluencerDashboard() {
    const navigate = useNavigate()
    const [stats, setStats] = useState(null)
    const [recentCreators, setRecentCreators] = useState([])
    const [activeCampaigns, setActiveCampaigns] = useState([])
    const [pendingOutreach, setPendingOutreach] = useState([])
    const [topCreators, setTopCreators] = useState([])

    useEffect(() => {
        setStats(getInfluencerStats())
        setRecentCreators(getCreators().slice(0, 5))
        setActiveCampaigns(getCampaigns({ status: 'Active' }).concat(getCampaigns({ status: 'Planning' })).slice(0, 4))
        setPendingOutreach(getOutreachList().filter(o => o.status !== 'Replied').slice(0, 4))
        const scored = getCreatorsWithScores()
        scored.sort((a, b) => b.creatorScore.total - a.creatorScore.total)
        setTopCreators(scored.slice(0, 5))
    }, [])

    if (!stats) return <div className="page"><p>Loading...</p></div>

    const formatCurrency = (val) => {
        if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`
        if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`
        if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`
        return `₹${val}`
    }

    const statCards = [
        { icon: Users, label: 'Total Creators', value: stats.totalCreators, color: '#6366f1', link: '/influencer/creators' },
        { icon: Megaphone, label: 'Active Campaigns', value: stats.activeCampaigns, color: '#10b981', link: '/influencer/campaigns' },
        { icon: IndianRupee, label: 'Total Budget', value: formatCurrency(stats.totalCampaignBudget), color: '#f59e0b', link: '/influencer/campaigns' },
        { icon: IndianRupee, label: 'Total Spent', value: formatCurrency(stats.totalSpent), color: '#ef4444' },
        { icon: TrendingUp, label: 'Pipeline Value', value: formatCurrency(stats.pipelineValue), color: '#8b5cf6', link: '/influencer/sales' },
        { icon: IndianRupee, label: 'Pending Payments', value: formatCurrency(stats.pendingPayments), color: '#f97316', link: '/influencer/invoices' },
        { icon: Send, label: 'Pending Outreach', value: stats.pendingOutreach, color: '#3b82f6', link: '/influencer/outreach' },
        { icon: FileText, label: 'Invoice Value', value: formatCurrency(stats.totalInvoiceValue), color: '#06b6d4', link: '/influencer/invoices' },
    ]

    const quickActions = [
        { icon: UserPlus, label: 'Add Creator', path: '/influencer/creators', color: '#6366f1' },
        { icon: Megaphone, label: 'New Campaign', path: '/influencer/campaigns', color: '#10b981' },
        { icon: Zap, label: 'Generate Campaign', path: '/influencer/generator', color: '#f59e0b' },
        { icon: Send, label: 'New Outreach', path: '/influencer/outreach', color: '#3b82f6' },
        { icon: Calendar, label: 'Schedule Content', path: '/influencer/content', color: '#8b5cf6' },
        { icon: FileText, label: 'Create Invoice', path: '/influencer/invoices', color: '#ec4899' },
        { icon: BarChart3, label: 'Analytics', path: '/influencer/analytics', color: '#06b6d4' },
        { icon: Target, label: 'Compare Campaigns', path: '/influencer/comparison', color: '#ef4444' },
    ]

    const statusColors = {
        Cold: '#6b7280', Talking: '#3b82f6', Closed: '#10b981', Ghosted: '#ef4444',
        Active: '#10b981', Planning: '#f59e0b', Completed: '#6b7280',
        Sent: '#3b82f6', Draft: '#6b7280', Replied: '#10b981',
    }

    return (
        <div className="page influencer-dashboard">
            <motion.div className="page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <div>
                    <h1 className="page-title"><span className="gradient-text">Influencer</span> Hub</h1>
                    <p className="page-description">Manage creators, campaigns, outreach, and payments — all in one place.</p>
                </div>
            </motion.div>

            <div className="inf-stats-grid">
                {statCards.map((stat, i) => (
                    <motion.div key={i} className={`inf-stat-card ${stat.link ? 'clickable' : ''}`}
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                        onClick={() => stat.link && navigate(stat.link)}>
                        <div className="inf-stat-icon" style={{ background: `${stat.color}20`, color: stat.color }}>
                            <stat.icon size={22} />
                        </div>
                        <div className="inf-stat-content">
                            <div className="inf-stat-value">{stat.value}</div>
                            <div className="inf-stat-label">{stat.label}</div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <motion.div className="section" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <h2 className="section-title">Quick Actions</h2>
                <div className="inf-quick-actions">
                    {quickActions.map((action, i) => (
                        <motion.button key={i} className="inf-qa-btn" onClick={() => navigate(action.path)}
                            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <div className="inf-qa-icon" style={{ background: action.color }}><action.icon size={18} /></div>
                            <span>{action.label}</span>
                        </motion.button>
                    ))}
                </div>
            </motion.div>

            <div className="inf-dashboard-grid">
                <motion.div className="inf-dashboard-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <div className="inf-card-header">
                        <h3><Users size={18} /> Recent Creators</h3>
                        <button className="inf-link-btn" onClick={() => navigate('/influencer/creators')}>View All <ChevronRight size={14} /></button>
                    </div>
                    <div className="inf-card-list">
                        {recentCreators.map(c => (
                            <div key={c.id} className="inf-list-item" onClick={() => navigate('/influencer/creators')}>
                                <div className="inf-list-avatar">{c.name.charAt(0)}</div>
                                <div className="inf-list-info">
                                    <div className="inf-list-name">{c.name}</div>
                                    <div className="inf-list-meta">{c.platform} • {c.niche} • {c.city}</div>
                                </div>
                                <div className="inf-list-badge" style={{ background: `${statusColors[c.status]}20`, color: statusColors[c.status] }}>
                                    {c.status}
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                <motion.div className="inf-dashboard-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                    <div className="inf-card-header">
                        <h3><Megaphone size={18} /> Campaigns</h3>
                        <button className="inf-link-btn" onClick={() => navigate('/influencer/campaigns')}>View All <ChevronRight size={14} /></button>
                    </div>
                    <div className="inf-card-list">
                        {activeCampaigns.map(c => (
                            <div key={c.id} className="inf-list-item" onClick={() => navigate('/influencer/campaigns')}>
                                <div className="inf-list-avatar" style={{ background: '#10b98120', color: '#10b981' }}><Megaphone size={16} /></div>
                                <div className="inf-list-info">
                                    <div className="inf-list-name">{c.name}</div>
                                    <div className="inf-list-meta">{c.brand} • {c.platform} • {formatCurrency(c.budget)}</div>
                                </div>
                                <div className="inf-list-badge" style={{ background: `${statusColors[c.status]}20`, color: statusColors[c.status] }}>
                                    {c.status}
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                <motion.div className="inf-dashboard-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.37 }}>
                    <div className="inf-card-header">
                        <h3><TrendingUp size={18} /> Top Creators by Score</h3>
                        <button className="inf-link-btn" onClick={() => navigate('/influencer/analytics')}>Analytics <ChevronRight size={14} /></button>
                    </div>
                    <div className="inf-card-list">
                        {topCreators.map((c, i) => (
                            <div key={c.id} className="inf-list-item" onClick={() => navigate('/influencer/analytics')}>
                                <div className="inf-list-avatar" style={{ background: `${getCreatorTierColor(c.creatorTier)}20`, color: getCreatorTierColor(c.creatorTier) }}>
                                    {i + 1}
                                </div>
                                <div className="inf-list-info">
                                    <div className="inf-list-name">{c.name}</div>
                                    <div className="inf-list-meta">{c.platform} &bull; {c.creatorTier?.toUpperCase()} &bull; {c.niche}</div>
                                </div>
                                <div className="inf-list-badge" style={{
                                    background: c.creatorScore.total >= 70 ? '#10b98120' : c.creatorScore.total >= 40 ? '#f59e0b20' : '#ef444420',
                                    color: c.creatorScore.total >= 70 ? '#10b981' : c.creatorScore.total >= 40 ? '#f59e0b' : '#ef4444'
                                }}>
                                    {c.creatorScore.total}/100
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                <motion.div className="inf-dashboard-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <div className="inf-card-header">
                        <h3><Send size={18} /> Outreach Pending</h3>
                        <button className="inf-link-btn" onClick={() => navigate('/influencer/outreach')}>View All <ChevronRight size={14} /></button>
                    </div>
                    <div className="inf-card-list">
                        {pendingOutreach.length === 0 && <div className="inf-empty">No pending outreach</div>}
                        {pendingOutreach.map(o => (
                            <div key={o.id} className="inf-list-item">
                                <div className="inf-list-avatar" style={{ background: '#3b82f620', color: '#3b82f6' }}><MessageSquare size={16} /></div>
                                <div className="inf-list-info">
                                    <div className="inf-list-name">{o.creatorName}</div>
                                    <div className="inf-list-meta">{o.channel} • {o.followUps.filter(f => f.status === 'Pending').length} follow-ups pending</div>
                                </div>
                                <div className="inf-list-badge" style={{ background: `${statusColors[o.status]}20`, color: statusColors[o.status] }}>
                                    {o.status}
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            <style>{`
                .inf-stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
                    gap: 16px;
                    margin-bottom: 32px;
                }
                .inf-stat-card {
                    background: rgba(30, 30, 45, 0.6);
                    border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 16px;
                    padding: 20px;
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    transition: all 0.2s;
                }
                .inf-stat-card.clickable { cursor: pointer; }
                .inf-stat-card.clickable:hover {
                    border-color: rgba(99,102,241,0.3);
                    transform: translateY(-2px);
                    box-shadow: 0 8px 24px rgba(0,0,0,0.2);
                }
                .inf-stat-icon {
                    width: 48px; height: 48px; border-radius: 14px;
                    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
                }
                .inf-stat-value { font-size: 1.4rem; font-weight: 700; color: var(--text-primary); }
                .inf-stat-label { font-size: 0.8rem; color: var(--text-muted); margin-top: 2px; }

                .inf-quick-actions {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
                    gap: 12px;
                    margin-bottom: 32px;
                }
                .inf-qa-btn {
                    display: flex; align-items: center; gap: 10px;
                    padding: 14px 18px; border-radius: 12px;
                    background: rgba(30,30,45,0.5); border: 1px solid rgba(255,255,255,0.06);
                    color: var(--text-primary); font-size: 0.85rem; font-weight: 500;
                    transition: all 0.2s; cursor: pointer;
                }
                .inf-qa-btn:hover { border-color: rgba(99,102,241,0.3); background: rgba(30,30,45,0.8); }
                .inf-qa-icon {
                    width: 34px; height: 34px; border-radius: 10px;
                    display: flex; align-items: center; justify-content: center; color: white; flex-shrink: 0;
                }

                .inf-dashboard-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
                    gap: 20px;
                }
                .inf-dashboard-card {
                    background: rgba(30,30,45,0.6);
                    border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 16px;
                    overflow: hidden;
                }
                .inf-card-header {
                    display: flex; align-items: center; justify-content: space-between;
                    padding: 18px 20px; border-bottom: 1px solid rgba(255,255,255,0.06);
                }
                .inf-card-header h3 { display: flex; align-items: center; gap: 8px; font-size: 0.95rem; font-weight: 600; color: var(--text-primary); }
                .inf-link-btn {
                    display: flex; align-items: center; gap: 4px;
                    background: none; border: none; color: var(--accent-primary);
                    font-size: 0.8rem; cursor: pointer; padding: 4px 8px; border-radius: 6px;
                }
                .inf-link-btn:hover { background: rgba(99,102,241,0.1); }

                .inf-card-list { padding: 8px 12px; }
                .inf-list-item {
                    display: flex; align-items: center; gap: 12px;
                    padding: 12px 8px; border-radius: 10px; cursor: pointer; transition: background 0.15s;
                }
                .inf-list-item:hover { background: rgba(255,255,255,0.03); }
                .inf-list-avatar {
                    width: 38px; height: 38px; border-radius: 10px;
                    background: rgba(99,102,241,0.15); color: var(--accent-primary);
                    display: flex; align-items: center; justify-content: center;
                    font-weight: 700; font-size: 0.9rem; flex-shrink: 0;
                }
                .inf-list-info { flex: 1; min-width: 0; }
                .inf-list-name { font-size: 0.85rem; font-weight: 600; color: var(--text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
                .inf-list-meta { font-size: 0.75rem; color: var(--text-muted); margin-top: 2px; }
                .inf-list-badge {
                    padding: 4px 10px; border-radius: 20px; font-size: 0.7rem; font-weight: 600;
                    white-space: nowrap; flex-shrink: 0;
                }
                .inf-empty { padding: 20px; text-align: center; color: var(--text-muted); font-size: 0.85rem; }

                @media (max-width: 768px) {
                    .inf-stats-grid { grid-template-columns: repeat(2, 1fr); }
                    .inf-dashboard-grid { grid-template-columns: 1fr; }
                    .inf-quick-actions { grid-template-columns: repeat(2, 1fr); }
                }
            `}</style>
        </div>
    )
}

export default InfluencerDashboard
