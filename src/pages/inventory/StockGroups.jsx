import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit, Trash2, Package, Layers } from 'lucide-react'
import DataTable from '../../components/DataTable'
import Modal, { ModalFooter } from '../../components/Modal'
import FormInput, { FormTextarea, FormSelect } from '../../components/FormInput'
import { useToast } from '../../components/Toast'

const stockGroupTypes = [
    { value: 'raw', label: 'Raw Materials' },
    { value: 'finished', label: 'Finished Goods' },
    { value: 'consumable', label: 'Consumables' },
    { value: 'service', label: 'Services' },
    { value: 'spare', label: 'Spare Parts' },
]

function StockGroups() {
    const toast = useToast()
    const [groups, setGroups] = useState([])
    const [items, setItems] = useState([])
    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false)
    const [isItemModalOpen, setIsItemModalOpen] = useState(false)
    const [editingGroup, setEditingGroup] = useState(null)
    const [editingItem, setEditingItem] = useState(null)
    const [selectedGroup, setSelectedGroup] = useState(null)
    const [deleteConfirm, setDeleteConfirm] = useState(null)

    const [groupFormData, setGroupFormData] = useState({
        code: '', name: '', type: 'finished', parentId: '', description: ''
    })

    const [itemFormData, setItemFormData] = useState({
        groupId: '', code: '', name: '', type: 'item', baseUnit: '', 
        conversionFactor: 1, description: ''
    })

    const loadData = () => {
        const savedGroups = localStorage.getItem('stockGroups')
        const savedItems = localStorage.getItem('stockGroupItems')
        setGroups(savedGroups ? JSON.parse(savedGroups) : [])
        setItems(savedItems ? JSON.parse(savedItems) : [])
    }

    useEffect(() => { loadData() }, [])

    const handleGroupSubmit = () => {
        if (!groupFormData.code || !groupFormData.name) {
            toast.error('Code and Name are required')
            return
        }

        const groupData = {
            ...groupFormData,
            id: editingGroup?.id || Date.now(),
            createdAt: editingGroup?.createdAt || new Date().toISOString()
        }

        let updatedGroups
        if (editingGroup) {
            updatedGroups = groups.map(g => g.id === editingGroup.id ? groupData : g)
            toast.success('Stock group updated')
        } else {
            updatedGroups = [...groups, groupData]
            toast.success('Stock group created')
        }

        localStorage.setItem('stockGroups', JSON.stringify(updatedGroups))
        setGroups(updatedGroups)
        setIsGroupModalOpen(false)
        setEditingGroup(null)
        resetGroupFormData()
        loadData()
    }

    const handleItemSubmit = () => {
        if (!itemFormData.code || !itemFormData.name || !itemFormData.groupId) {
            toast.error('Code, Name and Group are required')
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
            toast.success('Stock item updated')
        } else {
            updatedItems = [...items, itemData]
            toast.success('Stock item created')
        }

        localStorage.setItem('stockGroupItems', JSON.stringify(updatedItems))
        setItems(updatedItems)
        setIsItemModalOpen(false)
        setEditingItem(null)
        resetItemFormData()
        loadData()
    }

    const handleDelete = (type, id) => {
        if (type === 'group') {
            const updated = groups.filter(g => g.id !== id)
            localStorage.setItem('stockGroups', JSON.stringify(updated))
            setGroups(updated)
        } else {
            const updated = items.filter(i => i.id !== id)
            localStorage.setItem('stockGroupItems', JSON.stringify(updated))
            setItems(updated)
        }
        setDeleteConfirm(null)
        toast.success('Deleted successfully')
        loadData()
    }

    const resetGroupFormData = () => {
        setGroupFormData({
            code: '', name: '', type: 'finished', parentId: '', description: ''
        })
    }

    const resetItemFormData = () => {
        setItemFormData({
            groupId: '', code: '', name: '', type: 'item', baseUnit: '', 
            conversionFactor: 1, description: ''
        })
    }

    const groupColumns = [
        { key: 'code', label: 'Code' },
        { key: 'name', label: 'Name' },
        {
            key: 'type',
            label: 'Type',
            render: (g) => <span className="capitalize">{g.type}</span>
        },
        { key: 'description', label: 'Description' },
        {
            key: 'itemCount',
            label: 'Items',
            render: (g) => items.filter(i => i.groupId === g.id).length
        }
    ]

    const itemColumns = [
        { key: 'code', label: 'Code' },
        { key: 'name', label: 'Name' },
        {
            key: 'groupId',
            label: 'Group',
            render: (i) => groups.find(g => g.id === i.groupId)?.name || '-'
        },
        { key: 'baseUnit', label: 'Base Unit' },
        {
            key: 'conversionFactor',
            label: 'Conversion',
            render: (v) => `1 : ${v || 1}`
        }
    ]

    const filteredItems = selectedGroup 
        ? items.filter(i => i.groupId === selectedGroup.id)
        : items

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Stock Groups</h1>
                    <p className="text-gray-400 mt-1">Organize inventory items by groups and categories</p>
                </div>
                <div className="flex gap-2">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                            resetGroupFormData()
                            setIsGroupModalOpen(true)
                            setEditingGroup(null)
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                        <Plus size={18} />
                        New Group
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                            resetItemFormData()
                            setIsItemModalOpen(true)
                            setEditingItem(null)
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                        <Plus size={18} />
                        New Item
                    </motion.button>
                </div>
            </div>

            <div className="mb-6">
                <div className="flex items-center gap-4 mb-4">
                    <h2 className="text-lg font-semibold">Groups</h2>
                    <select
                        value={selectedGroup?.id || ''}
                        onChange={(e) => setSelectedGroup(e.target.value ? groups.find(g => g.id === e.target.value) : null)}
                        className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    >
                        <option value="">All Groups</option>
                        {groups.map(g => (
                            <option key={g.id} value={g.id}>{g.name}</option>
                        ))}
                    </select>
                </div>

                <DataTable
                    columns={groupColumns}
                    data={selectedGroup ? [selectedGroup] : groups}
                    actions={(group) => (
                        <div className="flex gap-2">
                            <button onClick={() => {
                                setEditingGroup(group)
                                setGroupFormData(group)
                                setIsGroupModalOpen(true)
                            }} className="p-2 hover:bg-gray-700 rounded">
                                <Edit size={16} />
                            </button>
                            <button onClick={() => setDeleteConfirm({ type: 'group', id: group.id })} className="p-2 hover:bg-red-600 rounded">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    )}
                />
            </div>

            {selectedGroup && (
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold">
                            <span className="text-blue-400">{selectedGroup.name}</span> - Items
                        </h2>
                        <button onClick={() => setSelectedGroup(null)} className="text-gray-400 hover:text-white">
                            <Trash2 size={20} />
                        </button>
                    </div>

                    <DataTable
                        columns={itemColumns}
                        data={filteredItems}
                        actions={(item) => (
                            <div className="flex gap-2">
                                <button onClick={() => {
                                    setEditingItem(item)
                                    setItemFormData(item)
                                    setIsItemModalOpen(true)
                                }} className="p-2 hover:bg-gray-700 rounded">
                                    <Edit size={16} />
                                </button>
                                <button onClick={() => setDeleteConfirm({ type: 'item', id: item.id })} className="p-2 hover:bg-red-600 rounded">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        )}
                    />
                </div>
            )}

            <Modal isOpen={isGroupModalOpen} onClose={() => setIsGroupModalOpen(false)} title={editingGroup ? 'Edit Group' : 'New Group'}>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <FormInput
                            label="Group Code *"
                            value={groupFormData.code}
                            onChange={(e) => setGroupFormData({ ...groupFormData, code: e.target.value })}
                            placeholder="SG-001"
                        />
                        <FormInput
                            label="Group Name *"
                            value={groupFormData.name}
                            onChange={(e) => setGroupFormData({ ...groupFormData, name: e.target.value })}
                            placeholder="Primary Group"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <FormSelect
                            label="Group Type *"
                            value={groupFormData.type}
                            onChange={(e) => setGroupFormData({ ...groupFormData, type: e.target.value })}
                            options={stockGroupTypes}
                        />
                        <FormInput
                            label="Parent Group"
                            value={groupFormData.parentId}
                            onChange={(e) => setGroupFormData({ ...groupFormData, parentId: e.target.value })}
                            placeholder="Select parent group"
                        />
                    </div>
                    <FormTextarea
                        label="Description"
                        value={groupFormData.description}
                        onChange={(e) => setGroupFormData({ ...groupFormData, description: e.target.value })}
                        placeholder="Group description..."
                        rows={3}
                    />
                </div>
                <ModalFooter
                    onCancel={() => setIsGroupModalOpen(false)}
                    onConfirm={handleGroupSubmit}
                    confirmText={editingGroup ? 'Update' : 'Create'}
                />
            </Modal>

            <Modal isOpen={isItemModalOpen} onClose={() => setIsItemModalOpen(false)} title={editingItem ? 'Edit Item' : 'New Item'}>
                <div className="space-y-4">
                    <FormSelect
                        label="Group *"
                        value={itemFormData.groupId}
                        onChange={(e) => setItemFormData({ ...itemFormData, groupId: e.target.value })}
                        options={groups.map(g => ({ value: g.id, label: g.name }))}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <FormInput
                            label="Item Code *"
                            value={itemFormData.code}
                            onChange={(e) => setItemFormData({ ...itemFormData, code: e.target.value })}
                            placeholder="ITEM-001"
                        />
                        <FormInput
                            label="Item Name *"
                            value={itemFormData.name}
                            onChange={(e) => setItemFormData({ ...itemFormData, name: e.target.value })}
                            placeholder="Item name"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <FormInput
                            label="Base Unit *"
                            value={itemFormData.baseUnit}
                            onChange={(e) => setItemFormData({ ...itemFormData, baseUnit: e.target.value })}
                            placeholder="Nos, Kg, etc."
                        />
                        <FormInput
                            label="Conversion Factor"
                            type="number"
                            value={itemFormData.conversionFactor}
                            onChange={(e) => setItemFormData({ ...itemFormData, conversionFactor: parseFloat(e.target.value) || 1 })}
                            placeholder="1"
                        />
                    </div>
                    <FormTextarea
                        label="Description"
                        value={itemFormData.description}
                        onChange={(e) => setItemFormData({ ...itemFormData, description: e.target.value })}
                        placeholder="Item description..."
                        rows={3}
                    />
                </div>
                <ModalFooter
                    onCancel={() => setIsItemModalOpen(false)}
                    onConfirm={handleItemSubmit}
                    confirmText={editingItem ? 'Update' : 'Create'}
                />
            </Modal>

            <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Confirm Delete">
                <p className="text-gray-300">
                    Are you sure you want to delete this {deleteConfirm?.type}?
                </p>
                <ModalFooter
                    onCancel={() => setDeleteConfirm(null)}
                    onConfirm={() => handleDelete(deleteConfirm.type, deleteConfirm.id)}
                    confirmText="Delete"
                    confirmClass="bg-red-600 hover:bg-red-700"
                />
            </Modal>
        </div>
    )
}

export default StockGroups
