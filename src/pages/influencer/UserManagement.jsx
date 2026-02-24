import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Users, UserPlus, Shield, Search, Filter, Trash2, Ban, CheckCircle,
    Edit2, X, Mail, Activity, Crown, User, UserCheck
} from 'lucide-react'

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899']

function UserManagement() {
    const [users, setUsers] = useState([])
    const [searchQuery, setSearchQuery] = useState('')
    const [roleFilter, setRoleFilter] = useState('')
    const [statusFilter, setStatusFilter] = useState('')
    const [showAddForm, setShowAddForm] = useState(false)
    const [showDetail, setShowDetail] = useState(null)
    const [confirmAction, setConfirmAction] = useState(null)
    const [addForm, setAddForm] = useState({ name: '', email: '', role: 'User', plan: 'Basic' })

    const loadUsers = () => {
        try {
            const { getUsers } = require('../../stores/adminStore')
            setUsers(getUsers({ search: searchQuery, role: roleFilter, status: statusFilter }) || [])
        } catch {
            setUsers([])
        }
    }

    useEffect(() => { loadUsers() }, [searchQuery, roleFilter, statusFilter])

    const handleSuspend = (id) => {
        try {
            const { suspendUser } = require('../../stores/adminStore')
            suspendUser(id)
        } catch { /* ignore */ }
        setConfirmAction(null)
        loadUsers()
    }

    const handleReactivate = (id) => {
        try {
            const { reactivateUser } = require('../../stores/adminStore')
            reactivateUser(id)
        } catch { /* ignore */ }
        loadUsers()
    }

    const handleDelete = (id) => {
        try {
            const { deleteUser } = require('../../stores/adminStore')
            deleteUser(id)
        } catch { /* ignore */ }
        setConfirmAction(null)
        setShowDetail(null)
        loadUsers()
    }

    const handleAddUser = () => {
        if (!addForm.name.trim() || !addForm.email.trim()) return
        try {
            const { createUser } = require('../../stores/adminStore')
            createUser(addForm)
        } catch { /* ignore */ }
        setShowAddForm(false)
        setAddForm({ name: '', email: '', role: 'User', plan: 'Basic' })
        loadUsers()
    }

    const handleEditRole = (id, role) => {
        try {
            const { updateUser } = require('../../stores/adminStore')
            updateUser(id, { role })
        } catch { /* ignore */ }
        loadUsers()
        if (showDetail?.id === id) setShowDetail(prev => ({ ...prev, role }))
    }

    const allUsers = (() => {
        try {
            const { getUsers } = require('../../stores/adminStore')
            return getUsers() || []
        } catch { return [] }
    })()

    const stats = {
        total: allUsers.length,
        active: allUsers.filter(u => u.status === 'Active').length,
        suspended: allUsers.filter(u => u.status === 'Suspended').length,
        newThisMonth: allUsers.filter(u => {
            const d = new Date(u.createdAt)
            const now = new Date()
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
        }).length,
    }

    const getRoleColor = (role) => {
        if (role === 'Admin') return '#ef4444'
        if (role === 'Manager') return '#f59e0b'
        return '#6366f1'
    }

    const getRoleIcon = (role) => {
        if (role === 'Admin') return Crown
        if (role === 'Manager') return Shield
        return User
    }

    const s = {
        container: { padding: '24px', maxWidth: '1400px', margin: '0 auto' },
        header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' },
        title: { fontSize: '28px', fontWeight: 700, color: '#fff', margin: 0 },
        subtitle: { fontSize: '14px', color: '#94a3b8', marginTop: '4px' },
        panel: { background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', padding: '20px', marginBottom: '16px' },
        sectionTitle: { fontSize: '14px', fontWeight: 600, color: '#fff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' },
        statGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' },
        statCard: (color) => ({
            background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)',
            padding: '18px', borderLeft: `3px solid ${color}`
        }),
        statValue: { fontSize: '26px', fontWeight: 700, color: '#fff' },
        statLabel: { fontSize: '12px', color: '#94a3b8', marginTop: '2px' },
        filterBar: { display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' },
        input: { padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '13px', outline: 'none' },
        select: { padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '13px', outline: 'none' },
        table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
        th: { padding: '12px 14px', textAlign: 'left', color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.1)', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase' },
        td: { padding: '12px 14px', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.05)' },
        btn: { padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' },
        btnPrimary: { background: '#6366f1', color: '#fff' },
        btnSecondary: { background: 'rgba(255,255,255,0.1)', color: '#fff' },
        btnDanger: { background: 'rgba(239,68,68,0.15)', color: '#ef4444' },
        btnSuccess: { background: 'rgba(16,185,129,0.2)', color: '#10b981' },
        btnWarning: { background: 'rgba(245,158,11,0.15)', color: '#f59e0b' },
        btnSmall: { padding: '4px 10px', fontSize: '12px' },
        badge: (color) => ({
            display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 10px', borderRadius: '12px',
            fontSize: '11px', fontWeight: 600, background: `${color}22`, color
        }),
        modal: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
        modalContent: { background: '#1e1e2e', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', padding: '24px', width: '520px', maxWidth: '90vw', maxHeight: '85vh', overflowY: 'auto' },
        formGroup: { display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' },
        label: { color: '#94a3b8', fontSize: '12px', fontWeight: 600 },
        avatar: { width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px', color: '#fff', flexShrink: 0 },
        actionBtns: { display: 'flex', gap: '4px' },
        detailRow: { display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' },
        detailLabel: { color: '#94a3b8', fontSize: '13px' },
        detailValue: { color: '#fff', fontSize: '13px', fontWeight: 600 },
    }

    return (
        <div style={s.container}>
            <motion.div style={s.header} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <div>
                    <h1 style={s.title}><span className="gradient-text">User</span> Management</h1>
                    <p style={s.subtitle}>Manage platform users, roles, and access control</p>
                </div>
                <button style={{ ...s.btn, ...s.btnPrimary }} onClick={() => setShowAddForm(true)}>
                    <UserPlus size={16} /> Add User
                </button>
            </motion.div>

            {/* Stats */}
            <div style={s.statGrid}>
                {[
                    { icon: Users, label: 'Total Users', value: stats.total, color: '#6366f1' },
                    { icon: UserCheck, label: 'Active', value: stats.active, color: '#10b981' },
                    { icon: Ban, label: 'Suspended', value: stats.suspended, color: '#ef4444' },
                    { icon: UserPlus, label: 'New This Month', value: stats.newThisMonth, color: '#06b6d4' },
                ].map((stat, i) => (
                    <motion.div key={i} style={s.statCard(stat.color)} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                        <stat.icon size={18} color={stat.color} style={{ marginBottom: '8px' }} />
                        <div style={s.statValue}>{stat.value}</div>
                        <div style={s.statLabel}>{stat.label}</div>
                    </motion.div>
                ))}
            </div>

            {/* Filters */}
            <motion.div style={s.panel} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <div style={s.filterBar}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <Search size={14} color="#64748b" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input placeholder="Search users..." value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            style={{ ...s.input, paddingLeft: '32px', width: '100%', boxSizing: 'border-box' }} />
                    </div>
                    <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={s.select}>
                        <option value="">All Roles</option>
                        <option value="Admin">Admin</option>
                        <option value="Manager">Manager</option>
                        <option value="User">User</option>
                    </select>
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={s.select}>
                        <option value="">All Statuses</option>
                        <option value="Active">Active</option>
                        <option value="Suspended">Suspended</option>
                    </select>
                </div>

                {/* Users Table */}
                <div style={{ overflowX: 'auto' }}>
                    <table style={s.table}>
                        <thead>
                            <tr>
                                <th style={s.th}>User</th>
                                <th style={s.th}>Email</th>
                                <th style={s.th}>Role</th>
                                <th style={s.th}>Status</th>
                                <th style={s.th}>Plan</th>
                                <th style={s.th}>Last Active</th>
                                <th style={s.th}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => {
                                const RoleIcon = getRoleIcon(user.role)
                                return (
                                    <tr key={user.id}>
                                        <td style={s.td}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                <div style={s.avatar}>{user.name.charAt(0)}</div>
                                                <div>
                                                    <div style={{ fontWeight: 600 }}>{user.name}</div>
                                                    <div style={{ color: '#64748b', fontSize: '11px' }}>ID: {user.id}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ ...s.td, color: '#94a3b8' }}>{user.email}</td>
                                        <td style={s.td}>
                                            <span style={s.badge(getRoleColor(user.role))}>
                                                <RoleIcon size={10} /> {user.role}
                                            </span>
                                        </td>
                                        <td style={s.td}>
                                            <span style={s.badge(user.status === 'Active' ? '#10b981' : '#ef4444')}>
                                                {user.status === 'Active' ? <CheckCircle size={10} /> : <Ban size={10} />}
                                                {user.status}
                                            </span>
                                        </td>
                                        <td style={s.td}>
                                            <span style={{ color: '#94a3b8', fontSize: '12px' }}>{user.plan}</span>
                                        </td>
                                        <td style={{ ...s.td, color: '#94a3b8', fontSize: '12px' }}>{user.lastActive}</td>
                                        <td style={s.td}>
                                            <div style={s.actionBtns}>
                                                <button style={{ ...s.btn, ...s.btnSmall, ...s.btnSecondary }}
                                                    onClick={() => setShowDetail(user)} title="View Details">
                                                    <Edit2 size={12} />
                                                </button>
                                                {user.status === 'Active' ? (
                                                    <button style={{ ...s.btn, ...s.btnSmall, ...s.btnWarning }}
                                                        onClick={() => setConfirmAction({ type: 'suspend', user })} title="Suspend">
                                                        <Ban size={12} />
                                                    </button>
                                                ) : (
                                                    <button style={{ ...s.btn, ...s.btnSmall, ...s.btnSuccess }}
                                                        onClick={() => handleReactivate(user.id)} title="Reactivate">
                                                        <CheckCircle size={12} />
                                                    </button>
                                                )}
                                                <button style={{ ...s.btn, ...s.btnSmall, ...s.btnDanger }}
                                                    onClick={() => setConfirmAction({ type: 'delete', user })} title="Delete">
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
                {users.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '13px' }}>No users found</div>
                )}
            </motion.div>

            {/* Add User Modal */}
            <AnimatePresence>
                {showAddForm && (
                    <motion.div style={s.modal} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddForm(false)}>
                        <motion.div style={s.modalContent} initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h3 style={{ color: '#fff', margin: 0, fontSize: '18px' }}>
                                    <UserPlus size={18} style={{ verticalAlign: 'middle', marginRight: '8px' }} /> Add / Invite User
                                </h3>
                                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }} onClick={() => setShowAddForm(false)}>
                                    <X size={18} />
                                </button>
                            </div>
                            <div style={s.formGroup}>
                                <label style={s.label}>Full Name</label>
                                <input style={s.input} placeholder="John Doe" value={addForm.name}
                                    onChange={e => setAddForm({ ...addForm, name: e.target.value })} />
                            </div>
                            <div style={s.formGroup}>
                                <label style={s.label}>Email Address</label>
                                <input style={s.input} type="email" placeholder="john@example.com" value={addForm.email}
                                    onChange={e => setAddForm({ ...addForm, email: e.target.value })} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div style={s.formGroup}>
                                    <label style={s.label}>Role</label>
                                    <select style={s.select} value={addForm.role} onChange={e => setAddForm({ ...addForm, role: e.target.value })}>
                                        <option value="User">User</option>
                                        <option value="Manager">Manager</option>
                                        <option value="Admin">Admin</option>
                                    </select>
                                </div>
                                <div style={s.formGroup}>
                                    <label style={s.label}>Plan</label>
                                    <select style={s.select} value={addForm.plan} onChange={e => setAddForm({ ...addForm, plan: e.target.value })}>
                                        <option value="Basic">Basic</option>
                                        <option value="Pro">Pro</option>
                                        <option value="Enterprise">Enterprise</option>
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '20px' }}>
                                <button style={{ ...s.btn, ...s.btnSecondary }} onClick={() => setShowAddForm(false)}>Cancel</button>
                                <button style={{ ...s.btn, ...s.btnPrimary }} onClick={handleAddUser}>
                                    <Mail size={14} /> Send Invite
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* User Detail Modal */}
            <AnimatePresence>
                {showDetail && (
                    <motion.div style={s.modal} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowDetail(null)}>
                        <motion.div style={s.modalContent} initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h3 style={{ color: '#fff', margin: 0, fontSize: '18px' }}>User Details</h3>
                                <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }} onClick={() => setShowDetail(null)}>
                                    <X size={18} />
                                </button>
                            </div>

                            {/* User Header */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
                                <div style={{ ...s.avatar, width: '52px', height: '52px', fontSize: '20px' }}>{showDetail.name.charAt(0)}</div>
                                <div>
                                    <div style={{ fontSize: '18px', fontWeight: 700, color: '#fff' }}>{showDetail.name}</div>
                                    <div style={{ color: '#94a3b8', fontSize: '13px' }}>{showDetail.email}</div>
                                </div>
                            </div>

                            <div style={s.detailRow}>
                                <span style={s.detailLabel}>Role</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <span style={s.badge(getRoleColor(showDetail.role))}>{showDetail.role}</span>
                                    <select style={{ ...s.select, width: 'auto', padding: '4px 8px', fontSize: '11px' }}
                                        value={showDetail.role} onChange={e => handleEditRole(showDetail.id, e.target.value)}>
                                        <option value="User">User</option>
                                        <option value="Manager">Manager</option>
                                        <option value="Admin">Admin</option>
                                    </select>
                                </div>
                            </div>
                            <div style={s.detailRow}>
                                <span style={s.detailLabel}>Status</span>
                                <span style={s.badge(showDetail.status === 'Active' ? '#10b981' : '#ef4444')}>{showDetail.status}</span>
                            </div>
                            <div style={s.detailRow}>
                                <span style={s.detailLabel}>Plan</span>
                                <span style={s.detailValue}>{showDetail.plan}</span>
                            </div>
                            <div style={s.detailRow}>
                                <span style={s.detailLabel}>Last Active</span>
                                <span style={s.detailValue}>{showDetail.lastActive}</span>
                            </div>
                            <div style={s.detailRow}>
                                <span style={s.detailLabel}>Created</span>
                                <span style={s.detailValue}>{showDetail.createdAt}</span>
                            </div>
                            <div style={s.detailRow}>
                                <span style={s.detailLabel}>Activity Count</span>
                                <span style={s.detailValue}>
                                    <Activity size={12} style={{ verticalAlign: 'middle', marginRight: '4px' }} />
                                    {showDetail.activity} actions
                                </span>
                            </div>

                            <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
                                {showDetail.status === 'Active' ? (
                                    <button style={{ ...s.btn, ...s.btnWarning }} onClick={() => { handleSuspend(showDetail.id); setShowDetail(prev => ({ ...prev, status: 'Suspended' })) }}>
                                        <Ban size={14} /> Suspend
                                    </button>
                                ) : (
                                    <button style={{ ...s.btn, ...s.btnSuccess }} onClick={() => { handleReactivate(showDetail.id); setShowDetail(prev => ({ ...prev, status: 'Active' })) }}>
                                        <CheckCircle size={14} /> Reactivate
                                    </button>
                                )}
                                <button style={{ ...s.btn, ...s.btnDanger }} onClick={() => setConfirmAction({ type: 'delete', user: showDetail })}>
                                    <Trash2 size={14} /> Delete User
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Confirmation Modal */}
            <AnimatePresence>
                {confirmAction && (
                    <motion.div style={s.modal} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setConfirmAction(null)}>
                        <motion.div style={{ ...s.modalContent, width: '400px', textAlign: 'center' }} initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()}>
                            {confirmAction.type === 'delete' ? (
                                <Trash2 size={40} color="#ef4444" style={{ marginBottom: '16px' }} />
                            ) : (
                                <Ban size={40} color="#f59e0b" style={{ marginBottom: '16px' }} />
                            )}
                            <h3 style={{ color: '#fff', margin: '0 0 8px' }}>
                                {confirmAction.type === 'delete' ? 'Delete User?' : 'Suspend User?'}
                            </h3>
                            <p style={{ color: '#94a3b8', fontSize: '13px', margin: '0 0 20px' }}>
                                {confirmAction.type === 'delete'
                                    ? `This will permanently remove ${confirmAction.user.name} and all their data.`
                                    : `${confirmAction.user.name} will lose access until reactivated.`
                                }
                            </p>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                <button style={{ ...s.btn, ...s.btnSecondary }} onClick={() => setConfirmAction(null)}>Cancel</button>
                                <button style={{ ...s.btn, ...(confirmAction.type === 'delete' ? s.btnDanger : s.btnWarning) }}
                                    onClick={() => confirmAction.type === 'delete' ? handleDelete(confirmAction.user.id) : handleSuspend(confirmAction.user.id)}>
                                    {confirmAction.type === 'delete' ? 'Delete' : 'Suspend'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default UserManagement
