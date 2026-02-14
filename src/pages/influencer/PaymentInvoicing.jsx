import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    FileText, Plus, X, IndianRupee, CheckCircle, Clock, AlertCircle,
    Edit2, Download, Eye, Calendar, CreditCard
} from 'lucide-react'
import {
    getInvoices, createInvoice, updateInvoice, getCreators, getCampaigns
} from '../../stores/influencerStore'

function PaymentInvoicing() {
    const [invoices, setInvoices] = useState([])
    const [creators, setCreators] = useState([])
    const [campaigns, setCampaigns] = useState([])
    const [filter, setFilter] = useState('')
    const [showForm, setShowForm] = useState(false)
    const [selectedInvoice, setSelectedInvoice] = useState(null)

    const [form, setForm] = useState({
        creatorId: '', creatorName: '', campaignId: '', campaignName: '',
        amount: '', issueDate: '', dueDate: '', notes: ''
    })

    useEffect(() => { reload() }, [filter])

    function reload() {
        setInvoices(getInvoices(filter ? { status: filter } : {}))
        setCreators(getCreators())
        setCampaigns(getCampaigns())
    }

    function handleSubmit(e) {
        e.preventDefault()
        const creator = creators.find(c => c.id === form.creatorId)
        const campaign = campaigns.find(c => c.id === form.campaignId)
        createInvoice({
            ...form,
            creatorName: creator?.name || '',
            campaignName: campaign?.name || '',
            amount: Number(form.amount) || 0,
        })
        setShowForm(false)
        setForm({ creatorId: '', creatorName: '', campaignId: '', campaignName: '', amount: '', issueDate: '', dueDate: '', notes: '' })
        reload()
    }

    function handleMarkPaid(id) {
        updateInvoice(id, { status: 'Paid', paidDate: new Date().toISOString().split('T')[0], paymentMethod: 'Bank Transfer' })
        reload()
    }

    const formatCurrency = (val) => {
        if (!val) return '—'
        return `₹${val.toLocaleString('en-IN')}`
    }

    const statusColors = { Pending: '#f59e0b', Paid: '#10b981', Overdue: '#ef4444', Cancelled: '#6b7280' }

    const totalPending = invoices.filter(i => i.status === 'Pending').reduce((s, i) => s + i.totalPayable, 0)
    const totalPaid = invoices.filter(i => i.status === 'Paid').reduce((s, i) => s + i.totalPayable, 0)
    const totalValue = invoices.reduce((s, i) => s + i.amount, 0)

    return (
        <div className="page">
            <motion.div className="page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <div>
                    <h1 className="page-title"><span className="gradient-text">Payment</span> & Invoicing</h1>
                    <p className="page-description">{invoices.length} invoices • Track creator payments with GST & TDS calculations</p>
                </div>
                <button className="btn-primary" onClick={() => { setForm({ creatorId: '', creatorName: '', campaignId: '', campaignName: '', amount: '', issueDate: '', dueDate: '', notes: '' }); setShowForm(true) }}>
                    <Plus size={18} /> Create Invoice
                </button>
            </motion.div>

            <div className="sales-summary">
                <div className="sales-summary-card">
                    <div className="sales-summary-value" style={{ color: 'var(--text-primary)' }}>{formatCurrency(totalValue)}</div>
                    <div className="sales-summary-label">Total Invoice Value</div>
                </div>
                <div className="sales-summary-card">
                    <div className="sales-summary-value" style={{ color: '#10b981' }}>{formatCurrency(totalPaid)}</div>
                    <div className="sales-summary-label">Total Paid</div>
                </div>
                <div className="sales-summary-card">
                    <div className="sales-summary-value" style={{ color: '#f59e0b' }}>{formatCurrency(totalPending)}</div>
                    <div className="sales-summary-label">Pending Payments</div>
                </div>
                <div className="sales-summary-card">
                    <div className="sales-summary-value">{invoices.filter(i => i.status === 'Paid').length}/{invoices.length}</div>
                    <div className="sales-summary-label">Paid / Total</div>
                </div>
            </div>

            <div className="camp-filters">
                {['', 'Pending', 'Paid', 'Overdue'].map(s => (
                    <button key={s} className={`camp-filter-btn ${filter === s ? 'active' : ''}`}
                        onClick={() => setFilter(s)}>{s || 'All'}</button>
                ))}
            </div>

            <div className="inf-table-wrap">
                <table className="inf-table">
                    <thead>
                        <tr>
                            <th>Invoice #</th><th>Creator</th><th>Campaign</th><th>Amount</th>
                            <th>GST (18%)</th><th>TDS (10%)</th><th>Total Payable</th>
                            <th>Issue Date</th><th>Due Date</th><th>Status</th><th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {invoices.map(inv => {
                            const isOverdue = inv.status === 'Pending' && new Date(inv.dueDate) < new Date()
                            return (
                                <tr key={inv.id} onClick={() => setSelectedInvoice(inv)} className={selectedInvoice?.id === inv.id ? 'selected' : ''}>
                                    <td style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>{inv.invoiceNumber}</td>
                                    <td>{inv.creatorName}</td>
                                    <td>{inv.campaignName}</td>
                                    <td className="inf-num">{formatCurrency(inv.amount)}</td>
                                    <td className="inf-num" style={{ color: '#f59e0b' }}>{formatCurrency(inv.gst)}</td>
                                    <td className="inf-num" style={{ color: '#ef4444' }}>-{formatCurrency(inv.tds)}</td>
                                    <td className="inf-num" style={{ fontWeight: 700, color: '#10b981' }}>{formatCurrency(inv.totalPayable)}</td>
                                    <td>{inv.issueDate}</td>
                                    <td className={isOverdue ? 'inv-overdue' : ''}>{inv.dueDate}</td>
                                    <td>
                                        <span className="inf-status-badge" style={{
                                            background: `${statusColors[isOverdue ? 'Overdue' : inv.status]}20`,
                                            color: statusColors[isOverdue ? 'Overdue' : inv.status]
                                        }}>
                                            {isOverdue ? 'Overdue' : inv.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="inf-actions" onClick={e => e.stopPropagation()}>
                                            {inv.status === 'Pending' && (
                                                <button onClick={() => handleMarkPaid(inv.id)} title="Mark as Paid" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
                                                    <CheckCircle size={14} />
                                                </button>
                                            )}
                                            <button onClick={() => setSelectedInvoice(inv)} title="View"><Eye size={14} /></button>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                        {invoices.length === 0 && <tr><td colSpan="11" className="inf-empty-row">No invoices yet. Create your first invoice!</td></tr>}
                    </tbody>
                </table>
            </div>

            {/* Invoice Detail */}
            <AnimatePresence>
                {selectedInvoice && (
                    <motion.div className="inf-detail-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedInvoice(null)}>
                        <motion.div className="inf-detail-panel" initial={{ x: 400 }} animate={{ x: 0 }} exit={{ x: 400 }} onClick={e => e.stopPropagation()}>
                            <div className="inf-detail-header">
                                <h2>{selectedInvoice.invoiceNumber}</h2>
                                <button onClick={() => setSelectedInvoice(null)}><X size={20} /></button>
                            </div>
                            <div className="inf-detail-body">
                                <div className="inv-detail-card">
                                    <div className="inv-row"><span>Creator:</span><strong>{selectedInvoice.creatorName}</strong></div>
                                    <div className="inv-row"><span>Campaign:</span><strong>{selectedInvoice.campaignName}</strong></div>
                                    <div className="inv-divider"></div>
                                    <div className="inv-row"><span>Base Amount:</span><strong>{formatCurrency(selectedInvoice.amount)}</strong></div>
                                    <div className="inv-row"><span>GST (18%):</span><strong style={{ color: '#f59e0b' }}>+{formatCurrency(selectedInvoice.gst)}</strong></div>
                                    <div className="inv-row"><span>TDS (10%):</span><strong style={{ color: '#ef4444' }}>-{formatCurrency(selectedInvoice.tds)}</strong></div>
                                    <div className="inv-divider"></div>
                                    <div className="inv-row inv-total"><span>Total Payable:</span><strong>{formatCurrency(selectedInvoice.totalPayable)}</strong></div>
                                    <div className="inv-divider"></div>
                                    <div className="inv-row"><span>Issue Date:</span><strong>{selectedInvoice.issueDate}</strong></div>
                                    <div className="inv-row"><span>Due Date:</span><strong>{selectedInvoice.dueDate}</strong></div>
                                    <div className="inv-row"><span>Status:</span>
                                        <span className="inf-status-badge" style={{ background: `${statusColors[selectedInvoice.status]}20`, color: statusColors[selectedInvoice.status] }}>
                                            {selectedInvoice.status}
                                        </span>
                                    </div>
                                    {selectedInvoice.paidDate && <div className="inv-row"><span>Paid Date:</span><strong>{selectedInvoice.paidDate}</strong></div>}
                                    {selectedInvoice.paymentMethod && <div className="inv-row"><span>Payment Method:</span><strong>{selectedInvoice.paymentMethod}</strong></div>}
                                    {selectedInvoice.notes && (
                                        <>
                                            <div className="inv-divider"></div>
                                            <div className="inv-row"><span>Notes:</span></div>
                                            <p className="inf-detail-notes">{selectedInvoice.notes}</p>
                                        </>
                                    )}
                                </div>

                                {selectedInvoice.status === 'Pending' && (
                                    <button className="btn-primary" style={{ width: '100%', marginTop: 16, justifyContent: 'center' }}
                                        onClick={() => { handleMarkPaid(selectedInvoice.id); setSelectedInvoice(null) }}>
                                        <CheckCircle size={18} /> Mark as Paid
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Create Invoice */}
            <AnimatePresence>
                {showForm && (
                    <motion.div className="inf-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowForm(false)}>
                        <motion.div className="inf-modal" style={{ width: 520 }} initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()}>
                            <div className="inf-modal-header">
                                <h2>Create Invoice</h2>
                                <button onClick={() => setShowForm(false)}><X size={20} /></button>
                            </div>
                            <form className="inf-form" onSubmit={handleSubmit}>
                                <div className="inf-form-grid">
                                    <div className="inf-form-group"><label>Creator *</label>
                                        <select value={form.creatorId} onChange={e => setForm(f => ({ ...f, creatorId: e.target.value }))} required>
                                            <option value="">Select Creator</option>
                                            {creators.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select></div>
                                    <div className="inf-form-group"><label>Campaign</label>
                                        <select value={form.campaignId} onChange={e => setForm(f => ({ ...f, campaignId: e.target.value }))}>
                                            <option value="">Select Campaign</option>
                                            {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select></div>
                                    <div className="inf-form-group"><label>Base Amount (₹) *</label>
                                        <input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} required /></div>
                                    <div className="inf-form-group"><label>Issue Date *</label>
                                        <input type="date" value={form.issueDate} onChange={e => setForm(f => ({ ...f, issueDate: e.target.value }))} required /></div>
                                    <div className="inf-form-group full-width"><label>Due Date *</label>
                                        <input type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} required /></div>
                                    {form.amount && (
                                        <div className="inf-form-group full-width">
                                            <div className="inv-preview">
                                                <div className="inv-row"><span>Base:</span><strong>₹{Number(form.amount).toLocaleString('en-IN')}</strong></div>
                                                <div className="inv-row"><span>GST (18%):</span><strong style={{ color: '#f59e0b' }}>+₹{Math.round(Number(form.amount) * 0.18).toLocaleString('en-IN')}</strong></div>
                                                <div className="inv-row"><span>TDS (10%):</span><strong style={{ color: '#ef4444' }}>-₹{Math.round(Number(form.amount) * 0.10).toLocaleString('en-IN')}</strong></div>
                                                <div className="inv-row inv-total"><span>Payable:</span><strong>₹{Math.round(Number(form.amount) * 1.08).toLocaleString('en-IN')}</strong></div>
                                            </div>
                                        </div>
                                    )}
                                    <div className="inf-form-group full-width"><label>Notes</label>
                                        <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
                                </div>
                                <div className="inf-form-btns">
                                    <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                                    <button type="submit" className="btn-primary"><FileText size={16} /> Create Invoice</button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                .inv-overdue { color: #ef4444 !important; font-weight: 600; }
                .inv-detail-card {
                    background: rgba(30,30,45,0.5); border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 14px; padding: 20px;
                }
                .inv-row {
                    display: flex; justify-content: space-between; align-items: center;
                    padding: 8px 0; font-size: 0.85rem; color: var(--text-secondary);
                }
                .inv-row strong { color: var(--text-primary); }
                .inv-total { font-size: 1rem; padding: 12px 0; }
                .inv-total strong { color: #10b981; font-size: 1.1rem; }
                .inv-divider { height: 1px; background: rgba(255,255,255,0.06); margin: 4px 0; }
                .inv-preview {
                    background: rgba(30,30,45,0.5); border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 12px; padding: 14px;
                }
            `}</style>
        </div>
    )
}

export default PaymentInvoicing
