import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Eye, Plus, Search, Trash2, ArrowUpCircle, Star, X,
    SortAsc, ChevronDown, Filter, AlertTriangle, Flag
} from 'lucide-react'

const STORAGE_KEY = 'sic-influencer-watchlist'

const PRIORITY_CONFIG = {
    High: { color: '#ef4444', bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.3)' },
    Medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)' },
    Low: { color: '#10b981', bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)' },
}

const styles = {
    page: { padding: '24px', maxWidth: 1200, margin: '0 auto' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    title: { color: '#fff', fontSize: 22, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 },
    subtitle: { color: '#94a3b8', fontSize: 13, marginTop: 4 },
    card: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 20 },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 },
    watchCard: (priority) => ({
        background: 'rgba(255,255,255,0.05)',
        border: `1px solid ${PRIORITY_CONFIG[priority]?.border || 'rgba(255,255,255,0.1)'}`,
        borderRadius: 12, padding: 16, position: 'relative', transition: 'transform 0.2s, box-shadow 0.2s'
    }),
    priorityBadge: (priority) => ({
        display: 'inline-flex', alignItems: 'center', gap: 4,
        background: PRIORITY_CONFIG[priority]?.bg || 'rgba(255,255,255,0.05)',
        color: PRIORITY_CONFIG[priority]?.color || '#94a3b8',
        border: `1px solid ${PRIORITY_CONFIG[priority]?.border || 'rgba(255,255,255,0.1)'}`,
        borderRadius: 12, padding: '3px 10px', fontSize: 11, fontWeight: 600
    }),
    input: { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 12px', color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box' },
    select: { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px', color: '#fff', fontSize: 13, outline: 'none' },
    btnPrimary: { background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 },
    btnDanger: { background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '6px 12px', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 },
    btnSuccess: { background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 8, padding: '6px 12px', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 },
    row: { display: 'flex', gap: 10, marginBottom: 14 },
    formGroup: { flex: 1 },
    label: { color: '#94a3b8', fontSize: 12, fontWeight: 600, marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' },
    statCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '14px 18px', textAlign: 'center' },
    filterBar: { display: 'flex', gap: 10, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' },
    modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    modalContent: { background: '#1e1e2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 24, width: 480 },
}

const sampleWatchlist = [
    { id: 'wl-001', name: 'Virat Style', platform: 'Instagram', handle: '@viratstyle', followers: 250000, priority: 'High', reason: 'Perfect fit for upcoming sports brand campaign. High engagement rate.', addedAt: '2026-02-10' },
    { id: 'wl-002', name: 'CodeWithMe', platform: 'YouTube', handle: '@codewithme', followers: 430000, priority: 'Medium', reason: 'Tech niche, good for SaaS product launches. Waiting for rate sheet.', addedAt: '2026-02-15' },
    { id: 'wl-003', name: 'FoodieMania', platform: 'Instagram', handle: '@foodiemania_in', followers: 180000, priority: 'Low', reason: 'Keep an eye on growth. Potential for food brand collabs in Q2.', addedAt: '2026-02-20' },
]

export default function CreatorWatchlist() {
    const [watchlist, setWatchlist] = useState(() => {
        const stored = localStorage.getItem(STORAGE_KEY)
        return stored ? JSON.parse(stored) : sampleWatchlist
    })
    const [showForm, setShowForm] = useState(false)
    const [search, setSearch] = useState('')
    const [sortBy, setSortBy] = useState('addedAt')
    const [filterPriority, setFilterPriority] = useState('')
    const [form, setForm] = useState({ name: '', platform: 'Instagram', handle: '', followers: '', priority: 'Medium', reason: '' })

    useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlist)) }, [watchlist])

    function addToWatchlist() {
        if (!form.name.trim()) return
        const item = { ...form, id: `wl-${Date.now()}`, followers: Number(form.followers) || 0, addedAt: new Date().toISOString().split('T')[0] }
        setWatchlist(prev => [...prev, item])
        setForm({ name: '', platform: 'Instagram', handle: '', followers: '', priority: 'Medium', reason: '' })
        setShowForm(false)
    }

    function removeFromWatchlist(id) {
        setWatchlist(prev => prev.filter(w => w.id !== id))
    }

    function promotePriority(id) {
        setWatchlist(prev => prev.map(w => {
            if (w.id !== id) return w
            const order = ['Low', 'Medium', 'High']
            const idx = order.indexOf(w.priority)
            return { ...w, priority: order[Math.min(idx + 1, 2)] }
        }))
    }

    const filtered = watchlist
        .filter(w => !search || w.name.toLowerCase().includes(search.toLowerCase()) || w.handle.toLowerCase().includes(search.toLowerCase()))
        .filter(w => !filterPriority || w.priority === filterPriority)
        .sort((a, b) => {
            if (sortBy === 'name') return a.name.localeCompare(b.name)
            if (sortBy === 'followers') return b.followers - a.followers
            if (sortBy === 'priority') { const o = { High: 0, Medium: 1, Low: 2 }; return o[a.priority] - o[b.priority] }
            return new Date(b.addedAt) - new Date(a.addedAt)
        })

    const stats = {
        total: watchlist.length,
        high: watchlist.filter(w => w.priority === 'High').length,
        medium: watchlist.filter(w => w.priority === 'Medium').length,
        low: watchlist.filter(w => w.priority === 'Low').length,
    }

    return (
        <motion.div style={styles.page} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div style={styles.header}>
                <div>
                    <div style={styles.title}><Eye size={22} color="#6366f1" /> Creator Watchlist</div>
                    <div style={styles.subtitle}>Track creators you want to work with in the future</div>
                </div>
                <button style={styles.btnPrimary} onClick={() => setShowForm(true)}><Plus size={16} /> Add Creator</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
                {[{ label: 'Total', value: stats.total, color: '#6366f1' }, { label: 'High', value: stats.high, color: '#ef4444' }, { label: 'Medium', value: stats.medium, color: '#f59e0b' }, { label: 'Low', value: stats.low, color: '#10b981' }].map(s => (
                    <div key={s.label} style={styles.statCard}>
                        <div style={{ color: s.color, fontSize: 24, fontWeight: 700 }}>{s.value}</div>
                        <div style={{ color: '#94a3b8', fontSize: 12 }}>{s.label} Priority</div>
                    </div>
                ))}
            </div>

            <div style={styles.filterBar}>
                <div style={{ position: 'relative', flex: 1, maxWidth: 300 }}>
                    <Search size={14} style={{ position: 'absolute', left: 12, top: 11, color: '#64748b' }} />
                    <input style={{ ...styles.input, paddingLeft: 36 }} value={search} onChange={e => setSearch(e.target.value)} placeholder="Search watchlist..." />
                </div>
                <select style={styles.select} value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
                    <option value="">All Priorities</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                </select>
                <select style={styles.select} value={sortBy} onChange={e => setSortBy(e.target.value)}>
                    <option value="addedAt">Sort: Date Added</option>
                    <option value="name">Sort: Name</option>
                    <option value="followers">Sort: Followers</option>
                    <option value="priority">Sort: Priority</option>
                </select>
            </div>

            {filtered.length === 0 ? (
                <div style={{ ...styles.card, textAlign: 'center', padding: 60, color: '#64748b' }}>
                    <Eye size={40} strokeWidth={1} />
                    <div style={{ marginTop: 12, fontSize: 15 }}>Watchlist is empty</div>
                    <div style={{ fontSize: 12, marginTop: 4 }}>Add creators you want to track for future collaborations</div>
                </div>
            ) : (
                <div style={styles.grid}>
                    <AnimatePresence>
                        {filtered.map(item => (
                            <motion.div
                                key={item.id}
                                style={styles.watchCard(item.priority)}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                whileHover={{ transform: 'translateY(-2px)', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                                    <div>
                                        <div style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>{item.name}</div>
                                        <div style={{ color: '#94a3b8', fontSize: 12 }}>{item.handle} | {item.platform}</div>
                                    </div>
                                    <span style={styles.priorityBadge(item.priority)}><Flag size={10} /> {item.priority}</span>
                                </div>

                                <div style={{ color: '#94a3b8', fontSize: 12, marginBottom: 4 }}>
                                    {item.followers.toLocaleString()} followers
                                </div>

                                {item.reason && (
                                    <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '8px 10px', marginTop: 10, marginBottom: 10 }}>
                                        <div style={{ color: '#94a3b8', fontSize: 11, marginBottom: 2 }}>Reason</div>
                                        <div style={{ color: '#e2e8f0', fontSize: 13, lineHeight: 1.5 }}>{item.reason}</div>
                                    </div>
                                )}

                                <div style={{ color: '#64748b', fontSize: 11, marginBottom: 10 }}>Added: {item.addedAt}</div>

                                <div style={{ display: 'flex', gap: 8 }}>
                                    {item.priority !== 'High' && (
                                        <button style={styles.btnSuccess} onClick={() => promotePriority(item.id)}>
                                            <ArrowUpCircle size={12} /> Promote
                                        </button>
                                    )}
                                    <button style={styles.btnDanger} onClick={() => removeFromWatchlist(item.id)}>
                                        <Trash2 size={12} /> Remove
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            <AnimatePresence>
                {showForm && (
                    <motion.div style={styles.modal} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowForm(false)}>
                        <motion.div style={styles.modalContent} initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                <div style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>Add to Watchlist</div>
                                <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={20} /></button>
                            </div>

                            <div style={styles.row}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Creator Name *</label>
                                    <input style={styles.input} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Priya Sharma" />
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Handle</label>
                                    <input style={styles.input} value={form.handle} onChange={e => setForm(p => ({ ...p, handle: e.target.value }))} placeholder="@handle" />
                                </div>
                            </div>

                            <div style={styles.row}>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Platform</label>
                                    <select style={{ ...styles.select, width: '100%' }} value={form.platform} onChange={e => setForm(p => ({ ...p, platform: e.target.value }))}>
                                        <option value="Instagram">Instagram</option>
                                        <option value="YouTube">YouTube</option>
                                        <option value="Twitter">Twitter</option>
                                        <option value="LinkedIn">LinkedIn</option>
                                    </select>
                                </div>
                                <div style={styles.formGroup}>
                                    <label style={styles.label}>Followers</label>
                                    <input style={styles.input} type="number" value={form.followers} onChange={e => setForm(p => ({ ...p, followers: e.target.value }))} placeholder="e.g. 50000" />
                                </div>
                            </div>

                            <div style={{ marginBottom: 14 }}>
                                <label style={styles.label}>Priority</label>
                                <div style={{ display: 'flex', gap: 8 }}>
                                    {['High', 'Medium', 'Low'].map(p => (
                                        <button key={p} style={styles.priorityBadge(p)} onClick={() => setForm(prev => ({ ...prev, priority: p }))}>
                                            {form.priority === p && <Star size={10} />} {p}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div style={{ marginBottom: 14 }}>
                                <label style={styles.label}>Reason</label>
                                <textarea style={{ ...styles.input, minHeight: 80, resize: 'vertical', fontFamily: 'inherit' }} value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))} placeholder="Why are you watching this creator?" />
                            </div>

                            <button style={{ ...styles.btnPrimary, width: '100%', justifyContent: 'center' }} onClick={addToWatchlist}>
                                <Plus size={16} /> Add to Watchlist
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}
