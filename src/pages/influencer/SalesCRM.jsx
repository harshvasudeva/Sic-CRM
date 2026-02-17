import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    TrendingUp, Plus, X, IndianRupee, Phone, Mail, Calendar,
    Edit2, Trash2, Building2, ChevronRight, Target, Clock
} from 'lucide-react'
import { getSalesLeads, createSalesLead, updateSalesLead, deleteSalesLead } from '../../stores/influencerStore'
import { getCurrency } from '../../stores/settingsStore'

function SalesCRM() {
    const [leads, setLeads] = useState([])
    const [filter, setFilter] = useState('')
    const [showForm, setShowForm] = useState(false)
    const [editLead, setEditLead] = useState(null)
    const [selectedLead, setSelectedLead] = useState(null)

    const [form, setForm] = useState({
        brandName: '', contactPerson: '', email: '', phone: '', industry: '',
        budget: '', source: 'LinkedIn', status: 'New', stage: 'Discovery',
        notes: '', nextFollowUp: '', dealValue: '', probability: 30
    })

    useEffect(() => { reload() }, [filter])

    function reload() {
        setLeads(getSalesLeads(filter ? { status: filter } : {}))
    }

    function handleSubmit(e) {
        e.preventDefault()
        const data = { ...form, budget: Number(form.budget) || 0, dealValue: Number(form.dealValue) || 0, probability: Number(form.probability) || 30 }
        if (editLead) updateSalesLead(editLead.id, data)
        else createSalesLead(data)
        setShowForm(false); setEditLead(null)
        setForm({ brandName: '', contactPerson: '', email: '', phone: '', industry: '', budget: '', source: 'LinkedIn', status: 'New', stage: 'Discovery', notes: '', nextFollowUp: '', dealValue: '', probability: 30 })
        reload()
    }

    function handleEdit(lead) {
        setEditLead(lead)
        setForm({ ...lead, budget: String(lead.budget || ''), dealValue: String(lead.dealValue || ''), probability: lead.probability || 30 })
        setShowForm(true)
    }

    function handleDelete(id) {
        if (confirm('Delete lead?')) { deleteSalesLead(id); reload() }
    }

    function handleStageUpdate(id, stage) {
        updateSalesLead(id, { stage }); reload()
    }

    const formatCurrency = (val) => {
        if (!val) return '—'
        const s = getCurrency().symbol
        if (val >= 100000) return `${s}${(val / 100000).toFixed(1)}L`
        if (val >= 1000) return `${s}${(val / 1000).toFixed(1)}K`
        return `${s}${val}`
    }

    const statusColors = { New: '#3b82f6', Qualified: '#10b981', Negotiation: '#f59e0b', Won: '#22c55e', Lost: '#ef4444' }
    const stages = ['Discovery', 'Proposal Sent', 'Contract Review', 'Negotiation', 'Closed Won', 'Closed Lost']
    const industries = ['Beauty', 'Tech', 'Food', 'Fashion', 'Health', 'Finance', 'Quick Commerce', 'Electronics', 'FMCG', 'Gaming', 'Travel', 'SaaS', 'Education']
    const sources = ['LinkedIn', 'Referral', 'Cold Outreach', 'Inbound', 'Social Media', 'Event', 'Website']

    const totalPipeline = leads.reduce((s, l) => s + (l.dealValue || 0), 0)
    const weightedPipeline = leads.reduce((s, l) => s + ((l.dealValue || 0) * (l.probability || 0) / 100), 0)

    return (
        <div className="page">
            <motion.div className="page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <div>
                    <h1 className="page-title"><span className="gradient-text">Sales</span> CRM</h1>
                    <p className="page-description">Track brand leads, deals, and sales pipeline for your influencer marketing agency</p>
                </div>
                <button className="btn-primary" onClick={() => { setEditLead(null); setForm({ brandName: '', contactPerson: '', email: '', phone: '', industry: '', budget: '', source: 'LinkedIn', status: 'New', stage: 'Discovery', notes: '', nextFollowUp: '', dealValue: '', probability: 30 }); setShowForm(true) }}>
                    <Plus size={18} /> Add Lead
                </button>
            </motion.div>

            <div className="sales-summary">
                <div className="sales-summary-card">
                    <div className="sales-summary-value">{leads.length}</div>
                    <div className="sales-summary-label">Total Leads</div>
                </div>
                <div className="sales-summary-card">
                    <div className="sales-summary-value">{formatCurrency(totalPipeline)}</div>
                    <div className="sales-summary-label">Pipeline Value</div>
                </div>
                <div className="sales-summary-card">
                    <div className="sales-summary-value">{formatCurrency(weightedPipeline)}</div>
                    <div className="sales-summary-label">Weighted Pipeline</div>
                </div>
                <div className="sales-summary-card">
                    <div className="sales-summary-value">{leads.filter(l => l.stage === 'Closed Won').length}</div>
                    <div className="sales-summary-label">Deals Won</div>
                </div>
            </div>

            <div className="camp-filters">
                {['', 'New', 'Qualified', 'Negotiation', 'Won', 'Lost'].map(s => (
                    <button key={s} className={`camp-filter-btn ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>{s || 'All'}</button>
                ))}
            </div>

            <div className="inf-table-wrap">
                <table className="inf-table">
                    <thead>
                        <tr>
                            <th>Brand</th><th>Contact</th><th>Industry</th><th>Budget</th><th>Stage</th>
                            <th>Deal Value</th><th>Probability</th><th>Next Follow-up</th><th>Status</th><th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leads.map(lead => (
                            <tr key={lead.id} onClick={() => setSelectedLead(lead)} className={selectedLead?.id === lead.id ? 'selected' : ''}>
                                <td>
                                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{lead.brandName}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{lead.source}</div>
                                </td>
                                <td>
                                    <div style={{ fontSize: '0.85rem' }}>{lead.contactPerson}</div>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{lead.email}</div>
                                </td>
                                <td>{lead.industry}</td>
                                <td className="inf-num">{formatCurrency(lead.budget)}</td>
                                <td>
                                    <select className="sales-stage-select" value={lead.stage}
                                        onChange={e => { e.stopPropagation(); handleStageUpdate(lead.id, e.target.value) }}
                                        onClick={e => e.stopPropagation()}>
                                        {stages.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </td>
                                <td className="inf-num" style={{ fontWeight: 600, color: '#10b981' }}>{formatCurrency(lead.dealValue)}</td>
                                <td className="inf-num">{lead.probability}%</td>
                                <td>
                                    {lead.nextFollowUp ? (
                                        <span className={`sales-date ${new Date(lead.nextFollowUp) < new Date() ? 'overdue' : ''}`}>
                                            <Calendar size={12} /> {lead.nextFollowUp}
                                        </span>
                                    ) : '—'}
                                </td>
                                <td>
                                    <span className="inf-status-badge" style={{ background: `${statusColors[lead.status]}20`, color: statusColors[lead.status] }}>
                                        {lead.status}
                                    </span>
                                </td>
                                <td>
                                    <div className="inf-actions" onClick={e => e.stopPropagation()}>
                                        <button onClick={() => handleEdit(lead)}><Edit2 size={14} /></button>
                                        <button className="danger" onClick={() => handleDelete(lead.id)}><Trash2 size={14} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {leads.length === 0 && <tr><td colSpan="10" className="inf-empty-row">No leads found. Add your first brand lead!</td></tr>}
                    </tbody>
                </table>
            </div>

            {/* Detail Panel */}
            <AnimatePresence>
                {selectedLead && (
                    <motion.div className="inf-detail-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedLead(null)}>
                        <motion.div className="inf-detail-panel" initial={{ x: 400 }} animate={{ x: 0 }} exit={{ x: 400 }} onClick={e => e.stopPropagation()}>
                            <div className="inf-detail-header">
                                <h2>{selectedLead.brandName}</h2>
                                <button onClick={() => setSelectedLead(null)}><X size={20} /></button>
                            </div>
                            <div className="inf-detail-body">
                                <div className="inf-detail-section">
                                    <h4>Contact Info</h4>
                                    <div className="inf-detail-contact">
                                        <div><Building2 size={14} /> {selectedLead.contactPerson}</div>
                                        <div><Mail size={14} /> {selectedLead.email}</div>
                                        {selectedLead.phone && <div><Phone size={14} /> {selectedLead.phone}</div>}
                                    </div>
                                </div>
                                <div className="inf-detail-section">
                                    <h4>Deal Details</h4>
                                    <div className="inf-detail-rates">
                                        <div>Industry: <strong>{selectedLead.industry}</strong></div>
                                        <div>Budget: <strong>{formatCurrency(selectedLead.budget)}</strong></div>
                                        <div>Deal Value: <strong>{formatCurrency(selectedLead.dealValue)}</strong></div>
                                        <div>Probability: <strong>{selectedLead.probability}%</strong></div>
                                        <div>Weighted: <strong>{formatCurrency((selectedLead.dealValue || 0) * (selectedLead.probability || 0) / 100)}</strong></div>
                                        <div>Source: <strong>{selectedLead.source}</strong></div>
                                        <div>Stage: <strong>{selectedLead.stage}</strong></div>
                                    </div>
                                </div>
                                <div className="inf-detail-section">
                                    <h4>Notes</h4>
                                    <p className="inf-detail-notes">{selectedLead.notes || 'No notes'}</p>
                                </div>
                                <div className="inf-detail-section">
                                    <h4>Follow-ups</h4>
                                    <div className="inf-detail-rates">
                                        <div>Last: <strong>{selectedLead.lastFollowUp || 'Never'}</strong></div>
                                        <div>Next: <strong>{selectedLead.nextFollowUp || 'Not scheduled'}</strong></div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Form Modal */}
            <AnimatePresence>
                {showForm && (
                    <motion.div className="inf-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowForm(false)}>
                        <motion.div className="inf-modal" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()}>
                            <div className="inf-modal-header">
                                <h2>{editLead ? 'Edit Lead' : 'Add Brand Lead'}</h2>
                                <button onClick={() => setShowForm(false)}><X size={20} /></button>
                            </div>
                            <form className="inf-form" onSubmit={handleSubmit}>
                                <div className="inf-form-grid">
                                    <div className="inf-form-group"><label>Brand Name *</label>
                                        <input value={form.brandName} onChange={e => setForm(f => ({ ...f, brandName: e.target.value }))} required /></div>
                                    <div className="inf-form-group"><label>Contact Person *</label>
                                        <input value={form.contactPerson} onChange={e => setForm(f => ({ ...f, contactPerson: e.target.value }))} required /></div>
                                    <div className="inf-form-group"><label>Email</label>
                                        <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
                                    <div className="inf-form-group"><label>Phone</label>
                                        <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
                                    <div className="inf-form-group"><label>Industry</label>
                                        <select value={form.industry} onChange={e => setForm(f => ({ ...f, industry: e.target.value }))}>
                                            <option value="">Select</option>
                                            {industries.map(i => <option key={i} value={i}>{i}</option>)}
                                        </select></div>
                                    <div className="inf-form-group"><label>Budget ({getCurrency().symbol})</label>
                                        <input type="number" value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))} /></div>
                                    <div className="inf-form-group"><label>Deal Value ({getCurrency().symbol})</label>
                                        <input type="number" value={form.dealValue} onChange={e => setForm(f => ({ ...f, dealValue: e.target.value }))} /></div>
                                    <div className="inf-form-group"><label>Probability %</label>
                                        <input type="number" min="0" max="100" value={form.probability} onChange={e => setForm(f => ({ ...f, probability: e.target.value }))} /></div>
                                    <div className="inf-form-group"><label>Source</label>
                                        <select value={form.source} onChange={e => setForm(f => ({ ...f, source: e.target.value }))}>
                                            {sources.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select></div>
                                    <div className="inf-form-group"><label>Status</label>
                                        <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                                            <option>New</option><option>Qualified</option><option>Negotiation</option><option>Won</option><option>Lost</option>
                                        </select></div>
                                    <div className="inf-form-group"><label>Stage</label>
                                        <select value={form.stage} onChange={e => setForm(f => ({ ...f, stage: e.target.value }))}>
                                            {stages.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select></div>
                                    <div className="inf-form-group"><label>Next Follow-up</label>
                                        <input type="date" value={form.nextFollowUp} onChange={e => setForm(f => ({ ...f, nextFollowUp: e.target.value }))} /></div>
                                    <div className="inf-form-group full-width"><label>Notes</label>
                                        <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3} /></div>
                                </div>
                                <div className="inf-form-btns">
                                    <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                                    <button type="submit" className="btn-primary">{editLead ? 'Update' : 'Add'} Lead</button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                .sales-summary { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 14px; margin-bottom: 20px; }
                .sales-summary-card {
                    background: rgba(30,30,45,0.6); border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 14px; padding: 18px; text-align: center;
                }
                .sales-summary-value { font-size: 1.5rem; font-weight: 700; color: var(--text-primary); }
                .sales-summary-label { font-size: 0.8rem; color: var(--text-muted); margin-top: 4px; }
                .sales-stage-select {
                    padding: 4px 10px; border-radius: 8px; font-size: 0.75rem;
                    background: rgba(30,30,45,0.8); border: 1px solid rgba(255,255,255,0.08);
                    color: var(--text-primary); cursor: pointer;
                }
                .sales-date { display: flex; align-items: center; gap: 4px; font-size: 0.8rem; color: var(--text-secondary); }
                .sales-date.overdue { color: #ef4444; font-weight: 600; }
            `}</style>
        </div>
    )
}

export default SalesCRM
