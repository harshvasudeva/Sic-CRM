import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    StickyNote, Tag, Search, Plus, Trash2, Edit2, X, User,
    Clock, Filter, ChevronDown, Check
} from 'lucide-react'
import { getCreators, updateCreator } from '../../stores/influencerStore'

const styles = {
    page: { padding: '24px', maxWidth: 1200, margin: '0 auto' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    title: { color: '#fff', fontSize: 22, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 },
    subtitle: { color: '#94a3b8', fontSize: 13, marginTop: 4 },
    grid: { display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20 },
    card: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 20 },
    searchInput: { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 12px 10px 36px', color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box' },
    creatorItem: (active) => ({ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, cursor: 'pointer', background: active ? 'rgba(99,102,241,0.15)' : 'transparent', borderLeft: active ? '3px solid #6366f1' : '3px solid transparent', transition: 'all 0.2s', marginBottom: 4 }),
    label: { color: '#94a3b8', fontSize: 12, fontWeight: 600, marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' },
    noteCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 14, marginBottom: 10 },
    noteText: { color: '#e2e8f0', fontSize: 14, lineHeight: 1.6, marginBottom: 8 },
    noteTime: { color: '#64748b', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 },
    tagDot: (color) => ({ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }),
    tagChip: (color, active) => ({ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 16, background: active ? `${color}33` : 'rgba(255,255,255,0.05)', border: `1px solid ${active ? color : 'rgba(255,255,255,0.1)'}`, color: active ? color : '#94a3b8', fontSize: 12, cursor: 'pointer', fontWeight: active ? 600 : 400, transition: 'all 0.2s' }),
    textarea: { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: 12, color: '#fff', fontSize: 14, outline: 'none', resize: 'vertical', minHeight: 80, fontFamily: 'inherit', boxSizing: 'border-box' },
    btnPrimary: { background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 },
    btnDanger: { background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 6, padding: '4px 8px', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 },
    btnGhost: { background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px 8px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 4 },
    input: { width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px', color: '#fff', fontSize: 13, outline: 'none', boxSizing: 'border-box' },
    emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, color: '#64748b' },
    colorOption: (color, active) => ({ width: 24, height: 24, borderRadius: '50%', background: color, cursor: 'pointer', border: active ? '2px solid #fff' : '2px solid transparent', transition: 'all 0.2s' }),
}

const TAG_COLORS = ['#10b981', '#6366f1', '#ef4444', '#f59e0b', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899', '#22c55e', '#3b82f6']

const defaultTags = [
    { id: 'tag-1', name: 'High Priority', color: '#ef4444' },
    { id: 'tag-2', name: 'Responsive', color: '#10b981' },
    { id: 'tag-3', name: 'Long-term Partner', color: '#6366f1' },
    { id: 'tag-4', name: 'Budget Friendly', color: '#06b6d4' },
    { id: 'tag-5', name: 'Needs Follow-up', color: '#f59e0b' },
]

export default function CreatorNotesTags() {
    const [creators, setCreators] = useState([])
    const [selectedCreator, setSelectedCreator] = useState(null)
    const [search, setSearch] = useState('')
    const [noteSearch, setNoteSearch] = useState('')
    const [notes, setNotes] = useState(() => {
        const stored = localStorage.getItem('sic-creator-notes')
        return stored ? JSON.parse(stored) : {}
    })
    const [tags, setTags] = useState(() => {
        const stored = localStorage.getItem('sic-creator-custom-tags')
        return stored ? JSON.parse(stored) : defaultTags
    })
    const [creatorTags, setCreatorTags] = useState(() => {
        const stored = localStorage.getItem('sic-creator-tag-map')
        return stored ? JSON.parse(stored) : {}
    })
    const [newNote, setNewNote] = useState('')
    const [editingNote, setEditingNote] = useState(null)
    const [editNoteText, setEditNoteText] = useState('')
    const [showAddTag, setShowAddTag] = useState(false)
    const [newTagName, setNewTagName] = useState('')
    const [newTagColor, setNewTagColor] = useState('#6366f1')
    const [tagFilter, setTagFilter] = useState(null)

    useEffect(() => { setCreators(getCreators()) }, [])
    useEffect(() => { localStorage.setItem('sic-creator-notes', JSON.stringify(notes)) }, [notes])
    useEffect(() => { localStorage.setItem('sic-creator-custom-tags', JSON.stringify(tags)) }, [tags])
    useEffect(() => { localStorage.setItem('sic-creator-tag-map', JSON.stringify(creatorTags)) }, [creatorTags])

    const filteredCreators = creators.filter(c => {
        const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase())
        const matchTag = !tagFilter || (creatorTags[c.id] || []).includes(tagFilter)
        return matchSearch && matchTag
    })

    const creatorNotes = selectedCreator ? (notes[selectedCreator.id] || []) : []
    const filteredNotes = noteSearch ? creatorNotes.filter(n => n.text.toLowerCase().includes(noteSearch.toLowerCase())) : creatorNotes
    const currentTags = selectedCreator ? (creatorTags[selectedCreator.id] || []) : []

    function addNote() {
        if (!newNote.trim() || !selectedCreator) return
        const note = { id: `note-${Date.now()}`, text: newNote.trim(), createdAt: new Date().toISOString() }
        setNotes(prev => ({ ...prev, [selectedCreator.id]: [...(prev[selectedCreator.id] || []), note] }))
        setNewNote('')
    }

    function deleteNote(noteId) {
        if (!selectedCreator) return
        setNotes(prev => ({ ...prev, [selectedCreator.id]: (prev[selectedCreator.id] || []).filter(n => n.id !== noteId) }))
    }

    function saveEditNote() {
        if (!editingNote || !selectedCreator) return
        setNotes(prev => ({
            ...prev, [selectedCreator.id]: (prev[selectedCreator.id] || []).map(n =>
                n.id === editingNote ? { ...n, text: editNoteText, editedAt: new Date().toISOString() } : n
            )
        }))
        setEditingNote(null)
        setEditNoteText('')
    }

    function toggleTag(tagId) {
        if (!selectedCreator) return
        setCreatorTags(prev => {
            const current = prev[selectedCreator.id] || []
            const updated = current.includes(tagId) ? current.filter(t => t !== tagId) : [...current, tagId]
            return { ...prev, [selectedCreator.id]: updated }
        })
    }

    function addTag() {
        if (!newTagName.trim()) return
        const tag = { id: `tag-${Date.now()}`, name: newTagName.trim(), color: newTagColor }
        setTags(prev => [...prev, tag])
        setNewTagName('')
        setShowAddTag(false)
    }

    function deleteTag(tagId) {
        setTags(prev => prev.filter(t => t.id !== tagId))
        setCreatorTags(prev => {
            const updated = { ...prev }
            Object.keys(updated).forEach(k => { updated[k] = updated[k].filter(t => t !== tagId) })
            return updated
        })
    }

    return (
        <motion.div style={styles.page} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div style={styles.header}>
                <div>
                    <div style={styles.title}><StickyNote size={22} color="#6366f1" /> Creator Notes & Tags</div>
                    <div style={styles.subtitle}>Add notes, organize creators with custom tags</div>
                </div>
            </div>

            <div style={{ marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                <Filter size={14} color="#94a3b8" />
                <span style={{ color: '#94a3b8', fontSize: 12 }}>Filter by tag:</span>
                <span style={styles.tagChip('#94a3b8', !tagFilter)} onClick={() => setTagFilter(null)}>All</span>
                {tags.map(tag => (
                    <span key={tag.id} style={styles.tagChip(tag.color, tagFilter === tag.id)} onClick={() => setTagFilter(tagFilter === tag.id ? null : tag.id)}>
                        <span style={styles.tagDot(tag.color)} /> {tag.name}
                    </span>
                ))}
            </div>

            <div style={styles.grid}>
                <div>
                    <div style={{ ...styles.card, padding: 14 }}>
                        <div style={{ position: 'relative', marginBottom: 12 }}>
                            <Search size={14} style={{ position: 'absolute', left: 12, top: 12, color: '#64748b' }} />
                            <input style={styles.searchInput} value={search} onChange={e => setSearch(e.target.value)} placeholder="Search creators..." />
                        </div>
                        <div style={{ maxHeight: 500, overflowY: 'auto' }}>
                            {filteredCreators.map(c => (
                                <div key={c.id} style={styles.creatorItem(selectedCreator?.id === c.id)} onClick={() => setSelectedCreator(c)}>
                                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 13, fontWeight: 600, flexShrink: 0 }}>
                                        {c.name[0]}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <div style={{ color: '#fff', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.name}</div>
                                        <div style={{ color: '#64748b', fontSize: 11 }}>{c.platform} | {(notes[c.id] || []).length} notes</div>
                                    </div>
                                    {(creatorTags[c.id] || []).length > 0 && (
                                        <div style={{ display: 'flex', gap: 3 }}>
                                            {(creatorTags[c.id] || []).slice(0, 3).map(tagId => {
                                                const tag = tags.find(t => t.id === tagId)
                                                return tag ? <span key={tagId} style={styles.tagDot(tag.color)} /> : null
                                            })}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div>
                    {selectedCreator ? (
                        <>
                            <motion.div style={{ ...styles.card, marginBottom: 16 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                                    <div style={{ color: '#fff', fontWeight: 600, fontSize: 16 }}>{selectedCreator.name}</div>
                                    <div style={{ color: '#94a3b8', fontSize: 12 }}>{selectedCreator.platform} | {selectedCreator.niche}</div>
                                </div>

                                <div style={{ marginBottom: 14 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                        <span style={styles.label}>Tags</span>
                                        <button style={styles.btnGhost} onClick={() => setShowAddTag(!showAddTag)}><Plus size={12} /> New Tag</button>
                                    </div>

                                    <AnimatePresence>
                                        {showAddTag && (
                                            <motion.div style={{ display: 'flex', gap: 8, marginBottom: 10, alignItems: 'center' }} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                                                <input style={{ ...styles.input, flex: 1 }} value={newTagName} onChange={e => setNewTagName(e.target.value)} placeholder="Tag name..." />
                                                <div style={{ display: 'flex', gap: 4 }}>
                                                    {TAG_COLORS.map(c => <span key={c} style={styles.colorOption(c, newTagColor === c)} onClick={() => setNewTagColor(c)} />)}
                                                </div>
                                                <button style={styles.btnPrimary} onClick={addTag}><Check size={14} /></button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                        {tags.map(tag => (
                                            <span key={tag.id} style={styles.tagChip(tag.color, currentTags.includes(tag.id))} onClick={() => toggleTag(tag.id)}>
                                                <span style={styles.tagDot(tag.color)} /> {tag.name}
                                                {currentTags.includes(tag.id) && <Check size={10} />}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>

                            <motion.div style={styles.card} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                                    <span style={{ color: '#fff', fontWeight: 600, fontSize: 15 }}>Notes ({creatorNotes.length})</span>
                                    <div style={{ position: 'relative', width: 200 }}>
                                        <Search size={12} style={{ position: 'absolute', left: 10, top: 10, color: '#64748b' }} />
                                        <input style={{ ...styles.input, paddingLeft: 28, fontSize: 12 }} value={noteSearch} onChange={e => setNoteSearch(e.target.value)} placeholder="Search notes..." />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                                    <textarea style={styles.textarea} value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Write a note..." />
                                    <button style={{ ...styles.btnPrimary, alignSelf: 'flex-end', whiteSpace: 'nowrap' }} onClick={addNote}><Plus size={14} /> Add</button>
                                </div>

                                {filteredNotes.length === 0 ? (
                                    <div style={styles.emptyState}><StickyNote size={30} strokeWidth={1} /><div style={{ marginTop: 8, fontSize: 13 }}>No notes yet</div></div>
                                ) : (
                                    filteredNotes.slice().reverse().map(note => (
                                        <motion.div key={note.id} style={styles.noteCard} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                                            {editingNote === note.id ? (
                                                <div>
                                                    <textarea style={{ ...styles.textarea, minHeight: 60 }} value={editNoteText} onChange={e => setEditNoteText(e.target.value)} />
                                                    <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                                                        <button style={styles.btnPrimary} onClick={saveEditNote}><Check size={12} /> Save</button>
                                                        <button style={styles.btnGhost} onClick={() => setEditingNote(null)}>Cancel</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <div style={styles.noteText}>{note.text}</div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <div style={styles.noteTime}>
                                                            <Clock size={10} /> {new Date(note.createdAt).toLocaleString()}
                                                            {note.editedAt && <span style={{ marginLeft: 8, fontStyle: 'italic' }}>(edited)</span>}
                                                        </div>
                                                        <div style={{ display: 'flex', gap: 6 }}>
                                                            <button style={styles.btnGhost} onClick={() => { setEditingNote(note.id); setEditNoteText(note.text) }}><Edit2 size={11} /> Edit</button>
                                                            <button style={styles.btnDanger} onClick={() => deleteNote(note.id)}><Trash2 size={11} /></button>
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </motion.div>
                                    ))
                                )}
                            </motion.div>
                        </>
                    ) : (
                        <div style={{ ...styles.card, ...styles.emptyState, minHeight: 400 }}>
                            <User size={40} strokeWidth={1} />
                            <div style={{ marginTop: 12, fontSize: 15 }}>Select a creator</div>
                            <div style={{ fontSize: 12, marginTop: 4 }}>Choose a creator from the list to view and manage their notes and tags</div>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    )
}
