import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, CheckCircle } from 'lucide-react'
import DataTable from '../../components/DataTable'
import Modal, { ModalFooter } from '../../components/Modal'
import FormInput, { FormTextarea, FormSelect } from '../../components/FormInput'
import { useToast } from '../../components/Toast'
import { getSupplierInvoices, createSupplierInvoice, updateSupplierInvoice, performThreeWayMatch, getVendors, getPurchaseOrders, getGRNs } from '../../stores/purchaseStore'

function SupplierInvoices() {
    const toast = useToast()
    const [invoices, setInvoices] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editItem, setEditItem] = useState(null)
    const [formData, setFormData] = useState({
        invoiceNumber: '', invoiceDate: '', dueDate: '', vendorId: '', poNumber: '', grnNumber: '', items: [], totalAmount: 0, taxAmount: 0, status: 'pending', notes: ''
    })

    useEffect(() => {
        loadData()
    }, [])

    const loadData = () => {
        setInvoices(getSupplierInvoices())
    }

    const handleAdd = () => {
        setFormData({
            invoiceNumber: '',
            invoiceDate: new Date().toISOString().split('T')[0],
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            vendorId: '',
            poNumber: '',
            grnNumber: '',
            items: [],
            totalAmount: 0,
            taxAmount: 0,
            status: 'pending',
            notes: ''
        })
        setEditItem(null)
        setIsModalOpen(true)
    }

    const handleEdit = (item) => {
        setFormData({ ...item })
        setEditItem(item)
        setIsModalOpen(true)
    }

    const handleSave = () => {
        if (editItem) {
            updateSupplierInvoice(editItem.id, formData)
            toast.success('Invoice updated')
        } else {
            createSupplierInvoice(formData)
            toast.success('Invoice created')
        }
        setIsModalOpen(false)
        setEditItem(null)
        loadData()
    }

    const handleThreeWayMatch = (id) => {
        const result = performThreeWayMatch(id)
        if (result.matched) {
            toast.success('Three-way match successful!')
        } else {
            toast.warning(`Three-way match failed: ${result.reason}`)
        }
        loadData()
    }

    const columns = [
        { key: 'invoiceNumber', label: 'Invoice #', render: (v) => <span className="invoice-number">{v}</span> },
        { key: 'invoiceDate', label: 'Invoice Date', render: (v) => <span>{new Date(v).toLocaleDateString()}</span> },
        { key: 'dueDate', label: 'Due Date', render: (v) => <span>{new Date(v).toLocaleDateString()}</span> },
        { key: 'vendorId', label: 'Vendor', render: (v) => {
            const vendor = getVendors().find(v => v.id === v)
            return vendor ? vendor.name : '-'
        }},
        { key: 'poNumber', label: 'PO #', render: (v) => <span className="po-number">{v}</span> },
        { key: 'totalAmount', label: 'Amount', render: (v) => <span className="amount">${v.toLocaleString()}</span> },
        { key: 'taxAmount', label: 'Tax', render: (v) => <span className="tax">${v.toLocaleString()}</span> },
        { key: 'status', label: 'Status', render: (v) => (
            <span className={`status-badge ${v}`}>
                {v.charAt(0).toUpperCase() + v.slice(1)}
            </span>
        )},
        { key: 'actions', label: 'Actions', render: (_, row) => (
            <div className="action-buttons">
                {row.status === 'pending' && (
                    <button className="btn-match" onClick={() => handleThreeWayMatch(row.id)}>
                        <CheckCircle size={16} /> 3-Way Match
                    </button>
                )}
                <button className="btn-edit" onClick={() => handleEdit(row)}>
                    Edit
                </button>
            </div>
        )}
    ]

    return (
        <div className="page">
            <motion.div className="page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <div>
                    <h1 className="page-title"><span className="gradient-text">Supplier</span> Invoices</h1>
                    <p className="page-description">
                        Manage supplier invoices with three-way matching against POs and GRNs.
                    </p>
                </div>
                <button className="btn-primary" onClick={handleAdd}>
                    <Plus size={20} /> Create Invoice
                </button>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <DataTable columns={columns} data={invoices} searchable exportable />
            </motion.div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editItem ? 'Edit Invoice' : 'Create Invoice'} size="large">
                <div className="form-grid">
                    <FormInput label="Invoice Number *" placeholder="INV-001" value={formData.invoiceNumber} onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })} />
                    <FormSelect label="Vendor *" options={getVendors().map(v => ({ value: v.id, label: v.name }))} value={formData.vendorId} onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })} />
                </div>
                <div className="form-grid">
                    <FormInput label="Invoice Date *" type="date" value={formData.invoiceDate} onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })} />
                    <FormInput label="Due Date *" type="date" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} />
                </div>
                <div className="form-grid">
                    <FormSelect label="Purchase Order" options={[
                        { value: '', label: 'Select PO...' },
                        ...getPurchaseOrders().map(po => ({ value: po.number, label: po.number }))
                    ]} value={formData.poNumber} onChange={(e) => setFormData({ ...formData, poNumber: e.target.value })} />
                    <FormSelect label="GRN" options={[
                        { value: '', label: 'Select GRN...' },
                        ...getGRNs().map(grn => ({ value: grn.grnNumber, label: grn.grnNumber }))
                    ]} value={formData.grnNumber} onChange={(e) => setFormData({ ...formData, grnNumber: e.target.value })} />
                </div>
                <div className="form-grid">
                    <FormInput label="Total Amount *" type="number" placeholder="0" value={formData.totalAmount} onChange={(e) => setFormData({ ...formData, totalAmount: parseFloat(e.target.value) || 0 })} />
                    <FormInput label="Tax Amount *" type="number" placeholder="0" value={formData.taxAmount} onChange={(e) => setFormData({ ...formData, taxAmount: parseFloat(e.target.value) || 0 })} />
                </div>
                <FormInput label="Status" readOnly value={formData.status} />
                <FormTextarea label="Notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={2} placeholder="Additional notes..." />
                <ModalFooter>
                    <button className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                    <button className="btn-primary" onClick={handleSave}>{editItem ? 'Update' : 'Create'} Invoice</button>
                </ModalFooter>
            </Modal>

            <style>{`
                .btn-primary { display: flex; align-items: center; gap: 8px; padding: 12px 20px; background: var(--accent-gradient); border-radius: var(--radius-md); color: white; border: none; cursor: pointer; font-weight: 600; }
                .btn-secondary { padding: 12px 20px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-secondary); cursor: pointer; }
                .invoice-number { font-family: 'JetBrains Mono', monospace; font-weight: 600; color: var(--accent-primary); }
                .po-number { font-family: 'JetBrains Mono', monospace; font-weight: 500; color: var(--text-secondary); }
                .amount { font-weight: 600; color: var(--success); }
                .tax { font-weight: 600; color: var(--warning); }
                .status-badge { padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; text-transform: capitalize; }
                .status-badge.pending { background: rgba(251, 191, 36, 0.15); color: #fbbf24; }
                .status-badge.approved { background: rgba(34, 197, 94, 0.15); color: #22c55e; }
                .status-badge.rejected { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
                .status-badge.paid { background: rgba(59, 130, 246, 0.15); color: #3b82f6; }
                .action-buttons { display: flex; gap: 8px; }
                .btn-match { display: flex; align-items: center; gap: 6px; padding: 8px 12px; background: var(--success); border: none; border-radius: 8px; color: white; cursor: pointer; font-size: 0.85rem; }
                .btn-edit { padding: 8px 12px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-secondary); cursor: pointer; font-size: 0.85rem; }
                .btn-delete { padding: 8px 12px; background: rgba(239, 68, 68, 0.1); border: 1px solid var(--error); border-radius: 8px; color: var(--error); cursor: pointer; font-size: 0.85rem; }
                .btn-delete:hover { background: var(--error); color: white; }
            `}</style>
        </div>
    )
}

export default SupplierInvoices