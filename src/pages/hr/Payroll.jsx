import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Banknote, Download, Check, Clock, Users, Calendar } from 'lucide-react'
import { getPayroll, getEmployees, generatePayroll } from '../../stores/hrStore'
import { formatCurrency } from '../../stores/settingsStore'
import DataTable from '../../components/DataTable'
import { useToast } from '../../components/Toast'

function Payroll() {
    const toast = useToast()
    const [payroll, setPayroll] = useState([])
    const [employees, setEmployees] = useState([])
    const [period, setPeriod] = useState('2026-01')

    const loadData = () => {
        setPayroll(getPayroll({ period }))
        setEmployees(getEmployees())
    }

    useEffect(() => { loadData() }, [period])

    const getEmployeeName = (id) => {
        const emp = employees.find(e => e.id === id)
        return emp ? `${emp.firstName} ${emp.lastName}` : 'Unknown'
    }

    const totalPaid = payroll.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.netSalary, 0)
    const totalPending = payroll.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.netSalary, 0)

    const columns = [
        {
            key: 'employeeId',
            label: 'Employee',
            render: (value) => getEmployeeName(value)
        },
        { key: 'period', label: 'Period' },
        { key: 'basicSalary', label: 'Basic', render: (v) => formatCurrency(v) },
        { key: 'overtime', label: 'Overtime', render: (v) => v > 0 ? `+${formatCurrency(v)}` : '—' },
        { key: 'bonus', label: 'Bonus', render: (v) => v > 0 ? `+${formatCurrency(v)}` : '—' },
        {
            key: 'deductions',
            label: 'Deductions',
            render: (v) => `-${formatCurrency(v.tax + v.insurance + v.retirement)}`
        },
        { key: 'netSalary', label: 'Net Pay', render: (v) => <strong>{formatCurrency(v)}</strong> },
        {
            key: 'status',
            label: 'Status',
            render: (v) => (
                <span className={`status-badge ${v}`}>
                    {v === 'paid' ? <Check size={14} /> : <Clock size={14} />}
                    {v}
                </span>
            )
        }
    ]

    return (
        <div className="page">
            <motion.div className="page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <div>
                    <h1 className="page-title"><span className="gradient-text">Payroll</span></h1>
                    <p className="page-description">Process salaries, bonuses, and deductions.</p>
                </div>
            </motion.div>

            <div className="payroll-stats">
                <div className="pay-stat green">
                    <Banknote size={24} />
                    <div>
                        <span className="pay-value">{formatCurrency(totalPaid)}</span>
                        <span className="pay-label">Total Paid</span>
                    </div>
                </div>
                <div className="pay-stat orange">
                    <Clock size={24} />
                    <div>
                        <span className="pay-value">{formatCurrency(totalPending)}</span>
                        <span className="pay-label">Pending</span>
                    </div>
                </div>
                <div className="pay-stat blue">
                    <Users size={24} />
                    <div>
                        <span className="pay-value">{payroll.length}</span>
                        <span className="pay-label">Payslips</span>
                    </div>
                </div>
            </div>

            <div className="filters-bar">
                <div className="filter-group">
                    <Calendar size={18} />
                    <input type="month" value={period} onChange={(e) => setPeriod(e.target.value)} />
                </div>
            </div>

            <DataTable columns={columns} data={payroll} searchable exportable />

            <style>{`
        .payroll-stats { display: flex; gap: 16px; margin-bottom: 24px; }
        .pay-stat { display: flex; align-items: center; gap: 16px; padding: 20px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); }
        .pay-stat.green svg { color: var(--success); }
        .pay-stat.orange svg { color: var(--warning); }
        .pay-stat.blue svg { color: var(--info); }
        .pay-value { display: block; font-size: 1.25rem; font-weight: 700; }
        .pay-label { font-size: 0.85rem; color: var(--text-muted); }
        .filters-bar { display: flex; gap: 16px; margin-bottom: 24px; }
        .filter-group { display: flex; align-items: center; gap: 8px; padding: 8px 14px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); }
        .filter-group svg { color: var(--text-muted); }
        .filter-group input { background: transparent; border: none; color: var(--text-primary); }
        .status-badge { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 12px; font-size: 0.8rem; text-transform: capitalize; }
        .status-badge.paid { background: rgba(16, 185, 129, 0.15); color: var(--success); }
        .status-badge.pending { background: rgba(245, 158, 11, 0.15); color: var(--warning); }
      `}</style>
        </div>
    )
}

export default Payroll
