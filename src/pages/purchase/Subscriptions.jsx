import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    CreditCard, Calendar, AlertCircle, CheckCircle, Plus, X,
    TrendingUp, Users, Cloud, Edit2, Trash2
} from 'lucide-react'
import { getSubscriptions, createSubscription, updateSubscription, deleteSubscription } from '../../stores/purchaseStore'
import { formatCurrency, getCurrency } from '../../stores/settingsStore'
import PageHelp from '../../components/PageHelp'

const categories = ['Infrastructure', 'Productivity', 'Communication', 'Development', 'Design', 'Accounting', 'Marketing', 'Security', 'HR', 'Other']
const periods = ['Monthly', 'Quarterly', 'Annual']
const statusOptions = ['Active', 'Expiring Soon', 'Expired', 'Cancelled']

function Subscriptions() {
    const [subscriptions, setSubscriptions] = useState([])
    const [showForm, setShowForm] = useState(false)
    const [editItem, setEditItem] = useState(null)
    const [deleteConfirm, setDeleteConfirm] = useState(null)
    const [filterCategory, setFilterCategory] = useState('')

    const [form, setForm] = useState({
        name: '', vendor: '', cost: '', period: 'Monthly', nextRenewal: '',
        status: 'Active', users: '', category: 'Infrastructure', notes: ''
    })

    useEffect(() => { loadData() }, [])

    const loadData = () => {
        let data = getSubscriptions()
        if (filterCategory) data = data.filter(s => s.category === filterCategory)
        setSubscriptions(data)
    }

    useEffect(() => { loadData() }, [filterCategory])

    const resetForm = () => setForm({
        name: '', vendor: '', cost: '', period: 'Monthly', nextRenewal: '',
        status: 'Active', users: '', category: 'Infrastructure', notes: ''
    })

    const handleSubmit = (e) => {
        e.preventDefault()
        const data = { ...form, cost: Number(form.cost) || 0 }
        if (editItem) {
            updateSubscription(editItem.id, data)
        } else {
            createSubscription(data)
        }
        setShowForm(false)
        setEditItem(null)
        resetForm()
        loadData()
    }

    const handleEdit = (sub) => {
        setEditItem(sub)
        setForm({ name: sub.name, vendor: sub.vendor, cost: String(sub.cost || ''), period: sub.period, nextRenewal: sub.nextRenewal || '', status: sub.status, users: sub.users || '', category: sub.category || 'Other', notes: sub.notes || '' })
        setShowForm(true)
    }

    const handleDelete = () => {
        if (deleteConfirm) {
            deleteSubscription(deleteConfirm.id)
            setDeleteConfirm(null)
            loadData()
        }
    }

    const formatINR = (v) => {
        if (!v) return formatCurrency(0)
        return formatCurrency(v)
    }

    // Dynamic stats
    const allSubs = getSubscriptions()
    const monthlySubs = allSubs.filter(s => s.status === 'Active' || s.status === 'Expiring Soon')
    const totalMonthly = monthlySubs.reduce((sum, s) => {
        if (s.period === 'Annual') return sum + (s.cost / 12)
        if (s.period === 'Quarterly') return sum + (s.cost / 3)
        return sum + s.cost
    }, 0)
    const activeSubs = allSubs.filter(s => s.status === 'Active').length
    const expiringSoon = allSubs.filter(s => s.status === 'Expiring Soon').length
    const totalUsers = monthlySubs.reduce((sum, s) => {
        const n = parseInt(s.users)
        return isNaN(n) ? sum : sum + n
    }, 0)
    const avgCostPerUser = totalUsers > 0 ? Math.round(totalMonthly / totalUsers) : 0

    return (
        <div className="page">
            <motion.div className="page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <div>
                    <h1 className="page-title"><span className="gradient-text">Subscription</span> Management</h1>
                    <p className="page-description">Track and manage your SaaS tools and recurring services.</p>
                </div>
                <button className="btn-primary" onClick={() => { setEditItem(null); resetForm(); setShowForm(true) }}>
                    <Plus size={18} /> Add Subscription
                </button>
            </motion.div>

            {/* Stats */}
            <div className="sub-stats-grid">
                <div className="sub-stat-card">
                    <div className="sub-stat-label">Total Monthly Spend</div>
                    <div className="sub-stat-value">{formatINR(Math.round(totalMonthly))}</div>
                    <div className="sub-stat-note">{monthlySubs.length} active plans</div>
                </div>
                <div className="sub-stat-card">
                    <div className="sub-stat-label">Active Subscriptions</div>
                    <div className="sub-stat-value">{activeSubs}</div>
                    <div className="sub-stat-note">across {new Set(allSubs.map(s => s.category)).size} categories</div>
                </div>
                <div className="sub-stat-card">
                    <div className="sub-stat-label">Expiring Soon</div>
                    <div className="sub-stat-value" style={{ color: expiringSoon > 0 ? 'var(--warning)' : 'var(--success)' }}>{expiringSoon}</div>
                    <div className="sub-stat-note">need renewal attention</div>
                </div>
                <div className="sub-stat-card">
                    <div className="sub-stat-label">Avg. Cost per User</div>
                    <div className="sub-stat-value">{formatINR(avgCostPerUser)}</div>
                    <div className="sub-stat-note">{totalUsers} total users</div>
                </div>
            </div>

            {/* Category Filter */}
            <div className="sub-filter-row">
                <button className={`sub-filter-btn ${filterCategory === '' ? 'active' : ''}`} onClick={() => setFilterCategory('')}>All</button>
                {categories.filter(c => allSubs.some(s => s.category === c)).map(c => (
                    <button key={c} className={`sub-filter-btn ${filterCategory === c ? 'active' : ''}`} onClick={() => setFilterCategory(c)}>{c}</button>
                ))}
            </div>

            {/* Cards */}
            <motion.div className="sub-cards-grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                {subscriptions.map(sub => (
                    <motion.div key={sub.id} className="sub-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="sub-card-header">
                            <div className="sub-card-logo">{(sub.name || '?').charAt(0).toUpperCase()}</div>
                            <div className="sub-card-info">
                                <h3>{sub.name}</h3>
                                <p>{sub.vendor}</p>
                            </div>
                            <div className="sub-card-actions">
                                <button onClick={() => handleEdit(sub)}><Edit2 size={14} /></button>
                                <button className="danger" onClick={() => setDeleteConfirm(sub)}><Trash2 size={14} /></button>
                            </div>
                        </div>
                        <div className="sub-card-body">
                            <div className="sub-card-row">
                                <span>Status</span>
                                <span className={`sub-status ${sub.status === 'Active' ? 'active' : sub.status === 'Expiring Soon' ? 'warning' : 'inactive'}`}>
                                    {sub.status === 'Active' ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                                    {sub.status}
                                </span>
                            </div>
                            <div className="sub-card-row">
                                <span>Users</span>
                                <span className="sub-card-val"><Users size={14} /> {sub.users || 'N/A'}</span>
                            </div>
                            <div className="sub-card-row">
                                <span>Billing</span>
                                <span className="sub-card-val">{sub.period}</span>
                            </div>
                            {sub.category && (
                                <div className="sub-card-row">
                                    <span>Category</span>
                                    <span className="sub-cat-badge">{sub.category}</span>
                                </div>
                            )}
                        </div>
                        <div className="sub-card-footer">
                            <div className="sub-renewal"><Calendar size={14} /> Renews {sub.nextRenewal ? new Date(sub.nextRenewal).toLocaleDateString('en-IN') : 'N/A'}</div>
                            <div className="sub-cost">{formatINR(sub.cost)}<span>/{sub.period === 'Annual' ? 'yr' : sub.period === 'Quarterly' ? 'qtr' : 'mo'}</span></div>
                        </div>
                    </motion.div>
                ))}
                {subscriptions.length === 0 && (
                    <div className="sub-empty">No subscriptions found. Add your first one!</div>
                )}
            </motion.div>

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {showForm && (
                    <motion.div className="sub-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowForm(false)}>
                        <motion.div className="sub-modal" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()}>
                            <div className="sub-modal-header">
                                <h2>{editItem ? 'Edit Subscription' : 'Add Subscription'}</h2>
                                <button onClick={() => setShowForm(false)}><X size={20} /></button>
                            </div>
                            <form onSubmit={handleSubmit} className="sub-form">
                                <div className="sub-form-grid">
                                    <div className="sub-form-group"><label>Name *</label>
                                        <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required placeholder="e.g. AWS Cloud" /></div>
                                    <div className="sub-form-group"><label>Vendor *</label>
                                        <input value={form.vendor} onChange={e => setForm(f => ({ ...f, vendor: e.target.value }))} required placeholder="e.g. Amazon" /></div>
                                    <div className="sub-form-group"><label>Cost ({getCurrency().symbol}) *</label>
                                        <input type="number" value={form.cost} onChange={e => setForm(f => ({ ...f, cost: e.target.value }))} required placeholder="0" /></div>
                                    <div className="sub-form-group"><label>Billing Period</label>
                                        <select value={form.period} onChange={e => setForm(f => ({ ...f, period: e.target.value }))}>
                                            {periods.map(p => <option key={p} value={p}>{p}</option>)}
                                        </select></div>
                                    <div className="sub-form-group"><label>Next Renewal</label>
                                        <input type="date" value={form.nextRenewal} onChange={e => setForm(f => ({ ...f, nextRenewal: e.target.value }))} /></div>
                                    <div className="sub-form-group"><label>Status</label>
                                        <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                                            {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select></div>
                                    <div className="sub-form-group"><label>Users / Licenses</label>
                                        <input value={form.users} onChange={e => setForm(f => ({ ...f, users: e.target.value }))} placeholder="e.g. 50" /></div>
                                    <div className="sub-form-group"><label>Category</label>
                                        <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select></div>
                                </div>
                                <div className="sub-form-btns">
                                    <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                                    <button type="submit" className="btn-primary">{editItem ? 'Update' : 'Add'} Subscription</button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete Confirm */}
            <AnimatePresence>
                {deleteConfirm && (
                    <motion.div className="sub-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setDeleteConfirm(null)}>
                        <motion.div className="sub-modal sub-modal-sm" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()}>
                            <h3 style={{ marginBottom: 12 }}>Delete Subscription?</h3>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>Remove <strong>{deleteConfirm.name}</strong>? This cannot be undone.</p>
                            <div className="sub-form-btns">
                                <button className="btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                                <button className="btn-danger" onClick={handleDelete}>Delete</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                .btn-primary { display: flex; align-items: center; gap: 8px; padding: 12px 20px; background: var(--accent-gradient); border-radius: var(--radius-md); color: white; border: none; cursor: pointer; font-weight: 600; }
                .btn-secondary { padding: 12px 20px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-secondary); cursor: pointer; }
                .btn-danger { padding: 12px 20px; background: var(--error); border-radius: var(--radius-md); color: white; border: none; cursor: pointer; font-weight: 600; }
                .sub-stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 24px; }
                .sub-stat-card { background: var(--bg-card); padding: 20px; border-radius: var(--radius-lg); border: 1px solid var(--border-color); }
                .sub-stat-label { color: var(--text-secondary); font-size: 0.85rem; font-weight: 500; }
                .sub-stat-value { font-size: 1.8rem; font-weight: 700; color: var(--text-primary); margin: 6px 0 2px; }
                .sub-stat-note { font-size: 0.75rem; color: var(--text-muted); }
                .sub-filter-row { display: flex; gap: 8px; margin-bottom: 24px; flex-wrap: wrap; }
                .sub-filter-btn { padding: 8px 16px; border-radius: 20px; font-size: 0.8rem; background: var(--bg-card); border: 1px solid var(--border-color); color: var(--text-secondary); cursor: pointer; transition: all 0.15s; }
                .sub-filter-btn.active { background: rgba(99,102,241,0.15); color: var(--accent-primary); border-color: rgba(99,102,241,0.3); }
                .sub-cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px; }
                .sub-card { background: var(--bg-card); border-radius: var(--radius-lg); border: 1px solid var(--border-color); overflow: hidden; transition: all 0.2s; }
                .sub-card:hover { transform: translateY(-3px); box-shadow: 0 8px 30px rgba(0,0,0,0.2); border-color: rgba(99,102,241,0.3); }
                .sub-card-header { padding: 18px; border-bottom: 1px solid var(--border-color); display: flex; align-items: center; gap: 14px; }
                .sub-card-logo { width: 44px; height: 44px; border-radius: 12px; background: var(--accent-gradient); display: flex; align-items: center; justify-content: center; font-weight: 700; color: white; font-size: 1.1rem; flex-shrink: 0; }
                .sub-card-info h3 { font-size: 1rem; font-weight: 600; color: var(--text-primary); }
                .sub-card-info p { font-size: 0.8rem; color: var(--text-muted); }
                .sub-card-actions { margin-left: auto; display: flex; gap: 6px; }
                .sub-card-actions button { width: 30px; height: 30px; border-radius: 8px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.05); border: none; color: var(--text-muted); cursor: pointer; }
                .sub-card-actions button:hover { background: rgba(255,255,255,0.1); color: var(--text-primary); }
                .sub-card-actions button.danger:hover { background: rgba(239,68,68,0.15); color: var(--error); }
                .sub-card-body { padding: 18px; }
                .sub-card-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; font-size: 0.85rem; }
                .sub-card-row > span:first-child { color: var(--text-muted); }
                .sub-card-val { display: flex; align-items: center; gap: 6px; font-weight: 500; color: var(--text-primary); }
                .sub-status { display: inline-flex; align-items: center; gap: 5px; padding: 3px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: 600; }
                .sub-status.active { background: rgba(16,185,129,0.15); color: var(--success); }
                .sub-status.warning { background: rgba(245,158,11,0.15); color: var(--warning); }
                .sub-status.inactive { background: rgba(107,114,128,0.15); color: var(--text-muted); }
                .sub-cat-badge { padding: 3px 10px; border-radius: 12px; font-size: 0.75rem; background: rgba(139,92,246,0.12); color: #8b5cf6; }
                .sub-card-footer { padding: 14px 18px; background: rgba(255,255,255,0.02); border-top: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; }
                .sub-renewal { font-size: 0.8rem; color: var(--text-muted); display: flex; align-items: center; gap: 6px; }
                .sub-cost { font-weight: 700; font-size: 1.15rem; color: var(--text-primary); }
                .sub-cost span { font-size: 0.75rem; font-weight: 400; color: var(--text-muted); }
                .sub-empty { grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-muted); font-size: 0.9rem; }
                .sub-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px); z-index: 1000; display: flex; align-items: center; justify-content: center; }
                .sub-modal { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 16px; width: 95%; max-width: 600px; max-height: 90vh; overflow-y: auto; }
                .sub-modal-sm { max-width: 400px; padding: 24px; }
                .sub-modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid var(--border-color); }
                .sub-modal-header h2 { font-size: 1.1rem; }
                .sub-modal-header button { background: none; border: none; color: var(--text-muted); cursor: pointer; }
                .sub-form { padding: 24px; }
                .sub-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 20px; }
                .sub-form-group { display: flex; flex-direction: column; gap: 6px; }
                .sub-form-group label { font-size: 0.8rem; color: var(--text-secondary); font-weight: 500; }
                .sub-form-group input, .sub-form-group select { padding: 10px 14px; border-radius: 10px; border: 1px solid var(--border-color); background: var(--bg-primary); color: var(--text-primary); font-size: 0.85rem; }
                .sub-form-btns { display: flex; justify-content: flex-end; gap: 12px; }
                @media (max-width: 768px) { .sub-stats-grid { grid-template-columns: repeat(2, 1fr); } .sub-form-grid { grid-template-columns: 1fr; } }
            `}</style>

            <PageHelp
                title="SaaS Subscriptions"
                description="Monitor all your recurring software expenses in one place."
                shortcuts={[{ keys: ['Alt', 'N'], action: 'Add Subscription' }]}
                walkthroughSteps={[
                    { title: 'Overview', description: 'See total spend and upcoming renewals at a glance.' },
                    { title: 'Active Plans', description: 'Manage licenses and view cost per user.' }
                ]}
            />
        </div>
    )
}

export default Subscriptions
