import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit, Trash2, Building, Users } from 'lucide-react'
import DataTable from '../../components/DataTable'
import Modal, { ModalFooter } from '../../components/Modal'
import FormInput, { FormTextarea, FormSelect } from '../../components/FormInput'
import { useToast } from '../../components/Toast'
import { formatCurrency } from '../../stores/settingsStore'

const costCenterTypes = [
    { value: 'department', label: 'Department' },
    { value: 'project', label: 'Project' },
    { value: 'location', label: 'Location' },
    { value: 'employee', label: 'Employee' },
    { value: 'product', label: 'Product' },
    { value: 'branch', label: 'Branch/Division' },
]

function CostCenters() {
    const toast = useToast()
    const [centers, setCenters] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingCenter, setEditingCenter] = useState(null)
    const [deleteConfirm, setDeleteConfirm] = useState(null)

    const [formData, setFormData] = useState({
        code: '', name: '', type: 'department', parentCenterId: '',
        category: '', budget: 0, allocatedBudget: 0, notes: ''
    })

    const loadData = () => {
        const saved = localStorage.getItem('costCenters')
        setCenters(saved ? JSON.parse(saved) : [])
    }

    useEffect(() => { loadData() }, [])

    const handleSubmit = () => {
        if (!formData.code || !formData.name) {
            toast.error('Code and Name are required')
            return
        }

        const centerData = {
            ...formData,
            id: editingCenter?.id || Date.now(),
            actualSpend: 0,
            variance: formData.allocatedBudget || 0,
            status: 'active',
            createdAt: editingCenter?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }

        let updatedCenters
        if (editingCenter) {
            updatedCenters = centers.map(c => c.id === editingCenter.id ? centerData : c)
            toast.success('Cost center updated')
        } else {
            updatedCenters = [...centers, centerData]
            toast.success('Cost center created')
        }

        localStorage.setItem('costCenters', JSON.stringify(updatedCenters))
        setCenters(updatedCenters)
        setIsModalOpen(false)
        setEditingCenter(null)
        resetFormData()
        loadData()
    }

    const handleDelete = () => {
        const updated = centers.filter(c => c.id !== deleteConfirm.id)
        localStorage.setItem('costCenters', JSON.stringify(updated))
        setCenters(updated)
        setDeleteConfirm(null)
        toast.success('Cost center deleted')
        loadData()
    }

    const resetFormData = () => {
        setFormData({
            code: '', name: '', type: 'department', parentCenterId: '',
            category: '', budget: 0, allocatedBudget: 0, notes: ''
        })
    }

    const openModal = (center = null) => {
        if (center) {
            setEditingCenter(center)
            setFormData(center)
        } else {
            resetFormData()
        }
        setIsModalOpen(true)
    }

    const totalBudget = centers.reduce((sum, c) => sum + (c.allocatedBudget || 0), 0)
    const totalSpend = centers.reduce((sum, c) => sum + (c.actualSpend || 0), 0)
    const totalVariance = totalBudget - totalSpend

    const columns = [
        { key: 'code', label: 'Code' },
        { key: 'name', label: 'Name' },
        {
            key: 'type',
            label: 'Type',
            render: (c) => <span className="capitalize">{c.type}</span>
        },
        { key: 'category', label: 'Category' },
        {
            key: 'allocatedBudget',
            label: 'Budget',
            render: (v) => `$${v?.toLocaleString() || '0'}`
        },
        {
            key: 'actualSpend',
            label: 'Actual',
            render: (v) => `$${v?.toLocaleString() || '0'}`
        },
        {
            key: 'variance',
            label: 'Variance',
            render: (v) => (
                <span className={v < 0 ? 'text-green-400' : v > 0 ? 'text-red-400' : 'text-gray-400'}>
                    ${v?.toLocaleString() || '0'}
                </span>
            )
        }
    ]

    return (
        <div className="page">
            <motion.div
                className="page-header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div>
                    <h1 className="page-title">
                        <span className="gradient-text">Cost</span> Centers
                    </h1>
                    <p className="page-description">
                        Track expenses by departments, projects, and locations
                    </p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => openModal()}
                    className="btn-primary"
                >
                    <Plus size={18} />
                    New Cost Center
                </motion.button>
            </motion.div>

            <div className="stats-grid">
                <motion.div
                    className="stat-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="stat-icon bg-blue">
                        <Building size={28} />
                    </div>
                    <div className="stat-content">
                        <h3>{formatCurrency(totalBudget)}</h3>
                        <p>Total Budget</p>
                    </div>
                </motion.div>
                <motion.div
                    className="stat-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="stat-icon bg-red">
                        <Users size={28} />
                    </div>
                    <div className="stat-content">
                        <h3>{formatCurrency(totalSpend)}</h3>
                        <p>Total Spend</p>
                    </div>
                </motion.div>
                <motion.div
                    className="stat-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="stat-icon bg-purple">
                        <Building size={28} />
                    </div>
                    <div className="stat-content">
                        <h3 style={{ color: totalVariance >= 0 ? 'var(--success)' : 'var(--error)' }}>
                            {formatCurrency(totalVariance)}
                        </h3>
                        <p>Variance</p>
                    </div>
                </motion.div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <DataTable
                    columns={columns}
                    data={centers}
                    actions={(center) => (
                        <div className="action-buttons">
                            <button onClick={() => openModal(center)} className="btn-icon">
                                <Edit size={16} />
                            </button>
                            <button onClick={() => setDeleteConfirm(center)} className="btn-icon btn-icon-danger">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    )}
                />
            </motion.div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingCenter ? 'Edit Cost Center' : 'New Cost Center'}>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <FormInput
                            label="Center Code *"
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                            placeholder="CC-001"
                        />
                        <FormInput
                            label="Center Name *"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Marketing Dept"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <FormSelect
                            label="Center Type *"
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            options={costCenterTypes}
                        />
                        <FormInput
                            label="Parent Center"
                            value={formData.parentCenterId}
                            onChange={(e) => setFormData({ ...formData, parentCenterId: e.target.value })}
                            placeholder="Parent center ID"
                        />
                    </div>
                    <FormInput
                        label="Category"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        placeholder="OPEX, CAPEX, etc."
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <FormInput
                            label="Allocated Budget"
                            type="number"
                            value={formData.allocatedBudget}
                            onChange={(e) => setFormData({ ...formData, allocatedBudget: parseFloat(e.target.value) || 0 })}
                            placeholder="0.00"
                        />
                        <FormInput
                            label="Budget"
                            type="number"
                            value={formData.budget}
                            onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) || 0 })}
                            placeholder="0.00"
                        />
                    </div>
                    <FormTextarea
                        label="Notes"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Additional information..."
                        rows={3}
                    />
                </div>
                <ModalFooter
                    onCancel={() => setIsModalOpen(false)}
                    onConfirm={handleSubmit}
                    confirmText={editingCenter ? 'Update' : 'Create'}
                />
            </Modal>

            <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Confirm Delete">
                <p className="text-gray-300">
                    Are you sure you want to delete cost center "<strong>{deleteConfirm?.name}</strong>"?
                </p>
                <ModalFooter
                    onCancel={() => setDeleteConfirm(null)}
                    onConfirm={handleDelete}
                    confirmText="Delete"
                    confirmClass="bg-red-600 hover:bg-red-700"
                />
            </Modal>
        </div>
    )
}

export default CostCenters
