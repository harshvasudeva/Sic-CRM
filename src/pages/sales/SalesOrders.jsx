import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Filter, Edit, Trash2, ShoppingCart, CheckCircle, Truck, Clock, XCircle } from 'lucide-react'
import { getSalesOrders, deleteSalesOrder, createSalesOrder, updateSalesOrder, confirmSalesOrder, deliverSalesOrder } from '../../stores/salesStore'
import { getContacts } from '../../stores/crmStore'
import DataTable from '../../components/DataTable'
import Modal, { ModalFooter } from '../../components/Modal'
import FormInput, { FormTextarea, FormSelect } from '../../components/FormInput'
import { useToast } from '../../components/Toast'

const statuses = [
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
]

function SalesOrders() {
    const toast = useToast()
    const [orders, setOrders] = useState([])
    const [contacts, setContacts] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingOrder, setEditingOrder] = useState(null)
    const [deleteConfirm, setDeleteConfirm] = useState(null)
    const [confirmModal, setConfirmModal] = useState(null)
    const [deliveryModal, setDeliveryModal] = useState(null)
    const [filterStatus, setFilterStatus] = useState('')
    const [filterCustomer, setFilterCustomer] = useState('')

    const [formData, setFormData] = useState({
        customerId: '', notes: '', paymentTerms: 'Net 30', expectedDelivery: '', 
        shippingAddress: '', billingAddress: '', items: []
    })

    const [itemData, setItemData] = useState({
        name: '', description: '', quantity: 1, price: 0, discount: 0
    })

    const [deliveryData, setDeliveryData] = useState({
        deliveryDate: '', notes: ''
    })

    const loadData = () => {
        const filters = {}
        if (filterStatus) filters.status = filterStatus
        if (filterCustomer) filters.customerId = filterCustomer
        setOrders(getSalesOrders(filters))
        setContacts(getContacts())
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

        const orderData = {
            ...formData,
            subtotal,
            discount,
            tax,
            total
        }

        if (editingOrder) {
            updateSalesOrder(editingOrder.id, orderData)
            toast.success('Order updated')
        } else {
            createSalesOrder(orderData)
            toast.success('Order created')
        }
        setIsModalOpen(false)
        setEditingOrder(null)
        resetFormData()
        loadData()
    }

    const handleEdit = (order) => {
        setEditingOrder(order)
        setFormData({
            customerId: order.customerId,
            notes: order.notes,
            paymentTerms: order.paymentTerms,
            expectedDelivery: order.expectedDelivery,
            shippingAddress: order.shippingAddress,
            billingAddress: order.billingAddress,
            items: order.items
        })
        setIsModalOpen(true)
    }

    const handleConfirm = (order) => {
        setConfirmModal(order)
    }

    const confirmOrder = () => {
        confirmSalesOrder(confirmModal.id)
        toast.success('Order confirmed')
        setConfirmModal(null)
        loadData()
    }

    const handleDelivery = (order) => {
        setDeliveryModal(order)
        setDeliveryData({ deliveryDate: new Date().toISOString().split('T')[0], notes: '' })
    }

    const confirmDelivery = () => {
        deliverSalesOrder(deliveryModal.id, deliveryData)
        toast.success('Order marked as delivered')
        setDeliveryModal(null)
        loadData()
    }

    const handleCancel = (order) => {
        updateSalesOrder(order.id, { status: 'cancelled' })
        toast.success('Order cancelled')
        loadData()
    }

    const confirmDelete = () => {
        if (deleteConfirm) {
            deleteSalesOrder(deleteConfirm.id)
            toast.success('Order deleted')
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
            customerId: '', notes: '', paymentTerms: 'Net 30', expectedDelivery: '', 
            shippingAddress: '', billingAddress: '', items: []
        })
    }

    const getStatusIcon = (status) => {
        const icons = {
            pending: Clock,
            confirmed: CheckCircle,
            processing: ShoppingCart,
            shipped: Truck,
            delivered: CheckCircle,
            cancelled: XCircle
        }
        return icons[status] || Clock
    }

    const columns = [
        {
            key: 'orderNumber', label: 'Order #',
            render: (value) => <span className="order-number">{value}</span>
        },
        { key: 'customerName', label: 'Customer', render: (_, row) => {
            const customer = getContacts().find(c => c.id === row.customerId)
            return customer ? `${customer.firstName} ${customer.lastName}` : '-'
        }},
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
        { key: 'orderDate', label: 'Order Date' },
        { key: 'expectedDelivery', label: 'Expected Delivery' },
        { key: 'actualDelivery', label: 'Actual Delivery', render: (v) => v || '-' },
        {
            key: 'actions', label: '', sortable: false,
            render: (_, row) => (
                <div className="action-buttons">
                    {row.status === 'pending' && (
                        <button className="action-btn confirm" onClick={() => handleConfirm(row)} title="Confirm Order"><CheckCircle size={16} /></button>
                    )}
                    {row.status === 'confirmed' && (
                        <button className="action-btn deliver" onClick={() => handleDelivery(row)} title="Mark Delivered"><Truck size={16} /></button>
                    )}
                    {!['delivered', 'cancelled'].includes(row.status) && (
                        <button className="action-btn edit" onClick={() => handleEdit(row)}><Edit size={16} /></button>
                    )}
                    {!['delivered', 'cancelled'].includes(row.status) && (
                        <button className="action-btn cancel" onClick={() => handleCancel(row)} title="Cancel Order"><XCircle size={16} /></button>
                    )}
                    <button className="action-btn delete" onClick={() => setDeleteConfirm(row)}><Trash2 size={16} /></button>
                </div>
            )
        }
    ]

    return (
        <div className="page">
            <motion.div className="page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <div>
                    <h1 className="page-title"><span className="gradient-text">Sales Orders</span></h1>
                    <p className="page-description">Manage customer orders and deliveries.</p>
                </div>
                <button className="btn-primary" onClick={() => setIsModalOpen(true)}><Plus size={20} /> New Order</button>
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
                <div className="filter-stats">{orders.length} orders</div>
            </div>

            <DataTable columns={columns} data={orders} searchable exportable />

            {/* Add/Edit Modal */}
            <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingOrder(null); resetFormData() }} title={editingOrder ? 'Edit Order' : 'New Order'} size="large">
                <div className="form-grid">
                    <FormSelect label="Customer *" options={contacts.map(c => ({ value: c.id, label: `${c.firstName} ${c.lastName}` }))} value={formData.customerId} onChange={(e) => setFormData({ ...formData, customerId: e.target.value })} />
                    <FormInput label="Expected Delivery" type="date" value={formData.expectedDelivery} onChange={(e) => setFormData({ ...formData, expectedDelivery: e.target.value })} />
                    <FormInput label="Payment Terms" value={formData.paymentTerms} onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })} />
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
                    <FormTextarea label="Shipping Address" value={formData.shippingAddress} onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })} rows={2} />
                    <FormTextarea label="Billing Address" value={formData.billingAddress} onChange={(e) => setFormData({ ...formData, billingAddress: e.target.value })} rows={2} />
                </div>
                <FormTextarea label="Notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={2} />

                {formData.items.length > 0 && (
                    <div className="order-summary">
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
                    <button className="btn-secondary" onClick={() => { setIsModalOpen(false); setEditingOrder(null); resetFormData() }}>Cancel</button>
                    <button className="btn-primary" onClick={handleSubmit}>{editingOrder ? 'Update' : 'Create'}</button>
                </ModalFooter>
            </Modal>

            {/* Confirm Order Modal */}
            <Modal isOpen={!!confirmModal} onClose={() => setConfirmModal(null)} title="Confirm Order" size="small">
                <p style={{ marginBottom: 24, color: 'var(--text-secondary)' }}>Confirm <strong>{confirmModal?.orderNumber}</strong>?</p>
                <ModalFooter>
                    <button className="btn-secondary" onClick={() => setConfirmModal(null)}>Cancel</button>
                    <button className="btn-primary" onClick={confirmOrder}>Confirm</button>
                </ModalFooter>
            </Modal>

            {/* Delivery Modal */}
            <Modal isOpen={!!deliveryModal} onClose={() => setDeliveryModal(null)} title="Mark as Delivered" size="medium">
                <FormInput label="Delivery Date" type="date" value={deliveryData.deliveryDate} onChange={(e) => setDeliveryData({ ...deliveryData, deliveryDate: e.target.value })} />
                <FormTextarea label="Delivery Notes" value={deliveryData.notes} onChange={(e) => setDeliveryData({ ...deliveryData, notes: e.target.value })} rows={3} />
                <ModalFooter>
                    <button className="btn-secondary" onClick={() => setDeliveryModal(null)}>Cancel</button>
                    <button className="btn-primary" onClick={confirmDelivery}>Mark Delivered</button>
                </ModalFooter>
            </Modal>

            {/* Delete Confirm Modal */}
            <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Order" size="small">
                <p style={{ marginBottom: 24, color: 'var(--text-secondary)' }}>Delete <strong>{deleteConfirm?.orderNumber}</strong>?</p>
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
                .order-number { font-family: 'JetBrains Mono', monospace; font-weight: 600; color: var(--accent-primary); }
                .amount { font-weight: 600; color: var(--success); }
                .status-badge { display: inline-flex; align-items: center; padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; text-transform: capitalize; }
                .status-badge.pending { background: rgba(107, 114, 128, 0.15); color: var(--text-muted); }
                .status-badge.confirmed { background: rgba(59, 130, 246, 0.15); color: var(--info); }
                .status-badge.processing { background: rgba(139, 92, 246, 0.15); color: #8b5cf6; }
                .status-badge.shipped { background: rgba(245, 158, 11, 0.15); color: var(--warning); }
                .status-badge.delivered { background: rgba(16, 185, 129, 0.15); color: var(--success); }
                .status-badge.cancelled { background: rgba(239, 68, 68, 0.15); color: var(--error); }
                .action-buttons { display: flex; gap: 8px; }
                .action-btn { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
                .action-btn.confirm { background: rgba(16, 185, 129, 0.1); color: var(--success); }
                .action-btn.deliver { background: rgba(245, 158, 11, 0.1); color: var(--warning); }
                .action-btn.edit { background: rgba(59, 130, 246, 0.1); color: var(--info); }
                .action-btn.cancel { background: rgba(239, 68, 68, 0.1); color: var(--error); }
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
                .order-summary { padding: 16px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); }
                .summary-row { display: flex; justify-content: space-between; padding: 8px 0; color: var(--text-secondary); }
                .summary-row.total { border-top: 1px solid var(--border-color); margin-top: 8px; padding-top: 12px; font-weight: 600; color: var(--text-primary); font-size: 1.1rem; }
            `}</style>
        </div>
    )
}

export default SalesOrders
