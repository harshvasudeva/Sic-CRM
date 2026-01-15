import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import DataTable from '../../components/DataTable'
import Modal, { ModalFooter } from '../../components/Modal'
import FormInput, { FormTextarea, FormSelect } from '../../components/FormInput'
import { useToast } from '../../components/Toast'
import { getJournalEntries, createJournalEntry, getChartOfAccounts } from '../../stores/accountingStore'

function JournalEntries() {
    const toast = useToast()
    const [entries, setEntries] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [formData, setFormData] = useState({
        entryDate: '', reference: '', description: '', debitAccountId: '', creditAccountId: '', amount: 0, status: 'posted'
    })

    useEffect(() => {
        loadData()
    }, [])

    const loadData = () => {
        setEntries(getJournalEntries())
    }

    const handleAdd = () => {
        setFormData({
            entryDate: new Date().toISOString().split('T')[0],
            reference: '',
            description: '',
            debitAccountId: '',
            creditAccountId: '',
            amount: 0,
            status: 'posted'
        })
        setIsModalOpen(true)
    }

    const handleSave = () => {
        createJournalEntry(formData)
        toast.success('Journal entry posted')
        setIsModalOpen(false)
        loadData()
    }

    const columns = [
        { key: 'entryNumber', label: 'Entry #', render: (v) => <span className="entry-number">{v}</span> },
        { key: 'entryDate', label: 'Date', render: (v) => <span>{new Date(v).toLocaleDateString()}</span> },
        { key: 'reference', label: 'Reference', render: (v) => <span className="reference">{v}</span> },
        { key: 'debitAccountId', label: 'Debit Account', render: (v) => {
            const account = getChartOfAccounts().find(a => a.id === v)
            return account ? `${account.code} - ${account.name}` : '-'
        }},
        { key: 'creditAccountId', label: 'Credit Account', render: (v) => {
            const account = getChartOfAccounts().find(a => a.id === v)
            return account ? `${account.code} - ${account.name}` : '-'
        }},
        { key: 'amount', label: 'Amount', render: (v) => <span className="amount">${v.toLocaleString()}</span> },
        { key: 'status', label: 'Status', render: (v) => (
            <span className={`status-badge ${v}`}>
                {v.charAt(0).toUpperCase() + v.slice(1)}
            </span>
        )},
        { key: 'status', label: 'Status', render: (v) => (
            <span className={`status-badge ${v}`}>
                {v.charAt(0).toUpperCase() + v.slice(1)}
            </span>
        )}
    ]

    return (
        <div className="page">
            <motion.div className="page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <div>
                    <h1 className="page-title"><span className="gradient-text">Journal</span> Entries</h1>
                    <p className="page-description">
                        Record and manage journal entries for all financial transactions.
                    </p>
                </div>
                <button className="btn-primary" onClick={handleAdd}>
                    <Plus size={20} /> Create Entry
                </button>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <DataTable columns={columns} data={entries} searchable exportable />
            </motion.div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Journal Entry" size="large">
                <div className="form-grid">
                    <FormInput label="Entry Date *" type="date" value={formData.entryDate} onChange={(e) => setFormData({ ...formData, entryDate: e.target.value })} />
                    <FormInput label="Reference" placeholder="INV-001" value={formData.reference} onChange={(e) => setFormData({ ...formData, reference: e.target.value })} />
                </div>
                <FormTextarea label="Description *" placeholder="Payment for invoice..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2} />
                <div className="form-grid">
                    <FormSelect label="Debit Account *" options={getChartOfAccounts().map(a => ({ value: a.id, label: `${a.code} - ${a.name}` }))} value={formData.debitAccountId} onChange={(e) => setFormData({ ...formData, debitAccountId: e.target.value })} />
                    <FormSelect label="Credit Account *" options={getChartOfAccounts().map(a => ({ value: a.id, label: `${a.code} - ${a.name}` }))} value={formData.creditAccountId} onChange={(e) => setFormData({ ...formData, creditAccountId: e.target.value })} />
                </div>
                <div className="form-grid">
                    <FormInput label="Amount *" type="number" placeholder="0.00" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })} />
                    <FormInput label="Status" readOnly value={formData.status} />
                </div>
                <ModalFooter>
                    <button className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                    <button className="btn-primary" onClick={handleSave}>Post Entry</button>
                </ModalFooter>
            </Modal>

            <style>{`
                .btn-primary { display: flex; align-items: center; gap: 8px; padding: 12px 20px; background: var(--accent-gradient); border-radius: var(--radius-md); color: white; border: none; cursor: pointer; font-weight: 600; }
                .btn-secondary { padding: 12px 20px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-secondary); cursor: pointer; }
                .entry-number { font-family: 'JetBrains Mono', monospace; font-weight: 600; color: var(--accent-primary); }
                .reference { font-family: 'JetBrains Mono', monospace; font-weight: 500; color: var(--text-secondary); }
                .amount { font-weight: 600; color: var(--success); }
                .status-badge { padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; text-transform: capitalize; }
                .status-badge.posted { background: rgba(34, 197, 94, 0.15); color: #22c55e; }
                .status-badge.draft { background: rgba(156, 163, 175, 0.15); color: #9ca3af; }
                .action-buttons { display: flex; gap: 8px; }
                .btn-delete { padding: 8px 12px; background: rgba(239, 68, 68, 0.1); border: 1px solid var(--error); border-radius: 8px; color: var(--error); cursor: pointer; font-size: 0.85rem; }
                .btn-delete:hover { background: var(--error); color: white; }
            `}</style>
        </div>
    )
}

export default JournalEntries