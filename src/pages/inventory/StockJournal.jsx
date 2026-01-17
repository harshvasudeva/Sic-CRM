import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Package,
    Plus,
    Search,
    Filter,
    Download,
    MoreVertical,
    Eye,
    Edit,
    Trash2,
    CheckCircle,
    Clock,
    ArrowUpDown,
    Warehouse,
    Calendar,
    FileText,
    TrendingUp,
    TrendingDown,
    RotateCcw
} from 'lucide-react'
import { useTallyShortcuts } from '../../hooks/useTallyShortcuts'

function StockJournal() {
    const [journals, setJournals] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [typeFilter, setTypeFilter] = useState('all')
    const [showCreateModal, setShowCreateModal] = useState(false)

    // Enable Tally shortcuts
    useTallyShortcuts({
        create: () => setShowCreateModal(true),
    })

    useEffect(() => {
        loadJournals()
    }, [])

    const loadJournals = () => {
        const stored = localStorage.getItem('sic-stock-journals')
        if (stored) {
            setJournals(JSON.parse(stored))
        } else {
            // Sample data
            const sampleData = [
                {
                    id: 'stk-001',
                    journalNumber: 'STK/2025-26/0001',
                    journalDate: '2026-01-15',
                    journalType: 'adjustment',
                    warehouseFromId: null,
                    warehouseToId: 'wh-001',
                    warehouseName: 'Main Warehouse',
                    reason: 'Physical count adjustment',
                    status: 'posted',
                    totalValue: 15000,
                    itemCount: 5,
                    createdAt: '2026-01-15'
                },
                {
                    id: 'stk-002',
                    journalNumber: 'STK/2025-26/0002',
                    journalDate: '2026-01-12',
                    journalType: 'transfer',
                    warehouseFromId: 'wh-001',
                    warehouseToId: 'wh-002',
                    warehouseName: 'Main → Branch A',
                    reason: 'Stock transfer to branch',
                    status: 'posted',
                    totalValue: 50000,
                    itemCount: 12,
                    createdAt: '2026-01-12'
                },
                {
                    id: 'stk-003',
                    journalNumber: 'STK/2025-26/0003',
                    journalDate: '2026-01-10',
                    journalType: 'write_off',
                    warehouseFromId: 'wh-001',
                    warehouseToId: null,
                    warehouseName: 'Main Warehouse',
                    reason: 'Expired/damaged goods',
                    status: 'posted',
                    totalValue: 8500,
                    itemCount: 3,
                    createdAt: '2026-01-10'
                },
                {
                    id: 'stk-004',
                    journalNumber: 'STK/2025-26/0004',
                    journalDate: '2026-01-08',
                    journalType: 'opening',
                    warehouseFromId: null,
                    warehouseToId: 'wh-002',
                    warehouseName: 'Branch A',
                    reason: 'Opening stock entry',
                    status: 'draft',
                    totalValue: 125000,
                    itemCount: 45,
                    createdAt: '2026-01-08'
                }
            ]
            setJournals(sampleData)
            localStorage.setItem('sic-stock-journals', JSON.stringify(sampleData))
        }
        setLoading(false)
    }

    const getTypeBadge = (type) => {
        const styles = {
            adjustment: { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: ArrowUpDown, label: 'Adjustment' },
            transfer: { bg: 'bg-purple-500/20', text: 'text-purple-400', icon: RotateCcw, label: 'Transfer' },
            write_off: { bg: 'bg-red-500/20', text: 'text-red-400', icon: TrendingDown, label: 'Write Off' },
            opening: { bg: 'bg-green-500/20', text: 'text-green-400', icon: TrendingUp, label: 'Opening' }
        }
        const style = styles[type] || styles.adjustment
        const Icon = style.icon
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
                <Icon size={12} />
                {style.label}
            </span>
        )
    }

    const getStatusBadge = (status) => {
        const styles = {
            draft: { bg: 'bg-gray-500/20', text: 'text-gray-400', icon: Clock },
            posted: { bg: 'bg-green-500/20', text: 'text-green-400', icon: CheckCircle }
        }
        const style = styles[status] || styles.draft
        const Icon = style.icon
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${style.bg} ${style.text}`}>
                <Icon size={12} />
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        )
    }

    const filteredJournals = journals.filter(journal => {
        const matchesSearch =
            journal.journalNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            journal.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
            journal.warehouseName.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesType = typeFilter === 'all' || journal.journalType === typeFilter
        return matchesSearch && matchesType
    })

    const stats = {
        total: journals.length,
        adjustments: journals.filter(j => j.journalType === 'adjustment').length,
        transfers: journals.filter(j => j.journalType === 'transfer').length,
        writeOffs: journals.filter(j => j.journalType === 'write_off').length,
        totalValue: journals.filter(j => j.status === 'posted').reduce((sum, j) => sum + j.totalValue, 0),
        draftCount: journals.filter(j => j.status === 'draft').length
    }

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount)
    }

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading stock journals...</p>
            </div>
        )
    }

    return (
        <div className="page-container">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Stock Journal</h1>
                    <p className="page-subtitle">Manage inventory adjustments, transfers, and write-offs</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowCreateModal(true)}
                >
                    <Plus size={18} />
                    New Entry
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <motion.div
                    className="stat-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                        <FileText size={24} />
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">Total Entries</p>
                        <h3 className="stat-value">{stats.total}</h3>
                    </div>
                </motion.div>

                <motion.div
                    className="stat-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #8b5cf6, #a855f7)' }}>
                        <RotateCcw size={24} />
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">Transfers</p>
                        <h3 className="stat-value">{stats.transfers}</h3>
                    </div>
                </motion.div>

                <motion.div
                    className="stat-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
                        <TrendingDown size={24} />
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">Write-offs</p>
                        <h3 className="stat-value">{stats.writeOffs}</h3>
                    </div>
                </motion.div>

                <motion.div
                    className="stat-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                        <Package size={24} />
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">Total Value</p>
                        <h3 className="stat-value">{formatCurrency(stats.totalValue)}</h3>
                    </div>
                </motion.div>
            </div>

            {/* Filters */}
            <div className="card mb-6">
                <div className="flex flex-wrap gap-4 items-center">
                    <div className="search-box flex-1 min-w-[250px]">
                        <Search size={18} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search by number, reason, or warehouse..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>
                    <div className="flex gap-2">
                        {['all', 'adjustment', 'transfer', 'write_off', 'opening'].map(type => (
                            <button
                                key={type}
                                className={`btn btn-sm ${typeFilter === type ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => setTypeFilter(type)}
                            >
                                {type === 'all' ? 'All' : type === 'write_off' ? 'Write-off' : type.charAt(0).toUpperCase() + type.slice(1)}
                            </button>
                        ))}
                    </div>
                    <button className="btn btn-secondary">
                        <Download size={18} />
                        Export
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="card">
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Journal #</th>
                                <th>Date</th>
                                <th>Type</th>
                                <th>Warehouse</th>
                                <th>Reason</th>
                                <th>Items</th>
                                <th>Value</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredJournals.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="text-center py-8 text-gray-500">
                                        No stock journals found
                                    </td>
                                </tr>
                            ) : (
                                filteredJournals.map((journal, index) => (
                                    <motion.tr
                                        key={journal.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <td>
                                            <span className="font-mono font-medium text-indigo-400">
                                                {journal.journalNumber}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} className="text-gray-500" />
                                                {new Date(journal.journalDate).toLocaleDateString('en-IN')}
                                            </div>
                                        </td>
                                        <td>{getTypeBadge(journal.journalType)}</td>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <Warehouse size={16} className="text-gray-500" />
                                                {journal.warehouseName}
                                            </div>
                                        </td>
                                        <td className="max-w-[200px] truncate" title={journal.reason}>
                                            {journal.reason}
                                        </td>
                                        <td className="text-center">
                                            <span className="px-2 py-0.5 bg-gray-700 rounded text-xs">
                                                {journal.itemCount}
                                            </span>
                                        </td>
                                        <td className="font-medium">
                                            {formatCurrency(journal.totalValue)}
                                        </td>
                                        <td>{getStatusBadge(journal.status)}</td>
                                        <td>
                                            <div className="flex items-center gap-1">
                                                <button className="btn-icon" title="View">
                                                    <Eye size={16} />
                                                </button>
                                                {journal.status === 'draft' && (
                                                    <>
                                                        <button className="btn-icon" title="Edit">
                                                            <Edit size={16} />
                                                        </button>
                                                        <button className="btn-icon text-green-400" title="Post">
                                                            <CheckCircle size={16} />
                                                        </button>
                                                    </>
                                                )}
                                                <button className="btn-icon" title="More">
                                                    <MoreVertical size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Quick Tip */}
            <div className="mt-6 p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
                <p className="text-sm text-purple-300">
                    <strong>💡 Tally Shortcut:</strong> Press <kbd className="px-2 py-0.5 bg-purple-500/30 rounded mx-1">Alt+F7</kbd> from anywhere to quickly access Stock Journal.
                </p>
            </div>
        </div>
    )
}

export default StockJournal
