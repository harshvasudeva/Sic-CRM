import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Filter, Edit, Trash2, FileText, CheckCircle, XCircle, Receipt, ArrowUpCircle, ArrowDownCircle } from 'lucide-react'
import { getCreditNotes, deleteCreditNote, createCreditNote, updateCreditNote, approveCreditNote, getDebitNotes, deleteDebitNote, createDebitNote, updateDebitNote, sendDebitNote, getSalesReturns, deleteSalesReturn, createSalesReturn, updateSalesReturn, approveSalesReturn, receiveReturnItems, getInvoices } from '../../stores/salesStore'
import { getContacts } from '../../stores/crmStore'
import DataTable from '../../components/DataTable'
import Modal, { ModalFooter } from '../../components/Modal'
import FormInput, { FormTextarea, FormSelect } from '../../components/FormInput'
import { useToast } from '../../components/Toast'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/Tabs'

const creditStatuses = [
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' }
]

const debitStatuses = [
    { value: 'draft', label: 'Draft' },
    { value: 'sent', label: 'Sent' },
    { value: 'accepted', label: 'Accepted' }
]

const returnStatuses = [
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'received', label: 'Received' },
    { value: 'rejected', label: 'Rejected' }
]

function CreditNotesDebits() {
    const toast = useToast()
    const [activeTab, setActiveTab] = useState('credit-notes')
    const [creditNotes, setCreditNotes] = useState([])
    const [debitNotes, setDebitNotes] = useState([])
    const [returns, setReturns] = useState([])
    const [invoices, setInvoices] = useState([])
    const [contacts, setContacts] = useState([])

    const [isCreditModalOpen, setIsCreditModalOpen] = useState(false)
    const [isDebitModalOpen, setIsDebitModalOpen] = useState(false)
    const [isReturnModalOpen, setIsReturnModalOpen] = useState(false)
    const [editingItem, setEditingItem] = useState(null)
    const [deleteConfirm, setDeleteConfirm] = useState(null)
    const [approveModal, setApproveModal] = useState(null)

    const [creditData, setCreditData] = useState({
        customerId: '', invoiceId: '', returnId: '', reason: '', amount: 0, taxAmount: 0, notes: ''
    })

    const [debitData, setDebitData] = useState({
        customerId: '', invoiceId: '', reason: '', amount: 0, taxAmount: 0, notes: ''
    })

    const [returnData, setReturnData] = useState({
        customerId: '', orderId: '', invoiceId: '', items: [], refundType: 'credit', refundAmount: 0, notes: ''
    })

    const loadData = async () => {
        setCreditNotes(getCreditNotes())
        setDebitNotes(getDebitNotes())
        setReturns(getSalesReturns())
        setInvoices(getInvoices())
        try {
            const contactsData = await getContacts()
            setContacts(Array.isArray(contactsData) ? contactsData : [])
        } catch (e) {
            console.warn('Failed to load contacts:', e)
            setContacts([])
        }
    }

    useEffect(() => { loadData() }, [])

    const handleCreditSubmit = () => {
        if (!creditData.customerId || creditData.amount <= 0) {
            toast.error('Customer and amount are required')
            return
        }
        if (editingItem) {
            updateCreditNote(editingItem.id, creditData)
            toast.success('Credit note updated')
        } else {
            createCreditNote(creditData)
            toast.success('Credit note created')
        }
        setIsCreditModalOpen(false)
        setEditingItem(null)
        resetCreditData()
        loadData()
    }

    const handleDebitSubmit = () => {
        if (!debitData.customerId || debitData.amount <= 0) {
            toast.error('Customer and amount are required')
            return
        }
        if (editingItem) {
            updateDebitNote(editingItem.id, debitData)
            toast.success('Debit note updated')
        } else {
            createDebitNote(debitData)
            toast.success('Debit note created')
        }
        setIsDebitModalOpen(false)
        setEditingItem(null)
        resetDebitData()
        loadData()
    }

    const handleReturnSubmit = () => {
        if (!returnData.customerId || returnData.items.length === 0) {
            toast.error('Customer and items are required')
            return
        }
        if (editingItem) {
            updateSalesReturn(editingItem.id, returnData)
            toast.success('Return updated')
        } else {
            createSalesReturn(returnData)
            toast.success('Return created')
        }
        setIsReturnModalOpen(false)
        setEditingItem(null)
        resetReturnData()
        loadData()
    }

    const handleApproveCredit = (creditNote) => {
        setApproveModal({ type: 'credit', item: creditNote })
    }

    const confirmApprove = () => {
        if (approveModal.type === 'credit') {
            approveCreditNote(approveModal.item.id, 'emp-001')
        } else if (approveModal.type === 'return') {
            approveSalesReturn(approveModal.item.id, 'emp-001')
        }
        toast.success('Approved')
        setApproveModal(null)
        loadData()
    }

    const handleSendDebit = (debitNote) => {
        sendDebitNote(debitNote.id)
        toast.success('Debit note sent')
        loadData()
    }

    const handleReceiveReturn = (returnItem) => {
        receiveReturnItems(returnItem.id)
        toast.success('Items marked as received')
        loadData()
    }

    const confirmDelete = () => {
        if (deleteConfirm) {
            if (deleteConfirm.type === 'credit') deleteCreditNote(deleteConfirm.item.id)
            else if (deleteConfirm.type === 'debit') deleteDebitNote(deleteConfirm.item.id)
            else if (deleteConfirm.type === 'return') deleteSalesReturn(deleteConfirm.item.id)
            toast.success('Deleted')
            setDeleteConfirm(null)
            loadData()
        }
    }

    const resetCreditData = () => {
        setCreditData({ customerId: '', invoiceId: '', returnId: '', reason: '', amount: 0, taxAmount: 0, notes: '' })
    }

    const resetDebitData = () => {
        setDebitData({ customerId: '', invoiceId: '', reason: '', amount: 0, taxAmount: 0, notes: '' })
    }

    const resetReturnData = () => {
        setReturnData({ customerId: '', orderId: '', invoiceId: '', items: [], refundType: 'credit', refundAmount: 0, notes: '' })
    }

    const creditColumns = [
        { key: 'creditNoteNumber', label: 'Credit Note #', render: (v) => <span className="note-number">{v}</span> },
        {
            key: 'customerName', label: 'Customer', render: (_, row) => {
                const customer = contacts.find(c => c.id === row.customerId)
                return customer ? `${customer.firstName} ${customer.lastName}` : '-'
            }
        },
        { key: 'totalAmount', label: 'Amount', render: (v) => <span className="amount success">-${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v)}</span> },
        { key: 'reason', label: 'Reason' },
        { key: 'noteDate', label: 'Date' },
        { key: 'status', label: 'Status', render: (v) => <span className={`status-badge ${v}`}>{v}</span> },
        {
            key: 'actions', label: '', sortable: false,
            render: (_, row) => (
                <div className="action-buttons">
                    {row.status === 'pending' && (
                        <button className="action-btn approve" onClick={() => handleApproveCredit(row)} title="Approve"><CheckCircle size={16} /></button>
                    )}
                    <button className="action-btn delete" onClick={() => setDeleteConfirm({ type: 'credit', item: row })}><Trash2 size={16} /></button>
                </div>
            )
        }
    ]

    const debitColumns = [
        { key: 'debitNoteNumber', label: 'Debit Note #', render: (v) => <span className="note-number">{v}</span> },
        {
            key: 'customerName', label: 'Customer', render: (_, row) => {
                const customer = contacts.find(c => c.id === row.customerId)
                return customer ? `${customer.firstName} ${customer.lastName}` : '-'
            }
        },
        { key: 'totalAmount', label: 'Amount', render: (v) => <span className="amount danger">+${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v)}</span> },
        { key: 'reason', label: 'Reason' },
        { key: 'noteDate', label: 'Date' },
        { key: 'status', label: 'Status', render: (v) => <span className={`status-badge ${v}`}>{v}</span> },
        {
            key: 'actions', label: '', sortable: false,
            render: (_, row) => (
                <div className="action-buttons">
                    {row.status === 'draft' && (
                        <button className="action-btn send" onClick={() => handleSendDebit(row)} title="Send"><ArrowUpCircle size={16} /></button>
                    )}
                    <button className="action-btn delete" onClick={() => setDeleteConfirm({ type: 'debit', item: row })}><Trash2 size={16} /></button>
                </div>
            )
        }
    ]

    const returnColumns = [
        { key: 'returnNumber', label: 'Return #', render: (v) => <span className="note-number">{v}</span> },
        {
            key: 'customerName', label: 'Customer', render: (_, row) => {
                const customer = contacts.find(c => c.id === row.customerId)
                return customer ? `${customer.firstName} ${customer.lastName}` : '-'
            }
        },
        { key: 'refundAmount', label: 'Refund', render: (v) => <span className="amount">${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v)}</span> },
        { key: 'refundType', label: 'Type', render: (v) => <span className="type-badge">{v}</span> },
        { key: 'returnDate', label: 'Date' },
        { key: 'status', label: 'Status', render: (v) => <span className={`status-badge ${v}`}>{v}</span> },
        { key: 'receivedItems', label: 'Received', render: (v) => v ? <span className="yes-badge">Yes</span> : <span className="no-badge">No</span> },
        {
            key: 'actions', label: '', sortable: false,
            render: (_, row) => (
                <div className="action-buttons">
                    {row.status === 'approved' && !row.receivedItems && (
                        <button className="action-btn receive" onClick={() => handleReceiveReturn(row)} title="Mark Received"><CheckCircle size={16} /></button>
                    )}
                    {row.status === 'pending' && (
                        <button className="action-btn approve" onClick={() => setApproveModal({ type: 'return', item: row })}><CheckCircle size={16} /></button>
                    )}
                    <button className="action-btn delete" onClick={() => setDeleteConfirm({ type: 'return', item: row })}><Trash2 size={16} /></button>
                </div>
            )
        }
    ]

    return (
        <div className="page">
            <motion.div className="page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <div>
                    <h1 className="page-title"><span className="gradient-text">Credit Notes</span> & Debits</h1>
                    <p className="page-description">Manage credit notes, debit notes, and sales returns.</p>
                </div>
            </motion.div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="credit-notes">
                        <ArrowUpCircle size={18} style={{ marginRight: 8 }} />
                        Credit Notes ({creditNotes.length})
                    </TabsTrigger>
                    <TabsTrigger value="debit-notes">
                        <ArrowDownCircle size={18} style={{ marginRight: 8 }} />
                        Debit Notes ({debitNotes.length})
                    </TabsTrigger>
                    <TabsTrigger value="returns">
                        <Receipt size={18} style={{ marginRight: 8 }} />
                        Sales Returns ({returns.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="credit-notes">
                    <div className="module-header">
                        <div className="module-title">Credit Notes</div>
                        <button className="btn-primary" onClick={() => setIsCreditModalOpen(true)}><Plus size={20} /> New Credit Note</button>
                    </div>
                    <DataTable columns={creditColumns} data={creditNotes} searchable exportable />
                </TabsContent>

                <TabsContent value="debit-notes">
                    <div className="module-header">
                        <div className="module-title">Debit Notes</div>
                        <button className="btn-primary" onClick={() => setIsDebitModalOpen(true)}><Plus size={20} /> New Debit Note</button>
                    </div>
                    <DataTable columns={debitColumns} data={debitNotes} searchable exportable />
                </TabsContent>

                <TabsContent value="returns">
                    <div className="module-header">
                        <div className="module-title">Sales Returns</div>
                        <button className="btn-primary" onClick={() => setIsReturnModalOpen(true)}><Plus size={20} /> New Return</button>
                    </div>
                    <DataTable columns={returnColumns} data={returns} searchable exportable />
                </TabsContent>
            </Tabs>

            {/* Credit Note Modal */}
            <Modal isOpen={isCreditModalOpen} onClose={() => { setIsCreditModalOpen(false); setEditingItem(null); resetCreditData() }} title={editingItem ? 'Edit Credit Note' : 'New Credit Note'} size="medium">
                <div className="form-grid">
                    <FormSelect label="Customer *" options={contacts.map(c => ({ value: c.id, label: `${c.firstName} ${c.lastName}` }))} value={creditData.customerId} onChange={(e) => setCreditData({ ...creditData, customerId: e.target.value })} />
                    <FormSelect label="Related Invoice" options={[{ value: '', label: 'None' }, ...invoices.map(i => ({ value: i.id, label: `${i.invoiceNumber} - $${i.total}` }))]} value={creditData.invoiceId} onChange={(e) => setCreditData({ ...creditData, invoiceId: e.target.value })} />
                </div>
                <div className="form-grid">
                    <FormInput label="Amount *" type="number" value={creditData.amount} onChange={(e) => setCreditData({ ...creditData, amount: parseFloat(e.target.value) || 0 })} />
                    <FormInput label="Tax Amount" type="number" value={creditData.taxAmount} onChange={(e) => setCreditData({ ...creditData, taxAmount: parseFloat(e.target.value) || 0 })} />
                </div>
                <FormInput label="Reason" value={creditData.reason} onChange={(e) => setCreditData({ ...creditData, reason: e.target.value })} />
                <FormTextarea label="Notes" value={creditData.notes} onChange={(e) => setCreditData({ ...creditData, notes: e.target.value })} rows={3} />
                <ModalFooter>
                    <button className="btn-secondary" onClick={() => { setIsCreditModalOpen(false); setEditingItem(null); resetCreditData() }}>Cancel</button>
                    <button className="btn-primary" onClick={handleCreditSubmit}>Create</button>
                </ModalFooter>
            </Modal>

            {/* Debit Note Modal */}
            <Modal isOpen={isDebitModalOpen} onClose={() => { setIsDebitModalOpen(false); setEditingItem(null); resetDebitData() }} title={editingItem ? 'Edit Debit Note' : 'New Debit Note'} size="medium">
                <div className="form-grid">
                    <FormSelect label="Customer *" options={contacts.map(c => ({ value: c.id, label: `${c.firstName} ${c.lastName}` }))} value={debitData.customerId} onChange={(e) => setDebitData({ ...debitData, customerId: e.target.value })} />
                    <FormSelect label="Related Invoice" options={[{ value: '', label: 'None' }, ...invoices.map(i => ({ value: i.id, label: `${i.invoiceNumber} - $${i.total}` }))]} value={debitData.invoiceId} onChange={(e) => setDebitData({ ...debitData, invoiceId: e.target.value })} />
                </div>
                <div className="form-grid">
                    <FormInput label="Amount *" type="number" value={debitData.amount} onChange={(e) => setDebitData({ ...debitData, amount: parseFloat(e.target.value) || 0 })} />
                    <FormInput label="Tax Amount" type="number" value={debitData.taxAmount} onChange={(e) => setDebitData({ ...debitData, taxAmount: parseFloat(e.target.value) || 0 })} />
                </div>
                <FormInput label="Reason" value={debitData.reason} onChange={(e) => setDebitData({ ...debitData, reason: e.target.value })} />
                <FormTextarea label="Notes" value={debitData.notes} onChange={(e) => setDebitData({ ...debitData, notes: e.target.value })} rows={3} />
                <ModalFooter>
                    <button className="btn-secondary" onClick={() => { setIsDebitModalOpen(false); setEditingItem(null); resetDebitData() }}>Cancel</button>
                    <button className="btn-primary" onClick={handleDebitSubmit}>Create</button>
                </ModalFooter>
            </Modal>

            {/* Approve Confirm Modal */}
            <Modal isOpen={!!approveModal} onClose={() => setApproveModal(null)} title="Approve" size="small">
                <p style={{ marginBottom: 24, color: 'var(--text-secondary)' }}>Approve this item?</p>
                <ModalFooter>
                    <button className="btn-secondary" onClick={() => setApproveModal(null)}>Cancel</button>
                    <button className="btn-primary" onClick={confirmApprove}>Approve</button>
                </ModalFooter>
            </Modal>

            {/* Delete Confirm Modal */}
            <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete" size="small">
                <p style={{ marginBottom: 24, color: 'var(--text-secondary)' }}>Delete this item?</p>
                <ModalFooter>
                    <button className="btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                    <button className="btn-danger" onClick={confirmDelete}>Delete</button>
                </ModalFooter>
            </Modal>

            <style>{`
                .btn-primary { display: flex; align-items: center; gap: 8px; padding: 12px 20px; background: var(--accent-gradient); border-radius: var(--radius-md); color: white; }
                .btn-secondary { padding: 12px 20px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-secondary); }
                .btn-danger { padding: 12px 20px; background: var(--error); border-radius: var(--radius-md); color: white; }
                .form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
                .module-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
                .module-title { font-size: 1.2rem; font-weight: 600; color: var(--text-primary); }
                .note-number { font-family: 'JetBrains Mono', monospace; font-weight: 600; color: var(--accent-primary); }
                .amount { font-weight: 600; }
                .amount.success { color: #10b981; }
                .amount.danger { color: #ef4444; }
                .status-badge { display: inline-block; padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; text-transform: capitalize; }
                .status-badge.pending { background: rgba(107, 114, 128, 0.15); color: var(--text-muted); }
                .status-badge.approved { background: rgba(16, 185, 129, 0.15); color: var(--success); }
                .status-badge.rejected { background: rgba(239, 68, 68, 0.15); color: var(--error); }
                .status-badge.draft { background: rgba(107, 114, 128, 0.15); color: var(--text-muted); }
                .status-badge.sent { background: rgba(59, 130, 246, 0.15); color: var(--info); }
                .status-badge.accepted { background: rgba(16, 185, 129, 0.15); color: var(--success); }
                .type-badge { padding: 2px 8px; background: rgba(139, 92, 246, 0.15); color: #8b5cf6; border-radius: 8px; font-size: 0.75rem; text-transform: capitalize; }
                .yes-badge { padding: 2px 8px; background: rgba(16, 185, 129, 0.15); color: var(--success); border-radius: 8px; font-size: 0.75rem; }
                .no-badge { padding: 2px 8px; background: rgba(107, 114, 128, 0.15); color: var(--text-muted); border-radius: 8px; font-size: 0.75rem; }
                .action-buttons { display: flex; gap: 8px; }
                .action-btn { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
                .action-btn.approve { background: rgba(16, 185, 129, 0.1); color: var(--success); }
                .action-btn.send { background: rgba(59, 130, 246, 0.1); color: var(--info); }
                .action-btn.receive { background: rgba(245, 158, 11, 0.1); color: var(--warning); }
                .action-btn.delete { background: rgba(239, 68, 68, 0.1); color: var(--error); }
                .tabs-list { display: flex; gap: 8px; margin-bottom: 24px; padding-bottom: 12px; border-bottom: 1px solid var(--border-color); }
                .tabs-trigger { padding: 12px 20px; background: transparent; border: none; color: var(--text-secondary); font-size: 0.9rem; font-weight: 500; cursor: pointer; border-radius: 8px; transition: all 0.2s ease; }
                .tabs-trigger:hover { color: var(--text-primary); background: rgba(255, 255, 255, 0.05); }
                .tabs-trigger.active { color: var(--accent-primary); background: rgba(99, 102, 241, 0.1); }
                .tabs-content { animation: fadeIn 0.3s ease; }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}</style>
        </div>
    )
}

export default CreditNotesDebits
