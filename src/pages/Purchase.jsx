import { motion } from 'framer-motion'
import {
    FileText,
    ShoppingCart,
    Package,
    Receipt,
    CreditCard,
    CheckCircle,
    Truck,
    ArrowDownUp,
    Settings,
    ClipboardCheck,
    Cloud
} from 'lucide-react'
import { Link } from 'react-router-dom'
import WorkflowDiagram from '../components/WorkflowDiagram'
import FeatureSection from '../components/FeatureSection'
import FeatureItem from '../components/FeatureItem'
import PageHelp from '../components/PageHelp'

const purchaseWorkflow = [
    { icon: FileText, label: 'RFQ' },
    { icon: ShoppingCart, label: 'Purchase Order' },
    { icon: Package, label: 'Receipt' },
    { icon: Receipt, label: 'Vendor Bill' },
    { icon: CreditCard, label: 'Payment' }
]

function Purchase() {
    return (
        <div className="page">
            <motion.div
                className="page-header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="page-title">
                    <span className="gradient-text">Purchase</span> Module
                </h1>
                <p className="page-description">
                    Streamline your procurement process from vendor quotations to payment.
                    The Purchase module mirrors the Sales flow but is vendor-focused.
                </p>
            </motion.div>

            {/* Workflow */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
            >
                <h3 style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>Procurement Workflow</h3>
                <WorkflowDiagram steps={purchaseWorkflow} />
            </motion.div>

            {/* Key Features */}
            <FeatureSection icon={Settings} title="Key Features" delay={0.3}>
                <div className="grid-2">
                    <motion.div className="card" whileHover={{ scale: 1.02 }}>
                        <div className="card-header">
                            <div className="card-icon" style={{ background: 'linear-gradient(135deg, #10b981, #34d399)' }}>
                                <ClipboardCheck size={24} />
                            </div>
                            <div>
                                <h3 className="card-title">Bill Matching</h3>
                                <p className="card-subtitle">Verify vendor invoices</p>
                            </div>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>
                            Automatically match vendor bills against purchase orders and receipts to ensure accuracy before payment.
                        </p>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            <span className="badge success">Auto-matching</span>
                            <span className="badge">Discrepancy Alerts</span>
                        </div>
                    </motion.div>

                    <motion.div className="card" whileHover={{ scale: 1.02 }}>
                        <div className="card-header">
                            <div className="card-icon" style={{ background: 'linear-gradient(135deg, #3b82f6, #06b6d4)' }}>
                                <ArrowDownUp size={24} />
                            </div>
                            <div>
                                <h3 className="card-title">Three-Way Matching</h3>
                                <p className="card-subtitle">Complete verification</p>
                            </div>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>
                            Match PO, receipt, and vendor bill to ensure you only pay for what was ordered and received.
                        </p>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            <span className="badge info">PO Verification</span>
                            <span className="badge warning">Receipt Check</span>
                        </div>
                    </motion.div>
                </div>
            </FeatureSection>

            {/* Logistics */}
            <FeatureSection icon={Truck} title="Logistics & Fulfillment" delay={0.4}>
                <div className="grid-2">
                    <div className="feature-list">
                        <FeatureItem
                            icon={Truck}
                            title="Drop Shipping"
                            description="Ship directly from vendor to customer without handling inventory"
                            delay={0.1}
                        />
                        <FeatureItem
                            icon={Package}
                            title="Direct Delivery"
                            description="Route shipments directly to your warehouse or specified location"
                            delay={0.15}
                        />
                    </div>

                    <motion.div
                        className="card"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4, delay: 0.5 }}
                        style={{
                            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1))',
                            border: '1px solid rgba(99, 102, 241, 0.3)'
                        }}
                    >
                        <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <CheckCircle size={20} color="var(--accent-primary)" />
                            Drop Shipping Benefits
                        </h3>
                        <ul style={{
                            color: 'var(--text-secondary)',
                            fontSize: '0.9rem',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px'
                        }}>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{
                                    width: '6px',
                                    height: '6px',
                                    borderRadius: '50%',
                                    background: 'var(--accent-primary)'
                                }} />
                                Reduce inventory carrying costs
                            </li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{
                                    width: '6px',
                                    height: '6px',
                                    borderRadius: '50%',
                                    background: 'var(--accent-secondary)'
                                }} />
                                Faster fulfillment for remote customers
                            </li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{
                                    width: '6px',
                                    height: '6px',
                                    borderRadius: '50%',
                                    background: 'var(--accent-tertiary)'
                                }} />
                                Automatic tracking and notifications
                            </li>
                            <li style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{
                                    width: '6px',
                                    height: '6px',
                                    borderRadius: '50%',
                                    background: 'var(--success)'
                                }} />
                                Integrated vendor performance metrics
                            </li>
                        </ul>
                    </motion.div>
                </div>
            </FeatureSection>

            {/* IT Services */}
            <FeatureSection icon={Cloud} title="IT Services & Software" delay={0.5}>
                <div className="grid-2">
                    <Link to="/purchase/subscriptions" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <motion.div className="card" whileHover={{ scale: 1.02 }} style={{ cursor: 'pointer' }}>
                            <div className="card-header">
                                <div className="card-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6, #d946ef)' }}>
                                    <Cloud size={24} />
                                </div>
                                <div>
                                    <h3 className="card-title">SaaS Subscriptions</h3>
                                    <p className="card-subtitle">Manage recurring software costs</p>
                                </div>
                            </div>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>
                                Track license renewal dates, usage, and monthly spend across all your software subscriptions.
                            </p>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                <span className="badge" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>Renewal Alerts</span>
                                <span className="badge" style={{ background: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6' }}>Cost Tracking</span>
                            </div>
                        </motion.div>
                    </Link>

                    <motion.div className="card" whileHover={{ scale: 1.02 }}>
                        <div className="card-header">
                            <div className="card-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #f97316)' }}>
                                <ClipboardCheck size={24} />
                            </div>
                            <div>
                                <h3 className="card-title">Service Entry Sheets</h3>
                                <p className="card-subtitle">Track intangible deliverables</p>
                            </div>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '16px' }}>
                            Verify completion of consulting hours, milestones, or project phases before approving payments.
                        </p>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            <span className="badge warning">Milestone Check</span>
                            <span className="badge warning">Timesheets</span>
                        </div>
                    </motion.div>
                </div>
            </FeatureSection>

            <PageHelp
                title="Purchase Module Overview"
                description="Your central hub for all procurement activities."
                shortcuts={[
                    { keys: ['G', 'V'], action: 'Go to Vendors' },
                    { keys: ['G', 'P'], action: 'Go to Purchase Orders' }
                ]}
                walkthroughSteps={[
                    { title: 'Workflow Diagram', description: 'Visualizes the flow from RFQ to Payment.' },
                    { title: 'Key Features', description: 'Highlights important capabilities like 3-Way Matching.' },
                    { title: 'Logistics', description: 'Learn about Drop Shipping and Delivery options.' }
                ]}
                videoUrl="#"
            />
        </div>
    )
}

export default Purchase


