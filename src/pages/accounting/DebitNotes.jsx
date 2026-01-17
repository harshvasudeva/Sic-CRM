import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
    FileText,
    Plus,
    Search,
    Filter,
    Download,
    MoreVertical,
    Eye,
    Edit,
    Trash2,
    CheckCircle,
    XCircle,
    Clock,
    Building2,
    Calendar,
    DollarSign,
    FileCheck,
    AlertTriangle
} from 'lucide-react'
import { useTallyShortcuts } from '../../hooks/useTallyShortcuts'
import { formatCurrency } from '../../stores/settingsStore'

function DebitNotes() {
    const [debitNotes, setDebitNotes] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')
    const [showCreateModal, setShowCreateModal] = useState(false)

    // Enable Tally shortcuts
    useTallyShortcuts({
        create: () => setShowCreateModal(true),
    })

    useEffect(() => {
        // Load debit notes from localStorage or API
        loadDebitNotes()
    }, [])

    const loadDebitNotes = () => {
        const stored = localStorage.getItem('sic-debit-notes')
        if (stored) {
            setDebitNotes(JSON.parse(stored))
        } else {
            // Sample data
            const sampleData = [
                {
                    id: 'dn-001',
                    debitNoteNumber: 'DN/2025-26/0001',
                    vendorId: 'vendor-001',
                    vendorName: 'ABC Suppliers',
                    billId: 'bill-001',
                    issueDate: '2026-01-15',
                    reason: 'Damaged goods returned',
                    subtotal: 5000,
                    taxAmount: 900,
                    totalAmount: 5900,
                    status: 'issued',
                    appliedAmount: 0,
                    createdAt: '2026-01-15'
                },
                {
                    id: 'dn-002',
                    debitNoteNumber: 'DN/2025-26/0002',
                    vendorId: 'vendor-002',
                    vendorName: 'XYZ Trading Co.',
                    billId: null,
                    issueDate: '2026-01-10',
                    reason: 'Short shipment adjustment',
                    subtotal: 2500,
                    taxAmount: 450,
                    totalAmount: 2950,
                    status: 'applied',
                    appliedAmount: 2950,
                    createdAt: '2026-01-10'
                },
                {
                    id: 'dn-003',
                    debitNoteNumber: 'DN/2025-26/0003',
                    vendorId: 'vendor-003',
                    vendorName: 'Metro Wholesale',
                    billId: 'bill-003',
                    issueDate: '2026-01-05',
                    reason: 'Quality issue - defective items',
                    subtotal: 8000,
                    taxAmount: 1440,
                    totalAmount: 9440,
                    status: 'draft',
                    appliedAmount: 0,
                    createdAt: '2026-01-05'
                }
            ]
            setDebitNotes(sampleData)
            localStorage.setItem('sic-debit-notes', JSON.stringify(sampleData))
        }
        setLoading(false)
    }

    const getStatusBadge = (status) => {
        const styles = {
            draft: { bg: 'bg-gray-500/20', text: 'text-gray-400', icon: Clock },
            issued: { bg: 'bg-blue-500/20', text: 'text-blue-400', icon: FileCheck },
            applied: { bg: 'bg-green-500/20', text: 'text-green-400', icon: CheckCircle },
            void: { bg: 'bg-red-500/20', text: 'text-red-400', icon: XCircle }
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

    const filteredNotes = debitNotes.filter(note => {
        const matchesSearch =
            note.debitNoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            note.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            note.reason.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesStatus = statusFilter === 'all' || note.status === statusFilter
        return matchesSearch && matchesStatus
    })

    const stats = {
        total: debitNotes.length,
        draft: debitNotes.filter(n => n.status === 'draft').length,
        issued: debitNotes.filter(n => n.status === 'issued').length,
        applied: debitNotes.filter(n => n.status === 'applied').length,
        totalValue: debitNotes.reduce((sum, n) => sum + n.totalAmount, 0),
        pendingValue: debitNotes.filter(n => n.status === 'issued').reduce((sum, n) => sum + (n.totalAmount - n.appliedAmount), 0)
    }



    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading debit notes...</p>
            </div>
        )
    }

    return (
        <div className="page-container">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Debit Notes</h1>
                    <p className="page-subtitle">Manage vendor returns and adjustments</p>
                </div>
                <button
                    className="btn btn-primary"
                    onClick={() => setShowCreateModal(true)}
                >
                    <Plus size={18} />
                    New Debit Note
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
                        <p className="stat-label">Total Notes</p>
                        <h3 className="stat-value">{stats.total}</h3>
                    </div>
                </motion.div>

                <motion.div
                    className="stat-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}>
                        <Clock size={24} />
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">Pending</p>
                        <h3 className="stat-value">{stats.issued}</h3>
                    </div>
                </motion.div>

                <motion.div
                    className="stat-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                        <DollarSign size={24} />
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">Total Value</p>
                        <h3 className="stat-value">{formatCurrency(stats.totalValue)}</h3>
                    </div>
                </motion.div>

                <motion.div
                    className="stat-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)' }}>
                        <AlertTriangle size={24} />
                    </div>
                    <div className="stat-content">
                        <p className="stat-label">Unapplied</p>
                        <h3 className="stat-value">{formatCurrency(stats.pendingValue)}</h3>
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
                            placeholder="Search by number, vendor, or reason..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>
                    <div className="flex gap-2">
                        {['all', 'draft', 'issued', 'applied', 'void'].map(status => (
                            <button
                                key={status}
                                className={`btn btn-sm ${statusFilter === status ? 'btn-primary' : 'btn-secondary'}`}
                                onClick={() => setStatusFilter(status)}
                            >
                                {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
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
                                <th>Debit Note #</th>
                                <th>Vendor</th>
                                <th>Date</th>
                                <th>Reason</th>
                                <th>Amount</th>
                                <th>Applied</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredNotes.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="text-center py-8 text-gray-500">
                                        No debit notes found
                                    </td>
                                </tr>
                            ) : (
                                filteredNotes.map((note, index) => (
                                    <motion.tr
                                        key={note.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <td>
                                            <span className="font-mono font-medium text-indigo-400">
                                                {note.debitNoteNumber}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <Building2 size={16} className="text-gray-500" />
                                                {note.vendorName}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <Calendar size={14} className="text-gray-500" />
                                                {new Date(note.issueDate).toLocaleDateString('en-IN')}
                                            </div>
                                        </td>
                                        <td className="max-w-[200px] truncate" title={note.reason}>
                                            {note.reason}
                                        </td>
                                        <td className="font-medium">
                                            {formatCurrency(note.totalAmount)}
                                        </td>
                                        <td>
                                            {formatCurrency(note.appliedAmount)}
                                        </td>
                                        <td>{getStatusBadge(note.status)}</td>
                                        <td>
                                            <div className="flex items-center gap-1">
                                                <button className="btn-icon" title="View">
                                                    <Eye size={16} />
                                                </button>
                                                {note.status === 'draft' && (
                                                    <button className="btn-icon" title="Edit">
                                                        <Edit size={16} />
                                                    </button>
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
            <div className="mt-6 p-4 rounded-lg bg-indigo-500/10 border border-indigo-500/30">
                <p className="text-sm text-indigo-300">
                    <strong>💡 Tally Shortcut:</strong> Press <kbd className="px-2 py-0.5 bg-indigo-500/30 rounded mx-1">Alt+F5</kbd> from anywhere to quickly access Debit Notes.
                </p>
            </div>
        </div>
    )
}

export default DebitNotes
