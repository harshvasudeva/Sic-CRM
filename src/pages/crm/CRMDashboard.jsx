import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
    Users, UserPlus, Target, DollarSign, Phone, Mail, Calendar,
    TrendingUp, ChevronRight, Building2, Activity, CheckCircle
} from 'lucide-react'
import { getCRMStats, getLeads, getOpportunities, getActivities } from '../../stores/crmStore'

function CRMDashboard() {
    const navigate = useNavigate()
    const [stats, setStats] = useState(null)
    const [recentLeads, setRecentLeads] = useState([])
    const [topOpportunities, setTopOpportunities] = useState([])
    const [pendingActivities, setPendingActivities] = useState([])

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // If getCRMStats combines data, it must be awaited. 
                // Alternatively, fetch individual lists and calculate stats locally if the API doesn't provide stats endpoint yet.
                // Assuming crmStore will have an async getCRMStats
                const statsData = await getCRMStats()
                setStats(statsData)

                const leadsData = await getLeads()
                setRecentLeads(leadsData.slice(0, 5))

                const oppsData = await getOpportunities()
                setTopOpportunities(oppsData.sort((a, b) => b.value - a.value).slice(0, 4))

                const activitiesData = await getActivities({ completed: false })
                setPendingActivities(activitiesData.slice(0, 5))
            } catch (error) {
                console.error('Failed to load dashboard data', error)
            }
        }
        fetchDashboardData()
    }, [])

    if (!stats) return <div>Loading...</div>

    const statCards = [
        { icon: Users, label: 'Total Leads', value: stats.totalLeads, color: 'blue', link: '/crm/leads' },
        { icon: UserPlus, label: 'New Leads', value: stats.newLeads, color: 'green', link: '/crm/leads' },
        { icon: Target, label: 'Opportunities', value: stats.totalOpportunities, color: 'purple', link: '/crm/opportunities' },
        { icon: DollarSign, label: 'Pipeline Value', value: `$${(stats.pipelineValue / 1000).toFixed(0)}K`, color: 'orange', link: '/crm/opportunities' },
        { icon: TrendingUp, label: 'Weighted Value', value: `$${(stats.weightedValue / 1000).toFixed(0)}K`, color: 'teal' },
        { icon: Building2, label: 'Contacts', value: stats.totalContacts, color: 'indigo', link: '/crm/contacts' },
        { icon: Activity, label: 'Pending Tasks', value: stats.pendingActivities, color: 'red', link: '/crm/activities' },
        { icon: CheckCircle, label: 'Avg Deal Size', value: `$${(stats.avgDealSize / 1000).toFixed(0)}K`, color: 'cyan' },
    ]

    const quickActions = [
        { icon: UserPlus, label: 'Add Lead', path: '/crm/leads/new', color: '#6366f1' },
        { icon: Target, label: 'New Opportunity', path: '/crm/opportunities/new', color: '#10b981' },
        { icon: Users, label: 'Add Contact', path: '/crm/contacts/new', color: '#f59e0b' },
        { icon: Phone, label: 'Log Call', path: '/crm/activities', color: '#3b82f6' },
        { icon: Mail, label: 'Send Email', path: '/crm/activities', color: '#8b5cf6' },
        { icon: Calendar, label: 'Schedule Meeting', path: '/crm/activities', color: '#ec4899' },
    ]

    return (
        <div className="page crm-dashboard">
            <motion.div className="page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <div>
                    <h1 className="page-title"><span className="gradient-text">CRM</span> Dashboard</h1>
                    <p className="page-description">Manage leads, opportunities, and customer relationships.</p>
                </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="crm-stats-grid">
                {statCards.map((stat, index) => (
                    <motion.div
                        key={index}
                        className={`crm-stat-card ${stat.link ? 'clickable' : ''}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => stat.link && navigate(stat.link)}
                    >
                        <div className={`crm-stat-icon ${stat.color}`}><stat.icon size={22} /></div>
                        <div className="crm-stat-content">
                            <div className="crm-stat-value">{stat.value}</div>
                            <div className="crm-stat-label">{stat.label}</div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Quick Actions */}
            <motion.div className="section" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <h2 className="section-title">Quick Actions</h2>
                <div className="quick-actions-grid">
                    {quickActions.map((action, index) => (
                        <motion.button key={index} className="quick-action-card" onClick={() => navigate(action.path)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <div className="qa-icon" style={{ background: action.color }}><action.icon size={20} /></div>
                            <span>{action.label}</span>
                            <ChevronRight size={16} className="qa-arrow" />
                        </motion.button>
                    ))}
                </div>
            </motion.div>

            <div className="crm-grid-2">
                {/* Top Opportunities */}
                <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <div className="card-header">
                        <h3><Target size={18} /> Top Opportunities</h3>
                        <button className="link-btn" onClick={() => navigate('/crm/opportunities')}>View All</button>
                    </div>
                    <div className="opportunity-list">
                        {topOpportunities.map(opp => (
                            <div key={opp.id} className="opportunity-item">
                                <div className="opp-info">
                                    <strong>{opp.name}</strong>
                                    <span>{opp.company}</span>
                                </div>
                                <div className="opp-value">${(opp.value / 1000).toFixed(0)}K</div>
                                <span className={`stage-badge ${opp.stage.toLowerCase().replace(' ', '-')}`}>{opp.stage}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Pending Activities */}
                <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                    <div className="card-header">
                        <h3><Activity size={18} /> Pending Activities</h3>
                        <button className="link-btn" onClick={() => navigate('/crm/activities')}>View All</button>
                    </div>
                    <div className="activity-list">
                        {pendingActivities.map(act => (
                            <div key={act.id} className="activity-item">
                                <div className={`activity-type ${act.type}`}>
                                    {act.type === 'call' && <Phone size={14} />}
                                    {act.type === 'email' && <Mail size={14} />}
                                    {act.type === 'meeting' && <Calendar size={14} />}
                                    {act.type === 'task' && <CheckCircle size={14} />}
                                </div>
                                <div className="activity-info">
                                    <strong>{act.subject}</strong>
                                    <span>{act.date}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Recent Leads */}
            <motion.div className="card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                <div className="card-header">
                    <h3><Users size={18} /> Recent Leads</h3>
                    <button className="link-btn" onClick={() => navigate('/crm/leads')}>View All</button>
                </div>
                <div className="leads-grid">
                    {recentLeads.map(lead => (
                        <div key={lead.id} className="lead-card">
                            <div className="lead-header">
                                <div className="lead-avatar">{lead.name.split(' ').map(n => n[0]).join('')}</div>
                                <div className="lead-score" style={{ '--score': lead.score }}>{lead.score}</div>
                            </div>
                            <h4>{lead.name}</h4>
                            <p>{lead.company}</p>
                            <span className={`lead-status ${lead.status}`}>{lead.status}</span>
                        </div>
                    ))}
                </div>
            </motion.div>

            <style>{`
        .crm-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 32px; }
        @media (max-width: 1200px) { .crm-stats-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 600px) { .crm-stats-grid { grid-template-columns: 1fr; } }
        
        .crm-stat-card { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 20px; display: flex; align-items: center; gap: 16px; transition: all 0.2s; }
        .crm-stat-card.clickable { cursor: pointer; }
        .crm-stat-card.clickable:hover { border-color: var(--accent-primary); transform: translateY(-2px); }
        
        .crm-stat-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; }
        .crm-stat-icon.blue { background: linear-gradient(135deg, #3b82f6, #06b6d4); }
        .crm-stat-icon.green { background: linear-gradient(135deg, #10b981, #34d399); }
        .crm-stat-icon.orange { background: linear-gradient(135deg, #f59e0b, #fbbf24); }
        .crm-stat-icon.purple { background: linear-gradient(135deg, #8b5cf6, #a855f7); }
        .crm-stat-icon.indigo { background: linear-gradient(135deg, #6366f1, #818cf8); }
        .crm-stat-icon.red { background: linear-gradient(135deg, #ef4444, #f87171); }
        .crm-stat-icon.teal { background: linear-gradient(135deg, #14b8a6, #2dd4bf); }
        .crm-stat-icon.cyan { background: linear-gradient(135deg, #06b6d4, #22d3ee); }
        
        .crm-stat-value { font-size: 1.5rem; font-weight: 700; }
        .crm-stat-label { font-size: 0.85rem; color: var(--text-muted); }
        
        .quick-actions-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        @media (max-width: 800px) { .quick-actions-grid { grid-template-columns: repeat(2, 1fr); } }
        
        .quick-action-card { display: flex; align-items: center; gap: 12px; padding: 16px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); text-align: left; transition: all 0.2s; }
        .quick-action-card:hover { border-color: var(--accent-primary); }
        .qa-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; flex-shrink: 0; }
        .quick-action-card span { flex: 1; font-size: 0.9rem; font-weight: 500; color: var(--text-primary); }
        .qa-arrow { color: var(--text-muted); }
        
        .crm-grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; margin-bottom: 24px; }
        @media (max-width: 900px) { .crm-grid-2 { grid-template-columns: 1fr; } }
        
        .card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
        .card-header h3 { display: flex; align-items: center; gap: 8px; font-size: 1rem; }
        .link-btn { font-size: 0.85rem; color: var(--accent-primary); }
        
        .opportunity-list, .activity-list { display: flex; flex-direction: column; gap: 12px; }
        .opportunity-item { display: flex; align-items: center; gap: 16px; padding: 12px; background: rgba(255, 255, 255, 0.02); border-radius: var(--radius-md); }
        .opp-info { flex: 1; }
        .opp-info strong { display: block; font-size: 0.9rem; }
        .opp-info span { font-size: 0.8rem; color: var(--text-muted); }
        .opp-value { font-weight: 600; color: var(--success); }
        .stage-badge { padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; background: rgba(139, 92, 246, 0.15); color: #8b5cf6; }
        
        .activity-item { display: flex; align-items: center; gap: 12px; padding: 12px; background: rgba(255, 255, 255, 0.02); border-radius: var(--radius-md); }
        .activity-type { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
        .activity-type.call { background: rgba(59, 130, 246, 0.15); color: var(--info); }
        .activity-type.email { background: rgba(139, 92, 246, 0.15); color: #8b5cf6; }
        .activity-type.meeting { background: rgba(236, 72, 153, 0.15); color: #ec4899; }
        .activity-type.task { background: rgba(16, 185, 129, 0.15); color: var(--success); }
        .activity-info { flex: 1; }
        .activity-info strong { display: block; font-size: 0.9rem; }
        .activity-info span { font-size: 0.8rem; color: var(--text-muted); }
        
        .leads-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px; }
        @media (max-width: 1200px) { .leads-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 600px) { .leads-grid { grid-template-columns: 1fr; } }
        
        .lead-card { background: rgba(255, 255, 255, 0.02); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 16px; text-align: center; }
        .lead-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .lead-avatar { width: 40px; height: 40px; border-radius: 10px; background: var(--accent-gradient); display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 0.8rem; }
        .lead-score { width: 32px; height: 32px; border-radius: 50%; background: conic-gradient(var(--success) calc(var(--score) * 1%), rgba(255,255,255,0.1) 0); display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 600; }
        .lead-card h4 { font-size: 0.9rem; margin-bottom: 4px; }
        .lead-card p { font-size: 0.8rem; color: var(--text-muted); margin-bottom: 8px; }
        .lead-status { padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; text-transform: capitalize; }
        .lead-status.new { background: rgba(59, 130, 246, 0.15); color: var(--info); }
        .lead-status.contacted { background: rgba(139, 92, 246, 0.15); color: #8b5cf6; }
        .lead-status.qualified { background: rgba(16, 185, 129, 0.15); color: var(--success); }
        .lead-status.unqualified { background: rgba(107, 114, 128, 0.15); color: var(--text-muted); }
      `}</style>
        </div>
    )
}

export default CRMDashboard
