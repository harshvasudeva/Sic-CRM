import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import DataTable from '../../components/DataTable'
import { getAccountsPayable } from '../../stores/accountingStore'
import { formatCurrency } from '../../stores/settingsStore'

function AccountsPayable() {
    const [apData, setApData] = useState([])

    useEffect(() => {
        loadData()
    }, [])

    const loadData = () => {
        setApData(getAccountsPayable())
    }

    const getAgingCategory = (days) => {
        if (days <= 30) return { label: 'Current', color: 'current' }
        if (days <= 60) return { label: '1-30 Days', color: 'day30' }
        if (days <= 90) return { label: '31-60 Days', color: 'day60' }
        return { label: '60+ Days', color: 'day90' }
    }

    const getDaysOverdue = (dueDate) => {
        const today = new Date()
        const due = new Date(dueDate)
        const diff = Math.floor((today - due) / (1000 * 60 * 60 * 24))
        return Math.max(0, diff)
    }

    const columns = [
        { key: 'invoiceNumber', label: 'Invoice #', render: (v) => <span className="invoice-number">{v}</span> },
        { key: 'vendorName', label: 'Vendor', render: (v) => <span className="vendor-name">{v}</span> },
        { key: 'invoiceDate', label: 'Invoice Date', render: (v) => <span>{new Date(v).toLocaleDateString()}</span> },
        { key: 'dueDate', label: 'Due Date', render: (v) => <span>{new Date(v).toLocaleDateString()}</span> },
        { key: 'amount', label: 'Amount', render: (v) => <span className="amount">{formatCurrency(v || 0)}</span> },
        { key: 'balance', label: 'Balance Due', render: (v) => <span className="balance">{formatCurrency(v || 0)}</span> },
        {
            key: 'dueDate', label: 'Aging', render: (_, row) => {
                const days = getDaysOverdue(row.dueDate)
                const category = getAgingCategory(days)
                return <span className={`aging-badge ${category.color}`}>{category.label}</span>
            }
        },
        {
            key: 'status', label: 'Status', render: (v) => (
                <span className={`status-badge ${v}`}>{v}</span>
            )
        }
    ]

    const totalAP = apData.reduce((sum, item) => sum + item.balance, 0)
    const overdueAmount = apData.reduce((sum, item) => {
        const days = getDaysOverdue(item.dueDate)
        return sum + (days > 0 ? item.balance : 0)
    }, 0)

    return (
        <div className="page">
            <motion.div className="page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <div>
                    <h1 className="page-title"><span className="gradient-text">Accounts</span> Payable</h1>
                    <p className="page-description">
                        Track outstanding vendor invoices and aging analysis.
                    </p>
                </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <div className="stats-row">
                    <div className="stat-card">
                        <div className="stat-label">Total Payable</div>
                        <div className="stat-value">{formatCurrency(totalAP)}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Overdue Amount</div>
                        <div className="stat-value warning">{formatCurrency(overdueAmount)}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-label">Open Invoices</div>
                        <div className="stat-value">{apData.length}</div>
                    </div>
                </div>

                <DataTable columns={columns} data={apData} searchable exportable />
            </motion.div>

            <style>{`
                .stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }
                .stat-card { padding: 20px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); }
                .stat-label { font-size: 0.85rem; color: var(--text-muted); margin-bottom: 8px; }
                .stat-value { font-size: 1.5rem; font-weight: 700; color: var(--text-primary); }
                .stat-value.warning { color: var(--warning); }
                .invoice-number { font-family: 'JetBrains Mono', monospace; font-weight: 600; color: var(--accent-primary); }
                .vendor-name { font-weight: 600; color: var(--text-primary); }
                .amount { font-weight: 600; color: var(--text-secondary); }
                .balance { font-weight: 700; color: var(--error); }
                .aging-badge { padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; text-transform: capitalize; }
                .aging-badge.current { background: rgba(34, 197, 94, 0.15); color: #22c55e; }
                .aging-badge.day30 { background: rgba(251, 191, 36, 0.15); color: #fbbf24; }
                .aging-badge.day60 { background: rgba(249, 115, 22, 0.15); color: #f97316; }
                .aging-badge.day90 { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
                .status-badge { padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; text-transform: capitalize; }
                .status-badge.open { background: rgba(59, 130, 246, 0.15); color: #3b82f6; }
                .status-badge.paid { background: rgba(34, 197, 94, 0.15); color: #22c55e; }
                .status-badge.overdue { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
            `}</style>
        </div>
    )
}

export default AccountsPayable