import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, CheckCircle, FileText } from 'lucide-react'
import DataTable from '../../components/DataTable'
import Modal, { ModalFooter } from '../../components/Modal'
import FormInput from '../../components/FormInput'
import { useToast } from '../../components/Toast'
import { getBankAccounts, createBankAccount, getBankReconciliationReport, reconcileTransaction } from '../../stores/accountingStore'
import { formatCurrency, getSettings, CURRENCIES } from '../../stores/settingsStore'

function BankAccounts() {
    const toast = useToast()
    const [accounts, setAccounts] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isReconcileModalOpen, setIsReconcileModalOpen] = useState(false)
    const [selectedAccount, setSelectedAccount] = useState(null)
    const [brsReport, setBrsReport] = useState(null)
    const [formData, setFormData] = useState({
        accountName: '', accountNumber: '', bankName: '', accountType: 'checking', openingBalance: 0, currency: getSettings().currency || 'INR', status: 'active'
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
            currency: getSettings().currency || 'INR',
            status: 'active'
        })
        setIsModalOpen(true)
    }

    const handleReconcile = (account) => {
        const report = getBankReconciliationReport(account.id, new Date().toISOString().split('T')[0])
        setBrsReport(report)
        setSelectedAccount(account)
        setIsReconcileModalOpen(true)
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
        { key: 'currentBalance', label: 'Book Balance', render: (v, row) => <span className="amount">{formatCurrency(v || 0, row.currency)}</span> },
        {
            key: 'actions', label: 'Actions', render: (_, row) => (
                <button className="btn-icon" onClick={() => handleReconcile(row)} title="Reconcile">
                    <CheckCircle size={16} />
                </button>
            )
        }
    ]

    return (
        <div className="page">
            <motion.div className="page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <div>
                    <h1 className="page-title"><span className="gradient-text">Bank</span> Accounts</h1>
                    <p className="page-description">
                        Manage bank accounts and perform reconciliations (BRS).
                    </p>
                </div>
                <button className="btn-primary" onClick={handleAdd}>
                    <Plus size={20} /> Add Account
                </button>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <DataTable columns={columns} data={accounts} searchable exportable />
            </motion.div>

            {/* Add Account Modal */}
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
                    <div className="form-group">
                        <label>Currency</label>
                        <select className="form-select" value={formData.currency} onChange={e => setFormData({ ...formData, currency: e.target.value })}>
                            {Object.keys(CURRENCIES).map(code => (
                                <option key={code} value={code}>{code} - {CURRENCIES[code].name}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <ModalFooter>
                    <button className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                    <button className="btn-primary" onClick={handleSave}>Add Account</button>
                </ModalFooter>
            </Modal>

            {/* Reconciliation Modal */}
            <Modal isOpen={isReconcileModalOpen} onClose={() => setIsReconcileModalOpen(false)} title={`Reconciliation: ${selectedAccount?.bankName}`} size="large">
                {brsReport && (
                    <div className="brs-container">
                        <div className="brs-summary">
                            <div className="summary-item">
                                <span className="label">Book Balance:</span>
                                <span className="value">{formatCurrency(brsReport.bookBalance)}</span>
                            </div>
                            <div className="summary-item text-green">
                                <span className="label">Add: Unpresented Cheques:</span>
                                <span className="value">+{formatCurrency(brsReport.unclearedCredits.reduce((sum, e) => sum + e.amount, 0))}</span>
                            </div>
                            <div className="summary-item text-red">
                                <span className="label">Less: Uncleared Deposits:</span>
                                <span className="value">-{formatCurrency(brsReport.unclearedDebits.reduce((sum, e) => sum + e.amount, 0))}</span>
                            </div>
                            <div className="summary-item total">
                                <span className="label">Bank Balance (Virtual):</span>
                                <span className="value">{formatCurrency(brsReport.bankBalance)}</span>
                            </div>
                        </div>

                        <h3>Uncleared Transactions</h3>
                        <div className="unreconciled-list">
                            {brsReport.unclearedDebits.concat(brsReport.unclearedCredits).length === 0 ? (
                                <p className="text-muted">All transactions are reconciled!</p>
                            ) : (
                                brsReport.unclearedDebits.concat(brsReport.unclearedCredits).map(entry => (
                                    <div key={entry.id} className="transaction-row">
                                        <span>{entry.journalNumber}</span>
                                        <span>{entry.entryDate}</span>
                                        <span>{entry.instrumentNumber || 'N/A'}</span>
                                        <span className={entry.amount > 0 ? 'text-green' : 'text-red'}>
                                            {formatCurrency(entry.amount)}
                                        </span>
                                        <button className="btn-xs" onClick={() => {
                                            reconcileTransaction(entry.id, new Date().toISOString().split('T')[0])
                                            handleReconcile(selectedAccount) // Refresh report
                                            toast.success('Transaction Reconciled')
                                        }}>
                                            Mark Cleared
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
                <ModalFooter>
                    <button className="btn-secondary" onClick={() => setIsReconcileModalOpen(false)}>Close</button>
                </ModalFooter>
            </Modal>

            <style>{`
                .btn-icon { padding: 8px; background: rgba(99, 102, 241, 0.1); color: var(--accent-primary); border: none; border-radius: 8px; cursor: pointer; transition: all 0.2s; }
                .btn-icon:hover { background: var(--accent-primary); color: white; }
                .brs-container { display: flex; flex-direction: column; gap: 20px; }
                .brs-summary { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; background: var(--bg-secondary); padding: 15px; border-radius: var(--radius-md); }
                .summary-item { display: flex; justify-content: space-between; font-size: 0.9rem; }
                .summary-item.total { font-weight: 700; border-top: 1px solid var(--border-color); padding-top: 10px; margin-top: 5px; font-size: 1rem; }
                .text-green { color: var(--success); }
                .text-red { color: var(--error); }
                .text-muted { color: var(--text-secondary); text-align: center; padding: 20px; }
                .transaction-row { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr auto; gap: 10px; align-items: center; padding: 10px; border-bottom: 1px solid var(--border-color); font-size: 0.9rem; }
                .transaction-row:last-child { border-bottom: none; }
                .btn-xs { padding: 4px 8px; font-size: 0.75rem; background: var(--success); color: white; border: none; border-radius: 4px; cursor: pointer; }
                
                .btn-primary { display: flex; align-items: center; gap: 8px; padding: 12px 20px; background: var(--accent-gradient); border-radius: var(--radius-md); color: white; border: none; cursor: pointer; font-weight: 600; }
                .btn-secondary { padding: 12px 20px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-secondary); cursor: pointer; }
                .account-name { font-weight: 600; color: var(--text-primary); }
                .account-number { font-family: 'JetBrains Mono', monospace; color: var(--accent-primary); }
                .amount { font-weight: 600; color: var(--success); }
            `}</style>
        </div>
    )
}

export default BankAccounts