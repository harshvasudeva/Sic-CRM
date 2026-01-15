import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
    FileText,
    ShoppingBag,
    Receipt,
    ArrowUpCircle,
    ArrowDownCircle,
    Percent,
    Target,
    Layers
} from 'lucide-react'

function Sales() {
    return (
        <div className="page">
            <motion.div className="page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <div>
                    <h1 className="page-title"><span className="gradient-text">Sales</span> Module</h1>
                    <p className="page-description">
                        Manage complete sales cycle from lead to payment. Create quotations,
                        convert them to orders, generate invoices, and process payments seamlessly.
                    </p>
                </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <h3 style={{ marginBottom: '16px', color: 'var(--text-secondary)' }}>Quick Access</h3>
                <div className="sales-cards-grid">
                    <Link to="/sales/quotations" className="sales-card">
                        <div className="sales-card-icon" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                            <FileText size={24} />
                        </div>
                        <div className="sales-card-content">
                            <h4 className="sales-card-title">Quotations</h4>
                            <p className="sales-card-subtitle">Create and manage quotes</p>
                        </div>
                    </Link>

                    <Link to="/sales/orders" className="sales-card">
                        <div className="sales-card-icon" style={{ background: 'linear-gradient(135deg, #10b981, #34d399)' }}>
                            <ShoppingBag size={24} />
                        </div>
                        <div className="sales-card-content">
                            <h4 className="sales-card-title">Sales Orders</h4>
                            <p className="sales-card-subtitle">Process and track orders</p>
                        </div>
                    </Link>

                    <Link to="/sales/invoices" className="sales-card">
                        <div className="sales-card-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #fb923c)' }}>
                            <Receipt size={24} />
                        </div>
                        <div className="sales-card-content">
                            <h4 className="sales-card-title">Invoices</h4>
                            <p className="sales-card-subtitle">Bill and track payments</p>
                        </div>
                    </Link>

                    <Link to="/sales/credit-notes" className="sales-card">
                        <div className="sales-card-icon" style={{ background: 'linear-gradient(135deg, #ef4444, #f87171)' }}>
                            <ArrowDownCircle size={24} />
                        </div>
                        <div className="sales-card-content">
                            <h4 className="sales-card-title">Credit Notes</h4>
                            <p className="sales-card-subtitle">Refunds and returns</p>
                        </div>
                    </Link>

                    <Link to="/sales/quotations/templates" className="sales-card">
                        <div className="sales-card-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)' }}>
                            <Layers size={24} />
                        </div>
                        <div className="sales-card-content">
                            <h4 className="sales-card-title">Quote Templates</h4>
                            <p className="sales-card-subtitle">Reusable quote templates</p>
                        </div>
                    </Link>

                    <Link to="/sales/invoices/templates" className="sales-card">
                        <div className="sales-card-icon" style={{ background: 'linear-gradient(135deg, #06b6d4, #22d3ee)' }}>
                            <Layers size={24} />
                        </div>
                        <div className="sales-card-content">
                            <h4 className="sales-card-title">Invoice Templates</h4>
                            <p className="sales-card-subtitle">Reusable invoice templates</p>
                        </div>
                    </Link>

                    <Link to="/sales/pricing" className="sales-card">
                        <div className="sales-card-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #fbbf24)' }}>
                            <Percent size={24} />
                        </div>
                        <div className="sales-card-content">
                            <h4 className="sales-card-title">Pricing Rules</h4>
                            <p className="sales-card-subtitle">Configure discounts</p>
                        </div>
                    </Link>

                    <Link to="/sales/targets" className="sales-card">
                        <div className="sales-card-icon" style={{ background: 'linear-gradient(135deg, #10b981, #34d399)' }}>
                            <Target size={24} />
                        </div>
                        <div className="sales-card-content">
                            <h4 className="sales-card-title">Sales Targets</h4>
                            <p className="sales-card-subtitle">Track goals and quotas</p>
                        </div>
                    </Link>
                </div>
            </motion.div>

            <style>{`
                .sales-cards-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 16px;
                    margin-bottom: 32px;
                }
                .sales-card {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 20px;
                    background: var(--bg-card);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-md);
                    text-decoration: none;
                    color: inherit;
                    transition: all 0.2s ease;
                }
                .sales-card:hover {
                    transform: translateY(-2px);
                    border-color: var(--accent-primary);
                    box-shadow: 0 8px 24px rgba(99, 102, 241, 0.15);
                }
                .sales-card-icon {
                    width: 56px;
                    height: 56px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    flex-shrink: 0;
                }
                .sales-card-content {
                    flex: 1;
                }
                .sales-card-title {
                    margin: 0 0 4px 0;
                    font-size: 1rem;
                    font-weight: 600;
                    color: var(--text-primary);
                }
                .sales-card-subtitle {
                    margin: 0;
                    font-size: 0.85rem;
                    color: var(--text-muted);
                }
            `}</style>
        </div>
    )
}

export default Sales
