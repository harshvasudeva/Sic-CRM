import { motion } from 'framer-motion'
import {
    TrendingUp,
    TrendingDown,
    Package,
    DollarSign,
    Users,
    ShoppingCart,
    Layers,
    BarChart3
} from 'lucide-react'
import DataTable from '../components/DataTable'
import MiniChart from '../components/MiniChart'

// Sample data for the table
const ordersData = [
    { id: 'ORD-001', customer: 'Acme Corp', product: 'Widget Pro', quantity: 50, amount: 2500, status: 'Delivered', date: '2026-01-14' },
    { id: 'ORD-002', customer: 'TechStart Inc', product: 'Gadget X', quantity: 25, amount: 1250, status: 'Processing', date: '2026-01-14' },
    { id: 'ORD-003', customer: 'Global Retail', product: 'Device Plus', quantity: 100, amount: 5000, status: 'Shipped', date: '2026-01-13' },
    { id: 'ORD-004', customer: 'Smart Solutions', product: 'Widget Pro', quantity: 75, amount: 3750, status: 'Delivered', date: '2026-01-13' },
    { id: 'ORD-005', customer: 'DataFlow Ltd', product: 'Gadget X', quantity: 30, amount: 1500, status: 'Pending', date: '2026-01-12' },
    { id: 'ORD-006', customer: 'CloudNine', product: 'Device Plus', quantity: 45, amount: 2250, status: 'Delivered', date: '2026-01-12' },
    { id: 'ORD-007', customer: 'NextGen Tech', product: 'Widget Pro', quantity: 60, amount: 3000, status: 'Processing', date: '2026-01-11' },
    { id: 'ORD-008', customer: 'Alpha Industries', product: 'Gadget X', quantity: 20, amount: 1000, status: 'Shipped', date: '2026-01-11' },
    { id: 'ORD-009', customer: 'Beta Corp', product: 'Device Plus', quantity: 80, amount: 4000, status: 'Delivered', date: '2026-01-10' },
    { id: 'ORD-010', customer: 'Gamma LLC', product: 'Widget Pro', quantity: 35, amount: 1750, status: 'Pending', date: '2026-01-10' },
    { id: 'ORD-011', customer: 'Delta Systems', product: 'Gadget X', quantity: 55, amount: 2750, status: 'Delivered', date: '2026-01-09' },
    { id: 'ORD-012', customer: 'Epsilon Inc', product: 'Device Plus', quantity: 40, amount: 2000, status: 'Processing', date: '2026-01-09' },
]

const columns = [
    { key: 'id', label: 'Order ID' },
    { key: 'customer', label: 'Customer' },
    { key: 'product', label: 'Product' },
    { key: 'quantity', label: 'Qty' },
    {
        key: 'amount',
        label: 'Amount',
        render: (value) => `$${value.toLocaleString()}`
    },
    {
        key: 'status',
        label: 'Status',
        render: (value) => (
            <span className={`status-badge ${value.toLowerCase()}`}>
                {value}
            </span>
        )
    },
    { key: 'date', label: 'Date' }
]

// Sample chart data
const revenueData = [120, 150, 180, 140, 200, 250, 220, 280, 260, 310, 290, 350]
const ordersChartData = [45, 52, 48, 61, 55, 67, 72, 68, 75, 82, 78, 88]
const customersData = [20, 25, 22, 30, 28, 35, 40, 38, 42, 48, 45, 52]

const stats = [
    {
        icon: DollarSign,
        label: 'Revenue',
        value: '$48,250',
        change: '+12.5%',
        up: true,
        color: 'green',
        chartData: revenueData,
        chartColor: '#10b981'
    },
    {
        icon: ShoppingCart,
        label: 'Orders',
        value: '847',
        change: '+8.2%',
        up: true,
        color: 'blue',
        chartData: ordersChartData,
        chartColor: '#3b82f6'
    },
    {
        icon: Users,
        label: 'Customers',
        value: '2,847',
        change: '+15.3%',
        up: true,
        color: 'purple',
        chartData: customersData,
        chartColor: '#8b5cf6'
    },
    {
        icon: Package,
        label: 'Products',
        value: '156',
        change: '-2.4%',
        up: false,
        color: 'orange',
        chartData: [50, 48, 52, 45, 47, 44, 46, 42, 45, 43, 41, 40],
        chartColor: '#f59e0b'
    },
]

function Reports() {
    return (
        <div className="page">
            <motion.div
                className="page-header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="page-title">
                    <span className="gradient-text">Reports</span> & Analytics
                </h1>
                <p className="page-description">
                    View detailed analytics, export data, and track performance metrics across your business.
                </p>
            </motion.div>

            {/* Stats with Charts */}
            <div className="reports-stats-grid">
                {stats.map((stat, index) => (
                    <motion.div
                        key={index}
                        className="reports-stat-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <div className="reports-stat-header">
                            <div className={`reports-stat-icon ${stat.color}`}>
                                <stat.icon size={20} />
                            </div>
                            <div className={`reports-stat-change ${stat.up ? 'up' : 'down'}`}>
                                {stat.up ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                                {stat.change}
                            </div>
                        </div>
                        <div className="reports-stat-value">{stat.value}</div>
                        <div className="reports-stat-label">{stat.label}</div>
                        <div className="reports-stat-chart">
                            <MiniChart data={stat.chartData} color={stat.chartColor} height={40} />
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Bar Charts */}
            <motion.div
                className="section"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <div className="section-header">
                    <BarChart3 className="section-icon" size={24} />
                    <h2 className="section-title">Performance Overview</h2>
                </div>

                <div className="grid-2">
                    <div className="card">
                        <h3 style={{ marginBottom: '16px' }}>Monthly Revenue</h3>
                        <MiniChart data={revenueData} type="bar" color="#6366f1" height={100} />
                    </div>
                    <div className="card">
                        <h3 style={{ marginBottom: '16px' }}>Order Volume</h3>
                        <MiniChart data={ordersChartData} type="bar" color="#10b981" height={100} />
                    </div>
                </div>
            </motion.div>

            {/* Data Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <div className="section-header" style={{ marginBottom: '24px' }}>
                    <Layers className="section-icon" size={24} />
                    <h2 className="section-title">Recent Orders</h2>
                </div>

                <DataTable
                    columns={columns}
                    data={ordersData}
                    title="Orders"
                    searchable={true}
                    exportable={true}
                />
            </motion.div>

            <style>{`
        .reports-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 32px;
        }

        @media (max-width: 1200px) {
          .reports-stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 600px) {
          .reports-stats-grid {
            grid-template-columns: 1fr;
          }
        }

        .reports-stat-card {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          padding: 20px;
        }

        .reports-stat-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .reports-stat-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .reports-stat-icon.green { background: linear-gradient(135deg, #10b981, #34d399); }
        .reports-stat-icon.blue { background: linear-gradient(135deg, #3b82f6, #06b6d4); }
        .reports-stat-icon.purple { background: linear-gradient(135deg, #8b5cf6, #a855f7); }
        .reports-stat-icon.orange { background: linear-gradient(135deg, #f59e0b, #fb923c); }

        .reports-stat-change {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.8rem;
          font-weight: 500;
          padding: 4px 8px;
          border-radius: 12px;
        }

        .reports-stat-change.up {
          background: rgba(16, 185, 129, 0.15);
          color: var(--success);
        }

        .reports-stat-change.down {
          background: rgba(239, 68, 68, 0.15);
          color: var(--error);
        }

        .reports-stat-value {
          font-size: 1.75rem;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .reports-stat-label {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-bottom: 16px;
        }

        .reports-stat-chart {
          border-top: 1px solid var(--border-color);
          padding-top: 16px;
        }

        .status-badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .status-badge.delivered {
          background: rgba(16, 185, 129, 0.15);
          color: var(--success);
        }

        .status-badge.processing {
          background: rgba(59, 130, 246, 0.15);
          color: var(--info);
        }

        .status-badge.shipped {
          background: rgba(139, 92, 246, 0.15);
          color: #8b5cf6;
        }

        .status-badge.pending {
          background: rgba(245, 158, 11, 0.15);
          color: var(--warning);
        }
      `}</style>
        </div>
    )
}

export default Reports
