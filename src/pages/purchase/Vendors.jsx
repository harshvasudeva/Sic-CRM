import React, { useState, useEffect } from 'react'
import { Plus, Search, Filter, MoreVertical, FileText, Trash2, Edit2, Download, Upload } from 'lucide-react'
import PageHelp from '../../components/PageHelp'
import { getVendors, deleteVendor } from '../../stores/purchaseStore'
import DataTable from '../../components/DataTable'
import Modal, { ModalFooter } from '../../components/Modal'
import FormInput, { FormTextarea, FormSelect } from '../../components/FormInput'
import { useToast } from '../../components/Toast'

const vendorTypes = [
    { value: 'product', label: 'Product' },
    { value: 'service', label: 'Service' },
    { value: 'consumable', label: 'Consumable' }
]

const statuses = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
]

function Vendors() {
    const toast = useToast()
    const [vendors, setVendors] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingVendor, setEditingVendor] = useState(null)
    const [deleteConfirm, setDeleteConfirm] = useState(null)
    const [filterStatus, setFilterStatus] = useState('')
    const [filterType, setFilterType] = useState('')

    const [formData, setFormData] = useState({
        name: '', vendorCode: '', contactPerson: '', email: '', phone: '',
        address: '', country: '', type: 'product', paymentTerms: 'Net 30',
        taxId: '', creditLimit: 0, rating: 0, notes: ''
    })

    const loadData = () => {
        const filters = {}
        if (filterStatus) filters.status = filterStatus
        if (filterType) filters.type = filterType
        setVendors(getVendors(filters))
    }

    useEffect(() => { loadData() }, [filterStatus, filterType])

    const handleSubmit = () => {
        if (!formData.name || !formData.email) {
            toast.error('Name and email are required')
            return
        }

        if (editingVendor) {
            updateVendor(editingVendor.id, formData)
            toast.success('Vendor updated')
        } else {
            createVendor(formData)
            toast.success('Vendor created')
        }
        setIsModalOpen(false)
        setEditingVendor(null)
        resetFormData()
        loadData()
    }

    const handleEdit = (vendor) => {
        setEditingVendor(vendor)
        setFormData({
            name: vendor.name,
            vendorCode: vendor.vendorCode,
            contactPerson: vendor.contactPerson,
            email: vendor.email,
            phone: vendor.phone,
            address: vendor.address,
            country: vendor.country,
            type: vendor.type,
            paymentTerms: vendor.paymentTerms,
            taxId: vendor.taxId,
            creditLimit: vendor.creditLimit,
            rating: vendor.rating,
            notes: vendor.notes
        })
        setIsModalOpen(true)
    }

    const confirmDelete = () => {
        if (deleteConfirm) {
            deleteVendor(deleteConfirm.id)
            toast.success('Vendor deleted')
            setDeleteConfirm(null)
            loadData()
        }
    }

    const resetFormData = () => {
        setFormData({
            name: '', vendorCode: '', contactPerson: '', email: '', phone: '',
            address: '', country: '', type: 'product', paymentTerms: 'Net 30',
            taxId: '', creditLimit: 0, rating: 0, notes: ''
        })
    }

    const columns = [
        { key: 'vendorCode', label: 'Vendor Code', render: (v) => <span className="vendor-code">{v}</span> },
        { key: 'name', label: 'Vendor Name', render: (v) => <span className="vendor-name">{v}</span> },
        { key: 'contactPerson', label: 'Contact' },
        { key: 'email', label: 'Email' },
        { key: 'type', label: 'Type', render: (v) => <span className="type-badge">{v}</span> },
        {
            key: 'rating', label: 'Rating', render: (v) => (
                <div className="rating-container">
                    {Array(5).fill(0).map((_, i) => (
                        <Star key={i} size={14} className={i < v ? 'filled' : 'empty'} />
                    ))}
                    <span className="rating-text">{v}</span>
                </div>
            )
        },
        { key: 'creditLimit', label: 'Credit Limit', render: (v) => <span className="amount">${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v)}</span> },
        { key: 'status', label: 'Status', render: (v) => <span className={`status-badge ${v}`}>{v}</span> },
        { key: 'createdAt', label: 'Created' },
        {
            key: 'actions', label: '', sortable: false,
            render: (_, row) => (
                <div className="action-buttons">
                    <button className="action-btn edit" onClick={() => handleEdit(row)}><Edit size={16} /></button>
                    <button className="action-btn delete" onClick={() => setDeleteConfirm(row)}><Trash2 size={16} /></button>
                </div>
            )
        }
    ]

    return (
        <div className="page">
            <motion.div className="page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <div>
                    <h1 className="page-title"><span className="gradient-text">Vendors</span></h1>
                    <p className="page-description">Manage supplier/vendor relationships and information.</p>
                </div>
                <button className="btn-primary" onClick={() => setIsModalOpen(true)}><Plus size={20} /> New Vendor</button>
            </motion.div>

            <div className="filters-bar">
                <div className="filter-group">
                    <Filter size={18} />
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                        <option value="">All Status</option>
                        {statuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                </div>
                <div className="filter-group">
                    <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                        <option value="">All Types</option>
                        {vendorTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                </div>
                <div className="filter-stats">{vendors.length} vendors</div>
            </div>

            <DataTable columns={columns} data={vendors} searchable exportable />

            {/* Add/Edit Modal */}
            <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingVendor(null); resetFormData() }} title={editingVendor ? 'Edit Vendor' : 'New Vendor'} size="large">
                <div className="form-grid">
                    <FormInput label="Vendor Name *" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    <FormInput label="Vendor Code" value={formData.vendorCode} onChange={(e) => setFormData({ ...formData, vendorCode: e.target.value })} />
                </div>
                <div className="form-grid">
                    <FormInput label="Contact Person" value={formData.contactPerson} onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })} />
                    <FormInput label="Email *" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                </div>
                <div className="form-grid">
                    <FormInput label="Phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                    <FormSelect label="Vendor Type" options={vendorTypes} value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} />
                </div>
                <div className="form-grid">
                    <FormInput label="Payment Terms" value={formData.paymentTerms} onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })} />
                    <FormInput label="Tax ID" value={formData.taxId} onChange={(e) => setFormData({ ...formData, taxId: e.target.value })} />
                </div>
                <div className="form-grid">
                    <FormInput label="Credit Limit" type="number" value={formData.creditLimit} onChange={(e) => setFormData({ ...formData, creditLimit: parseFloat(e.target.value) || 0 })} />
                    <FormInput label="Rating" type="number" min="0" max="5" step="0.5" value={formData.rating} onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) || 0 })} />
                </div>
                <FormInput label="Address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                <FormInput label="Country" value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} />
                <FormTextarea label="Notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={2} />

                <ModalFooter>
                    <button className="btn-secondary" onClick={() => { setIsModalOpen(false); setEditingVendor(null); resetFormData() }}>Cancel</button>
                    <button className="btn-primary" onClick={handleSubmit}>{editingVendor ? 'Update' : 'Create'}</button>
                </ModalFooter>
            </Modal>

            {/* Delete Confirm Modal */}
            <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Vendor" size="small">
                <p style={{ marginBottom: 24, color: 'var(--text-secondary)' }}>Delete <strong>{deleteConfirm?.name}</strong>?</p>
                <ModalFooter>
                    <button className="btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                    <button className="btn-danger" onClick={confirmDelete}>Delete</button>
                </ModalFooter>
            </Modal>

            <style>{`
                .btn-primary { display: flex; align-items: center; gap: 8px; padding: 12px 20px; background: var(--accent-gradient); border-radius: var(--radius-md); color: white; }
                .btn-secondary { padding: 12px 20px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-secondary); }
                .btn-danger { padding: 12px 20px; background: var(--error); border-radius: var(--radius-md); color: white; }
                .filters-bar { display: flex; gap: 16px; margin-bottom: 24px; }
                .filter-group { display: flex; align-items: center; gap: 8px; padding: 8px 14px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); }
                .filter-group svg { color: var(--text-muted); }
                .filter-group select { background: transparent; border: none; color: var(--text-primary); }
                .filter-stats { margin-left: auto; color: var(--text-muted); }
                .form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
                .vendor-code { font-family: 'JetBrains Mono', monospace; font-weight: 600; color: var(--accent-primary); }
                .vendor-name { font-weight: 500; color: var(--text-primary); }
                .type-badge { padding: 4px 10px; background: rgba(139, 92, 246, 0.15); color: #8b5cf6; border-radius: 12px; font-size: 0.75rem; text-transform: capitalize; }
                .rating-container { display: flex; align-items: center; gap: 4px; }
                .rating-container .star.filled { color: #fbbf24; fill: #fbbf24; }
                .rating-container .star.empty { color: var(--text-muted); }
                .rating-text { font-weight: 600; color: var(--text-primary); }
                .amount { font-weight: 600; color: var(--success); }
                .status-badge { padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; text-transform: capitalize; }
                .status-badge.active { background: rgba(16, 185, 129, 0.15); color: var(--success); }
                .status-badge.inactive { background: rgba(107, 114, 128, 0.15); color: var(--text-muted); }
                .action-buttons { display: flex; gap: 8px; }
                .action-btn { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
                .action-btn.edit { background: rgba(59, 130, 246, 0.1); color: var(--info); }
                .action-btn.delete { background: rgba(239, 68, 68, 0.1); color: var(--error); }
            `}</style>

            <PageHelp
                title="Vendor Management"
                description="Manage your supplier database, track performance, and handle contact details."
                shortcuts={[
                    { keys: ['Alt', 'N'], action: 'Create New Vendor' },
                    { keys: ['/'], action: 'Focus Search Bar' },
                    { keys: ['Esc'], action: 'Close Modal' }
                ]}
                walkthroughSteps={[
                    { title: 'Vendor List', description: 'View all your active and inactive vendors here. Use filters to narrow down by type.' },
                    { title: 'Performance Rating', description: 'Star ratings are auto-calculated based on delivery time and quality checks.' },
                    { title: 'Credit Limits', description: 'Monitor available credit with each vendor to avoid payment blockers.' }
                ]}
                faqs={[
                    { question: 'How do I deactivate a vendor?', answer: 'Edit the vendor and change status to "Inactive". This preserves history but prevents new POs.' },
                    { question: 'Can I import vendors?', answer: 'Yes, use the Import button (coming soon) to upload a CSV file.' }
                ]}
            />
        </div>
    )
}

export default Vendors


