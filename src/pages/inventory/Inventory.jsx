import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
    Package,
    Warehouse,
    Truck,
    TrendingUp,
    AlertTriangle,
    RotateCcw,
    ShoppingCart,
    FileText,
    Building2,
    CheckCircle,
    Settings,
    Plus
} from 'lucide-react'
import { getInventoryStats, getInventoryProducts, getWarehouses, getStockLevels, createProduct } from '../../stores/inventoryStore'
import DataTable from '../../components/DataTable'
import Modal, { ModalFooter } from '../../components/Modal'
import FormInput, { FormTextarea, FormSelect } from '../../components/FormInput'
import { useToast } from '../../components/Toast'

function Inventory() {
    const toast = useToast()
    const [stats, setStats] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [adjustModal, setAdjustModal] = useState(null)

    const [productData, setProductData] = useState({
        name: '', sku: '', category: 'finished', type: 'stockable', unit: 'piece',
        price: 0, cost: 0, stock: 0, minStock: 0, description: '', warehouseId: '', reorderLevel: 0
    })

    const [adjustData, setAdjustData] = useState({
        productId: '', warehouseId: '', quantity: 0, type: 'adjust', reason: ''
    })

    useEffect(() => {
        setStats(getInventoryStats())
    }, [])

    const handleAddProduct = () => {
        setProductData({
            name: '', sku: '', category: 'finished', type: 'stockable', unit: 'piece',
            price: 0, cost: 0, stock: 0, minStock: 0, description: '', warehouseId: '', reorderLevel: 0
        })
        setIsModalOpen(true)
        setAdjustModal(null)
    }

    const handleAdjust = (item) => {
        setAdjustModal(item)
        setAdjustData({
            productId: item.id,
            warehouseId: '',
            quantity: 0,
            type: 'adjust',
            reason: ''
        })
        setIsModalOpen(true)
    }

    const confirmAdjust = () => {
        toast.success('Stock adjusted')
        setIsModalOpen(false)
        setAdjustModal(null)
        loadData()
    }

    const loadData = () => {
        setStats(getInventoryStats())
    }

    const handleResetStock = () => {
        toast.success('Stock levels reset')
        loadData()
    }

    const columns = [
        { key: 'sku', label: 'SKU', render: (v) => <span className="sku-code">{v}</span> },
        { key: 'name', label: 'Product Name' },
        { key: 'category', label: 'Category', render: (v) => <span className="category-badge">{v}</span> },
        { key: 'type', label: 'Type', render: (v) => <span className="type-badge">{v}</span> },
        { key: 'unit', label: 'Unit' },
        { key: 'price', label: 'Price', render: (v) => <span className="amount">${v}</span> },
        {
            key: 'stock', label: 'Stock', render: (v) => (
                <div className="stock-level">
                    <span className="stock-number">{v}</span>
                    <span className={`stock-status ${v < 50 ? 'low' : v < 100 ? 'good' : 'high'}`}></span>
                </div>
            )
        },
        { key: 'value', label: 'Value', render: (_, row) => <span className="amount">${(row.stock * row.price).toLocaleString()}</span> },
        {
            key: 'warehouse', label: 'Warehouse', render: (_, row) => {
                const wh = getWarehouses().find(w => w.id === row.warehouseId)
                return wh ? wh.name : '-'
            }
        }
    ]

    return (
        <div className="page">
            <motion.div className="page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <div>
                    <h1 className="page-title"><span className="gradient-text">Inventory</span> Management</h1>
                    <p className="page-description">
                        Track stock levels, manage warehouses, and optimize inventory.
                    </p>
                </div>
            </motion.div>

            {stats && (
                <>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                                    <Package size={32} />
                                </div>
                                <div className="stat-content">
                                    <div className="stat-label">Total Products</div>
                                    <div className="stat-value">{stats.totalProducts}</div>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981, #34d399)' }}>
                                    <Warehouse size={32} />
                                </div>
                                <div className="stat-content">
                                    <div className="stat-label">Total Warehouses</div>
                                    <div className="stat-value">{stats.totalWarehouses}</div>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #fb923c)' }}>
                                    <TrendingUp size={32} />
                                </div>
                                <div className="stat-content">
                                    <div className="stat-label">Total Stock Value</div>
                                    <div className="stat-value">${stats.totalStockValue}</div>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #ef4444, #f87171)' }}>
                                    <AlertTriangle size={32} />
                                </div>
                                <div className="stat-content">
                                    <div className="stat-label">Low Stock Items</div>
                                    <div className="stat-value danger">{stats.lowStockItems}</div>
                                </div>
                            </div>
                        </div>

                        <div className="actions-row">
                            <button className="action-btn" onClick={handleResetStock}>
                                <RotateCcw size={18} />
                                Reset Stock Levels
                            </button>
                            <button className="btn-primary" onClick={handleAddProduct}>
                                <Plus size={20} /> Add Product
                            </button>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <div className="section-header">
                            <h3>Quick Actions</h3>
                        </div>
                        <div className="action-cards">
                            <Link to="/inventory/warehouses" className="action-link">
                                <Warehouse size={24} />
                                Warehouses
                                <span>{stats.totalWarehouses} locations</span>
                            </Link>
                            <Link to="/inventory/movements" className="action-link">
                                <Truck size={24} />
                                Stock Movements
                                <span>{stats.totalMovements} transactions</span>
                            </Link>
                            <Link to="/inventory/transfers" className="action-link">
                                <RotateCcw size={24} />
                                Transfers
                                <span>{stats.pendingTransfers} pending</span>
                            </Link>
                            <Link to="/inventory/serial-numbers" className="action-link">
                                <FileText size={24} />
                                Serial Numbers
                                <span>{0} items tracked</span>
                            </Link>
                        </div>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                        <div className="section-header">
                            <h3>Current Stock Levels</h3>
                        </div>
                        <DataTable
                            columns={columns}
                            data={getInventoryProducts()}
                            searchable
                            exportable
                        />
                    </motion.div>
                </>
            )}

            {/* Add/Edit Product Modal */}
            <Modal isOpen={isModalOpen && !adjustModal} onClose={() => { setIsModalOpen(false); setAdjustModal(null) }} title="Add Product" size="large">
                <div className="form-grid">
                    <FormInput label="Product Name *" placeholder="Widget Pro" value={productData.name} onChange={(e) => setProductData({ ...productData, name: e.target.value })} />
                    <FormInput label="SKU" placeholder="SKU-001" value={productData.sku} onChange={(e) => setProductData({ ...productData, sku: e.target.value })} />
                </div>
                <div className="form-grid">
                    <FormSelect label="Category" options={[
                        { value: 'finished', label: 'Finished Goods' },
                        { value: 'raw_materials', label: 'Raw Materials' },
                        { value: 'services', label: 'Services' }
                    ]} value={productData.category} onChange={(e) => setProductData({ ...productData, category: e.target.value })} />
                    <FormSelect label="Type" options={[
                        { value: 'stockable', label: 'Stockable' },
                        { value: 'non_stockable', label: 'Non-Stockable' }
                    ]} value={productData.type} onChange={(e) => setProductData({ ...productData, type: e.target.value })} />
                </div>
                <div className="form-grid">
                    <FormSelect label="Unit" options={[
                        { value: 'piece', label: 'Piece' },
                        { value: 'kg', label: 'Kilogram' },
                        { value: 'unit', label: 'Unit' },
                        { value: 'hours', label: 'Hours' }
                    ]} value={productData.unit} onChange={(e) => setProductData({ ...productData, unit: e.target.value })} />
                    <FormInput label="Price *" type="number" placeholder="0" value={productData.price} onChange={(e) => setProductData({ ...productData, price: parseFloat(e.target.value) || 0 })} />
                </div>
                <div className="form-grid">
                    <FormInput label="Cost *" type="number" placeholder="0" value={productData.cost} onChange={(e) => setProductData({ ...productData, cost: parseFloat(e.target.value) || 0 })} />
                    <FormInput label="Initial Stock *" type="number" placeholder="0" value={productData.stock} onChange={(e) => setProductData({ ...productData, stock: parseInt(e.target.value) || 0 })} />
                    <FormInput label="Min Stock Level" type="number" placeholder="0" value={productData.minStock} onChange={(e) => setProductData({ ...productData, minStock: parseInt(e.target.value) || 0 })} />
                </div>
                <FormTextarea label="Description" value={productData.description} onChange={(e) => setProductData({ ...productData, description: e.target.value })} rows={2} />
                <div className="form-grid">
                    <FormSelect label="Warehouse" options={getWarehouses().map(w => ({ value: w.id, label: w.name }))} value={productData.warehouseId} onChange={(e) => setProductData({ ...productData, warehouseId: e.target.value })} />
                    <FormInput label="Reorder Level" type="number" placeholder="0" value={productData.reorderLevel} onChange={(e) => setProductData({ ...productData, reorderLevel: parseInt(e.target.value) || 0 })} />
                </div>

                <ModalFooter>
                    <button className="btn-secondary" onClick={() => { setIsModalOpen(false); setAdjustModal(null) }}>Cancel</button>
                    <button className="btn-primary" onClick={() => {
                        createProduct(productData)
                        setIsModalOpen(false)
                        setAdjustModal(null)
                        loadData()
                        toast.success('Product added')
                    }}>Create Product</button>
                </ModalFooter>
            </Modal>

            {/* Stock Adjust Modal */}
            <Modal isOpen={!!adjustModal} onClose={() => setAdjustModal(null)} title={`Adjust Stock: ${adjustModal?.name}`} size="medium">
                <div className="form-grid">
                    <FormInput label="Adjustment Type" readOnly value={adjustData.type} />
                    <FormInput label="Quantity *" type="number" placeholder="0" value={adjustData.quantity} onChange={(e) => setAdjustData({ ...adjustData, quantity: parseInt(e.target.value) || 0 })} />
                    <FormSelect label="Warehouse" options={getWarehouses().map(w => ({ value: w.id, label: w.name }))} value={adjustData.warehouseId} onChange={(e) => setAdjustData({ ...adjustData, warehouseId: e.target.value })} />
                </div>
                <FormTextarea label="Reason" value={adjustData.reason} onChange={(e) => setAdjustData({ ...adjustData, reason: e.target.value })} rows={2} placeholder="Optional reason for audit trail" />

                <ModalFooter>
                    <button className="btn-secondary" onClick={() => setAdjustModal(null)}>Cancel</button>
                    <button className="btn-primary" onClick={confirmAdjust}>Adjust Stock</button>
                </ModalFooter>
            </Modal>

            <style>{`
                .btn-primary { display: flex; align-items: center; gap: 8px; padding: 12px 20px; background: var(--accent-gradient); border-radius: var(--radius-md); color: white; }
                .btn-secondary { padding: 12px 20px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-secondary); }
                .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 32px; }
                .stat-card { padding: 24px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); text-align: center; }
                .stat-icon { width: 64px; height: 64px; border-radius: 16px; display: flex; align-items: center; justify-content: center; color: white; margin-bottom: 16px; }
                .stat-content { text-align: left; }
                .stat-label { font-size: 0.85rem; color: var(--text-muted); margin-bottom: 4px; }
                .stat-value { font-size: 1.75rem; font-weight: 700; color: var(--text-primary); }
                .stat-value.danger { color: var(--error); }
                .actions-row { display: flex; gap: 12px; margin-bottom: 24px; }
                .action-btn { display: flex; align-items: center; gap: 8px; padding: 10px 16px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-secondary); transition: all 0.2s ease; }
                .action-btn:hover { background: var(--bg-tertiary); border-color: var(--accent-primary); }
                .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
                .section-header h3 { font-size: 1rem; color: var(--text-primary); }
                .action-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 32px; }
                .action-link { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 20px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-secondary); text-decoration: none; transition: all 0.2s ease; }
                .action-link:hover { background: var(--bg-tertiary); border-color: var(--accent-primary); transform: translateY(-2px); }
                .action-link span { font-size: 0.75rem; color: var(--text-muted); }
                .sku-code { font-family: 'JetBrains Mono', monospace; font-weight: 600; color: var(--accent-primary); font-size: 0.85rem; }
                .category-badge { padding: 4px 10px; background: rgba(99, 102, 241, 0.15); color: #8b5cf6; border-radius: 12px; font-size: 0.75rem; text-transform: capitalize; }
                .type-badge { padding: 4px 10px; background: rgba(139, 92, 246, 0.15); color: #8b5cf6; border-radius: 12px; font-size: 0.75rem; text-transform: capitalize; }
                .amount { font-weight: 600; color: var(--success); }
                .stock-level { display: flex; align-items: center; gap: 6px; }
                .stock-number { font-weight: 600; width: 40px; text-align: center; padding: 8px; background: var(--bg-tertiary); border-radius: 8px; font-size: 0.85rem; }
                .stock-status { width: 12px; height: 12px; border-radius: 50%; }
                .stock-status.good { background: var(--success); }
                .stock-status.low { background: var(--warning); }
                .stock-status.high { background: var(--error); }
            `}</style>
        </div>
    )
}

export default Inventory
