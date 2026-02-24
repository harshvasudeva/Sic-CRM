import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Clock, Mail, Plus, Play, Pause, Send, Trash2, Eye, Calendar,
    CheckCircle, XCircle, AlertCircle, FileText, Settings
} from 'lucide-react'

const STORAGE_KEY = 'sic-scheduled-reports'

const initialSchedules = [
    {
        id: 'sch-001', name: 'Weekly Creator Performance', frequency: 'Weekly', day: 'Monday',
        recipients: ['team@siccrm.com', 'manager@siccrm.com'], format: 'CSV',
        lastSent: '2026-02-17T09:00:00Z', nextSend: '2026-02-24T09:00:00Z',
        status: 'Active', template: 'Creator Metrics',
        deliveryHistory: [
            { date: '2026-02-17T09:00:00Z', status: 'Delivered', recipients: 2 },
            { date: '2026-02-10T09:00:00Z', status: 'Delivered', recipients: 2 },
            { date: '2026-02-03T09:00:00Z', status: 'Failed', recipients: 0 },
        ]
    },
    {
        id: 'sch-002', name: 'Monthly Campaign ROI', frequency: 'Monthly', day: '1st',
        recipients: ['ceo@siccrm.com'], format: 'PDF',
        lastSent: '2026-02-01T08:00:00Z', nextSend: '2026-03-01T08:00:00Z',
        status: 'Active', template: 'Campaign ROI',
        deliveryHistory: [
            { date: '2026-02-01T08:00:00Z', status: 'Delivered', recipients: 1 },
            { date: '2026-01-01T08:00:00Z', status: 'Delivered', recipients: 1 },
        ]
    },
    {
        id: 'sch-003', name: 'Daily Outreach Summary', frequency: 'Daily', day: '',
        recipients: ['outreach@siccrm.com'], format: 'CSV',
        lastSent: '2026-02-23T07:00:00Z', nextSend: '2026-02-24T07:00:00Z',
        status: 'Paused', template: 'Outreach Summary',
        deliveryHistory: [
            { date: '2026-02-23T07:00:00Z', status: 'Delivered', recipients: 1 },
        ]
    },
]

function ScheduledReports() {
    const [schedules, setSchedules] = useState([])
    const [showForm, setShowForm] = useState(false)
    const [showPreview, setShowPreview] = useState(null)
    const [showHistory, setShowHistory] = useState(null)
    const [form, setForm] = useState({
        name: '', frequency: 'Weekly', day: 'Monday',
        recipients: '', format: 'CSV', template: ''
    })

    useEffect(() => {
        try {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
            setSchedules(saved && saved.length > 0 ? saved : initialSchedules)
        } catch {
            setSchedules(initialSchedules)
        }
    }, [])

    const save = (data) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
        setSchedules(data)
    }

    const toggleStatus = (id) => {
        const updated = schedules.map(s =>
            s.id === id ? { ...s, status: s.status === 'Active' ? 'Paused' : 'Active' } : s
        )
        save(updated)
    }

    const sendNow = (id) => {
        const updated = schedules.map(s => {
            if (s.id !== id) return s
            const delivery = { date: new Date().toISOString(), status: 'Delivered', recipients: s.recipients.length }
            return { ...s, lastSent: new Date().toISOString(), deliveryHistory: [delivery, ...(s.deliveryHistory || [])] }
        })
        save(updated)
    }

    const deleteSchedule = (id) => {
        save(schedules.filter(s => s.id !== id))
    }

    const createSchedule = () => {
        if (!form.name.trim()) return
        const schedule = {
            id: `sch-${Date.now()}`,
            name: form.name,
            frequency: form.frequency,
            day: form.day,
            recipients: form.recipients.split(',').map(e => e.trim()).filter(Boolean),
            format: form.format,
            template: form.template || form.name,
            lastSent: null,
            nextSend: new Date(Date.now() + 86400000).toISOString(),
            status: 'Active',
            deliveryHistory: []
        }
        save([schedule, ...schedules])
        setShowForm(false)
        setForm({ name: '', frequency: 'Weekly', day: 'Monday', recipients: '', format: 'CSV', template: '' })
    }

    const getStatusIcon = (status) => {
        if (status === 'Delivered') return <CheckCircle size={14} color="#10b981" />
        if (status === 'Failed') return <XCircle size={14} color="#ef4444" />
        return <AlertCircle size={14} color="#f59e0b" />
    }

    const s = {
        container: { padding: '24px', maxWidth: '1400px', margin: '0 auto' },
        header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' },
        title: { fontSize: '28px', fontWeight: 700, color: '#fff', margin: 0 },
        subtitle: { fontSize: '14px', color: '#94a3b8', marginTop: '4px' },
        panel: { background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', padding: '20px', marginBottom: '16px' },
        table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
        th: { padding: '12px 14px', textAlign: 'left', color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.1)', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase' },
        td: { padding: '12px 14px', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.05)' },
        btn: { padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' },
        btnPrimary: { background: '#6366f1', color: '#fff' },
        btnSecondary: { background: 'rgba(255,255,255,0.1)', color: '#fff' },
        btnDanger: { background: 'rgba(239,68,68,0.15)', color: '#ef4444' },
        btnSuccess: { background: 'rgba(16,185,129,0.15)', color: '#10b981' },
        btnSmall: { padding: '4px 10px', fontSize: '12px' },
        badge: (active) => ({
            display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
            background: active ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
            color: active ? '#10b981' : '#f59e0b'
        }),
        formGroup: { display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' },
        label: { color: '#94a3b8', fontSize: '12px', fontWeight: 600 },
        input: { padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '13px', outline: 'none' },
        select: { padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '13px', outline: 'none' },
        modal: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
        modalContent: { background: '#1e1e2e', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', padding: '24px', width: '500px', maxWidth: '90vw', maxHeight: '80vh', overflowY: 'auto' },
        emailPreview: { background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', padding: '16px', marginTop: '12px' },
        actionBtns: { display: 'flex', gap: '4px' },
    }

    return (
        <div style={s.container}>
            <motion.div style={s.header} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <div>
                    <h1 style={s.title}><span className="gradient-text">Scheduled</span> Reports</h1>
                    <p style={s.subtitle}>Automate report delivery on a recurring schedule</p>
                </div>
                <button style={{ ...s.btn, ...s.btnPrimary }} onClick={() => setShowForm(true)}>
                    <Plus size={16} /> New Schedule
                </button>
            </motion.div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' }}>
                {[
                    { label: 'Total Schedules', value: schedules.length, color: '#6366f1', icon: Calendar },
                    { label: 'Active', value: schedules.filter(x => x.status === 'Active').length, color: '#10b981', icon: Play },
                    { label: 'Paused', value: schedules.filter(x => x.status === 'Paused').length, color: '#f59e0b', icon: Pause },
                    { label: 'Total Deliveries', value: schedules.reduce((sum, x) => sum + (x.deliveryHistory?.length || 0), 0), color: '#06b6d4', icon: Send },
                ].map((stat, i) => (
                    <motion.div key={i} style={s.panel} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <div style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px' }}>{stat.label}</div>
                                <div style={{ fontSize: '24px', fontWeight: 700, color: stat.color }}>{stat.value}</div>
                            </div>
                            <stat.icon size={24} color={stat.color} style={{ opacity: 0.5 }} />
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Schedules Table */}
            <motion.div style={s.panel} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={{ fontSize: '15px', fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Settings size={16} color="#6366f1" /> Scheduled Reports
                    </div>
                </div>
                <div style={{ overflowX: 'auto' }}>
                    <table style={s.table}>
                        <thead>
                            <tr>
                                <th style={s.th}>Report Name</th>
                                <th style={s.th}>Frequency</th>
                                <th style={s.th}>Recipients</th>
                                <th style={s.th}>Format</th>
                                <th style={s.th}>Last Sent</th>
                                <th style={s.th}>Next Send</th>
                                <th style={s.th}>Status</th>
                                <th style={s.th}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {schedules.map(sch => (
                                <tr key={sch.id}>
                                    <td style={s.td}>
                                        <div style={{ fontWeight: 600 }}>{sch.name}</div>
                                        <div style={{ color: '#64748b', fontSize: '11px' }}>{sch.template}</div>
                                    </td>
                                    <td style={s.td}>{sch.frequency}{sch.day ? ` (${sch.day})` : ''}</td>
                                    <td style={s.td}>
                                        {sch.recipients.map((r, i) => (
                                            <div key={i} style={{ fontSize: '12px', color: '#94a3b8' }}>{r}</div>
                                        ))}
                                    </td>
                                    <td style={s.td}>
                                        <span style={{ padding: '2px 8px', borderRadius: '4px', background: sch.format === 'PDF' ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)', color: sch.format === 'PDF' ? '#ef4444' : '#10b981', fontSize: '11px', fontWeight: 600 }}>
                                            {sch.format}
                                        </span>
                                    </td>
                                    <td style={s.td}>
                                        {sch.lastSent ? new Date(sch.lastSent).toLocaleDateString() : 'Never'}
                                    </td>
                                    <td style={s.td}>
                                        {sch.nextSend ? new Date(sch.nextSend).toLocaleDateString() : '-'}
                                    </td>
                                    <td style={s.td}>
                                        <span style={s.badge(sch.status === 'Active')}>
                                            {sch.status === 'Active' ? <Play size={10} /> : <Pause size={10} />}
                                            {sch.status}
                                        </span>
                                    </td>
                                    <td style={s.td}>
                                        <div style={s.actionBtns}>
                                            <button style={{ ...s.btn, ...s.btnSmall, ...s.btnSecondary }} onClick={() => toggleStatus(sch.id)} title={sch.status === 'Active' ? 'Pause' : 'Resume'}>
                                                {sch.status === 'Active' ? <Pause size={12} /> : <Play size={12} />}
                                            </button>
                                            <button style={{ ...s.btn, ...s.btnSmall, ...s.btnSuccess }} onClick={() => sendNow(sch.id)} title="Send Now">
                                                <Send size={12} />
                                            </button>
                                            <button style={{ ...s.btn, ...s.btnSmall, ...s.btnSecondary }} onClick={() => setShowPreview(sch)} title="Preview Email">
                                                <Eye size={12} />
                                            </button>
                                            <button style={{ ...s.btn, ...s.btnSmall, ...s.btnSecondary }} onClick={() => setShowHistory(sch)} title="History">
                                                <Clock size={12} />
                                            </button>
                                            <button style={{ ...s.btn, ...s.btnSmall, ...s.btnDanger }} onClick={() => deleteSchedule(sch.id)} title="Delete">
                                                <Trash2 size={12} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Create Form Modal */}
            <AnimatePresence>
                {showForm && (
                    <motion.div style={s.modal} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowForm(false)}>
                        <motion.div style={s.modalContent} initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()}>
                            <h3 style={{ color: '#fff', margin: '0 0 20px', fontSize: '18px' }}>Create Scheduled Report</h3>
                            <div style={s.formGroup}>
                                <label style={s.label}>Report Name</label>
                                <input style={s.input} placeholder="e.g., Weekly Creator Performance" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                            </div>
                            <div style={s.formGroup}>
                                <label style={s.label}>Report Template</label>
                                <input style={s.input} placeholder="Template name..." value={form.template} onChange={e => setForm({ ...form, template: e.target.value })} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div style={s.formGroup}>
                                    <label style={s.label}>Frequency</label>
                                    <select style={s.select} value={form.frequency} onChange={e => setForm({ ...form, frequency: e.target.value })}>
                                        <option value="Daily">Daily</option>
                                        <option value="Weekly">Weekly</option>
                                        <option value="Monthly">Monthly</option>
                                    </select>
                                </div>
                                <div style={s.formGroup}>
                                    <label style={s.label}>Day</label>
                                    <input style={s.input} placeholder="e.g., Monday or 1st" value={form.day} onChange={e => setForm({ ...form, day: e.target.value })} />
                                </div>
                            </div>
                            <div style={s.formGroup}>
                                <label style={s.label}>Recipients (comma-separated emails)</label>
                                <input style={s.input} placeholder="email1@example.com, email2@example.com" value={form.recipients} onChange={e => setForm({ ...form, recipients: e.target.value })} />
                            </div>
                            <div style={s.formGroup}>
                                <label style={s.label}>Format</label>
                                <select style={s.select} value={form.format} onChange={e => setForm({ ...form, format: e.target.value })}>
                                    <option value="CSV">CSV</option>
                                    <option value="PDF">PDF</option>
                                </select>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '16px' }}>
                                <button style={{ ...s.btn, ...s.btnSecondary }} onClick={() => setShowForm(false)}>Cancel</button>
                                <button style={{ ...s.btn, ...s.btnPrimary }} onClick={createSchedule}>Create Schedule</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Email Preview Modal */}
            <AnimatePresence>
                {showPreview && (
                    <motion.div style={s.modal} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPreview(null)}>
                        <motion.div style={s.modalContent} initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()}>
                            <h3 style={{ color: '#fff', margin: '0 0 16px', fontSize: '18px' }}>Email Preview</h3>
                            <div style={s.emailPreview}>
                                <div style={{ marginBottom: '12px' }}>
                                    <div style={{ color: '#94a3b8', fontSize: '11px' }}>To:</div>
                                    <div style={{ color: '#fff', fontSize: '13px' }}>{showPreview.recipients.join(', ')}</div>
                                </div>
                                <div style={{ marginBottom: '12px' }}>
                                    <div style={{ color: '#94a3b8', fontSize: '11px' }}>Subject:</div>
                                    <div style={{ color: '#fff', fontSize: '13px' }}>[Sic CRM] {showPreview.name} - {new Date().toLocaleDateString()}</div>
                                </div>
                                <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.08)', margin: '12px 0' }} />
                                <div style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.6' }}>
                                    <p>Hi there,</p>
                                    <p>Your scheduled report <strong style={{ color: '#fff' }}>{showPreview.name}</strong> is ready.</p>
                                    <p>Report includes data from the {showPreview.template} template, generated on {new Date().toLocaleDateString()}.</p>
                                    <p style={{ color: '#6366f1' }}>[ {showPreview.format} Report Attached ]</p>
                                    <p>Best regards,<br />Sic CRM Platform</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                                <button style={{ ...s.btn, ...s.btnSecondary }} onClick={() => setShowPreview(null)}>Close</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delivery History Modal */}
            <AnimatePresence>
                {showHistory && (
                    <motion.div style={s.modal} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowHistory(null)}>
                        <motion.div style={s.modalContent} initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()}>
                            <h3 style={{ color: '#fff', margin: '0 0 16px', fontSize: '18px' }}>Delivery History - {showHistory.name}</h3>
                            <table style={s.table}>
                                <thead>
                                    <tr>
                                        <th style={s.th}>Date</th>
                                        <th style={s.th}>Status</th>
                                        <th style={s.th}>Recipients</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(showHistory.deliveryHistory || []).map((d, i) => (
                                        <tr key={i}>
                                            <td style={s.td}>{new Date(d.date).toLocaleString()}</td>
                                            <td style={s.td}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    {getStatusIcon(d.status)} {d.status}
                                                </div>
                                            </td>
                                            <td style={s.td}>{d.recipients}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {(!showHistory.deliveryHistory || showHistory.deliveryHistory.length === 0) && (
                                <div style={{ textAlign: 'center', padding: '20px', color: '#64748b', fontSize: '13px' }}>No deliveries yet</div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
                                <button style={{ ...s.btn, ...s.btnSecondary }} onClick={() => setShowHistory(null)}>Close</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default ScheduledReports
