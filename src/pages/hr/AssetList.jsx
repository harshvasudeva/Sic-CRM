import { useState, useEffect } from 'react'
import { Plus, Search, Filter, Monitor, Smartphone, Briefcase, User, Calendar } from 'lucide-react'
import { useToast } from '../../components/Toast'

function AssetList() {
    const [assets, setAssets] = useState([])
    const [employees, setEmployees] = useState([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [newItem, setNewItem] = useState({
        name: '', assetNumber: '', type: 'Laptop',
        serialNumber: '', purchaseDate: '', value: '', status: 'in-stock',
        assignedTo: ''
    })
    const toast = useToast()

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            const [aRes, eRes] = await Promise.all([
                fetch('http://localhost:5000/api/hr/assets'),
                fetch('http://localhost:5000/api/hr/employees')
            ])
            setAssets(await aRes.json())
            setEmployees(await eRes.json())
        } catch (err) {
            console.error(err)
            toast.error('Failed to load data')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            await fetch('http://localhost:5000/api/hr/assets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newItem, value: parseFloat(newItem.value) || 0 })
            })
            toast.success('Asset added')
            setIsModalOpen(false)
            setNewItem({ name: '', assetNumber: '', type: 'Laptop', serialNumber: '', purchaseDate: '', value: '', status: 'in-stock', assignedTo: '' })
            loadData()
        } catch (err) {
            toast.error('Failed to add asset')
        }
    }

    const handleAssign = async (assetId, employeeId) => {
        try {
            await fetch(`http://localhost:5000/api/hr/assets/${assetId}/assign`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ employeeId })
            })
            toast.success(employeeId ? 'Asset assigned' : 'Asset unassigned')
            loadData()
        } catch (err) {
            toast.error('Failed to update assignment')
        }
    }

    const filteredAssets = assets.filter(a =>
        a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.assetNumber.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getIcon = (type) => {
        switch (type) {
            case 'Laptop': return <Monitor size={20} className="text-blue-400" />
            case 'Phone': return <Smartphone size={20} className="text-green-400" />
            default: return <Briefcase size={20} className="text-gray-400" />
        }
    }

    if (loading) return <div>Loading...</div>

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Asset Management</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                >
                    <Plus size={18} /> Add Asset
                </button>
            </div>

            <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 mb-6">
                <div className="flex gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search assets..."
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAssets.map(asset => (
                    <div key={asset.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-800 rounded-lg">{getIcon(asset.type)}</div>
                                <div>
                                    <h3 className="font-semibold text-white">{asset.name}</h3>
                                    <div className="text-xs text-gray-500">{asset.assetNumber}</div>
                                </div>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs ${asset.status === 'assigned' ? 'bg-green-500/10 text-green-500' : 'bg-gray-700 text-gray-400'}`}>
                                {asset.status}
                            </span>
                        </div>

                        <div className="space-y-3 mb-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Serial No.</span>
                                <span className="text-gray-300 font-mono">{asset.serialNumber || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Value</span>
                                <span className="text-gray-300">${asset.value}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Assigned To</span>
                                <div className="text-right">
                                    {asset.employee ? (
                                        <div className="flex items-center gap-1 text-blue-400">
                                            <User size={12} /> {asset.employee.firstName} {asset.employee.lastName}
                                        </div>
                                    ) : (
                                        <span className="text-gray-600 italic">Unassigned</span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-gray-800">
                            <select
                                className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-sm text-white"
                                value={asset.assignedTo || ''}
                                onChange={(e) => handleAssign(asset.id, e.target.value)}
                            >
                                <option value="">Select Employee to Assign</option>
                                {employees.map(e => (
                                    <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                ))}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-gray-900 border border-gray-700 rounded-xl p-6 w-[600px]">
                        <h2 className="text-xl font-bold mb-4">Add New Asset</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Asset Name</label>
                                    <input className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white" required
                                        value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Asset Number</label>
                                    <input className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white" required
                                        value={newItem.assetNumber} onChange={e => setNewItem({ ...newItem, assetNumber: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Type</label>
                                    <select className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white"
                                        value={newItem.type} onChange={e => setNewItem({ ...newItem, type: e.target.value })}
                                    >
                                        <option>Laptop</option>
                                        <option>Phone</option>
                                        <option>Monitor</option>
                                        <option>Furniture</option>
                                        <option>Vehicle</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Serial Number</label>
                                    <input className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white"
                                        value={newItem.serialNumber} onChange={e => setNewItem({ ...newItem, serialNumber: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Purchase Date</label>
                                    <input type="date" className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white"
                                        value={newItem.purchaseDate} onChange={e => setNewItem({ ...newItem, purchaseDate: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Value ($)</label>
                                    <input type="number" className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white"
                                        value={newItem.value} onChange={e => setNewItem({ ...newItem, value: e.target.value })} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Assign To (Optional)</label>
                                <select className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white"
                                    value={newItem.assignedTo} onChange={e => setNewItem({ ...newItem, assignedTo: e.target.value })}
                                >
                                    <option value="">-- Keep in Stock --</option>
                                    {employees.map(e => (
                                        <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex justify-end gap-2 mt-6">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-white hover:bg-gray-800 rounded">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Add Asset</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AssetList
