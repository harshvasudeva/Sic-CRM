import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Filter, Edit, Trash2, Play, Pause, CheckCircle, Clock, FileText } from 'lucide-react'
import DataTable from '../../components/DataTable'
import Modal, { ModalFooter } from '../../components/Modal'
import FormInput, { FormTextarea, FormSelect } from '../../components/FormInput'
import { useToast } from '../../components/Toast'

const statuses = [
    { value: 'draft', label: 'Draft' },
    { value: 'planned', label: 'Planned' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'paused', label: 'Paused' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
]

const priorities = [
    { value: 'low', label: 'Low' },
    { value: 'normal', label: 'Normal' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
]

function ProductionOrders() {
    const toast = useToast()
    const [orders, setOrders] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingOrder, setEditingOrder] = useState(null)
    const [deleteConfirm, setDeleteConfirm] = useState(null)
    const [actionModal, setActionModal] = useState(null)

    const [formData, setFormData] = useState({
        orderNumber: '', productId: '', quantity: 0, bomId: '', workCenterId: '',
        priority: 'normal', status: 'draft', plannedStart: '', plannedEnd: '',
        actualStart: '', actualEnd: '', notes: ''
    })

    const loadData = () => {
        const saved = localStorage.getItem('productionOrders')
        setOrders(saved ? JSON.parse(saved) : [])
    }

    useEffect(() => { loadData() }, [])

    const handleSubmit = () => {
        if (!formData.orderNumber || !formData.productId || formData.quantity <= 0) {
            toast.error('Order number, product and quantity are required')
            return
        }

        const orderData = {
            ...formData,
            id: editingOrder?.id || Date.now(),
            createdAt: editingOrder?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }

        let updatedOrders
        if (editingOrder) {
            updatedOrders = orders.map(o => o.id === editingOrder.id ? orderData : o)
            toast.success('Production order updated')
        } else {
            updatedOrders = [...orders, orderData]
            toast.success('Production order created')
        }

        localStorage.setItem('productionOrders', JSON.stringify(updatedOrders))
        setOrders(updatedOrders)
        setIsModalOpen(false)
        setEditingOrder(null)
        resetFormData()
        loadData()
    }

    const handleDelete = () => {
        const updated = orders.filter(o => o.id !== deleteConfirm.id)
        localStorage.setItem('productionOrders', JSON.stringify(updated))
        setOrders(updated)
        setDeleteConfirm(null)
        toast.success('Production order deleted')
        loadData()
    }

    const handleStatusChange = (order, newStatus) => {
        const updated = orders.map(o => 
            o.id === order.id 
                ? { 
                    ...o, 
                    status: newStatus,
                    actualStart: (newStatus === 'in_progress' && !o.actualStart) ? new Date().toISOString() : o.actualStart,
                    actualEnd: (newStatus === 'completed' && !o.actualEnd) ? new Date().toISOString() : o.actualEnd,
                    updatedAt: new Date().toISOString()
                }
                : o
        )
        localStorage.setItem('productionOrders', JSON.stringify(updated))
        setOrders(updated)
        setActionModal(null)
        toast.success(`Order ${newStatus}`)
        loadData()
    }

    const resetFormData = () => {
        setFormData({
            orderNumber: `PO-${Date.now().toString().slice(-6)}`, productId: '', quantity: 0, bomId: '', workCenterId: '',
            priority: 'normal', status: 'draft', plannedStart: '', plannedEnd: '',
            actualStart: '', actualEnd: '', notes: ''
        })
    }

    const openModal = (order = null) => {
        if (order) {
            setEditingOrder(order)
            setFormData(order)
        } else {
            resetFormData()
        }
        setIsModalOpen(true)
    }

    const columns = [
        { key: 'orderNumber', label: 'Order No.' },
        { key: 'productId', label: 'Product ID' },
        {
            key: 'quantity',
            label: 'Quantity',
            render: (order) => `${order.quantity} units`
        },
        {
            key: 'priority',
            label: 'Priority',
            render: (order) => (
                <span className={`px-2 py-1 rounded text-xs ${
                    order.priority === 'urgent' ? 'bg-red-600' :
                    order.priority === 'high' ? 'bg-orange-600' :
                    order.priority === 'low' ? 'bg-gray-600' : 'bg-blue-600'
                }`}>
                    {order.priority.toUpperCase()}
                </span>
            )
        },
        {
            key: 'status',
            label: 'Status',
            render: (order) => (
                <span className={`px-2 py-1 rounded text-xs ${
                    order.status === 'completed' ? 'bg-green-600' :
                    order.status === 'in_progress' ? 'bg-blue-600' :
                    order.status === 'planned' ? 'bg-purple-600' :
                    order.status === 'cancelled' ? 'bg-red-600' :
                    'bg-gray-600'
                }`}>
                    {order.status.replace('_', ' ').toUpperCase()}
                </span>
            )
        },
        {
            key: 'plannedStart',
            label: 'Start Date',
            render: (order) => order.plannedStart ? new Date(order.plannedStart).toLocaleDateString() : '-'
        }
    ]

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Production Orders</h1>
                    <p className="text-gray-400 mt-1">Manage manufacturing production orders</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => openModal()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                    <Plus size={18} />
                    New Order
                </motion.button>
            </div>

            <DataTable
                columns={columns}
                data={orders}
                actions={(order) => (
                    <div className="flex gap-2">
                        {order.status === 'planned' && (
                            <button onClick={() => setActionModal({ order, action: 'start' })} className="p-2 hover:bg-green-600 rounded">
                                <Play size={16} />
                            </button>
                        )}
                        {order.status === 'in_progress' && (
                            <button onClick={() => setActionModal({ order, action: 'complete' })} className="p-2 hover:bg-blue-600 rounded">
                                <CheckCircle size={16} />
                            </button>
                        )}
                        <button onClick={() => openModal(order)} className="p-2 hover:bg-gray-700 rounded">
                            <Edit size={16} />
                        </button>
                        <button onClick={() => setDeleteConfirm(order)} className="p-2 hover:bg-red-600 rounded">
                            <Trash2 size={16} />
                        </button>
                    </div>
                )}
            />

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingOrder ? 'Edit Production Order' : 'New Production Order'}>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <FormInput
                            label="Order Number"
                            value={formData.orderNumber}
                            onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                            placeholder="PO-123456"
                        />
                        <FormInput
                            label="Product ID"
                            value={formData.productId}
                            onChange={(e) => setFormData({ ...formData, productId: e.target.value })}
                            placeholder="PRD-001"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <FormInput
                            label="Quantity"
                            type="number"
                            value={formData.quantity}
                            onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                        />
                        <FormInput
                            label="BOM ID"
                            value={formData.bomId}
                            onChange={(e) => setFormData({ ...formData, bomId: e.target.value })}
                            placeholder="BOM-001"
                        />
                    </div>
                    <FormInput
                        label="Work Center ID"
                        value={formData.workCenterId}
                        onChange={(e) => setFormData({ ...formData, workCenterId: e.target.value })}
                        placeholder="WC-001"
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <FormSelect
                            label="Priority"
                            value={formData.priority}
                            onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                            options={priorities}
                        />
                        <FormSelect
                            label="Status"
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            options={statuses}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <FormInput
                            label="Planned Start"
                            type="date"
                            value={formData.plannedStart}
                            onChange={(e) => setFormData({ ...formData, plannedStart: e.target.value })}
                        />
                        <FormInput
                            label="Planned End"
                            type="date"
                            value={formData.plannedEnd}
                            onChange={(e) => setFormData({ ...formData, plannedEnd: e.target.value })}
                        />
                    </div>
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
                    confirmText={editingOrder ? 'Update' : 'Create'}
                />
            </Modal>

            <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Confirm Delete">
                <p className="text-gray-300">
                    Are you sure you want to delete production order "<strong>{deleteConfirm?.orderNumber}</strong>"?
                </p>
                <ModalFooter
                    onCancel={() => setDeleteConfirm(null)}
                    onConfirm={handleDelete}
                    confirmText="Delete"
                    confirmClass="bg-red-600 hover:bg-red-700"
                />
            </Modal>

            <Modal isOpen={!!actionModal} onClose={() => setActionModal(null)} title="Confirm Action">
                {actionModal?.action === 'start' ? (
                    <>
                        <p className="text-gray-300 mb-4">
                            Are you sure you want to start production for order "<strong>{actionModal.order?.orderNumber}</strong>"?
                        </p>
                        <p className="text-sm text-gray-400">This will mark the order as "In Progress" and record the start time.</p>
                    </>
                ) : (
                    <>
                        <p className="text-gray-300 mb-4">
                            Are you sure you want to complete production for order "<strong>{actionModal.order?.orderNumber}</strong>"?
                        </p>
                        <p className="text-sm text-gray-400">This will mark the order as "Completed" and record the end time.</p>
                    </>
                )}
                <ModalFooter
                    onCancel={() => setActionModal(null)}
                    onConfirm={() => handleStatusChange(actionModal.order, actionModal.action === 'start' ? 'in_progress' : 'completed')}
                    confirmText="Confirm"
                />
            </Modal>
        </div>
    )
}

export default ProductionOrders
