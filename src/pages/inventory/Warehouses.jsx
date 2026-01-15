import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import DataTable from '../../components/DataTable'
import Modal, { ModalFooter } from '../../components/Modal'
import FormInput, { FormTextarea } from '../../components/FormInput'
import { useToast } from '../../components/Toast'
import { getWarehouses, createWarehouse, updateWarehouse, deleteWarehouse, getInventoryProducts } from '../../stores/inventoryStore'

function Warehouses() {
    const toast = useToast()
    const [warehouses, setWarehouses] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editItem, setEditItem] = useState(null)
    const [formData, setFormData] = useState({
        name: '', location: '', manager: '', capacity: 0, type: 'main', isActive: true, notes: ''
    })

    useEffect(() => {
        loadData()
    }, [])

    const loadData = () => {
        setWarehouses(getWarehouses())
    }

    const handleAdd = () => {
        setFormData({
            name: '',
            location: '',
            manager: '',
            capacity: 0,
            type: 'main',
            isActive: true,
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
            updateWarehouse(editItem.id, formData)
            toast.success('Warehouse updated')
        } else {
            createWarehouse(formData)
            toast.success('Warehouse added')
        }
        setIsModalOpen(false)
        setEditItem(null)
        loadData()
    }

    const handleDelete = (id) => {
        if (confirm('Are you sure? This will affect inventory records.')) {
            deleteWarehouse(id)
            toast.success('Warehouse deleted')
            loadData()
        }
    }

    const getWarehouseProductCount = (warehouseId) => {
        return getInventoryProducts().filter(p => p.warehouseId === warehouseId).length
    }

    const columns = [
        { key: 'name', label: 'Name', render: (v) => <span className="warehouse-name">{v}</span> },
        { key: 'location', label: 'Location', render: (v) => <span>{v}</span> },
        { key: 'manager', label: 'Manager', render: (v) => <span>{v || '-'}</span> },
        { key: 'type', label: 'Type', render: (v) => <span className="type-badge">{v}</span> },
        { key: 'capacity', label: 'Capacity', render: (v) => <span className="capacity">{v.toLocaleString()} units</span> },
        { key: 'products', label: 'Products', render: (_, row) => <span className="product-count">{getWarehouseProductCount(row.id)}</span> },
        { key: 'isActive', label: 'Status', render: (v) => (
            <span className={`status-badge ${v ? 'active' : 'inactive'}`}>{v ? 'Active' : 'Inactive'}</span>
        )},
        { key: 'actions', label: 'Actions', render: (_, row) => (
            <div className="action-buttons">
                <button className="btn-edit" onClick={() => handleEdit(row)}>Edit</button>
                <button className="btn-delete" onClick={() => handleDelete(row.id)}>Delete</button>
            </div>
        )}
    ]

    return (
        <div className="page">
            <motion.div className="page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <div>
                    <h1 className="page-title"><span className="gradient-text">Warehouse</span> Management</h1>
                    <p className="page-description">
                        Manage warehouse locations and capacity.
                    </p>
                </div>
                <button className="btn-primary" onClick={handleAdd}>
                    <Plus size={20} /> Add Warehouse
                </button>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <DataTable columns={columns} data={warehouses} searchable exportable />
            </motion.div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editItem ? 'Edit Warehouse' : 'Add Warehouse'} size="medium">
                <div className="form-grid">
                    <FormInput label="Warehouse Name *" placeholder="Main Warehouse" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    <FormInput label="Location *" placeholder="123 Business Ave" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} />
                </div>
                <div className="form-grid">
                    <FormInput label="Manager" placeholder="John Doe" value={formData.manager} onChange={(e) => setFormData({ ...formData, manager: e.target.value })} />
                    <FormInput label="Capacity *" type="number" placeholder="10000" value={formData.capacity} onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 0 })} />
                </div>
                <div className="form-grid">
                    <FormInput label="Type" readOnly value={formData.type} />
                    <FormInput label="Status" readOnly value={formData.isActive ? 'Active' : 'Inactive'} />
                </div>
                <FormTextarea label="Notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={2} placeholder="Additional notes about this warehouse..." />
                <ModalFooter>
                    <button className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                    <button className="btn-primary" onClick={handleSave}>{editItem ? 'Update' : 'Add'} Warehouse</button>
                </ModalFooter>
            </Modal>

            <style>{`
                .btn-primary { display: flex; align-items: center; gap: 8px; padding: 12px 20px; background: var(--accent-gradient); border-radius: var(--radius-md); color: white; border: none; cursor: pointer; font-weight: 600; }
                .btn-secondary { padding: 12px 20px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-secondary); cursor: pointer; }
                .warehouse-name { font-weight: 600; color: var(--text-primary); }
                .type-badge { padding: 4px 10px; background: rgba(99, 102, 241, 0.15); color: #8b5cf6; border-radius: 12px; font-size: 0.75rem; text-transform: capitalize; }
                .capacity { font-weight: 600; color: var(--text-secondary); }
                .product-count { font-weight: 700; color: var(--accent-primary); }
                .status-badge { padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; }
                .status-badge.active { background: rgba(34, 197, 94, 0.15); color: #22c55e; }
                .status-badge.inactive { background: rgba(156, 163, 175, 0.15); color: #9ca3af; }
                .action-buttons { display: flex; gap: 8px; }
                .btn-edit { padding: 8px 12px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-secondary); cursor: pointer; font-size: 0.85rem; }
                .btn-delete { padding: 8px 12px; background: rgba(239, 68, 68, 0.1); border: 1px solid var(--error); border-radius: 8px; color: var(--error); cursor: pointer; font-size: 0.85rem; }
                .btn-delete:hover { background: var(--error); color: white; }
            `}</style>
        </div>
    )
}

export default Warehouses