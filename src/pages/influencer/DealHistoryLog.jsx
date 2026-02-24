import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    History, Plus, Star, TrendingUp, TrendingDown, DollarSign,
    User, X, Award, Calendar, ChevronDown, Package
} from 'lucide-react'
import { getCreators, addDealToCreator } from '../../stores/influencerStore'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

const styles = {
    page: { padding: '24px', maxWidth: 1200, margin: '0 auto' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    title: { color: '#fff', fontSize: 22, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 },
    subtitle: { color: '#94a3b8', fontSize: 13, marginTop: 4 },
    card: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 20 },
    grid: { display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20 },
    creatorItem: (active) => ({ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, cursor: 'pointer', background: active ? 'rgba(99,102,241,0.15)' : 'transparent', borderLeft: active ? '3px solid #6366f1' : '3px solid transparent', transition: 'all 0.2s', marginBottom: 4 }),
    select: { width: '100%', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px', color: '#fff', fontSize: 13, outline: 'none', boxSizing: 'border-box' },
    input: { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px', color: '#fff', fontSize: 13, outline: 'none', boxSizing: 'border-box' },
    label: { color: '#94a3b8', fontSize: 12, fontWeight: 600, marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' },
    btnPrimary: { background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 },
    btnGhost: { background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '6px 12px', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 },
    statCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '14px 16px' },
    table: { width: '100%', borderCollapse: 'collapse' },
    th: { color: '#94a3b8', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', padding: '10px 12px', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.08)' },
    td: { padding: '10px 12px', color: '#e2e8f0', fontSize: 13, borderBottom: '1px solid rgba(255,255,255,0.05)' },
    statusBadge: (status) => {
        const colors = { Completed: '#10b981', Partial: '#f59e0b', Cancelled: '#ef4444', Pending: '#3b82f6' }
        const c = colors[status] || '#94a3b8'
        return { display: 'inline-flex', padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600, background: `${c}22`, color: c }
    },
    ratingStars: { display: 'flex', gap: 2 },
    row: { display: 'flex', gap: 10, marginBottom: 12 },
    formGroup: { flex: 1 },
    emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 60, color: '#64748b' },
    avatar: { width: 32, height: 32, borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 600, flexShrink: 0 },
    modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    modalContent: { background: '#1e1e2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 24, width: 500 },
}

const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null
    return (
        <div style={{ background: '#1e1e2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px' }}>
            <div style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>{payload[0].payload.brand}</div>
            <div style={{ color: '#6366f1', fontSize: 12 }}>Amount: {Number(payload[0].value).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}</div>
            <div style={{ color: '#94a3b8', fontSize: 11 }}>{payload[0].payload.date}</div>
        </div>
    )
}

export default function DealHistoryLog() {
    const [creators, setCreators] = useState([])
    const [selectedCreator, setSelectedCreator] = useState(null)
    const [showAddDeal, setShowAddDeal] = useState(false)
    const [dealForm, setDealForm] = useState({ brand: '', amount: '', deliverables: '', date: '', status: 'Completed', rating: 5 })

    useEffect(() => { setCreators(getCreators()) }, [])

    function loadCreators() {
        const all = getCreators()
        setCreators(all)
        if (selectedCreator) {
            setSelectedCreator(all.find(c => c.id === selectedCreator.id) || null)
        }
    }

    function handleAddDeal() {
        if (!dealForm.brand || !dealForm.amount || !selectedCreator) return
        addDealToCreator(selectedCreator.id, {
            brand: dealForm.brand,
            amount: Number(dealForm.amount),
            deliverables: dealForm.deliverables,
            date: dealForm.date || new Date().toISOString().split('T')[0],
            status: dealForm.status,
            rating: dealForm.rating,
        })
        setDealForm({ brand: '', amount: '', deliverables: '', date: '', status: 'Completed', rating: 5 })
        setShowAddDeal(false)
        loadCreators()
    }

    const deals = selectedCreator?.dealHistory || []
    const totalEarnings = deals.reduce((s, d) => s + (d.amount || 0), 0)
    const bestDeal = deals.length > 0 ? deals.reduce((max, d) => d.amount > max.amount ? d : max, deals[0]) : null
    const worstDeal = deals.length > 0 ? deals.reduce((min, d) => d.amount < min.amount ? d : min, deals[0]) : null
    const chartData = deals.slice().sort((a, b) => new Date(a.date) - new Date(b.date)).map(d => ({ brand: d.brand, amount: d.amount, date: d.date }))

    return (
        <motion.div style={styles.page} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div style={styles.header}>
                <div>
                    <div style={styles.title}><History size={22} color="#6366f1" /> Deal History Log</div>
                    <div style={styles.subtitle}>Track all deals, earnings, and rate trends per creator</div>
                </div>
            </div>

            <div style={styles.grid}>
                <div style={{ ...styles.card, padding: 14 }}>
                    <div style={{ color: '#fff', fontWeight: 600, fontSize: 14, marginBottom: 12 }}>Select Creator</div>
                    <div style={{ maxHeight: 500, overflowY: 'auto' }}>
                        {creators.map(c => (
                            <div key={c.id} style={styles.creatorItem(selectedCreator?.id === c.id)} onClick={() => setSelectedCreator(c)}>
                                <div style={styles.avatar}>{c.name[0]}</div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ color: '#fff', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</div>
                                    <div style={{ color: '#64748b', fontSize: 11 }}>{c.platform} | {(c.dealHistory || []).length} deals</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    {selectedCreator ? (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                <div>
                                    <div style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>{selectedCreator.name}</div>
                                    <div style={{ color: '#94a3b8', fontSize: 13 }}>{selectedCreator.platform} | {selectedCreator.niche}</div>
                                </div>
                                <button style={styles.btnPrimary} onClick={() => setShowAddDeal(true)}><Plus size={14} /> Add Deal</button>
                            </div>

                            <div style={styles.statsGrid}>
                                <div style={styles.statCard}>
                                    <div style={{ color: '#64748b', fontSize: 11, marginBottom: 4, textTransform: 'uppercase' }}>Total Earnings</div>
                                    <div style={{ color: '#10b981', fontSize: 22, fontWeight: 700 }}>{totalEarnings.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}</div>
                                    <div style={{ color: '#64748b', fontSize: 11 }}>{deals.length} deals</div>
                                </div>
                                <div style={styles.statCard}>
                                    <div style={{ color: '#64748b', fontSize: 11, marginBottom: 4, textTransform: 'uppercase' }}>Best Deal</div>
                                    {bestDeal ? (
                                        <>
                                            <div style={{ color: '#6366f1', fontSize: 18, fontWeight: 700 }}>{bestDeal.amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}</div>
                                            <div style={{ color: '#64748b', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}><TrendingUp size={11} color="#10b981" /> {bestDeal.brand}</div>
                                        </>
                                    ) : <div style={{ color: '#64748b', fontSize: 13 }}>No deals yet</div>}
                                </div>
                                <div style={styles.statCard}>
                                    <div style={{ color: '#64748b', fontSize: 11, marginBottom: 4, textTransform: 'uppercase' }}>Lowest Deal</div>
                                    {worstDeal ? (
                                        <>
                                            <div style={{ color: '#f59e0b', fontSize: 18, fontWeight: 700 }}>{worstDeal.amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}</div>
                                            <div style={{ color: '#64748b', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}><TrendingDown size={11} color="#f59e0b" /> {worstDeal.brand}</div>
                                        </>
                                    ) : <div style={{ color: '#64748b', fontSize: 13 }}>No deals yet</div>}
                                </div>
                            </div>

                            {chartData.length > 1 && (
                                <motion.div style={{ ...styles.card, marginBottom: 16 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                    <div style={{ color: '#fff', fontWeight: 600, fontSize: 14, marginBottom: 14 }}>Rate Trend</div>
                                    <ResponsiveContainer width="100%" height={200}>
                                        <LineChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                            <XAxis dataKey="brand" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                                            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                                            <Tooltip content={<CustomTooltip />} />
                                            <Line type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', r: 4 }} activeDot={{ r: 6 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </motion.div>
                            )}

                            <motion.div style={styles.card} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <div style={{ color: '#fff', fontWeight: 600, fontSize: 14, marginBottom: 14 }}>Deal History</div>
                                {deals.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: 30, color: '#64748b' }}>
                                        <Package size={30} strokeWidth={1} />
                                        <div style={{ marginTop: 8, fontSize: 13 }}>No deals recorded yet</div>
                                    </div>
                                ) : (
                                    <table style={styles.table}>
                                        <thead>
                                            <tr>
                                                <th style={styles.th}>Date</th>
                                                <th style={styles.th}>Brand</th>
                                                <th style={styles.th}>Deliverables</th>
                                                <th style={styles.th}>Amount</th>
                                                <th style={styles.th}>Status</th>
                                                <th style={styles.th}>Rating</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {deals.slice().sort((a, b) => new Date(b.date) - new Date(a.date)).map(deal => (
                                                <tr key={deal.id}>
                                                    <td style={styles.td}>{deal.date}</td>
                                                    <td style={{ ...styles.td, fontWeight: 600 }}>{deal.brand}</td>
                                                    <td style={styles.td}>{deal.deliverables}</td>
                                                    <td style={{ ...styles.td, color: '#10b981', fontWeight: 600 }}>{(deal.amount || 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}</td>
                                                    <td style={styles.td}><span style={styles.statusBadge(deal.status)}>{deal.status}</span></td>
                                                    <td style={styles.td}>
                                                        <div style={styles.ratingStars}>
                                                            {[1, 2, 3, 4, 5].map(s => (
                                                                <Star key={s} size={12} fill={s <= (deal.rating || 0) ? '#f59e0b' : 'none'} color={s <= (deal.rating || 0) ? '#f59e0b' : '#475569'} />
                                                            ))}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </motion.div>
                        </>
                    ) : (
                        <div style={{ ...styles.card, ...styles.emptyState, minHeight: 400 }}>
                            <User size={40} strokeWidth={1} />
                            <div style={{ marginTop: 12, fontSize: 15 }}>Select a creator</div>
                            <div style={{ fontSize: 12, marginTop: 4 }}>Choose a creator to view their deal history and earnings</div>
                        </div>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {showAddDeal && (
                    <motion.div style={styles.modal} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddDeal(false)}>
                        <motion.div style={styles.modalContent} initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                <div style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>Add Deal for {selectedCreator?.name}</div>
                                <button onClick={() => setShowAddDeal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={20} /></button>
                            </div>

                            <div style={styles.row}>
                                <div style={styles.formGroup}><label style={styles.label}>Brand *</label><input style={styles.input} value={dealForm.brand} onChange={e => setDealForm(p => ({ ...p, brand: e.target.value }))} placeholder="e.g. Nykaa" /></div>
                                <div style={styles.formGroup}><label style={styles.label}>Amount *</label><input style={styles.input} type="number" value={dealForm.amount} onChange={e => setDealForm(p => ({ ...p, amount: e.target.value }))} placeholder="e.g. 80000" /></div>
                            </div>
                            <div style={{ marginBottom: 12 }}><label style={styles.label}>Deliverables</label><input style={styles.input} value={dealForm.deliverables} onChange={e => setDealForm(p => ({ ...p, deliverables: e.target.value }))} placeholder="e.g. 2 Reels + 3 Stories" /></div>
                            <div style={styles.row}>
                                <div style={styles.formGroup}><label style={styles.label}>Date</label><input style={styles.input} type="date" value={dealForm.date} onChange={e => setDealForm(p => ({ ...p, date: e.target.value }))} /></div>
                                <div style={styles.formGroup}><label style={styles.label}>Status</label><select style={styles.select} value={dealForm.status} onChange={e => setDealForm(p => ({ ...p, status: e.target.value }))}><option>Completed</option><option>Partial</option><option>Cancelled</option><option>Pending</option></select></div>
                            </div>
                            <div style={{ marginBottom: 16 }}>
                                <label style={styles.label}>Rating</label>
                                <div style={styles.ratingStars}>
                                    {[1, 2, 3, 4, 5].map(s => (
                                        <Star key={s} size={20} style={{ cursor: 'pointer' }} fill={s <= dealForm.rating ? '#f59e0b' : 'none'} color={s <= dealForm.rating ? '#f59e0b' : '#475569'} onClick={() => setDealForm(p => ({ ...p, rating: s }))} />
                                    ))}
                                </div>
                            </div>
                            <button style={{ ...styles.btnPrimary, width: '100%', justifyContent: 'center' }} onClick={handleAddDeal}><Plus size={14} /> Add Deal</button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}
