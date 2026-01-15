import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Filter, Edit, Trash2, Target, TrendingUp, Calendar, Users, DollarSign } from 'lucide-react'
import { getSalesTargets, deleteSalesTarget, createSalesTarget, updateSalesTarget, updateTargetProgress, getSalesOrders } from '../../stores/salesStore'
import DataTable from '../../components/DataTable'
import Modal, { ModalFooter } from '../../components/Modal'
import FormInput, { FormTextarea, FormSelect } from '../../components/FormInput'
import { useToast } from '../../components/Toast'

const types = [
    { value: 'revenue', label: 'Revenue' },
    { value: 'orders', label: 'Orders' },
    { value: 'deals', label: 'Deals' }
]

const periods = [
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' }
]

const statuses = [
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
]

function SalesTargets() {
    const toast = useToast()
    const [targets, setTargets] = useState([])
    const [orders, setOrders] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingTarget, setEditingTarget] = useState(null)
    const [deleteConfirm, setDeleteConfirm] = useState(null)
    const [updateModal, setUpdateModal] = useState(null)
    const [filterStatus, setFilterStatus] = useState('')
    const [filterType, setFilterType] = useState('')

    const [formData, setFormData] = useState({
        name: '', description: '', type: 'revenue', period: 'quarterly',
        startDate: '', endDate: '', targetAmount: 0, assignedTo: '', teamTarget: false, teamMembers: []
    })

    const [updateData, setUpdateData] = useState({ amount: 0 })

    const loadData = () => {
        const filters = {}
        if (filterStatus) filters.status = filterStatus
        if (filterType) filters.type = filterType
        setTargets(getSalesTargets())
        setOrders(getSalesOrders())
    }

    useEffect(() => { loadData() }, [filterStatus, filterType])

    const handleSubmit = () => {
        if (!formData.name || formData.targetAmount <= 0 || !formData.startDate || !formData.endDate) {
            toast.error('Please fill all required fields')
            return
        }

        if (editingTarget) {
            updateSalesTarget(editingTarget.id, formData)
            toast.success('Sales target updated')
        } else {
            createSalesTarget(formData)
            toast.success('Sales target created')
        }
        setIsModalOpen(false)
        setEditingTarget(null)
        resetFormData()
        loadData()
    }

    const handleEdit = (target) => {
        setEditingTarget(target)
        setFormData({
            name: target.name,
            description: target.description,
            type: target.type,
            period: target.period,
            startDate: target.startDate,
            endDate: target.endDate,
            targetAmount: target.targetAmount,
            assignedTo: target.assignedTo,
            teamTarget: target.teamTarget,
            teamMembers: target.teamMembers || []
        })
        setIsModalOpen(true)
    }

    const handleUpdateProgress = (target) => {
        setUpdateModal(target)
        setUpdateData({ amount: 0 })
    }

    const confirmUpdate = () => {
        updateTargetProgress(updateModal.id, updateData.amount)
        toast.success(`Updated target progress by $${updateData.amount}`)
        setUpdateModal(null)
        loadData()
    }

    const confirmDelete = () => {
        if (deleteConfirm) {
            deleteSalesTarget(deleteConfirm.id)
            toast.success('Sales target deleted')
            setDeleteConfirm(null)
            loadData()
        }
    }

    const calculateProgress = (target) => {
        const percentage = target.targetAmount > 0 ? (target.achievedAmount / target.targetAmount * 100) : 0
        return Math.min(percentage, 100)
    }

    const resetFormData = () => {
        setFormData({
            name: '', description: '', type: 'revenue', period: 'quarterly',
            startDate: '', endDate: '', targetAmount: 0, assignedTo: '', teamTarget: false, teamMembers: []
        })
    }

    const columns = [
        { key: 'name', label: 'Target Name', render: (v) => <span className="target-name">{v}</span> },
        { key: 'type', label: 'Type', render: (v) => <span className="type-badge">{v}</span> },
        { key: 'period', label: 'Period', render: (v) => <span className="period-badge">{v}</span> },
        {
            key: 'targetAmount', label: 'Target',
            render: (v) => <span className="amount">${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v)}</span>
        },
        {
            key: 'achievedAmount', label: 'Achieved',
            render: (v, row) => (
                <div className="progress-cell">
                    <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${calculateProgress(row)}%` }}></div>
                    </div>
                    <div className="progress-text">
                        <span className="achieved">${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(v)}</span>
                        <span className="percent">{calculateProgress(row).toFixed(1)}%</span>
                    </div>
                </div>
            )
        },
        { key: 'startDate', label: 'Start Date' },
        { key: 'endDate', label: 'End Date' },
        {
            key: 'status', label: 'Status',
            render: (v) => <span className={`status-badge ${v}`}>{v}</span>
        },
        {
            key: 'actions', label: '', sortable: false,
            render: (_, row) => (
                <div className="action-buttons">
                    <button className="action-btn update" onClick={() => handleUpdateProgress(row)} title="Update Progress"><TrendingUp size={16} /></button>
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
                    <h1 className="page-title"><span className="gradient-text">Sales</span> Targets</h1>
                    <p className="page-description">Track sales goals and team performance.</p>
                </div>
                <button className="btn-primary" onClick={() => setIsModalOpen(true)}><Plus size={20} /> New Target</button>
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
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                        <option value="">All Status</option>
                        {statuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                </div>
                <div className="filter-group">
                    <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                        <option value="">All Types</option>
                        {types.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                </div>
                <div className="filter-stats">{targets.length} targets</div>
            </div>

            <DataTable columns={columns} data={targets} searchable exportable />

            {/* Add/Edit Modal */}
            <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingTarget(null); resetFormData() }} title={editingTarget ? 'Edit Sales Target' : 'New Sales Target'} size="medium">
                <div className="form-grid">
                    <FormInput label="Target Name *" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    <FormSelect label="Target Type *" options={types} value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} />
                </div>
                <FormTextarea label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2} />

                <div className="form-grid">
                    <FormSelect label="Period *" options={periods} value={formData.period} onChange={(e) => setFormData({ ...formData, period: e.target.value })} />
                    <FormInput label="Target Amount *" type="number" value={formData.targetAmount} onChange={(e) => setFormData({ ...formData, targetAmount: parseFloat(e.target.value) || 0 })} />
                </div>

                <div className="form-grid">
                    <FormInput label="Start Date *" type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} />
                    <FormInput label="End Date *" type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} />
                </div>

                <ModalFooter>
                    <button className="btn-secondary" onClick={() => { setIsModalOpen(false); setEditingTarget(null); resetFormData() }}>Cancel</button>
                    <button className="btn-primary" onClick={handleSubmit}>{editingTarget ? 'Update' : 'Create'}</button>
                </ModalFooter>
            </Modal>

            {/* Update Progress Modal */}
            <Modal isOpen={!!updateModal} onClose={() => setUpdateModal(null)} title={`Update Progress: ${updateModal?.name}`} size="small">
                <div style={{ marginBottom: 16 }}>
                    <div className="current-progress">
                        <span>Current: </span>
                        <span className="amount">${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(updateModal?.achievedAmount || 0)}</span>
                    </div>
                    <div className="current-progress">
                        <span>Target: </span>
                        <span className="target">${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(updateModal?.targetAmount || 0)}</span>
                    </div>
                    <div className="current-progress total">
                        <span>Progress: </span>
                        <span>{calculateProgress(updateModal || { achievedAmount: 0, targetAmount: 1 }).toFixed(1)}%</span>
                    </div>
                </div>
                <FormInput label="Add Amount *" type="number" value={updateData.amount} onChange={(e) => setUpdateData({ amount: parseFloat(e.target.value) || 0 })} />
                <ModalFooter>
                    <button className="btn-secondary" onClick={() => setUpdateModal(null)}>Cancel</button>
                    <button className="btn-primary" onClick={confirmUpdate}>Update</button>
                </ModalFooter>
            </Modal>

            {/* Delete Confirm Modal */}
            <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Sales Target" size="small">
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
                .target-name { font-weight: 600; color: var(--text-primary); }
                .type-badge { padding: 4px 10px; background: rgba(139, 92, 246, 0.15); color: #8b5cf6; border-radius: 12px; font-size: 0.75rem; text-transform: capitalize; }
                .period-badge { padding: 4px 10px; background: rgba(59, 130, 246, 0.15); color: var(--info); border-radius: 12px; font-size: 0.75rem; text-transform: capitalize; }
                .amount { font-weight: 600; color: var(--text-primary); }
                .progress-cell { display: flex; flex-direction: column; gap: 6px; min-width: 150px; }
                .progress-bar { height: 6px; background: var(--bg-tertiary); border-radius: 3px; overflow: hidden; }
                .progress-fill { height: 100%; background: var(--accent-gradient); border-radius: 3px; transition: width 0.3s ease; }
                .progress-text { display: flex; justify-content: space-between; align-items: center; font-size: 0.85rem; }
                .progress-text .achieved { color: var(--text-primary); }
                .progress-text .percent { font-weight: 600; color: var(--accent-primary); }
                .current-progress { display: flex; justify-content: space-between; padding: 8px 0; color: var(--text-secondary); }
                .current-progress.total { padding-top: 8px; border-top: 1px solid var(--border-color); margin-top: 8px; font-weight: 600; color: var(--text-primary); }
                .current-progress .amount, .current-progress .target { color: var(--text-primary); }
                .status-badge { padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; text-transform: capitalize; }
                .status-badge.active { background: rgba(16, 185, 129, 0.15); color: var(--success); }
                .status-badge.completed { background: rgba(59, 130, 246, 0.15); color: var(--info); }
                .status-badge.cancelled { background: rgba(239, 68, 68, 0.15); color: var(--error); }
                .action-buttons { display: flex; gap: 8px; }
                .action-btn { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
                .action-btn.update { background: rgba(16, 185, 129, 0.1); color: var(--success); }
                .action-btn.edit { background: rgba(59, 130, 246, 0.1); color: var(--info); }
                .action-btn.delete { background: rgba(239, 68, 68, 0.1); color: var(--error); }
            `}</style>
        </div>
    )
}

export default SalesTargets
