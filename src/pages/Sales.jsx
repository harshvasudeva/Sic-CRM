import { motion } from 'framer-motion'
import {
    FileText,
    CheckCircle,
    Receipt,
    CreditCard,
    Settings,
    BarChart3,
    Users,
    Tag,
    Percent,
    DollarSign,
    Package,
    TrendingUp
} from 'lucide-react'
import WorkflowDiagram from '../components/WorkflowDiagram'
import FeatureSection from '../components/FeatureSection'
import FeatureItem from '../components/FeatureItem'

const salesWorkflow = [
    { icon: FileText, label: 'Quotation' },
    { icon: CheckCircle, label: 'Sale Order' },
    { icon: Receipt, label: 'Invoice' },
    { icon: CreditCard, label: 'Payment' }
]

function Sales() {
    return (
        <div className="page">
            <motion.div
                className="page-header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="page-title">
                    <span className="gradient-text">Sales</span> Module
                </h1>
                <p className="page-description">
                    Manage the complete sales cycle from lead to payment. Create quotations,
                    convert them to orders, generate invoices, and process payments seamlessly.
                </p>
            </motion.div>

            {/* Workflow */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <h3 style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>Core Workflow</h3>
                <WorkflowDiagram steps={salesWorkflow} />
            </motion.div>

            <div className="grid-2">
                {/* Configuration Options */}
                <FeatureSection icon={Settings} title="Configuration Options" delay={0.3}>
                    <div className="feature-list">
                        <FeatureItem
                            icon={Package}
                            title="Delivery Methods"
                            description="Configure shipping carriers, rates, and delivery time estimates"
                            delay={0.1}
                        />
                        <FeatureItem
                            icon={Tag}
                            title="Tags & Categories"
                            description="Organize products and orders with customizable tags"
                            delay={0.15}
                        />
                        <FeatureItem
                            icon={FileText}
                            title="Quotation Templates"
                            description="Create reusable templates for faster quote generation"
                            delay={0.2}
                        />
                        <FeatureItem
                            icon={Users}
                            title="Sales Teams"
                            description="Organize salespeople into teams with targets and territories"
                            delay={0.25}
                        />
                    </div>
                </FeatureSection>

                {/* Invoicing Policies */}
                <FeatureSection icon={Receipt} title="Invoicing Policies" delay={0.4}>
                    <div className="feature-list">
                        <FeatureItem
                            icon={CheckCircle}
                            title="Invoice on Ordered Quantities"
                            description="Bill customers based on what was ordered, regardless of delivery"
                            delay={0.1}
                        />
                        <FeatureItem
                            icon={Package}
                            title="Invoice on Delivered Quantities"
                            description="Bill only for items that have been actually delivered"
                            delay={0.15}
                        />
                    </div>

                    <div style={{ marginTop: '24px' }}>
                        <h4 style={{ marginBottom: '12px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Invoice Types</h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            <span className="badge">Regular Invoice</span>
                            <span className="badge warning">Down Payment (%)</span>
                            <span className="badge info">Down Payment (Fixed)</span>
                        </div>
                    </div>
                </FeatureSection>
            </div>

            {/* Sales Reporting */}
            <FeatureSection icon={BarChart3} title="Sales Reporting & Analytics" delay={0.5}>
                <div className="grid-3">
                    <motion.div
                        className="card"
                        whileHover={{ scale: 1.02 }}
                    >
                        <div className="card-header">
                            <div className="card-icon">
                                <Users size={24} />
                            </div>
                            <div>
                                <h3 className="card-title">Salesperson Performance</h3>
                                <p className="card-subtitle">Track individual and team metrics</p>
                            </div>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            Visual reports showing quota attainment, deal velocity, and conversion rates per salesperson.
                        </p>
                    </motion.div>

                    <motion.div
                        className="card"
                        whileHover={{ scale: 1.02 }}
                    >
                        <div className="card-header">
                            <div className="card-icon" style={{ background: 'linear-gradient(135deg, #10b981, #34d399)' }}>
                                <TrendingUp size={24} />
                            </div>
                            <div>
                                <h3 className="card-title">Product Demand</h3>
                                <p className="card-subtitle">Analyze bestsellers and trends</p>
                            </div>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            Identify top-selling products, seasonal patterns, and inventory optimization opportunities.
                        </p>
                    </motion.div>

                    <motion.div
                        className="card"
                        whileHover={{ scale: 1.02 }}
                    >
                        <div className="card-header">
                            <div className="card-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #fb923c)' }}>
                                <DollarSign size={24} />
                            </div>
                            <div>
                                <h3 className="card-title">Customer Analytics</h3>
                                <p className="card-subtitle">Segment and analyze buyers</p>
                            </div>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            Customer lifetime value, purchase frequency, and segment-based revenue analysis.
                        </p>
                    </motion.div>
                </div>
            </FeatureSection>
        </div>
    )
}

export default Sales
