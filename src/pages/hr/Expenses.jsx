import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Receipt, Plus, Check, Clock, Banknote, Filter } from 'lucide-react'
import { getExpenses, getEmployees, submitExpense, approveExpense } from '../../stores/hrStore'
import { formatCurrency } from '../../stores/settingsStore'
import DataTable from '../../components/DataTable'
import Modal, { ModalFooter } from '../../components/Modal'
import FormInput, { FormTextarea, FormSelect } from '../../components/FormInput'
import { useToast } from '../../components/Toast'

const expenseCategories = [
    { value: 'travel', label: 'Travel' },
    { value: 'meals', label: 'Meals' },
    { value: 'software', label: 'Software' },
    { value: 'equipment', label: 'Equipment' },
    { value: 'office', label: 'Office Supplies' },
    { value: 'other', label: 'Other' }
]

function Expenses() {
    const toast = useToast()
    const [expenses, setExpenses] = useState([])
    const [employees, setEmployees] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [filterStatus, setFilterStatus] = useState('')
    const [formData, setFormData] = useState({ employeeId: '', category: 'travel', amount: '', description: '', date: '' })

    const loadData = async () => {
        setExpenses(await getExpenses(filterStatus ? { status: filterStatus } : {}))
        setEmployees(await getEmployees())
    }

    useEffect(() => { loadData() }, [filterStatus])

    const handleSubmit = async () => {
        if (!formData.employeeId || !formData.amount) {
            toast.error('Please fill required fields')
            return
        }
        await submitExpense({ ...formData, amount: parseFloat(formData.amount) })
        toast.success('Expense submitted')
        setIsModalOpen(false)
        setFormData({ employeeId: '', category: 'travel', amount: '', description: '', date: '' })
        await loadData()
    }

    const handleApprove = async (id) => {
        await approveExpense(id, 'emp-005')
        toast.success('Expense approved')
        await loadData()
    }

    const getEmployeeName = (id) => {
        const emp = employees.find(e => e.id === id)
        return emp ? `${emp.firstName} ${emp.lastName}` : 'Unknown'
    }

    const employeeOptions = employees.map(e => ({ value: e.id, label: `${e.firstName} ${e.lastName}` }))

    const totalPending = expenses.filter(e => e.status === 'pending').reduce((sum, e) => sum + e.amount, 0)
    const totalApproved = expenses.filter(e => e.status === 'approved').reduce((sum, e) => sum + e.amount, 0)

    const columns = [
        { key: 'employeeId', label: 'Employee', render: (v) => getEmployeeName(v) },
        { key: 'category', label: 'Category', render: (v) => <span className={`cat-badge ${v}`}>{v}</span> },
        { key: 'amount', label: 'Amount', render: (v) => formatCurrency(v) },
        { key: 'description', label: 'Description' },
        { key: 'date', label: 'Date' },
        { key: 'status', label: 'Status', render: (v) => <span className={`status-badge ${v}`}>{v === 'approved' ? <Check size={14} /> : <Clock size={14} />} {v}</span> },
        { key: 'actions', label: '', sortable: false, render: (_, row) => row.status === 'pending' ? <button className="approve-btn" onClick={() => handleApprove(row.id)}>Approve</button> : '—' }
    ]

    return (
        <div className="page">
            <motion.div className="page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <div>
                    <h1 className="page-title"><span className="gradient-text">Expenses</span></h1>
                    <p className="page-description">Track and approve employee expense claims.</p>
                </div>
                <button className="btn-primary" onClick={() => setIsModalOpen(true)}><Plus size={20} /> Submit Expense</button>
            </motion.div>

            <div className="expense-stats">
                <div className="exp-stat orange"><Clock size={20} /><span>{formatCurrency(totalPending)}</span><small>Pending</small></div>
                <div className="exp-stat green"><Check size={20} /><span>{formatCurrency(totalApproved)}</span><small>Approved</small></div>
            </div>

            <div className="filters-bar">
                <div className="filter-group">
                    <Filter size={18} />
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                        <option value="">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                    </select>
                </div>
            </div>

            <DataTable columns={columns} data={expenses} searchable exportable />

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Submit Expense" size="medium">
                <div className="form-grid">
                    <FormSelect label="Employee *" options={employeeOptions} value={formData.employeeId} onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })} />
                    <FormSelect label="Category" options={expenseCategories} value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} />
                    <FormInput label="Amount *" type="number" icon={Banknote} value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} />
                    <FormInput label="Date" type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
                </div>
                <FormTextarea label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2} />
                <ModalFooter>
                    <button className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                    <button className="btn-primary" onClick={handleSubmit}>Submit</button>
                </ModalFooter>
            </Modal>

            <style>{`
        .page-header { display: flex; justify-content: space-between; }
        .btn-primary { display: flex; align-items: center; gap: 8px; padding: 12px 20px; background: var(--accent-gradient); border-radius: var(--radius-md); color: white; }
        .btn-secondary { padding: 12px 20px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-secondary); }
        .expense-stats { display: flex; gap: 16px; margin-bottom: 24px; }
        .exp-stat { display: flex; align-items: center; gap: 12px; padding: 16px 24px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); }
        .exp-stat.orange svg { color: var(--warning); }
        .exp-stat.green svg { color: var(--success); }
        .exp-stat span { font-size: 1.25rem; font-weight: 700; }
        .exp-stat small { font-size: 0.85rem; color: var(--text-muted); }
        .filters-bar { display: flex; gap: 16px; margin-bottom: 24px; }
        .filter-group { display: flex; align-items: center; gap: 8px; padding: 8px 14px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); }
        .filter-group svg { color: var(--text-muted); }
        .filter-group select { background: transparent; border: none; color: var(--text-primary); }
        .cat-badge { padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; text-transform: capitalize; background: rgba(139, 92, 246, 0.15); color: #8b5cf6; }
        .status-badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 12px; font-size: 0.8rem; text-transform: capitalize; }
        .status-badge.pending { background: rgba(245, 158, 11, 0.15); color: var(--warning); }
        .status-badge.approved { background: rgba(16, 185, 129, 0.15); color: var(--success); }
        .approve-btn { padding: 6px 12px; background: rgba(16, 185, 129, 0.15); color: var(--success); border-radius: var(--radius-sm); font-size: 0.8rem; }
        .form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 16px; }
      `}</style>
        </div>
    )
}

export default Expenses
