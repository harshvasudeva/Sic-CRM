import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import DataTable from '../../components/DataTable'
import Modal, { ModalFooter } from '../../components/Modal'
import FormInput, { FormTextarea, FormSelect } from '../../components/FormInput'
import { useToast } from '../../components/Toast'
import { getExpenses, createExpense, getChartOfAccounts, getBankAccounts } from '../../stores/accountingStore'
import { formatCurrency } from '../../stores/settingsStore'

function Expenses() {
    const toast = useToast()
    const [expenses, setExpenses] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editItem, setEditItem] = useState(null)
    const [formData, setFormData] = useState({
        expenseDate: '', category: '', amount: 0, accountId: '', description: '', paymentMethod: '', status: 'pending', approvedBy: ''
    })

    useEffect(() => {
        loadData()
    }, [])

    const loadData = () => {
        setExpenses(getExpenses())
    }

    const handleAdd = () => {
        setFormData({
            expenseDate: new Date().toISOString().split('T')[0],
            category: '',
            amount: 0,
            accountId: '',
            description: '',
            paymentMethod: '',
            status: 'pending',
            approvedBy: ''
        })
        setEditItem(null)
        setIsModalOpen(true)
    }

    const handleSave = () => {
        createExpense(formData)
        toast.success('Expense created')
        setIsModalOpen(false)
        loadData()
    }

    const columns = [
        { key: 'expenseNumber', label: 'Expense #', render: (v) => <span className="expense-number">{v}</span> },
        { key: 'expenseDate', label: 'Date', render: (v) => <span>{new Date(v).toLocaleDateString()}</span> },
        { key: 'category', label: 'Category', render: (v) => <span className="category-badge">{v}</span> },
        { key: 'description', label: 'Description' },
        { key: 'amount', label: 'Amount', render: (v) => <span className="amount">{formatCurrency(v || 0)}</span> },
        { key: 'paymentMethod', label: 'Payment Method', render: (v) => <span>{v}</span> },
        {
            key: 'status', label: 'Status', render: (v) => (
                <span className={`status-badge ${v}`}>{v}</span>
            )
        },
        {
            key: 'status', label: 'Status', render: (v) => (
                <span className={`status-badge ${v}`}>{v}</span>
            )
        }
    ]

    return (
        <div className="page">
            <motion.div className="page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <div>
                    <h1 className="page-title"><span className="gradient-text">Expense</span> Management</h1>
                    <p className="page-description">
                        Track and manage business expenses with approval workflow.
                    </p>
                </div>
                <button className="btn-primary" onClick={handleAdd}>
                    <Plus size={20} /> Create Expense
                </button>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <DataTable columns={columns} data={expenses} searchable exportable />
            </motion.div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Expense" size="medium">
                <div className="form-grid">
                    <FormInput label="Expense Date *" type="date" value={formData.expenseDate} onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })} />
                    <FormSelect label="Category *" options={[
                        { value: 'office', label: 'Office' },
                        { value: 'travel', label: 'Travel' },
                        { value: 'entertainment', label: 'Entertainment' },
                        { value: 'marketing', label: 'Marketing' },
                        { value: 'utilities', label: 'Utilities' },
                        { value: 'rent', label: 'Rent' },
                        { value: 'salaries', label: 'Salaries' },
                        { value: 'other', label: 'Other' }
                    ]} value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} />
                </div>
                <FormInput label="Description *" placeholder="Office supplies..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                <div className="form-grid">
                    <FormInput label="Amount *" type="number" placeholder="0" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })} />
                    <FormSelect label="Payment Method" options={[
                        { value: 'cash', label: 'Cash' },
                        { value: 'credit_card', label: 'Credit Card' },
                        { value: 'bank_transfer', label: 'Bank Transfer' },
                        { value: 'check', label: 'Check' }
                    ]} value={formData.paymentMethod} onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })} />
                </div>
                <div className="form-grid">
                    <FormSelect label="Account" options={getBankAccounts().map(a => ({ value: a.id, label: a.accountName }))} value={formData.accountId} onChange={(e) => setFormData({ ...formData, accountId: e.target.value })} />
                    <FormInput label="Status" readOnly value={formData.status} />
                </div>
                <ModalFooter>
                    <button className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                    <button className="btn-primary" onClick={handleSave}>Create Expense</button>
                </ModalFooter>
            </Modal>

            <style>{`
                .btn-primary { display: flex; align-items: center; gap: 8px; padding: 12px 20px; background: var(--accent-gradient); border-radius: var(--radius-md); color: white; border: none; cursor: pointer; font-weight: 600; }
                .btn-secondary { padding: 12px 20px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-secondary); cursor: pointer; }
                .expense-number { font-family: 'JetBrains Mono', monospace; font-weight: 600; color: var(--accent-primary); }
                .category-badge { padding: 4px 10px; background: rgba(99, 102, 241, 0.15); color: #8b5cf6; border-radius: 12px; font-size: 0.75rem; text-transform: capitalize; }
                .amount { font-weight: 600; color: var(--error); }
                .status-badge { padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; text-transform: capitalize; }
                .status-badge.pending { background: rgba(251, 191, 36, 0.15); color: #fbbf24; }
                .status-badge.approved { background: rgba(34, 197, 94, 0.15); color: #22c55e; }
                .status-badge.rejected { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
                .action-buttons { display: flex; gap: 8px; }
                .btn-edit { padding: 8px 12px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-secondary); cursor: pointer; font-size: 0.85rem; }
                .btn-delete { padding: 8px 12px; background: rgba(239, 68, 68, 0.1); border: 1px solid var(--error); border-radius: 8px; color: var(--error); cursor: pointer; font-size: 0.85rem; }
                .btn-delete:hover { background: var(--error); color: white; }
            `}</style>
        </div>
    )
}

export default Expenses