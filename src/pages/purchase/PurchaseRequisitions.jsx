import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, CheckCircle } from 'lucide-react'
import DataTable from '../../components/DataTable'
import Modal, { ModalFooter } from '../../components/Modal'
import FormInput, { FormTextarea, FormSelect } from '../../components/FormInput'
import { useToast } from '../../components/Toast'
import { getPurchaseRequisitions, createPurchaseRequisition, approvePurchaseRequisition, updatePurchaseRequisition, deletePurchaseRequisition, getVendors } from '../../stores/purchaseStore'

function PurchaseRequisitions() {
    const toast = useToast()
    const [requisitions, setRequisitions] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editItem, setEditItem] = useState(null)
    const [formData, setFormData] = useState({
        requestDate: '', requiredBy: '', items: [], totalAmount: 0, priority: 'medium', status: 'pending', notes: '', vendorId: ''
    })

    useEffect(() => {
        loadData()
    }, [])

    const loadData = () => {
        setRequisitions(getPurchaseRequisitions())
    }

    const handleAdd = () => {
        setFormData({
            requestDate: new Date().toISOString().split('T')[0],
            requiredBy: '',
            items: [],
            totalAmount: 0,
            priority: 'medium',
            status: 'pending',
            notes: '',
            vendorId: ''
        })
        setEditItem(null)
        setIsModalOpen(true)
    }

    const handleEdit = (item) => {
        setFormData({ ...item })
        setEditItem(item)
        setIsModalOpen(true)
    }

    const handleSave = () => {
        if (editItem) {
            updatePurchaseRequisition(editItem.id, formData)
            toast.success('Requisition updated')
        } else {
            createPurchaseRequisition(formData)
            toast.success('Requisition created')
        }
        setIsModalOpen(false)
        setEditItem(null)
        loadData()
    }

    const handleApprove = (id) => {
        approvePurchaseRequisition(id, 'user')
        toast.success('Requisition approved')
        loadData()
    }

    const handleDelete = (id) => {
        if (confirm('Are you sure?')) {
            deletePurchaseRequisition(id)
            toast.success('Requisition deleted')
            loadData()
        }
    }

    const columns = [
        { key: 'number', label: 'Number', render: (v) => <span className="req-number">{v}</span> },
        { key: 'requestDate', label: 'Request Date', render: (v) => <span>{new Date(v).toLocaleDateString()}</span> },
        { key: 'requiredBy', label: 'Required By', render: (v) => <span>{new Date(v).toLocaleDateString()}</span> },
        { key: 'totalAmount', label: 'Amount', render: (v) => <span className="amount">${v.toLocaleString()}</span> },
        { key: 'priority', label: 'Priority', render: (v) => (
            <span className={`priority-badge ${v}`}>
                {v.charAt(0).toUpperCase() + v.slice(1)}
            </span>
        )},
        { key: 'status', label: 'Status', render: (v) => (
            <span className={`status-badge ${v}`}>
                {v.charAt(0).toUpperCase() + v.slice(1)}
            </span>
        )},
        { key: 'vendorId', label: 'Vendor', render: (v) => {
            const vendor = getVendors().find(v => v.id === v)
            return vendor ? vendor.name : '-'
        }},
        { key: 'actions', label: 'Actions', render: (_, row) => (
            <div className="action-buttons">
                {row.status === 'pending' && (
                    <button className="btn-approve" onClick={() => handleApprove(row.id)}>
                        <CheckCircle size={16} />
                    </button>
                )}
                <button className="btn-edit" onClick={() => handleEdit(row)}>
                    Edit
                </button>
                <button className="btn-delete" onClick={() => handleDelete(row.id)}>
                    Delete
                </button>
            </div>
        )}
    ]

    return (
        <div className="page">
            <motion.div className="page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <div>
                    <h1 className="page-title"><span className="gradient-text">Purchase</span> Requisitions</h1>
                    <p className="page-description">
                        Create and manage purchase requisitions for inventory and materials.
                    </p>
                </div>
                <button className="btn-primary" onClick={handleAdd}>
                    <Plus size={20} /> Create Requisition
                </button>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <DataTable columns={columns} data={requisitions} searchable exportable />
            </motion.div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editItem ? 'Edit Requisition' : 'Create Requisition'} size="large">
                <div className="form-grid">
                    <FormInput label="Request Date *" type="date" value={formData.requestDate} onChange={(e) => setFormData({ ...formData, requestDate: e.target.value })} />
                    <FormInput label="Required By *" type="date" value={formData.requiredBy} onChange={(e) => setFormData({ ...formData, requiredBy: e.target.value })} />
                </div>
                <div className="form-grid">
                    <FormInput label="Total Amount *" type="number" placeholder="0" value={formData.totalAmount} onChange={(e) => setFormData({ ...formData, totalAmount: parseFloat(e.target.value) || 0 })} />
                    <FormSelect label="Priority *" options={[
                        { value: 'low', label: 'Low' },
                        { value: 'medium', label: 'Medium' },
                        { value: 'high', label: 'High' },
                        { value: 'urgent', label: 'Urgent' }
                    ]} value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} />
                </div>
                <div className="form-grid">
                    <FormSelect label="Vendor" options={getVendors().map(v => ({ value: v.id, label: v.name }))} value={formData.vendorId} onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })} />
                    <FormInput label="Status" readOnly value={formData.status} />
                </div>
                <FormTextarea label="Notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={3} placeholder="Additional notes or justification..." />
                <ModalFooter>
                    <button className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                    <button className="btn-primary" onClick={handleSave}>{editItem ? 'Update' : 'Create'} Requisition</button>
                </ModalFooter>
            </Modal>

            <style>{`
                .btn-primary { display: flex; align-items: center; gap: 8px; padding: 12px 20px; background: var(--accent-gradient); border-radius: var(--radius-md); color: white; border: none; cursor: pointer; font-weight: 600; }
                .btn-secondary { padding: 12px 20px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-secondary); cursor: pointer; }
                .req-number { font-family: 'JetBrains Mono', monospace; font-weight: 600; color: var(--accent-primary); }
                .priority-badge { padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; text-transform: capitalize; }
                .priority-badge.low { background: rgba(34, 197, 94, 0.15); color: #22c55e; }
                .priority-badge.medium { background: rgba(251, 191, 36, 0.15); color: #fbbf24; }
                .priority-badge.high { background: rgba(249, 115, 22, 0.15); color: #f97316; }
                .priority-badge.urgent { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
                .status-badge { padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; text-transform: capitalize; }
                .status-badge.pending { background: rgba(251, 191, 36, 0.15); color: #fbbf24; }
                .status-badge.approved { background: rgba(34, 197, 94, 0.15); color: #22c55e; }
                .status-badge.rejected { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
                .status-badge.cancelled { background: rgba(156, 163, 175, 0.15); color: #9ca3af; }
                .amount { font-weight: 600; color: var(--success); }
                .action-buttons { display: flex; gap: 8px; }
                .btn-approve { display: flex; align-items: center; gap: 6px; padding: 8px 12px; background: var(--success); border: none; border-radius: 8px; color: white; cursor: pointer; font-size: 0.85rem; }
                .btn-edit { padding: 8px 12px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-secondary); cursor: pointer; font-size: 0.85rem; }
                .btn-delete { padding: 8px 12px; background: rgba(239, 68, 68, 0.1); border: 1px solid var(--error); border-radius: 8px; color: var(--error); cursor: pointer; font-size: 0.85rem; }
                .btn-delete:hover { background: var(--error); color: white; }
            `}</style>
        </div>
    )
}

export default PurchaseRequisitions