import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar as CalIcon, ChevronLeft, ChevronRight, Filter, X, GripVertical, Eye } from 'lucide-react'
import { getContentSchedule, getCampaigns } from '../../stores/influencerStore'

const card = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 20 }
const selectStyle = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px', color: '#fff', fontSize: 13, outline: 'none' }
const btnSecondary = { background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }

const CAMPAIGN_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899']
const STATUS_COLORS = { Draft: '#64748b', Scheduled: '#3b82f6', Published: '#10b981', 'In Review': '#f59e0b' }
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export default function CampaignCalendar() {
    const [scheduleItems, setScheduleItems] = useState([])
    const [campaigns, setCampaigns] = useState([])
    const [currentDate, setCurrentDate] = useState(new Date())
    const [viewMode, setViewMode] = useState('month')
    const [filterCampaign, setFilterCampaign] = useState('')
    const [filterCreator, setFilterCreator] = useState('')
    const [filterContentType, setFilterContentType] = useState('')
    const [selectedDay, setSelectedDay] = useState(null)
    const [dragItem, setDragItem] = useState(null)

    useEffect(() => {
        setScheduleItems(getContentSchedule())
        setCampaigns(getCampaigns())
    }, [])

    const campaignColorMap = {}
    campaigns.forEach((c, i) => { campaignColorMap[c.id] = CAMPAIGN_COLORS[i % CAMPAIGN_COLORS.length] })

    const filteredItems = scheduleItems.filter(item => {
        if (filterCampaign && item.campaignId !== filterCampaign) return false
        if (filterCreator && !item.creatorName.toLowerCase().includes(filterCreator.toLowerCase())) return false
        if (filterContentType && item.contentType !== filterContentType) return false
        return true
    })

    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    const getMonthDays = () => {
        const firstDay = new Date(year, month, 1).getDay()
        const daysInMonth = new Date(year, month + 1, 0).getDate()
        const days = []
        for (let i = 0; i < firstDay; i++) days.push(null)
        for (let d = 1; d <= daysInMonth; d++) days.push(d)
        return days
    }

    const getWeekDays = () => {
        const startOfWeek = new Date(currentDate)
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date(startOfWeek)
            d.setDate(d.getDate() + i)
            return d
        })
    }

    const getItemsForDate = dateStr => filteredItems.filter(item => item.scheduledDate === dateStr)

    const today = new Date().toISOString().split('T')[0]

    const nav = dir => {
        const d = new Date(currentDate)
        if (viewMode === 'month') d.setMonth(d.getMonth() + dir)
        else d.setDate(d.getDate() + dir * 7)
        setCurrentDate(d)
    }

    const formatDateStr = (y, m, d) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`

    const handleDragStart = item => setDragItem(item)

    const handleDrop = newDateStr => {
        if (!dragItem) return
        setScheduleItems(prev => prev.map(item =>
            item.id === dragItem.id ? { ...item, scheduledDate: newDateStr } : item
        ))
        setDragItem(null)
    }

    const contentTypes = [...new Set(scheduleItems.map(i => i.contentType))]

    const monthDays = getMonthDays()
    const weekDays = getWeekDays()

    return (
        <div style={{ padding: '24px 32px', color: '#fff', minHeight: '100vh' }}>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}><span style={{ background: 'linear-gradient(135deg, #6366f1, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Campaign</span> Calendar</h1>
                <p style={{ color: '#94a3b8', margin: '4px 0 0' }}>Visual calendar of all creator posts across campaigns</p>
            </motion.div>

            {/* Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <button style={btnSecondary} onClick={() => nav(-1)}><ChevronLeft size={16} /></button>
                    <span style={{ fontSize: 16, fontWeight: 600, minWidth: 160, textAlign: 'center' }}>
                        {viewMode === 'month' ? `${MONTHS[month]} ${year}` : `Week of ${weekDays[0].toLocaleDateString()}`}
                    </span>
                    <button style={btnSecondary} onClick={() => nav(1)}><ChevronRight size={16} /></button>
                    <button style={btnSecondary} onClick={() => setCurrentDate(new Date())}>Today</button>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <select style={selectStyle} value={filterCampaign} onChange={e => setFilterCampaign(e.target.value)}>
                        <option value="">All Campaigns</option>
                        {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <select style={selectStyle} value={filterContentType} onChange={e => setFilterContentType(e.target.value)}>
                        <option value="">All Types</option>
                        {contentTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <input style={{ ...selectStyle, width: 130 }} placeholder="Filter creator..." value={filterCreator} onChange={e => setFilterCreator(e.target.value)} />
                    <div style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)' }}>
                        <button onClick={() => setViewMode('month')} style={{ padding: '6px 14px', border: 'none', background: viewMode === 'month' ? 'rgba(99,102,241,0.2)' : 'transparent', color: viewMode === 'month' ? '#a78bfa' : '#64748b', cursor: 'pointer', borderRadius: '8px 0 0 8px', fontSize: 12, fontWeight: 500 }}>Month</button>
                        <button onClick={() => setViewMode('week')} style={{ padding: '6px 14px', border: 'none', background: viewMode === 'week' ? 'rgba(99,102,241,0.2)' : 'transparent', color: viewMode === 'week' ? '#a78bfa' : '#64748b', cursor: 'pointer', borderRadius: '0 8px 8px 0', fontSize: 12, fontWeight: 500 }}>Week</button>
                    </div>
                </div>
            </div>

            {/* Campaign Color Legend */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
                {campaigns.map(c => (
                    <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: campaignColorMap[c.id] }} />
                        <span style={{ color: '#94a3b8' }}>{c.name}</span>
                    </div>
                ))}
            </div>

            {/* Month View */}
            {viewMode === 'month' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={card}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
                        {DAYS.map(d => (
                            <div key={d} style={{ textAlign: 'center', fontSize: 12, color: '#64748b', padding: '8px 0', fontWeight: 600 }}>{d}</div>
                        ))}
                        {monthDays.map((day, i) => {
                            if (day === null) return <div key={`e-${i}`} />
                            const dateStr = formatDateStr(year, month, day)
                            const items = getItemsForDate(dateStr)
                            const isToday = dateStr === today
                            return (
                                <div
                                    key={i}
                                    onClick={() => setSelectedDay(dateStr === selectedDay ? null : dateStr)}
                                    onDragOver={e => e.preventDefault()}
                                    onDrop={() => handleDrop(dateStr)}
                                    style={{ minHeight: 80, padding: 6, borderRadius: 8, cursor: 'pointer', background: isToday ? 'rgba(99,102,241,0.1)' : selectedDay === dateStr ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)', border: isToday ? '1px solid rgba(99,102,241,0.3)' : selectedDay === dateStr ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(255,255,255,0.04)', transition: 'background 0.15s' }}
                                >
                                    <div style={{ fontSize: 12, color: isToday ? '#a78bfa' : '#94a3b8', fontWeight: isToday ? 700 : 400, marginBottom: 4 }}>{day}</div>
                                    {items.slice(0, 3).map(item => (
                                        <div
                                            key={item.id}
                                            draggable
                                            onDragStart={() => handleDragStart(item)}
                                            style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, marginBottom: 2, background: (campaignColorMap[item.campaignId] || '#6366f1') + '25', color: campaignColorMap[item.campaignId] || '#6366f1', borderLeft: `3px solid ${campaignColorMap[item.campaignId] || '#6366f1'}`, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: 'grab' }}
                                        >
                                            {item.creatorName.split(' ')[0]}: {item.contentType}
                                        </div>
                                    ))}
                                    {items.length > 3 && <div style={{ fontSize: 9, color: '#64748b', textAlign: 'center' }}>+{items.length - 3} more</div>}
                                </div>
                            )
                        })}
                    </div>
                </motion.div>
            )}

            {/* Week View */}
            {viewMode === 'week' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={card}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
                        {weekDays.map(d => {
                            const dateStr = d.toISOString().split('T')[0]
                            const items = getItemsForDate(dateStr)
                            const isToday = dateStr === today
                            return (
                                <div key={dateStr} style={{ minHeight: 200 }}>
                                    <div style={{ textAlign: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: 8 }}>
                                        <div style={{ fontSize: 11, color: '#64748b' }}>{DAYS[d.getDay()]}</div>
                                        <div style={{ fontSize: 18, fontWeight: isToday ? 700 : 400, color: isToday ? '#a78bfa' : '#fff' }}>{d.getDate()}</div>
                                    </div>
                                    <div
                                        onDragOver={e => e.preventDefault()}
                                        onDrop={() => handleDrop(dateStr)}
                                        style={{ minHeight: 150, padding: 4 }}
                                    >
                                        {items.map(item => (
                                            <div
                                                key={item.id}
                                                draggable
                                                onDragStart={() => handleDragStart(item)}
                                                style={{ padding: '6px 8px', borderRadius: 6, marginBottom: 6, background: (campaignColorMap[item.campaignId] || '#6366f1') + '15', borderLeft: `3px solid ${campaignColorMap[item.campaignId] || '#6366f1'}`, cursor: 'grab' }}
                                            >
                                                <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 2 }}>{item.creatorName}</div>
                                                <div style={{ fontSize: 10, color: '#94a3b8' }}>{item.contentType}</div>
                                                <div style={{ fontSize: 10, color: '#64748b' }}>{item.scheduledTime}</div>
                                                <div style={{ fontSize: 9, marginTop: 2, padding: '1px 6px', display: 'inline-block', borderRadius: 4, background: (STATUS_COLORS[item.status] || '#64748b') + '20', color: STATUS_COLORS[item.status] || '#64748b' }}>{item.status}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </motion.div>
            )}

            {/* Day Detail Popup */}
            <AnimatePresence>
                {selectedDay && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} style={{ ...card, marginTop: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                            <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Posts for {selectedDay}</h3>
                            <button onClick={() => setSelectedDay(null)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={16} /></button>
                        </div>
                        {getItemsForDate(selectedDay).length > 0 ? getItemsForDate(selectedDay).map(item => (
                            <div key={item.id} style={{ display: 'flex', gap: 14, padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ width: 6, borderRadius: 3, background: campaignColorMap[item.campaignId] || '#6366f1', flexShrink: 0 }} />
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                        <span style={{ fontWeight: 600, fontSize: 14 }}>{item.creatorName}</span>
                                        <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: (STATUS_COLORS[item.status] || '#64748b') + '20', color: STATUS_COLORS[item.status] || '#64748b' }}>{item.status}</span>
                                    </div>
                                    <div style={{ fontSize: 12, color: '#94a3b8' }}>{item.contentType} on {item.platform} at {item.scheduledTime}</div>
                                    {item.caption && <div style={{ fontSize: 12, color: '#cbd5e1', marginTop: 4 }}>{item.caption}</div>}
                                    {item.hashtags && <div style={{ fontSize: 11, color: '#8b5cf6', marginTop: 2 }}>{item.hashtags}</div>}
                                </div>
                            </div>
                        )) : <div style={{ fontSize: 13, color: '#64748b', textAlign: 'center', padding: 20 }}>No posts scheduled for this day</div>}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
