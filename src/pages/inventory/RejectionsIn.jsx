import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, ArrowDownCircle, CheckCircle, Clock, Eye, Package } from 'lucide-react'
import { getContacts } from '../../stores/crmStore'
import { formatCurrency } from '../../stores/settingsStore'
import { useTallyShortcuts } from '../../hooks/useTallyShortcuts'
import DataTable from '../../components/DataTable'
import Modal, { ModalFooter } from '../../components/Modal'
import FormInput, { FormTextarea, FormSelect } from '../../components/FormInput'
import { useToast } from '../../components/Toast'

// Mock data for customer returns
const mockRejectionsIn = [
    { id: 'rj-in-001', rejectionNumber: 'RJI-2026-001', customerId: 'cont-001', invoiceNumber: 'INV-2026-001', returnDate: '2026-01-15', reason: 'Damaged goods', status: 'pending', items: 2, totalQty: 5, refundAmount: 250 },
    { id: 'rj-in-002', rejectionNumber: 'RJI-2026-002', customerId: 'cont-002', invoiceNumber: 'INV-2026-003', returnDate: '2026-01-14', reason: 'Wrong item delivered', status: 'approved', items: 1, totalQty: 3, refundAmount: 150 },
    { id: 'rj-in-003', rejectionNumber: 'RJI-2026-003', customerId: 'cont-003', invoiceNumber: 'INV-2026-005', returnDate: '2026-01-12', reason: 'Quality issue', status: 'processed', items: 3, totalQty: 10, refundAmount: 500 },
]

function RejectionsIn() {
    const toast = useToast()
    const [rejections, setRejections] = useState(mockRejectionsIn)
    const [contacts, setContacts] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [filterStatus, setFilterStatus] = useState('')
    const [viewModal, setViewModal] = useState(null)

    const [formData, setFormData] = useState({
        customerId: '', invoiceNumber: '', returnDate: new Date().toISOString().split('T')[0], reason: '', notes: '', items: []
    })

    useTallyShortcuts({
        create: () => setIsModalOpen(true),
        save: () => { if (isModalOpen) handleSubmit() }
    })

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const contactsData = await getContacts()
            setContacts(Array.isArray(contactsData) ? contactsData : [])
        } catch (e) {
            setContacts([])
        }
    }

    const handleSubmit = () => {
        if (!formData.customerId) {
            toast.error('Please select a customer')
            return
        }
        const newRejection = {
            id: `rj-in-${Date.now()}`,
            rejectionNumber: `RJI-2026-${String(rejections.length + 1).padStart(3, '0')}`,
            ...formData,
            status: 'pending',
            items: 1,
            totalQty: 1,
            refundAmount: 0
        }
        setRejections([...rejections, newRejection])
        setIsModalOpen(false)
        resetForm()
        toast.success('Return request created')
    }

    const handleApprove = (rejection) => {
        setRejections(rejections.map(r =>
            r.id === rejection.id ? { ...r, status: 'approved' } : r
        ))
        toast.success('Return approved')
    }

    const handleProcess = (rejection) => {
        setRejections(rejections.map(r =>
            r.id === rejection.id ? { ...r, status: 'processed' } : r
        ))
        toast.success('Return processed - stock added, credit note created')
    }

    const resetForm = () => {
        setFormData({ customerId: '', invoiceNumber: '', returnDate: new Date().toISOString().split('T')[0], reason: '', notes: '', items: [] })
    }

    const getCustomerName = (id) => {
        const customer = contacts.find(c => c.id === id)
        return customer ? `${customer.firstName} ${customer.lastName}` : '-'
    }

    const filteredRejections = filterStatus ? rejections.filter(r => r.status === filterStatus) : rejections

    const stats = {
        total: rejections.length,
        pending: rejections.filter(r => r.status === 'pending').length,
        approved: rejections.filter(r => r.status === 'approved').length,
        processed: rejections.filter(r => r.status === 'processed').length,
        totalValue: rejections.reduce((sum, r) => sum + r.refundAmount, 0)
    }

    const columns = [
        { key: 'rejectionNumber', label: 'Return #', render: (v) => <span className="rj-number">{v}</span> },
        { key: 'customer', label: 'Customer', render: (_, row) => getCustomerName(row.customerId) },
        { key: 'invoiceNumber', label: 'Invoice' },
        { key: 'returnDate', label: 'Return Date' },
        { key: 'reason', label: 'Reason' },
        { key: 'items', label: 'Items' },
        { key: 'refundAmount', label: 'Refund', render: (v) => <span className="amount">{formatCurrency(v)}</span> },
        { key: 'status', label: 'Status', render: (v) => <span className={`status-badge ${v}`}>{v}</span> },
        {
            key: 'actions', label: '', sortable: false, render: (_, row) => (
                <div className="action-buttons">
                    <button className="action-btn view" onClick={() => setViewModal(row)}><Eye size={16} /></button>
                    {row.status === 'pending' && <button className="action-btn approve" onClick={() => handleApprove(row)}><CheckCircle size={16} /></button>}
                    {row.status === 'approved' && <button className="action-btn process" onClick={() => handleProcess(row)}><Package size={16} /></button>}
                </div>
            )
        }
    ]

    return (
        <div className="page">
            <motion.div className="page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <div>
                    <h1 className="page-title"><span className="gradient-text">Rejections In</span></h1>
                    <p className="page-description">Manage customer returns and refunds.</p>
                </div>
                <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
                    <Plus size={20} /> New Return
                </button>
            </motion.div>

            <motion.div className="stats-row" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="stat-card" onClick={() => setFilterStatus('')}>
                    <ArrowDownCircle size={20} />
                    <span className="stat-value">{stats.total}</span>
                    <span className="stat-label">Total Returns</span>
                </div>
                <div className="stat-card pending" onClick={() => setFilterStatus('pending')}>
                    <Clock size={20} />
                    <span className="stat-value">{stats.pending}</span>
                    <span className="stat-label">Pending</span>
                </div>
                <div className="stat-card approved" onClick={() => setFilterStatus('approved')}>
                    <CheckCircle size={20} />
                    <span className="stat-value">{stats.approved}</span>
                    <span className="stat-label">Approved</span>
                </div>
                <div className="stat-card processed" onClick={() => setFilterStatus('processed')}>
                    <Package size={20} />
                    <span className="stat-value">{stats.processed}</span>
                    <span className="stat-label">Processed</span>
                </div>
                <div className="stat-card total-value">
                    <span className="stat-value">{formatCurrency(stats.totalValue)}</span>
                    <span className="stat-label">Total Refund Value</span>
                </div>
            </motion.div>

            <DataTable columns={columns} data={filteredRejections} searchable exportable />

            {/* Create Modal */}
            <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); resetForm() }} title="New Return Request" size="medium">
                <div className="form-grid">
                    <FormSelect label="Customer *" options={contacts.map(c => ({ value: c.id, label: `${c.firstName} ${c.lastName}` }))} value={formData.customerId} onChange={(e) => setFormData({ ...formData, customerId: e.target.value })} />
                    <FormInput label="Invoice Number" value={formData.invoiceNumber} onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })} />
                </div>
                <div className="form-grid">
                    <FormInput label="Return Date" type="date" value={formData.returnDate} onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })} />
                    <FormInput label="Reason *" value={formData.reason} onChange={(e) => setFormData({ ...formData, reason: e.target.value })} />
                </div>
                <FormTextarea label="Notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={2} />
                <ModalFooter>
                    <button className="btn-secondary" onClick={() => { setIsModalOpen(false); resetForm() }}>Cancel</button>
                    <button className="btn-primary" onClick={handleSubmit}>Create</button>
                </ModalFooter>
            </Modal>

            {/* View Modal */}
            <Modal isOpen={!!viewModal} onClose={() => setViewModal(null)} title={`Return: ${viewModal?.rejectionNumber}`} size="medium">
                {viewModal && (
                    <div className="view-details">
                        <div className="detail-row"><span>Customer:</span><strong>{getCustomerName(viewModal.customerId)}</strong></div>
                        <div className="detail-row"><span>Invoice:</span><strong>{viewModal.invoiceNumber}</strong></div>
                        <div className="detail-row"><span>Return Date:</span><strong>{viewModal.returnDate}</strong></div>
                        <div className="detail-row"><span>Reason:</span><strong>{viewModal.reason}</strong></div>
                        <div className="detail-row"><span>Items:</span><strong>{viewModal.items} ({viewModal.totalQty} qty)</strong></div>
                        <div className="detail-row"><span>Refund Amount:</span><strong className="amount">{formatCurrency(viewModal.refundAmount)}</strong></div>
                        <div className="detail-row"><span>Status:</span><span className={`status-badge ${viewModal.status}`}>{viewModal.status}</span></div>
                    </div>
                )}
                <ModalFooter>
                    <button className="btn-secondary" onClick={() => setViewModal(null)}>Close</button>
                </ModalFooter>
            </Modal>

            <style>{`
                .btn-primary { display: flex; align-items: center; gap: 8px; padding: 12px 20px; background: var(--accent-gradient); border-radius: var(--radius-md); color: white; }
                .btn-secondary { padding: 12px 20px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-secondary); }
                .stats-row { display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap; }
                .stat-card { display: flex; align-items: center; gap: 12px; padding: 16px 20px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); cursor: pointer; transition: all 0.2s ease; }
                .stat-card:hover { border-color: var(--accent-primary); }
                .stat-card svg { color: var(--text-muted); }
                .stat-card.pending svg { color: var(--warning); }
                .stat-card.approved svg { color: var(--info); }
                .stat-card.processed svg { color: var(--success); }
                .stat-value { font-size: 1.25rem; font-weight: 700; color: var(--text-primary); }
                .stat-label { font-size: 0.8rem; color: var(--text-muted); }
                .stat-card.total-value { flex-direction: column; align-items: flex-start; background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05)); border-color: rgba(239, 68, 68, 0.3); }
                .rj-number { font-family: 'JetBrains Mono', monospace; font-weight: 600; color: var(--error); }
                .amount { font-weight: 600; color: var(--error); }
                .status-badge { padding: 4px 12px; border-radius: 12px; font-size: 0.75rem; text-transform: capitalize; }
                .status-badge.pending { background: rgba(245, 158, 11, 0.15); color: var(--warning); }
                .status-badge.approved { background: rgba(59, 130, 246, 0.15); color: var(--info); }
                .status-badge.processed { background: rgba(16, 185, 129, 0.15); color: var(--success); }
                .action-buttons { display: flex; gap: 8px; }
                .action-btn { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
                .action-btn.view { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }
                .action-btn.approve { background: rgba(59, 130, 246, 0.1); color: var(--info); }
                .action-btn.process { background: rgba(16, 185, 129, 0.1); color: var(--success); }
                .form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 16px; }
                .view-details { display: flex; flex-direction: column; gap: 12px; }
                .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border-color); }
            `}</style>
        </div>
    )
}

export default RejectionsIn
