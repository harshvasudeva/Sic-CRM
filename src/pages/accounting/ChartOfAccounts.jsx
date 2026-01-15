import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import DataTable from '../../components/DataTable'
import Modal, { ModalFooter } from '../../components/Modal'
import FormInput, { FormSelect } from '../../components/FormInput'
import { useToast } from '../../components/Toast'
import { getChartOfAccounts, createAccount, deleteAccount } from '../../stores/accountingStore'

function ChartOfAccounts() {
    const toast = useToast()
    const [accounts, setAccounts] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [formData, setFormData] = useState({
        code: '', name: '', type: 'asset', subType: '', normalBalance: 'debit', isActive: true
    })

    useEffect(() => {
        loadData()
    }, [])

    const loadData = () => {
        setAccounts(getChartOfAccounts())
    }

    const handleAdd = () => {
        setFormData({
            code: '',
            name: '',
            type: 'asset',
            subType: '',
            normalBalance: 'debit',
            isActive: true
        })
        setIsModalOpen(true)
    }

    const handleSave = () => {
        createAccount(formData)
        toast.success('Account added')
        setIsModalOpen(false)
        loadData()
    }

    const handleDelete = (id) => {
        if (confirm('Are you sure? This will affect financial reports.')) {
            deleteAccount(id)
            toast.success('Account deleted')
            loadData()
        }
    }

    const getTypeColor = (type) => {
        const colors = {
            asset: 'asset',
            liability: 'liability',
            equity: 'equity',
            revenue: 'revenue',
            expense: 'expense'
        }
        return colors[type] || 'other'
    }

    const columns = [
        { key: 'code', label: 'Code', render: (v) => <span className="account-code">{v}</span> },
        { key: 'name', label: 'Account Name', render: (v) => <span className="account-name">{v}</span> },
        { key: 'type', label: 'Type', render: (v) => (
            <span className={`type-badge ${getTypeColor(v)}`}>{v}</span>
        )},
        { key: 'subType', label: 'Sub Type', render: (v) => <span>{v || '-'}</span> },
        { key: 'normalBalance', label: 'Normal Balance', render: (v) => (
            <span className={`balance-badge ${v}`}>{v}</span>
        )},
        { key: 'balance', label: 'Current Balance', render: (v) => <span className="amount">${v.toLocaleString()}</span> },
        { key: 'isActive', label: 'Status', render: (v) => (
            <span className={`status-badge ${v ? 'active' : 'inactive'}`}>{v ? 'Active' : 'Inactive'}</span>
        )},
        { key: 'actions', label: 'Actions', render: (_, row) => (
            <button className="btn-delete" onClick={() => handleDelete(row.id)}>Delete</button>
        )}
    ]

    const getAccountCounts = () => {
        return {
            assets: accounts.filter(a => a.type === 'asset').length,
            liabilities: accounts.filter(a => a.type === 'liability').length,
            equity: accounts.filter(a => a.type === 'equity').length,
            revenue: accounts.filter(a => a.type === 'revenue').length,
            expenses: accounts.filter(a => a.type === 'expense').length
        }
    }

    const counts = getAccountCounts()

    return (
        <div className="page">
            <motion.div className="page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <div>
                    <h1 className="page-title"><span className="gradient-text">Chart of</span> Accounts</h1>
                    <p className="page-description">
                        Manage your chart of accounts for financial reporting.
                    </p>
                </div>
                <button className="btn-primary" onClick={handleAdd}>
                    <Plus size={20} /> Add Account
                </button>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <div className="stats-row">
                    <div className="stat-card">
                        <div className="stat-label">Assets</div>
                        <div className="stat-value">{counts.assets}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Liabilities</div>
                        <div className="stat-value">{counts.liabilities}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Equity</div>
                        <div className="stat-value">{counts.equity}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Revenue</div>
                        <div className="stat-value">{counts.revenue}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Expenses</div>
                        <div className="stat-value">{counts.expenses}</div>
                    </div>
                </div>

                <DataTable columns={columns} data={accounts} searchable exportable />
            </motion.div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Account" size="medium">
                <div className="form-grid">
                    <FormInput label="Account Code *" placeholder="1000" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} />
                    <FormInput label="Account Name *" placeholder="Cash" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                </div>
                <div className="form-grid">
                    <FormSelect label="Account Type *" options={[
                        { value: 'asset', label: 'Asset' },
                        { value: 'liability', label: 'Liability' },
                        { value: 'equity', label: 'Equity' },
                        { value: 'revenue', label: 'Revenue' },
                        { value: 'expense', label: 'Expense' }
                    ]} value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} />
                    <FormInput label="Sub Type" placeholder="Current Asset" value={formData.subType} onChange={(e) => setFormData({ ...formData, subType: e.target.value })} />
                </div>
                <FormSelect label="Normal Balance *" options={[
                    { value: 'debit', label: 'Debit' },
                    { value: 'credit', label: 'Credit' }
                ]} value={formData.normalBalance} onChange={(e) => setFormData({ ...formData, normalBalance: e.target.value })} />
                <ModalFooter>
                    <button className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                    <button className="btn-primary" onClick={handleSave}>Add Account</button>
                </ModalFooter>
            </Modal>

            <style>{`
                .btn-primary { display: flex; align-items: center; gap: 8px; padding: 12px 20px; background: var(--accent-gradient); border-radius: var(--radius-md); color: white; border: none; cursor: pointer; font-weight: 600; }
                .btn-secondary { padding: 12px 20px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-secondary); cursor: pointer; }
                .stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px; margin-bottom: 24px; }
                .stat-card { padding: 20px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); }
                .stat-label { font-size: 0.85rem; color: var(--text-muted); margin-bottom: 8px; }
                .stat-value { font-size: 1.5rem; font-weight: 700; color: var(--text-primary); }
                .account-code { font-family: 'JetBrains Mono', monospace; font-weight: 600; color: var(--accent-primary); }
                .account-name { font-weight: 600; color: var(--text-primary); }
                .type-badge { padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; text-transform: capitalize; }
                .type-badge.asset { background: rgba(59, 130, 246, 0.15); color: #3b82f6; }
                .type-badge.liability { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
                .type-badge.equity { background: rgba(34, 197, 94, 0.15); color: #22c55e; }
                .type-badge.revenue { background: rgba(168, 85, 247, 0.15); color: #a855f7; }
                .type-badge.expense { background: rgba(251, 191, 36, 0.15); color: #fbbf24; }
                .balance-badge { padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; text-transform: capitalize; }
                .balance-badge.debit { background: rgba(34, 197, 94, 0.15); color: #22c55e; }
                .balance-badge.credit { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
                .amount { font-weight: 600; color: var(--success); }
                .status-badge { padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; }
                .status-badge.active { background: rgba(34, 197, 94, 0.15); color: #22c55e; }
                .status-badge.inactive { background: rgba(156, 163, 175, 0.15); color: #9ca3af; }
                .btn-delete { padding: 8px 12px; background: rgba(239, 68, 68, 0.1); border: 1px solid var(--error); border-radius: 8px; color: var(--error); cursor: pointer; font-size: 0.85rem; }
                .btn-delete:hover { background: var(--error); color: white; }
            `}</style>
        </div>
    )
}

export default ChartOfAccounts