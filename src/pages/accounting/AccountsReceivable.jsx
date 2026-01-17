import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, ArrowRight } from 'lucide-react'
import DataTable from '../../components/DataTable'
import Modal, { ModalFooter } from '../../components/Modal'
import FormInput from '../../components/FormInput'
import { useToast } from '../../components/Toast'
import { getAccountsReceivable, createAccountsReceivable, getEstimates, createEstimate, convertEstimateToInvoice } from '../../stores/accountingStore'
import { formatCurrency } from '../../stores/settingsStore'

function AccountsReceivable() {
    const toast = useToast()
    const [activeTab, setActiveTab] = useState('invoices')
    const [invoices, setInvoices] = useState([])
    const [estimates, setEstimates] = useState([])

    // Modals
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false)
    const [isEstimateModalOpen, setIsEstimateModalOpen] = useState(false)

    // Forms
    const [invoiceForm, setInvoiceForm] = useState({ customerId: '', invoiceNumber: '', amount: 0, dueDate: '' })
    const [estimateForm, setEstimateForm] = useState({ customerId: '', estimateNumber: '', amount: 0, expiryDate: '' })

    useEffect(() => {
        loadData()
    }, [activeTab])

    const loadData = () => {
        setInvoices(getAccountsReceivable())
        setEstimates(getEstimates())
    }

    const handleCreateInvoice = () => {
        createAccountsReceivable(invoiceForm)
        toast.success('Invoice created')
        setIsInvoiceModalOpen(false)
        loadData()
    }

    const handleCreateEstimate = () => {
        createEstimate(estimateForm)
        toast.success('Estimate created')
        setIsEstimateModalOpen(false)
        loadData()
    }

    const handleConvert = (id) => {
        try {
            convertEstimateToInvoice(id)
            toast.success('Converted to Invoice')
            loadData()
            setActiveTab('invoices')
        } catch (err) {
            toast.error(err.message)
        }
    }

    const invoiceColumns = [
        { key: 'invoiceNumber', label: 'Invoice #', render: (v) => <span className="font-mono">{v}</span> },
        { key: 'customerId', label: 'Customer', render: (v) => <span className="font-bold">{v}</span> },
        { key: 'dueDate', label: 'Due Date', render: (v) => <span>{v}</span> },
        { key: 'amount', label: 'Amount', render: (v) => <span className="amount">{formatCurrency(v)}</span> },
        { key: 'balance', label: 'Balance', render: (v) => <span className="amount-due">{formatCurrency(v)}</span> },
        { key: 'status', label: 'Status', render: (v) => <span className={`status-badge ${v}`}>{v}</span> }
    ]

    const estimateColumns = [
        { key: 'estimateNumber', label: 'Estimate #', render: (v) => <span className="font-mono">{v}</span> },
        { key: 'customerId', label: 'Customer', render: (v) => <span className="font-bold">{v}</span> },
        { key: 'date', label: 'Date', render: (v) => <span>{v}</span> },
        { key: 'expiryDate', label: 'Expiry', render: (v) => <span>{v}</span> },
        { key: 'totalAmount', label: 'Amount', render: (v) => <span className="amount">{formatCurrency(v)}</span> },
        { key: 'status', label: 'Status', render: (v) => <span className={`status-badge ${v}`}>{v}</span> },
        {
            key: 'actions', label: 'Actions', render: (_, row) => (
                row.status !== 'invoiced' && (
                    <button className="btn-xs-primary" onClick={() => handleConvert(row.id)}>
                        Convert <ArrowRight size={12} />
                    </button>
                )
            )
        }
    ]

    return (
        <div className="page">
            <motion.div className="page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <div>
                    <h1 className="page-title"><span className="gradient-text">Accounts</span> Receivable</h1>
                    <p className="page-description">Manage customer invoices and estimates.</p>
                </div>
                <div className="header-actions">
                    <button className={activeTab === 'invoices' ? 'btn-tab active' : 'btn-tab'} onClick={() => setActiveTab('invoices')}>Invoices</button>
                    <button className={activeTab === 'estimates' ? 'btn-tab active' : 'btn-tab'} onClick={() => setActiveTab('estimates')}>Estimates</button>

                    <button className="btn-primary" onClick={() => activeTab === 'invoices' ? setIsInvoiceModalOpen(true) : setIsEstimateModalOpen(true)}>
                        <Plus size={20} /> New {activeTab === 'invoices' ? 'Invoice' : 'Estimate'}
                    </button>
                </div>
            </motion.div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-title">Total Receivables</div>
                    <div className="stat-value">{formatCurrency(invoices.reduce((sum, i) => sum + i.balance, 0))}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-title">Open Estimates</div>
                    <div className="stat-value">{estimates.filter(e => e.status === 'draft').length}</div>
                </div>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <DataTable
                    columns={activeTab === 'invoices' ? invoiceColumns : estimateColumns}
                    data={activeTab === 'invoices' ? invoices : estimates}
                    searchable
                />
            </motion.div>

            {/* Invoice Modal */}
            <Modal isOpen={isInvoiceModalOpen} onClose={() => setIsInvoiceModalOpen(false)} title="New Invoice">
                <div className="form-grid">
                    <FormInput label="Customer ID" value={invoiceForm.customerId} onChange={e => setInvoiceForm({ ...invoiceForm, customerId: e.target.value })} />
                    <FormInput label="Amount" type="number" value={invoiceForm.amount} onChange={e => setInvoiceForm({ ...invoiceForm, amount: parseFloat(e.target.value) })} />
                </div>
                <div className="form-grid">
                    <FormInput label="Invoice #" value={invoiceForm.invoiceNumber} onChange={e => setInvoiceForm({ ...invoiceForm, invoiceNumber: e.target.value })} />
                    <FormInput label="Due Date" type="date" value={invoiceForm.dueDate} onChange={e => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })} />
                </div>
                <ModalFooter>
                    <button className="btn-secondary" onClick={() => setIsInvoiceModalOpen(false)}>Cancel</button>
                    <button className="btn-primary" onClick={handleCreateInvoice}>Create Invoice</button>
                </ModalFooter>
            </Modal>

            {/* Estimate Modal */}
            <Modal isOpen={isEstimateModalOpen} onClose={() => setIsEstimateModalOpen(false)} title="New Estimate">
                <div className="form-grid">
                    <FormInput label="Customer ID" value={estimateForm.customerId} onChange={e => setEstimateForm({ ...estimateForm, customerId: e.target.value })} />
                    <FormInput label="Amount" type="number" value={estimateForm.amount} onChange={e => setEstimateForm({ ...estimateForm, amount: parseFloat(e.target.value) })} />
                </div>
                <div className="form-grid">
                    <FormInput label="Estimate #" value={estimateForm.estimateNumber} onChange={e => setEstimateForm({ ...estimateForm, estimateNumber: e.target.value })} />
                    <FormInput label="Expiry Date" type="date" value={estimateForm.expiryDate} onChange={e => setEstimateForm({ ...estimateForm, expiryDate: e.target.value })} />
                </div>
                <ModalFooter>
                    <button className="btn-secondary" onClick={() => setIsEstimateModalOpen(false)}>Cancel</button>
                    <button className="btn-primary" onClick={handleCreateEstimate}>Create Estimate</button>
                </ModalFooter>
            </Modal>

            <style>{`
                .header-actions { display: flex; gap: 10px; align-items: center; }
                .btn-tab { padding: 8px 16px; background: transparent; border: 1px solid var(--border-color); color: var(--text-secondary); border-radius: 8px; cursor: pointer; }
                .btn-tab.active { background: var(--bg-secondary); color: var(--accent-primary); border-color: var(--accent-primary); font-weight: 600; }
                .amount { font-weight: 600; color: var(--text-primary); }
                .amount-due { font-weight: 600; color: var(--error); }
                .btn-xs-primary { display: flex; align-items: center; gap: 4px; padding: 4px 8px; background: rgba(99, 102, 241, 0.1); color: var(--accent-primary); border: none; border-radius: 4px; font-size: 0.75rem; cursor: pointer; }
                .btn-xs-primary:hover { background: var(--accent-primary); color: white; }
                .status-badge { padding: 4px 8px; border-radius: 12px; font-size: 0.75rem; text-transform: capitalize; }
                .status-badge.draft { background: rgba(156, 163, 175, 0.1); color: #9ca3af; }
                .status-badge.sent { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
                .status-badge.invoiced { background: rgba(34, 197, 94, 0.1); color: #22c55e; }
                .font-mono { font-family: 'JetBrains Mono', monospace; }
                .font-bold { font-weight: 600; }
                
                .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 25px; }
                .stat-card { background: var(--bg-secondary); padding: 20px; border-radius: var(--radius-lg); border: 1px solid var(--border-color); }
                .stat-title { color: var(--text-secondary); font-size: 0.85rem; margin-bottom: 8px; }
                .stat-value { font-size: 1.5rem; font-weight: 700; color: var(--text-primary); }
                
                .btn-primary { display: flex; align-items: center; gap: 8px; padding: 12px 20px; background: var(--accent-gradient); border-radius: var(--radius-md); color: white; border: none; cursor: pointer; font-weight: 600; }
                .btn-secondary { padding: 12px 20px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-secondary); cursor: pointer; }
            `}</style>
        </div>
    )
}

export default AccountsReceivable