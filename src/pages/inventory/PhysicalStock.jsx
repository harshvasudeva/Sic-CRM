import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, ClipboardList, CheckCircle, AlertTriangle, RotateCcw, Search, Download } from 'lucide-react'
import { getInventoryProducts, getWarehouses, getStockLevels } from '../../stores/inventoryStore'
import { useTallyShortcuts } from '../../hooks/useTallyShortcuts'
import DataTable from '../../components/DataTable'
import Modal, { ModalFooter } from '../../components/Modal'
import FormInput, { FormTextarea, FormSelect } from '../../components/FormInput'
import { useToast } from '../../components/Toast'

function PhysicalStock() {
    const toast = useToast()
    const [products, setProducts] = useState([])
    const [warehouses, setWarehouses] = useState([])
    const [selectedWarehouse, setSelectedWarehouse] = useState('')
    const [countSession, setCountSession] = useState(null)
    const [isSessionModalOpen, setIsSessionModalOpen] = useState(false)
    const [countData, setCountData] = useState({})

    const [sessionData, setSessionData] = useState({
        warehouseId: '',
        countDate: new Date().toISOString().split('T')[0],
        notes: ''
    })

    useTallyShortcuts({
        create: () => setIsSessionModalOpen(true),
        save: () => {
            if (isSessionModalOpen) startSession()
            else if (countSession) saveCount()
        }
    })

    useEffect(() => {
        setProducts(getInventoryProducts())
        setWarehouses(getWarehouses())
    }, [])

    const startSession = () => {
        if (!sessionData.warehouseId) {
            toast.error('Please select a warehouse')
            return
        }
        const session = {
            id: `count-${Date.now()}`,
            ...sessionData,
            status: 'in_progress',
            startedAt: new Date().toISOString(),
            items: []
        }
        setCountSession(session)
        setSelectedWarehouse(sessionData.warehouseId)

        // Initialize count data
        const initialCounts = {}
        products.forEach(p => {
            if (p.warehouseId === sessionData.warehouseId || !sessionData.warehouseId) {
                initialCounts[p.id] = { systemQty: p.stock, countedQty: '', variance: 0 }
            }
        })
        setCountData(initialCounts)
        setIsSessionModalOpen(false)
        toast.success('Stock count session started')
    }

    const handleCountChange = (productId, value) => {
        const counted = parseInt(value) || 0
        const system = countData[productId]?.systemQty || 0
        setCountData({
            ...countData,
            [productId]: {
                ...countData[productId],
                countedQty: value,
                variance: counted - system
            }
        })
    }

    const saveCount = () => {
        toast.success('Physical count saved')
    }

    const completeSession = () => {
        setCountSession({ ...countSession, status: 'completed' })
        toast.success('Stock count session completed')
    }

    const filteredProducts = products.filter(p =>
        !selectedWarehouse || p.warehouseId === selectedWarehouse
    )

    const totalVariance = Object.values(countData).reduce((sum, item) => {
        return sum + (item.variance || 0)
    }, 0)

    const columns = [
        { key: 'sku', label: 'SKU', render: (v) => <span className="sku-code">{v}</span> },
        { key: 'name', label: 'Product Name' },
        { key: 'category', label: 'Category' },
        {
            key: 'systemQty', label: 'System Qty', render: (_, row) => (
                <span className="system-qty">{countData[row.id]?.systemQty || row.stock}</span>
            )
        },
        {
            key: 'countedQty', label: 'Counted Qty', render: (_, row) => (
                <input
                    type="number"
                    className="count-input"
                    value={countData[row.id]?.countedQty || ''}
                    onChange={(e) => handleCountChange(row.id, e.target.value)}
                    placeholder="0"
                    disabled={!countSession || countSession.status === 'completed'}
                />
            )
        },
        {
            key: 'variance', label: 'Variance', render: (_, row) => {
                const variance = countData[row.id]?.variance || 0
                return (
                    <span className={`variance ${variance > 0 ? 'positive' : variance < 0 ? 'negative' : ''}`}>
                        {variance > 0 ? '+' : ''}{variance}
                    </span>
                )
            }
        },
        {
            key: 'status', label: 'Status', render: (_, row) => {
                const variance = countData[row.id]?.variance || 0
                if (!countData[row.id]?.countedQty) return <span className="status-badge pending">Pending</span>
                if (variance === 0) return <span className="status-badge matched">Matched</span>
                return <span className="status-badge mismatch">Mismatch</span>
            }
        }
    ]

    return (
        <div className="page">
            <motion.div className="page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <div>
                    <h1 className="page-title"><span className="gradient-text">Physical Stock</span> Count</h1>
                    <p className="page-description">
                        Conduct physical inventory counts and reconcile with system quantities.
                    </p>
                </div>
                {!countSession && (
                    <button className="btn-primary" onClick={() => setIsSessionModalOpen(true)}>
                        <Plus size={20} /> Start Count Session
                    </button>
                )}
            </motion.div>

            {countSession && (
                <motion.div className="session-info" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="session-header">
                        <div className="session-details">
                            <ClipboardList size={24} />
                            <div>
                                <h3>Count Session: {countSession.id}</h3>
                                <p>Warehouse: {warehouses.find(w => w.id === countSession.warehouseId)?.name || 'All'}</p>
                            </div>
                        </div>
                        <div className="session-stats">
                            <div className="stat">
                                <span className="stat-label">Total Items</span>
                                <span className="stat-value">{filteredProducts.length}</span>
                            </div>
                            <div className="stat">
                                <span className="stat-label">Counted</span>
                                <span className="stat-value">{Object.values(countData).filter(d => d.countedQty !== '').length}</span>
                            </div>
                            <div className="stat">
                                <span className="stat-label">Variance</span>
                                <span className={`stat-value ${totalVariance !== 0 ? 'warning' : 'success'}`}>
                                    {totalVariance > 0 ? '+' : ''}{totalVariance}
                                </span>
                            </div>
                        </div>
                        <div className="session-actions">
                            <button className="btn-secondary" onClick={saveCount}>
                                <Download size={16} /> Save
                            </button>
                            <button className="btn-primary" onClick={completeSession}>
                                <CheckCircle size={16} /> Complete
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <DataTable
                    columns={columns}
                    data={filteredProducts}
                    searchable
                    exportable
                />
            </motion.div>

            {/* Start Session Modal */}
            <Modal isOpen={isSessionModalOpen} onClose={() => setIsSessionModalOpen(false)} title="Start Physical Count Session" size="medium">
                <FormSelect
                    label="Warehouse *"
                    options={[{ value: '', label: 'All Warehouses' }, ...warehouses.map(w => ({ value: w.id, label: w.name }))]}
                    value={sessionData.warehouseId}
                    onChange={(e) => setSessionData({ ...sessionData, warehouseId: e.target.value })}
                />
                <FormInput
                    label="Count Date"
                    type="date"
                    value={sessionData.countDate}
                    onChange={(e) => setSessionData({ ...sessionData, countDate: e.target.value })}
                />
                <FormTextarea
                    label="Notes"
                    value={sessionData.notes}
                    onChange={(e) => setSessionData({ ...sessionData, notes: e.target.value })}
                    rows={2}
                    placeholder="Optional notes for this count session"
                />
                <ModalFooter>
                    <button className="btn-secondary" onClick={() => setIsSessionModalOpen(false)}>Cancel</button>
                    <button className="btn-primary" onClick={startSession}>Start Session</button>
                </ModalFooter>
            </Modal>

            <style>{`
                .btn-primary { display: flex; align-items: center; gap: 8px; padding: 12px 20px; background: var(--accent-gradient); border-radius: var(--radius-md); color: white; }
                .btn-secondary { display: flex; align-items: center; gap: 8px; padding: 10px 16px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-secondary); }
                .session-info { padding: 20px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); margin-bottom: 24px; }
                .session-header { display: flex; align-items: center; justify-content: space-between; gap: 24px; flex-wrap: wrap; }
                .session-details { display: flex; align-items: center; gap: 12px; }
                .session-details svg { color: var(--accent-primary); }
                .session-details h3 { font-size: 1rem; margin-bottom: 2px; }
                .session-details p { font-size: 0.85rem; color: var(--text-muted); }
                .session-stats { display: flex; gap: 24px; }
                .stat { text-align: center; }
                .stat-label { display: block; font-size: 0.75rem; color: var(--text-muted); margin-bottom: 4px; }
                .stat-value { font-size: 1.25rem; font-weight: 700; color: var(--text-primary); }
                .stat-value.warning { color: var(--warning); }
                .stat-value.success { color: var(--success); }
                .session-actions { display: flex; gap: 8px; }
                .sku-code { font-family: 'JetBrains Mono', monospace; font-weight: 600; color: var(--accent-primary); }
                .system-qty { font-weight: 600; color: var(--text-primary); padding: 8px 12px; background: var(--bg-tertiary); border-radius: 8px; }
                .count-input { width: 80px; padding: 8px 12px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-primary); text-align: center; font-weight: 600; }
                .count-input:focus { border-color: var(--accent-primary); outline: none; }
                .count-input:disabled { opacity: 0.5; cursor: not-allowed; }
                .variance { font-weight: 600; padding: 4px 12px; border-radius: 8px; }
                .variance.positive { color: var(--success); background: rgba(16, 185, 129, 0.15); }
                .variance.negative { color: var(--error); background: rgba(239, 68, 68, 0.15); }
                .status-badge { padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; }
                .status-badge.pending { background: rgba(107, 114, 128, 0.15); color: var(--text-muted); }
                .status-badge.matched { background: rgba(16, 185, 129, 0.15); color: var(--success); }
                .status-badge.mismatch { background: rgba(239, 68, 68, 0.15); color: var(--error); }
            `}</style>
        </div>
    )
}

export default PhysicalStock
