import { motion } from 'framer-motion'
import {
    Factory,
    Package,
    Layers,
    Settings,
    Trash2,
    RotateCcw,
    ArrowRightLeft,
    MapPin,
    Route,
    Boxes,
    Wrench,
    ClipboardList
} from 'lucide-react'
import FeatureSection from '../components/FeatureSection'
import FeatureItem from '../components/FeatureItem'

function Manufacturing() {
    return (
        <div className="page">
            <motion.div
                className="page-header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="page-title">
                    <span className="gradient-text">Manufacturing</span> & Inventory
                </h1>
                <p className="page-description">
                    Comprehensive manufacturing resource planning (MRP) and inventory management.
                    Track work centers, manage bills of materials, and control stock operations.
                </p>
            </motion.div>

            {/* Manufacturing */}
            <FeatureSection icon={Factory} title="Manufacturing (MRP)" delay={0.2}>
                <div className="grid-2">
                    <motion.div className="card" whileHover={{ scale: 1.02 }}>
                        <div className="card-header">
                            <div className="card-icon" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                                <Wrench size={24} />
                            </div>
                            <div>
                                <h3 className="card-title">Work Centers</h3>
                                <p className="card-subtitle">Production facilities</p>
                            </div>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>
                            Define work centers with capacity, costs, and scheduling parameters for production planning.
                        </p>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            <span className="badge">Capacity Planning</span>
                            <span className="badge info">Cost Tracking</span>
                        </div>
                    </motion.div>

                    <motion.div className="card" whileHover={{ scale: 1.02 }}>
                        <div className="card-header">
                            <div className="card-icon" style={{ background: 'linear-gradient(135deg, #10b981, #34d399)' }}>
                                <Layers size={24} />
                            </div>
                            <div>
                                <h3 className="card-title">Bill of Materials (BOM)</h3>
                                <p className="card-subtitle">Component structure</p>
                            </div>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>
                            Define the components and quantities needed to manufacture each product.
                        </p>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            <span className="badge success">Multi-level BOMs</span>
                            <span className="badge">Variants</span>
                        </div>
                    </motion.div>
                </div>

                <div className="grid-2" style={{ marginTop: '24px' }}>
                    <div className="feature-list">
                        <FeatureItem
                            icon={Trash2}
                            title="Scrap Orders"
                            description="Track defective products and materials removed from production"
                            delay={0.1}
                        />
                        <FeatureItem
                            icon={RotateCcw}
                            title="Unbuild Orders"
                            description="Disassemble finished products back into components"
                            delay={0.15}
                        />
                    </div>

                    <motion.div
                        className="card"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        style={{
                            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))',
                            borderColor: 'rgba(99, 102, 241, 0.3)'
                        }}
                    >
                        <h4 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <ClipboardList size={20} color="var(--accent-primary)" />
                            BOM Example
                        </h4>
                        <div style={{
                            background: 'rgba(0,0,0,0.2)',
                            borderRadius: '8px',
                            padding: '16px',
                            fontFamily: 'monospace',
                            fontSize: '0.85rem'
                        }}>
                            <div style={{ color: 'var(--accent-primary)', marginBottom: '8px' }}>📦 Finished Product: Bicycle</div>
                            <div style={{ paddingLeft: '20px', color: 'var(--text-secondary)' }}>
                                <div>├── Frame (1x)</div>
                                <div>├── Wheels (2x)</div>
                                <div>├── Handlebars (1x)</div>
                                <div>├── Seat (1x)</div>
                                <div>├── Chain (1x)</div>
                                <div>└── Pedals (2x)</div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </FeatureSection>

            {/* Inventory/Warehouse */}
            <FeatureSection icon={Package} title="Inventory / Warehouse" delay={0.4}>
                <div className="grid-3">
                    <motion.div className="card" whileHover={{ scale: 1.02 }}>
                        <div className="card-header">
                            <div className="card-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #fb923c)' }}>
                                <ArrowRightLeft size={24} />
                            </div>
                            <div>
                                <h3 className="card-title">Stock Moves</h3>
                                <p className="card-subtitle">Track movements</p>
                            </div>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            Monitor all inventory movements between locations with full traceability.
                        </p>
                    </motion.div>

                    <motion.div className="card" whileHover={{ scale: 1.02 }}>
                        <div className="card-header">
                            <div className="card-icon" style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)' }}>
                                <Boxes size={24} />
                            </div>
                            <div>
                                <h3 className="card-title">Internal Transfers</h3>
                                <p className="card-subtitle">Warehouse operations</p>
                            </div>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            Move inventory between warehouses or internal locations seamlessly.
                        </p>
                    </motion.div>

                    <motion.div className="card" whileHover={{ scale: 1.02 }}>
                        <div className="card-header">
                            <div className="card-icon" style={{ background: 'linear-gradient(135deg, #ec4899, #f472b6)' }}>
                                <Boxes size={24} />
                            </div>
                            <div>
                                <h3 className="card-title">Storage Categories</h3>
                                <p className="card-subtitle">Organize inventory</p>
                            </div>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            Define storage categories for different product types and requirements.
                        </p>
                    </motion.div>
                </div>
            </FeatureSection>

            {/* Advanced Rules */}
            <FeatureSection icon={Settings} title="Advanced Rules & Routes" delay={0.5}>
                <div className="grid-2">
                    <div className="feature-list">
                        <FeatureItem
                            icon={MapPin}
                            title="Putaway Rules"
                            description="Automatically route incoming products to specific storage locations"
                            delay={0.1}
                        />
                        <FeatureItem
                            icon={Route}
                            title="Routes"
                            description="Define multi-step routes for complex warehouse operations"
                            delay={0.15}
                        />
                        <FeatureItem
                            icon={Settings}
                            title="Reordering Rules"
                            description="Automatic purchase orders when stock falls below minimum"
                            delay={0.2}
                        />
                    </div>

                    <motion.div
                        className="card"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                    >
                        <h4 style={{ marginBottom: '16px' }}>Route Configuration</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {[
                                { from: 'Receiving', to: 'Quality Control', color: 'var(--info)' },
                                { from: 'Quality Control', to: 'Stock', color: 'var(--success)' },
                                { from: 'Stock', to: 'Packing', color: 'var(--warning)' },
                                { from: 'Packing', to: 'Shipping', color: 'var(--accent-primary)' }
                            ].map((route, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.7 + index * 0.1 }}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        padding: '10px 16px',
                                        background: 'rgba(255,255,255,0.03)',
                                        borderRadius: '8px',
                                        borderLeft: `3px solid ${route.color}`
                                    }}
                                >
                                    <span style={{ fontSize: '0.85rem' }}>{route.from}</span>
                                    <span style={{ color: 'var(--text-muted)' }}>→</span>
                                    <span style={{ fontSize: '0.85rem' }}>{route.to}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </FeatureSection>
        </div>
    )
}

export default Manufacturing
