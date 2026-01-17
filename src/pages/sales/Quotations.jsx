import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Filter, Edit, Trash2, FileText, Send, Eye, CheckCircle, Clock, Copy, Target } from 'lucide-react'
import { getQuotations, deleteQuotation, createQuotation, updateQuotation, convertQuotationToOrder, createQuotationRevision, getQuotationTemplates } from '../../stores/salesStore'
import { getContacts } from '../../stores/crmStore'
import DataTable from '../../components/DataTable'
import Modal, { ModalFooter } from '../../components/Modal'
import FormInput, { FormTextarea, FormSelect } from '../../components/FormInput'
import { useToast } from '../../components/Toast'

const statuses = [
    { value: 'draft', label: 'Draft' },
    { value: 'sent', label: 'Sent' },
    { value: 'viewed', label: 'Viewed' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'expired', label: 'Expired' }
]

function Quotations() {
    const toast = useToast()
    const [quotations, setQuotations] = useState([])
    const [templates, setTemplates] = useState([])
    const [contacts, setContacts] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingQuote, setEditingQuote] = useState(null)
    const [deleteConfirm, setDeleteConfirm] = useState(null)
    const [convertModal, setConvertModal] = useState(null)
    const [revisionModal, setRevisionModal] = useState(null)
    const [viewModal, setViewModal] = useState(null)
    const [filterStatus, setFilterStatus] = useState('')
    const [filterCustomer, setFilterCustomer] = useState('')

    const [formData, setFormData] = useState({
        customerId: '', templateId: '', notes: '', terms: '', validUntil: '', items: []
    })

    const [itemData, setItemData] = useState({
        name: '', description: '', quantity: 1, price: 0, discount: 0
    })

    const [convertData, setConvertData] = useState({
        shippingAddress: '', billingAddress: '', paymentTerms: '', expectedDelivery: ''
    })

    const loadData = async () => {
        const filters = {}
        if (filterStatus) filters.status = filterStatus
        if (filterCustomer) filters.customerId = filterCustomer
        setQuotations(getQuotations(filters))
        setTemplates(getQuotationTemplates())
        try {
            const contactsData = await getContacts()
            setContacts(Array.isArray(contactsData) ? contactsData : [])
        } catch (e) {
            console.warn('Failed to load contacts:', e)
            setContacts([])
        }
    }

    useEffect(() => { loadData() }, [filterStatus, filterCustomer])

    const handleSubmit = () => {
        if (!formData.customerId) {
            toast.error('Customer is required')
            return
        }
        if (formData.items.length === 0) {
            toast.error('At least one item is required')
            return
        }

        const subtotal = formData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0)
        const discount = formData.items.reduce((sum, item) => sum + (item.quantity * item.discount), 0)
        const tax = 0
        const total = subtotal - discount + tax

        const quoteData = {
            ...formData,
            subtotal,
            discount,
            tax,
            total
        }

        if (editingQuote) {
            updateQuotation(editingQuote.id, quoteData)
            toast.success('Quotation updated')
        } else {
            const template = getQuotationTemplates().find(t => t.id === formData.templateId)
            createQuotation({
                ...quoteData,
                notes: quoteData.notes || template?.notes,
                terms: quoteData.terms || template?.terms
            })
            toast.success('Quotation created')
        }
        setIsModalOpen(false)
        setEditingQuote(null)
        resetFormData()
        loadData()
    }

    const handleEdit = (quote) => {
        setEditingQuote(quote)
        setFormData({
            customerId: quote.customerId,
            templateId: quote.templateId,
            notes: quote.notes,
            terms: quote.terms,
            validUntil: quote.validUntil,
            items: quote.items
        })
        setIsModalOpen(true)
    }

    const handleSend = (quote) => {
        updateQuotation(quote.id, { status: 'sent', sentDate: new Date().toISOString().split('T')[0] })
        toast.success('Quotation sent')
        loadData()
    }

    const handleAccept = (quote) => {
        updateQuotation(quote.id, { status: 'accepted', approvedDate: new Date().toISOString().split('T')[0] })
        toast.success('Quotation accepted')
        loadData()
    }

    const handleConvert = (quote) => {
        setConvertModal(quote)
        setConvertData({
            shippingAddress: '', billingAddress: '', paymentTerms: 'Net 30', expectedDelivery: ''
        })
    }

    const confirmConvert = () => {
        const order = convertQuotationToOrder(convertModal.id, convertData)
        if (order) {
            toast.success('Quotation converted to order')
            setConvertModal(null)
            loadData()
        }
    }

    const handleRevision = (quote) => {
        setRevisionModal(quote)
    }

    const confirmRevision = () => {
        createQuotationRevision(revisionModal.id)
        toast.success('Revision created')
        setRevisionModal(null)
        loadData()
    }

    const confirmDelete = () => {
        if (deleteConfirm) {
            deleteQuotation(deleteConfirm.id)
            toast.success('Quotation deleted')
            setDeleteConfirm(null)
            loadData()
        }
    }

    const addItem = () => {
        if (!itemData.name || itemData.price <= 0) {
            toast.error('Item name and price are required')
            return
        }
        const newItem = {
            ...itemData,
            id: `item-${Date.now()}`,
            total: itemData.quantity * itemData.price - itemData.discount
        }
        setFormData({ ...formData, items: [...formData.items, newItem] })
        setItemData({ name: '', description: '', quantity: 1, price: 0, discount: 0 })
    }

    const removeItem = (index) => {
        setFormData({ ...formData, items: formData.items.filter((_, i) => i !== index) })
    }

    const resetFormData = () => {
        setFormData({
            customerId: '', templateId: '', notes: '', terms: '', validUntil: '', items: []
        })
    }

    const getStatusIcon = (status) => {
        const icons = {
            draft: Clock,
            sent: Send,
            viewed: Eye,
            accepted: CheckCircle,
            rejected: Trash2,
            expired: Clock
        }
        return icons[status] || FileText
    }

    const columns = [
        {
            key: 'quoteNumber', label: 'Quote #',
            render: (value) => <span className="quote-number">{value}</span>
        },
        {
            key: 'customerName', label: 'Customer', render: (_, row) => {
                const customer = contacts.find(c => c.id === row.customerId)
                return customer ? `${customer.firstName} ${customer.lastName}` : '-'
            }
        },
        { key: 'total', label: 'Total', render: (v) => <span className="amount">${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v)}</span> },
        {
            key: 'status', label: 'Status',
            render: (v) => (
                <span className={`status-badge ${v}`}>
                    {React.createElement(getStatusIcon(v), { size: 14, style: { marginRight: 4 } })}
                    {v}
                </span>
            )
        },
        { key: 'revision', label: 'Rev', render: (v) => <span className="revision-badge">v{v}</span> },
        { key: 'validUntil', label: 'Valid Until' },
        { key: 'createdAt', label: 'Created' },
        {
            key: 'convertedToOrder', label: 'Converted',
            render: (v) => v ? <span className="converted-badge">Yes</span> : <span className="not-converted">No</span>
        },
        {
            key: 'actions', label: '', sortable: false,
            render: (_, row) => (
                <div className="action-buttons">
                    {row.status === 'draft' && (
                        <button className="action-btn send" onClick={() => handleSend(row)} title="Send Quote"><Send size={16} /></button>
                    )}
                    {row.status === 'viewed' && !row.convertedToOrder && (
                        <button className="action-btn accept" onClick={() => handleAccept(row)} title="Accept Quote"><CheckCircle size={16} /></button>
                    )}
                    {!row.convertedToOrder && row.status !== 'expired' && row.status !== 'rejected' && (
                        <button className="action-btn convert" onClick={() => handleConvert(row)} title="Convert to Order"><Target size={16} /></button>
                    )}
                    {row.status === 'draft' && (
                        <button className="action-btn revision" onClick={() => handleRevision(row)} title="Create Revision"><Copy size={16} /></button>
                    )}
                    <button className="action-btn edit" onClick={() => handleEdit(row)}><Edit size={16} /></button>
                    <button className="action-btn delete" onClick={() => setDeleteConfirm(row)}><Trash2 size={16} /></button>
                </div>
            )
        }
    ]

    return (
        <div className="page">
            <motion.div className="page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <div>
                    <h1 className="page-title"><span className="gradient-text">Quotations</span></h1>
                    <p className="page-description">Create and manage sales quotations.</p>
                </div>
                <button className="btn-primary" onClick={() => setIsModalOpen(true)}><Plus size={20} /> New Quote</button>
            </motion.div>

            <div className="filters-bar">
                <div className="filter-group">
                    <Filter size={18} />
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                        <option value="">All Status</option>
                        {statuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                </div>
                <div className="filter-group">
                    <select value={filterCustomer} onChange={(e) => setFilterCustomer(e.target.value)}>
                        <option value="">All Customers</option>
                        {contacts.map(c => <option key={c.id} value={c.id}>{c.firstName} {c.lastName}</option>)}
                    </select>
                </div>
                <div className="filter-stats">{quotations.length} quotations</div>
            </div>

            <DataTable columns={columns} data={quotations} searchable exportable />

            {/* Add/Edit Modal */}
            <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingQuote(null); resetFormData() }} title={editingQuote ? 'Edit Quotation' : 'New Quotation'} size="large">
                <div className="form-grid">
                    <FormSelect label="Customer *" options={contacts.map(c => ({ value: c.id, label: `${c.firstName} ${c.lastName}` }))} value={formData.customerId} onChange={(e) => setFormData({ ...formData, customerId: e.target.value })} />
                    <FormSelect label="Template" options={[{ value: '', label: 'Select Template' }, ...templates.map(t => ({ value: t.id, label: t.name }))]} value={formData.templateId} onChange={(e) => setFormData({ ...formData, templateId: e.target.value })} />
                    <FormInput label="Valid Until" type="date" value={formData.validUntil} onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })} />
                </div>

                <div className="items-section">
                    <h3>Items</h3>
                    <div className="items-list">
                        {formData.items.map((item, index) => (
                            <div key={index} className="item-row">
                                <div className="item-info">
                                    <div className="item-name">{item.name}</div>
                                    <div className="item-details">{item.quantity} x ${item.price}</div>
                                </div>
                                <div className="item-total">${item.total}</div>
                                <button className="item-remove" onClick={() => removeItem(index)}><Trash2 size={14} /></button>
                            </div>
                        ))}
                    </div>
                    <div className="add-item-form">
                        <div className="form-grid">
                            <FormInput label="Item Name" value={itemData.name} onChange={(e) => setItemData({ ...itemData, name: e.target.value })} />
                            <FormInput label="Description" value={itemData.description} onChange={(e) => setItemData({ ...itemData, description: e.target.value })} />
                            <FormInput label="Quantity" type="number" value={itemData.quantity} onChange={(e) => setItemData({ ...itemData, quantity: parseInt(e.target.value) || 1 })} />
                            <FormInput label="Price" type="number" value={itemData.price} onChange={(e) => setItemData({ ...itemData, price: parseFloat(e.target.value) || 0 })} />
                        </div>
                        <button className="btn-secondary add-item-btn" onClick={addItem}>+ Add Item</button>
                    </div>
                </div>

                <div className="form-grid" style={{ marginTop: 16 }}>
                    <FormTextarea label="Notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={2} />
                    <FormTextarea label="Terms" value={formData.terms} onChange={(e) => setFormData({ ...formData, terms: e.target.value })} rows={2} />
                </div>

                {formData.items.length > 0 && (
                    <div className="quote-summary">
                        <div className="summary-row">
                            <span>Subtotal</span>
                            <span>${formData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0)}</span>
                        </div>
                        <div className="summary-row">
                            <span>Discount</span>
                            <span>-${formData.items.reduce((sum, item) => sum + item.discount, 0)}</span>
                        </div>
                        <div className="summary-row total">
                            <span>Total</span>
                            <span>${formData.items.reduce((sum, item) => sum + (item.quantity * item.price - item.discount), 0)}</span>
                        </div>
                    </div>
                )}

                <ModalFooter>
                    <button className="btn-secondary" onClick={() => { setIsModalOpen(false); setEditingQuote(null); resetFormData() }}>Cancel</button>
                    <button className="btn-primary" onClick={handleSubmit}>{editingQuote ? 'Update' : 'Create'}</button>
                </ModalFooter>
            </Modal>

            {/* Convert to Order Modal */}
            <Modal isOpen={!!convertModal} onClose={() => setConvertModal(null)} title="Convert to Order" size="medium">
                <FormTextarea label="Shipping Address" value={convertData.shippingAddress} onChange={(e) => setConvertData({ ...convertData, shippingAddress: e.target.value })} rows={2} />
                <FormTextarea label="Billing Address" value={convertData.billingAddress} onChange={(e) => setConvertData({ ...convertData, billingAddress: e.target.value })} rows={2} />
                <div className="form-grid">
                    <FormInput label="Payment Terms" value={convertData.paymentTerms} onChange={(e) => setConvertData({ ...convertData, paymentTerms: e.target.value })} />
                    <FormInput label="Expected Delivery" type="date" value={convertData.expectedDelivery} onChange={(e) => setConvertData({ ...convertData, expectedDelivery: e.target.value })} />
                </div>
                <ModalFooter>
                    <button className="btn-secondary" onClick={() => setConvertModal(null)}>Cancel</button>
                    <button className="btn-primary" onClick={confirmConvert}>Convert</button>
                </ModalFooter>
            </Modal>

            {/* Revision Confirm Modal */}
            <Modal isOpen={!!revisionModal} onClose={() => setRevisionModal(null)} title="Create Revision" size="small">
                <p style={{ marginBottom: 24, color: 'var(--text-secondary)' }}>Create a new revision for <strong>{revisionModal?.quoteNumber}</strong>?</p>
                <ModalFooter>
                    <button className="btn-secondary" onClick={() => setRevisionModal(null)}>Cancel</button>
                    <button className="btn-primary" onClick={confirmRevision}>Create Revision</button>
                </ModalFooter>
            </Modal>

            {/* Delete Confirm Modal */}
            <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Quotation" size="small">
                <p style={{ marginBottom: 24, color: 'var(--text-secondary)' }}>Delete <strong>{deleteConfirm?.quoteNumber}</strong>?</p>
                <ModalFooter>
                    <button className="btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                    <button className="btn-danger" onClick={confirmDelete}>Delete</button>
                </ModalFooter>
            </Modal>

            <style>{`
                .page-header { display: flex; justify-content: space-between; }
                .btn-primary { display: flex; align-items: center; gap: 8px; padding: 12px 20px; background: var(--accent-gradient); border-radius: var(--radius-md); color: white; }
                .btn-secondary { padding: 12px 20px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-secondary); }
                .btn-danger { padding: 12px 20px; background: var(--error); border-radius: var(--radius-md); color: white; }
                .filters-bar { display: flex; gap: 16px; margin-bottom: 24px; }
                .filter-group { display: flex; align-items: center; gap: 8px; padding: 8px 14px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); }
                .filter-group svg { color: var(--text-muted); }
                .filter-group select { background: transparent; border: none; color: var(--text-primary); }
                .filter-stats { margin-left: auto; color: var(--text-muted); }
                .form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
                .quote-number { font-family: 'JetBrains Mono', monospace; font-weight: 600; color: var(--accent-primary); }
                .amount { font-weight: 600; color: var(--success); }
                .status-badge { display: inline-flex; align-items: center; padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; text-transform: capitalize; }
                .status-badge.draft { background: rgba(107, 114, 128, 0.15); color: var(--text-muted); }
                .status-badge.sent { background: rgba(59, 130, 246, 0.15); color: var(--info); }
                .status-badge.viewed { background: rgba(139, 92, 246, 0.15); color: #8b5cf6; }
                .status-badge.accepted { background: rgba(16, 185, 129, 0.15); color: var(--success); }
                .status-badge.rejected { background: rgba(239, 68, 68, 0.15); color: var(--error); }
                .status-badge.expired { background: rgba(245, 158, 11, 0.15); color: var(--warning); }
                .revision-badge { padding: 2px 8px; background: rgba(139, 92, 246, 0.2); color: #8b5cf6; border-radius: 8px; font-size: 0.7rem; font-weight: 600; }
                .converted-badge { padding: 2px 8px; background: rgba(16, 185, 129, 0.15); color: var(--success); border-radius: 8px; font-size: 0.75rem; }
                .not-converted { padding: 2px 8px; background: rgba(107, 114, 128, 0.1); color: var(--text-muted); border-radius: 8px; font-size: 0.75rem; }
                .action-buttons { display: flex; gap: 8px; }
                .action-btn { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
                .action-btn.send { background: rgba(59, 130, 246, 0.1); color: var(--info); }
                .action-btn.accept { background: rgba(16, 185, 129, 0.1); color: var(--success); }
                .action-btn.convert { background: rgba(245, 158, 11, 0.1); color: var(--warning); }
                .action-btn.revision { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }
                .action-btn.edit { background: rgba(59, 130, 246, 0.1); color: var(--info); }
                .action-btn.delete { background: rgba(239, 68, 68, 0.1); color: var(--error); }
                .items-section { margin-top: 20px; }
                .items-section h3 { margin-bottom: 12px; color: var(--text-primary); font-size: 0.9rem; }
                .items-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
                .item-row { display: flex; align-items: center; justify-content: space-between; padding: 12px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); }
                .item-info { display: flex; flex-direction: column; gap: 2px; }
                .item-name { font-weight: 500; color: var(--text-primary); }
                .item-details { font-size: 0.8rem; color: var(--text-muted); }
                .item-total { font-weight: 600; color: var(--text-primary); }
                .item-remove { width: 28px; height: 28px; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: var(--error); }
                .add-item-form { padding: 16px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); margin-bottom: 16px; }
                .add-item-btn { width: 100%; margin-top: 12px; }
                .quote-summary { padding: 16px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); }
                .summary-row { display: flex; justify-content: space-between; padding: 8px 0; color: var(--text-secondary); }
                .summary-row.total { border-top: 1px solid var(--border-color); margin-top: 8px; padding-top: 12px; font-weight: 600; color: var(--text-primary); font-size: 1.1rem; }
            `}</style>
        </div>
    )
}

export default Quotations
