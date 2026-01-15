import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import DataTable from '../../components/DataTable'
import Modal, { ModalFooter } from '../../components/Modal'
import FormInput from '../../components/FormInput'
import { useToast } from '../../components/Toast'
import { getBankAccounts, createBankAccount } from '../../stores/accountingStore'

function BankAccounts() {
    const toast = useToast()
    const [accounts, setAccounts] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [formData, setFormData] = useState({
        accountName: '', accountNumber: '', bankName: '', accountType: 'checking', openingBalance: 0, currency: 'USD', status: 'active'
    })

    useEffect(() => {
        loadData()
    }, [])

    const loadData = () => {
        setAccounts(getBankAccounts())
    }

    const handleAdd = () => {
        setFormData({
            accountName: '',
            accountNumber: '',
            bankName: '',
            accountType: 'checking',
            openingBalance: 0,
            currency: 'USD',
            status: 'active'
        })
        setIsModalOpen(true)
    }

    const handleSave = () => {
        createBankAccount(formData)
        toast.success('Bank account added')
        setIsModalOpen(false)
        loadData()
    }

    const columns = [
        { key: 'accountName', label: 'Account Name', render: (v) => <span className="account-name">{v}</span> },
        { key: 'accountNumber', label: 'Account Number', render: (v) => <span className="account-number">{v}</span> },
        { key: 'bankName', label: 'Bank', render: (v) => <span>{v}</span> },
        { key: 'accountType', label: 'Type', render: (v) => <span className="type-badge">{v}</span> },
        { key: 'openingBalance', label: 'Opening Balance', render: (v) => <span className="amount">${v.toLocaleString()}</span> },
        { key: 'currentBalance', label: 'Current Balance', render: (v) => <span className="amount">${v.toLocaleString()}</span> },
        { key: 'currency', label: 'Currency', render: (v) => <span className="currency">{v}</span> },
        { key: 'status', label: 'Status', render: (v) => (
            <span className={`status-badge ${v}`}>{v}</span>
        )}
    ]

    return (
        <div className="page">
            <motion.div className="page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <div>
                    <h1 className="page-title"><span className="gradient-text">Bank</span> Accounts</h1>
                    <p className="page-description">
                        Manage bank accounts and track balances.
                    </p>
                </div>
                <button className="btn-primary" onClick={handleAdd}>
                    <Plus size={20} /> Add Account
                </button>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <DataTable columns={columns} data={accounts} searchable exportable />
            </motion.div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Bank Account" size="medium">
                <div className="form-grid">
                    <FormInput label="Account Name *" placeholder="Main Operating Account" value={formData.accountName} onChange={(e) => setFormData({ ...formData, accountName: e.target.value })} />
                    <FormInput label="Account Number *" placeholder="1234567890" value={formData.accountNumber} onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })} />
                </div>
                <div className="form-grid">
                    <FormInput label="Bank Name *" placeholder="Chase Bank" value={formData.bankName} onChange={(e) => setFormData({ ...formData, bankName: e.target.value })} />
                    <FormInput label="Account Type" readOnly value={formData.accountType} />
                </div>
                <div className="form-grid">
                    <FormInput label="Opening Balance *" type="number" placeholder="0" value={formData.openingBalance} onChange={(e) => setFormData({ ...formData, openingBalance: parseFloat(e.target.value) || 0 })} />
                    <FormInput label="Currency" readOnly value={formData.currency} />
                </div>
                <ModalFooter>
                    <button className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                    <button className="btn-primary" onClick={handleSave}>Add Account</button>
                </ModalFooter>
            </Modal>

            <style>{`
                .btn-primary { display: flex; align-items: center; gap: 8px; padding: 12px 20px; background: var(--accent-gradient); border-radius: var(--radius-md); color: white; border: none; cursor: pointer; font-weight: 600; }
                .btn-secondary { padding: 12px 20px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-secondary); cursor: pointer; }
                .account-name { font-weight: 600; color: var(--text-primary); }
                .account-number { font-family: 'JetBrains Mono', monospace; color: var(--accent-primary); }
                .type-badge { padding: 4px 10px; background: rgba(99, 102, 241, 0.15); color: #8b5cf6; border-radius: 12px; font-size: 0.75rem; text-transform: capitalize; }
                .amount { font-weight: 600; color: var(--success); }
                .currency { font-weight: 600; color: var(--text-secondary); }
                .status-badge { padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; text-transform: capitalize; }
                .status-badge.active { background: rgba(34, 197, 94, 0.15); color: #22c55e; }
                .status-badge.inactive { background: rgba(156, 163, 175, 0.15); color: #9ca3af; }
                .btn-delete { padding: 8px 12px; background: rgba(239, 68, 68, 0.1); border: 1px solid var(--error); border-radius: 8px; color: var(--error); cursor: pointer; font-size: 0.85rem; }
                .btn-delete:hover { background: var(--error); color: white; }
            `}</style>
        </div>
    )
}

export default BankAccounts