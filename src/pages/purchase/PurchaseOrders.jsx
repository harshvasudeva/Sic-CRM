import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Filter, Edit, Trash2, ShoppingBag, Check, FileText, AlertCircle, PackageCheck, ShieldAlert } from 'lucide-react'
import { getPurchaseOrders, deletePurchaseOrder, createPurchaseOrder, updatePurchaseOrder, issuePurchaseOrder, receivePurchaseOrder, getVendors } from '../../stores/purchaseStore'
import { receiveStockFromPO, getInventoryProducts } from '../../stores/inventoryStore'
import { formatCurrency } from '../../stores/settingsStore'
import { formatWithConversion, getBaseCurrency } from '../../stores/currencyStore'
import { requiresApproval, getApprovalForDocument, APPROVAL_STATUSES } from '../../stores/approvalStore'
import { ApprovalStatusBadge } from '../../components/ApprovalBadge'
import ApprovalPanel from '../../components/ApprovalBadge'
import DataTable from '../../components/DataTable'
import Modal, { ModalFooter } from '../../components/Modal'
import FormInput, { FormTextarea, FormSelect } from '../../components/FormInput'
import { useToast } from '../../components/Toast'

const statuses = [
    { value: 'draft', label: 'Draft' },
    { value: 'pending_approval', label: 'Pending Approval' },
    { value: 'issued', label: 'Issued' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'received', label: 'Received' },
    { value: 'cancelled', label: 'Cancelled' }
]

function PurchaseOrders() {
    const toast = useToast()
    const [orders, setOrders] = useState([])
    const [vendors, setVendors] = useState([])
    const [products, setProducts] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingOrder, setEditingOrder] = useState(null)
    const [deleteConfirm, setDeleteConfirm] = useState(null)
    const [issueModal, setIssueModal] = useState(null)
    const [filterStatus, setFilterStatus] = useState('')
    const [filterVendor, setFilterVendor] = useState('')

    const [formData, setFormData] = useState({
        vendorId: '', orderNumber: '', orderDate: '', expectedDelivery: '',
        items: [], shippingCost: 0, currency: getBaseCurrency(), paymentTerms: '', notes: ''
    })
    const [approvalModalOrder, setApprovalModalOrder] = useState(null)

    const [itemData, setItemData] = useState({
        productId: '', name: '', description: '', quantity: 1, unitPrice: 0, discount: 0, tax: 0
    })

    const loadData = () => {
        const filters = {}
        if (filterStatus) filters.status = filterStatus
        if (filterVendor) filters.vendorId = filterVendor
        setOrders(getPurchaseOrders(filters))
        setVendors(getVendors())
        setProducts(getInventoryProducts())
    }

    useEffect(() => { loadData() }, [filterStatus, filterVendor])

    const handleSubmit = () => {
        if (!formData.vendorId || formData.items.length === 0) {
            toast.error('Vendor and items are required')
            return
        }

        if (editingOrder) {
            updatePurchaseOrder(editingOrder.id, formData)
            toast.success('Purchase order updated')
        } else {
            createPurchaseOrder(formData)
            toast.success('Purchase order created')
        }
        setIsModalOpen(false)
        setEditingOrder(null)
        resetFormData()
        loadData()
    }

    const handleEdit = (order) => {
        setEditingOrder(order)
        setFormData({
            vendorId: order.vendorId,
            orderNumber: order.orderNumber,
            orderDate: order.orderDate,
            expectedDelivery: order.expectedDelivery,
            items: order.items,
            shippingCost: order.shippingCost,
            currency: order.currency,
            paymentTerms: order.paymentTerms,
            notes: order.notes
        })
        setIsModalOpen(true)
    }

    const handleIssue = (order) => {
        setIssueModal(order)
    }

    const confirmIssue = () => {
        issuePurchaseOrder(issueModal.id)
        toast.success('Purchase order issued to vendor')
        setIssueModal(null)
        loadData()
    }

    const confirmDelete = () => {
        if (deleteConfirm) {
            deletePurchaseOrder(deleteConfirm.id)
            toast.success('Purchase order deleted')
            setDeleteConfirm(null)
            loadData()
        }
    }

    const addItem = () => {
        if (!itemData.name || itemData.unitPrice <= 0) {
            toast.error('Item name and unit price are required')
            return
        }
        const newItem = {
            ...itemData,
            id: `item-${Date.now()}`,
            total: (itemData.quantity * itemData.unitPrice) - itemData.discount + itemData.tax
        }
        setFormData({ ...formData, items: [...formData.items, newItem] })
        setItemData({ productId: '', name: '', description: '', quantity: 1, unitPrice: 0, discount: 0, tax: 0 })
    }

    const removeItem = (index) => {
        setFormData({ ...formData, items: formData.items.filter((_, i) => i !== index) })
    }

    const resetFormData = () => {
        setFormData({
            vendorId: '', orderNumber: '', orderDate: '', expectedDelivery: '',
            items: [], shippingCost: 0, currency: getBaseCurrency(), paymentTerms: '', notes: ''
        })
    }

    const handleReceive = (order) => {
        if (confirm(`Receive all items for ${order.orderNumber}?`)) {
            receivePurchaseOrder(order.id)
            receiveStockFromPO(order)
            toast.success('Items received and inventory updated')
            loadData()
        }
    }

    const columns = [
        { key: 'orderNumber', label: 'PO #', render: (v) => <span className="po-number">{v}</span> },
        {
            key: 'vendorName', label: 'Vendor', render: (_, row) => {
                const vendor = getVendors().find(v => v.id === row.vendorId)
                return vendor ? vendor.name : '-'
            }
        },
        {
            key: 'total', label: 'Total', render: (v, row) => (
                <div>
                    <span className="amount">{formatCurrency(v)}</span>
                    {row.currency && row.currency !== getBaseCurrency() && (
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            {formatWithConversion(v, row.currency)}
                        </div>
                    )}
                </div>
            )
        },
        { key: 'expectedDelivery', label: 'Expected' },
        {
            key: 'status', label: 'Status', render: (v, row) => (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <span className={`status-badge ${v}`}>{v}</span>
                    {requiresApproval(row.total, row.currency) && (
                        <ApprovalStatusBadge documentId={row.id} documentType="purchase_order" />
                    )}
                </div>
            )
        },
        { key: 'createdAt', label: 'Created' },
        {
            key: 'actions', label: '', sortable: false,
            render: (_, row) => {
                const needsApproval = requiresApproval(row.total, row.currency)
                const approval = needsApproval ? getApprovalForDocument(row.id, 'purchase_order') : null
                const isApproved = approval?.status === APPROVAL_STATUSES.APPROVED
                const canIssue = row.status === 'draft' && (!needsApproval || isApproved)

                return (
                    <div className="action-buttons">
                        {row.status === 'draft' && needsApproval && !isApproved && (
                            <button className="action-btn" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}
                                onClick={() => setApprovalModalOrder(row)} title="Approval Required">
                                <ShieldAlert size={16} />
                            </button>
                        )}
                        {canIssue && (
                            <button className="action-btn issue" onClick={() => handleIssue(row)} title="Issue PO"><FileText size={16} /></button>
                        )}
                        {row.status === 'issued' && (
                            <button className="action-btn receive" onClick={() => handleReceive(row)} title="Receive Items"><PackageCheck size={16} /></button>
                        )}
                        {!['received', 'cancelled'].includes(row.status) && (
                            <button className="action-btn edit" onClick={() => handleEdit(row)}><Edit size={16} /></button>
                        )}
                        <button className="action-btn delete" onClick={() => setDeleteConfirm(row)}><Trash2 size={16} /></button>
                    </div>
                )
            }
        }
    ]

    return (
        <div className="page">
            <motion.div className="page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <div>
                    <h1 className="page-title"><span className="gradient-text">Purchase</span> Orders</h1>
                    <p className="page-description">Manage purchase orders and vendor procurement.</p>
                </div>
                <button className="btn-primary" onClick={() => setIsModalOpen(true)}><Plus size={20} /> New PO</button>
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
                    <select value={filterVendor} onChange={(e) => setFilterVendor(e.target.value)}>
                        <option value="">All Vendors</option>
                        {vendors.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                    </select>
                </div>
                <div className="filter-stats">{orders.length} orders</div>
            </div>

            <DataTable columns={columns} data={orders} searchable exportable />

            {/* Add/Edit Modal */}
            <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingOrder(null); resetFormData() }} title={editingOrder ? 'Edit Purchase Order' : 'New Purchase Order'} size="large">
                <div className="form-grid">
                    <FormSelect label="Vendor *" options={vendors.map(v => ({ value: v.id, label: v.name }))} value={formData.vendorId} onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })} />
                    <FormInput label="Expected Delivery" type="date" value={formData.expectedDelivery} onChange={(e) => setFormData({ ...formData, expectedDelivery: e.target.value })} />
                </div>

                <div className="items-section">
                    <h3>Items</h3>
                    <div className="items-list">
                        {formData.items.map((item, index) => (
                            <div key={index} className="item-row">
                                <div className="item-info">
                                    <div className="item-name">{item.name}</div>
                                    <div className="item-details">{item.quantity} x {formatCurrency(item.unitPrice)}</div>
                                </div>
                                <div className="item-total">{formatCurrency(item.total)}</div>
                                <button className="item-remove" onClick={() => removeItem(index)}><Trash2 size={14} /></button>
                            </div>
                        ))}
                    </div>
                    <div className="add-item-form">
                        <div className="form-grid">
                            <FormSelect
                                label="Product"
                                options={[{ value: '', label: 'Select Product' }, ...products.map(p => ({ value: p.id, label: `${p.sku} - ${p.name}` }))]}
                                value={itemData.productId}
                                onChange={(e) => {
                                    const prod = products.find(p => p.id === e.target.value)
                                    if (prod) {
                                        setItemData({
                                            ...itemData,
                                            productId: prod.id,
                                            name: prod.name,
                                            description: prod.description,
                                            unitPrice: prod.cost
                                        })
                                    } else {
                                        setItemData({ ...itemData, productId: '', name: '', description: '', unitPrice: 0 })
                                    }
                                }}
                            />
                            <FormInput label="Item Name" value={itemData.name} onChange={(e) => setItemData({ ...itemData, name: e.target.value })} />
                            <FormInput label="Description" value={itemData.description} onChange={(e) => setItemData({ ...itemData, description: e.target.value })} />
                            <FormInput label="Quantity" type="number" value={itemData.quantity} onChange={(e) => setItemData({ ...itemData, quantity: parseInt(e.target.value) || 1 })} />
                            <FormInput label="Unit Price" type="number" value={itemData.unitPrice} onChange={(e) => setItemData({ ...itemData, unitPrice: parseFloat(e.target.value) || 0 })} />
                            <FormInput label="Discount" type="number" value={itemData.discount} onChange={(e) => setItemData({ ...itemData, discount: parseFloat(e.target.value) || 0 })} />
                            <FormInput label="Tax Amount" type="number" value={itemData.tax} onChange={(e) => setItemData({ ...itemData, tax: parseFloat(e.target.value) || 0 })} />
                        </div>
                        <button className="btn-secondary add-item-btn" onClick={addItem}>+ Add Item</button>
                    </div>
                </div>

                <div className="form-grid">
                    <FormInput label="Shipping Cost" type="number" value={formData.shippingCost} onChange={(e) => setFormData({ ...formData, shippingCost: parseFloat(e.target.value) || 0 })} />
                    <FormInput label="Currency" value={formData.currency} onChange={(e) => setFormData({ ...formData, currency: e.target.value })} />
                </div>
                <FormInput label="Payment Terms" value={formData.paymentTerms} onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })} />
                <FormTextarea label="Notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={2} />

                {formData.items.length > 0 && (
                    <div className="order-summary">
                        <div className="summary-row">
                            <span>Subtotal</span>
                            <span>{formatCurrency(formData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0))}</span>
                        </div>
                        <div className="summary-row">
                            <span>Discount</span>
                            <span>-${formData.items.reduce((sum, item) => sum + item.discount, 0)}</span>
                        </div>
                        <div className="summary-row">
                            <span>Tax</span>
                            <span>{formatCurrency(formData.items.reduce((sum, item) => sum + item.tax, 0))}</span>
                        </div>
                        <div className="summary-row total">
                            <span>Total</span>
                            <span>{formatCurrency(formData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice - item.discount + item.tax), 0) + (formData.shippingCost || 0))}</span>
                        </div>
                    </div>
                )}

                <ModalFooter>
                    <button className="btn-secondary" onClick={() => { setIsModalOpen(false); setEditingOrder(null); resetFormData() }}>Cancel</button>
                    <button className="btn-primary" onClick={handleSubmit}>{editingOrder ? 'Update' : 'Create'}</button>
                </ModalFooter>
            </Modal>

            {/* Issue PO Modal */}
            <Modal isOpen={!!issueModal} onClose={() => setIssueModal(null)} title="Issue Purchase Order" size="small">
                <p style={{ marginBottom: 24, color: 'var(--text-secondary)' }}>Issue <strong>{issueModal?.orderNumber}</strong> to vendor?</p>
                <ModalFooter>
                    <button className="btn-secondary" onClick={() => setIssueModal(null)}>Cancel</button>
                    <button className="btn-primary" onClick={confirmIssue}>Issue</button>
                </ModalFooter>
            </Modal>

            {/* Delete Confirm Modal */}
            <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Purchase Order" size="small">
                <p style={{ marginBottom: 24, color: 'var(--text-secondary)' }}>Delete <strong>{deleteConfirm?.orderNumber}</strong>?</p>
                <ModalFooter>
                    <button className="btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                    <button className="btn-danger" onClick={confirmDelete}>Delete</button>
                </ModalFooter>
            </Modal>

            {/* Approval Modal */}
            <Modal isOpen={!!approvalModalOrder} onClose={() => setApprovalModalOrder(null)} title="Purchase Order Approval" size="medium">
                {approvalModalOrder && (
                    <div>
                        <div style={{ marginBottom: 16 }}>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 4 }}>PO Number</div>
                            <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{approvalModalOrder.orderNumber}</div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                            <div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 4 }}>Amount</div>
                                <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--success)' }}>
                                    {formatCurrency(approvalModalOrder.total)}
                                </div>
                                {approvalModalOrder.currency && approvalModalOrder.currency !== getBaseCurrency() && (
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                        {formatWithConversion(approvalModalOrder.total, approvalModalOrder.currency)}
                                    </div>
                                )}
                            </div>
                            <div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 4 }}>Currency</div>
                                <div style={{ fontSize: '1.1rem', fontWeight: 500 }}>{approvalModalOrder.currency || getBaseCurrency()}</div>
                            </div>
                        </div>
                        <ApprovalPanel
                            documentId={approvalModalOrder.id}
                            documentType="purchase_order"
                            amount={approvalModalOrder.total}
                            currency={approvalModalOrder.currency || getBaseCurrency()}
                            onStatusChange={(status) => {
                                if (status === 'approved') {
                                    toast.success('Purchase order approved')
                                } else if (status === 'rejected') {
                                    toast.error('Purchase order rejected')
                                }
                                loadData()
                            }}
                        />
                    </div>
                )}
                <ModalFooter>
                    <button className="btn-secondary" onClick={() => setApprovalModalOrder(null)}>Close</button>
                </ModalFooter>
            </Modal>

            <style>{`
                .btn-primary { display: flex; align-items: center; gap: 8px; padding: 12px 20px; background: var(--accent-gradient); border-radius: var(--radius-md); color: white; }
                .btn-secondary { padding: 12px 20px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-secondary); }
                .btn-danger { padding: 12px 20px; background: var(--error); border-radius: var(--radius-md); color: white; }
                .filters-bar { display: flex; gap: 16px; margin-bottom: 24px; }
                .filter-group { display: flex; align-items: center; gap: 8px; padding: 8px 14px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); }
                .filter-group svg { color: var(--text-muted); }
                .filter-group select { background: transparent; border: none; color: var(--text-primary); }
                .filter-stats { margin-left: auto; color: var(--text-muted); }
                .form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
                .po-number { font-family: 'JetBrains Mono', monospace; font-weight: 600; color: var(--accent-primary); }
                .amount { font-weight: 600; color: var(--success); }
                .status-badge { padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; text-transform: capitalize; }
                .status-badge.draft { background: rgba(107, 114, 128, 0.15); color: var(--text-muted); }
                .status-badge.issued { background: rgba(59, 130, 246, 0.15); color: var(--info); }
                .status-badge.confirmed { background: rgba(139, 92, 246, 0.15); color: #8b5cf6; }
                .status-badge.shipped { background: rgba(245, 158, 11, 0.15); color: var(--warning); }
                .status-badge.received { background: rgba(16, 185, 129, 0.15); color: var(--success); }
                .status-badge.cancelled { background: rgba(239, 68, 68, 0.15); color: var(--error); }
                .status-badge.pending_approval { background: rgba(245, 158, 11, 0.15); color: var(--warning); }
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
                .action-buttons { display: flex; gap: 8px; }
                .action-btn { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
                .action-btn.issue { background: rgba(16, 185, 129, 0.1); color: var(--success); }
                .action-btn.receive { background: rgba(245, 158, 11, 0.1); color: var(--warning); }
                .action-btn.edit { background: rgba(59, 130, 246, 0.1); color: var(--info); }
                .action-btn.delete { background: rgba(239, 68, 68, 0.1); color: var(--error); }
            `}</style>
        </div>
    )
}

export default PurchaseOrders
