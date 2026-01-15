import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import DataTable from '../../components/DataTable'
import Modal, { ModalFooter } from '../../components/Modal'
import FormInput, { FormTextarea, FormSelect } from '../../components/FormInput'
import { useToast } from '../../components/Toast'
import { getGRNs, createGRN, updateGRN, deleteGRN, getPurchaseOrders, getVendors } from '../../stores/purchaseStore'

function GRNs() {
    const toast = useToast()
    const [grns, setGrns] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editItem, setEditItem] = useState(null)
    const [formData, setFormData] = useState({
        grnDate: '', poNumber: '', vendorId: '', items: [], totalQty: 0, totalAmount: 0, status: 'pending', receivedBy: '', notes: ''
    })

    useEffect(() => {
        loadData()
    }, [])

    const loadData = () => {
        setGrns(getGRNs())
    }

    const handleAdd = () => {
        setFormData({
            grnDate: new Date().toISOString().split('T')[0],
            poNumber: '',
            vendorId: '',
            items: [],
            totalQty: 0,
            totalAmount: 0,
            status: 'pending',
            receivedBy: '',
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
        if (editItem) {
            updateGRN(editItem.id, formData)
            toast.success('GRN updated')
        } else {
            createGRN(formData)
            toast.success('GRN created')
        }
        setIsModalOpen(false)
        setEditItem(null)
        loadData()
    }

    const handleDelete = (id) => {
        if (confirm('Are you sure?')) {
            deleteGRN(id)
            toast.success('GRN deleted')
            loadData()
        }
    }

    const columns = [
        { key: 'grnNumber', label: 'GRN Number', render: (v) => <span className="grn-number">{v}</span> },
        { key: 'grnDate', label: 'GRN Date', render: (v) => <span>{new Date(v).toLocaleDateString()}</span> },
        { key: 'poNumber', label: 'PO Number', render: (v) => <span className="po-number">{v}</span> },
        { key: 'vendorId', label: 'Vendor', render: (v) => {
            const vendor = getVendors().find(v => v.id === v)
            return vendor ? vendor.name : '-'
        }},
        { key: 'totalQty', label: 'Total Qty', render: (v) => <span className="qty">{v} units</span> },
        { key: 'totalAmount', label: 'Amount', render: (v) => <span className="amount">${v.toLocaleString()}</span> },
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
                    <h1 className="page-title"><span className="gradient-text">Goods Receipt</span> Notes</h1>
                    <p className="page-description">
                        Record and track goods received from vendors against purchase orders.
                    </p>
                </div>
                <button className="btn-primary" onClick={handleAdd}>
                    <Plus size={20} /> Create GRN
                </button>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <DataTable columns={columns} data={grns} searchable exportable />
            </motion.div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editItem ? 'Edit GRN' : 'Create GRN'} size="large">
                <div className="form-grid">
                    <FormInput label="GRN Date *" type="date" value={formData.grnDate} onChange={(e) => setFormData({ ...formData, grnDate: e.target.value })} />
                    <FormInput label="Received By *" placeholder="John Doe" value={formData.receivedBy} onChange={(e) => setFormData({ ...formData, receivedBy: e.target.value })} />
                </div>
                <div className="form-grid">
                    <FormSelect label="Purchase Order" options={[
                        { value: '', label: 'Select PO...' },
                        ...getPurchaseOrders().map(po => ({ value: po.number, label: po.number }))
                    ]} value={formData.poNumber} onChange={(e) => {
                        const po = getPurchaseOrders().find(p => p.number === e.target.value)
                        setFormData({ ...formData, poNumber: e.target.value, vendorId: po?.vendorId || '' })
                    }} />
                    <FormSelect label="Vendor" options={getVendors().map(v => ({ value: v.id, label: v.name }))} value={formData.vendorId} onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })} />
                </div>
                <div className="form-grid">
                    <FormInput label="Total Quantity *" type="number" placeholder="0" value={formData.totalQty} onChange={(e) => setFormData({ ...formData, totalQty: parseInt(e.target.value) || 0 })} />
                    <FormInput label="Total Amount *" type="number" placeholder="0" value={formData.totalAmount} onChange={(e) => setFormData({ ...formData, totalAmount: parseFloat(e.target.value) || 0 })} />
                </div>
                <FormInput label="Status" readOnly value={formData.status} />
                <FormTextarea label="Notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={3} placeholder="Any discrepancies or notes about the received goods..." />
                <ModalFooter>
                    <button className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                    <button className="btn-primary" onClick={handleSave}>{editItem ? 'Update' : 'Create'} GRN</button>
                </ModalFooter>
            </Modal>

            <style>{`
                .btn-primary { display: flex; align-items: center; gap: 8px; padding: 12px 20px; background: var(--accent-gradient); border-radius: var(--radius-md); color: white; border: none; cursor: pointer; font-weight: 600; }
                .btn-secondary { padding: 12px 20px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-secondary); cursor: pointer; }
                .grn-number { font-family: 'JetBrains Mono', monospace; font-weight: 600; color: var(--accent-primary); }
                .po-number { font-family: 'JetBrains Mono', monospace; font-weight: 500; color: var(--text-secondary); }
                .qty { font-weight: 600; color: var(--text-primary); }
                .status-badge { padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; text-transform: capitalize; }
                .status-badge.pending { background: rgba(251, 191, 36, 0.15); color: #fbbf24; }
                .status-badge.approved { background: rgba(34, 197, 94, 0.15); color: #22c55e; }
                .status-badge.rejected { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
                .amount { font-weight: 600; color: var(--success); }
                .action-buttons { display: flex; gap: 8px; }
                .btn-edit { padding: 8px 12px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-secondary); cursor: pointer; font-size: 0.85rem; }
                .btn-delete { padding: 8px 12px; background: rgba(239, 68, 68, 0.1); border: 1px solid var(--error); border-radius: 8px; color: var(--error); cursor: pointer; font-size: 0.85rem; }
                .btn-delete:hover { background: var(--error); color: white; }
            `}</style>
        </div>
    )
}

export default GRNs