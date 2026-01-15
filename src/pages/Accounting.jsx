import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
    FileText,
    PiggyBank,
    BarChart3,
    Calculator,
    TrendingUp,
    CreditCard,
    Building,
    Globe,
    Calendar,
    Wallet,
    Receipt,
    FileSpreadsheet,
    Users,
    DollarSign,
    AlertTriangle,
    CheckCircle
} from 'lucide-react'
import { getAccountingStats } from '../stores/accountingStore'

function Accounting() {
    const [stats, setStats] = useState({})

    useEffect(() => {
        setStats(getAccountingStats())
    }, [])

    const features = [
        {
            id: 'journal',
            title: 'Journal Entries',
            icon: FileText,
            description: 'Record financial transactions with debit/credit entries',
            link: '/accounting/journal',
            color: 'linear-gradient(135deg, #6366f1, #8b5cf6)'
        },
        {
            id: 'bank',
            title: 'Bank & Cash',
            icon: PiggyBank,
            description: 'Live bank balances and cash position across all accounts',
            link: '/accounting/bank',
            color: 'linear-gradient(135deg, #10b981, #34d399)'
        },
        {
            id: 'ar',
            title: 'Accounts Receivable',
            icon: Wallet,
            description: 'Track customer invoices and outstanding balances',
            link: '/accounting/receivable',
            color: 'linear-gradient(135deg, #f59e0b, #fb923c)'
        },
        {
            id: 'ap',
            title: 'Accounts Payable',
            icon: CreditCard,
            description: 'Manage vendor payments and outstanding bills',
            link: '/accounting/payable',
            color: 'linear-gradient(135deg, #ef4444, #f87171)'
        },
        {
            id: 'expenses',
            title: 'Expenses',
            icon: Receipt,
            description: 'Track and categorize business expenses',
            link: '/accounting/expenses',
            color: 'linear-gradient(135deg, #8b5cf6, #a78bfa)'
        },
        {
            id: 'reports',
            title: 'Financial Reports',
            icon: BarChart3,
            description: 'Balance sheet, P&L, cash flow statements',
            link: '/accounting/reports',
            color: 'linear-gradient(135deg, #06b6d4, #22d3ee)'
        },
        {
            id: 'cost-centers',
            title: 'Cost Centers',
            icon: Users,
            description: 'Track expenses by department/project',
            link: '/accounting/cost-centers',
            color: 'linear-gradient(135deg, #8b5cf6, #a78bfa)'
        },
        {
            id: 'budgets',
            title: 'Budgets',
            icon: Calculator,
            description: 'Create and monitor departmental budgets',
            link: '/accounting/budgets',
            color: 'linear-gradient(135deg, #10b981, #34d399)'
        },
        {
            id: 'chart',
            title: 'Chart of Accounts',
            icon: FileSpreadsheet,
            description: 'Manage general ledger account structure',
            link: '/accounting/chart',
            color: 'linear-gradient(135deg, #f59e0b, #fbbf24)'
        },
        {
            id: 'assets',
            title: 'Fixed Assets',
            icon: Building,
            description: 'Track depreciable assets and calculations',
            link: '/accounting/assets',
            color: 'linear-gradient(135deg, #06b6d4, #22d3ee)'
        }
    ]

    const summaryCards = [
        {
            title: 'Total Expenses',
            value: `$${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(stats.totalExpenses || 0)}`,
            icon: Receipt,
            color: 'linear-gradient(135deg, #ef4444, #f87171)',
            change: `${stats.paidExpenses > 0 ? '+' : ''}$${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(stats.paidExpenses)}`,
            changePositive: true
        },
        {
            title: 'Bank Balance',
            value: `$${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(stats.totalBankBalance || 0)}`,
            icon: PiggyBank,
            color: 'linear-gradient(135deg, #10b981, #34d399)'
        },
        {
            title: 'Accounts Receivable',
            value: `$${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(stats.totalAccountsReceivable || 0)}`,
            icon: Wallet,
            color: 'linear-gradient(135deg, #f59e0b, #fb923c)',
            change: `$${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(stats.overdueReceivable || 0)}`,
            changePositive: false
        },
        {
            title: 'Accounts Payable',
            value: `$${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(stats.totalAccountsPayable || 0)}`,
            icon: CreditCard,
            color: 'linear-gradient(135deg, #ef4444, #f87171)'
        }
    ]

    return (
        <div className="page">
            <motion.div className="page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <div>
                    <h1 className="page-title"><span className="gradient-text">Accounting</span> & Finance</h1>
                    <p className="page-description">
                        Complete financial management from daily transactions to complex reporting.
                    </p>
                </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <h3 style={{ marginBottom: '20px', color: 'var(--text-secondary)' }}>Financial Overview</h3>
                <div className="summary-cards">
                    {summaryCards.map((card, index) => (
                        <motion.div
                            key={card.title}
                            className="summary-card"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            style={{ '--card-gradient': card.color }}
                        >
                            <div className="card-header">
                                <card.icon size={24} className="card-icon" />
                                <span className="card-title">{card.title}</span>
                            </div>
                            <div className="card-value">{card.value}</div>
                            {card.change && (
                                <div className={`card-change ${card.changePositive ? 'positive' : 'negative'}`}>
                                    <TrendingUp size={14} />
                                    <span>{card.change}</span>
                                </div>
                            )}
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <h3 style={{ marginBottom: '20px', color: 'var(--text-secondary)' }}>Accounting Modules</h3>
                <div className="features-grid">
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Link to={feature.link} className="feature-card">
                                <div className="feature-icon" style={{ background: feature.color }}>
                                    <feature.icon size={32} />
                                </div>
                                <h4 className="feature-title">{feature.title}</h4>
                                <p className="feature-description">{feature.description}</p>
                                <div className="feature-arrow">
                                    <DollarSign size={20} />
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            <style>{`
                .summary-cards {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 16px;
                    margin-bottom: 32px;
                }
                .summary-card {
                    padding: 20px;
                    background: var(--bg-card);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-md);
                    transition: all 0.3s ease;
                }
                .summary-card:hover {
                    border-color: var(--accent-primary);
                    transform: translateY(-4px);
                    box-shadow: 0 12px 32px rgba(99, 102, 241, 0.15);
                }
                .card-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 12px;
                }
                .card-icon {
                    color: white;
                }
                .card-title {
                    font-size: 0.9rem;
                    color: var(--text-secondary);
                }
                .card-value {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: var(--text-primary);
                    margin-bottom: 8px;
                }
                .card-change {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    font-size: 0.85rem;
                }
                .card-change.positive { color: var(--success); }
                .card-change.negative { color: var(--error); }
                .features-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                    gap: 16px;
                }
                .feature-card {
                    display: block;
                    padding: 24px;
                    background: var(--bg-card);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-lg);
                    text-decoration: none;
                    color: inherit;
                    transition: all 0.2s ease;
                }
                .feature-card:hover {
                    border-color: var(--accent-primary);
                    transform: translateY(-2px);
                    box-shadow: 0 8px 24px rgba(99, 102, 241, 0.15);
                }
                .feature-icon {
                    width: 64px;
                    height: 64px;
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    margin-bottom: 16px;
                }
                .feature-title {
                    font-size: 1.1rem;
                    font-weight: 600;
                    color: var(--text-primary);
                    margin-bottom: 8px;
                }
                .feature-description {
                    font-size: 0.85rem;
                    color: var(--text-muted);
                    line-height: 1.5;
                }
                .feature-arrow {
                    display: flex;
                    align-items: center;
                    justify-content: flex-end;
                    margin-top: 16px;
                    color: var(--text-muted);
                }
            `}</style>
        </div>
    )
}

export default Accounting
