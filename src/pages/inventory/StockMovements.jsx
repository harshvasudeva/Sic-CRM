import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import DataTable from '../../components/DataTable'
import { FormSelect } from '../../components/FormInput'
import { getStockMovements, getInventoryProducts } from '../../stores/inventoryStore'

function StockMovements() {
    const [movements, setMovements] = useState([])
    const [filteredMovements, setFilteredMovements] = useState([])
    const [filterType, setFilterType] = useState('')
    const [filterProduct, setFilterProduct] = useState('')

    useEffect(() => {
        loadData()
    }, [])

    const loadData = () => {
        const allMovements = getStockMovements()
        setMovements(allMovements)
        setFilteredMovements(allMovements)
    }

    useEffect(() => {
        let filtered = movements

        if (filterType) {
            filtered = filtered.filter(m => m.type === filterType)
        }

        if (filterProduct) {
            filtered = filtered.filter(m => m.productId === filterProduct)
        }

        setFilteredMovements(filtered)
    }, [filterType, filterProduct, movements])

    const columns = [
        { key: 'movementNumber', label: 'Movement #', render: (v) => <span className="movement-number">{v}</span> },
        { key: 'movementDate', label: 'Date', render: (v) => <span>{new Date(v).toLocaleDateString()}</span> },
        {
            key: 'type', label: 'Type', render: (v) => (
                <span className={`type-badge ${v}`}>{v}</span>
            )
        },
        {
            key: 'productId', label: 'Product', render: (v) => {
                const product = getInventoryProducts().find(p => p.id === v)
                return product ? `${product.sku} - ${product.name}` : '-'
            }
        },
        { key: 'warehouseId', label: 'Warehouse', render: (v) => <span>{v || '-'}</span> },
        { key: 'quantity', label: 'Quantity', render: (v) => <span className={`quantity ${v > 0 ? 'positive' : 'negative'}`}>{v > 0 ? '+' : ''}{v}</span> },
        { key: 'reference', label: 'Reference', render: (v) => <span className="reference">{v || '-'}</span> },
        { key: 'reason', label: 'Reason' }
    ]

    return (
        <div className="page">
            <motion.div className="page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <div>
                    <h1 className="page-title"><span className="gradient-text">Stock</span> Movements</h1>
                    <p className="page-description">
                        Track all stock movements with detailed history.
                    </p>
                </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <div className="filter-bar">
                    <FormSelect
                        label="Filter by Type"
                        options={[
                            { value: '', label: 'All Types' },
                            { value: 'receipt', label: 'Receipt' },
                            { value: 'issue', label: 'Issue' },
                            { value: 'transfer', label: 'Transfer' },
                            { value: 'adjustment', label: 'Adjustment' },
                            { value: 'return', label: 'Return' }
                        ]}
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                    />
                    <FormSelect
                        label="Filter by Product"
                        options={[
                            { value: '', label: 'All Products' },
                            ...getInventoryProducts().map(p => ({ value: p.id, label: `${p.sku} - ${p.name}` }))
                        ]}
                        value={filterProduct}
                        onChange={(e) => setFilterProduct(e.target.value)}
                    />
                </div>

                <DataTable columns={columns} data={filteredMovements} searchable exportable />
            </motion.div>

            <style>{`
                .filter-bar { display: flex; gap: 16px; margin-bottom: 24px; padding: 20px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); }
                .movement-number { font-family: 'JetBrains Mono', monospace; font-weight: 600; color: var(--accent-primary); }
                .type-badge { padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; text-transform: capitalize; }
                .type-badge.receipt { background: rgba(34, 197, 94, 0.15); color: #22c55e; }
                .type-badge.issue { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
                .type-badge.transfer { background: rgba(59, 130, 246, 0.15); color: #3b82f6; }
                .type-badge.adjustment { background: rgba(251, 191, 36, 0.15); color: #fbbf24; }
                .type-badge.return { background: rgba(168, 85, 247, 0.15); color: #a855f7; }
                .quantity { font-weight: 700; font-family: 'JetBrains Mono', monospace; }
                .quantity.positive { color: var(--success); }
                .quantity.negative { color: var(--error); }
                .reference { font-family: 'JetBrains Mono', monospace; color: var(--text-secondary); }
            `}</style>
        </div>
    )
}

export default StockMovements