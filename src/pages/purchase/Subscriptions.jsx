import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    CreditCard, Calendar, AlertCircle, CheckCircle,
    TrendingUp, Users, Cloud, MoreVertical
} from 'lucide-react'
import { getSubscriptions } from '../../stores/purchaseStore'
import PageHelp from '../../components/PageHelp'

const Subscriptions = () => {
    const [subscriptions, setSubscriptions] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadSubscriptions()
    }, [])

    const loadSubscriptions = async () => {
        setLoading(true)
        // Simulate data if backend is down since we know it is
        // In real prod, we would rely on getSubscriptions()
        // const data = await getSubscriptions()

        // Mock data for display purposes since DB is down
        const mockData = [
            {
                id: '1',
                name: 'AWS Cloud Services',
                vendor: 'Amazon Web Services',
                cost: 1250.00,
                currency: 'USD',
                period: 'Monthly',
                nextRenewal: '2026-02-01',
                status: 'Active',
                users: 'N/A',
                logo: 'aws'
            },
            {
                id: '2',
                name: 'Jira Software',
                vendor: 'Atlassian',
                cost: 450.00,
                currency: 'USD',
                period: 'Annual',
                nextRenewal: '2026-06-15',
                status: 'Active',
                users: '45/50',
                logo: 'jira'
            },
            {
                id: '3',
                name: 'Slack Pro',
                vendor: 'Salesforce',
                cost: 800.00,
                currency: 'USD',
                period: 'Annual',
                nextRenewal: '2026-01-20',
                status: 'Expiring Soon',
                users: '120',
                logo: 'slack'
            },
            {
                id: '4',
                name: 'Figma',
                vendor: 'Figma Inc.',
                cost: 45.00,
                currency: 'USD',
                period: 'Monthly',
                nextRenewal: '2026-02-05',
                status: 'Active',
                users: '3',
                logo: 'figma'
            }
        ]

        setTimeout(() => {
            setSubscriptions(mockData)
            setLoading(false)
        }, 800)
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    }

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 }
    }

    return (
        <div className="page">
            <style>{`
                .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px; margin-bottom: 32px; }
                .stat-card { background: var(--bg-card); padding: 24px; border-radius: var(--radius-lg); border: 1px solid var(--border-color); display: flex; align-items: flex-start; justify-content: space-between; }
                .stat-value { font-size: 2rem; font-weight: 700; color: var(--text-primary); margin: 8px 0 4px; }
                .stat-label { color: var(--text-secondary); font-size: 0.875rem; font-weight: 500; }
                .stat-trend { display: flex; align-items: center; gap: 4px; font-size: 0.75rem; font-weight: 600; }
                .trend-up { color: var(--success); }
                .trend-down { color: var(--error); }
                
                .subs-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px; }
                .sub-card { 
                    background: var(--bg-card); 
                    border-radius: var(--radius-lg); 
                    border: 1px solid var(--border-color);
                    overflow: hidden;
                    transition: all 0.2s ease;
                    position: relative;
                }
                .sub-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-lg); border-color: var(--accent-primary); }
                .sub-header { padding: 20px; border-bottom: 1px solid var(--border-color); display: flex; align-items: center; gap: 16px; }
                .sub-logo { width: 48px; height: 48px; border-radius: 12px; background: var(--bg-tertiary); display: flex; align-items: center; justify-content: center; font-weight: 700; color: var(--text-secondary); }
                .sub-info h3 { font-size: 1.125rem; font-weight: 600; color: var(--text-primary); margin-bottom: 4px; }
                .sub-info p { color: var(--text-secondary); font-size: 0.875rem; }
                .sub-body { padding: 20px; }
                .sub-row { display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 0.9rem; }
                .sub-label { color: var(--text-secondary); }
                .sub-val { font-weight: 500; color: var(--text-primary); }
                .status-badge { padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; display: inline-flex; align-items: center; gap: 6px; }
                .status-active { background: rgba(16, 185, 129, 0.15); color: var(--success); }
                .status-warning { background: rgba(245, 158, 11, 0.15); color: var(--warning); }
                
                .sub-footer { padding: 16px 20px; background: var(--bg-tertiary); display: flex; justify-content: space-between; align-items: center; }
                .renewal-date { font-size: 0.85rem; color: var(--text-muted); display: flex; align-items: center; gap: 6px; }
                .cost-val { font-weight: 700; font-size: 1.1rem; color: var(--text-primary); }
             `}</style>

            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="page-header"
            >
                <div>
                    <h1 className="page-title">Subscription Management</h1>
                    <p className="page-description">Track and manage your SaaS tools and recurring services.</p>
                </div>
                <button className="btn btn-primary">
                    <Cloud size={18} /> Add Subscription
                </button>
            </motion.div>

            {/* Overview Stats */}
            <motion.div
                className="stats-grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                <div className="stat-card">
                    <div>
                        <div className="stat-label">Total Monthly Spend</div>
                        <div className="stat-value">$2,149</div>
                        <div className="stat-trend trend-up">
                            <TrendingUp size={14} /> +12% from last month
                        </div>
                    </div>
                </div>
                <div className="stat-card">
                    <div>
                        <div className="stat-label">Active Subscriptions</div>
                        <div className="stat-value">14</div>
                        <div className="stat-label">across 3 categories</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div>
                        <div className="stat-label">Upcoming Renewals</div>
                        <div className="stat-value" style={{ color: 'var(--warning)' }}>2</div>
                        <div className="stat-label">Next 7 days</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div>
                        <div className="stat-label">Avg. User Cost</div>
                        <div className="stat-value">$42</div>
                        <div className="stat-label">per employee/month</div>
                    </div>
                </div>
            </motion.div>

            {/* Subscriptions Grid */}
            <motion.div
                className="subs-grid"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {subscriptions.map((sub) => (
                    <motion.div key={sub.id} className="sub-card" variants={itemVariants}>
                        <div className="sub-header">
                            <div className="sub-logo">{sub.logo.toUpperCase()}</div>
                            <div className="sub-info">
                                <h3>{sub.name}</h3>
                                <p>{sub.vendor}</p>
                            </div>
                            <button className="btn-icon" style={{ marginLeft: 'auto' }}>
                                <MoreVertical size={18} />
                            </button>
                        </div>
                        <div className="sub-body">
                            <div className="sub-row">
                                <span className="sub-label">Status</span>
                                <span className={`status-badge ${sub.status === 'Active' ? 'status-active' : 'status-warning'}`}>
                                    {sub.status === 'Active' ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                                    {sub.status}
                                </span>
                            </div>
                            <div className="sub-row">
                                <span className="sub-label">Users / Licenses</span>
                                <span className="sub-val" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Users size={14} className="text-muted" />
                                    {sub.users}
                                </span>
                            </div>
                            <div className="sub-row">
                                <span className="sub-label">Billing Cycle</span>
                                <span className="sub-val">{sub.period}</span>
                            </div>
                        </div>
                        <div className="sub-footer">
                            <div className="renewal-date">
                                <Calendar size={14} />
                                Renews {new Date(sub.nextRenewal).toLocaleDateString()}
                            </div>
                            <div className="cost-val">
                                ${sub.cost}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            <PageHelp
                title="SaaS Subscriptions"
                description="Monitor all your recurring software expenses in one place."
                shortcuts={[
                    { keys: ['Alt', 'N'], action: 'Add Subscription' }
                ]}
                walkthroughSteps={[
                    { title: 'Overview', description: 'See total spread and upcoming renewals at a glance.' },
                    { title: 'Active Plans', description: 'Manage licenses and view cost per user.' }
                ]}
            />
        </div>
    )
}

export default Subscriptions
