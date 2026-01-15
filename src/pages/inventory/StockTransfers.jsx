import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import DataTable from '../../components/DataTable'
import Modal, { ModalFooter } from '../../components/Modal'
import FormInput, { FormTextarea, FormSelect } from '../../components/FormInput'
import { useToast } from '../../components/Toast'
import { getTransfers, createTransfer, approveTransfer, completeTransfer, getWarehouses, getInventoryProducts } from '../../stores/inventoryStore'

function StockTransfers() {
    const toast = useToast()
    const [transfers, setTransfers] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [formData, setFormData] = useState({
        transferDate: '', fromWarehouseId: '', toWarehouseId: '', productId: '', quantity: 0, status: 'pending', notes: ''
    })

    useEffect(() => {
        loadData()
    }, [])

    const loadData = () => {
        setTransfers(getTransfers())
    }

    const handleAdd = () => {
        setFormData({
            transferDate: new Date().toISOString().split('T')[0],
            fromWarehouseId: '',
            toWarehouseId: '',
            productId: '',
            quantity: 0,
            status: 'pending',
            notes: ''
        })
        setIsModalOpen(true)
    }

    const handleSave = () => {
        createTransfer(formData)
        toast.success('Transfer created')
        setIsModalOpen(false)
        loadData()
    }

    const handleApprove = (id) => {
        approveTransfer(id, 'user')
        toast.success('Transfer approved')
        loadData()
    }

    const handleComplete = (id) => {
        completeTransfer(id, 'user')
        toast.success('Transfer completed')
        loadData()
    }

    const columns = [
        { key: 'transferNumber', label: 'Transfer #', render: (v) => <span className="transfer-number">{v}</span> },
        { key: 'transferDate', label: 'Date', render: (v) => <span>{new Date(v).toLocaleDateString()}</span> },
        { key: 'fromWarehouseId', label: 'From Warehouse', render: (v) => {
            const warehouse = getWarehouses().find(w => w.id === v)
            return warehouse ? warehouse.name : '-'
        }},
        { key: 'toWarehouseId', label: 'To Warehouse', render: (v) => {
            const warehouse = getWarehouses().find(w => w.id === v)
            return warehouse ? warehouse.name : '-'
        }},
        { key: 'productId', label: 'Product', render: (v) => {
            const product = getInventoryProducts().find(p => p.id === v)
            return product ? `${product.sku} - ${product.name}` : '-'
        }},
        { key: 'quantity', label: 'Quantity', render: (v) => <span className="quantity">{v}</span> },
        { key: 'status', label: 'Status', render: (v) => (
            <span className={`status-badge ${v}`}>{v}</span>
        )},
        { key: 'actions', label: 'Actions', render: (_, row) => (
            <div className="action-buttons">
                {row.status === 'pending' && (
                    <button className="btn-approve" onClick={() => handleApprove(row.id)}>Approve</button>
                )}
                {row.status === 'approved' && (
                    <button className="btn-complete" onClick={() => handleComplete(row.id)}>Complete</button>
                )}
            </div>
        )}
    ]

    return (
        <div className="page">
            <motion.div className="page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <div>
                    <h1 className="page-title"><span className="gradient-text">Stock</span> Transfers</h1>
                    <p className="page-description">
                        Manage stock transfers between warehouses.
                    </p>
                </div>
                <button className="btn-primary" onClick={handleAdd}>
                    <Plus size={20} /> Create Transfer
                </button>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <DataTable columns={columns} data={transfers} searchable exportable />
            </motion.div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Stock Transfer" size="medium">
                <FormInput label="Transfer Date *" type="date" value={formData.transferDate} onChange={(e) => setFormData({ ...formData, transferDate: e.target.value })} />
                <div className="form-grid">
                    <FormSelect label="From Warehouse *" options={getWarehouses().map(w => ({ value: w.id, label: w.name }))} value={formData.fromWarehouseId} onChange={(e) => setFormData({ ...formData, fromWarehouseId: e.target.value })} />
                    <FormSelect label="To Warehouse *" options={getWarehouses().map(w => ({ value: w.id, label: w.name }))} value={formData.toWarehouseId} onChange={(e) => setFormData({ ...formData, toWarehouseId: e.target.value })} />
                </div>
                <div className="form-grid">
                    <FormSelect label="Product *" options={getInventoryProducts().map(p => ({ value: p.id, label: `${p.sku} - ${p.name}` }))} value={formData.productId} onChange={(e) => setFormData({ ...formData, productId: e.target.value })} />
                    <FormInput label="Quantity *" type="number" placeholder="0" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })} />
                </div>
                <FormTextarea label="Notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={2} placeholder="Any additional notes..." />
                <ModalFooter>
                    <button className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                    <button className="btn-primary" onClick={handleSave}>Create Transfer</button>
                </ModalFooter>
            </Modal>

            <style>{`
                .btn-primary { display: flex; align-items: center; gap: 8px; padding: 12px 20px; background: var(--accent-gradient); border-radius: var(--radius-md); color: white; border: none; cursor: pointer; font-weight: 600; }
                .btn-secondary { padding: 12px 20px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-secondary); cursor: pointer; }
                .transfer-number { font-family: 'JetBrains Mono', monospace; font-weight: 600; color: var(--accent-primary); }
                .quantity { font-weight: 700; font-family: 'JetBrains Mono', monospace; color: var(--text-primary); }
                .status-badge { padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; text-transform: capitalize; }
                .status-badge.pending { background: rgba(251, 191, 36, 0.15); color: #fbbf24; }
                .status-badge.approved { background: rgba(59, 130, 246, 0.15); color: #3b82f6; }
                .status-badge.completed { background: rgba(34, 197, 94, 0.15); color: #22c55e; }
                .status-badge.cancelled { background: rgba(156, 163, 175, 0.15); color: #9ca3af; }
                .action-buttons { display: flex; gap: 8px; }
                .btn-approve { padding: 8px 12px; background: var(--accent-primary); border: none; border-radius: 8px; color: white; cursor: pointer; font-size: 0.85rem; }
                .btn-complete { padding: 8px 12px; background: var(--success); border: none; border-radius: 8px; color: white; cursor: pointer; font-size: 0.85rem; }
                .btn-delete { padding: 8px 12px; background: rgba(239, 68, 68, 0.1); border: 1px solid var(--error); border-radius: 8px; color: var(--error); cursor: pointer; font-size: 0.85rem; }
                .btn-delete:hover { background: var(--error); color: white; }
            `}</style>
        </div>
    )
}

export default StockTransfers