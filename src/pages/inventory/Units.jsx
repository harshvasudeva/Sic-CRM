import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit, Trash2, Calculator } from 'lucide-react'
import DataTable from '../../components/DataTable'
import Modal, { ModalFooter } from '../../components/Modal'
import FormInput, { FormTextarea, FormSelect } from '../../components/FormInput'
import { useToast } from '../../components/Toast'

const baseUnits = [
    { id: 'nos', name: 'Nos', symbol: 'Nos' },
    { id: 'pcs', name: 'Pcs', symbol: 'Pcs' },
    { id: 'kg', name: 'Kilogram', symbol: 'Kg' },
    { id: 'g', name: 'Gram', symbol: 'Gm' },
    { id: 'mtr', name: 'Meter', symbol: 'Mtr' },
    { id: 'cm', name: 'Centimeter', symbol: 'Cm' },
    { id: 'ltr', name: 'Litre', symbol: 'Ltr' },
    { id: 'ml', name: 'Mililitre', symbol: 'Ml' },
    { id: 'sqft', name: 'Sq. Feet', symbol: 'Sq.ft' },
    { id: 'sqmtr', name: 'Sq. Meter', symbol: 'Sq.mtr' },
    { id: 'box', name: 'Box', symbol: 'Box' },
    { id: 'pack', name: 'Pack', symbol: 'Pack' },
]

function Units() {
    const toast = useToast()
    const [units, setUnits] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingUnit, setEditingUnit] = useState(null)
    const [deleteConfirm, setDeleteConfirm] = useState(null)

    const [formData, setFormData] = useState({
        code: '', name: '', symbol: '', baseUnitId: '',
        conversionFactor: 1, description: ''
    })

    const loadData = () => {
        const saved = localStorage.getItem('units')
        setUnits(saved ? JSON.parse(saved) : baseUnits)
    }

    useEffect(() => { loadData() }, [])

    const handleSubmit = () => {
        if (!formData.code || !formData.name || !formData.symbol) {
            toast.error('Code, Name and Symbol are required')
            return
        }

        const unitData = {
            ...formData,
            id: editingUnit?.id || Date.now(),
            createdAt: editingUnit?.createdAt || new Date().toISOString()
        }

        let updatedUnits
        if (editingUnit) {
            updatedUnits = units.map(u => u.id === editingUnit.id ? unitData : u)
            toast.success('Unit updated')
        } else {
            updatedUnits = [...units, unitData]
            toast.success('Unit added')
        }

        localStorage.setItem('units', JSON.stringify(updatedUnits))
        setUnits(updatedUnits)
        setIsModalOpen(false)
        setEditingUnit(null)
        resetFormData()
        loadData()
    }

    const handleDelete = () => {
        const updated = units.filter(u => u.id !== deleteConfirm.id)
        localStorage.setItem('units', JSON.stringify(updated))
        setUnits(updated)
        setDeleteConfirm(null)
        toast.success('Unit deleted')
        loadData()
    }

    const resetFormData = () => {
        setFormData({
            code: '', name: '', symbol: '', baseUnitId: '',
            conversionFactor: 1, description: ''
        })
    }

    const openModal = (unit = null) => {
        if (unit) {
            setEditingUnit(unit)
            setFormData(unit)
        } else {
            resetFormData()
        }
        setIsModalOpen(true)
    }

    const columns = [
        { key: 'code', label: 'Code' },
        { key: 'name', label: 'Name' },
        { key: 'symbol', label: 'Symbol' },
        {
            key: 'baseUnitId',
            label: 'Base Unit',
            render: (value, row) => units.find(b => b.id === value)?.name || '-'
        },
        {
            key: 'conversionFactor',
            label: 'Conversion',
            render: (value) => `1 : ${value || 1}`
        }
    ]

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Units of Measure</h1>
                    <p className="text-gray-400 mt-1">Define multiple units for product measurement</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => openModal()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                    <Plus size={18} />
                    Add Unit
                </motion.button>
            </div>

            <DataTable
                columns={columns}
                data={units}
                actions={(unit) => (
                    <div className="flex gap-2">
                        <button onClick={() => openModal(unit)} className="p-2 hover:bg-gray-700 rounded">
                            <Edit size={16} />
                        </button>
                        <button onClick={() => setDeleteConfirm(unit)} className="p-2 hover:bg-red-600 rounded">
                            <Trash2 size={16} />
                        </button>
                    </div>
                )}
            />

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingUnit ? 'Edit Unit' : 'New Unit'}>
                <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                        <FormInput
                            label="Unit Code *"
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                            placeholder="UNT-001"
                        />
                        <FormInput
                            label="Unit Name *"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Kilogram"
                        />
                        <FormInput
                            label="Symbol *"
                            value={formData.symbol}
                            onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                            placeholder="Kg"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <FormSelect
                            label="Base Unit"
                            value={formData.baseUnitId}
                            onChange={(e) => setFormData({ ...formData, baseUnitId: e.target.value })}
                            options={[
                                { value: '', label: 'No Base Unit' },
                                ...units.map(u => ({ value: String(u.id), label: u.name }))
                            ]}
                        />
                        <FormInput
                            label="Conversion Factor"
                            type="number"
                            value={formData.conversionFactor}
                            onChange={(e) => setFormData({ ...formData, conversionFactor: parseFloat(e.target.value) || 1 })}
                            placeholder="1"
                            step="0.01"
                        />
                    </div>
                    <FormTextarea
                        label="Description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Unit description..."
                        rows={3}
                    />
                </div>
                <ModalFooter
                    onCancel={() => setIsModalOpen(false)}
                    onConfirm={handleSubmit}
                    confirmText={editingUnit ? 'Update' : 'Add'}
                />
            </Modal>

            <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Confirm Delete">
                <p className="text-gray-300">
                    Are you sure you want to delete unit "<strong>{deleteConfirm?.name}</strong>"?
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

export default Units
