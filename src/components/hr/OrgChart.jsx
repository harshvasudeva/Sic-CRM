import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown, ChevronRight, User, Users, Mail, Phone, Building2 } from 'lucide-react'

function OrgNode({ employee, allEmployees, depth = 0, expanded, onToggle }) {
    const directReports = allEmployees.filter(e =>
        (e.managerId === employee.id || e.manager_id === employee.id) && e.id !== employee.id
    )
    const hasReports = directReports.length > 0
    const isExpanded = expanded.has(employee.id)

    return (
        <div style={{ marginLeft: depth > 0 ? 32 : 0 }}>
            <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: depth * 0.05 }}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '10px 16px',
                    background: depth === 0 ? 'var(--accent-gradient)' : 'var(--bg-secondary)',
                    borderRadius: '10px',
                    border: depth === 0 ? 'none' : '1px solid var(--border-color)',
                    marginBottom: '6px',
                    cursor: hasReports ? 'pointer' : 'default',
                    transition: 'all 0.15s',
                }}
                onClick={() => hasReports && onToggle(employee.id)}
                whileHover={hasReports ? { scale: 1.01 } : {}}
            >
                {/* Expand/Collapse */}
                <div style={{ width: 20, flexShrink: 0 }}>
                    {hasReports ? (
                        isExpanded
                            ? <ChevronDown size={16} style={{ color: depth === 0 ? 'white' : 'var(--text-muted)' }} />
                            : <ChevronRight size={16} style={{ color: depth === 0 ? 'white' : 'var(--text-muted)' }} />
                    ) : (
                        <div style={{ width: 16 }} />
                    )}
                </div>

                {/* Avatar */}
                <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: depth === 0 ? 'rgba(255,255,255,0.2)' : 'var(--accent-gradient)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    color: 'white',
                    fontSize: '0.8rem',
                    fontWeight: 600
                }}>
                    {(employee.name || employee.first_name || '?').charAt(0).toUpperCase()}
                    {(employee.last_name || '').charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                        fontWeight: 600,
                        fontSize: depth === 0 ? '1rem' : '0.9rem',
                        color: depth === 0 ? 'white' : 'var(--text-primary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                    }}>
                        {employee.name || `${employee.first_name || ''} ${employee.last_name || ''}`.trim()}
                    </div>
                    <div style={{
                        fontSize: '0.75rem',
                        color: depth === 0 ? 'rgba(255,255,255,0.8)' : 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}>
                        <span>{employee.designation || employee.position || employee.role || 'Employee'}</span>
                        {employee.department?.name && (
                            <>
                                <span style={{ opacity: 0.3 }}>|</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                    <Building2 size={10} />
                                    {employee.department.name}
                                </span>
                            </>
                        )}
                    </div>
                </div>

                {/* Quick contact */}
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                    {employee.email && (
                        <a
                            href={`mailto:${employee.email}`}
                            onClick={e => e.stopPropagation()}
                            style={{
                                padding: '4px',
                                borderRadius: '6px',
                                color: depth === 0 ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)',
                                transition: 'color 0.15s'
                            }}
                            title={employee.email}
                        >
                            <Mail size={14} />
                        </a>
                    )}
                    {employee.phone && (
                        <a
                            href={`tel:${employee.phone}`}
                            onClick={e => e.stopPropagation()}
                            style={{
                                padding: '4px',
                                borderRadius: '6px',
                                color: depth === 0 ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)',
                                transition: 'color 0.15s'
                            }}
                            title={employee.phone}
                        >
                            <Phone size={14} />
                        </a>
                    )}
                </div>

                {/* Report count badge */}
                {hasReports && (
                    <span style={{
                        padding: '2px 8px',
                        borderRadius: '10px',
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        background: depth === 0 ? 'rgba(255,255,255,0.2)' : 'var(--color-info-bg)',
                        color: depth === 0 ? 'white' : 'var(--color-info)',
                        flexShrink: 0
                    }}>
                        {directReports.length}
                    </span>
                )}
            </motion.div>

            {/* Children */}
            {isExpanded && directReports.length > 0 && (
                <div style={{ borderLeft: '2px solid var(--border-color)', marginLeft: '26px', paddingLeft: '8px' }}>
                    {directReports.map(report => (
                        <OrgNode
                            key={report.id}
                            employee={report}
                            allEmployees={allEmployees}
                            depth={depth + 1}
                            expanded={expanded}
                            onToggle={onToggle}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

function OrgChart({ employees = [] }) {
    const [expanded, setExpanded] = useState(new Set())
    const [loading, setLoading] = useState(true)
    const [employeeList, setEmployeeList] = useState([])

    useEffect(() => {
        async function fetchEmployees() {
            try {
                // Try API first
                const response = await fetch('http://localhost:5000/api/hr/employees')
                if (response.ok) {
                    const data = await response.json()
                    setEmployeeList(data.employees || data || [])
                } else {
                    setEmployeeList(employees)
                }
            } catch {
                setEmployeeList(employees)
            } finally {
                setLoading(false)
            }
        }

        if (employees.length > 0) {
            setEmployeeList(employees)
            setLoading(false)
        } else {
            fetchEmployees()
        }
    }, [employees])

    // Auto-expand first level
    useEffect(() => {
        if (employeeList.length > 0) {
            const roots = findRoots(employeeList)
            setExpanded(new Set(roots.map(r => r.id)))
        }
    }, [employeeList])

    const toggleExpand = (id) => {
        setExpanded(prev => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    const expandAll = () => {
        setExpanded(new Set(employeeList.map(e => e.id)))
    }

    const collapseAll = () => {
        const roots = findRoots(employeeList)
        setExpanded(new Set(roots.map(r => r.id)))
    }

    if (loading) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                Loading organization chart...
            </div>
        )
    }

    if (employeeList.length === 0) {
        return (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                <Users size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
                <p>No employees found. Add employees to see the org chart.</p>
            </div>
        )
    }

    const rootEmployees = findRoots(employeeList)

    return (
        <div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <button
                    onClick={expandAll}
                    style={{
                        padding: '6px 12px',
                        background: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        color: 'var(--text-secondary)',
                        fontSize: '0.8rem'
                    }}
                >
                    Expand All
                </button>
                <button
                    onClick={collapseAll}
                    style={{
                        padding: '6px 12px',
                        background: 'var(--bg-tertiary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        color: 'var(--text-secondary)',
                        fontSize: '0.8rem'
                    }}
                >
                    Collapse All
                </button>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '8px' }}>
                    <Users size={14} />
                    {employeeList.length} employees
                </span>
            </div>

            {rootEmployees.map(root => (
                <OrgNode
                    key={root.id}
                    employee={root}
                    allEmployees={employeeList}
                    depth={0}
                    expanded={expanded}
                    onToggle={toggleExpand}
                />
            ))}
        </div>
    )
}

function findRoots(employees) {
    const ids = new Set(employees.map(e => e.id))
    return employees.filter(e => {
        const managerId = e.managerId || e.manager_id
        return !managerId || !ids.has(managerId)
    })
}

export default OrgChart
