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
    Globe
} from 'lucide-react'
import ModuleCard from '../components/ModuleCard'
import { formatCurrency } from '../stores/settingsStore'

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



function Dashboard() {
    const stats = [
        { icon: TrendingUp, label: 'Active Leads', value: '2,847', color: 'purple' },
        { icon: Banknote, label: 'Revenue MTD', value: formatCurrency(485000), color: 'green' },
        { icon: BarChart3, label: 'Orders Today', value: '156', color: 'blue' },
        { icon: Globe, label: 'Countries', value: '45+', color: 'orange' }
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
                        </div>
                    </motion.div>
                ))}
            </div>

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
