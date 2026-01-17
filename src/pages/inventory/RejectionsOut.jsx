import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, ArrowUpCircle, CheckCircle, Clock, Eye, Package, Send } from 'lucide-react'
import DataTable from '../../components/DataTable'
import Modal, { ModalFooter } from '../../components/Modal'
import FormInput, { FormTextarea, FormSelect } from '../../components/FormInput'
import { useToast } from '../../components/Toast'

// Mock vendor data
const mockVendors = [
    { id: 'vendor-001', name: 'TechSupplies Inc' },
    { id: 'vendor-002', name: 'Global Parts Co' },
    { id: 'vendor-003', name: 'Industrial Materials Ltd' }
]

// Mock data for vendor returns
const mockRejectionsOut = [
    { id: 'rj-out-001', rejectionNumber: 'RJO-2026-001', vendorId: 'vendor-001', billNumber: 'BILL-2026-001', returnDate: '2026-01-15', reason: 'Defective parts', status: 'pending', items: 3, totalQty: 15, creditAmount: 750 },
    { id: 'rj-out-002', rejectionNumber: 'RJO-2026-002', vendorId: 'vendor-002', billNumber: 'BILL-2026-003', returnDate: '2026-01-14', reason: 'Wrong shipment', status: 'sent', items: 2, totalQty: 8, creditAmount: 400 },
    { id: 'rj-out-003', rejectionNumber: 'RJO-2026-003', vendorId: 'vendor-003', billNumber: 'BILL-2026-005', returnDate: '2026-01-12', reason: 'Expired goods', status: 'acknowledged', items: 1, totalQty: 20, creditAmount: 200 },
]

function RejectionsOut() {
    const toast = useToast()
    const [rejections, setRejections] = useState(mockRejectionsOut)
    const [vendors] = useState(mockVendors)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [filterStatus, setFilterStatus] = useState('')
    const [viewModal, setViewModal] = useState(null)

    const [formData, setFormData] = useState({
        vendorId: '', billNumber: '', returnDate: new Date().toISOString().split('T')[0], reason: '', notes: '', items: []
    })

    const handleSubmit = () => {
        if (!formData.vendorId) {
            toast.error('Please select a vendor')
            return
        }
        const newRejection = {
            id: `rj-out-${Date.now()}`,
            rejectionNumber: `RJO-2026-${String(rejections.length + 1).padStart(3, '0')}`,
            ...formData,
            status: 'pending',
            items: 1,
            totalQty: 1,
            creditAmount: 0
        }
        setRejections([...rejections, newRejection])
        setIsModalOpen(false)
        resetForm()
        toast.success('Vendor return created')
    }

    const handleSend = (rejection) => {
        setRejections(rejections.map(r =>
            r.id === rejection.id ? { ...r, status: 'sent' } : r
        ))
        toast.success('Return sent to vendor')
    }

    const handleAcknowledge = (rejection) => {
        setRejections(rejections.map(r =>
            r.id === rejection.id ? { ...r, status: 'acknowledged' } : r
        ))
        toast.success('Vendor acknowledged - debit note created')
    }

    const resetForm = () => {
        setFormData({ vendorId: '', billNumber: '', returnDate: new Date().toISOString().split('T')[0], reason: '', notes: '', items: [] })
    }

    const getVendorName = (id) => {
        const vendor = vendors.find(v => v.id === id)
        return vendor ? vendor.name : '-'
    }

    const filteredRejections = filterStatus ? rejections.filter(r => r.status === filterStatus) : rejections

    const stats = {
        total: rejections.length,
        pending: rejections.filter(r => r.status === 'pending').length,
        sent: rejections.filter(r => r.status === 'sent').length,
        acknowledged: rejections.filter(r => r.status === 'acknowledged').length,
        totalValue: rejections.reduce((sum, r) => sum + r.creditAmount, 0)
    }

    const columns = [
        { key: 'rejectionNumber', label: 'Return #', render: (v) => <span className="rj-number">{v}</span> },
        { key: 'vendor', label: 'Vendor', render: (_, row) => getVendorName(row.vendorId) },
        { key: 'billNumber', label: 'Bill' },
        { key: 'returnDate', label: 'Return Date' },
        { key: 'reason', label: 'Reason' },
        { key: 'items', label: 'Items' },
        { key: 'creditAmount', label: 'Credit', render: (v) => <span className="amount">${v}</span> },
        { key: 'status', label: 'Status', render: (v) => <span className={`status-badge ${v}`}>{v}</span> },
        {
            key: 'actions', label: '', sortable: false, render: (_, row) => (
                <div className="action-buttons">
                    <button className="action-btn view" onClick={() => setViewModal(row)}><Eye size={16} /></button>
                    {row.status === 'pending' && <button className="action-btn send" onClick={() => handleSend(row)}><Send size={16} /></button>}
                    {row.status === 'sent' && <button className="action-btn acknowledge" onClick={() => handleAcknowledge(row)}><CheckCircle size={16} /></button>}
                </div>
            )
        }
    ]

    return (
        <div className="page">
            <motion.div className="page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <div>
                    <h1 className="page-title"><span className="gradient-text">Rejections Out</span></h1>
                    <p className="page-description">Manage returns to vendors and supplier claims.</p>
                </div>
                <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
                    <Plus size={20} /> New Vendor Return
                </button>
            </motion.div>

            <motion.div className="stats-row" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="stat-card" onClick={() => setFilterStatus('')}>
                    <ArrowUpCircle size={20} />
                    <span className="stat-value">{stats.total}</span>
                    <span className="stat-label">Total Returns</span>
                </div>
                <div className="stat-card pending" onClick={() => setFilterStatus('pending')}>
                    <Clock size={20} />
                    <span className="stat-value">{stats.pending}</span>
                    <span className="stat-label">Pending</span>
                </div>
                <div className="stat-card sent" onClick={() => setFilterStatus('sent')}>
                    <Send size={20} />
                    <span className="stat-value">{stats.sent}</span>
                    <span className="stat-label">Sent</span>
                </div>
                <div className="stat-card acknowledged" onClick={() => setFilterStatus('acknowledged')}>
                    <CheckCircle size={20} />
                    <span className="stat-value">{stats.acknowledged}</span>
                    <span className="stat-label">Acknowledged</span>
                </div>
                <div className="stat-card total-value">
                    <span className="stat-value">${stats.totalValue}</span>
                    <span className="stat-label">Total Credit Value</span>
                </div>
            </motion.div>

            <DataTable columns={columns} data={filteredRejections} searchable exportable />

            {/* Create Modal */}
            <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); resetForm() }} title="New Vendor Return" size="medium">
                <div className="form-grid">
                    <FormSelect label="Vendor *" options={vendors.map(v => ({ value: v.id, label: v.name }))} value={formData.vendorId} onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })} />
                    <FormInput label="Bill Number" value={formData.billNumber} onChange={(e) => setFormData({ ...formData, billNumber: e.target.value })} />
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
            <Modal isOpen={!!viewModal} onClose={() => setViewModal(null)} title={`Vendor Return: ${viewModal?.rejectionNumber}`} size="medium">
                {viewModal && (
                    <div className="view-details">
                        <div className="detail-row"><span>Vendor:</span><strong>{getVendorName(viewModal.vendorId)}</strong></div>
                        <div className="detail-row"><span>Bill:</span><strong>{viewModal.billNumber}</strong></div>
                        <div className="detail-row"><span>Return Date:</span><strong>{viewModal.returnDate}</strong></div>
                        <div className="detail-row"><span>Reason:</span><strong>{viewModal.reason}</strong></div>
                        <div className="detail-row"><span>Items:</span><strong>{viewModal.items} ({viewModal.totalQty} qty)</strong></div>
                        <div className="detail-row"><span>Credit Amount:</span><strong className="amount">${viewModal.creditAmount}</strong></div>
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
                .stat-card.sent svg { color: var(--info); }
                .stat-card.acknowledged svg { color: var(--success); }
                .stat-value { font-size: 1.25rem; font-weight: 700; color: var(--text-primary); }
                .stat-label { font-size: 0.8rem; color: var(--text-muted); }
                .stat-card.total-value { flex-direction: column; align-items: flex-start; background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(16, 185, 129, 0.05)); border-color: rgba(16, 185, 129, 0.3); }
                .rj-number { font-family: 'JetBrains Mono', monospace; font-weight: 600; color: var(--warning); }
                .amount { font-weight: 600; color: var(--success); }
                .status-badge { padding: 4px 12px; border-radius: 12px; font-size: 0.75rem; text-transform: capitalize; }
                .status-badge.pending { background: rgba(245, 158, 11, 0.15); color: var(--warning); }
                .status-badge.sent { background: rgba(59, 130, 246, 0.15); color: var(--info); }
                .status-badge.acknowledged { background: rgba(16, 185, 129, 0.15); color: var(--success); }
                .action-buttons { display: flex; gap: 8px; }
                .action-btn { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
                .action-btn.view { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }
                .action-btn.send { background: rgba(59, 130, 246, 0.1); color: var(--info); }
                .action-btn.acknowledge { background: rgba(16, 185, 129, 0.1); color: var(--success); }
                .form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 16px; }
                .view-details { display: flex; flex-direction: column; gap: 12px; }
                .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border-color); }
            `}</style>
        </div>
    )
}

export default RejectionsOut
