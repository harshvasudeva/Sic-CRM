import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, truck, Package } from 'lucide-react'
import DataTable from '../../components/DataTable'
import Modal, { ModalFooter } from '../../components/Modal'
import FormInput from '../../components/FormInput'
import { useToast } from '../../components/Toast'
import { getPurchaseOrders, createPurchaseOrder, createGRN } from '../../stores/accountingStore'
import { formatCurrency } from '../../stores/settingsStore'

function PurchaseOrders() {
    const toast = useToast()
    const [orders, setOrders] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [formData, setFormData] = useState({
        vendorId: '', amount: 0, expectedDate: ''
    })

    useEffect(() => {
        loadData()
    }, [])

    const loadData = () => {
        setOrders(getPurchaseOrders())
    }

    const handleCreatePO = () => {
        createPurchaseOrder(formData)
        toast.success('Purchase Order Created')
        setIsModalOpen(false)
        loadData()
    }

    const handleReceiveGoods = (id) => {
        try {
            createGRN(id, new Date().toISOString().split('T')[0])
            toast.success('GRN Created & Bill Generated')
            loadData()
        } catch (err) {
            toast.error(err.message)
        }
    }

    const columns = [
        { key: 'poNumber', label: 'PO #', render: (v) => <span className="font-mono">{v}</span> },
        { key: 'vendorId', label: 'Vendor', render: (v) => <span className="font-bold">{v}</span> },
        { key: 'date', label: 'Date', render: (v) => <span>{v}</span> },
        { key: 'expectedDate', label: 'Expected', render: (v) => <span>{v || 'N/A'}</span> },
        { key: 'totalAmount', label: 'Amount', render: (v) => <span className="amount">{formatCurrency(v)}</span> },
        { key: 'status', label: 'Status', render: (v) => <span className={`status-badge ${v}`}>{v}</span> },
        {
            key: 'actions', label: 'Actions', render: (_, row) => (
                row.status === 'open' && (
                    <button className="btn-xs-primary" onClick={() => handleReceiveGoods(row.id)}>
                        Receive Goods
                    </button>
                )
            )
        }
    ]

    return (
        <div className="page">
            <motion.div className="page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <div>
                    <h1 className="page-title"><span className="gradient-text">Purchase</span> Orders</h1>
                    <p className="page-description">Manage procurement, POs, and Goods Receipt (GRN).</p>
                </div>
                <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
                    <Plus size={20} /> New Purchase Order
                </button>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <DataTable columns={columns} data={orders} searchable />
            </motion.div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Purchase Order">
                <div className="form-grid">
                    <FormInput label="Vendor ID" value={formData.vendorId} onChange={e => setFormData({ ...formData, vendorId: e.target.value })} />
                    <FormInput label="Total Amount" type="number" value={formData.amount} onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) })} />
                </div>
                <div className="form-grid">
                    <FormInput label="Expected Date" type="date" value={formData.expectedDate} onChange={e => setFormData({ ...formData, expectedDate: e.target.value })} />
                </div>
                <ModalFooter>
                    <button className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                    <button className="btn-primary" onClick={handleCreatePO}>Create PO</button>
                </ModalFooter>
            </Modal>

            <style>{`
                .font-mono { font-family: 'JetBrains Mono', monospace; }
                .amount { font-weight: 600; color: var(--text-primary); }
                .btn-xs-primary { padding: 6px 12px; background: rgba(34, 197, 94, 0.1); color: #22c55e; border: none; border-radius: 4px; font-size: 0.8rem; cursor: pointer; font-weight: 600; }
                .btn-xs-primary:hover { background: #22c55e; color: white; }
                .status-badge { padding: 4px 8px; border-radius: 12px; font-size: 0.75rem; text-transform: capitalize; }
                .status-badge.open { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
                .status-badge.received { background: rgba(34, 197, 94, 0.1); color: #22c55e; }
                
                .btn-primary { display: flex; align-items: center; gap: 8px; padding: 12px 20px; background: var(--accent-gradient); border-radius: var(--radius-md); color: white; border: none; cursor: pointer; font-weight: 600; }
                .btn-secondary { padding: 12px 20px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-secondary); cursor: pointer; }
            `}</style>
        </div>
    )
}

export default PurchaseOrders
