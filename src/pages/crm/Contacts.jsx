import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Mail, Phone, Building2, Edit, Trash2, User, MapPin, Filter } from 'lucide-react'
import { getContacts, createContact, updateContact, deleteContact } from '../../stores/crmStore'
import DataTable from '../../components/DataTable'
import Modal, { ModalFooter } from '../../components/Modal'
import FormInput, { FormTextarea, FormSelect } from '../../components/FormInput'
import { useToast } from '../../components/Toast'

const contactTypes = [
    { value: 'customer', label: 'Customer' },
    { value: 'prospect', label: 'Prospect' },
    { value: 'partner', label: 'Partner' },
    { value: 'vendor', label: 'Vendor' }
]

function Contacts() {
    const toast = useToast()
    const [contacts, setContacts] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingContact, setEditingContact] = useState(null)
    const [deleteConfirm, setDeleteConfirm] = useState(null)
    const [filterType, setFilterType] = useState('')

    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '', phone: '', company: '', title: '', type: 'prospect', address: '', notes: ''
    })

    const loadData = () => {
        const filters = filterType ? { type: filterType } : {}
        setContacts(getContacts(filters))
    }

    useEffect(() => { loadData() }, [filterType])

    const handleSubmit = () => {
        if (!formData.firstName || !formData.email) {
            toast.error('First name and email are required')
            return
        }
        if (editingContact) {
            updateContact(editingContact.id, formData)
            toast.success('Contact updated')
        } else {
            createContact(formData)
            toast.success('Contact created')
        }
        setIsModalOpen(false)
        setEditingContact(null)
        setFormData({ firstName: '', lastName: '', email: '', phone: '', company: '', title: '', type: 'prospect', address: '', notes: '' })
        loadData()
    }

    const handleEdit = (contact) => {
        setEditingContact(contact)
        setFormData({
            firstName: contact.firstName, lastName: contact.lastName, email: contact.email,
            phone: contact.phone, company: contact.company, title: contact.title,
            type: contact.type, address: contact.address, notes: contact.notes
        })
        setIsModalOpen(true)
    }

    const confirmDelete = () => {
        if (deleteConfirm) {
            deleteContact(deleteConfirm.id)
            toast.success('Contact deleted')
            setDeleteConfirm(null)
            loadData()
        }
    }

    const columns = [
        {
            key: 'firstName', label: 'Contact',
            render: (_, row) => (
                <div className="contact-cell">
                    <div className="contact-avatar">{row.firstName[0]}{row.lastName[0]}</div>
                    <div>
                        <div className="contact-name">{row.firstName} {row.lastName}</div>
                        <div className="contact-title">{row.title}</div>
                    </div>
                </div>
            )
        },
        { key: 'company', label: 'Company', render: (v) => <span className="company-text"><Building2 size={14} /> {v}</span> },
        { key: 'email', label: 'Email', render: (v) => <span className="email-text"><Mail size={14} /> {v}</span> },
        { key: 'phone', label: 'Phone' },
        { key: 'type', label: 'Type', render: (v) => <span className={`type-badge ${v}`}>{v}</span> },
        { key: 'createdAt', label: 'Added' },
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
                    <h1 className="page-title"><span className="gradient-text">Contacts</span></h1>
                    <p className="page-description">Manage your business contacts and relationships.</p>
                </div>
                <button className="btn-primary" onClick={() => setIsModalOpen(true)}><Plus size={20} /> Add Contact</button>
            </motion.div>

            <div className="filters-bar">
                <div className="filter-group">
                    <Filter size={18} />
                    <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                        <option value="">All Types</option>
                        {contactTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                </div>
                <div className="filter-stats">{contacts.length} contacts</div>
            </div>

            <DataTable columns={columns} data={contacts} searchable exportable />

            {/* Add/Edit Modal */}
            <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingContact(null) }} title={editingContact ? 'Edit Contact' : 'Add Contact'} size="large">
                <div className="form-grid">
                    <FormInput label="First Name *" icon={User} value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
                    <FormInput label="Last Name" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
                    <FormInput label="Email *" type="email" icon={Mail} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                    <FormInput label="Phone" icon={Phone} value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                    <FormInput label="Company" icon={Building2} value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} />
                    <FormInput label="Title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                    <FormSelect label="Type" options={contactTypes} value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} />
                    <FormInput label="Address" icon={MapPin} value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                </div>
                <FormTextarea label="Notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={2} />
                <ModalFooter>
                    <button className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                    <button className="btn-primary" onClick={handleSubmit}>{editingContact ? 'Update' : 'Create'}</button>
                </ModalFooter>
            </Modal>

            {/* Delete Confirm */}
            <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Contact" size="small">
                <p style={{ marginBottom: 24, color: 'var(--text-secondary)' }}>Delete <strong>{deleteConfirm?.firstName} {deleteConfirm?.lastName}</strong>?</p>
                <ModalFooter>
                    <button className="btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                    <button className="btn-danger" onClick={confirmDelete}>Delete</button>
                </ModalFooter>
            </Modal>

            <style>{`
        .page-header { display: flex; justify-content: space-between; }
        .btn-primary { display: flex; align-items: center; gap: 8px; padding: 12px 20px; background: var(--accent-gradient); border-radius: var(--radius-md); color: white; }
        .btn-secondary { padding: 12px 20px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-secondary); }
        .btn-danger { padding: 12px 20px; background: var(--error); border-radius: var(--radius-md); color: white; }
        .filters-bar { display: flex; gap: 16px; margin-bottom: 24px; }
        .filter-group { display: flex; align-items: center; gap: 8px; padding: 8px 14px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); }
        .filter-group svg { color: var(--text-muted); }
        .filter-group select { background: transparent; border: none; color: var(--text-primary); }
        .filter-stats { margin-left: auto; color: var(--text-muted); }
        .form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 16px; }
        .contact-cell { display: flex; align-items: center; gap: 12px; }
        .contact-avatar { width: 40px; height: 40px; border-radius: 10px; background: var(--accent-gradient); display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 0.8rem; }
        .contact-name { font-weight: 500; }
        .contact-title { font-size: 0.8rem; color: var(--text-muted); }
        .company-text, .email-text { display: flex; align-items: center; gap: 6px; font-size: 0.9rem; }
        .company-text svg, .email-text svg { color: var(--text-muted); }
        .type-badge { padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; text-transform: capitalize; }
        .type-badge.customer { background: rgba(16, 185, 129, 0.15); color: var(--success); }
        .type-badge.prospect { background: rgba(59, 130, 246, 0.15); color: var(--info); }
        .type-badge.partner { background: rgba(139, 92, 246, 0.15); color: #8b5cf6; }
        .type-badge.vendor { background: rgba(245, 158, 11, 0.15); color: var(--warning); }
        .action-buttons { display: flex; gap: 8px; }
        .action-btn { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
        .action-btn.edit { background: rgba(59, 130, 246, 0.1); color: var(--info); }
        .action-btn.delete { background: rgba(239, 68, 68, 0.1); color: var(--error); }
      `}</style>
        </div>
    )
}

export default Contacts
