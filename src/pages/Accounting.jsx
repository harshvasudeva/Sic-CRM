import { motion } from 'framer-motion'
import {
    Calculator,
    LayoutDashboard,
    FileText,
    Building,
    PiggyBank,
    BarChart3,
    Globe,
    AlertCircle,
    Clock,
    CreditCard,
    TrendingUp,
    FileSpreadsheet
} from 'lucide-react'
import FeatureSection from '../components/FeatureSection'
import FeatureItem from '../components/FeatureItem'

const reports = [
    { name: 'Balance Sheet', description: 'Assets, liabilities, and equity snapshot' },
    { name: 'Profit & Loss', description: 'Income and expense summary' },
    { name: 'General Ledger', description: 'Complete transaction history' },
    { name: 'Trial Balance', description: 'Debit/credit verification' }
]

const countries = [
    'Belgium', 'Colombia', 'France', 'Germany', 'India', 'USA', 'UK', 'Spain'
]

function Accounting() {
    return (
        <div className="page">
            <motion.div
                className="page-header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="page-title">
                    <span className="gradient-text">Accounting</span> Module
                </h1>
                <p className="page-description">
                    A comprehensive accounting system described as an "ocean" due to its scale.
                    Manage everything from daily transactions to complex financial reporting.
                </p>
            </motion.div>

            {/* Dashboard Features */}
            <FeatureSection icon={LayoutDashboard} title="Dashboard Features" delay={0.2}>
                <div className="grid-3">
                    <motion.div
                        className="card"
                        whileHover={{ scale: 1.02 }}
                        style={{ borderLeft: '3px solid var(--error)' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                            <AlertCircle size={24} color="var(--error)" />
                            <h4>Unpaid Invoices</h4>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            Real-time visibility of outstanding customer invoices with aging analysis
                        </p>
                    </motion.div>

                    <motion.div
                        className="card"
                        whileHover={{ scale: 1.02 }}
                        style={{ borderLeft: '3px solid var(--warning)' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                            <Clock size={24} color="var(--warning)" />
                            <h4>Late Invoices</h4>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            Track overdue payments and automated reminder scheduling
                        </p>
                    </motion.div>

                    <motion.div
                        className="card"
                        whileHover={{ scale: 1.02 }}
                        style={{ borderLeft: '3px solid var(--success)' }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                            <CreditCard size={24} color="var(--success)" />
                            <h4>Bank & Cash</h4>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                            Live bank balances and cash position across all accounts
                        </p>
                    </motion.div>
                </div>
            </FeatureSection>

            <div className="grid-2">
                {/* Standard Operations */}
                <FeatureSection icon={FileText} title="Standard Operations" delay={0.3}>
                    <div className="feature-list">
                        <FeatureItem
                            icon={FileText}
                            title="Journal Entries"
                            description="Record financial transactions with debit/credit entries"
                            delay={0.1}
                        />
                        <FeatureItem
                            icon={FileSpreadsheet}
                            title="Journal Items"
                            description="Individual line items within journal entries"
                            delay={0.15}
                        />
                        <FeatureItem
                            icon={TrendingUp}
                            title="Credit Notes"
                            description="Issue credit memos for returns and adjustments"
                            delay={0.2}
                        />
                        <FeatureItem
                            icon={CreditCard}
                            title="Batch Payments"
                            description="Process multiple payments in a single transaction"
                            delay={0.25}
                        />
                    </div>
                </FeatureSection>

                {/* Asset & Loan Management */}
                <FeatureSection icon={Building} title="Asset & Loan Management" delay={0.4}>
                    <div className="feature-list">
                        <FeatureItem
                            icon={Building}
                            title="Fixed Assets"
                            description="Track organizational assets like laptops, vehicles, and buildings"
                            delay={0.1}
                        />
                        <FeatureItem
                            icon={Calculator}
                            title="Depreciation"
                            description="Automatic depreciation calculations and journal entries"
                            delay={0.15}
                        />
                        <FeatureItem
                            icon={PiggyBank}
                            title="Loan Tracking"
                            description="Manage loans with amortization schedules and interest calculations"
                            delay={0.2}
                        />
                    </div>
                </FeatureSection>
            </div>

            {/* Reporting Suite */}
            <FeatureSection icon={BarChart3} title="Reporting Suite" delay={0.5}>
                <div className="grid-4">
                    {reports.map((report, index) => (
                        <motion.div
                            key={index}
                            className="card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                            whileHover={{ scale: 1.03 }}
                            style={{ textAlign: 'center', padding: '24px' }}
                        >
                            <div style={{
                                width: '48px',
                                height: '48px',
                                margin: '0 auto 12px',
                                borderRadius: '12px',
                                background: 'var(--accent-gradient)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <FileSpreadsheet size={24} color="white" />
                            </div>
                            <h4 style={{ marginBottom: '8px' }}>{report.name}</h4>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                                {report.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </FeatureSection>

            {/* Localization */}
            <FeatureSection icon={Globe} title="Localization Support" delay={0.6}>
                <motion.div
                    className="card"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                >
                    <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
                        Country-specific reports, tax configurations, and compliance features for international operations:
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {countries.map((country, index) => (
                            <motion.span
                                key={country}
                                className="badge"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.8 + index * 0.05 }}
                            >
                                {country}
                            </motion.span>
                        ))}
                        <span className="badge" style={{ background: 'rgba(255,255,255,0.1)' }}>
                            + Many more
                        </span>
                    </div>
                </motion.div>
            </FeatureSection>
        </div>
    )
}

export default Accounting
