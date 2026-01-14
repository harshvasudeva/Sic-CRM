import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Package,
    AlertTriangle,
    Filter,
    Download
} from 'lucide-react'
import { getProducts, deleteProduct, getCategories } from '../../stores/productStore'
import DataTable from '../../components/DataTable'
import Modal, { ModalFooter } from '../../components/Modal'
import ProductForm from './ProductForm'
import { useToast } from '../../components/Toast'
import EmptyState from '../../components/EmptyState'

function ProductList() {
    const [products, setProducts] = useState([])
    const [categories, setCategories] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingProduct, setEditingProduct] = useState(null)
    const [deleteConfirm, setDeleteConfirm] = useState(null)
    const [filterCategory, setFilterCategory] = useState('')
    const [filterType, setFilterType] = useState('')
    const toast = useToast()

    const loadProducts = () => {
        const data = getProducts()
        setProducts(data)
        setCategories(getCategories())
    }

    useEffect(() => {
        loadProducts()
    }, [])

    const handleEdit = (product) => {
        setEditingProduct(product)
        setIsModalOpen(true)
    }

    const handleDelete = (product) => {
        setDeleteConfirm(product)
    }

    const confirmDelete = () => {
        if (deleteConfirm) {
            deleteProduct(deleteConfirm.id)
            loadProducts()
            toast.success(`${deleteConfirm.name} deleted successfully`)
            setDeleteConfirm(null)
        }
    }

    const handleFormClose = (saved) => {
        setIsModalOpen(false)
        setEditingProduct(null)
        if (saved) {
            loadProducts()
        }
    }

    // Filter products
    const filteredProducts = products.filter(p => {
        if (filterCategory && p.category !== filterCategory) return false
        if (filterType && p.type !== filterType) return false
        return true
    })

    const columns = [
        {
            key: 'name',
            label: 'Product',
            render: (value, row) => (
                <div className="product-cell">
                    <div className="product-icon">
                        <Package size={18} />
                    </div>
                    <div>
                        <div className="product-name">{value}</div>
                        <div className="product-sku">{row.sku}</div>
                    </div>
                </div>
            )
        },
        { key: 'category', label: 'Category' },
        {
            key: 'type',
            label: 'Type',
            render: (value) => (
                <span className={`type-badge ${value}`}>
                    {value.charAt(0).toUpperCase() + value.slice(1)}
                </span>
            )
        },
        {
            key: 'price',
            label: 'Price',
            render: (value) => `$${value.toFixed(2)}`
        },
        {
            key: 'stock',
            label: 'Stock',
            render: (value, row) => {
                if (row.type !== 'goods') return '—'
                const isLow = value <= row.minStock
                return (
                    <span className={`stock-value ${isLow ? 'low' : ''}`}>
                        {isLow && <AlertTriangle size={14} />}
                        {value}
                    </span>
                )
            }
        },
        {
            key: 'status',
            label: 'Status',
            render: (value) => (
                <span className={`status-badge ${value}`}>
                    {value.charAt(0).toUpperCase() + value.slice(1)}
                </span>
            )
        },
        {
            key: 'actions',
            label: '',
            sortable: false,
            render: (_, row) => (
                <div className="action-buttons">
                    <button className="action-btn edit" onClick={() => handleEdit(row)}>
                        <Edit size={16} />
                    </button>
                    <button className="action-btn delete" onClick={() => handleDelete(row)}>
                        <Trash2 size={16} />
                    </button>
                </div>
            )
        }
    ]

    return (
        <div className="page">
            <motion.div
                className="page-header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="page-header-left">
                    <h1 className="page-title">
                        <span className="gradient-text">Products</span>
                    </h1>
                    <p className="page-description">
                        Manage your product catalog, inventory, and pricing.
                    </p>
                </div>
                <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
                    <Plus size={20} />
                    Add Product
                </button>
            </motion.div>

            {/* Filters */}
            <motion.div
                className="filters-bar"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <div className="filter-group">
                    <Filter size={18} />
                    <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                    >
                        <option value="">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
                <div className="filter-group">
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                    >
                        <option value="">All Types</option>
                        <option value="goods">Goods</option>
                        <option value="service">Services</option>
                        <option value="combo">Combos</option>
                    </select>
                </div>
                <div className="filter-stats">
                    {filteredProducts.length} products
                </div>
            </motion.div>

            {/* Product Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                {filteredProducts.length === 0 ? (
                    <div className="card">
                        <EmptyState
                            type="products"
                            onAction={() => setIsModalOpen(true)}
                        />
                    </div>
                ) : (
                    <DataTable
                        columns={columns}
                        data={filteredProducts}
                        searchable={true}
                        exportable={true}
                    />
                )}
            </motion.div>

            {/* Product Form Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => handleFormClose(false)}
                title={editingProduct ? 'Edit Product' : 'Add New Product'}
                size="large"
            >
                <ProductForm
                    product={editingProduct}
                    onClose={handleFormClose}
                />
            </Modal>

            {/* Delete Confirmation */}
            <Modal
                isOpen={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                title="Delete Product"
                size="small"
            >
                <p style={{ marginBottom: 24, color: 'var(--text-secondary)' }}>
                    Are you sure you want to delete <strong>{deleteConfirm?.name}</strong>?
                    This action cannot be undone.
                </p>
                <ModalFooter>
                    <button
                        className="btn-secondary"
                        onClick={() => setDeleteConfirm(null)}
                    >
                        Cancel
                    </button>
                    <button
                        className="btn-danger"
                        onClick={confirmDelete}
                    >
                        Delete
                    </button>
                </ModalFooter>
            </Modal>

            <style>{`
        .page-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          flex-wrap: wrap;
        }

        .btn-primary {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: var(--accent-gradient);
          border-radius: var(--radius-md);
          color: white;
          font-size: 0.9rem;
          font-weight: 500;
          transition: all 0.2s;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);
        }

        .btn-secondary {
          padding: 10px 20px;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          font-size: 0.9rem;
        }

        .btn-danger {
          padding: 10px 20px;
          background: var(--error);
          border-radius: var(--radius-md);
          color: white;
          font-size: 0.9rem;
        }

        .filters-bar {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
        }

        .filter-group svg {
          color: var(--text-muted);
        }

        .filter-group select {
          background: transparent;
          border: none;
          color: var(--text-primary);
          font-size: 0.9rem;
          cursor: pointer;
        }

        .filter-stats {
          margin-left: auto;
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .product-cell {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .product-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: rgba(99, 102, 241, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent-primary);
        }

        .product-name {
          font-weight: 500;
        }

        .product-sku {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .type-badge {
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .type-badge.goods {
          background: rgba(16, 185, 129, 0.15);
          color: var(--success);
        }

        .type-badge.service {
          background: rgba(59, 130, 246, 0.15);
          color: var(--info);
        }

        .type-badge.combo {
          background: rgba(139, 92, 246, 0.15);
          color: #8b5cf6;
        }

        .stock-value {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .stock-value.low {
          color: var(--warning);
        }

        .status-badge.active {
          background: rgba(16, 185, 129, 0.15);
          color: var(--success);
        }

        .status-badge.inactive {
          background: rgba(107, 114, 128, 0.15);
          color: var(--text-muted);
        }

        .action-buttons {
          display: flex;
          gap: 8px;
        }

        .action-btn {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .action-btn.edit {
          background: rgba(59, 130, 246, 0.1);
          color: var(--info);
        }

        .action-btn.edit:hover {
          background: rgba(59, 130, 246, 0.2);
        }

        .action-btn.delete {
          background: rgba(239, 68, 68, 0.1);
          color: var(--error);
        }

        .action-btn.delete:hover {
          background: rgba(239, 68, 68, 0.2);
        }
      `}</style>
        </div>
    )
}

export default ProductList
