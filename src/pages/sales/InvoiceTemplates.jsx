import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit, Trash2, FileText, Star, Copy } from 'lucide-react'
import { getInvoiceTemplates, deleteInvoiceTemplate, createInvoiceTemplate, updateInvoiceTemplate } from '../../stores/salesStore'
import DataTable from '../../components/DataTable'
import Modal, { ModalFooter } from '../../components/Modal'
import FormInput, { FormTextarea } from '../../components/FormInput'
import { useToast } from '../../components/Toast'

function InvoiceTemplates() {
    const toast = useToast()
    const [templates, setTemplates] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingTemplate, setEditingTemplate] = useState(null)
    const [deleteConfirm, setDeleteConfirm] = useState(null)
    const [duplicateModal, setDuplicateModal] = useState(null)

    const [formData, setFormData] = useState({
        name: '', description: '', terms: '', notes: '', default: false
    })

    const loadData = () => {
        setTemplates(getInvoiceTemplates())
    }

    useEffect(() => { loadData() }, [])

    const handleSubmit = () => {
        if (!formData.name) {
            toast.error('Template name is required')
            return
        }

        if (formData.default) {
            templates.forEach(t => {
                if (t.id !== (editingTemplate?.id) && t.default) {
                    updateInvoiceTemplate(t.id, { default: false })
                }
            })
        }

        if (editingTemplate) {
            updateInvoiceTemplate(editingTemplate.id, formData)
            toast.success('Template updated')
        } else {
            createInvoiceTemplate(formData)
            toast.success('Template created')
        }
        setIsModalOpen(false)
        setEditingTemplate(null)
        resetFormData()
        loadData()
    }

    const handleEdit = (template) => {
        setEditingTemplate(template)
        setFormData({
            name: template.name,
            description: template.description,
            terms: template.terms,
            notes: template.notes,
            default: template.default
        })
        setIsModalOpen(true)
    }

    const handleDuplicate = (template) => {
        setDuplicateModal(template)
    }

    const confirmDuplicate = () => {
        const newTemplate = createInvoiceTemplate({
            name: `${duplicateModal.name} (Copy)`,
            description: duplicateModal.description,
            terms: duplicateModal.terms,
            notes: duplicateModal.notes,
            default: false
        })
        toast.success('Template duplicated')
        setDuplicateModal(null)
        loadData()
    }

    const confirmDelete = () => {
        if (deleteConfirm) {
            deleteInvoiceTemplate(deleteConfirm.id)
            toast.success('Template deleted')
            setDeleteConfirm(null)
            loadData()
        }
    }

    const handleSetDefault = (template) => {
        templates.forEach(t => {
            updateInvoiceTemplate(t.id, { default: t.id === template.id })
        })
        toast.success('Default template updated')
        loadData()
    }

    const resetFormData = () => {
        setFormData({
            name: '', description: '', terms: '', notes: '', default: false
        })
    }

    const columns = [
        {
            key: 'name', label: 'Template Name',
            render: (v, row) => (
                <div className="template-name-cell">
                    <div className="template-name">
                        {v}
                        {row.default && <Star size={14} className="default-star" />}
                    </div>
                    {row.description && <div className="template-desc">{row.description}</div>}
                </div>
            )
        },
        { key: 'terms', label: 'Terms', render: (v) => v ? `${v.substring(0, 50)}...` : '-' },
        { key: 'notes', label: 'Notes', render: (v) => v ? `${v.substring(0, 50)}...` : '-' },
        { key: 'default', label: 'Default', render: (v) => v ? <span className="default-badge">Default</span> : '-' },
        { key: 'createdAt', label: 'Created' },
        {
            key: 'actions', label: '', sortable: false,
            render: (_, row) => (
                <div className="action-buttons">
                    {!row.default && (
                        <button className="action-btn default" onClick={() => handleSetDefault(row)} title="Set as Default"><Star size={16} /></button>
                    )}
                    <button className="action-btn duplicate" onClick={() => handleDuplicate(row)} title="Duplicate"><Copy size={16} /></button>
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
                    <h1 className="page-title"><span className="gradient-text">Invoice</span> Templates</h1>
                    <p className="page-description">Create reusable invoice templates for faster billing.</p>
                </div>
                <button className="btn-primary" onClick={() => setIsModalOpen(true)}><Plus size={20} /> New Template</button>
            </motion.div>

            <div className="filters-bar">
                <div className="filter-stats">{templates.length} templates</div>
            </div>

            <DataTable columns={columns} data={templates} searchable exportable />

            {/* Add/Edit Modal */}
            <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingTemplate(null); resetFormData() }} title={editingTemplate ? 'Edit Template' : 'New Template'} size="large">
                <FormInput label="Template Name *" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                <FormTextarea label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2} />
                <FormTextarea label="Default Terms" value={formData.terms} onChange={(e) => setFormData({ ...formData, terms: e.target.value })} rows={3} placeholder="Payment terms, late fees, etc." />
                <FormTextarea label="Default Notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={2} placeholder="Thank you message, payment instructions, etc." />
                <div style={{ marginTop: 16 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', cursor: 'pointer' }}>
                        <input
                            type="checkbox"
                            checked={formData.default}
                            onChange={(e) => setFormData({ ...formData, default: e.target.checked })}
                        />
                        Set as default template
                    </label>
                </div>
                <ModalFooter>
                    <button className="btn-secondary" onClick={() => { setIsModalOpen(false); setEditingTemplate(null); resetFormData() }}>Cancel</button>
                    <button className="btn-primary" onClick={handleSubmit}>{editingTemplate ? 'Update' : 'Create'}</button>
                </ModalFooter>
            </Modal>

            {/* Duplicate Confirm Modal */}
            <Modal isOpen={!!duplicateModal} onClose={() => setDuplicateModal(null)} title="Duplicate Template" size="small">
                <p style={{ marginBottom: 24, color: 'var(--text-secondary)' }}>Duplicate <strong>{duplicateModal?.name}</strong>?</p>
                <ModalFooter>
                    <button className="btn-secondary" onClick={() => setDuplicateModal(null)}>Cancel</button>
                    <button className="btn-primary" onClick={confirmDuplicate}>Duplicate</button>
                </ModalFooter>
            </Modal>

            {/* Delete Confirm Modal */}
            <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Template" size="small">
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
                .filter-stats { margin-left: auto; color: var(--text-muted); }
                .template-name-cell { display: flex; flex-direction: column; }
                .template-name { display: flex; align-items: center; gap: 6px; font-weight: 500; color: var(--text-primary); }
                .default-star { color: #fbbf24; }
                .template-desc { font-size: 0.8rem; color: var(--text-muted); margin-top: 2px; }
                .default-badge { padding: 2px 8px; background: rgba(251, 191, 36, 0.15); color: #fbbf24; border-radius: 8px; font-size: 0.7rem; font-weight: 600; }
                .action-buttons { display: flex; gap: 8px; }
                .action-btn { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
                .action-btn.default { background: rgba(251, 191, 36, 0.1); color: #fbbf24; }
                .action-btn.duplicate { background: rgba(59, 130, 246, 0.1); color: var(--info); }
                .action-btn.edit { background: rgba(59, 130, 246, 0.1); color: var(--info); }
                .action-btn.delete { background: rgba(239, 68, 68, 0.1); color: var(--error); }
            `}</style>
        </div>
    )
}

export default InvoiceTemplates
