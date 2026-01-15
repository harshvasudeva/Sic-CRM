import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Filter, Edit, Trash2, Package, FileText, Search, MoreVertical } from 'lucide-react'
import DataTable from '../../components/DataTable'
import Modal, { ModalFooter } from '../../components/Modal'
import FormInput, { FormTextarea, FormSelect } from '../../components/FormInput'
import { useToast } from '../../components/Toast'

const statuses = [
    { value: 'draft', label: 'Draft' },
    { value: 'active', label: 'Active' },
    { value: 'archived', label: 'Archived' }
]

const bomTypes = [
    { value: 'manufactured', label: 'Manufactured' },
    { value: 'assembled', label: 'Assembled' },
    { value: 'kit', label: 'Kit' }
]

function BillOfMaterials() {
    const toast = useToast()
    const [boms, setBoms] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingBom, setEditingBom] = useState(null)
    const [deleteConfirm, setDeleteConfirm] = useState(null)
    const [viewModal, setViewModal] = useState(null)

    const [formData, setFormData] = useState({
        code: '', name: '', productId: '', type: 'manufactured', status: 'draft', 
        notes: '', items: []
    })

    const [itemData, setItemData] = useState({
        productId: '', quantity: 1, scrapFactor: 0, operation: ''
    })

    const loadData = () => {
        const saved = localStorage.getItem('boms')
        setBoms(saved ? JSON.parse(saved) : [])
    }

    useEffect(() => { loadData() }, [])

    const handleSubmit = () => {
        if (!formData.code || !formData.name) {
            toast.error('Code and Name are required')
            return
        }
        if (formData.items.length === 0) {
            toast.error('At least one item is required')
            return
        }

        const bomData = {
            ...formData,
            id: editingBom?.id || Date.now(),
            createdAt: editingBom?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }

        let updatedBoms
        if (editingBom) {
            updatedBoms = boms.map(b => b.id === editingBom.id ? bomData : b)
            toast.success('BOM updated')
        } else {
            updatedBoms = [...boms, bomData]
            toast.success('BOM created')
        }

        localStorage.setItem('boms', JSON.stringify(updatedBoms))
        setBoms(updatedBoms)
        setIsModalOpen(false)
        setEditingBom(null)
        resetFormData()
        loadData()
    }

    const handleDelete = () => {
        const updated = boms.filter(b => b.id !== deleteConfirm.id)
        localStorage.setItem('boms', JSON.stringify(updated))
        setBoms(updated)
        setDeleteConfirm(null)
        toast.success('BOM deleted')
        loadData()
    }

    const handleAddItem = () => {
        if (!itemData.productId) {
            toast.error('Product is required')
            return
        }
        setFormData({
            ...formData,
            items: [...formData.items, { ...itemData, id: Date.now() }]
        })
        setItemData({ productId: '', quantity: 1, scrapFactor: 0, operation: '' })
    }

    const handleRemoveItem = (itemId) => {
        setFormData({
            ...formData,
            items: formData.items.filter(i => i.id !== itemId)
        })
    }

    const resetFormData = () => {
        setFormData({
            code: '', name: '', productId: '', type: 'manufactured', status: 'draft',
            notes: '', items: []
        })
    }

    const openModal = (bom = null) => {
        if (bom) {
            setEditingBom(bom)
            setFormData(bom)
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
            key: 'items',
            label: 'Items',
            render: (bom) => `${bom.items?.length || 0} components`
        },
        { key: 'status', label: 'Status' },
        {
            key: 'createdAt',
            label: 'Created',
            render: (bom) => new Date(bom.createdAt).toLocaleDateString()
        }
    ]

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Bill of Materials</h1>
                    <p className="text-gray-400 mt-1">Manage product BOMs and component lists</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => openModal()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                    <Plus size={18} />
                    New BOM
                </motion.button>
            </div>

            <DataTable
                columns={columns}
                data={boms}
                actions={(bom) => (
                    <div className="flex gap-2">
                        <button onClick={() => openModal(bom)} className="p-2 hover:bg-gray-700 rounded">
                            <Edit size={16} />
                        </button>
                        <button onClick={() => setViewModal(bom)} className="p-2 hover:bg-gray-700 rounded">
                            <FileText size={16} />
                        </button>
                        <button onClick={() => setDeleteConfirm(bom)} className="p-2 hover:bg-red-600 rounded">
                            <Trash2 size={16} />
                        </button>
                    </div>
                )}
            />

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingBom ? 'Edit BOM' : 'New BOM'}>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <FormInput
                            label="BOM Code"
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                            placeholder="BOM-001"
                        />
                        <FormInput
                            label="Product Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Final Product"
                        />
                    </div>
                    <FormSelect
                        label="BOM Type"
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        options={bomTypes}
                    />
                    <FormSelect
                        label="Status"
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        options={statuses}
                    />
                    <FormTextarea
                        label="Notes"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Additional notes..."
                    />

                    <div className="border border-gray-700 rounded-lg p-4 mt-4">
                        <h3 className="font-semibold mb-3">Components</h3>
                        <div className="space-y-2 mb-4">
                            {formData.items.map((item, idx) => (
                                <div key={item.id} className="flex items-center gap-2 bg-gray-800 p-2 rounded">
                                    <span className="flex-1">Product ID: {item.productId}</span>
                                    <span>Qty: {item.quantity}</span>
                                    {item.scrapFactor > 0 && <span>Scrap: {item.scrapFactor}%</span>}
                                    {item.operation && <span className="text-gray-400">{item.operation}</span>}
                                    <button onClick={() => handleRemoveItem(item.id)} className="text-red-400 hover:text-red-300">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                            <FormInput
                                label="Product ID"
                                value={itemData.productId}
                                onChange={(e) => setItemData({ ...itemData, productId: e.target.value })}
                            />
                            <FormInput
                                label="Quantity"
                                type="number"
                                value={itemData.quantity}
                                onChange={(e) => setItemData({ ...itemData, quantity: parseInt(e.target.value) || 0 })}
                            />
                            <FormInput
                                label="Scrap %"
                                type="number"
                                value={itemData.scrapFactor}
                                onChange={(e) => setItemData({ ...itemData, scrapFactor: parseInt(e.target.value) || 0 })}
                            />
                            <FormInput
                                label="Operation"
                                value={itemData.operation}
                                onChange={(e) => setItemData({ ...itemData, operation: e.target.value })}
                            />
                        </div>
                        <button onClick={handleAddItem} className="mt-2 w-full bg-gray-700 hover:bg-gray-600 py-2 rounded">
                            + Add Component
                        </button>
                    </div>
                </div>
                <ModalFooter
                    onCancel={() => setIsModalOpen(false)}
                    onConfirm={handleSubmit}
                    confirmText={editingBom ? 'Update' : 'Create'}
                />
            </Modal>

            <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Confirm Delete">
                <p className="text-gray-300">
                    Are you sure you want to delete BOM "<strong>{deleteConfirm?.code}</strong>"?
                </p>
                <ModalFooter
                    onCancel={() => setDeleteConfirm(null)}
                    onConfirm={handleDelete}
                    confirmText="Delete"
                    confirmClass="bg-red-600 hover:bg-red-700"
                />
            </Modal>

            <Modal isOpen={!!viewModal} onClose={() => setViewModal(null)} title="BOM Details">
                {viewModal && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-gray-400 text-sm">Code</label>
                                <p className="font-semibold">{viewModal.code}</p>
                            </div>
                            <div>
                                <label className="text-gray-400 text-sm">Type</label>
                                <p className="font-semibold capitalize">{viewModal.type}</p>
                            </div>
                            <div className="col-span-2">
                                <label className="text-gray-400 text-sm">Name</label>
                                <p className="font-semibold">{viewModal.name}</p>
                            </div>
                        </div>
                        {viewModal.notes && (
                            <div>
                                <label className="text-gray-400 text-sm">Notes</label>
                                <p className="text-gray-300">{viewModal.notes}</p>
                            </div>
                        )}
                        <div>
                            <label className="text-gray-400 text-sm font-semibold">Components ({viewModal.items?.length || 0})</label>
                            <div className="mt-2 space-y-2">
                                {viewModal.items?.map((item) => (
                                    <div key={item.id} className="bg-gray-800 p-3 rounded flex justify-between items-center">
                                        <span>Product ID: {item.productId}</span>
                                        <div className="flex gap-4 text-sm text-gray-400">
                                            <span>Qty: {item.quantity}</span>
                                            {item.scrapFactor > 0 && <span>Scrap: {item.scrapFactor}%</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    )
}

export default BillOfMaterials
