import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    LayoutGrid, Plus, Users, Settings, Trash2, X, UserPlus,
    UserMinus, Shield, Eye, Edit2, Activity, ChevronDown
} from 'lucide-react'
import { getWorkspaces, createWorkspace, addMember, removeMember } from '../../stores/teamStore'

const ROLE_COLORS = { Admin: '#ef4444', Editor: '#6366f1', Viewer: '#10b981' }

const styles = {
    page: { padding: '24px', maxWidth: 1200, margin: '0 auto' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    title: { color: '#fff', fontSize: 22, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 },
    subtitle: { color: '#94a3b8', fontSize: 13, marginTop: 4 },
    card: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 20 },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 16 },
    wsCard: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: 20, transition: 'border-color 0.2s' },
    avatar: (color) => ({ width: 36, height: 36, borderRadius: '50%', background: color || '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 14, fontWeight: 700, flexShrink: 0, border: '2px solid rgba(255,255,255,0.1)' }),
    avatarStack: { display: 'flex', marginLeft: -8 },
    roleBadge: (role) => ({ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600, background: `${ROLE_COLORS[role] || '#6366f1'}22`, color: ROLE_COLORS[role] || '#6366f1' }),
    memberRow: { display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, marginBottom: 6, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' },
    input: { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box' },
    select: { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px', color: '#fff', fontSize: 13, outline: 'none' },
    btnPrimary: { background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 },
    btnDanger: { background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6, padding: '4px 8px', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 },
    btnGhost: { background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '6px 12px', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 },
    label: { color: '#94a3b8', fontSize: 12, fontWeight: 600, marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' },
    row: { display: 'flex', gap: 10, marginBottom: 12 },
    formGroup: { flex: 1 },
    modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    modalContent: { background: '#1e1e2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 24, width: 520, maxHeight: '80vh', overflowY: 'auto' },
    statsBar: { display: 'flex', gap: 6, marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)' },
    statItem: { display: 'flex', alignItems: 'center', gap: 4, color: '#64748b', fontSize: 12 },
}

const AVATAR_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#3b82f6']

function getAvatarColor(name) {
    let hash = 0
    for (let i = 0; i < (name || '').length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function getInitials(name) {
    return (name || '??').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

export default function Workspaces() {
    const [workspaces, setWorkspaces] = useState([])
    const [showCreate, setShowCreate] = useState(false)
    const [selectedWs, setSelectedWs] = useState(null)
    const [showAddMember, setShowAddMember] = useState(false)
    const [createForm, setCreateForm] = useState({ name: '', ownerId: 'usr-001' })
    const [memberForm, setMemberForm] = useState({ name: '', email: '', role: 'Viewer' })

    useEffect(() => { loadData() }, [])

    function loadData() {
        const ws = getWorkspaces()
        setWorkspaces(ws)
        if (selectedWs) {
            setSelectedWs(ws.find(w => w.id === selectedWs.id) || null)
        }
    }

    function handleCreate() {
        if (!createForm.name.trim()) return
        createWorkspace({
            name: createForm.name,
            ownerId: createForm.ownerId,
            members: [{ userId: createForm.ownerId, name: 'Harsh V', email: 'harsh@sic.agency', role: 'Admin' }],
        })
        setCreateForm({ name: '', ownerId: 'usr-001' })
        setShowCreate(false)
        loadData()
    }

    function handleAddMember() {
        if (!memberForm.name.trim() || !selectedWs) return
        addMember(selectedWs.id, { name: memberForm.name, email: memberForm.email, role: memberForm.role })
        setMemberForm({ name: '', email: '', role: 'Viewer' })
        setShowAddMember(false)
        loadData()
    }

    function handleRemoveMember(userId) {
        if (!selectedWs) return
        removeMember(selectedWs.id, userId)
        loadData()
    }

    return (
        <motion.div style={styles.page} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div style={styles.header}>
                <div>
                    <div style={styles.title}><LayoutGrid size={22} color="#6366f1" /> Workspaces</div>
                    <div style={styles.subtitle}>Manage team workspaces and member access</div>
                </div>
                <button style={styles.btnPrimary} onClick={() => setShowCreate(true)}><Plus size={16} /> Create Workspace</button>
            </div>

            <div style={styles.grid}>
                {workspaces.map(ws => (
                    <motion.div
                        key={ws.id}
                        style={styles.wsCard}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ borderColor: '#6366f1' }}
                        onClick={() => setSelectedWs(ws)}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                            <div>
                                <div style={{ color: '#fff', fontWeight: 700, fontSize: 17 }}>{ws.name}</div>
                                <div style={{ color: '#94a3b8', fontSize: 12 }}>Created {ws.createdAt}</div>
                            </div>
                            <div style={{ background: 'rgba(99,102,241,0.15)', borderRadius: 8, padding: '4px 10px', color: '#6366f1', fontSize: 12, fontWeight: 600 }}>
                                {ws.members.length} members
                            </div>
                        </div>

                        <div style={{ marginBottom: 12 }}>
                            <div style={{ color: '#94a3b8', fontSize: 11, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Team</div>
                            <div style={{ display: 'flex', gap: -6 }}>
                                {ws.members.slice(0, 5).map((m, i) => (
                                    <div key={m.userId} style={{ ...styles.avatar(getAvatarColor(m.name)), marginLeft: i > 0 ? -8 : 0, zIndex: 5 - i, position: 'relative' }} title={m.name}>
                                        {getInitials(m.name)}
                                    </div>
                                ))}
                                {ws.members.length > 5 && (
                                    <div style={{ ...styles.avatar('#475569'), marginLeft: -8, zIndex: 0 }}>+{ws.members.length - 5}</div>
                                )}
                            </div>
                        </div>

                        <div style={styles.statsBar}>
                            <div style={styles.statItem}><Shield size={11} /> {ws.members.filter(m => m.role === 'Admin').length} Admin</div>
                            <div style={styles.statItem}><Edit2 size={11} /> {ws.members.filter(m => m.role === 'Editor').length} Editor</div>
                            <div style={styles.statItem}><Eye size={11} /> {ws.members.filter(m => m.role === 'Viewer').length} Viewer</div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <AnimatePresence>
                {selectedWs && (
                    <motion.div style={styles.modal} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedWs(null)}>
                        <motion.div style={styles.modalContent} initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                <div>
                                    <div style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>{selectedWs.name}</div>
                                    <div style={{ color: '#94a3b8', fontSize: 13 }}>{selectedWs.members.length} members | Created {selectedWs.createdAt}</div>
                                </div>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button style={styles.btnGhost} onClick={() => setShowAddMember(true)}><UserPlus size={14} /> Add</button>
                                    <button onClick={() => setSelectedWs(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={20} /></button>
                                </div>
                            </div>

                            <div style={{ marginBottom: 16 }}>
                                <div style={{ color: '#fff', fontWeight: 600, fontSize: 14, marginBottom: 10 }}>Members</div>
                                {selectedWs.members.map(m => (
                                    <div key={m.userId} style={styles.memberRow}>
                                        <div style={styles.avatar(getAvatarColor(m.name))}>{getInitials(m.name)}</div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{m.name}</div>
                                            <div style={{ color: '#64748b', fontSize: 11 }}>{m.email} | Joined {m.joinedAt}</div>
                                        </div>
                                        <span style={styles.roleBadge(m.role)}>{m.role}</span>
                                        {m.role !== 'Admin' && (
                                            <button style={styles.btnDanger} onClick={() => handleRemoveMember(m.userId)}><UserMinus size={11} /></button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 14, marginBottom: 16 }}>
                                <div style={{ color: '#fff', fontWeight: 600, fontSize: 14, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}><Activity size={14} /> Activity Summary</div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ color: '#6366f1', fontSize: 20, fontWeight: 700 }}>{selectedWs.members.length}</div>
                                        <div style={{ color: '#64748b', fontSize: 11 }}>Total Members</div>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ color: '#10b981', fontSize: 20, fontWeight: 700 }}>{selectedWs.members.filter(m => m.role === 'Admin' || m.role === 'Editor').length}</div>
                                        <div style={{ color: '#64748b', fontSize: 11 }}>Active Editors</div>
                                    </div>
                                    <div style={{ textAlign: 'center' }}>
                                        <div style={{ color: '#f59e0b', fontSize: 20, fontWeight: 700 }}>{selectedWs.members.filter(m => m.role === 'Viewer').length}</div>
                                        <div style={{ color: '#64748b', fontSize: 11 }}>Viewers</div>
                                    </div>
                                </div>
                            </div>

                            <AnimatePresence>
                                {showAddMember && (
                                    <motion.div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10, padding: 16 }} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                                        <div style={{ color: '#fff', fontWeight: 600, fontSize: 14, marginBottom: 12 }}>Add Member</div>
                                        <div style={styles.row}>
                                            <div style={styles.formGroup}><label style={styles.label}>Name</label><input style={styles.input} value={memberForm.name} onChange={e => setMemberForm(p => ({ ...p, name: e.target.value }))} placeholder="Name" /></div>
                                            <div style={styles.formGroup}><label style={styles.label}>Email</label><input style={styles.input} value={memberForm.email} onChange={e => setMemberForm(p => ({ ...p, email: e.target.value }))} placeholder="Email" /></div>
                                        </div>
                                        <div style={{ marginBottom: 12 }}>
                                            <label style={styles.label}>Role</label>
                                            <select style={{ ...styles.select, width: '100%' }} value={memberForm.role} onChange={e => setMemberForm(p => ({ ...p, role: e.target.value }))}>
                                                <option value="Viewer">Viewer</option>
                                                <option value="Editor">Editor</option>
                                                <option value="Admin">Admin</option>
                                            </select>
                                        </div>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <button style={styles.btnPrimary} onClick={handleAddMember}><UserPlus size={14} /> Add</button>
                                            <button style={styles.btnGhost} onClick={() => setShowAddMember(false)}>Cancel</button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showCreate && (
                    <motion.div style={styles.modal} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCreate(false)}>
                        <motion.div style={{ ...styles.modalContent, width: 420 }} initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                <div style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>Create Workspace</div>
                                <button onClick={() => setShowCreate(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={20} /></button>
                            </div>
                            <div style={{ marginBottom: 14 }}>
                                <label style={styles.label}>Workspace Name</label>
                                <input style={styles.input} value={createForm.name} onChange={e => setCreateForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. My Creative Agency" />
                            </div>
                            <button style={{ ...styles.btnPrimary, width: '100%', justifyContent: 'center' }} onClick={handleCreate}><Plus size={16} /> Create Workspace</button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}
