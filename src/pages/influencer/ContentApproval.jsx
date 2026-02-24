import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, MessageSquare, Clock, Filter, Check, X, AlertCircle, Send, Eye, FileText, ChevronDown } from 'lucide-react'
import { getContentSchedule, updateContentScheduleItem } from '../../stores/influencerStore'

const STATUSES = ['All', 'Draft', 'Scheduled', 'Published', 'In Review']
const APPROVAL_STATUSES = ['Pending', 'Approved', 'Changes Requested', 'Rejected']
const APPROVAL_COLORS = { Pending: '#f59e0b', Approved: '#10b981', 'Changes Requested': '#3b82f6', Rejected: '#ef4444' }
const APPROVAL_ICONS = { Pending: Clock, Approved: CheckCircle, 'Changes Requested': MessageSquare, Rejected: XCircle }

const card = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 20 }
const input = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 14px', color: '#fff', width: '100%', fontSize: 14, outline: 'none' }
const btnPrimary = { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }
const btnSecondary = { background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }

export default function ContentApproval() {
    const [items, setItems] = useState([])
    const [filter, setFilter] = useState('All')
    const [approvalFilter, setApprovalFilter] = useState('All')
    const [feedback, setFeedback] = useState({})
    const [approvalHistory, setApprovalHistory] = useState([])
    const [selectedItems, setSelectedItems] = useState([])
    const [expandedId, setExpandedId] = useState(null)

    useEffect(() => {
        const schedule = getContentSchedule()
        const withApproval = schedule.map(item => ({
            ...item,
            approvalStatus: item.approvalStatus || 'Pending',
            approvalHistory: item.approvalHistory || [],
        }))
        setItems(withApproval)
    }, [])

    const filteredItems = items.filter(item => {
        if (filter !== 'All' && item.status !== filter) return false
        if (approvalFilter !== 'All' && item.approvalStatus !== approvalFilter) return false
        return true
    })

    const handleApproval = (itemId, status) => {
        const comment = feedback[itemId] || ''
        const historyEntry = { status, comment, timestamp: new Date().toISOString(), reviewer: 'You' }

        setItems(prev => prev.map(item =>
            item.id === itemId
                ? { ...item, approvalStatus: status, approvalHistory: [...item.approvalHistory, historyEntry] }
                : item
        ))
        setApprovalHistory(prev => [{ itemId, ...historyEntry, creatorName: items.find(i => i.id === itemId)?.creatorName || '' }, ...prev])
        setFeedback(prev => ({ ...prev, [itemId]: '' }))

        updateContentScheduleItem(itemId, { approvalStatus: status })
    }

    const handleBulkApprove = () => {
        selectedItems.forEach(id => handleApproval(id, 'Approved'))
        setSelectedItems([])
    }

    const toggleSelect = id => {
        setSelectedItems(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
    }

    const counts = {
        Pending: items.filter(i => i.approvalStatus === 'Pending').length,
        Approved: items.filter(i => i.approvalStatus === 'Approved').length,
        'Changes Requested': items.filter(i => i.approvalStatus === 'Changes Requested').length,
        Rejected: items.filter(i => i.approvalStatus === 'Rejected').length,
    }

    return (
        <div style={{ padding: '24px 32px', color: '#fff', minHeight: '100vh' }}>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}><span style={{ background: 'linear-gradient(135deg, #6366f1, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Content</span> Approval</h1>
                <p style={{ color: '#94a3b8', margin: '4px 0 0' }}>Review and approve creator content before publishing</p>
            </motion.div>

            {/* Status Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
                {APPROVAL_STATUSES.map(status => {
                    const Icon = APPROVAL_ICONS[status]
                    const color = APPROVAL_COLORS[status]
                    const isActive = approvalFilter === status
                    return (
                        <motion.div key={status} whileHover={{ scale: 1.02 }} onClick={() => setApprovalFilter(isActive ? 'All' : status)} style={{ ...card, padding: 16, cursor: 'pointer', border: isActive ? `1px solid ${color}40` : '1px solid rgba(255,255,255,0.1)', background: isActive ? color + '10' : 'rgba(255,255,255,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Icon size={20} color={color} />
                                <span style={{ fontSize: 24, fontWeight: 700, color }}>{counts[status]}</span>
                            </div>
                            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 6 }}>{status}</div>
                        </motion.div>
                    )
                })}
            </div>

            {/* Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
                <div style={{ display: 'flex', gap: 6 }}>
                    {STATUSES.map(s => (
                        <button key={s} onClick={() => setFilter(s)} style={{ padding: '5px 14px', borderRadius: 20, border: filter === s ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.1)', background: filter === s ? 'rgba(99,102,241,0.15)' : 'transparent', color: filter === s ? '#a78bfa' : '#64748b', fontSize: 12, cursor: 'pointer', fontWeight: 500 }}>
                            {s}
                        </button>
                    ))}
                </div>
                {selectedItems.length > 0 && (
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span style={{ fontSize: 12, color: '#94a3b8' }}>{selectedItems.length} selected</span>
                        <button style={{ ...btnPrimary, background: 'linear-gradient(135deg, #10b981, #059669)' }} onClick={handleBulkApprove}>
                            <CheckCircle size={14} /> Bulk Approve
                        </button>
                    </div>
                )}
            </div>

            {/* Content Queue */}
            <div style={{ display: 'grid', gap: 12 }}>
                {filteredItems.map(item => {
                    const ApprIcon = APPROVAL_ICONS[item.approvalStatus] || Clock
                    const color = APPROVAL_COLORS[item.approvalStatus] || '#f59e0b'
                    const isExpanded = expandedId === item.id
                    const isSelected = selectedItems.includes(item.id)
                    return (
                        <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ ...card, border: isSelected ? '1px solid rgba(99,102,241,0.3)' : '1px solid rgba(255,255,255,0.1)' }}>
                            <div style={{ display: 'flex', gap: 14 }}>
                                <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(item.id)} style={{ accentColor: '#6366f1', marginTop: 4 }} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                        <div>
                                            <div style={{ fontSize: 15, fontWeight: 600 }}>{item.creatorName}</div>
                                            <div style={{ fontSize: 12, color: '#94a3b8' }}>{item.contentType} on {item.platform} | Scheduled: {item.scheduledDate} at {item.scheduledTime}</div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <ApprIcon size={14} color={color} />
                                            <span style={{ fontSize: 12, fontWeight: 600, color }}>{item.approvalStatus}</span>
                                        </div>
                                    </div>

                                    {/* Content Preview */}
                                    <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: 12, marginBottom: 10, border: '1px solid rgba(255,255,255,0.05)' }}>
                                        {item.caption && <div style={{ fontSize: 13, color: '#cbd5e1', marginBottom: 6 }}>{item.caption}</div>}
                                        {item.hashtags && <div style={{ fontSize: 12, color: '#8b5cf6', marginBottom: 4 }}>{item.hashtags}</div>}
                                        {item.notes && <div style={{ fontSize: 11, color: '#64748b', fontStyle: 'italic' }}>Note: {item.notes}</div>}
                                    </div>

                                    {/* Action Buttons */}
                                    <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                                        <button onClick={() => handleApproval(item.id, 'Approved')} style={{ ...btnSecondary, color: '#10b981', borderColor: 'rgba(16,185,129,0.3)' }}>
                                            <CheckCircle size={14} /> Approve
                                        </button>
                                        <button onClick={() => handleApproval(item.id, 'Changes Requested')} style={{ ...btnSecondary, color: '#3b82f6', borderColor: 'rgba(59,130,246,0.3)' }}>
                                            <MessageSquare size={14} /> Request Changes
                                        </button>
                                        <button onClick={() => handleApproval(item.id, 'Rejected')} style={{ ...btnSecondary, color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)' }}>
                                            <XCircle size={14} /> Reject
                                        </button>
                                    </div>

                                    {/* Feedback Input */}
                                    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                                        <input style={input} placeholder="Add feedback or comments..." value={feedback[item.id] || ''} onChange={e => setFeedback(p => ({ ...p, [item.id]: e.target.value }))} />
                                        <button style={btnPrimary} onClick={() => { if (feedback[item.id]) { handleApproval(item.id, item.approvalStatus === 'Pending' ? 'Changes Requested' : item.approvalStatus) } }} disabled={!feedback[item.id]}>
                                            <Send size={14} />
                                        </button>
                                    </div>

                                    {/* History Toggle */}
                                    {item.approvalHistory.length > 0 && (
                                        <>
                                            <button onClick={() => setExpandedId(isExpanded ? null : item.id)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}>
                                                <ChevronDown size={13} style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                                                Approval History ({item.approvalHistory.length})
                                            </button>
                                            <AnimatePresence>
                                                {isExpanded && (
                                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden', marginTop: 8 }}>
                                                        {item.approvalHistory.map((h, i) => (
                                                            <div key={i} style={{ display: 'flex', gap: 8, padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 12 }}>
                                                                <span style={{ color: APPROVAL_COLORS[h.status], fontWeight: 500, minWidth: 110 }}>{h.status}</span>
                                                                <span style={{ color: '#94a3b8', flex: 1 }}>{h.comment || 'No comment'}</span>
                                                                <span style={{ color: '#64748b', fontSize: 11 }}>{new Date(h.timestamp).toLocaleString()}</span>
                                                            </div>
                                                        ))}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )
                })}
            </div>

            {filteredItems.length === 0 && (
                <div style={{ ...card, textAlign: 'center', color: '#64748b', padding: 60 }}>
                    <FileText size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
                    <div style={{ fontSize: 16, fontWeight: 500 }}>No content items match your filters</div>
                    <div style={{ fontSize: 13, marginTop: 4 }}>Adjust filters or wait for new content submissions</div>
                </div>
            )}

            {/* Recent Approval Log */}
            {approvalHistory.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ ...card, marginTop: 20 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 8 }}><Clock size={16} /> Recent Activity</h3>
                    {approvalHistory.slice(0, 10).map((h, i) => (
                        <div key={i} style={{ display: 'flex', gap: 10, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', fontSize: 13 }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: APPROVAL_COLORS[h.status], flexShrink: 0, marginTop: 5 }} />
                            <div style={{ flex: 1 }}>
                                <span style={{ fontWeight: 500 }}>{h.creatorName}</span>
                                <span style={{ color: '#64748b' }}> -- </span>
                                <span style={{ color: APPROVAL_COLORS[h.status] }}>{h.status}</span>
                                {h.comment && <span style={{ color: '#94a3b8' }}> -- "{h.comment}"</span>}
                            </div>
                            <span style={{ color: '#64748b', fontSize: 11 }}>{new Date(h.timestamp).toLocaleTimeString()}</span>
                        </div>
                    ))}
                </motion.div>
            )}
        </div>
    )
}
