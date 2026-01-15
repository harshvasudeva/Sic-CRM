import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Filter, Edit, Trash2, Factory, Search, MapPin, Clock } from 'lucide-react'
import DataTable from '../../components/DataTable'
import Modal, { ModalFooter } from '../../components/Modal'
import FormInput, { FormTextarea, FormSelect } from '../../components/FormInput'
import { useToast } from '../../components/Toast'

const statuses = [
    { value: 'active', label: 'Active' },
    { value: 'maintenance', label: 'In Maintenance' },
    { value: 'inactive', label: 'Inactive' }
]

const capacities = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' }
]

function WorkCenters() {
    const toast = useToast()
    const [centers, setCenters] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingCenter, setEditingCenter] = useState(null)
    const [deleteConfirm, setDeleteConfirm] = useState(null)

    const [formData, setFormData] = useState({
        code: '', name: '', type: '', location: '', capacity: 'medium', 
        status: 'active', operatingHours: 8, notes: ''
    })

    const loadData = () => {
        const saved = localStorage.getItem('workCenters')
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
            createdAt: editingCenter?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }

        let updatedCenters
        if (editingCenter) {
            updatedCenters = centers.map(c => c.id === editingCenter.id ? centerData : c)
            toast.success('Work center updated')
        } else {
            updatedCenters = [...centers, centerData]
            toast.success('Work center created')
        }

        localStorage.setItem('workCenters', JSON.stringify(updatedCenters))
        setCenters(updatedCenters)
        setIsModalOpen(false)
        setEditingCenter(null)
        resetFormData()
        loadData()
    }

    const handleDelete = () => {
        const updated = centers.filter(c => c.id !== deleteConfirm.id)
        localStorage.setItem('workCenters', JSON.stringify(updated))
        setCenters(updated)
        setDeleteConfirm(null)
        toast.success('Work center deleted')
        loadData()
    }

    const resetFormData = () => {
        setFormData({
            code: '', name: '', type: '', location: '', capacity: 'medium',
            status: 'active', operatingHours: 8, notes: ''
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

    const columns = [
        { key: 'code', label: 'Code' },
        { key: 'name', label: 'Name' },
        { key: 'type', label: 'Type' },
        {
            key: 'location',
            label: 'Location',
            render: (center) => center.location || '-'
        },
        { key: 'capacity', label: 'Capacity', render: (c) => c.capacity?.toUpperCase() || '-' },
        {
            key: 'status',
            label: 'Status',
            render: (center) => (
                <span className={`px-2 py-1 rounded text-xs ${
                    center.status === 'active' ? 'bg-green-600' : 
                    center.status === 'maintenance' ? 'bg-yellow-600' : 'bg-red-600'
                }`}>
                    {center.status?.toUpperCase()}
                </span>
            )
        },
        {
            key: 'operatingHours',
            label: 'Hours/Day',
            render: (center) => `${center.operatingHours || 8}h`
        }
    ]

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Work Centers</h1>
                    <p className="text-gray-400 mt-1">Manage production work centers and facilities</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => openModal()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                    <Plus size={18} />
                    New Work Center
                </motion.button>
            </div>

            <DataTable
                columns={columns}
                data={centers}
                actions={(center) => (
                    <div className="flex gap-2">
                        <button onClick={() => openModal(center)} className="p-2 hover:bg-gray-700 rounded">
                            <Edit size={16} />
                        </button>
                        <button onClick={() => setDeleteConfirm(center)} className="p-2 hover:bg-red-600 rounded">
                            <Trash2 size={16} />
                        </button>
                    </div>
                )}
            />

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingCenter ? 'Edit Work Center' : 'New Work Center'}>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <FormInput
                            label="Center Code"
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                            placeholder="WC-001"
                        />
                        <FormInput
                            label="Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Assembly Line 1"
                        />
                    </div>
                    <FormInput
                        label="Type"
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        placeholder="Assembly, Machining, Packaging..."
                    />
                    <FormInput
                        label="Location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="Building A, Floor 2"
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <FormSelect
                            label="Capacity"
                            value={formData.capacity}
                            onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                            options={capacities}
                        />
                        <FormSelect
                            label="Status"
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            options={statuses}
                        />
                    </div>
                    <FormInput
                        label="Operating Hours (per day)"
                        type="number"
                        value={formData.operatingHours}
                        onChange={(e) => setFormData({ ...formData, operatingHours: parseInt(e.target.value) || 8 })}
                    />
                    <FormTextarea
                        label="Notes"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Additional information..."
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
                    Are you sure you want to delete work center "<strong>{deleteConfirm?.code}</strong>"?
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

export default WorkCenters
