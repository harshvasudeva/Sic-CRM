import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
    Plus,
    Search,
    Edit,
    Trash2,
    User,
    Mail,
    Phone,
    Building2,
    Filter,
    MoreVertical,
    Eye,
    MapPin
} from 'lucide-react'
import { getEmployees, deleteEmployee, getDepartments } from '../../stores/hrStore'
import DataTable from '../../components/DataTable'
import Modal, { ModalFooter } from '../../components/Modal'
import EmployeeForm from './EmployeeForm'
import { useToast } from '../../components/Toast'

function EmployeeList() {
    const navigate = useNavigate()
    const toast = useToast()
    const [employees, setEmployees] = useState([])
    const [departments, setDepartments] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingEmployee, setEditingEmployee] = useState(null)
    const [selectedEmployee, setSelectedEmployee] = useState(null)
    const [deleteConfirm, setDeleteConfirm] = useState(null)
    const [filterDept, setFilterDept] = useState('')
    const [filterStatus, setFilterStatus] = useState('')
    const [filterType, setFilterType] = useState('')
    const [viewMode, setViewMode] = useState('table') // table | grid

    const loadData = () => {
        setEmployees(getEmployees())
        setDepartments(getDepartments())
    }

    useEffect(() => {
        loadData()
    }, [])

    const handleEdit = (employee) => {
        setEditingEmployee(employee)
        setIsModalOpen(true)
    }

    const handleDelete = (employee) => {
        setDeleteConfirm(employee)
    }

    const confirmDelete = () => {
        if (deleteConfirm) {
            deleteEmployee(deleteConfirm.id)
            loadData()
            toast.success(`${deleteConfirm.firstName} ${deleteConfirm.lastName} removed`)
            setDeleteConfirm(null)
        }
    }

    const handleFormClose = (saved) => {
        setIsModalOpen(false)
        setEditingEmployee(null)
        if (saved) loadData()
    }

    const filteredEmployees = employees.filter(e => {
        if (filterDept && e.department !== filterDept) return false
        if (filterStatus && e.status !== filterStatus) return false
        if (filterType && e.employmentType !== filterType) return false
        return true
    })

    const columns = [
        {
            key: 'name',
            label: 'Employee',
            render: (_, row) => (
                <div className="employee-cell">
                    <div className="emp-avatar">
                        {row.firstName[0]}{row.lastName[0]}
                    </div>
                    <div>
                        <div className="emp-name">{row.firstName} {row.lastName}</div>
                        <div className="emp-id">{row.employeeId}</div>
                    </div>
                </div>
            )
        },
        { key: 'position', label: 'Position' },
        { key: 'department', label: 'Department' },
        {
            key: 'employmentType',
            label: 'Type',
            render: (value) => (
                <span className={`type-badge ${value}`}>
                    {value.replace('-', ' ')}
                </span>
            )
        },
        {
            key: 'workLocation',
            label: 'Location',
            render: (value) => (
                <span className="location-badge">
                    <MapPin size={12} />
                    {value}
                </span>
            )
        },
        {
            key: 'status',
            label: 'Status',
            render: (value) => (
                <span className={`status-badge ${value}`}>
                    {value.replace('-', ' ')}
                </span>
            )
        },
        {
            key: 'actions',
            label: '',
            sortable: false,
            render: (_, row) => (
                <div className="action-buttons">
                    <button className="action-btn view" onClick={() => setSelectedEmployee(row)}>
                        <Eye size={16} />
                    </button>
                    <button className="action-btn edit" onClick={() => handleEdit(row)}>
                        <Edit size={16} />
                    </button>
                    <button className="action-btn delete" onClick={() => handleDelete(row)}>
                        <Trash2 size={16} />
                    </button>
                </div>
            )
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
                        <span className="gradient-text">Employees</span>
                    </h1>
                    <p className="page-description">
                        Manage employee profiles, contracts, and information.
                    </p>
                </div>
                <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
                    <Plus size={20} />
                    Add Employee
                </button>
            </motion.div>

            {/* Filters */}
            <motion.div
                className="filters-bar"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <div className="filter-group">
                    <Filter size={18} />
                    <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)}>
                        <option value="">All Departments</option>
                        {departments.map(d => (
                            <option key={d.id} value={d.name}>{d.name}</option>
                        ))}
                    </select>
                </div>
                <div className="filter-group">
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                        <option value="">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="on-leave">On Leave</option>
                        <option value="terminated">Terminated</option>
                    </select>
                </div>
                <div className="filter-group">
                    <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                        <option value="">All Types</option>
                        <option value="full-time">Full-time</option>
                        <option value="part-time">Part-time</option>
                        <option value="contract">Contract</option>
                        <option value="intern">Intern</option>
                    </select>
                </div>
                <div className="filter-stats">
                    {filteredEmployees.length} employees
                </div>
            </motion.div>

            {/* Employee Table */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <DataTable
                    columns={columns}
                    data={filteredEmployees}
                    title=""
                    searchable={true}
                    exportable={true}
                />
            </motion.div>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => handleFormClose(false)}
                title={editingEmployee ? 'Edit Employee' : 'Add New Employee'}
                size="xlarge"
            >
                <EmployeeForm
                    employee={editingEmployee}
                    departments={departments}
                    onClose={handleFormClose}
                />
            </Modal>

            {/* View Employee Modal */}
            <Modal
                isOpen={!!selectedEmployee}
                onClose={() => setSelectedEmployee(null)}
                title="Employee Details"
                size="large"
            >
                {selectedEmployee && (
                    <div className="employee-details">
                        <div className="emp-detail-header">
                            <div className="emp-detail-avatar">
                                {selectedEmployee.firstName[0]}{selectedEmployee.lastName[0]}
                            </div>
                            <div className="emp-detail-info">
                                <h2>{selectedEmployee.firstName} {selectedEmployee.lastName}</h2>
                                <p>{selectedEmployee.position} • {selectedEmployee.department}</p>
                                <span className={`status-badge ${selectedEmployee.status}`}>
                                    {selectedEmployee.status}
                                </span>
                            </div>
                        </div>

                        <div className="emp-detail-grid">
                            <div className="detail-section">
                                <h4>Contact Information</h4>
                                <div className="detail-row"><Mail size={16} /> {selectedEmployee.email}</div>
                                <div className="detail-row"><Phone size={16} /> {selectedEmployee.phone}</div>
                                <div className="detail-row"><MapPin size={16} /> {selectedEmployee.address}</div>
                            </div>

                            <div className="detail-section">
                                <h4>Employment</h4>
                                <div className="detail-item">
                                    <span>Employee ID</span>
                                    <strong>{selectedEmployee.employeeId}</strong>
                                </div>
                                <div className="detail-item">
                                    <span>Hire Date</span>
                                    <strong>{selectedEmployee.hireDate}</strong>
                                </div>
                                <div className="detail-item">
                                    <span>Type</span>
                                    <strong>{selectedEmployee.employmentType}</strong>
                                </div>
                                <div className="detail-item">
                                    <span>Work Location</span>
                                    <strong>{selectedEmployee.workLocation}</strong>
                                </div>
                            </div>

                            <div className="detail-section">
                                <h4>Leave Balance</h4>
                                <div className="leave-balances">
                                    <div className="leave-balance">
                                        <span>Annual</span>
                                        <strong>{selectedEmployee.leaveBalance.annual} days</strong>
                                    </div>
                                    <div className="leave-balance">
                                        <span>Sick</span>
                                        <strong>{selectedEmployee.leaveBalance.sick} days</strong>
                                    </div>
                                    <div className="leave-balance">
                                        <span>Personal</span>
                                        <strong>{selectedEmployee.leaveBalance.personal} days</strong>
                                    </div>
                                </div>
                            </div>

                            <div className="detail-section">
                                <h4>Skills</h4>
                                <div className="skills-list">
                                    {selectedEmployee.skills?.map((skill, i) => (
                                        <span key={i} className="skill-tag">{skill}</span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Delete Confirmation */}
            <Modal
                isOpen={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                title="Remove Employee"
                size="small"
            >
                <p style={{ marginBottom: 24, color: 'var(--text-secondary)' }}>
                    Are you sure you want to remove <strong>{deleteConfirm?.firstName} {deleteConfirm?.lastName}</strong>?
                </p>
                <ModalFooter>
                    <button className="btn-secondary" onClick={() => setDeleteConfirm(null)}>
                        Cancel
                    </button>
                    <button className="btn-danger" onClick={confirmDelete}>
                        Remove
                    </button>
                </ModalFooter>
            </Modal>

            <style>{`
        .page-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
        }

        .btn-primary {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: var(--accent-gradient);
          border-radius: var(--radius-md);
          color: white;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .btn-secondary {
          padding: 10px 20px;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          color: var(--text-secondary);
        }

        .btn-danger {
          padding: 10px 20px;
          background: var(--error);
          border-radius: var(--radius-md);
          color: white;
        }

        .filters-bar {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
          flex-wrap: wrap;
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
          font-size: 0.9rem;
        }

        .filter-stats {
          margin-left: auto;
          font-size: 0.85rem;
          color: var(--text-muted);
        }

        .employee-cell {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .emp-avatar {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: var(--accent-gradient);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 0.85rem;
        }

        .emp-name { font-weight: 500; }
        .emp-id { font-size: 0.8rem; color: var(--text-muted); }

        .type-badge {
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: capitalize;
        }

        .type-badge.full-time { background: rgba(16, 185, 129, 0.15); color: var(--success); }
        .type-badge.part-time { background: rgba(59, 130, 246, 0.15); color: var(--info); }
        .type-badge.contract { background: rgba(245, 158, 11, 0.15); color: var(--warning); }
        .type-badge.intern { background: rgba(139, 92, 246, 0.15); color: #8b5cf6; }

        .location-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.85rem;
          color: var(--text-secondary);
          text-transform: capitalize;
        }

        .status-badge.active { background: rgba(16, 185, 129, 0.15); color: var(--success); }
        .status-badge.on-leave { background: rgba(245, 158, 11, 0.15); color: var(--warning); }
        .status-badge.terminated { background: rgba(239, 68, 68, 0.15); color: var(--error); }

        .action-buttons { display: flex; gap: 8px; }

        .action-btn {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .action-btn.view { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }
        .action-btn.edit { background: rgba(59, 130, 246, 0.1); color: var(--info); }
        .action-btn.delete { background: rgba(239, 68, 68, 0.1); color: var(--error); }

        .employee-details {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .emp-detail-header {
          display: flex;
          align-items: center;
          gap: 20px;
          padding-bottom: 20px;
          border-bottom: 1px solid var(--border-color);
        }

        .emp-detail-avatar {
          width: 80px;
          height: 80px;
          border-radius: 20px;
          background: var(--accent-gradient);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.5rem;
          font-weight: 600;
        }

        .emp-detail-info h2 { margin-bottom: 4px; }
        .emp-detail-info p { color: var(--text-secondary); margin-bottom: 8px; }

        .emp-detail-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
        }

        .detail-section h4 {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-bottom: 12px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .detail-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 0;
          font-size: 0.9rem;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .detail-row svg { color: var(--text-muted); }

        .detail-item {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }

        .detail-item span { color: var(--text-muted); font-size: 0.9rem; }
        .detail-item strong { font-size: 0.9rem; }

        .leave-balances {
          display: flex;
          gap: 16px;
        }

        .leave-balance {
          flex: 1;
          padding: 12px;
          background: rgba(255,255,255,0.02);
          border-radius: var(--radius-md);
          text-align: center;
        }

        .leave-balance span {
          display: block;
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-bottom: 4px;
        }

        .skills-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .skill-tag {
          padding: 6px 12px;
          background: rgba(99, 102, 241, 0.15);
          color: var(--accent-primary);
          border-radius: 16px;
          font-size: 0.8rem;
        }
      `}</style>
        </div>
    )
}

export default EmployeeList
