import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Filter, Edit, Trash2, FileText, Send, CheckCircle, AlertCircle, Download, CreditCard } from 'lucide-react'
import { getInvoices, deleteInvoice, createInvoice, updateInvoice, sendInvoice, markInvoiceViewed, createInvoiceFromOrder, getSalesOrders } from '../../stores/salesStore'
import { getContacts } from '../../stores/crmStore'
import DataTable from '../../components/DataTable'
import Modal, { ModalFooter } from '../../components/Modal'
import FormInput, { FormTextarea, FormSelect } from '../../components/FormInput'
import { useToast } from '../../components/Toast'

const statuses = [
    { value: 'draft', label: 'Draft' },
    { value: 'sent', label: 'Sent' },
    { value: 'viewed', label: 'Viewed' },
    { value: 'partial', label: 'Partial' },
    { value: 'paid', label: 'Paid' },
    { value: 'overdue', label: 'Overdue' }
]

function Invoices() {
    const toast = useToast()
    const [invoices, setInvoices] = useState([])
    const [orders, setOrders] = useState([])
    const [contacts, setContacts] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingInvoice, setEditingInvoice] = useState(null)
    const [deleteConfirm, setDeleteConfirm] = useState(null)
    const [sendModal, setSendModal] = useState(null)
    const [payModal, setPayModal] = useState(null)
    const [filterStatus, setFilterStatus] = useState('')
    const [filterCustomer, setFilterCustomer] = useState('')

    const [formData, setFormData] = useState({
        customerId: '', orderId: '', templateId: '', notes: '', terms: 'Net 30',
        dueDate: '', type: 'standard', items: []
    })

    const [itemData, setItemData] = useState({
        name: '', description: '', quantity: 1, price: 0, discount: 0
    })

    const [paymentData, setPaymentData] = useState({
        amount: 0, method: 'bank_transfer', reference: '', notes: ''
    })

    const loadData = async () => {
        const filters = {}
        if (filterStatus) filters.status = filterStatus
        if (filterCustomer) filters.customerId = filterCustomer
        setInvoices(getInvoices(filters))
        setOrders(getSalesOrders().filter(o => o.status !== 'cancelled'))
        // Handle async getContacts - ensure it returns an array
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
        if (formData.items.length === 0 && !formData.orderId) {
            toast.error('At least one item is required')
            return
        }

        const subtotal = formData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0)
        const discount = formData.items.reduce((sum, item) => sum + (item.quantity * item.discount), 0)
        const tax = 0
        const total = subtotal - discount + tax

        const invoiceData = {
            ...formData,
            subtotal,
            discount,
            tax,
            total,
            paid: 0,
            balance: total
        }

        if (editingInvoice) {
            updateInvoice(editingInvoice.id, invoiceData)
            toast.success('Invoice updated')
        } else {
            createInvoice(invoiceData)
            toast.success('Invoice created')
        }
        setIsModalOpen(false)
        setEditingInvoice(null)
        resetFormData()
        loadData()
    }

    const handleEdit = (invoice) => {
        setEditingInvoice(invoice)
        setFormData({
            customerId: invoice.customerId,
            orderId: invoice.orderId,
            templateId: invoice.templateId,
            notes: invoice.notes,
            terms: invoice.terms,
            dueDate: invoice.dueDate,
            type: invoice.type,
            items: invoice.items
        })
        setIsModalOpen(true)
    }

    const handleSend = (invoice) => {
        setSendModal(invoice)
    }

    const confirmSend = () => {
        sendInvoice(sendModal.id)
        toast.success('Invoice sent to customer')
        setSendModal(null)
        loadData()
    }

    const handlePay = (invoice) => {
        setPayModal(invoice)
        setPaymentData({
            amount: invoice.balance,
            method: 'bank_transfer',
            reference: '',
            notes: ''
        })
    }

    const confirmPayment = () => {
        if (paymentData.amount <= 0) {
            toast.error('Payment amount must be greater than 0')
            return
        }
        updateInvoice(payModal.id, {
            paid: payModal.paid + paymentData.amount
        })
        toast.success(`Payment of $${paymentData.amount} recorded`)
        setPayModal(null)
        loadData()
    }

    const handleMarkViewed = (invoice) => {
        markInvoiceViewed(invoice.id)
        toast.success('Invoice marked as viewed')
        loadData()
    }

    const handleMarkPaid = (invoice) => {
        updateInvoice(invoice.id, {
            status: 'paid',
            paid: invoice.balance + invoice.paid,
            paidDate: new Date().toISOString().split('T')[0]
        })
        toast.success('Invoice marked as paid')
        loadData()
    }

    const confirmDelete = () => {
        if (deleteConfirm) {
            deleteInvoice(deleteConfirm.id)
            toast.success('Invoice deleted')
            setDeleteConfirm(null)
            loadData()
        }
    }

    const handleCreateFromOrder = (order) => {
        const invoice = createInvoiceFromOrder(order.id, {})
        if (invoice) {
            toast.success('Invoice created from order')
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
            customerId: '', orderId: '', templateId: '', notes: '', terms: 'Net 30',
            dueDate: '', type: 'standard', items: []
        })
    }

    const getStatusIcon = (status) => {
        const icons = {
            draft: FileText,
            sent: Send,
            viewed: CheckCircle,
            partial: CreditCard,
            paid: CheckCircle,
            overdue: AlertCircle
        }
        return icons[status] || FileText
    }

    const columns = [
        {
            key: 'invoiceNumber', label: 'Invoice #',
            render: (value) => <span className="invoice-number">{value}</span>
        },
        {
            key: 'customerName', label: 'Customer', render: (_, row) => {
                const customer = contacts.find(c => c.id === row.customerId)
                return customer ? `${customer.firstName} ${customer.lastName}` : '-'
            }
        },
        { key: 'total', label: 'Total', render: (v) => <span className="amount">${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v)}</span> },
        { key: 'paid', label: 'Paid', render: (v) => <span className="paid-amount">${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v)}</span> },
        { key: 'balance', label: 'Balance', render: (v) => <span className={v > 0 ? 'balance-due' : 'balance-paid'}>${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v)}</span> },
        {
            key: 'status', label: 'Status',
            render: (v) => (
                <span className={`status-badge ${v}`}>
                    {React.createElement(getStatusIcon(v), { size: 14, style: { marginRight: 4 } })}
                    {v}
                </span>
            )
        },
        { key: 'invoiceDate', label: 'Invoice Date' },
        { key: 'dueDate', label: 'Due Date' },
        {
            key: 'actions', label: '', sortable: false,
            render: (_, row) => (
                <div className="action-buttons">
                    {row.status === 'draft' && (
                        <button className="action-btn send" onClick={() => handleSend(row)} title="Send Invoice"><Send size={16} /></button>
                    )}
                    {row.status === 'viewed' && (
                        <button className="action-btn viewed" onClick={() => handleMarkViewed(row)} title="Mark Viewed"><CheckCircle size={16} /></button>
                    )}
                    {row.balance > 0 && ['sent', 'viewed', 'partial'].includes(row.status) && (
                        <button className="action-btn pay" onClick={() => handlePay(row)} title="Record Payment"><CreditCard size={16} /></button>
                    )}
                    {row.status !== 'paid' && row.balance > 0 && (
                        <button className="action-btn mark-paid" onClick={() => handleMarkPaid(row)} title="Mark as Paid"><CheckCircle size={16} /></button>
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
                    <h1 className="page-title"><span className="gradient-text">Invoices</span></h1>
                    <p className="page-description">Create and manage customer invoices.</p>
                </div>
                <button className="btn-primary" onClick={() => setIsModalOpen(true)}><Plus size={20} /> New Invoice</button>
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
                <div className="filter-stats">{invoices.length} invoices</div>
            </div>

            <DataTable columns={columns} data={invoices} searchable exportable />

            {/* Add/Edit Modal */}
            <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingInvoice(null); resetFormData() }} title={editingInvoice ? 'Edit Invoice' : 'New Invoice'} size="large">
                <div className="form-grid">
                    <FormSelect label="Customer *" options={contacts.map(c => ({ value: c.id, label: `${c.firstName} ${c.lastName}` }))} value={formData.customerId} onChange={(e) => setFormData({ ...formData, customerId: e.target.value })} />
                    <FormSelect label="From Order" options={[{ value: '', label: 'None' }, ...orders.map(o => ({ value: o.id, label: `${o.orderNumber} - $${o.total}` }))]} value={formData.orderId} onChange={(e) => {
                        const order = orders.find(o => o.id === e.target.value)
                        if (order) {
                            setFormData({ ...formData, orderId: e.target.value, items: order.items, customerId: order.customerId })
                        } else {
                            setFormData({ ...formData, orderId: e.target.value, items: [] })
                        }
                    }} />
                    <FormInput label="Due Date" type="date" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} />
                    <FormSelect label="Type" options={[
                        { value: 'standard', label: 'Standard' },
                        { value: 'recurring', label: 'Recurring' },
                        { value: 'proforma', label: 'Proforma' }
                    ]} value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} />
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
                    {!formData.orderId && (
                        <div className="add-item-form">
                            <div className="form-grid">
                                <FormInput label="Item Name" value={itemData.name} onChange={(e) => setItemData({ ...itemData, name: e.target.value })} />
                                <FormInput label="Description" value={itemData.description} onChange={(e) => setItemData({ ...itemData, description: e.target.value })} />
                                <FormInput label="Quantity" type="number" value={itemData.quantity} onChange={(e) => setItemData({ ...itemData, quantity: parseInt(e.target.value) || 1 })} />
                                <FormInput label="Price" type="number" value={itemData.price} onChange={(e) => setItemData({ ...itemData, price: parseFloat(e.target.value) || 0 })} />
                            </div>
                            <button className="btn-secondary add-item-btn" onClick={addItem}>+ Add Item</button>
                        </div>
                    )}
                </div>

                <div className="form-grid" style={{ marginTop: 16 }}>
                    <FormInput label="Payment Terms" value={formData.terms} onChange={(e) => setFormData({ ...formData, terms: e.target.value })} />
                </div>
                <FormTextarea label="Notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={2} />

                {formData.items.length > 0 && (
                    <div className="invoice-summary">
                        <div className="summary-row">
                            <span>Subtotal</span>
                            <span>${formData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0)}</span>
                        </div>
                        <div className="summary-row">
                            <span>Discount</span>
                            <span>-${formData.items.reduce((sum, item) => sum + item.discount, 0)}</span>
                        </div>
                        <div className="summary-row">
                            <span>Tax</span>
                            <span>$0</span>
                        </div>
                        <div className="summary-row total">
                            <span>Total</span>
                            <span>${formData.items.reduce((sum, item) => sum + (item.quantity * item.price - item.discount), 0)}</span>
                        </div>
                    </div>
                )}

                <ModalFooter>
                    <button className="btn-secondary" onClick={() => { setIsModalOpen(false); setEditingInvoice(null); resetFormData() }}>Cancel</button>
                    <button className="btn-primary" onClick={handleSubmit}>{editingInvoice ? 'Update' : 'Create'}</button>
                </ModalFooter>
            </Modal>

            {/* Send Invoice Modal */}
            <Modal isOpen={!!sendModal} onClose={() => setSendModal(null)} title="Send Invoice" size="small">
                <p style={{ marginBottom: 24, color: 'var(--text-secondary)' }}>Send <strong>{sendModal?.invoiceNumber}</strong> to customer?</p>
                <ModalFooter>
                    <button className="btn-secondary" onClick={() => setSendModal(null)}>Cancel</button>
                    <button className="btn-primary" onClick={confirmSend}>Send</button>
                </ModalFooter>
            </Modal>

            {/* Payment Modal */}
            <Modal isOpen={!!payModal} onClose={() => setPayModal(null)} title="Record Payment" size="medium">
                <div className="payment-summary">
                    <div className="summary-item">
                        <span>Invoice Total</span>
                        <span>${payModal?.total}</span>
                    </div>
                    <div className="summary-item">
                        <span>Already Paid</span>
                        <span>${payModal?.paid}</span>
                    </div>
                    <div className="summary-item total">
                        <span>Balance Due</span>
                        <span>${payModal?.balance}</span>
                    </div>
                </div>
                <div className="form-grid">
                    <FormInput label="Payment Amount *" type="number" value={paymentData.amount} onChange={(e) => setPaymentData({ ...paymentData, amount: parseFloat(e.target.value) || 0 })} />
                    <FormSelect label="Payment Method" options={[
                        { value: 'bank_transfer', label: 'Bank Transfer' },
                        { value: 'credit_card', label: 'Credit Card' },
                        { value: 'cash', label: 'Cash' },
                        { value: 'check', label: 'Check' }
                    ]} value={paymentData.method} onChange={(e) => setPaymentData({ ...paymentData, method: e.target.value })} />
                </div>
                <FormInput label="Reference Number" value={paymentData.reference} onChange={(e) => setPaymentData({ ...paymentData, reference: e.target.value })} />
                <FormTextarea label="Notes" value={paymentData.notes} onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })} rows={2} />
                <ModalFooter>
                    <button className="btn-secondary" onClick={() => setPayModal(null)}>Cancel</button>
                    <button className="btn-primary" onClick={confirmPayment}>Record Payment</button>
                </ModalFooter>
            </Modal>

            {/* Delete Confirm Modal */}
            <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Invoice" size="small">
                <p style={{ marginBottom: 24, color: 'var(--text-secondary)' }}>Delete <strong>{deleteConfirm?.invoiceNumber}</strong>?</p>
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
                .invoice-number { font-family: 'JetBrains Mono', monospace; font-weight: 600; color: var(--accent-primary); }
                .amount { font-weight: 600; color: var(--text-primary); }
                .paid-amount { color: var(--success); }
                .balance-due { color: var(--error); font-weight: 600; }
                .balance-paid { color: var(--success); }
                .status-badge { display: inline-flex; align-items: center; padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; text-transform: capitalize; }
                .status-badge.draft { background: rgba(107, 114, 128, 0.15); color: var(--text-muted); }
                .status-badge.sent { background: rgba(59, 130, 246, 0.15); color: var(--info); }
                .status-badge.viewed { background: rgba(139, 92, 246, 0.15); color: #8b5cf6; }
                .status-badge.partial { background: rgba(245, 158, 11, 0.15); color: var(--warning); }
                .status-badge.paid { background: rgba(16, 185, 129, 0.15); color: var(--success); }
                .status-badge.overdue { background: rgba(239, 68, 68, 0.15); color: var(--error); }
                .action-buttons { display: flex; gap: 8px; }
                .action-btn { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
                .action-btn.send { background: rgba(59, 130, 246, 0.1); color: var(--info); }
                .action-btn.viewed { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }
                .action-btn.pay { background: rgba(16, 185, 129, 0.1); color: var(--success); }
                .action-btn.mark-paid { background: rgba(245, 158, 11, 0.1); color: var(--warning); }
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
                .invoice-summary { padding: 16px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); }
                .summary-row { display: flex; justify-content: space-between; padding: 8px 0; color: var(--text-secondary); }
                .summary-row.total { border-top: 1px solid var(--border-color); margin-top: 8px; padding-top: 12px; font-weight: 600; color: var(--text-primary); font-size: 1.1rem; }
                .payment-summary { padding: 16px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); margin-bottom: 20px; }
                .summary-item { display: flex; justify-content: space-between; padding: 8px 0; color: var(--text-secondary); }
                .summary-item.total { border-top: 1px solid var(--border-color); margin-top: 8px; padding-top: 12px; font-weight: 600; color: var(--text-primary); font-size: 1.1rem; }
            `}</style>
        </div>
    )
}

export default Invoices
