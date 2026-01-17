import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Truck, Package, CheckCircle, Clock, Send, Edit, Trash2, Eye } from 'lucide-react'
import { getInvoices, getSalesOrders } from '../../stores/salesStore'
import { getContacts } from '../../stores/crmStore'
import { useTallyShortcuts } from '../../hooks/useTallyShortcuts'
import DataTable from '../../components/DataTable'
import Modal, { ModalFooter } from '../../components/Modal'
import FormInput, { FormTextarea, FormSelect } from '../../components/FormInput'
import { useToast } from '../../components/Toast'

const statuses = [
    { value: 'draft', label: 'Draft' },
    { value: 'ready', label: 'Ready for Dispatch' },
    { value: 'dispatched', label: 'Dispatched' },
    { value: 'delivered', label: 'Delivered' }
]

// Mock data
const mockDeliveryNotes = [
    { id: 'dn-001', deliveryNumber: 'DN-2026-001', orderId: 'order-001', customerId: 'cont-001', dispatchDate: '2026-01-15', status: 'delivered', items: 3, totalQty: 25, driver: 'John Doe', vehicle: 'TRK-101', notes: 'Delivered on time' },
    { id: 'dn-002', deliveryNumber: 'DN-2026-002', orderId: 'order-002', customerId: 'cont-002', dispatchDate: '2026-01-16', status: 'dispatched', items: 2, totalQty: 15, driver: 'Mike Smith', vehicle: 'TRK-102', notes: 'In transit' },
    { id: 'dn-003', deliveryNumber: 'DN-2026-003', orderId: 'order-003', customerId: 'cont-003', dispatchDate: '', status: 'draft', items: 5, totalQty: 50, driver: '', vehicle: '', notes: '' }
]

function DeliveryNotes() {
    const toast = useToast()
    const [deliveryNotes, setDeliveryNotes] = useState(mockDeliveryNotes)
    const [contacts, setContacts] = useState([])
    const [orders, setOrders] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingNote, setEditingNote] = useState(null)
    const [filterStatus, setFilterStatus] = useState('')
    const [viewModal, setViewModal] = useState(null)

    const [formData, setFormData] = useState({
        orderId: '', customerId: '', dispatchDate: '', driver: '', vehicle: '', notes: '', items: []
    })

    useTallyShortcuts({
        create: () => setIsModalOpen(true),
        save: () => { if (isModalOpen) handleSubmit() }
    })

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setOrders(getSalesOrders())
        try {
            const contactsData = await getContacts()
            setContacts(Array.isArray(contactsData) ? contactsData : [])
        } catch (e) {
            setContacts([])
        }
    }

    const handleSubmit = () => {
        if (!formData.orderId) {
            toast.error('Please select an order')
            return
        }
        const newNote = {
            id: `dn-${Date.now()}`,
            deliveryNumber: `DN-2026-${String(deliveryNotes.length + 1).padStart(3, '0')}`,
            ...formData,
            status: 'draft',
            items: 1,
            totalQty: 10
        }
        setDeliveryNotes([...deliveryNotes, newNote])
        setIsModalOpen(false)
        resetForm()
        toast.success('Delivery note created')
    }

    const handleDispatch = (note) => {
        setDeliveryNotes(deliveryNotes.map(n =>
            n.id === note.id ? { ...n, status: 'dispatched', dispatchDate: new Date().toISOString().split('T')[0] } : n
        ))
        toast.success('Marked as dispatched')
    }

    const handleDeliver = (note) => {
        setDeliveryNotes(deliveryNotes.map(n =>
            n.id === note.id ? { ...n, status: 'delivered' } : n
        ))
        toast.success('Marked as delivered')
    }

    const resetForm = () => {
        setFormData({ orderId: '', customerId: '', dispatchDate: '', driver: '', vehicle: '', notes: '', items: [] })
        setEditingNote(null)
    }

    const getCustomerName = (id) => {
        const customer = contacts.find(c => c.id === id)
        return customer ? `${customer.firstName} ${customer.lastName}` : '-'
    }

    const filteredNotes = filterStatus
        ? deliveryNotes.filter(n => n.status === filterStatus)
        : deliveryNotes

    const stats = {
        total: deliveryNotes.length,
        draft: deliveryNotes.filter(n => n.status === 'draft').length,
        dispatched: deliveryNotes.filter(n => n.status === 'dispatched').length,
        delivered: deliveryNotes.filter(n => n.status === 'delivered').length
    }

    const columns = [
        { key: 'deliveryNumber', label: 'DN #', render: (v) => <span className="dn-number">{v}</span> },
        { key: 'customer', label: 'Customer', render: (_, row) => getCustomerName(row.customerId) },
        { key: 'items', label: 'Items', render: (v) => <span className="item-count">{v} items</span> },
        { key: 'totalQty', label: 'Qty' },
        { key: 'dispatchDate', label: 'Dispatch Date', render: (v) => v || '-' },
        {
            key: 'status', label: 'Status', render: (v) => (
                <span className={`status-badge ${v}`}>{v}</span>
            )
        },
        { key: 'driver', label: 'Driver', render: (v) => v || '-' },
        { key: 'vehicle', label: 'Vehicle', render: (v) => v || '-' },
        {
            key: 'actions', label: '', sortable: false, render: (_, row) => (
                <div className="action-buttons">
                    <button className="action-btn view" onClick={() => setViewModal(row)} title="View">
                        <Eye size={16} />
                    </button>
                    {row.status === 'draft' && (
                        <button className="action-btn dispatch" onClick={() => handleDispatch(row)} title="Dispatch">
                            <Truck size={16} />
                        </button>
                    )}
                    {row.status === 'dispatched' && (
                        <button className="action-btn deliver" onClick={() => handleDeliver(row)} title="Mark Delivered">
                            <CheckCircle size={16} />
                        </button>
                    )}
                </div>
            )
        }
    ]

    return (
        <div className="page">
            <motion.div className="page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <div>
                    <h1 className="page-title"><span className="gradient-text">Delivery Notes</span></h1>
                    <p className="page-description">Track shipments and delivery status.</p>
                </div>
                <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
                    <Plus size={20} /> New Delivery Note
                </button>
            </motion.div>

            <motion.div className="stats-grid" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="stat-card" onClick={() => setFilterStatus('')}>
                    <Package size={24} />
                    <div className="stat-info">
                        <span className="stat-value">{stats.total}</span>
                        <span className="stat-label">Total</span>
                    </div>
                </div>
                <div className="stat-card draft" onClick={() => setFilterStatus('draft')}>
                    <Clock size={24} />
                    <div className="stat-info">
                        <span className="stat-value">{stats.draft}</span>
                        <span className="stat-label">Draft</span>
                    </div>
                </div>
                <div className="stat-card dispatched" onClick={() => setFilterStatus('dispatched')}>
                    <Truck size={24} />
                    <div className="stat-info">
                        <span className="stat-value">{stats.dispatched}</span>
                        <span className="stat-label">Dispatched</span>
                    </div>
                </div>
                <div className="stat-card delivered" onClick={() => setFilterStatus('delivered')}>
                    <CheckCircle size={24} />
                    <div className="stat-info">
                        <span className="stat-value">{stats.delivered}</span>
                        <span className="stat-label">Delivered</span>
                    </div>
                </div>
            </motion.div>

            <DataTable columns={columns} data={filteredNotes} searchable exportable />

            {/* Create Modal */}
            <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); resetForm() }} title="New Delivery Note" size="medium">
                <div className="form-grid">
                    <FormSelect label="Sales Order *" options={orders.map(o => ({ value: o.id, label: o.orderNumber }))} value={formData.orderId} onChange={(e) => {
                        const order = orders.find(o => o.id === e.target.value)
                        setFormData({ ...formData, orderId: e.target.value, customerId: order?.customerId || '' })
                    }} />
                    <FormInput label="Dispatch Date" type="date" value={formData.dispatchDate} onChange={(e) => setFormData({ ...formData, dispatchDate: e.target.value })} />
                </div>
                <div className="form-grid">
                    <FormInput label="Driver" value={formData.driver} onChange={(e) => setFormData({ ...formData, driver: e.target.value })} />
                    <FormInput label="Vehicle" value={formData.vehicle} onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })} />
                </div>
                <FormTextarea label="Notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={2} />
                <ModalFooter>
                    <button className="btn-secondary" onClick={() => { setIsModalOpen(false); resetForm() }}>Cancel</button>
                    <button className="btn-primary" onClick={handleSubmit}>Create</button>
                </ModalFooter>
            </Modal>

            {/* View Modal */}
            <Modal isOpen={!!viewModal} onClose={() => setViewModal(null)} title={`Delivery Note: ${viewModal?.deliveryNumber}`} size="medium">
                {viewModal && (
                    <div className="view-details">
                        <div className="detail-row"><span>Customer:</span><strong>{getCustomerName(viewModal.customerId)}</strong></div>
                        <div className="detail-row"><span>Items:</span><strong>{viewModal.items} items ({viewModal.totalQty} qty)</strong></div>
                        <div className="detail-row"><span>Status:</span><span className={`status-badge ${viewModal.status}`}>{viewModal.status}</span></div>
                        <div className="detail-row"><span>Dispatch Date:</span><strong>{viewModal.dispatchDate || 'Not dispatched'}</strong></div>
                        <div className="detail-row"><span>Driver:</span><strong>{viewModal.driver || '-'}</strong></div>
                        <div className="detail-row"><span>Vehicle:</span><strong>{viewModal.vehicle || '-'}</strong></div>
                        <div className="detail-row"><span>Notes:</span><strong>{viewModal.notes || '-'}</strong></div>
                    </div>
                )}
                <ModalFooter>
                    <button className="btn-secondary" onClick={() => setViewModal(null)}>Close</button>
                </ModalFooter>
            </Modal>

            <style>{`
                .btn-primary { display: flex; align-items: center; gap: 8px; padding: 12px 20px; background: var(--accent-gradient); border-radius: var(--radius-md); color: white; }
                .btn-secondary { padding: 12px 20px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-secondary); }
                .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
                .stat-card { display: flex; align-items: center; gap: 16px; padding: 20px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); cursor: pointer; transition: all 0.2s ease; }
                .stat-card:hover { border-color: var(--accent-primary); transform: translateY(-2px); }
                .stat-card svg { color: var(--text-muted); }
                .stat-card.draft svg { color: var(--warning); }
                .stat-card.dispatched svg { color: var(--info); }
                .stat-card.delivered svg { color: var(--success); }
                .stat-info { display: flex; flex-direction: column; }
                .stat-value { font-size: 1.5rem; font-weight: 700; color: var(--text-primary); }
                .stat-label { font-size: 0.8rem; color: var(--text-muted); }
                .dn-number { font-family: 'JetBrains Mono', monospace; font-weight: 600; color: var(--accent-primary); }
                .item-count { padding: 4px 10px; background: rgba(99, 102, 241, 0.15); color: var(--accent-primary); border-radius: 12px; font-size: 0.75rem; }
                .status-badge { padding: 4px 12px; border-radius: 12px; font-size: 0.75rem; text-transform: capitalize; }
                .status-badge.draft { background: rgba(107, 114, 128, 0.15); color: var(--text-muted); }
                .status-badge.ready { background: rgba(245, 158, 11, 0.15); color: var(--warning); }
                .status-badge.dispatched { background: rgba(59, 130, 246, 0.15); color: var(--info); }
                .status-badge.delivered { background: rgba(16, 185, 129, 0.15); color: var(--success); }
                .action-buttons { display: flex; gap: 8px; }
                .action-btn { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
                .action-btn.view { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }
                .action-btn.dispatch { background: rgba(59, 130, 246, 0.1); color: var(--info); }
                .action-btn.deliver { background: rgba(16, 185, 129, 0.1); color: var(--success); }
                .form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 16px; }
                .view-details { display: flex; flex-direction: column; gap: 12px; }
                .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border-color); }
                .detail-row span:first-child { color: var(--text-muted); }
            `}</style>
        </div>
    )
}

export default DeliveryNotes
