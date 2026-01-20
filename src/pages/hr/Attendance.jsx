import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Clock,
    Calendar,
    CheckCircle,
    XCircle,
    AlertCircle,
    LogIn,
    LogOut,
    Filter,
    Users
} from 'lucide-react'
import { getAttendance, getEmployees, checkIn, checkOut } from '../../stores/hrStore'
import DataTable from '../../components/DataTable'
import { useToast } from '../../components/Toast'

function Attendance() {
    const toast = useToast()
    const [attendance, setAttendance] = useState([])
    const [employees, setEmployees] = useState([])
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
    const [selectedEmployee, setSelectedEmployee] = useState('')

    const loadData = async () => {
        const filters = {}
        if (selectedEmployee) filters.employeeId = selectedEmployee
        if (selectedDate) filters.date = selectedDate

        const allAttendance = await getAttendance(filters)
        setAttendance(allAttendance)
        setEmployees(await getEmployees())
    }

    useEffect(() => {
        loadData()
    }, [selectedDate, selectedEmployee])

    const handleCheckIn = async (employeeId) => {
        await checkIn(employeeId)
        toast.success('Checked in successfully')
        await loadData()
    }

    const handleCheckOut = async (employeeId) => {
        await checkOut(employeeId)
        toast.success('Checked out successfully')
        await loadData()
    }

    const getEmployeeName = (id) => {
        const emp = employees.find(e => e.id === id)
        return emp ? `${emp.firstName} ${emp.lastName}` : 'Unknown'
    }

    // Stats for today
    const today = new Date().toISOString().split('T')[0]
    const todayAttendance = attendance.filter(a => a.date === today)
    const stats = {
        present: todayAttendance.filter(a => a.status === 'present').length,
        late: todayAttendance.filter(a => a.status === 'late').length,
        absent: employees.filter(e => e.status === 'active').length - todayAttendance.length,
        checkedOut: todayAttendance.filter(a => a.checkOut).length
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
        { key: 'date', label: 'Date' },
        {
            key: 'checkIn',
            label: 'Check In',
            render: (value) => value || '—'
        },
        {
            key: 'checkOut',
            label: 'Check Out',
            render: (value) => value || '—'
        },
        {
            key: 'workHours',
            label: 'Hours',
            render: (value) => value ? `${parseFloat(value).toFixed(1)}h` : '—'
        },
        {
            key: 'overtime',
            label: 'Overtime',
            render: (value) => value > 0 ? `+${value}h` : '—'
        },
        {
            key: 'status',
            label: 'Status',
            render: (value) => (
                <span className={`status-badge ${value}`}>
                    {value === 'present' && <CheckCircle size={14} />}
                    {value === 'late' && <AlertCircle size={14} />}
                    {value === 'absent' && <XCircle size={14} />}
                    {value}
                </span>
            )
        },
        {
            key: 'actions',
            label: 'Actions',
            sortable: false,
            render: (_, row) => {
                if (row.date !== today) return '—'
                const hasCheckedIn = !!row.checkIn
                const hasCheckedOut = !!row.checkOut

                return (
                    <div className="action-buttons">
                        {!hasCheckedIn && (
                            <button
                                className="action-btn check-in"
                                onClick={() => handleCheckIn(row.employeeId)}
                            >
                                <LogIn size={16} /> In
                            </button>
                        )}
                        {hasCheckedIn && !hasCheckedOut && (
                            <button
                                className="action-btn check-out"
                                onClick={() => handleCheckOut(row.employeeId)}
                            >
                                <LogOut size={16} /> Out
                            </button>
                        )}
                        {hasCheckedOut && (
                            <span className="completed-badge">Complete</span>
                        )}
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
                        <span className="gradient-text">Attendance</span>
                    </h1>
                    <p className="page-description">
                        Track employee check-ins, check-outs, and work hours.
                    </p>
                </div>
            </motion.div>

            {/* Stats */}
            <div className="attendance-stats">
                <motion.div className="att-stat green" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <CheckCircle size={24} />
                    <div>
                        <span className="att-stat-value">{stats.present}</span>
                        <span className="att-stat-label">Present</span>
                    </div>
                </motion.div>
                <motion.div className="att-stat orange" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <AlertCircle size={24} />
                    <div>
                        <span className="att-stat-value">{stats.late}</span>
                        <span className="att-stat-label">Late</span>
                    </div>
                </motion.div>
                <motion.div className="att-stat red" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <XCircle size={24} />
                    <div>
                        <span className="att-stat-value">{stats.absent}</span>
                        <span className="att-stat-label">Absent</span>
                    </div>
                </motion.div>
                <motion.div className="att-stat blue" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <LogOut size={24} />
                    <div>
                        <span className="att-stat-value">{stats.checkedOut}</span>
                        <span className="att-stat-label">Checked Out</span>
                    </div>
                </motion.div>
            </div>

            {/* Filters */}
            <motion.div
                className="filters-bar"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
            >
                <div className="filter-group">
                    <Calendar size={18} />
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                    />
                </div>
                <div className="filter-group">
                    <Users size={18} />
                    <select
                        value={selectedEmployee}
                        onChange={(e) => setSelectedEmployee(e.target.value)}
                    >
                        <option value="">All Employees</option>
                        {employees.map(emp => (
                            <option key={emp.id} value={emp.id}>
                                {emp.firstName} {emp.lastName}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="filter-stats">
                    {attendance.length} records
                </div>
            </motion.div>

            {/* Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <DataTable
                    columns={columns}
                    data={attendance}
                    searchable={true}
                    exportable={true}
                />
            </motion.div>

            <style>{`
        .attendance-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        @media (max-width: 800px) {
          .attendance-stats { grid-template-columns: repeat(2, 1fr); }
        }

        .att-stat {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
        }

        .att-stat.green svg { color: var(--success); }
        .att-stat.orange svg { color: var(--warning); }
        .att-stat.red svg { color: var(--error); }
        .att-stat.blue svg { color: var(--info); }

        .att-stat-value {
          display: block;
          font-size: 1.5rem;
          font-weight: 700;
        }

        .att-stat-label {
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .filters-bar {
          display: flex;
          align-items: center;
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

        .filter-group input,
        .filter-group select {
          background: transparent;
          border: none;
          color: var(--text-primary);
          font-size: 0.9rem;
        }

        .filter-stats {
          margin-left: auto;
          color: var(--text-muted);
          font-size: 0.85rem;
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

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 0.8rem;
          text-transform: capitalize;
        }

        .status-badge.present {
          background: rgba(16, 185, 129, 0.15);
          color: var(--success);
        }

        .status-badge.late {
          background: rgba(245, 158, 11, 0.15);
          color: var(--warning);
        }

        .status-badge.absent {
          background: rgba(239, 68, 68, 0.15);
          color: var(--error);
        }

        .action-buttons { display: flex; gap: 8px; }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 12px;
          border-radius: var(--radius-sm);
          font-size: 0.8rem;
          font-weight: 500;
        }

        .action-btn.check-in {
          background: rgba(16, 185, 129, 0.15);
          color: var(--success);
        }

        .action-btn.check-out {
          background: rgba(239, 68, 68, 0.15);
          color: var(--error);
        }

        .completed-badge {
          font-size: 0.8rem;
          color: var(--text-muted);
        }
      `}</style>
        </div>
    )
}

export default Attendance
