import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit, Trash2, Building, TrendingDown, History } from 'lucide-react'
import DataTable from '../../components/DataTable'
import Modal, { ModalFooter } from '../../components/Modal'
import FormInput, { FormTextarea, FormSelect } from '../../components/FormInput'
import { useToast } from '../../components/Toast'

const assetTypes = [
    { value: 'tangible', label: 'Tangible' },
    { value: 'intangible', label: 'Intangible' },
    { value: 'financial', label: 'Financial' }
]

const depreciationMethods = [
    { value: 'straight_line', label: 'Straight Line' },
    { value: 'declining_balance', label: 'Declining Balance' },
    { value: 'sum_of_years', label: 'Sum of Years' }
]

const statuses = [
    { value: 'active', label: 'Active' },
    { value: 'depreciated', label: 'Fully Depreciated' },
    { value: 'disposed', label: 'Disposed' }
]

function FixedAssets() {
    const toast = useToast()
    const [assets, setAssets] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingAsset, setEditingAsset] = useState(null)
    const [deleteConfirm, setDeleteConfirm] = useState(null)

    const [formData, setFormData] = useState({
        name: '', code: '', type: 'tangible', category: '', purchasePrice: 0,
        purchaseDate: '', usefulLife: 0, salvageValue: 0,
        depreciationMethod: 'straight_line', accumulatedDepreciation: 0,
        currentValue: 0, location: '', status: 'active', notes: ''
    })

    const loadData = () => {
        const saved = localStorage.getItem('fixedAssets')
        setAssets(saved ? JSON.parse(saved) : [])
    }

    useEffect(() => { loadData() }, [])

    const handleSubmit = () => {
        if (!formData.name || !formData.code || formData.purchasePrice <= 0) {
            toast.error('Please fill in all required fields')
            return
        }

        const accumulatedDepreciation = calculateDepreciation()
        const currentValue = formData.purchasePrice - accumulatedDepreciation

        const assetData = {
            ...formData,
            id: editingAsset?.id || Date.now(),
            accumulatedDepreciation,
            currentValue,
            createdAt: editingAsset?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }

        let updatedAssets
        if (editingAsset) {
            updatedAssets = assets.map(a => a.id === editingAsset.id ? assetData : a)
            toast.success('Asset updated')
        } else {
            updatedAssets = [...assets, assetData]
            toast.success('Asset added')
        }

        localStorage.setItem('fixedAssets', JSON.stringify(updatedAssets))
        setAssets(updatedAssets)
        setIsModalOpen(false)
        setEditingAsset(null)
        resetFormData()
        loadData()
    }

    const handleDelete = () => {
        const updated = assets.filter(a => a.id !== deleteConfirm.id)
        localStorage.setItem('fixedAssets', JSON.stringify(updated))
        setAssets(updated)
        setDeleteConfirm(null)
        toast.success('Asset deleted')
        loadData()
    }

    const calculateDepreciation = () => {
        const { purchasePrice, usefulLife, salvageValue, depreciationMethod, purchaseDate } = formData
        if (!purchasePrice || !usefulLife || !purchaseDate) return 0

        const yearsInUse = (new Date() - new Date(purchaseDate)) / (365 * 24 * 60 * 60 * 1000)
        const annualDepreciation = (purchasePrice - salvageValue) / usefulLife

        switch (depreciationMethod) {
            case 'straight_line':
                return Math.min(annualDepreciation * yearsInUse, purchasePrice - salvageValue)
            case 'declining_balance':
                let accumulated = 0
                let bookValue = purchasePrice
                for (let i = 0; i < Math.min(yearsInUse, usefulLife); i++) {
                    const dep = bookValue * (2 / usefulLife)
                    accumulated += dep
                    bookValue -= dep
                }
                return accumulated
            default:
                return annualDepreciation * yearsInUse
        }
    }

    const resetFormData = () => {
        setFormData({
            name: '', code: '', type: 'tangible', category: '', purchasePrice: 0,
            purchaseDate: '', usefulLife: 0, salvageValue: 0,
            depreciationMethod: 'straight_line', accumulatedDepreciation: 0,
            currentValue: 0, location: '', status: 'active', notes: ''
        })
    }

    const openModal = (asset = null) => {
        if (asset) {
            setEditingAsset(asset)
            setFormData(asset)
        } else {
            resetFormData()
        }
        setIsModalOpen(true)
    }

    const totalValue = assets.reduce((sum, a) => sum + a.currentValue, 0)
    const totalDepreciation = assets.reduce((sum, a) => sum + a.accumulatedDepreciation, 0)

    const columns = [
        { key: 'code', label: 'Asset Code' },
        { key: 'name', label: 'Asset Name' },
        { key: 'category', label: 'Category' },
        {
            key: 'purchasePrice',
            label: 'Purchase Price',
            render: (v) => `$${v.toLocaleString()}`
        },
        {
            key: 'currentValue',
            label: 'Current Value',
            render: (v) => `$${v.toLocaleString()}`
        },
        {
            key: 'accumulatedDepreciation',
            label: 'Depreciation',
            render: (v) => `$${v.toLocaleString()}`
        },
        {
            key: 'status',
            label: 'Status',
            render: (v) => (
                <span className={`px-2 py-1 rounded text-xs ${
                    v === 'active' ? 'bg-green-600' :
                    v === 'depreciated' ? 'bg-yellow-600' : 'bg-red-600'
                }`}>
                    {v.toUpperCase()}
                </span>
            )
        }
    ]

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Fixed Assets</h1>
                    <p className="text-gray-400 mt-1">Manage company assets and depreciation</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => openModal()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                    <Plus size={18} />
                    Add Asset
                </motion.button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 bg-blue-600/20 rounded-lg">
                            <Building size={20} className="text-blue-400" />
                        </div>
                        <span className="text-gray-400 text-sm">Total Asset Value</span>
                    </div>
                    <p className="text-2xl font-bold text-green-400">
                        ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 bg-red-600/20 rounded-lg">
                            <TrendingDown size={20} className="text-red-400" />
                        </div>
                        <span className="text-gray-400 text-sm">Total Depreciation</span>
                    </div>
                    <p className="text-2xl font-bold text-red-400">
                        ${totalDepreciation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                </div>
            </div>

            <DataTable
                columns={columns}
                data={assets}
                actions={(asset) => (
                    <div className="flex gap-2">
                        <button onClick={() => openModal(asset)} className="p-2 hover:bg-gray-700 rounded">
                            <Edit size={16} />
                        </button>
                        <button onClick={() => setDeleteConfirm(asset)} className="p-2 hover:bg-red-600 rounded">
                            <Trash2 size={16} />
                        </button>
                    </div>
                )}
            />

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingAsset ? 'Edit Asset' : 'New Asset'}>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <FormInput
                            label="Asset Code *"
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                            placeholder="AST-001"
                        />
                        <FormInput
                            label="Asset Name *"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Office Equipment"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <FormSelect
                            label="Asset Type"
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                            options={assetTypes}
                        />
                        <FormInput
                            label="Category"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            placeholder="Equipment, Furniture, etc."
                        />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <FormInput
                            label="Purchase Price *"
                            type="number"
                            value={formData.purchasePrice}
                            onChange={(e) => setFormData({ ...formData, purchasePrice: parseFloat(e.target.value) || 0 })}
                            placeholder="0.00"
                        />
                        <FormInput
                            label="Salvage Value"
                            type="number"
                            value={formData.salvageValue}
                            onChange={(e) => setFormData({ ...formData, salvageValue: parseFloat(e.target.value) || 0 })}
                            placeholder="0.00"
                        />
                        <FormInput
                            label="Useful Life (Years) *"
                            type="number"
                            value={formData.usefulLife}
                            onChange={(e) => setFormData({ ...formData, usefulLife: parseInt(e.target.value) || 0 })}
                            placeholder="5"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <FormInput
                            label="Purchase Date *"
                            type="date"
                            value={formData.purchaseDate}
                            onChange={(e) => setFormData({ ...formData, purchaseDate: e.target.value })}
                        />
                        <FormSelect
                            label="Depreciation Method"
                            value={formData.depreciationMethod}
                            onChange={(e) => setFormData({ ...formData, depreciationMethod: e.target.value })}
                            options={depreciationMethods}
                        />
                    </div>
                    <FormInput
                        label="Location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="Office 1, Floor 2"
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
                        placeholder="Additional information..."
                        rows={3}
                    />
                </div>
                <ModalFooter
                    onCancel={() => setIsModalOpen(false)}
                    onConfirm={handleSubmit}
                    confirmText={editingAsset ? 'Update' : 'Add'}
                />
            </Modal>

            <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Confirm Delete">
                <p className="text-gray-300">
                    Are you sure you want to delete asset "<strong>{deleteConfirm?.name}</strong>"?
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

export default FixedAssets
