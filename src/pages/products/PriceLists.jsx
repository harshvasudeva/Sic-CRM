import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit, Trash2, DollarSign, Layers } from 'lucide-react'
import DataTable from '../../components/DataTable'
import Modal, { ModalFooter } from '../../components/Modal'
import FormInput, { FormTextarea, FormSelect } from '../../components/FormInput'
import { useToast } from '../../components/Toast'

const priceListTypes = [
    { value: 'wholesale', label: 'Wholesale' },
    { value: 'retail', label: 'Retail' },
    { value: 'distributor', label: 'Distributor' },
    { value: 'special', label: 'Special Price' },
]

function PriceLists() {
    const toast = useToast()
    const [priceLists, setPriceLists] = useState([])
    const [items, setItems] = useState([])
    const [isListModalOpen, setIsListModalOpen] = useState(false)
    const [isItemModalOpen, setIsItemModalOpen] = useState(false)
    const [editingList, setEditingList] = useState(null)
    const [editingItem, setEditingItem] = useState(null)
    const [deleteConfirm, setDeleteConfirm] = useState(null)
    const [deleteType, setDeleteType] = useState(null)

    const [listFormData, setListFormData] = useState({
        name: '', type: 'wholesale', applicableFrom: '', description: ''
    })

    const [itemFormData, setItemFormData] = useState({
        listId: '', productId: '', price: 0, minQty: 1, effectiveFrom: '', notes: ''
    })

    const loadData = () => {
        const savedLists = localStorage.getItem('priceLists')
        const savedItems = localStorage.getItem('priceListItems')
        setPriceLists(savedLists ? JSON.parse(savedLists) : [])
        setItems(savedItems ? JSON.parse(savedItems) : [])
    }

    useEffect(() => { loadData() }, [])

    const handleListSubmit = () => {
        if (!listFormData.name) {
            toast.error('List name is required')
            return
        }

        const listData = {
            ...listFormData,
            id: editingList?.id || Date.now(),
            createdAt: editingList?.createdAt || new Date().toISOString()
        }

        let updatedLists
        if (editingList) {
            updatedLists = priceLists.map(l => l.id === editingList.id ? listData : l)
            toast.success('Price list updated')
        } else {
            updatedLists = [...priceLists, listData]
            toast.success('Price list created')
        }

        localStorage.setItem('priceLists', JSON.stringify(updatedLists))
        setPriceLists(updatedLists)
        setIsListModalOpen(false)
        setEditingList(null)
        resetListFormData()
        loadData()
    }

    const handleItemSubmit = () => {
        if (!itemFormData.listId || !itemFormData.productId || itemFormData.price <= 0) {
            toast.error('List, Product and Price are required')
            return
        }

        const itemData = {
            ...itemFormData,
            id: editingItem?.id || Date.now(),
            createdAt: editingItem?.createdAt || new Date().toISOString()
        }

        let updatedItems
        if (editingItem) {
            updatedItems = items.map(i => i.id === editingItem.id ? itemData : i)
            toast.success('Price item updated')
        } else {
            updatedItems = [...items, itemData]
            toast.success('Price item added')
        }

        localStorage.setItem('priceListItems', JSON.stringify(updatedItems))
        setItems(updatedItems)
        setIsItemModalOpen(false)
        setEditingItem(null)
        resetItemFormData()
        loadData()
    }

    const handleDelete = () => {
        if (deleteType === 'list') {
            const updated = priceLists.filter(l => l.id !== deleteConfirm.id)
            localStorage.setItem('priceLists', JSON.stringify(updated))
            setPriceLists(updated)
        } else {
            const updated = items.filter(i => i.id !== deleteConfirm.id)
            localStorage.setItem('priceListItems', JSON.stringify(updated))
            setItems(updated)
        }
        setDeleteConfirm(null)
        setDeleteType(null)
        toast.success('Deleted successfully')
        loadData()
    }

    const resetListFormData = () => {
        setListFormData({
            name: '', type: 'wholesale', applicableFrom: '', description: ''
        })
    }

    const resetItemFormData = () => {
        setItemFormData({
            listId: '', productId: '', price: 0, minQty: 1, effectiveFrom: '', notes: ''
        })
    }

    const openListModal = (list = null) => {
        if (list) {
            setEditingList(list)
            setListFormData(list)
        } else {
            resetListFormData()
        }
        setIsListModalOpen(true)
    }

    const openItemModal = (item = null) => {
        if (item) {
            setEditingItem(item)
            setItemFormData(item)
        } else {
            setItemFormData({ ...itemFormData, listId: itemFormData.listId })
        }
        setIsItemModalOpen(true)
    }

    const listColumns = [
        { key: 'name', label: 'List Name' },
        {
            key: 'type',
            label: 'Type',
            render: (v) => <span className="capitalize">{v}</span>
        },
        { key: 'applicableFrom', label: 'Effective From' },
        { key: 'itemCount', label: 'Items', render: (l) => items.filter(i => i.listId === l.id).length },
    ]

    const itemColumns = [
        { key: 'productId', label: 'Product ID' },
        {
            key: 'price',
            label: 'Price',
            render: (v) => `$${v?.toFixed(2) || '0.00'}`
        },
        { key: 'minQty', label: 'Min. Qty' },
        { key: 'effectiveFrom', label: 'Effective From' },
    ]

    const filteredItems = itemFormData.listId 
        ? items.filter(i => i.listId === itemFormData.listId)
        : items

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Multiple Price Lists</h1>
                    <p className="text-gray-400 mt-1">Manage different price levels for customers</p>
                </div>
                <div className="flex gap-2">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => openListModal()}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                        <Plus size={18} />
                        New List
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => openItemModal()}
                        disabled={!itemFormData.listId}
                        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                        <DollarSign size={18} />
                        Add Price
                    </motion.button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">Price Lists</h2>
                        <span className="text-gray-400 text-sm">{priceLists.length} lists</span>
                    </div>

                    <DataTable
                        columns={listColumns}
                        data={priceLists}
                        actions={(list) => (
                            <div className="flex gap-2">
                                <button onClick={() => openListModal(list)} className="p-2 hover:bg-gray-700 rounded">
                                    <Edit size={16} />
                                </button>
                                <button onClick={() => { setDeleteConfirm(list); setDeleteType('list') }} className="p-2 hover:bg-red-600 rounded">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        )}
                    />
                </div>

                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">
                            {priceLists.find(l => l.id === itemFormData.listId)?.name || 'Select a List'}
                        </h2>
                        <span className="text-gray-400 text-sm">{filteredItems.length} items</span>
                    </div>

                    <DataTable
                        columns={itemColumns}
                        data={filteredItems}
                        actions={(item) => (
                            <div className="flex gap-2">
                                <button onClick={() => openItemModal(item)} className="p-2 hover:bg-gray-700 rounded">
                                    <Edit size={16} />
                                </button>
                                <button onClick={() => { setDeleteConfirm(item); setDeleteType('item') }} className="p-2 hover:bg-red-600 rounded">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        )}
                    />
                </div>
            </div>

            <Modal isOpen={isListModalOpen} onClose={() => setIsListModalOpen(false)} title={editingList ? 'Edit Price List' : 'New Price List'}>
                <div className="space-y-4">
                    <FormInput
                        label="List Name *"
                        value={listFormData.name}
                        onChange={(e) => setListFormData({ ...listFormData, name: e.target.value })}
                        placeholder="Wholesale Price List"
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <FormSelect
                            label="List Type *"
                            value={listFormData.type}
                            onChange={(e) => setListFormData({ ...listFormData, type: e.target.value })}
                            options={priceListTypes}
                        />
                        <FormInput
                            label="Effective From"
                            value={listFormData.applicableFrom}
                            onChange={(e) => setListFormData({ ...listFormData, applicableFrom: e.target.value })}
                            placeholder="2026-01-01"
                        />
                    </div>
                    <FormTextarea
                        label="Description"
                        value={listFormData.description}
                        onChange={(e) => setListFormData({ ...listFormData, description: e.target.value })}
                        placeholder="List description..."
                        rows={3}
                    />
                </div>
                <ModalFooter
                    onCancel={() => setIsListModalOpen(false)}
                    onConfirm={handleListSubmit}
                    confirmText={editingList ? 'Update' : 'Create'}
                />
            </Modal>

            <Modal isOpen={isItemModalOpen} onClose={() => setIsItemModalOpen(false)} title={editingItem ? 'Edit Price' : 'New Price'}>
                <div className="space-y-4">
                    <FormSelect
                        label="Price List *"
                        value={itemFormData.listId}
                        onChange={(e) => setItemFormData({ ...itemFormData, listId: e.target.value })}
                        options={priceLists.map(l => ({ value: String(l.id), label: l.name }))}
                    />
                    <FormInput
                        label="Product ID *"
                        value={itemFormData.productId}
                        onChange={(e) => setItemFormData({ ...itemFormData, productId: e.target.value })}
                        placeholder="PRD-001"
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <FormInput
                            label="Price *"
                            type="number"
                            value={itemFormData.price}
                            onChange={(e) => setItemFormData({ ...itemFormData, price: parseFloat(e.target.value) || 0 })}
                            placeholder="0.00"
                            step="0.01"
                        />
                        <FormInput
                            label="Min. Quantity"
                            type="number"
                            value={itemFormData.minQty}
                            onChange={(e) => setItemFormData({ ...itemFormData, minQty: parseInt(e.target.value) || 1 })}
                            placeholder="1"
                            min="1"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <FormInput
                            label="Effective From"
                            value={itemFormData.effectiveFrom}
                            onChange={(e) => setItemFormData({ ...itemFormData, effectiveFrom: e.target.value })}
                            placeholder="2026-01-01"
                        />
                        <FormInput
                            label="Effective To"
                            placeholder="Until date..."
                        />
                    </div>
                    <FormTextarea
                        label="Notes"
                        value={itemFormData.notes}
                        onChange={(e) => setItemFormData({ ...itemFormData, notes: e.target.value })}
                        placeholder="Price notes..."
                        rows={3}
                    />
                </div>
                <ModalFooter
                    onCancel={() => setIsItemModalOpen(false)}
                    onConfirm={handleItemSubmit}
                    confirmText={editingItem ? 'Update' : 'Add'}
                />
            </Modal>

            <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Confirm Delete">
                <p className="text-gray-300">
                    Are you sure you want to delete this {deleteType === 'list' ? 'price list' : 'price item'}?
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

export default PriceLists
