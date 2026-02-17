import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    ShoppingCart,
    Package,
    Truck,
    Calculator,
    Users,
    UserCircle,
    Factory,
    Sparkles,
    TrendingUp,
    Banknote,
    BarChart3,
    Globe,
    AlertCircle,
    Clock,
    FileText,
    ArrowUpRight,
    ArrowDownRight,
    ArrowRightLeft,
    RefreshCw
} from 'lucide-react'
import ModuleCard from '../components/ModuleCard'
import { formatCurrency } from '../stores/settingsStore'
import { getDashboardStats } from '../stores/salesStore'
import {
    getSupportedCurrencies, getBaseCurrency, getDisplayCurrency,
    convertCurrency, formatCurrency as formatCurrStore, refreshRates, getExchangeRate
} from '../stores/currencyStore'

const modules = [
    {
        icon: ShoppingCart,
        title: 'Sales',
        description: 'Manage your sales pipeline from quotation to payment with powerful invoicing and reporting tools.',
        features: ['Quotations', 'Invoicing', 'Sales Teams', 'Analytics'],
        path: '/sales',
        color: 'linear-gradient(135deg, #6366f1, #8b5cf6)'
    },
    {
        icon: Package,
        title: 'Products',
        description: 'Comprehensive product management with variants, price lists, and loyalty programs.',
        features: ['Variants', 'Price Lists', 'Loyalty', 'Inventory'],
        path: '/products',
        color: 'linear-gradient(135deg, #3b82f6, #06b6d4)'
    },
    {
        icon: Truck,
        title: 'Purchase',
        description: 'Streamline procurement with RFQs, purchase orders, and vendor bill management.',
        features: ['RFQs', 'Bill Matching', 'Drop Ship', '3-Way Match'],
        path: '/purchase',
        color: 'linear-gradient(135deg, #10b981, #34d399)'
    },
    {
        icon: Calculator,
        title: 'Accounting',
        description: 'Full-featured accounting with real-time dashboards, reporting, and multi-country support.',
        features: ['Journals', 'Assets', 'Reports', 'Localization'],
        path: '/accounting',
        color: 'linear-gradient(135deg, #f59e0b, #fb923c)'
    },
    {
        icon: Users,
        title: 'CRM',
        description: 'Track leads and opportunities through customizable pipeline stages with AI-powered insights.',
        features: ['Pipeline', 'Lead Analysis', 'Map View', 'Probability'],
        path: '/crm',
        color: 'linear-gradient(135deg, #ec4899, #f472b6)'
    },
    {
        icon: UserCircle,
        title: 'HR & Employees',
        description: 'Complete HR management with employee profiles, org charts, contracts, and skill tracking.',
        features: ['Profiles', 'Org Chart', 'Contracts', 'Skills'],
        path: '/hr',
        color: 'linear-gradient(135deg, #8b5cf6, #a855f7)'
    },
    {
        icon: Factory,
        title: 'Manufacturing',
        description: 'Manufacturing and inventory management with BOMs, work centers, and stock operations.',
        features: ['BOM', 'Work Centers', 'Stock Moves', 'Routes'],
        path: '/manufacturing',
        color: 'linear-gradient(135deg, #06b6d4, #22d3ee)'
    },
    {
        icon: Sparkles,
        title: 'Specialized',
        description: 'Additional modules including POS, internal communication, rentals, and e-commerce.',
        features: ['POS', 'Discuss', 'Rental', 'Website'],
        path: '/specialized',
        color: 'linear-gradient(135deg, #f43f5e, #fb7185)'
    }
]

function CurrencyWidget() {
    const currencies = getSupportedCurrencies()
    const displayCurrency = getDisplayCurrency()
    // Default "From" to a different currency than display so the widget is useful
    const defaultFrom = displayCurrency === 'USD' ? 'EUR' : 'USD'
    const [fromCurr, setFromCurr] = useState(defaultFrom)
    const [toCurr, setToCurr] = useState(displayCurrency)
    const [amount, setAmount] = useState(1000)
    const [refreshing, setRefreshing] = useState(false)

    const converted = convertCurrency(amount, fromCurr, toCurr)
    const rate = getExchangeRate(fromCurr, toCurr)

    const handleRefresh = async () => {
        setRefreshing(true)
        await refreshRates()
        setRefreshing(false)
    }

    const swap = () => {
        setFromCurr(toCurr)
        setToCurr(fromCurr)
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            style={{ marginBottom: 24 }}
        >
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 12,
            }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    Currency Converter
                </h2>
                <button
                    onClick={handleRefresh}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        padding: '4px 10px', background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)', borderRadius: 6,
                        fontSize: '0.75rem', color: 'var(--text-muted)', cursor: 'pointer',
                    }}
                    disabled={refreshing}
                >
                    <RefreshCw size={12} className={refreshing ? 'spin-anim' : ''} />
                    {refreshing ? 'Updating...' : 'Refresh'}
                </button>
            </div>

            <div style={{
                display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
                padding: 16, background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
                borderRadius: 12,
            }}>
                {/* Amount input */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Amount</label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value) || 0)}
                        style={{
                            width: 120, padding: '8px 12px', background: 'var(--bg-tertiary)',
                            border: '1px solid var(--border-color)', borderRadius: 8,
                            color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 600,
                        }}
                    />
                </div>

                {/* From currency */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>From</label>
                    <select
                        value={fromCurr}
                        onChange={(e) => setFromCurr(e.target.value)}
                        style={{
                            padding: '8px 12px', background: 'var(--bg-tertiary)',
                            border: '1px solid var(--border-color)', borderRadius: 8,
                            color: 'var(--text-primary)', fontSize: '0.9rem',
                        }}
                    >
                        {currencies.map(c => (
                            <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>
                        ))}
                    </select>
                </div>

                {/* Swap button */}
                <button
                    onClick={swap}
                    style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: 'var(--accent-gradient)', color: 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: 'none', cursor: 'pointer', marginTop: 16,
                    }}
                >
                    <ArrowRightLeft size={16} />
                </button>

                {/* To currency */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>To</label>
                    <select
                        value={toCurr}
                        onChange={(e) => setToCurr(e.target.value)}
                        style={{
                            padding: '8px 12px', background: 'var(--bg-tertiary)',
                            border: '1px solid var(--border-color)', borderRadius: 8,
                            color: 'var(--text-primary)', fontSize: '0.9rem',
                        }}
                    >
                        {currencies.map(c => (
                            <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>
                        ))}
                    </select>
                </div>

                {/* Equals */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginLeft: 8 }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Result</label>
                    <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--accent-primary)' }}>
                        {formatCurrStore(converted, toCurr)}
                    </div>
                </div>

                {/* Rate info */}
                <div style={{
                    marginLeft: 'auto', padding: '6px 12px',
                    background: 'rgba(99, 102, 241, 0.1)', borderRadius: 8,
                    fontSize: '0.75rem', color: 'var(--accent-primary)',
                }}>
                    1 {fromCurr} = {rate.toFixed(4)} {toCurr}
                </div>
            </div>

            <style>{`
                @keyframes spin-anim {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .spin-anim {
                    animation: spin-anim 1s linear infinite;
                }
            `}</style>
        </motion.div>
    )
}

function Dashboard() {
    const [dashData, setDashData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let mounted = true
        async function fetchStats() {
            try {
                const data = await getDashboardStats()
                if (mounted) setDashData(data)
            } catch (e) {
                console.error('Dashboard stats fetch failed:', e)
            } finally {
                if (mounted) setLoading(false)
            }
        }
        fetchStats()
        // Refresh every 60 seconds
        const interval = setInterval(fetchStats, 60000)
        return () => { mounted = false; clearInterval(interval) }
    }, [])

    const stats = [
        {
            icon: TrendingUp,
            label: 'Active Leads',
            value: loading ? '...' : (dashData?.leads?.total_leads || 0).toLocaleString(),
            subtext: dashData?.leads?.new_leads_mtd ? `+${dashData.leads.new_leads_mtd} this month` : null,
            trend: dashData?.leads?.new_leads_mtd > 0 ? 'up' : null,
            color: 'purple'
        },
        {
            icon: Banknote,
            label: 'Revenue MTD',
            value: loading ? '...' : formatCurrency(dashData?.revenue?.revenue_mtd || 0),
            subtext: dashData?.revenue?.outstanding ? `${formatCurrency(dashData.revenue.outstanding)} outstanding` : null,
            trend: (dashData?.revenue?.revenue_mtd || 0) > 0 ? 'up' : null,
            color: 'green'
        },
        {
            icon: BarChart3,
            label: 'Orders',
            value: loading ? '...' : (dashData?.orders?.total_orders || 0).toLocaleString(),
            subtext: dashData?.orders?.orders_today ? `${dashData.orders.orders_today} today` : null,
            trend: (dashData?.orders?.orders_today || 0) > 0 ? 'up' : null,
            color: 'blue'
        },
        {
            icon: AlertCircle,
            label: 'Overdue Invoices',
            value: loading ? '...' : (dashData?.invoices?.overdue_invoices || 0).toLocaleString(),
            subtext: dashData?.invoices?.overdue_amount ? formatCurrency(dashData.invoices.overdue_amount) : null,
            trend: (dashData?.invoices?.overdue_invoices || 0) > 0 ? 'down' : null,
            color: 'orange'
        }
    ]

    return (
        <div className="page">
            <motion.div
                className="page-header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="page-title">
                    Welcome to <span className="gradient-text">Sic CRM</span>
                </h1>
                <p className="page-description">
                    Your comprehensive enterprise resource planning solution. Manage sales, products,
                    accounting, CRM, HR, manufacturing, and more from a single unified platform.
                </p>
            </motion.div>

            {/* Stats */}
            <div className="stats-grid">
                {stats.map((stat, index) => (
                    <motion.div
                        key={index}
                        className="stat-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                        <div className={`stat-icon ${stat.color}`}>
                            <stat.icon size={28} />
                        </div>
                        <div className="stat-content">
                            <h3>{stat.value}</h3>
                            <p>{stat.label}</p>
                            {stat.subtext && (
                                <span style={{
                                    fontSize: '0.75rem',
                                    color: stat.trend === 'up' ? 'var(--color-success)' : stat.trend === 'down' ? 'var(--color-error)' : 'var(--text-secondary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '2px',
                                    marginTop: '4px'
                                }}>
                                    {stat.trend === 'up' && <ArrowUpRight size={12} />}
                                    {stat.trend === 'down' && <ArrowDownRight size={12} />}
                                    {stat.subtext}
                                </span>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Currency Quick Convert Widget */}
            <CurrencyWidget />

            {/* Recent Activity & Quick Stats */}
            {dashData?.recentOrders?.length > 0 && (
                <motion.div
                    style={{ marginBottom: '24px' }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                >
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '16px', color: 'var(--text-primary)' }}>
                        Recent Orders
                    </h2>
                    <div style={{
                        display: 'grid',
                        gap: '8px'
                    }}>
                        {dashData.recentOrders.map((order, i) => (
                            <div key={order.id || i} style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '12px 16px',
                                background: 'var(--bg-secondary)',
                                borderRadius: '8px',
                                border: '1px solid var(--border-color)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <FileText size={16} style={{ color: 'var(--text-secondary)' }} />
                                    <div>
                                        <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                                            {order.order_number}
                                        </span>
                                        <span style={{ color: 'var(--text-secondary)', marginLeft: '8px', fontSize: '0.875rem' }}>
                                            {order.first_name} {order.last_name}
                                        </span>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <span style={{
                                        padding: '2px 8px',
                                        borderRadius: '4px',
                                        fontSize: '0.75rem',
                                        fontWeight: 500,
                                        background: order.status === 'delivered' ? 'var(--color-success-bg)' :
                                                    order.status === 'confirmed' ? 'var(--color-info-bg)' :
                                                    'var(--color-warning-bg)',
                                        color: order.status === 'delivered' ? 'var(--color-success)' :
                                               order.status === 'confirmed' ? 'var(--color-info)' :
                                               'var(--color-warning)'
                                    }}>
                                        {order.status}
                                    </span>
                                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                                        {formatCurrency(order.total_amount)}
                                    </span>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <Clock size={12} />
                                        {new Date(order.created_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Module Cards */}
            <motion.h2
                style={{
                    fontSize: '1.5rem',
                    fontWeight: 600,
                    marginBottom: '24px',
                    color: 'var(--text-primary)'
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
            >
                Modules
            </motion.h2>

            <div className="module-grid">
                {modules.map((module, index) => (
                    <ModuleCard
                        key={module.path}
                        {...module}
                        delay={0.1 + index * 0.05}
                    />
                ))}
            </div>
        </div>
    )
}

export default Dashboard
