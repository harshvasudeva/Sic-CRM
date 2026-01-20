import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Plus,
    Calendar,
    Check,
    X,
    Clock,
    FileText,
    Filter,
    User
} from 'lucide-react'
import { getLeaves, getEmployees, applyLeave, updateLeaveStatus } from '../../stores/hrStore'
import DataTable from '../../components/DataTable'
import Modal, { ModalFooter } from '../../components/Modal'
import FormInput, { FormTextarea, FormSelect } from '../../components/FormInput'
import { useToast } from '../../components/Toast'

const leaveTypes = [
    { value: 'annual', label: 'Annual Leave' },
    { value: 'sick', label: 'Sick Leave' },
    { value: 'personal', label: 'Personal Leave' },
    { value: 'maternity', label: 'Maternity Leave' },
    { value: 'paternity', label: 'Paternity Leave' },
    { value: 'unpaid', label: 'Unpaid Leave' }
]

function Leaves() {
    const toast = useToast()
    const [leaves, setLeaves] = useState([])
    const [employees, setEmployees] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [filterStatus, setFilterStatus] = useState('')
    const [filterEmployee, setFilterEmployee] = useState('')

    const [formData, setFormData] = useState({
        employeeId: '',
        type: 'annual',
        startDate: '',
        endDate: '',
        reason: ''
    })

    const loadData = async () => {
        const filters = {}
        if (filterStatus) filters.status = filterStatus
        if (filterEmployee) filters.employeeId = filterEmployee
        setLeaves(await getLeaves(filters))
        setEmployees(await getEmployees())
    }

    useEffect(() => {
        loadData()
    }, [filterStatus, filterEmployee])

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const calculateDays = (start, end) => {
        if (!start || !end) return 0
        const s = new Date(start)
        const e = new Date(end)
        return Math.ceil((e - s) / (1000 * 60 * 60 * 24)) + 1
    }

    const handleSubmit = async () => {
        if (!formData.employeeId || !formData.startDate || !formData.endDate) {
            toast.error('Please fill all required fields')
            return
        }

        const days = calculateDays(formData.startDate, formData.endDate)
        await applyLeave({ ...formData, days })
        toast.success('Leave request submitted')
        setIsModalOpen(false)
        setFormData({ employeeId: '', type: 'annual', startDate: '', endDate: '', reason: '' })
        await loadData()
    }

    const handleApprove = async (leaveId) => {
        await updateLeaveStatus(leaveId, 'approved', 'emp-004')
        toast.success('Leave approved')
        await loadData()
    }

    const handleReject = async (leaveId) => {
        await updateLeaveStatus(leaveId, 'rejected', 'emp-004')
        toast.warning('Leave rejected')
        await loadData()
    }

    const getEmployeeName = (id) => {
        const emp = employees.find(e => e.id === id)
        return emp ? `${emp.firstName} ${emp.lastName}` : 'Unknown'
    }

    const employeeOptions = employees.map(e => ({
        value: e.id,
        label: `${e.firstName} ${e.lastName}`
    }))

    // Stats
    const stats = {
        pending: leaves.filter(l => l.status === 'pending').length,
        approved: leaves.filter(l => l.status === 'approved').length,
        rejected: leaves.filter(l => l.status === 'rejected').length,
        total: leaves.length
    }

    const columns = [
        {
            key: 'employeeId',
            label: 'Employee',
            render: (value) => {
                const emp = employees.find(e => e.id === value)
                return (
                    <div className="employee-cell">
                        <div className="emp-avatar">
                            {emp?.firstName[0]}{emp?.lastName[0]}
                        </div>
                        <span>{emp?.firstName} {emp?.lastName}</span>
                    </div>
                )
            }
        },
        {
            key: 'type',
            label: 'Type',
            render: (value) => (
                <span className="type-badge">{value}</span>
            )
        },
        { key: 'startDate', label: 'Start' },
        { key: 'endDate', label: 'End' },
        {
            key: 'days',
            label: 'Days',
            render: (value) => `${value} days`
        },
        {
            key: 'status',
            label: 'Status',
            render: (value) => (
                <span className={`status-badge ${value}`}>
                    {value === 'pending' && <Clock size={14} />}
                    {value === 'approved' && <Check size={14} />}
                    {value === 'rejected' && <X size={14} />}
                    {value}
                </span>
            )
        },
        {
            key: 'actions',
            label: 'Actions',
            sortable: false,
            render: (_, row) => {
                if (row.status !== 'pending') return '—'
                return (
                    <div className="action-buttons">
                        <button
                            className="action-btn approve"
                            onClick={() => handleApprove(row.id)}
                        >
                            <Check size={16} />
                        </button>
                        <button
                            className="action-btn reject"
                            onClick={() => handleReject(row.id)}
                        >
                            <X size={16} />
                        </button>
                    </div>
                )
            }
        }
    ]

    return (
        <div className="page">
            <motion.div
                className="page-header"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div>
                    <h1 className="page-title">
                        <span className="gradient-text">Leave</span> Requests
                    </h1>
                    <p className="page-description">
                        Manage employee leave applications and approvals.
                    </p>
                </div>
                <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
                    <Plus size={20} />
                    New Request
                </button>
            </motion.div>

            {/* Stats */}
            <div className="leave-stats">
                <motion.div className="leave-stat orange" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <Clock size={20} />
                    <span className="stat-value">{stats.pending}</span>
                    <span className="stat-label">Pending</span>
                </motion.div>
                <motion.div className="leave-stat green" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                    <Check size={20} />
                    <span className="stat-value">{stats.approved}</span>
                    <span className="stat-label">Approved</span>
                </motion.div>
                <motion.div className="leave-stat red" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                    <X size={20} />
                    <span className="stat-value">{stats.rejected}</span>
                    <span className="stat-label">Rejected</span>
                </motion.div>
            </div>

            {/* Filters */}
            <motion.div
                className="filters-bar"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                <div className="filter-group">
                    <Filter size={18} />
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                        <option value="">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>
                <div className="filter-group">
                    <User size={18} />
                    <select value={filterEmployee} onChange={(e) => setFilterEmployee(e.target.value)}>
                        <option value="">All Employees</option>
                        {employees.map(emp => (
                            <option key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</option>
                        ))}
                    </select>
                </div>
                <div className="filter-stats">{leaves.length} requests</div>
            </motion.div>

            {/* Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <DataTable
                    columns={columns}
                    data={leaves}
                    searchable={true}
                    exportable={true}
                />
            </motion.div>

            {/* Apply Leave Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Apply for Leave"
                size="medium"
            >
                <div className="form-grid">
                    <FormSelect
                        label="Employee *"
                        options={employeeOptions}
                        value={formData.employeeId}
                        onChange={(e) => handleChange('employeeId', e.target.value)}
                    />
                    <FormSelect
                        label="Leave Type"
                        options={leaveTypes}
                        value={formData.type}
                        onChange={(e) => handleChange('type', e.target.value)}
                    />
                    <FormInput
                        label="Start Date *"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => handleChange('startDate', e.target.value)}
                    />
                    <FormInput
                        label="End Date *"
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => handleChange('endDate', e.target.value)}
                    />
                </div>
                {formData.startDate && formData.endDate && (
                    <div className="days-preview">
                        Total: <strong>{calculateDays(formData.startDate, formData.endDate)} days</strong>
                    </div>
                )}
                <FormTextarea
                    label="Reason"
                    value={formData.reason}
                    onChange={(e) => handleChange('reason', e.target.value)}
                    placeholder="Optional reason for leave..."
                    rows={3}
                />
                <ModalFooter>
                    <button className="btn-secondary" onClick={() => setIsModalOpen(false)}>
                        Cancel
                    </button>
                    <button className="btn-primary" onClick={handleSubmit}>
                        Submit Request
                    </button>
                </ModalFooter>

                <style>{`
          .form-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
            margin-bottom: 16px;
          }

          .days-preview {
            padding: 12px 16px;
            background: rgba(99, 102, 241, 0.1);
            border-radius: var(--radius-md);
            margin-bottom: 16px;
            color: var(--accent-primary);
          }
        `}</style>
            </Modal>

            <style>{`
        .page-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
        }

        .btn-primary {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: var(--accent-gradient);
          border-radius: var(--radius-md);
          color: white;
          font-weight: 500;
        }

        .btn-secondary {
          padding: 12px 20px;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          color: var(--text-secondary);
        }

        .leave-stats {
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
        }

        .leave-stat {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 24px;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
        }

        .leave-stat.orange svg { color: var(--warning); }
        .leave-stat.green svg { color: var(--success); }
        .leave-stat.red svg { color: var(--error); }

        .stat-value { font-size: 1.25rem; font-weight: 700; }
        .stat-label { font-size: 0.85rem; color: var(--text-muted); }

        .filters-bar {
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
        }

        .filter-group svg { color: var(--text-muted); }
        .filter-group select {
          background: transparent;
          border: none;
          color: var(--text-primary);
        }

        .filter-stats {
          margin-left: auto;
          color: var(--text-muted);
        }

        .employee-cell {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .emp-avatar {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: var(--accent-gradient);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .type-badge {
          padding: 4px 10px;
          background: rgba(139, 92, 246, 0.15);
          color: #8b5cf6;
          border-radius: 12px;
          font-size: 0.8rem;
          text-transform: capitalize;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 0.8rem;
          text-transform: capitalize;
        }

        .status-badge.pending { background: rgba(245, 158, 11, 0.15); color: var(--warning); }
        .status-badge.approved { background: rgba(16, 185, 129, 0.15); color: var(--success); }
        .status-badge.rejected { background: rgba(239, 68, 68, 0.15); color: var(--error); }

        .action-buttons { display: flex; gap: 8px; }

        .action-btn {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .action-btn.approve { background: rgba(16, 185, 129, 0.15); color: var(--success); }
        .action-btn.reject { background: rgba(239, 68, 68, 0.15); color: var(--error); }
      `}</style>
        </div>
    )
}

export default Leaves
