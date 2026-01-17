import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit, Trash2, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react'
import DataTable from '../../components/DataTable'
import Modal, { ModalFooter } from '../../components/Modal'
import FormInput, { FormSelect } from '../../components/FormInput'
import { useToast } from '../../components/Toast'
import { getBudgets, createBudget, updateBudget, getBudgetVarianceReport } from '../../stores/accountingStore'
import { formatCurrency } from '../../stores/settingsStore'

function Budgets() {
    const toast = useToast()
    const [budgets, setBudgets] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingBudget, setEditingBudget] = useState(null)
    const [formData, setFormData] = useState({ name: '', category: '', amount: 0, period: 'yearly' })

    useEffect(() => {
        loadData()
    }, [])

    const loadData = () => {
        // Use the new Variance Report which includes actuals and variance logic
        const data = getBudgetVarianceReport()
        setBudgets(data)
    }

    const handleSave = () => {
        if (editingBudget) {
            updateBudget(editingBudget.id, formData)
            toast.success('Budget Updated')
        } else {
            createBudget(formData)
            toast.success('Budget Created')
        }
        setIsModalOpen(false)
        setEditingBudget(null)
        loadData()
    }

    const openModal = (budget = null) => {
        if (budget) {
            setEditingBudget(budget)
            setFormData({ name: budget.name, category: budget.category, amount: budget.amount, period: budget.period })
        } else {
            setEditingBudget(null)
            setFormData({ name: '', category: '', amount: 0, period: 'yearly' })
        }
        setIsModalOpen(true)
    }

    const columns = [
        { key: 'name', label: 'Budget Name', render: (v) => <span className="font-bold">{v}</span> },
        { key: 'category', label: 'Category' },
        { key: 'amount', label: 'Budgeted', render: (v) => <span>{formatCurrency(v)}</span> },
        { key: 'actualAmount', label: 'Actual', render: (v) => <span className="font-mono">{formatCurrency(v)}</span> },
        {
            key: 'variance',
            label: 'Variance',
            render: (v) => (
                <span className={v < 0 ? 'text-red' : 'text-green'}>
                    {v < 0 ? '-' : '+'}{formatCurrency(Math.abs(v))}
                </span>
            )
        },
        {
            key: 'status',
            label: 'Status',
            render: (v) => (
                <span className={`badge ${v === 'On Track' ? 'bg-green-soft text-green' : 'bg-red-soft text-red'}`}>
                    {v === 'On Track' ? <CheckCircle size={12} /> : <AlertCircle size={12} />} {v}
                </span>
            )
        },
        {
            key: 'actions',
            label: '',
            render: (_, row) => (
                <button className="btn-icon" onClick={() => openModal(row)}>
                    <Edit size={16} />
                </button>
            )
        }
    ]

    return (
        <div className="page">
            <motion.div className="page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <div>
                    <h1 className="page-title"><span className="gradient-text">Budget</span> Variance</h1>
                    <p className="page-description">Monitor spending against planned budgets.</p>
                </div>
                <button className="btn-primary" onClick={() => openModal()}>
                    <Plus size={20} /> Create Budget
                </button>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <DataTable columns={columns} data={budgets} />
            </motion.div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingBudget ? 'Edit Budget' : 'Create Budget'}>
                <div className="form-grid">
                    <FormInput label="Budget Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    <FormInput label="Category" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} placeholder="e.g., Travel" />
                </div>
                <div className="form-grid">
                    <FormInput label="Amount" type="number" value={formData.amount} onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) })} />
                    <div className="form-group">
                        <label>Period</label>
                        <select className="form-select" value={formData.period} onChange={e => setFormData({ ...formData, period: e.target.value })}>
                            <option value="monthly">Monthly</option>
                            <option value="quarterly">Quarterly</option>
                            <option value="yearly">Yearly</option>
                        </select>
                    </div>
                </div>
                <ModalFooter>
                    <button className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                    <button className="btn-primary" onClick={handleSave}>Save</button>
                </ModalFooter>
            </Modal>

            <style>{`
                .text-green { color: var(--success); }
                .text-red { color: var(--error); }
                .bg-green-soft { background: rgba(16, 185, 129, 0.1); }
                .bg-red-soft { background: rgba(239, 68, 68, 0.1); }
                .font-mono { font-family: 'JetBrains Mono', monospace; }
                .font-bold { font-weight: 600; }
                .badge { display: inline-flex; align-items: center; gap: 4px; padding: 4px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: 500; }
            `}</style>
        </div>
    )
}

export default Budgets