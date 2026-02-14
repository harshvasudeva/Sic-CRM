import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Megaphone, Plus, Search, Filter, X, Eye, IndianRupee, Users as UsersIcon,
    Calendar, ChevronDown, Edit2, Trash2, CheckCircle, Clock, AlertCircle,
    BarChart3, Target, TrendingUp, Package
} from 'lucide-react'
import {
    getCampaigns, createCampaign, updateCampaign, deleteCampaign, getCreators,
    addCreatorToCampaign, updateCampaignCreator
} from '../../stores/influencerStore'

function CampaignDashboard() {
    const [campaigns, setCampaigns] = useState([])
    const [allCreators, setAllCreators] = useState([])
    const [filter, setFilter] = useState('')
    const [showForm, setShowForm] = useState(false)
    const [editCampaign, setEditCampaign] = useState(null)
    const [selectedCampaign, setSelectedCampaign] = useState(null)
    const [showAddCreator, setShowAddCreator] = useState(false)

    const [form, setForm] = useState({
        name: '', brand: '', platform: 'Instagram', budget: '', brief: '',
        objective: 'Brand Awareness', startDate: '', endDate: '', status: 'Planning'
    })

    const [addCreatorForm, setAddCreatorForm] = useState({
        creatorId: '', totalFee: '', deliverables: [{ type: 'Reel', quantity: 1, status: 'Pending', dueDate: '' }]
    })

    useEffect(() => {
        setCampaigns(getCampaigns(filter ? { status: filter } : {}))
        setAllCreators(getCreators())
    }, [filter])

    function reload() {
        setCampaigns(getCampaigns(filter ? { status: filter } : {}))
        setAllCreators(getCreators())
    }

    function handleSubmit(e) {
        e.preventDefault()
        const data = { ...form, budget: Number(form.budget) || 0 }
        if (editCampaign) {
            updateCampaign(editCampaign.id, data)
        } else {
            createCampaign(data)
        }
        setShowForm(false)
        setEditCampaign(null)
        setForm({ name: '', brand: '', platform: 'Instagram', budget: '', brief: '', objective: 'Brand Awareness', startDate: '', endDate: '', status: 'Planning' })
        reload()
    }

    function handleEdit(camp) {
        setEditCampaign(camp)
        setForm({ name: camp.name, brand: camp.brand, platform: camp.platform, budget: String(camp.budget),
            brief: camp.brief, objective: camp.objective, startDate: camp.startDate, endDate: camp.endDate, status: camp.status })
        setShowForm(true)
    }

    function handleDelete(id) {
        if (confirm('Delete campaign?')) { deleteCampaign(id); if (selectedCampaign?.id === id) setSelectedCampaign(null); reload() }
    }

    function handleAddCreatorToCampaign(e) {
        e.preventDefault()
        addCreatorToCampaign(selectedCampaign.id, {
            creatorId: addCreatorForm.creatorId,
            totalFee: Number(addCreatorForm.totalFee) || 0,
            paymentStatus: 'Unpaid',
            contentInsights: null,
            deliverables: addCreatorForm.deliverables,
        })
        setShowAddCreator(false)
        setAddCreatorForm({ creatorId: '', totalFee: '', deliverables: [{ type: 'Reel', quantity: 1, status: 'Pending', dueDate: '' }] })
        reload()
        setSelectedCampaign(getCampaigns().find(c => c.id === selectedCampaign.id))
    }

    function updateDeliverableStatus(creatorId, delIdx, newStatus) {
        const camp = { ...selectedCampaign }
        const crIdx = camp.creators.findIndex(cr => cr.creatorId === creatorId)
        if (crIdx === -1) return
        camp.creators[crIdx].deliverables[delIdx].status = newStatus
        updateCampaign(camp.id, { creators: camp.creators })
        reload()
        setSelectedCampaign(getCampaigns().find(c => c.id === camp.id))
    }

    function updatePaymentStatus(creatorId, newStatus) {
        updateCampaignCreator(selectedCampaign.id, creatorId, { paymentStatus: newStatus })
        reload()
        setSelectedCampaign(getCampaigns().find(c => c.id === selectedCampaign.id))
    }

    const formatCurrency = (val) => {
        if (!val) return '—'
        if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`
        if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`
        return `₹${val}`
    }

    const statusColors = { Planning: '#f59e0b', Active: '#10b981', Completed: '#6b7280', Paused: '#ef4444' }
    const paymentColors = { Paid: '#10b981', Partial: '#f59e0b', Unpaid: '#ef4444' }
    const delStatusColors = { Pending: '#6b7280', 'In Progress': '#3b82f6', Delivered: '#10b981', Overdue: '#ef4444' }
    const objectives = ['Brand Awareness', 'Product Launch', 'App Downloads', 'Lead Generation', 'Sales']

    const getCreatorName = (id) => allCreators.find(c => c.id === id)?.name || 'Unknown'

    return (
        <div className="page">
            <motion.div className="page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <div>
                    <h1 className="page-title"><span className="gradient-text">Campaign</span> Dashboard</h1>
                    <p className="page-description">{campaigns.length} campaigns • Track creator deliverables, payments, and performance</p>
                </div>
                <button className="btn-primary" onClick={() => { setEditCampaign(null); setForm({ name: '', brand: '', platform: 'Instagram', budget: '', brief: '', objective: 'Brand Awareness', startDate: '', endDate: '', status: 'Planning' }); setShowForm(true) }}>
                    <Plus size={18} /> New Campaign
                </button>
            </motion.div>

            <div className="camp-filters">
                {['', 'Planning', 'Active', 'Completed', 'Paused'].map(s => (
                    <button key={s} className={`camp-filter-btn ${filter === s ? 'active' : ''}`}
                        onClick={() => setFilter(s)}>{s || 'All'}</button>
                ))}
            </div>

            <div className="camp-grid">
                {campaigns.map((camp, i) => (
                    <motion.div key={camp.id} className="camp-card" initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        onClick={() => setSelectedCampaign(camp)}>
                        <div className="camp-card-header">
                            <div className="camp-card-title">
                                <Megaphone size={18} />
                                <div>
                                    <h3>{camp.name}</h3>
                                    <span className="camp-brand">{camp.brand} • {camp.platform}</span>
                                </div>
                            </div>
                            <span className="camp-status" style={{ background: `${statusColors[camp.status]}20`, color: statusColors[camp.status] }}>
                                {camp.status}
                            </span>
                        </div>
                        <p className="camp-brief">{camp.brief}</p>
                        <div className="camp-meta">
                            <div><Target size={14} /> {camp.objective}</div>
                            <div><IndianRupee size={14} /> {formatCurrency(camp.budget)}</div>
                            <div><UsersIcon size={14} /> {camp.creators.length} creators</div>
                            <div><Calendar size={14} /> {camp.startDate} → {camp.endDate}</div>
                        </div>
                        <div className="camp-progress">
                            <div className="camp-progress-bar">
                                <div className="camp-progress-fill" style={{ width: `${camp.budget ? (camp.spent / camp.budget * 100) : 0}%` }}></div>
                            </div>
                            <span className="camp-progress-text">{formatCurrency(camp.spent)} / {formatCurrency(camp.budget)} spent</span>
                        </div>
                        <div className="camp-card-actions" onClick={e => e.stopPropagation()}>
                            <button onClick={() => handleEdit(camp)}><Edit2 size={14} /></button>
                            <button className="danger" onClick={() => handleDelete(camp.id)}><Trash2 size={14} /></button>
                        </div>
                    </motion.div>
                ))}
                {campaigns.length === 0 && <div className="inf-empty" style={{ gridColumn: '1/-1' }}>No campaigns found. Create your first campaign!</div>}
            </div>

            {/* Campaign Detail Modal */}
            <AnimatePresence>
                {selectedCampaign && (
                    <motion.div className="inf-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedCampaign(null)}>
                        <motion.div className="camp-detail-modal" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} onClick={e => e.stopPropagation()}>
                            <div className="inf-modal-header">
                                <div>
                                    <h2>{selectedCampaign.name}</h2>
                                    <span className="camp-brand">{selectedCampaign.brand} • {selectedCampaign.platform}</span>
                                </div>
                                <button onClick={() => setSelectedCampaign(null)}><X size={20} /></button>
                            </div>
                            <div className="camp-detail-body">
                                <div className="camp-detail-info">
                                    <div><strong>Brief:</strong> {selectedCampaign.brief}</div>
                                    <div className="camp-detail-meta">
                                        <span><Target size={14} /> {selectedCampaign.objective}</span>
                                        <span><IndianRupee size={14} /> Budget: {formatCurrency(selectedCampaign.budget)}</span>
                                        <span><IndianRupee size={14} /> Spent: {formatCurrency(selectedCampaign.spent)}</span>
                                        <span><Calendar size={14} /> {selectedCampaign.startDate} → {selectedCampaign.endDate}</span>
                                        <span className="camp-status" style={{ background: `${statusColors[selectedCampaign.status]}20`, color: statusColors[selectedCampaign.status] }}>
                                            {selectedCampaign.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="camp-creators-section">
                                    <div className="camp-section-header">
                                        <h3><UsersIcon size={18} /> Campaign Creators ({selectedCampaign.creators.length})</h3>
                                        <button className="btn-sm" onClick={() => setShowAddCreator(true)}><Plus size={14} /> Add Creator</button>
                                    </div>

                                    {selectedCampaign.creators.map((cr, crIdx) => (
                                        <div key={cr.creatorId} className="camp-creator-card">
                                            <div className="camp-creator-header">
                                                <div className="camp-creator-name">{getCreatorName(cr.creatorId)}</div>
                                                <div className="camp-creator-fee">{formatCurrency(cr.totalFee)}</div>
                                                <select className="camp-payment-select"
                                                    value={cr.paymentStatus}
                                                    style={{ background: `${paymentColors[cr.paymentStatus]}15`, color: paymentColors[cr.paymentStatus] }}
                                                    onChange={e => updatePaymentStatus(cr.creatorId, e.target.value)}>
                                                    <option value="Unpaid">Unpaid</option>
                                                    <option value="Partial">Partial</option>
                                                    <option value="Paid">Paid</option>
                                                </select>
                                            </div>

                                            <div className="camp-deliverables">
                                                <h5>Deliverables</h5>
                                                {(cr.deliverables || []).map((del, dIdx) => (
                                                    <div key={dIdx} className="camp-del-item">
                                                        <span className="camp-del-type">{del.quantity}x {del.type}</span>
                                                        <span className="camp-del-due">Due: {del.dueDate || '—'}</span>
                                                        <select className="camp-del-status"
                                                            value={del.status}
                                                            style={{ background: `${delStatusColors[del.status]}15`, color: delStatusColors[del.status] }}
                                                            onChange={e => updateDeliverableStatus(cr.creatorId, dIdx, e.target.value)}>
                                                            <option value="Pending">Pending</option>
                                                            <option value="In Progress">In Progress</option>
                                                            <option value="Delivered">Delivered</option>
                                                            <option value="Overdue">Overdue</option>
                                                        </select>
                                                    </div>
                                                ))}
                                            </div>

                                            {cr.contentInsights && (
                                                <div className="camp-insights">
                                                    <h5>Content Insights</h5>
                                                    <div className="camp-insights-grid">
                                                        <div><Eye size={12} /> {(cr.contentInsights.views || 0).toLocaleString()} views</div>
                                                        <div>❤️ {(cr.contentInsights.likes || 0).toLocaleString()} likes</div>
                                                        <div>💬 {(cr.contentInsights.comments || 0).toLocaleString()} comments</div>
                                                        <div>🔗 {(cr.contentInsights.shares || 0).toLocaleString()} shares</div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    {selectedCampaign.creators.length === 0 && <p className="inf-muted">No creators added yet</p>}
                                </div>
                            </div>

                            {/* Add Creator to Campaign */}
                            {showAddCreator && (
                                <div className="inf-deal-form-overlay" onClick={() => setShowAddCreator(false)}>
                                    <form className="inf-deal-form" style={{ width: 420 }} onSubmit={handleAddCreatorToCampaign} onClick={e => e.stopPropagation()}>
                                        <h4>Add Creator to Campaign</h4>
                                        <select value={addCreatorForm.creatorId} onChange={e => setAddCreatorForm(f => ({ ...f, creatorId: e.target.value }))} required>
                                            <option value="">Select Creator</option>
                                            {allCreators.filter(c => !selectedCampaign.creators.some(sc => sc.creatorId === c.id)).map(c => (
                                                <option key={c.id} value={c.id}>{c.name} ({c.platform})</option>
                                            ))}
                                        </select>
                                        <input placeholder="Total Fee (₹)" type="number" value={addCreatorForm.totalFee}
                                            onChange={e => setAddCreatorForm(f => ({ ...f, totalFee: e.target.value }))} required />
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 8 }}>Deliverable:</div>
                                        {addCreatorForm.deliverables.map((d, i) => (
                                            <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                                                <select value={d.type} onChange={e => {
                                                    const dels = [...addCreatorForm.deliverables]; dels[i].type = e.target.value;
                                                    setAddCreatorForm(f => ({ ...f, deliverables: dels }))
                                                }}>
                                                    <option>Reel</option><option>Story</option><option>Static</option>
                                                    <option>Carousel</option><option>Dedicated Video</option><option>Shorts</option>
                                                </select>
                                                <input type="number" placeholder="Qty" value={d.quantity} style={{ width: 70 }}
                                                    onChange={e => {
                                                        const dels = [...addCreatorForm.deliverables]; dels[i].quantity = Number(e.target.value);
                                                        setAddCreatorForm(f => ({ ...f, deliverables: dels }))
                                                    }} />
                                                <input type="date" value={d.dueDate} onChange={e => {
                                                    const dels = [...addCreatorForm.deliverables]; dels[i].dueDate = e.target.value;
                                                    setAddCreatorForm(f => ({ ...f, deliverables: dels }))
                                                }} />
                                            </div>
                                        ))}
                                        <button type="button" className="btn-sm" onClick={() => setAddCreatorForm(f => ({
                                            ...f, deliverables: [...f.deliverables, { type: 'Reel', quantity: 1, status: 'Pending', dueDate: '' }]
                                        }))}>+ Add Deliverable</button>
                                        <div className="inf-form-btns">
                                            <button type="button" className="btn-secondary" onClick={() => setShowAddCreator(false)}>Cancel</button>
                                            <button type="submit" className="btn-primary">Add to Campaign</button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Campaign Form Modal */}
            <AnimatePresence>
                {showForm && (
                    <motion.div className="inf-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowForm(false)}>
                        <motion.div className="inf-modal" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={e => e.stopPropagation()}>
                            <div className="inf-modal-header">
                                <h2>{editCampaign ? 'Edit Campaign' : 'Create Campaign'}</h2>
                                <button onClick={() => setShowForm(false)}><X size={20} /></button>
                            </div>
                            <form className="inf-form" onSubmit={handleSubmit}>
                                <div className="inf-form-grid">
                                    <div className="inf-form-group"><label>Campaign Name *</label>
                                        <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required /></div>
                                    <div className="inf-form-group"><label>Brand *</label>
                                        <input value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} required /></div>
                                    <div className="inf-form-group"><label>Platform</label>
                                        <select value={form.platform} onChange={e => setForm(f => ({ ...f, platform: e.target.value }))}>
                                            <option>Instagram</option><option>YouTube</option><option>Both</option>
                                        </select></div>
                                    <div className="inf-form-group"><label>Budget (₹)</label>
                                        <input type="number" value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))} /></div>
                                    <div className="inf-form-group"><label>Objective</label>
                                        <select value={form.objective} onChange={e => setForm(f => ({ ...f, objective: e.target.value }))}>
                                            {objectives.map(o => <option key={o}>{o}</option>)}
                                        </select></div>
                                    <div className="inf-form-group"><label>Status</label>
                                        <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                                            <option>Planning</option><option>Active</option><option>Completed</option><option>Paused</option>
                                        </select></div>
                                    <div className="inf-form-group"><label>Start Date</label>
                                        <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} /></div>
                                    <div className="inf-form-group"><label>End Date</label>
                                        <input type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} /></div>
                                    <div className="inf-form-group full-width"><label>Campaign Brief</label>
                                        <textarea value={form.brief} onChange={e => setForm(f => ({ ...f, brief: e.target.value }))} rows={3} /></div>
                                </div>
                                <div className="inf-form-btns">
                                    <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                                    <button type="submit" className="btn-primary">{editCampaign ? 'Update' : 'Create'} Campaign</button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                .camp-filters { display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; }
                .camp-filter-btn {
                    padding: 8px 16px; border-radius: 20px; font-size: 0.8rem; font-weight: 600;
                    background: rgba(30,30,45,0.6); border: 1px solid rgba(255,255,255,0.06);
                    color: var(--text-secondary); cursor: pointer; transition: all 0.15s;
                }
                .camp-filter-btn:hover { border-color: rgba(99,102,241,0.3); }
                .camp-filter-btn.active { background: rgba(99,102,241,0.15); color: var(--accent-primary); border-color: rgba(99,102,241,0.3); }

                .camp-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 16px; margin-bottom: 24px; }
                .camp-card {
                    background: rgba(30,30,45,0.6); border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 16px; padding: 20px; cursor: pointer; transition: all 0.2s; position: relative;
                }
                .camp-card:hover { border-color: rgba(99,102,241,0.3); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.2); }
                .camp-card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
                .camp-card-title { display: flex; align-items: flex-start; gap: 10px; }
                .camp-card-title h3 { font-size: 1rem; font-weight: 600; color: var(--text-primary); }
                .camp-brand { font-size: 0.8rem; color: var(--text-muted); }
                .camp-status { padding: 4px 10px; border-radius: 20px; font-size: 0.7rem; font-weight: 600; }
                .camp-brief { font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 12px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
                .camp-meta { display: flex; flex-wrap: wrap; gap: 12px; font-size: 0.75rem; color: var(--text-muted); margin-bottom: 12px; }
                .camp-meta div { display: flex; align-items: center; gap: 4px; }
                .camp-progress { margin-top: 8px; }
                .camp-progress-bar { height: 4px; background: rgba(255,255,255,0.06); border-radius: 4px; overflow: hidden; }
                .camp-progress-fill { height: 100%; background: var(--accent-gradient); border-radius: 4px; transition: width 0.3s; }
                .camp-progress-text { font-size: 0.7rem; color: var(--text-muted); margin-top: 4px; display: block; }
                .camp-card-actions {
                    position: absolute; top: 16px; right: 16px; display: flex; gap: 4px;
                    opacity: 0; transition: opacity 0.2s;
                }
                .camp-card:hover .camp-card-actions { opacity: 1; }
                .camp-card-actions button {
                    width: 28px; height: 28px; border-radius: 8px; border: none;
                    background: rgba(255,255,255,0.08); color: var(--text-secondary);
                    display: flex; align-items: center; justify-content: center; cursor: pointer;
                }
                .camp-card-actions button:hover { background: rgba(99,102,241,0.15); color: var(--accent-primary); }
                .camp-card-actions button.danger:hover { background: rgba(239,68,68,0.15); color: #ef4444; }

                /* Detail Modal */
                .camp-detail-modal {
                    background: rgba(18,18,28,0.98); border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 20px; width: 850px; max-width: 95vw; max-height: 90vh; overflow-y: auto;
                    position: relative;
                }
                .camp-detail-body { padding: 24px; }
                .camp-detail-info { margin-bottom: 20px; font-size: 0.85rem; color: var(--text-secondary); }
                .camp-detail-meta { display: flex; flex-wrap: wrap; gap: 16px; margin-top: 12px; }
                .camp-detail-meta span { display: flex; align-items: center; gap: 6px; font-size: 0.8rem; }
                .camp-creators-section { margin-top: 16px; }
                .camp-section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
                .camp-section-header h3 { display: flex; align-items: center; gap: 8px; font-size: 1rem; }

                .camp-creator-card {
                    background: rgba(30,30,45,0.5); border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 14px; padding: 16px; margin-bottom: 12px;
                }
                .camp-creator-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
                .camp-creator-name { font-weight: 600; font-size: 0.95rem; color: var(--text-primary); flex: 1; }
                .camp-creator-fee { font-weight: 600; color: #10b981; margin-right: 8px; }
                .camp-payment-select {
                    padding: 4px 10px; border-radius: 20px; font-size: 0.7rem; font-weight: 600;
                    border: none; cursor: pointer;
                }
                .camp-deliverables { margin-bottom: 12px; }
                .camp-deliverables h5 { font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; margin-bottom: 8px; }
                .camp-del-item {
                    display: flex; align-items: center; gap: 12px; padding: 8px 0;
                    border-bottom: 1px solid rgba(255,255,255,0.03); font-size: 0.85rem;
                }
                .camp-del-type { flex: 1; color: var(--text-primary); font-weight: 500; }
                .camp-del-due { color: var(--text-muted); font-size: 0.8rem; }
                .camp-del-status {
                    padding: 3px 10px; border-radius: 20px; font-size: 0.7rem; font-weight: 600;
                    border: none; cursor: pointer;
                }
                .camp-insights { margin-top: 8px; }
                .camp-insights h5 { font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; margin-bottom: 8px; }
                .camp-insights-grid {
                    display: flex; gap: 16px; font-size: 0.8rem; color: var(--text-secondary);
                }
                .camp-insights-grid div { display: flex; align-items: center; gap: 4px; }

                @media (max-width: 768px) { .camp-grid { grid-template-columns: 1fr; } }
            `}</style>
        </div>
    )
}

export default CampaignDashboard
