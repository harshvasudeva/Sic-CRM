import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Package, ArrowUpRight, ArrowDownLeft } from 'lucide-react'
import DataTable from '../../components/DataTable'
import Modal, { ModalFooter } from '../../components/Modal'
import FormInput from '../../components/FormInput'
import { useToast } from '../../components/Toast'
import { getStockItems, createStockItem, createStockJournal, getInventoryValuationReport } from '../../stores/accountingStore'
import { formatCurrency } from '../../stores/settingsStore'

function Inventory() {
    const toast = useToast()
    const [items, setItems] = useState([])
    const [isItemModalOpen, setIsItemModalOpen] = useState(false)
    const [isJournalModalOpen, setIsJournalModalOpen] = useState(false)

    // Forms
    const [itemForm, setItemForm] = useState({ name: '', sku: '', unit: 'pcs', valuationMethod: 'FIFO' })
    const [journalForm, setJournalForm] = useState({ type: 'in', itemId: '', qty: 0, rate: 0, date: '' })

    useEffect(() => {
        loadData()
    }, [])

    const loadData = () => {
        setItems(getInventoryValuationReport())
    }

    const handleCreateItem = () => {
        createStockItem(itemForm)
        toast.success('Stock Item Created')
        setIsItemModalOpen(false)
        loadData()
    }

    const handleCreateJournal = () => {
        try {
            createStockJournal({
                type: journalForm.type,
                date: journalForm.date,
                lines: [{ itemId: journalForm.itemId, qty: journalForm.qty, rate: journalForm.rate }]
            })
            toast.success('Stock Journal Recorded')
            setIsJournalModalOpen(false)
            loadData()
        } catch (err) {
            toast.error(err.message)
        }
    }

    const columns = [
        { key: 'name', label: 'Item Name', render: (v) => <span className="font-bold">{v}</span> },
        { key: 'sku', label: 'SKU', render: (v) => <span className="font-mono">{v}</span> },
        { key: 'currentStock', label: 'Qty', render: (v) => <span className="font-lg">{v}</span> },
        { key: 'avgRate', label: 'Avg Rate', render: (v) => <span className="text-muted">{formatCurrency(v)}</span> },
        { key: 'currentValue', label: 'Total Value', render: (v) => <span className="amount">{formatCurrency(v)}</span> },
        { key: 'valuationMethod', label: 'Method', render: (v) => <span className="badge">{v}</span> }
    ]

    return (
        <div className="page">
            <motion.div className="page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <div>
                    <h1 className="page-title"><span className="gradient-text">Inventory</span> & Stock</h1>
                    <p className="page-description">Manage stock items, journals, and valuation (FIFO/Avg).</p>
                </div>
                <div className="header-actions">
                    <button className="btn-secondary" onClick={() => setIsJournalModalOpen(true)}>
                        Stock Journal
                    </button>
                    <button className="btn-primary" onClick={() => setIsItemModalOpen(true)}>
                        <Plus size={20} /> New Item
                    </button>
                </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <DataTable columns={columns} data={items} searchable />
            </motion.div>

            {/* Create Item Modal */}
            <Modal isOpen={isItemModalOpen} onClose={() => setIsItemModalOpen(false)} title="New Stock Item">
                <div className="form-grid">
                    <FormInput label="Item Name" value={itemForm.name} onChange={e => setItemForm({ ...itemForm, name: e.target.value })} />
                    <FormInput label="SKU" value={itemForm.sku} onChange={e => setItemForm({ ...itemForm, sku: e.target.value })} />
                </div>
                <div className="form-grid">
                    <FormInput label="Unit" value={itemForm.unit} onChange={e => setItemForm({ ...itemForm, unit: e.target.value })} />
                    <div className="form-group">
                        <label>Valuation Method</label>
                        <select className="form-select" value={itemForm.valuationMethod} onChange={e => setItemForm({ ...itemForm, valuationMethod: e.target.value })}>
                            <option value="FIFO">FIFO</option>
                            <option value="Weighted Average">Weighted Average</option>
                        </select>
                    </div>
                </div>
                <ModalFooter>
                    <button className="btn-secondary" onClick={() => setIsItemModalOpen(false)}>Cancel</button>
                    <button className="btn-primary" onClick={handleCreateItem}>Create Item</button>
                </ModalFooter>
            </Modal>

            {/* Stock Journal Modal */}
            <Modal isOpen={isJournalModalOpen} onClose={() => setIsJournalModalOpen(false)} title="Record Stock Movement">
                <div className="form-grid">
                    <div className="form-group">
                        <label>Type</label>
                        <div className="radio-group">
                            <button className={`radio-btn ${journalForm.type === 'in' ? 'active in' : ''}`} onClick={() => setJournalForm({ ...journalForm, type: 'in' })}>
                                <ArrowDownLeft size={16} /> Inward
                            </button>
                            <button className={`radio-btn ${journalForm.type === 'out' ? 'active out' : ''}`} onClick={() => setJournalForm({ ...journalForm, type: 'out' })}>
                                <ArrowUpRight size={16} /> Outward
                            </button>
                        </div>
                    </div>
                    <FormInput label="Date" type="date" value={journalForm.date} onChange={e => setJournalForm({ ...journalForm, date: e.target.value })} />
                </div>
                <div className="form-grid">
                    <div className="form-group">
                        <label>Item</label>
                        <select className="form-select" value={journalForm.itemId} onChange={e => setJournalForm({ ...journalForm, itemId: e.target.value })}>
                            <option value="">Select Item</option>
                            {items.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                        </select>
                    </div>
                </div>
                <div className="form-grid">
                    <FormInput label="Quantity" type="number" value={journalForm.qty} onChange={e => setJournalForm({ ...journalForm, qty: parseFloat(e.target.value) })} />
                    <FormInput label="Rate" type="number" value={journalForm.rate} onChange={e => setJournalForm({ ...journalForm, rate: parseFloat(e.target.value) })} />
                </div>
                <ModalFooter>
                    <button className="btn-secondary" onClick={() => setIsJournalModalOpen(false)}>Cancel</button>
                    <button className="btn-primary" onClick={handleCreateJournal}>Record Journal</button>
                </ModalFooter>
            </Modal>

            <style>{`
                .header-actions { display: flex; gap: 10px; }
                .font-mono { font-family: 'JetBrains Mono', monospace; }
                .font-bold { font-weight: 600; }
                .font-lg { font-size: 1.1rem; font-weight: 600; }
                .text-muted { color: var(--text-secondary); }
                .amount { font-weight: 600; color: var(--success); }
                .badge { padding: 4px 8px; background: var(--bg-tertiary); border-radius: 4px; font-size: 0.75rem; }
                
                .form-select { width: 100%; padding: 10px; background: var(--bg-input); border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-primary); }
                .radio-group { display: flex; gap: 10px; }
                .radio-btn { flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 10px; border: 1px solid var(--border-color); background: var(--bg-input); border-radius: 8px; cursor: pointer; color: var(--text-secondary); }
                .radio-btn.active.in { background: rgba(34, 197, 94, 0.1); border-color: #22c55e; color: #22c55e; }
                .radio-btn.active.out { background: rgba(239, 68, 68, 0.1); border-color: #ef4444; color: #ef4444; }
                
                .btn-primary { display: flex; align-items: center; gap: 8px; padding: 12px 20px; background: var(--accent-gradient); border-radius: var(--radius-md); color: white; border: none; cursor: pointer; font-weight: 600; }
                .btn-secondary { padding: 12px 20px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-secondary); cursor: pointer; }
            `}</style>
        </div>
    )
}

export default Inventory
