import { motion } from 'framer-motion'
import {
    Package,
    Wrench,
    Layers,
    Palette,
    Tag,
    Gift,
    CreditCard,
    Wallet,
    BarChart,
    QrCode,
    ShoppingBag,
    Sparkles
} from 'lucide-react'
import FeatureSection from '../components/FeatureSection'
import FeatureItem from '../components/FeatureItem'

const productTypes = [
    {
        icon: Package,
        title: 'Goods',
        description: 'Tangible physical items that can be stored, shipped, and tracked in inventory',
        color: 'linear-gradient(135deg, #6366f1, #8b5cf6)'
    },
    {
        icon: Wrench,
        title: 'Services',
        description: 'Non-tangible offerings like consultations, car washes, teaching, or support',
        color: 'linear-gradient(135deg, #10b981, #34d399)'
    },
    {
        icon: Layers,
        title: 'Combos',
        description: 'Bundled products combining multiple items (e.g., burger + sides + drink)',
        color: 'linear-gradient(135deg, #f59e0b, #fb923c)'
    }
]

function Products() {
    return (
        <div className="page">
            <motion.div
                className="page-header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="page-title">
                    <span className="gradient-text">Product</span> Management
                </h1>
                <p className="page-description">
                    Comprehensive product management integrated across Sales, Purchase, POS, and Inventory.
                    Support for variants, attributes, pricing strategies, and loyalty programs.
                </p>
            </motion.div>

            {/* Product Types */}
            <FeatureSection icon={ShoppingBag} title="Product Types" delay={0.2}>
                <div className="grid-3">
                    {productTypes.map((type, index) => (
                        <motion.div
                            key={index}
                            className="card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                            whileHover={{ scale: 1.02 }}
                        >
                            <div className="card-header">
                                <div className="card-icon" style={{ background: type.color }}>
                                    <type.icon size={24} />
                                </div>
                                <h3 className="card-title">{type.title}</h3>
                            </div>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                                {type.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </FeatureSection>

            <div className="grid-2">
                {/* Attributes & Variants */}
                <FeatureSection icon={Palette} title="Attributes & Variants" delay={0.3}>
                    <div className="feature-list">
                        <FeatureItem
                            icon={Palette}
                            title="Color Variants"
                            description="Create product variants by color (e.g., black, green, blue pens)"
                            delay={0.1}
                        />
                        <FeatureItem
                            icon={Layers}
                            title="Material Options"
                            description="Define materials like steel vs aluminum legs for furniture"
                            delay={0.15}
                        />
                        <FeatureItem
                            icon={Tag}
                            title="Size Variations"
                            description="Small, medium, large, or custom size configurations"
                            delay={0.2}
                        />
                        <FeatureItem
                            icon={BarChart}
                            title="Variant Pricing"
                            description="Set different prices for each variant combination"
                            delay={0.25}
                        />
                    </div>
                </FeatureSection>

                {/* Price Lists */}
                <FeatureSection icon={Tag} title="Price Lists & Promotions" delay={0.4}>
                    <div className="feature-list">
                        <FeatureItem
                            icon={Sparkles}
                            title="Seasonal Offers"
                            description="Create time-limited discounts (e.g., 20% Christmas discount)"
                            delay={0.1}
                        />
                        <FeatureItem
                            icon={Tag}
                            title="Customer-Specific Pricing"
                            description="Set special prices for VIP customers or B2B accounts"
                            delay={0.15}
                        />
                        <FeatureItem
                            icon={BarChart}
                            title="Volume Discounts"
                            description="Automatic price breaks based on quantity ordered"
                            delay={0.2}
                        />
                    </div>
                </FeatureSection>
            </div>

            {/* Loyalty & Rewards */}
            <FeatureSection icon={Gift} title="Loyalty & Rewards Programs" delay={0.5}>
                <div className="grid-4">
                    <motion.div
                        className="card"
                        style={{ textAlign: 'center', padding: '28px' }}
                        whileHover={{ scale: 1.03 }}
                    >
                        <div style={{
                            width: '60px',
                            height: '60px',
                            margin: '0 auto 16px',
                            borderRadius: '16px',
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Tag size={28} color="white" />
                        </div>
                        <h4 style={{ marginBottom: '8px' }}>Discount Codes</h4>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                            Create promotional codes for fixed or percentage discounts
                        </p>
                    </motion.div>

                    <motion.div
                        className="card"
                        style={{ textAlign: 'center', padding: '28px' }}
                        whileHover={{ scale: 1.03 }}
                    >
                        <div style={{
                            width: '60px',
                            height: '60px',
                            margin: '0 auto 16px',
                            borderRadius: '16px',
                            background: 'linear-gradient(135deg, #ec4899, #f472b6)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Gift size={28} color="white" />
                        </div>
                        <h4 style={{ marginBottom: '8px' }}>Loyalty Programs</h4>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                            Points-based rewards for repeat customers
                        </p>
                    </motion.div>

                    <motion.div
                        className="card"
                        style={{ textAlign: 'center', padding: '28px' }}
                        whileHover={{ scale: 1.03 }}
                    >
                        <div style={{
                            width: '60px',
                            height: '60px',
                            margin: '0 auto 16px',
                            borderRadius: '16px',
                            background: 'linear-gradient(135deg, #10b981, #34d399)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <CreditCard size={28} color="white" />
                        </div>
                        <h4 style={{ marginBottom: '8px' }}>Gift Cards</h4>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                            Sell and redeem digital or physical gift cards
                        </p>
                    </motion.div>

                    <motion.div
                        className="card"
                        style={{ textAlign: 'center', padding: '28px' }}
                        whileHover={{ scale: 1.03 }}
                    >
                        <div style={{
                            width: '60px',
                            height: '60px',
                            margin: '0 auto 16px',
                            borderRadius: '16px',
                            background: 'linear-gradient(135deg, #f59e0b, #fb923c)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Wallet size={28} color="white" />
                        </div>
                        <h4 style={{ marginBottom: '8px' }}>E-Wallets</h4>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                            Customer wallet balances for faster checkout
                        </p>
                    </motion.div>
                </div>
            </FeatureSection>

            {/* Inventory Tracking */}
            <FeatureSection icon={QrCode} title="Inventory Tracking" delay={0.6}>
                <div className="grid-2">
                    <motion.div className="card" whileHover={{ scale: 1.02 }}>
                        <div className="card-header">
                            <div className="card-icon" style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)' }}>
                                <QrCode size={24} />
                            </div>
                            <div>
                                <h3 className="card-title">Lot Tracking</h3>
                                <p className="card-subtitle">Batch management</p>
                            </div>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            Track products by lot numbers for quality control, expiration management, and recall handling.
                        </p>
                    </motion.div>

                    <motion.div className="card" whileHover={{ scale: 1.02 }}>
                        <div className="card-header">
                            <div className="card-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6, #a855f7)' }}>
                                <BarChart size={24} />
                            </div>
                            <div>
                                <h3 className="card-title">Serial Numbers</h3>
                                <p className="card-subtitle">Individual unit tracking</p>
                            </div>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            Assign unique serial numbers to each unit for warranty tracking, theft prevention, and service history.
                        </p>
                    </motion.div>
                </div>
            </FeatureSection>
        </div>
    )
}

export default Products
