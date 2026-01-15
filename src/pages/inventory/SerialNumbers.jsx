import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import DataTable from '../../components/DataTable'
import Modal, { ModalFooter } from '../../components/Modal'
import FormInput, { FormSelect } from '../../components/FormInput'
import { useToast } from '../../components/Toast'
import { getInventoryProducts, getWarehouses } from '../../stores/inventoryStore'

function SerialNumbers() {
    const toast = useToast()
    const [serials, setSerials] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [formData, setFormData] = useState({
        serialNumber: '', productId: '', warehouseId: '', batchNumber: '', mfgDate: '', expiryDate: '', status: 'available'
    })

    useEffect(() => {
        loadData()
    }, [])

    const loadData = () => {
        const stored = localStorage.getItem('erp_serialNumbers')
        setSerials(stored ? JSON.parse(stored) : [])
    }

    const saveData = () => {
        localStorage.setItem('erp_serialNumbers', JSON.stringify(serials))
    }

    const handleAdd = () => {
        setFormData({
            serialNumber: '',
            productId: '',
            warehouseId: '',
            batchNumber: '',
            mfgDate: '',
            expiryDate: '',
            status: 'available'
        })
        setIsModalOpen(true)
    }

    const handleSave = () => {
        const newSerial = {
            ...formData,
            id: `ser-${Date.now()}`,
            createdAt: new Date().toISOString().split('T')[0]
        }
        setSerials([...serials, newSerial])
        toast.success('Serial number added')
        setIsModalOpen(false)
        saveData()
        loadData()
    }

    const handleDelete = (id) => {
        if (confirm('Are you sure?')) {
            setSerials(serials.filter(s => s.id !== id))
            toast.success('Serial number deleted')
            saveData()
            loadData()
        }
    }

    const columns = [
        { key: 'serialNumber', label: 'Serial Number', render: (v) => <span className="serial-number">{v}</span> },
        { key: 'productId', label: 'Product', render: (v) => {
            const product = getInventoryProducts().find(p => p.id === v)
            return product ? product.name : '-'
        }},
        { key: 'warehouseId', label: 'Warehouse', render: (v) => {
            const warehouse = getWarehouses().find(w => w.id === v)
            return warehouse ? warehouse.name : '-'
        }},
        { key: 'batchNumber', label: 'Batch Number', render: (v) => <span className="batch-number">{v || '-'}</span> },
        { key: 'mfgDate', label: 'Mfg Date', render: (v) => v ? <span>{new Date(v).toLocaleDateString()}</span> : '-' },
        { key: 'expiryDate', label: 'Expiry Date', render: (v) => v ? <span>{new Date(v).toLocaleDateString()}</span> : '-' },
        { key: 'status', label: 'Status', render: (v) => (
            <span className={`status-badge ${v}`}>{v}</span>
        )},
        { key: 'actions', label: 'Actions', render: (_, row) => (
            <button className="btn-delete" onClick={() => handleDelete(row.id)}>Delete</button>
        )}
    ]

    const totalSerials = serials.length
    const availableSerials = serials.filter(s => s.status === 'available').length
    const assignedSerials = serials.filter(s => s.status === 'assigned').length

    return (
        <div className="page">
            <motion.div className="page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <div>
                    <h1 className="page-title"><span className="gradient-text">Serial Number</span> Tracking</h1>
                    <p className="page-description">
                        Track serial numbers for inventory traceability.
                    </p>
                </div>
                <button className="btn-primary" onClick={handleAdd}>
                    <Plus size={20} /> Add Serial
                </button>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <div className="stats-row">
                    <div className="stat-card">
                        <div className="stat-label">Total Serials</div>
                        <div className="stat-value">{totalSerials}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Available</div>
                        <div className="stat-value success">{availableSerials}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Assigned</div>
                        <div className="stat-value warning">{assignedSerials}</div>
                    </div>
                </div>

                <DataTable columns={columns} data={serials} searchable exportable />
            </motion.div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Serial Number" size="medium">
                <FormInput label="Serial Number *" placeholder="SN-123456789" value={formData.serialNumber} onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })} />
                <div className="form-grid">
                    <FormSelect label="Product *" options={getInventoryProducts().map(p => ({ value: p.id, label: p.name }))} value={formData.productId} onChange={(e) => setFormData({ ...formData, productId: e.target.value })} />
                    <FormSelect label="Warehouse *" options={getWarehouses().map(w => ({ value: w.id, label: w.name }))} value={formData.warehouseId} onChange={(e) => setFormData({ ...formData, warehouseId: e.target.value })} />
                </div>
                <div className="form-grid">
                    <FormInput label="Batch Number" placeholder="BATCH-001" value={formData.batchNumber} onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })} />
                    <FormInput label="Status" readOnly value={formData.status} />
                </div>
                <div className="form-grid">
                    <FormInput label="Manufacturing Date" type="date" value={formData.mfgDate} onChange={(e) => setFormData({ ...formData, mfgDate: e.target.value })} />
                    <FormInput label="Expiry Date" type="date" value={formData.expiryDate} onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })} />
                </div>
                <ModalFooter>
                    <button className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                    <button className="btn-primary" onClick={handleSave}>Add Serial</button>
                </ModalFooter>
            </Modal>

            <style>{`
                .btn-primary { display: flex; align-items: center; gap: 8px; padding: 12px 20px; background: var(--accent-gradient); border-radius: var(--radius-md); color: white; border: none; cursor: pointer; font-weight: 600; }
                .btn-secondary { padding: 12px 20px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-secondary); cursor: pointer; }
                .stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }
                .stat-card { padding: 20px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); }
                .stat-label { font-size: 0.85rem; color: var(--text-muted); margin-bottom: 8px; }
                .stat-value { font-size: 1.5rem; font-weight: 700; color: var(--text-primary); }
                .stat-value.success { color: var(--success); }
                .stat-value.warning { color: var(--warning); }
                .serial-number { font-family: 'JetBrains Mono', monospace; font-weight: 600; color: var(--accent-primary); }
                .batch-number { font-family: 'JetBrains Mono', monospace; color: var(--text-secondary); }
                .status-badge { padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; text-transform: capitalize; }
                .status-badge.available { background: rgba(34, 197, 94, 0.15); color: #22c55e; }
                .status-badge.assigned { background: rgba(59, 130, 246, 0.15); color: #3b82f6; }
                .status-badge.sold { background: rgba(168, 85, 247, 0.15); color: #a855f7; }
                .btn-delete { padding: 8px 12px; background: rgba(239, 68, 68, 0.1); border: 1px solid var(--error); border-radius: 8px; color: var(--error); cursor: pointer; font-size: 0.85rem; }
                .btn-delete:hover { background: var(--error); color: white; }
            `}</style>
        </div>
    )
}

export default SerialNumbers