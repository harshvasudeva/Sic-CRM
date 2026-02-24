import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Layout, Plus, Edit3, Trash2, Copy, Check, Rocket, Target, Megaphone, ShoppingCart, Smartphone, Calendar, X, Save } from 'lucide-react'
import { getBriefTemplates } from '../../stores/influencerStore'

const OBJECTIVES = ['Brand Awareness', 'Product Launch', 'Sales', 'App Downloads', 'Lead Generation', 'Event Sponsorship']
const ICON_MAP = { 'Product Launch': Rocket, 'Brand Awareness': Megaphone, 'Sales': ShoppingCart, 'App Downloads': Smartphone, 'Lead Generation': Target, 'Event Sponsorship': Calendar }

const card = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 20 }
const input = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 14px', color: '#fff', width: '100%', fontSize: 14, outline: 'none' }
const btnPrimary = { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }
const btnSecondary = { background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6']

export default function CampaignTemplates() {
    const [builtInTemplates, setBuiltInTemplates] = useState([])
    const [customTemplates, setCustomTemplates] = useState(() => {
        const stored = localStorage.getItem('sic-campaign-templates')
        return stored ? JSON.parse(stored) : []
    })
    const [showForm, setShowForm] = useState(false)
    const [editingId, setEditingId] = useState(null)
    const [form, setForm] = useState({ name: '', objective: 'Brand Awareness', description: '', brief: '', deliverables: '', duration: '', messaging: '' })
    const [applied, setApplied] = useState('')

    useEffect(() => { setBuiltInTemplates(getBriefTemplates()) }, [])

    const saveCustom = templates => {
        setCustomTemplates(templates)
        localStorage.setItem('sic-campaign-templates', JSON.stringify(templates))
    }

    const handleSubmit = () => {
        if (!form.name) return
        const template = {
            ...form,
            id: editingId || `custom-tpl-${Date.now()}`,
            isCustom: true,
            usageCount: editingId ? (customTemplates.find(t => t.id === editingId)?.usageCount || 0) : 0,
            deliverables: form.deliverables.split(',').map(d => d.trim()).filter(Boolean),
            createdAt: editingId ? (customTemplates.find(t => t.id === editingId)?.createdAt || new Date().toISOString()) : new Date().toISOString(),
        }
        if (editingId) {
            saveCustom(customTemplates.map(t => t.id === editingId ? template : t))
        } else {
            saveCustom([...customTemplates, template])
        }
        resetForm()
    }

    const handleEdit = template => {
        setForm({
            name: template.name,
            objective: template.objective,
            description: template.description || '',
            brief: template.brief,
            deliverables: Array.isArray(template.deliverables) ? template.deliverables.join(', ') : template.deliverables || '',
            duration: template.duration || '',
            messaging: template.messaging || '',
        })
        setEditingId(template.id)
        setShowForm(true)
    }

    const handleDelete = id => {
        saveCustom(customTemplates.filter(t => t.id !== id))
    }

    const handleApply = template => {
        const t = { ...template }
        t.usageCount = (t.usageCount || 0) + 1
        if (t.isCustom) {
            saveCustom(customTemplates.map(ct => ct.id === t.id ? t : ct))
        }
        setApplied(t.id)
        setTimeout(() => setApplied(''), 2000)
    }

    const resetForm = () => {
        setForm({ name: '', objective: 'Brand Awareness', description: '', brief: '', deliverables: '', duration: '', messaging: '' })
        setEditingId(null)
        setShowForm(false)
    }

    const allTemplates = [
        ...builtInTemplates.map(t => ({ ...t, isBuiltIn: true, usageCount: t.usageCount || 0, description: t.brief?.slice(0, 80) + '...' })),
        ...customTemplates,
    ]

    return (
        <div style={{ padding: '24px 32px', color: '#fff', minHeight: '100vh' }}>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
                <div>
                    <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}><span style={{ background: 'linear-gradient(135deg, #6366f1, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Campaign</span> Templates</h1>
                    <p style={{ color: '#94a3b8', margin: '4px 0 0' }}>Save and reuse campaign structures to speed up creation</p>
                </div>
                <button style={btnPrimary} onClick={() => { resetForm(); setShowForm(true) }}>
                    <Plus size={16} /> New Template
                </button>
            </motion.div>

            {/* New/Edit Form */}
            <AnimatePresence>
                {showForm && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden', marginBottom: 20 }}>
                        <div style={card}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                <h3 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>{editingId ? 'Edit Template' : 'Create New Template'}</h3>
                                <button onClick={resetForm} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}><X size={18} /></button>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                <div>
                                    <label style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4, display: 'block' }}>Template Name *</label>
                                    <input style={input} placeholder="e.g. Holiday Season Push" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                                </div>
                                <div>
                                    <label style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4, display: 'block' }}>Objective</label>
                                    <select style={input} value={form.objective} onChange={e => setForm(p => ({ ...p, objective: e.target.value }))}>
                                        {OBJECTIVES.map(o => <option key={o} value={o}>{o}</option>)}
                                    </select>
                                </div>
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4, display: 'block' }}>Description</label>
                                    <input style={input} placeholder="Short description of this template..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
                                </div>
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4, display: 'block' }}>Brief</label>
                                    <textarea style={{ ...input, minHeight: 80, resize: 'vertical' }} placeholder="Campaign brief template text..." value={form.brief} onChange={e => setForm(p => ({ ...p, brief: e.target.value }))} />
                                </div>
                                <div>
                                    <label style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4, display: 'block' }}>Deliverables (comma separated)</label>
                                    <input style={input} placeholder="e.g. 2 Reels, 3 Stories, 1 Post" value={form.deliverables} onChange={e => setForm(p => ({ ...p, deliverables: e.target.value }))} />
                                </div>
                                <div>
                                    <label style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4, display: 'block' }}>Duration</label>
                                    <input style={input} placeholder="e.g. 2 weeks" value={form.duration} onChange={e => setForm(p => ({ ...p, duration: e.target.value }))} />
                                </div>
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <label style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4, display: 'block' }}>Key Messaging</label>
                                    <input style={input} placeholder="Core messaging guidelines..." value={form.messaging} onChange={e => setForm(p => ({ ...p, messaging: e.target.value }))} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 10, marginTop: 16, justifyContent: 'flex-end' }}>
                                <button style={btnSecondary} onClick={resetForm}>Cancel</button>
                                <button style={{ ...btnPrimary, opacity: form.name ? 1 : 0.5 }} onClick={handleSubmit} disabled={!form.name}>
                                    <Save size={14} /> {editingId ? 'Update' : 'Create'} Template
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Templates Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
                {allTemplates.map((t, i) => {
                    const IconComp = ICON_MAP[t.objective] || Layout
                    const color = COLORS[i % COLORS.length]
                    return (
                        <motion.div key={t.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} whileHover={{ y: -4, transition: { duration: 0.2 } }} style={card}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                                <div style={{ width: 44, height: 44, borderRadius: 12, background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    {t.icon ? <span style={{ fontSize: 22 }}>{t.icon}</span> : <IconComp size={22} color={color} />}
                                </div>
                                {t.isBuiltIn && <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: 'rgba(99,102,241,0.15)', color: '#a78bfa', fontWeight: 600 }}>Built-in</span>}
                                {t.isCustom && <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: 'rgba(16,185,129,0.15)', color: '#10b981', fontWeight: 600 }}>Custom</span>}
                            </div>
                            <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 4px' }}>{t.name}</h3>
                            <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 10 }}>{t.objective} {t.duration ? `| ${t.duration}` : ''}</div>
                            <p style={{ fontSize: 13, color: '#cbd5e1', lineHeight: 1.6, margin: '0 0 12px', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                {t.description || t.brief}
                            </p>
                            {t.deliverables && (
                                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                                    {(Array.isArray(t.deliverables) ? t.deliverables : [t.deliverables]).slice(0, 4).map((d, j) => (
                                        <span key={j} style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: 'rgba(255,255,255,0.06)', color: '#94a3b8' }}>{d}</span>
                                    ))}
                                </div>
                            )}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12 }}>
                                <span style={{ fontSize: 11, color: '#64748b' }}>Used {t.usageCount || 0} times</span>
                                <div style={{ display: 'flex', gap: 6 }}>
                                    {t.isCustom && (
                                        <>
                                            <button onClick={() => handleEdit(t)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 4 }}><Edit3 size={14} /></button>
                                            <button onClick={() => handleDelete(t.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 4 }}><Trash2 size={14} /></button>
                                        </>
                                    )}
                                    <button onClick={() => handleApply(t)} style={{ ...btnSecondary, padding: '6px 12px', fontSize: 12, color: applied === t.id ? '#10b981' : '#94a3b8' }}>
                                        {applied === t.id ? <><Check size={13} /> Applied</> : <><Copy size={13} /> Apply</>}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )
                })}
            </div>

            {allTemplates.length === 0 && (
                <div style={{ ...card, textAlign: 'center', color: '#64748b', padding: 60 }}>
                    <Layout size={40} style={{ marginBottom: 12, opacity: 0.4 }} />
                    <div style={{ fontSize: 16, fontWeight: 500 }}>No templates yet</div>
                    <div style={{ fontSize: 13, marginTop: 4 }}>Create your first campaign template to get started</div>
                </div>
            )}
        </div>
    )
}
