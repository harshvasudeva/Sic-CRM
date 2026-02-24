import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Package, Calendar as CalendarIcon, ChevronDown, CheckCircle, Clock, AlertTriangle, XCircle, Loader, Filter, LayoutGrid, CalendarDays } from 'lucide-react'
import { getCampaigns, updateCampaignCreator, getCreators } from '../../stores/influencerStore'

const STATUSES = ['Pending', 'In Progress', 'Submitted', 'Approved', 'Rejected']
const STATUS_COLORS = { Pending: '#f59e0b', 'In Progress': '#3b82f6', Submitted: '#8b5cf6', Approved: '#10b981', Rejected: '#ef4444' }
const STATUS_ICONS = { Pending: Clock, 'In Progress': Loader, Submitted: Package, Approved: CheckCircle, Rejected: XCircle }

const card = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 16 }
const btnPrimary = { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }
const btnSecondary = { background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }
const selectStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px', color: '#fff', fontSize: 13, outline: 'none' }

export default function DeliverablesTracker() {
    const [campaigns, setCampaigns] = useState([])
    const [creatorsMap, setCreatorsMap] = useState({})
    const [selectedCampaign, setSelectedCampaign] = useState('')
    const [viewMode, setViewMode] = useState('cards')
    const [bulkStatus, setBulkStatus] = useState('')
    const [selectedItems, setSelectedItems] = useState([])

    useEffect(() => {
        const camps = getCampaigns()
        setCampaigns(camps)
        if (camps.length > 0) setSelectedCampaign(camps[0].id)
        const crs = getCreators()
        const map = {}
        crs.forEach(c => { map[c.id] = c })
        setCreatorsMap(map)
    }, [])

    const campaign = campaigns.find(c => c.id === selectedCampaign)
    const today = new Date().toISOString().split('T')[0]

    const totalDeliverables = campaign ? campaign.creators.reduce((s, cr) => s + cr.deliverables.length, 0) : 0
    const deliveredCount = campaign ? campaign.creators.reduce((s, cr) => s + cr.deliverables.filter(d => d.status === 'Approved' || d.status === 'Delivered').length, 0) : 0
    const progressPct = totalDeliverables > 0 ? Math.round((deliveredCount / totalDeliverables) * 100) : 0

    const handleStatusUpdate = (creatorId, delIndex, newStatus) => {
        if (!campaign) return
        const crData = campaign.creators.find(cr => cr.creatorId === creatorId)
        if (!crData) return
        const newDeliverables = [...crData.deliverables]
        newDeliverables[delIndex] = { ...newDeliverables[delIndex], status: newStatus }
        updateCampaignCreator(campaign.id, creatorId, { deliverables: newDeliverables })
        setCampaigns(getCampaigns())
    }

    const handleBulkUpdate = () => {
        if (!bulkStatus || !selectedItems.length || !campaign) return
        selectedItems.forEach(item => {
            handleStatusUpdate(item.creatorId, item.delIndex, bulkStatus)
        })
        setSelectedItems([])
        setBulkStatus('')
    }

    const toggleSelect = (creatorId, delIndex) => {
        const key = `${creatorId}-${delIndex}`
        setSelectedItems(prev => {
            const exists = prev.find(i => `${i.creatorId}-${i.delIndex}` === key)
            if (exists) return prev.filter(i => `${i.creatorId}-${i.delIndex}` !== key)
            return [...prev, { creatorId, delIndex }]
        })
    }

    const isOverdue = dueDate => dueDate && dueDate < today

    // Calendar data
    const getCalendarDays = () => {
        const now = new Date()
        const year = now.getFullYear()
        const month = now.getMonth()
        const firstDay = new Date(year, month, 1).getDay()
        const daysInMonth = new Date(year, month + 1, 0).getDate()
        const days = []
        for (let i = 0; i < firstDay; i++) days.push(null)
        for (let d = 1; d <= daysInMonth; d++) days.push(d)
        return { days, year, month }
    }

    const getDeliverablesByDate = dateStr => {
        if (!campaign) return []
        const items = []
        campaign.creators.forEach(cr => {
            cr.deliverables.forEach((d, i) => {
                if (d.dueDate === dateStr) items.push({ ...d, creatorId: cr.creatorId, creatorName: creatorsMap[cr.creatorId]?.name || 'Unknown', index: i })
            })
        })
        return items
    }

    const calData = getCalendarDays()
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

    return (
        <div style={{ padding: '24px 32px', color: '#fff', minHeight: '100vh' }}>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}><span style={{ background: 'linear-gradient(135deg, #6366f1, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Deliverables</span> Tracker</h1>
                <p style={{ color: '#94a3b8', margin: '4px 0 0' }}>Track content deliverables across all campaign creators</p>
            </motion.div>

            {/* Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <select style={selectStyle} value={selectedCampaign} onChange={e => { setSelectedCampaign(e.target.value); setSelectedItems([]) }}>
                        {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)' }}>
                        <button style={{ padding: '7px 12px', background: viewMode === 'cards' ? 'rgba(99,102,241,0.2)' : 'transparent', border: 'none', color: viewMode === 'cards' ? '#a78bfa' : '#64748b', cursor: 'pointer', borderRadius: '8px 0 0 8px' }} onClick={() => setViewMode('cards')}><LayoutGrid size={15} /></button>
                        <button style={{ padding: '7px 12px', background: viewMode === 'calendar' ? 'rgba(99,102,241,0.2)' : 'transparent', border: 'none', color: viewMode === 'calendar' ? '#a78bfa' : '#64748b', cursor: 'pointer', borderRadius: '0 8px 8px 0' }} onClick={() => setViewMode('calendar')}><CalendarDays size={15} /></button>
                    </div>
                </div>
                {selectedItems.length > 0 && (
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span style={{ fontSize: 12, color: '#94a3b8' }}>{selectedItems.length} selected</span>
                        <select style={selectStyle} value={bulkStatus} onChange={e => setBulkStatus(e.target.value)}>
                            <option value="">Set Status...</option>
                            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <button style={btnPrimary} onClick={handleBulkUpdate} disabled={!bulkStatus}>Apply</button>
                    </div>
                )}
            </div>

            {/* Progress Bar */}
            {campaign && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ ...card, marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                        <span style={{ fontSize: 14, fontWeight: 600 }}>{campaign.name} -- Progress</span>
                        <span style={{ fontSize: 13, color: '#94a3b8' }}>{deliveredCount} of {totalDeliverables} delivered ({progressPct}%)</span>
                    </div>
                    <div style={{ height: 8, background: 'rgba(255,255,255,0.1)', borderRadius: 4, overflow: 'hidden' }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: `${progressPct}%` }} transition={{ duration: 0.8 }} style={{ height: '100%', background: 'linear-gradient(90deg, #6366f1, #10b981)', borderRadius: 4 }} />
                    </div>
                </motion.div>
            )}

            {/* Cards View */}
            {viewMode === 'cards' && campaign && (
                <div style={{ display: 'grid', gap: 16 }}>
                    {campaign.creators.map(cr => {
                        const creator = creatorsMap[cr.creatorId]
                        return (
                            <motion.div key={cr.creatorId} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={card}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: 15 }}>{creator?.name || 'Unknown Creator'}</div>
                                        <div style={{ fontSize: 12, color: '#94a3b8' }}>{creator?.handle} - {creator?.platform}</div>
                                    </div>
                                    <div style={{ fontSize: 12, color: '#94a3b8' }}>
                                        {cr.deliverables.filter(d => d.status === 'Approved' || d.status === 'Delivered').length}/{cr.deliverables.length} done
                                    </div>
                                </div>
                                <div style={{ display: 'grid', gap: 8 }}>
                                    {cr.deliverables.map((d, i) => {
                                        const overdue = isOverdue(d.dueDate) && d.status !== 'Approved' && d.status !== 'Delivered'
                                        const StatusIcon = STATUS_ICONS[d.status] || Clock
                                        const selKey = `${cr.creatorId}-${i}`
                                        const isSelected = selectedItems.find(item => `${item.creatorId}-${item.delIndex}` === selKey)
                                        return (
                                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 8, background: overdue ? 'rgba(239,68,68,0.08)' : 'rgba(255,255,255,0.03)', border: overdue ? '1px solid rgba(239,68,68,0.3)' : '1px solid rgba(255,255,255,0.05)' }}>
                                                <input type="checkbox" checked={!!isSelected} onChange={() => toggleSelect(cr.creatorId, i)} style={{ accentColor: '#6366f1' }} />
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                        <span style={{ fontWeight: 500, fontSize: 13 }}>{d.quantity}x {d.type}</span>
                                                        {overdue && <AlertTriangle size={13} color="#ef4444" />}
                                                    </div>
                                                    <div style={{ fontSize: 11, color: overdue ? '#ef4444' : '#64748b' }}>
                                                        Due: {d.dueDate || 'Not set'} {overdue && '(Overdue)'}
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                    <StatusIcon size={13} color={STATUS_COLORS[d.status]} />
                                                    <select style={{ ...selectStyle, fontSize: 12, padding: '4px 8px', color: STATUS_COLORS[d.status], background: STATUS_COLORS[d.status] + '15' }} value={d.status} onChange={e => handleStatusUpdate(cr.creatorId, i, e.target.value)}>
                                                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                                                        <option value="Delivered">Delivered</option>
                                                    </select>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </motion.div>
                        )
                    })}
                </div>
            )}

            {/* Calendar View */}
            {viewMode === 'calendar' && campaign && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={card}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 16px', textAlign: 'center' }}>{monthNames[calData.month]} {calData.year}</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                            <div key={d} style={{ textAlign: 'center', fontSize: 11, color: '#64748b', padding: '4px 0', fontWeight: 600 }}>{d}</div>
                        ))}
                        {calData.days.map((day, i) => {
                            if (day === null) return <div key={`empty-${i}`} />
                            const dateStr = `${calData.year}-${String(calData.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                            const items = getDeliverablesByDate(dateStr)
                            const isToday = dateStr === today
                            return (
                                <div key={i} style={{ minHeight: 60, padding: 4, borderRadius: 6, background: isToday ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.02)', border: isToday ? '1px solid rgba(99,102,241,0.3)' : '1px solid rgba(255,255,255,0.05)' }}>
                                    <div style={{ fontSize: 11, color: isToday ? '#a78bfa' : '#64748b', fontWeight: isToday ? 700 : 400, marginBottom: 2 }}>{day}</div>
                                    {items.map((item, j) => (
                                        <div key={j} style={{ fontSize: 9, padding: '2px 4px', borderRadius: 3, background: STATUS_COLORS[item.status] + '20', color: STATUS_COLORS[item.status], marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {item.creatorName.split(' ')[0]}: {item.type}
                                        </div>
                                    ))}
                                </div>
                            )
                        })}
                    </div>
                </motion.div>
            )}

            {!campaign && <div style={{ ...card, textAlign: 'center', color: '#64748b', padding: 40 }}>No campaigns found. Create a campaign first.</div>}
        </div>
    )
}
