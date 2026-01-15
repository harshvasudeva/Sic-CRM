import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Send } from 'lucide-react'
import DataTable from '../../components/DataTable'
import Modal, { ModalFooter } from '../../components/Modal'
import FormInput, { FormTextarea, FormSelect } from '../../components/FormInput'
import { useToast } from '../../components/Toast'
import { getRFQs, createRFQ, updateRFQ, deleteRFQ, sendRFQ, getVendors } from '../../stores/purchaseStore'

function RFQs() {
    const toast = useToast()
    const [rfqs, setRfqs] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editItem, setEditItem] = useState(null)
    const [formData, setFormData] = useState({
        rfqDate: '', validUntil: '', items: [], totalEstimated: 0, status: 'draft', notes: '', vendorIds: []
    })

    useEffect(() => {
        loadData()
    }, [])

    const loadData = () => {
        setRfqs(getRFQs())
    }

    const handleAdd = () => {
        setFormData({
            rfqDate: new Date().toISOString().split('T')[0],
            validUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            items: [],
            totalEstimated: 0,
            status: 'draft',
            notes: '',
            vendorIds: []
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
            updateRFQ(editItem.id, formData)
            toast.success('RFQ updated')
        } else {
            createRFQ(formData)
            toast.success('RFQ created')
        }
        setIsModalOpen(false)
        setEditItem(null)
        loadData()
    }

    const handleSend = (id) => {
        sendRFQ(id)
        toast.success('RFQ sent to vendors')
        loadData()
    }

    const handleDelete = (id) => {
        if (confirm('Are you sure?')) {
            deleteRFQ(id)
            toast.success('RFQ deleted')
            loadData()
        }
    }

    const columns = [
        { key: 'number', label: 'Number', render: (v) => <span className="rfq-number">{v}</span> },
        { key: 'rfqDate', label: 'RFQ Date', render: (v) => <span>{new Date(v).toLocaleDateString()}</span> },
        { key: 'validUntil', label: 'Valid Until', render: (v) => <span>{new Date(v).toLocaleDateString()}</span> },
        { key: 'totalEstimated', label: 'Estimated', render: (v) => <span className="amount">${v.toLocaleString()}</span> },
        { key: 'status', label: 'Status', render: (v) => (
            <span className={`status-badge ${v}`}>
                {v.charAt(0).toUpperCase() + v.slice(1)}
            </span>
        )},
        { key: 'actions', label: 'Actions', render: (_, row) => (
            <div className="action-buttons">
                {row.status === 'draft' && (
                    <button className="btn-send" onClick={() => handleSend(row.id)}>
                        <Send size={16} /> Send
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
                    <h1 className="page-title"><span className="gradient-text">Requests for</span> Quotation</h1>
                    <p className="page-description">
                        Create and manage RFQs to solicit quotes from multiple vendors.
                    </p>
                </div>
                <button className="btn-primary" onClick={handleAdd}>
                    <Plus size={20} /> Create RFQ
                </button>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <DataTable columns={columns} data={rfqs} searchable exportable />
            </motion.div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editItem ? 'Edit RFQ' : 'Create RFQ'} size="large">
                <div className="form-grid">
                    <FormInput label="RFQ Date *" type="date" value={formData.rfqDate} onChange={(e) => setFormData({ ...formData, rfqDate: e.target.value })} />
                    <FormInput label="Valid Until *" type="date" value={formData.validUntil} onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })} />
                </div>
                <div className="form-grid">
                    <FormInput label="Total Estimated *" type="number" placeholder="0" value={formData.totalEstimated} onChange={(e) => setFormData({ ...formData, totalEstimated: parseFloat(e.target.value) || 0 })} />
                    <FormInput label="Status" readOnly value={formData.status} />
                </div>
                <FormSelect label="Vendors" options={getVendors().map(v => ({ value: v.id, label: v.name }))} value={formData.vendorIds} onChange={(e) => setFormData({ ...formData, vendorIds: [e.target.value] })} multiple />
                <FormTextarea label="Notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={3} placeholder="Additional notes or requirements..." />
                <ModalFooter>
                    <button className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                    <button className="btn-primary" onClick={handleSave}>{editItem ? 'Update' : 'Create'} RFQ</button>
                </ModalFooter>
            </Modal>

            <style>{`
                .btn-primary { display: flex; align-items: center; gap: 8px; padding: 12px 20px; background: var(--accent-gradient); border-radius: var(--radius-md); color: white; border: none; cursor: pointer; font-weight: 600; }
                .btn-secondary { padding: 12px 20px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-secondary); cursor: pointer; }
                .rfq-number { font-family: 'JetBrains Mono', monospace; font-weight: 600; color: var(--accent-primary); }
                .status-badge { padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; text-transform: capitalize; }
                .status-badge.draft { background: rgba(156, 163, 175, 0.15); color: #9ca3af; }
                .status-badge.sent { background: rgba(59, 130, 246, 0.15); color: #3b82f6; }
                .status-badge.received { background: rgba(34, 197, 94, 0.15); color: #22c55e; }
                .status-badge.closed { background: rgba(251, 191, 36, 0.15); color: #fbbf24; }
                .amount { font-weight: 600; color: var(--success); }
                .action-buttons { display: flex; gap: 8px; }
                .btn-send { display: flex; align-items: center; gap: 6px; padding: 8px 12px; background: var(--accent-primary); border: none; border-radius: 8px; color: white; cursor: pointer; font-size: 0.85rem; }
                .btn-edit { padding: 8px 12px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-secondary); cursor: pointer; font-size: 0.85rem; }
                .btn-delete { padding: 8px 12px; background: rgba(239, 68, 68, 0.1); border: 1px solid var(--error); border-radius: 8px; color: var(--error); cursor: pointer; font-size: 0.85rem; }
                .btn-delete:hover { background: var(--error); color: white; }
            `}</style>
        </div>
    )
}

export default RFQs