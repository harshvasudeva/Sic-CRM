import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Filter, Search, Edit, Trash2, Target, Phone, Mail, Star } from 'lucide-react'
import { getLeads, deleteLead, createLead, updateLead, convertLeadToOpportunity } from '../../stores/crmStore'
import DataTable from '../../components/DataTable'
import Modal, { ModalFooter } from '../../components/Modal'
import FormInput, { FormTextarea, FormSelect } from '../../components/FormInput'
import { useToast } from '../../components/Toast'

const sources = [
    { value: 'website', label: 'Website' },
    { value: 'referral', label: 'Referral' },
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'cold_call', label: 'Cold Call' },
    { value: 'trade_show', label: 'Trade Show' },
    { value: 'advertising', label: 'Advertising' }
]

const statuses = [
    { value: 'new', label: 'New' },
    { value: 'contacted', label: 'Contacted' },
    { value: 'qualified', label: 'Qualified' },
    { value: 'unqualified', label: 'Unqualified' },
    { value: 'converted', label: 'Converted' }
]

function Leads() {
    const toast = useToast()
    const [leads, setLeads] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingLead, setEditingLead] = useState(null)
    const [deleteConfirm, setDeleteConfirm] = useState(null)
    const [convertModal, setConvertModal] = useState(null)
    const [filterStatus, setFilterStatus] = useState('')
    const [filterSource, setFilterSource] = useState('')

    const [formData, setFormData] = useState({
        name: '', company: '', email: '', phone: '', source: 'website', notes: '', score: 50
    })

    const [convertData, setConvertData] = useState({
        name: '', value: '', expectedClose: ''
    })

    const loadData = async () => {
        const filters = {}
        if (filterStatus) filters.status = filterStatus
        if (filterSource) filters.source = filterSource
        // Assuming getLeads is async now or returns a promise
        try {
            const data = await getLeads(filters)
            setLeads(data)
        } catch (error) {
            console.error(error)
            toast.error('Failed to load leads')
        }
    }

    useEffect(() => { loadData() }, [filterStatus, filterSource])

    const location = useLocation()
    useEffect(() => {
        const params = new URLSearchParams(location.search)
        if (params.get('action') === 'create') {
            setIsModalOpen(true)
        }
    }, [location])

    const handleSubmit = async () => {
        if (!formData.name || !formData.email) {
            toast.error('Name and email are required')
            return
        }
        try {
            if (editingLead) {
                await updateLead(editingLead.id, formData)
                toast.success('Lead updated')
            } else {
                await createLead(formData)
                toast.success('Lead created')
            }
            setIsModalOpen(false)
            setEditingLead(null)
            setFormData({ name: '', company: '', email: '', phone: '', source: 'website', notes: '', score: 50 })
            loadData()
        } catch (err) {
            toast.error('Operation failed')
        }
    }

    const handleEdit = (lead) => {
        setEditingLead(lead)
        setFormData({
            name: lead.name, company: lead.company, email: lead.email,
            phone: lead.phone, source: lead.source, notes: lead.notes, score: lead.score
        })
        setIsModalOpen(true)
    }

    const handleConvert = (lead) => {
        setConvertModal(lead)
        setConvertData({ name: `${lead.company} Deal`, value: '', expectedClose: '' })
    }

    const confirmConvert = async () => {
        if (!convertData.value) {
            toast.error('Deal value is required')
            return
        }
        try {
            await convertLeadToOpportunity(convertModal.id, convertData)
            toast.success('Lead converted to opportunity')
            setConvertModal(null)
            loadData()
        } catch (err) {
            toast.error('Conversion failed')
        }
    }

    const confirmDelete = async () => {
        if (deleteConfirm) {
            try {
                await deleteLead(deleteConfirm.id)
                toast.success('Lead deleted')
                setDeleteConfirm(null)
                loadData()
            } catch (err) {
                toast.error('Delete failed')
            }
        }
    }

    const columns = [
        {
            key: 'name', label: 'Lead',
            render: (value, row) => (
                <div className="lead-cell">
                    <div className="lead-avatar">{value.split(' ').map(n => n[0]).join('')}</div>
                    <div>
                        <div className="lead-name">{value}</div>
                        <div className="lead-company">{row.company}</div>
                    </div>
                </div>
            )
        },
        { key: 'email', label: 'Email' },
        { key: 'source', label: 'Source', render: (v) => <span className="source-badge">{v.replace('_', ' ')}</span> },
        { key: 'score', label: 'Score', render: (v) => <div className="score-badge" style={{ '--score': v }}>{v}</div> },
        { key: 'status', label: 'Status', render: (v) => <span className={`status-badge ${v}`}>{v}</span> },
        { key: 'createdAt', label: 'Created' },
        {
            key: 'actions', label: '', sortable: false,
            render: (_, row) => (
                <div className="action-buttons">
                    {row.status !== 'converted' && row.status !== 'unqualified' && (
                        <button className="action-btn convert" onClick={() => handleConvert(row)} title="Convert to Opportunity"><Target size={16} /></button>
                    )}
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
                    <h1 className="page-title"><span className="gradient-text">Leads</span></h1>
                    <p className="page-description">Track and convert potential customers.</p>
                </div>
                <button className="btn-primary" onClick={() => setIsModalOpen(true)}><Plus size={20} /> Add Lead</button>
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
                    <select value={filterSource} onChange={(e) => setFilterSource(e.target.value)}>
                        <option value="">All Sources</option>
                        {sources.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                </div>
                <div className="filter-stats">{leads.length} leads</div>
            </div>

            <DataTable columns={columns} data={leads} searchable exportable />

            {/* Add/Edit Modal */}
            <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingLead(null) }} title={editingLead ? 'Edit Lead' : 'Add Lead'} size="medium">
                <div className="form-grid">
                    <FormInput label="Name *" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    <FormInput label="Company" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} />
                    <FormInput label="Email *" type="email" icon={Mail} value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                    <FormInput label="Phone" icon={Phone} value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                    <FormSelect label="Source" options={sources} value={formData.source} onChange={(e) => setFormData({ ...formData, source: e.target.value })} />
                    <FormInput label="Score (1-100)" type="number" value={formData.score} onChange={(e) => setFormData({ ...formData, score: parseInt(e.target.value) || 50 })} />
                </div>
                <FormTextarea label="Notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={2} />
                <ModalFooter>
                    <button className="btn-secondary" onClick={() => { setIsModalOpen(false); setEditingLead(null) }}>Cancel</button>
                    <button className="btn-primary" onClick={handleSubmit}>{editingLead ? 'Update' : 'Create'}</button>
                </ModalFooter>
            </Modal>

            {/* Convert Modal */}
            <Modal isOpen={!!convertModal} onClose={() => setConvertModal(null)} title="Convert to Opportunity" size="small">
                <FormInput label="Deal Name" value={convertData.name} onChange={(e) => setConvertData({ ...convertData, name: e.target.value })} />
                <div style={{ marginTop: 16 }}>
                    <FormInput label="Deal Value *" type="number" value={convertData.value} onChange={(e) => setConvertData({ ...convertData, value: e.target.value })} />
                </div>
                <div style={{ marginTop: 16 }}>
                    <FormInput label="Expected Close" type="date" value={convertData.expectedClose} onChange={(e) => setConvertData({ ...convertData, expectedClose: e.target.value })} />
                </div>
                <ModalFooter>
                    <button className="btn-secondary" onClick={() => setConvertModal(null)}>Cancel</button>
                    <button className="btn-primary" onClick={confirmConvert}>Convert</button>
                </ModalFooter>
            </Modal>

            {/* Delete Confirm */}
            <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Lead" size="small">
                <p style={{ marginBottom: 24, color: 'var(--text-secondary)' }}>Delete <strong>{deleteConfirm?.name}</strong>?</p>
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
        .lead-cell { display: flex; align-items: center; gap: 12px; }
        .lead-avatar { width: 40px; height: 40px; border-radius: 10px; background: var(--accent-gradient); display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 0.8rem; }
        .lead-name { font-weight: 500; }
        .lead-company { font-size: 0.8rem; color: var(--text-muted); }
        .source-badge { padding: 4px 10px; background: rgba(139, 92, 246, 0.15); color: #8b5cf6; border-radius: 12px; font-size: 0.75rem; text-transform: capitalize; }
        .score-badge { width: 36px; height: 36px; border-radius: 50%; background: conic-gradient(var(--success) calc(var(--score) * 1%), rgba(255,255,255,0.1) 0); display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 600; }
        .status-badge { padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; text-transform: capitalize; }
        .status-badge.new { background: rgba(59, 130, 246, 0.15); color: var(--info); }
        .status-badge.contacted { background: rgba(139, 92, 246, 0.15); color: #8b5cf6; }
        .status-badge.qualified { background: rgba(16, 185, 129, 0.15); color: var(--success); }
        .status-badge.unqualified { background: rgba(107, 114, 128, 0.15); color: var(--text-muted); }
        .status-badge.converted { background: rgba(245, 158, 11, 0.15); color: var(--warning); }
        .action-buttons { display: flex; gap: 8px; }
        .action-btn { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
        .action-btn.convert { background: rgba(16, 185, 129, 0.1); color: var(--success); }
        .action-btn.edit { background: rgba(59, 130, 246, 0.1); color: var(--info); }
        .action-btn.delete { background: rgba(239, 68, 68, 0.1); color: var(--error); }
      `}</style>
        </div>
    )
}

export default Leads
