import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import DataTable from '../../components/DataTable'
import Modal, { ModalFooter } from '../../components/Modal'
import FormInput, { FormSelect } from '../../components/FormInput'
import { useToast } from '../../components/Toast'
import { getBudgets, createBudget, updateBudget, getChartOfAccounts } from '../../stores/accountingStore'
import { formatCurrency } from '../../stores/settingsStore'

// Helper function to calculate variance percentage
const getVariancePercent = (budgeted, actual) => {
    if (budgeted === 0) return 0
    return Math.round(((budgeted - actual) / budgeted) * 100)
}

function Budgets() {
    const toast = useToast()
    const [budgets, setBudgets] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editItem, setEditItem] = useState(null)
    const [formData, setFormData] = useState({
        fiscalYear: '', period: 'monthly', accountId: '', budgetedAmount: 0, actualAmount: 0, status: 'active'
    })

    useEffect(() => {
        loadData()
    }, [])

    const loadData = () => {
        setBudgets(getBudgets())
    }

    const handleAdd = () => {
        setFormData({
            fiscalYear: new Date().getFullYear().toString(),
            period: 'monthly',
            accountId: '',
            budgetedAmount: 0,
            actualAmount: 0,
            status: 'active'
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
            updateBudget(editItem.id, formData)
            toast.success('Budget updated')
        } else {
            createBudget(formData)
            toast.success('Budget created')
        }
        setIsModalOpen(false)
        setEditItem(null)
        loadData()
    }

    const columns = [
        { key: 'fiscalYear', label: 'Fiscal Year', render: (v) => <span className="fiscal-year">{v}</span> },
        { key: 'period', label: 'Period', render: (v) => <span className="period-badge">{v}</span> },
        {
            key: 'accountId', label: 'Account', render: (v) => {
                const account = getChartOfAccounts().find(a => a.id === v)
                return account ? `${account.code} - ${account.name}` : '-'
            }
        },
        { key: 'budgetedAmount', label: 'Budgeted', render: (v) => <span className="amount budgeted">{formatCurrency(v || 0)}</span> },
        { key: 'actualAmount', label: 'Actual', render: (v) => <span className="amount actual">{formatCurrency(v || 0)}</span> },
        {
            key: 'variance', label: 'Variance', render: (_, row) => {
                const variance = getVariancePercent(row.budgetedAmount, row.actualAmount)
                return <span className={`variance ${variance >= 0 ? 'positive' : 'negative'}`}>{variance}%</span>
            }
        },
        {
            key: 'status', label: 'Status', render: (v) => (
                <span className={`status-badge ${v}`}>{v}</span>
            )
        },
        {
            key: 'actions', label: 'Actions', render: (_, row) => (
                <div className="action-buttons">
                    <button className="btn-edit" onClick={() => handleEdit(row)}>Edit</button>
                </div>
            )
        }
    ]

    return (
        <div className="page">
            <motion.div className="page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <div>
                    <h1 className="page-title"><span className="gradient-text">Budget</span> Management</h1>
                    <p className="page-description">
                        Create and monitor budgets with variance tracking.
                    </p>
                </div>
                <button className="btn-primary" onClick={handleAdd}>
                    <Plus size={20} /> Create Budget
                </button>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <DataTable columns={columns} data={budgets} searchable exportable />
            </motion.div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editItem ? 'Edit Budget' : 'Create Budget'} size="medium">
                <div className="form-grid">
                    <FormInput label="Fiscal Year *" type="number" placeholder="2024" value={formData.fiscalYear} onChange={(e) => setFormData({ ...formData, fiscalYear: e.target.value })} />
                    <FormSelect label="Period *" options={[
                        { value: 'monthly', label: 'Monthly' },
                        { value: 'quarterly', label: 'Quarterly' },
                        { value: 'annually', label: 'Annually' }
                    ]} value={formData.period} onChange={(e) => setFormData({ ...formData, period: e.target.value })} />
                </div>
                <FormSelect label="Account *" options={getChartOfAccounts().map(a => ({ value: a.id, label: `${a.code} - ${a.name}` }))} value={formData.accountId} onChange={(e) => setFormData({ ...formData, accountId: e.target.value })} />
                <div className="form-grid">
                    <FormInput label="Budgeted Amount *" type="number" placeholder="0" value={formData.budgetedAmount} onChange={(e) => setFormData({ ...formData, budgetedAmount: parseFloat(e.target.value) || 0 })} />
                    <FormInput label="Actual Amount" type="number" placeholder="0" value={formData.actualAmount} onChange={(e) => setFormData({ ...formData, actualAmount: parseFloat(e.target.value) || 0 })} />
                </div>
                <ModalFooter>
                    <button className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                    <button className="btn-primary" onClick={handleSave}>{editItem ? 'Update' : 'Create'} Budget</button>
                </ModalFooter>
            </Modal>

            <style>{`
                .btn-primary { display: flex; align-items: center; gap: 8px; padding: 12px 20px; background: var(--accent-gradient); border-radius: var(--radius-md); color: white; border: none; cursor: pointer; font-weight: 600; }
                .btn-secondary { padding: 12px 20px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-secondary); cursor: pointer; }
                .fiscal-year { font-family: 'JetBrains Mono', monospace; font-weight: 600; color: var(--accent-primary); }
                .period-badge { padding: 4px 10px; background: rgba(99, 102, 241, 0.15); color: #8b5cf6; border-radius: 12px; font-size: 0.75rem; text-transform: capitalize; }
                .amount { font-weight: 600; }
                .amount.budgeted { color: var(--text-primary); }
                .amount.actual { color: var(--success); }
                .variance { font-weight: 700; }
                .variance.positive { color: var(--success); }
                .variance.negative { color: var(--error); }
                .status-badge { padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; text-transform: capitalize; }
                .status-badge.active { background: rgba(34, 197, 94, 0.15); color: #22c55e; }
                .status-badge.inactive { background: rgba(156, 163, 175, 0.15); color: #9ca3af; }
                .action-buttons { display: flex; gap: 8px; }
                .btn-edit { padding: 8px 12px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-secondary); cursor: pointer; font-size: 0.85rem; }
                .btn-delete { padding: 8px 12px; background: rgba(239, 68, 68, 0.1); border: 1px solid var(--error); border-radius: 8px; color: var(--error); cursor: pointer; font-size: 0.85rem; }
                .btn-delete:hover { background: var(--error); color: white; }
            `}</style>
        </div>
    )
}

export default Budgets