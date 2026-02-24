import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Kanban, ArrowRight, ArrowLeft, StickyNote, Filter, Clock,
    ChevronRight, User, MessageSquare, X, Plus, Search
} from 'lucide-react'
import { getOutreachList, updateOutreach } from '../../stores/influencerStore'

const COLUMNS = ['Contacted', 'Negotiating', 'Contracted', 'Rejected']
const COLUMN_COLORS = { Contacted: '#3b82f6', Negotiating: '#f59e0b', Contracted: '#10b981', Rejected: '#ef4444' }

const styles = {
    page: { padding: '24px', maxWidth: 1400, margin: '0 auto' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    title: { color: '#fff', fontSize: 22, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 },
    subtitle: { color: '#94a3b8', fontSize: 13, marginTop: 4 },
    kanban: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, alignItems: 'start' },
    column: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 14, minHeight: 400 },
    colHeader: (color) => ({ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, paddingBottom: 10, borderBottom: `2px solid ${color}` }),
    colTitle: (color) => ({ color, fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }),
    colCount: { background: 'rgba(255,255,255,0.1)', color: '#94a3b8', borderRadius: 10, padding: '2px 8px', fontSize: 11, fontWeight: 600 },
    card: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: 14, marginBottom: 10, cursor: 'pointer', transition: 'border-color 0.2s' },
    cardName: { color: '#fff', fontWeight: 600, fontSize: 14, marginBottom: 4 },
    cardMeta: { color: '#94a3b8', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 },
    moveBtn: (color) => ({ background: `${color}22`, color, border: `1px solid ${color}44`, borderRadius: 6, padding: '4px 8px', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 600 }),
    filterBar: { display: 'flex', gap: 10, marginBottom: 20, alignItems: 'center' },
    select: { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px', color: '#fff', fontSize: 13, outline: 'none' },
    modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    modalContent: { background: '#1e1e2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: 24, width: 500, maxHeight: '80vh', overflowY: 'auto' },
    noteItem: { background: 'rgba(255,255,255,0.03)', borderRadius: 8, padding: '10px 12px', marginBottom: 8, borderLeft: '3px solid #6366f1' },
    textarea: { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: 10, color: '#fff', fontSize: 13, outline: 'none', resize: 'vertical', minHeight: 60, fontFamily: 'inherit', boxSizing: 'border-box' },
    btnPrimary: { background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 },
    timelineItem: { display: 'flex', gap: 10, marginBottom: 10, fontSize: 12 },
    timelineDot: (color) => ({ width: 8, height: 8, borderRadius: '50%', background: color, marginTop: 4, flexShrink: 0 }),
}

const sampleCards = [
    { id: 'ot-001', creatorId: 'cr-001', creatorName: 'Priya Sharma', platform: 'Instagram', column: 'Contracted', notes: ['Great collaboration on Nykaa campaign', 'Signed for 3-month deal'], timeline: [{ action: 'Moved to Contacted', time: '2026-01-10' }, { action: 'Moved to Negotiating', time: '2026-01-15' }, { action: 'Moved to Contracted', time: '2026-01-22' }] },
    { id: 'ot-002', creatorId: 'cr-002', creatorName: 'Rohan Verma', platform: 'YouTube', column: 'Negotiating', notes: ['Discussing rate for OnePlus campaign'], timeline: [{ action: 'Moved to Contacted', time: '2026-01-12' }, { action: 'Moved to Negotiating', time: '2026-01-18' }] },
    { id: 'ot-003', creatorId: 'cr-003', creatorName: 'Ananya Reddy', platform: 'Instagram', column: 'Contacted', notes: ['Sent initial pitch via email'], timeline: [{ action: 'Moved to Contacted', time: '2026-01-20' }] },
    { id: 'ot-004', creatorId: 'cr-004', creatorName: 'Karthik Iyer', platform: 'YouTube', column: 'Negotiating', notes: ['Wants higher rate', 'Counter-offered with barter deal'], timeline: [{ action: 'Moved to Contacted', time: '2026-01-08' }, { action: 'Moved to Negotiating', time: '2026-01-14' }] },
    { id: 'ot-005', creatorId: 'cr-005', creatorName: 'Sneha Joshi', platform: 'Instagram', column: 'Rejected', notes: ['Not available this quarter', 'Reconnect in April'], timeline: [{ action: 'Moved to Contacted', time: '2026-01-05' }, { action: 'Moved to Rejected', time: '2026-01-11' }] },
    { id: 'ot-006', creatorId: 'cr-006', creatorName: 'Aditya Kapoor', platform: 'Instagram', column: 'Contacted', notes: ['Sent DM on Instagram'], timeline: [{ action: 'Moved to Contacted', time: '2026-01-22' }] },
]

export default function OutreachStatusTracker() {
    const [cards, setCards] = useState(() => {
        const stored = localStorage.getItem('sic-outreach-kanban')
        return stored ? JSON.parse(stored) : sampleCards
    })
    const [platformFilter, setPlatformFilter] = useState('')
    const [selectedCard, setSelectedCard] = useState(null)
    const [newNote, setNewNote] = useState('')

    useEffect(() => {
        localStorage.setItem('sic-outreach-kanban', JSON.stringify(cards))
    }, [cards])

    function moveCard(cardId, direction) {
        setCards(prev => prev.map(card => {
            if (card.id !== cardId) return card
            const currentIdx = COLUMNS.indexOf(card.column)
            const newIdx = direction === 'right' ? Math.min(currentIdx + 1, COLUMNS.length - 1) : Math.max(currentIdx - 1, 0)
            if (newIdx === currentIdx) return card
            const newColumn = COLUMNS[newIdx]
            return {
                ...card,
                column: newColumn,
                timeline: [...card.timeline, { action: `Moved to ${newColumn}`, time: new Date().toISOString().split('T')[0] }]
            }
        }))
    }

    function addNote() {
        if (!newNote.trim() || !selectedCard) return
        setCards(prev => prev.map(card =>
            card.id === selectedCard.id ? { ...card, notes: [...card.notes, newNote.trim()] } : card
        ))
        setSelectedCard(prev => ({ ...prev, notes: [...prev.notes, newNote.trim()] }))
        setNewNote('')
    }

    const filtered = platformFilter ? cards.filter(c => c.platform === platformFilter) : cards

    return (
        <motion.div style={styles.page} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div style={styles.header}>
                <div>
                    <div style={styles.title}><Kanban size={22} color="#6366f1" /> Outreach Status Tracker</div>
                    <div style={styles.subtitle}>Track creator outreach pipeline from contact to contract</div>
                </div>
            </div>

            <div style={styles.filterBar}>
                <Filter size={14} color="#94a3b8" />
                <select style={styles.select} value={platformFilter} onChange={e => setPlatformFilter(e.target.value)}>
                    <option value="">All Platforms</option>
                    <option value="Instagram">Instagram</option>
                    <option value="YouTube">YouTube</option>
                </select>
                <div style={{ marginLeft: 'auto', color: '#64748b', fontSize: 12 }}>{filtered.length} creators tracked</div>
            </div>

            <div style={styles.kanban}>
                {COLUMNS.map(col => {
                    const colCards = filtered.filter(c => c.column === col)
                    return (
                        <div key={col} style={styles.column}>
                            <div style={styles.colHeader(COLUMN_COLORS[col])}>
                                <span style={styles.colTitle(COLUMN_COLORS[col])}>{col}</span>
                                <span style={styles.colCount}>{colCards.length}</span>
                            </div>
                            <AnimatePresence>
                                {colCards.map(card => (
                                    <motion.div
                                        key={card.id}
                                        style={styles.card}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        whileHover={{ borderColor: COLUMN_COLORS[col] }}
                                        onClick={() => setSelectedCard(card)}
                                    >
                                        <div style={styles.cardName}>{card.creatorName}</div>
                                        <div style={styles.cardMeta}>
                                            <User size={11} /> {card.platform}
                                            {card.notes.length > 0 && <><span style={{ margin: '0 4px' }}>|</span><StickyNote size={11} /> {card.notes.length} notes</>}
                                        </div>
                                        <div style={{ display: 'flex', gap: 6, marginTop: 10 }} onClick={e => e.stopPropagation()}>
                                            {COLUMNS.indexOf(col) > 0 && (
                                                <button style={styles.moveBtn('#94a3b8')} onClick={() => moveCard(card.id, 'left')}>
                                                    <ArrowLeft size={11} /> {COLUMNS[COLUMNS.indexOf(col) - 1]}
                                                </button>
                                            )}
                                            {COLUMNS.indexOf(col) < COLUMNS.length - 1 && (
                                                <button style={styles.moveBtn(COLUMN_COLORS[COLUMNS[COLUMNS.indexOf(col) + 1]])} onClick={() => moveCard(card.id, 'right')}>
                                                    {COLUMNS[COLUMNS.indexOf(col) + 1]} <ArrowRight size={11} />
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )
                })}
            </div>

            <AnimatePresence>
                {selectedCard && (
                    <motion.div style={styles.modal} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedCard(null)}>
                        <motion.div style={styles.modalContent} initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                <div>
                                    <div style={{ color: '#fff', fontWeight: 700, fontSize: 18 }}>{selectedCard.creatorName}</div>
                                    <div style={{ color: '#94a3b8', fontSize: 13 }}>{selectedCard.platform} | Status: <span style={{ color: COLUMN_COLORS[selectedCard.column] }}>{selectedCard.column}</span></div>
                                </div>
                                <button onClick={() => setSelectedCard(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}><X size={20} /></button>
                            </div>

                            <div style={{ marginBottom: 20 }}>
                                <div style={{ color: '#fff', fontWeight: 600, fontSize: 14, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}><Clock size={14} /> Timeline</div>
                                {selectedCard.timeline.map((t, i) => (
                                    <div key={i} style={styles.timelineItem}>
                                        <div style={styles.timelineDot(COLUMN_COLORS[t.action.replace('Moved to ', '')] || '#6366f1')} />
                                        <div>
                                            <div style={{ color: '#e2e8f0' }}>{t.action}</div>
                                            <div style={{ color: '#64748b', fontSize: 11 }}>{t.time}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div style={{ marginBottom: 16 }}>
                                <div style={{ color: '#fff', fontWeight: 600, fontSize: 14, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}><StickyNote size={14} /> Notes ({selectedCard.notes.length})</div>
                                {selectedCard.notes.map((note, i) => (
                                    <div key={i} style={styles.noteItem}><span style={{ color: '#e2e8f0', fontSize: 13 }}>{note}</span></div>
                                ))}
                            </div>

                            <div style={{ display: 'flex', gap: 8 }}>
                                <textarea style={styles.textarea} value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Add a note..." />
                                <button style={{ ...styles.btnPrimary, alignSelf: 'flex-end' }} onClick={addNote}><Plus size={14} /> Add</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}
