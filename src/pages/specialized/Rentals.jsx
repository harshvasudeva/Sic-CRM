import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Filter, Edit, Trash2, Calendar, Clock, CheckCircle, AlertTriangle } from 'lucide-react'
import DataTable from '../../components/DataTable'
import Modal, { ModalFooter } from '../../components/Modal'
import FormInput, { FormTextarea, FormSelect } from '../../components/FormInput'
import { useToast } from '../../components/Toast'

const statuses = [
    { value: 'reserved', label: 'Reserved' },
    { value: 'rented', label: 'Rented' },
    { value: 'returned', label: 'Returned' },
    { value: 'overdue', label: 'Overdue' },
    { value: 'cancelled', label: 'Cancelled' }
]

const rentalItems = [
    { id: 1, name: 'Conference Room', type: 'space', rate: 50, unit: 'hour' },
    { id: 2, name: 'Projector 4K', type: 'equipment', rate: 25, unit: 'day' },
    { id: 3, name: 'Laptop (MacBook Pro)', type: 'equipment', rate: 40, unit: 'day' },
    { id: 4, name: 'Meeting Room A', type: 'space', rate: 30, unit: 'hour' },
    { id: 5, name: 'WiFi Hotspot', type: 'equipment', rate: 10, unit: 'day' },
]

function Rentals() {
    const toast = useToast()
    const [rentals, setRentals] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingRental, setEditingRental] = useState(null)
    const [deleteConfirm, setDeleteConfirm] = useState(null)
    const [filterStatus, setFilterStatus] = useState('')

    const [formData, setFormData] = useState({
        itemId: '', customerId: '', startDate: '', endDate: '', status: 'reserved',
        deposit: 0, notes: ''
    })

    const loadData = () => {
        const saved = localStorage.getItem('rentals')
        setRentals(saved ? JSON.parse(saved) : [])
    }

    useEffect(() => { loadData() }, [])

    const handleSubmit = () => {
        if (!formData.itemId || !formData.customerId || !formData.startDate || !formData.endDate) {
            toast.error('All required fields must be filled')
            return
        }

        const rentalData = {
            ...formData,
            id: editingRental?.id || Date.now(),
            createdAt: editingRental?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }

        const item = rentalItems.find(i => i.id === parseInt(formData.itemId))
        const startDate = new Date(formData.startDate)
        const endDate = new Date(formData.endDate)
        const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
        const totalCost = item.rate * duration

        let updatedRentals
        if (editingRental) {
            updatedRentals = rentals.map(r => r.id === editingRental.id ? { ...rentalData, totalCost } : r)
            toast.success('Rental updated')
        } else {
            updatedRentals = [...rentals, { ...rentalData, totalCost }]
            toast.success('Rental created')
        }

        localStorage.setItem('rentals', JSON.stringify(updatedRentals))
        setRentals(updatedRentals)
        setIsModalOpen(false)
        setEditingRental(null)
        resetFormData()
        loadData()
    }

    const handleDelete = () => {
        const updated = rentals.filter(r => r.id !== deleteConfirm.id)
        localStorage.setItem('rentals', JSON.stringify(updated))
        setRentals(updated)
        setDeleteConfirm(null)
        toast.success('Rental deleted')
        loadData()
    }

    const handleReturn = (rental) => {
        const updated = rentals.map(r =>
            r.id === rental.id
                ? { ...r, status: 'returned', returnedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
                : r
        )
        localStorage.setItem('rentals', JSON.stringify(updated))
        setRentals(updated)
        toast.success('Item returned successfully')
        loadData()
    }

    const resetFormData = () => {
        setFormData({
            itemId: '', customerId: '', startDate: '', endDate: '', status: 'reserved',
            deposit: 0, notes: ''
        })
    }

    const openModal = (rental = null) => {
        if (rental) {
            setEditingRental(rental)
            setFormData(rental)
        } else {
            resetFormData()
        }
        setIsModalOpen(true)
    }

    const columns = [
        {
            key: 'item',
            label: 'Item',
            render: (rental) => {
                const item = rentalItems.find(i => i.id === parseInt(rental.itemId))
                return (
                    <div>
                        <span className="font-medium">{item?.name || 'Unknown'}</span>
                        <span className="text-gray-400 text-xs ml-2">{item?.type}</span>
                    </div>
                )
            }
        },
        { key: 'customerId', label: 'Customer ID' },
        {
            key: 'duration',
            label: 'Duration',
            render: (rental) => {
                const startDate = new Date(rental.startDate)
                const endDate = new Date(rental.endDate)
                const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))
                return `${days} day(s)`
            }
        },
        {
            key: 'totalCost',
            label: 'Total Cost',
            render: (rental) => `$${rental.totalCost?.toFixed(2) || '0.00'}`
        },
        {
            key: 'status',
            label: 'Status',
            render: (rental) => (
                <span className={`px-2 py-1 rounded text-xs ${
                    rental.status === 'returned' ? 'bg-green-600' :
                    rental.status === 'rented' ? 'bg-blue-600' :
                    rental.status === 'overdue' ? 'bg-red-600' :
                    rental.status === 'cancelled' ? 'bg-gray-600' : 'bg-yellow-600'
                }`}>
                    {rental.status.toUpperCase()}
                </span>
            )
        },
        {
            key: 'startDate',
            label: 'Start Date',
            render: (rental) => new Date(rental.startDate).toLocaleDateString()
        }
    ]

    const filteredRentals = filterStatus
        ? rentals.filter(r => r.status === filterStatus)
        : rentals

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Rentals</h1>
                    <p className="text-gray-400 mt-1">Manage equipment and space rentals</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => openModal()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                    <Plus size={18} />
                    New Rental
                </motion.button>
            </div>

            <div className="bg-gray-800 rounded-lg p-4 mb-6 grid grid-cols-4 gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-600/20 rounded-lg">
                        <Calendar size={20} className="text-blue-400" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-400">Active Rentals</p>
                        <p className="text-2xl font-bold">{rentals.filter(r => r.status === 'rented').length}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-yellow-600/20 rounded-lg">
                        <Clock size={20} className="text-yellow-400" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-400">Reserved</p>
                        <p className="text-2xl font-bold">{rentals.filter(r => r.status === 'reserved').length}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-green-600/20 rounded-lg">
                        <CheckCircle size={20} className="text-green-400" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-400">Returned</p>
                        <p className="text-2xl font-bold">{rentals.filter(r => r.status === 'returned').length}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-red-600/20 rounded-lg">
                        <AlertTriangle size={20} className="text-red-400" />
                    </div>
                    <div>
                        <p className="text-sm text-gray-400">Overdue</p>
                        <p className="text-2xl font-bold">{rentals.filter(r => r.status === 'overdue').length}</p>
                    </div>
                </div>
            </div>

            <div className="mb-4 flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <Filter size={16} className="text-gray-400" />
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                    >
                        <option value="">All Statuses</option>
                        {statuses.map(s => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            <DataTable
                columns={columns}
                data={filteredRentals}
                actions={(rental) => (
                    <div className="flex gap-2">
                        {rental.status === 'rented' && (
                            <button onClick={() => handleReturn(rental)} className="p-2 hover:bg-green-600 rounded">
                                <CheckCircle size={16} />
                            </button>
                        )}
                        <button onClick={() => openModal(rental)} className="p-2 hover:bg-gray-700 rounded">
                            <Edit size={16} />
                        </button>
                        <button onClick={() => setDeleteConfirm(rental)} className="p-2 hover:bg-red-600 rounded">
                            <Trash2 size={16} />
                        </button>
                    </div>
                )}
            />

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingRental ? 'Edit Rental' : 'New Rental'}>
                <div className="space-y-4">
                    <FormSelect
                        label="Item"
                        value={formData.itemId}
                        onChange={(e) => setFormData({ ...formData, itemId: e.target.value })}
                        options={[
                            { value: '', label: 'Select an item' },
                            ...rentalItems.map(item => ({ value: String(item.id), label: `${item.name} - $${item.rate}/${item.unit}` }))
                        ]}
                    />
                    <FormInput
                        label="Customer ID"
                        value={formData.customerId}
                        onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                        placeholder="CUST-001"
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <FormInput
                            label="Start Date"
                            type="date"
                            value={formData.startDate}
                            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        />
                        <FormInput
                            label="End Date"
                            type="date"
                            value={formData.endDate}
                            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        />
                    </div>
                    <FormSelect
                        label="Status"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        options={statuses}
                    />
                    <FormInput
                        label="Deposit Amount"
                        type="number"
                        value={formData.deposit}
                        onChange={(e) => setFormData({ ...formData, deposit: parseFloat(e.target.value) || 0 })}
                    />
                    <FormTextarea
                        label="Notes"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Additional notes..."
                    />
                </div>
                <ModalFooter
                    onCancel={() => setIsModalOpen(false)}
                    onConfirm={handleSubmit}
                    confirmText={editingRental ? 'Update' : 'Create'}
                />
            </Modal>

            <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Confirm Delete">
                <p className="text-gray-300">
                    Are you sure you want to delete this rental?
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

export default Rentals
