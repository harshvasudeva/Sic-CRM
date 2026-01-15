import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import DataTable from '../../components/DataTable'
import Modal, { ModalFooter } from '../../components/Modal'
import FormInput, { FormTextarea, FormSelect } from '../../components/FormInput'
import { useToast } from '../../components/Toast'
import { getVendors } from '../../stores/purchaseStore'

function VendorReturns() {
    const toast = useToast()
    const [returns, setReturns] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editItem, setEditItem] = useState(null)
    const [formData, setFormData] = useState({
        returnNumber: '', returnDate: '', vendorId: '', grnNumber: '', items: [], reason: '', returnQty: 0, refundAmount: 0, status: 'pending', notes: ''
    })

    useEffect(() => {
        loadData()
    }, [])

    const loadData = () => {
        const stored = localStorage.getItem('erp_vendorReturns')
        setReturns(stored ? JSON.parse(stored) : [])
    }

    const saveData = () => {
        localStorage.setItem('erp_vendorReturns', JSON.stringify(returns))
    }

    const handleAdd = () => {
        const existingCount = returns.length
        setFormData({
            returnNumber: `RET-${String(existingCount + 1).padStart(4, '0')}`,
            returnDate: new Date().toISOString().split('T')[0],
            vendorId: '',
            grnNumber: '',
            items: [],
            reason: '',
            returnQty: 0,
            refundAmount: 0,
            status: 'pending',
            notes: ''
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
        const newReturn = {
            ...formData,
            id: editItem?.id || `ret-${Date.now()}`,
            createdAt: editItem?.createdAt || new Date().toISOString().split('T')[0]
        }

        if (editItem) {
            setReturns(returns.map(r => r.id === editItem.id ? newReturn : r))
            toast.success('Return updated')
        } else {
            setReturns([...returns, newReturn])
            toast.success('Return created')
        }
        setIsModalOpen(false)
        setEditItem(null)
        saveData()
        loadData()
    }

    const handleDelete = (id) => {
        if (confirm('Are you sure?')) {
            setReturns(returns.filter(r => r.id !== id))
            toast.success('Return deleted')
            saveData()
            loadData()
        }
    }

    const columns = [
        { key: 'returnNumber', label: 'Return #', render: (v) => <span className="return-number">{v}</span> },
        { key: 'returnDate', label: 'Return Date', render: (v) => <span>{new Date(v).toLocaleDateString()}</span> },
        { key: 'vendorId', label: 'Vendor', render: (v) => {
            const vendor = getVendors().find(v => v.id === v)
            return vendor ? vendor.name : '-'
        }},
        { key: 'grnNumber', label: 'GRN #', render: (v) => <span className="grn-number">{v}</span> },
        { key: 'reason', label: 'Reason', render: (v) => <span className="reason">{v}</span> },
        { key: 'returnQty', label: 'Qty Returned', render: (v) => <span className="qty">{v} units</span> },
        { key: 'refundAmount', label: 'Refund Amount', render: (v) => <span className="amount">${v.toLocaleString()}</span> },
        { key: 'status', label: 'Status', render: (v) => (
            <span className={`status-badge ${v}`}>
                {v.charAt(0).toUpperCase() + v.slice(1)}
            </span>
        )},
        { key: 'actions', label: 'Actions', render: (_, row) => (
            <div className="action-buttons">
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
                    <h1 className="page-title"><span className="gradient-text">Vendor</span> Returns</h1>
                    <p className="page-description">
                        Manage returns to vendors for defective or unwanted goods.
                    </p>
                </div>
                <button className="btn-primary" onClick={handleAdd}>
                    <Plus size={20} /> Create Return
                </button>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <DataTable columns={columns} data={returns} searchable exportable />
            </motion.div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editItem ? 'Edit Return' : 'Create Return'} size="large">
                <div className="form-grid">
                    <FormInput label="Return Number *" readOnly value={formData.returnNumber} />
                    <FormInput label="Return Date *" type="date" value={formData.returnDate} onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })} />
                </div>
                <div className="form-grid">
                    <FormSelect label="Vendor *" options={getVendors().map(v => ({ value: v.id, label: v.name }))} value={formData.vendorId} onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })} />
                    <FormInput label="GRN Number" placeholder="GRN-001" value={formData.grnNumber} onChange={(e) => setFormData({ ...formData, grnNumber: e.target.value })} />
                </div>
                <div className="form-grid">
                    <FormInput label="Reason *" placeholder="Defective product" value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} />
                    <FormInput label="Return Qty *" type="number" placeholder="0" value={formData.returnQty} onChange={(e) => setFormData({ ...formData, returnQty: parseInt(e.target.value) || 0 })} />
                </div>
                <div className="form-grid">
                    <FormInput label="Refund Amount *" type="number" placeholder="0" value={formData.refundAmount} onChange={(e) => setFormData({ ...formData, refundAmount: parseFloat(e.target.value) || 0 })} />
                    <FormSelect label="Status *" options={[
                        { value: 'pending', label: 'Pending' },
                        { value: 'approved', label: 'Approved' },
                        { value: 'processing', label: 'Processing' },
                        { value: 'completed', label: 'Completed' },
                        { value: 'rejected', label: 'Rejected' }
                    ]} value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} />
                </div>
                <FormTextarea label="Notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={2} placeholder="Additional notes about the return..." />
                <ModalFooter>
                    <button className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                    <button className="btn-primary" onClick={handleSave}>{editItem ? 'Update' : 'Create'} Return</button>
                </ModalFooter>
            </Modal>

            <style>{`
                .btn-primary { display: flex; align-items: center; gap: 8px; padding: 12px 20px; background: var(--accent-gradient); border-radius: var(--radius-md); color: white; border: none; cursor: pointer; font-weight: 600; }
                .btn-secondary { padding: 12px 20px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-secondary); cursor: pointer; }
                .return-number { font-family: 'JetBrains Mono', monospace; font-weight: 600; color: var(--accent-primary); }
                .grn-number { font-family: 'JetBrains Mono', monospace; font-weight: 500; color: var(--text-secondary); }
                .reason { font-size: 0.85rem; color: var(--text-secondary); }
                .qty { font-weight: 600; color: var(--text-primary); }
                .amount { font-weight: 600; color: var(--success); }
                .status-badge { padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; text-transform: capitalize; }
                .status-badge.pending { background: rgba(251, 191, 36, 0.15); color: #fbbf24; }
                .status-badge.approved { background: rgba(34, 197, 94, 0.15); color: #22c55e; }
                .status-badge.processing { background: rgba(59, 130, 246, 0.15); color: #3b82f6; }
                .status-badge.completed { background: rgba(16, 185, 129, 0.15); color: #10b981; }
                .status-badge.rejected { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
                .action-buttons { display: flex; gap: 8px; }
                .btn-edit { padding: 8px 12px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-secondary); cursor: pointer; font-size: 0.85rem; }
                .btn-delete { padding: 8px 12px; background: rgba(239, 68, 68, 0.1); border: 1px solid var(--error); border-radius: 8px; color: var(--error); cursor: pointer; font-size: 0.85rem; }
                .btn-delete:hover { background: var(--error); color: white; }
            `}</style>
        </div>
    )
}

export default VendorReturns