import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Send, Plus, X, Mail, MessageSquare, Clock, CheckCircle, AlertCircle,
    Copy, RefreshCw, Eye, ChevronDown, Trash2, Edit2, User, Linkedin
} from 'lucide-react'
import {
    getOutreachList, createOutreach, updateOutreach, deleteOutreach,
    getCreators, generateColdMessages
} from '../../stores/influencerStore'

function OutreachDashboard() {
    const [outreach, setOutreach] = useState([])
    const [creators, setCreators] = useState([])
    const [filter, setFilter] = useState('')
    const [showForm, setShowForm] = useState(false)
    const [selectedOutreach, setSelectedOutreach] = useState(null)
    const [showGenerator, setShowGenerator] = useState(false)
    const [genResult, setGenResult] = useState(null)
    const [copied, setCopied] = useState('')

    const [form, setForm] = useState({ creatorId: '', creatorName: '', channel: 'Email', brand: '' })
    const [genInput, setGenInput] = useState({ creatorName: '', brand: '', platform: 'Email' })

    useEffect(() => { reload() }, [filter])

    function reload() {
        setOutreach(getOutreachList(filter ? { status: filter } : {}))
        setCreators(getCreators())
    }

    function handleCreate(e) {
        e.preventDefault()
        const creator = creators.find(c => c.id === form.creatorId)
        const messages = generateColdMessages(creator?.name || form.creatorName, form.brand, form.channel)
        createOutreach({
            creatorId: form.creatorId,
            creatorName: creator?.name || form.creatorName,
            channel: form.channel,
            messages: [{ type: 'cold', text: messages.openers[0], sentAt: null, opened: false }],
            followUps: messages.followUps.map((text, i) => ({
                scheduledAt: new Date(Date.now() + (i + 1) * 3 * 86400000).toISOString(),
                status: 'Pending',
                text,
            })),
            reminderDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
        })
        setShowForm(false)
        setForm({ creatorId: '', creatorName: '', channel: 'Email', brand: '' })
        reload()
    }

    function handleStatusUpdate(id, status) {
        updateOutreach(id, { status })
        reload()
    }

    function handleDelete(id) {
        if (confirm('Delete outreach?')) { deleteOutreach(id); reload() }
    }

    function handleGenerate(e) {
        e.preventDefault()
        const result = generateColdMessages(genInput.creatorName, genInput.brand, genInput.platform)
        setGenResult(result)
    }

    function copyText(text, label) {
        navigator.clipboard.writeText(text)
        setCopied(label)
        setTimeout(() => setCopied(''), 2000)
    }

    const statusColors = { Draft: '#6b7280', Sent: '#3b82f6', Replied: '#10b981', 'No Reply': '#f59e0b', Bounced: '#ef4444' }
    const channelIcons = { Email: Mail, LinkedIn: Linkedin, WhatsApp: MessageSquare }

    return (
        <div className="page">
            <motion.div className="page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <div>
                    <h1 className="page-title"><span className="gradient-text">Outreach</span> Autopilot</h1>
                    <p className="page-description">Personalized cold messages, follow-up scheduling, and reply tracking</p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button className="btn-secondary" onClick={() => setShowGenerator(true)}>
                        <RefreshCw size={16} /> Message Generator
                    </button>
                    <button className="btn-primary" onClick={() => setShowForm(true)}>
                        <Plus size={18} /> New Outreach
                    </button>
                </div>
            </motion.div>

            <div className="camp-filters">
                {['', 'Draft', 'Sent', 'Replied', 'No Reply'].map(s => (
                    <button key={s} className={`camp-filter-btn ${filter === s ? 'active' : ''}`}
                        onClick={() => setFilter(s)}>{s || 'All'}</button>
                ))}
            </div>

            <div className="out-grid">
                {outreach.map((out, i) => {
                    const ChannelIcon = channelIcons[out.channel] || Mail
                    const pendingFollowUps = (out.followUps || []).filter(f => f.status === 'Pending').length
                    const needsReminder = out.reminderDate && new Date(out.reminderDate) <= new Date() && out.status !== 'Replied'

                    return (
                        <motion.div key={out.id} className={`out-card ${needsReminder ? 'reminder' : ''}`}
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                            onClick={() => setSelectedOutreach(out)}>
                            <div className="out-card-header">
                                <div className="out-card-creator">
                                    <div className="out-avatar"><User size={16} /></div>
                                    <div>
                                        <div className="out-name">{out.creatorName}</div>
                                        <div className="out-channel"><ChannelIcon size={12} /> {out.channel}</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                    {needsReminder && <span className="out-reminder-badge"><AlertCircle size={12} /> Reminder</span>}
                                    <span className="inf-status-badge" style={{ background: `${statusColors[out.status]}20`, color: statusColors[out.status] }}>
                                        {out.status}
                                    </span>
                                </div>
                            </div>

                            <div className="out-card-message">
                                {out.messages[0]?.text?.slice(0, 120)}...
                            </div>

                            <div className="out-card-footer">
                                <span><Clock size={12} /> {pendingFollowUps} follow-ups pending</span>
                                {out.lastReply && <span><CheckCircle size={12} /> Replied {new Date(out.lastReply).toLocaleDateString()}</span>}
                            </div>

                            <div className="out-card-actions" onClick={e => e.stopPropagation()}>
                                <select value={out.status} onChange={e => handleStatusUpdate(out.id, e.target.value)}
                                    className="out-status-select" style={{ background: `${statusColors[out.status]}15`, color: statusColors[out.status] }}>
                                    <option>Draft</option><option>Sent</option><option>Replied</option><option>No Reply</option><option>Bounced</option>
                                </select>
                                <button onClick={() => handleDelete(out.id)} className="danger"><Trash2 size={14} /></button>
                            </div>
                        </motion.div>
                    )
                })}
                {outreach.length === 0 && <div className="inf-empty" style={{ gridColumn: '1/-1' }}>No outreach messages. Start reaching out to creators!</div>}
            </div>

            {/* Outreach Detail Modal */}
            <AnimatePresence>
                {selectedOutreach && (
                    <motion.div className="inf-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedOutreach(null)}>
                        <motion.div className="inf-modal" initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} onClick={e => e.stopPropagation()}>
                            <div className="inf-modal-header">
                                <h2>Outreach to {selectedOutreach.creatorName}</h2>
                                <button onClick={() => setSelectedOutreach(null)}><X size={20} /></button>
                            </div>
                            <div style={{ padding: 24 }}>
                                <div className="out-detail-meta">
                                    <span>Channel: {selectedOutreach.channel}</span>
                                    <span>Status: {selectedOutreach.status}</span>
                                    <span>Created: {selectedOutreach.createdAt}</span>
                                </div>

                                <h4 style={{ marginTop: 20, marginBottom: 10 }}>Messages</h4>
                                {(selectedOutreach.messages || []).map((msg, i) => (
                                    <div key={i} className="out-msg-item">
                                        <div className="out-msg-type">{msg.type === 'cold' ? 'Cold Opener' : 'Follow-up'}</div>
                                        <p className="out-msg-text">{msg.text}</p>
                                        <div className="out-msg-meta">
                                            {msg.sentAt ? `Sent: ${new Date(msg.sentAt).toLocaleString()}` : 'Not sent'}
                                            {msg.opened && ' • Opened'}
                                        </div>
                                        <button className="gen-copy-btn" style={{ marginTop: 8 }} onClick={() => copyText(msg.text, `msg-${i}`)}>
                                            {copied === `msg-${i}` ? <><CheckCircle size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
                                        </button>
                                    </div>
                                ))}

                                <h4 style={{ marginTop: 20, marginBottom: 10 }}>Follow-ups</h4>
                                {(selectedOutreach.followUps || []).map((fu, i) => (
                                    <div key={i} className="out-msg-item">
                                        <div className="out-msg-type">Follow-up {i + 1} — <span style={{ color: fu.status === 'Pending' ? '#f59e0b' : '#10b981' }}>{fu.status}</span></div>
                                        <p className="out-msg-text">{fu.text}</p>
                                        <div className="out-msg-meta">Scheduled: {new Date(fu.scheduledAt).toLocaleString()}</div>
                                        <button className="gen-copy-btn" style={{ marginTop: 8 }} onClick={() => copyText(fu.text, `fu-${i}`)}>
                                            {copied === `fu-${i}` ? <><CheckCircle size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
                                        </button>
                                    </div>
                                ))}

                                {selectedOutreach.reminderDate && (
                                    <div className="out-reminder-note">
                                        <AlertCircle size={16} /> Reminder set for {selectedOutreach.reminderDate} (3 days after last message)
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* New Outreach Form */}
            <AnimatePresence>
                {showForm && (
                    <motion.div className="inf-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowForm(false)}>
                        <motion.div className="inf-modal" style={{ width: 480 }} initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()}>
                            <div className="inf-modal-header">
                                <h2>New Outreach</h2>
                                <button onClick={() => setShowForm(false)}><X size={20} /></button>
                            </div>
                            <form className="inf-form" onSubmit={handleCreate}>
                                <div className="inf-form-group">
                                    <label>Creator</label>
                                    <select value={form.creatorId} onChange={e => {
                                        const cr = creators.find(c => c.id === e.target.value)
                                        setForm(f => ({ ...f, creatorId: e.target.value, creatorName: cr?.name || '' }))
                                    }} required>
                                        <option value="">Select Creator</option>
                                        {creators.map(c => <option key={c.id} value={c.id}>{c.name} ({c.platform})</option>)}
                                    </select>
                                </div>
                                <div className="inf-form-group">
                                    <label>Channel</label>
                                    <select value={form.channel} onChange={e => setForm(f => ({ ...f, channel: e.target.value }))}>
                                        <option>Email</option><option>LinkedIn</option><option>WhatsApp</option>
                                    </select>
                                </div>
                                <div className="inf-form-group">
                                    <label>Brand/Company Name *</label>
                                    <input value={form.brand} onChange={e => setForm(f => ({ ...f, brand: e.target.value }))}
                                        placeholder="Your brand or client name" required />
                                </div>
                                <p className="inf-muted" style={{ marginTop: 8 }}>3 cold openers + 2 follow-ups will be auto-generated with a 3-day no-reply reminder.</p>
                                <div className="inf-form-btns">
                                    <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                                    <button type="submit" className="btn-primary"><Send size={16} /> Create & Generate</button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Message Generator */}
            <AnimatePresence>
                {showGenerator && (
                    <motion.div className="inf-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setShowGenerator(false); setGenResult(null) }}>
                        <motion.div className="inf-modal" style={{ width: 680 }} initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()}>
                            <div className="inf-modal-header">
                                <h2>Cold Message Generator</h2>
                                <button onClick={() => { setShowGenerator(false); setGenResult(null) }}><X size={20} /></button>
                            </div>
                            <div style={{ padding: 24 }}>
                                <form onSubmit={handleGenerate} style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                                    <input className="gen-input" placeholder="Creator Name" value={genInput.creatorName}
                                        onChange={e => setGenInput(g => ({ ...g, creatorName: e.target.value }))} required />
                                    <input className="gen-input" placeholder="Brand/Company" value={genInput.brand}
                                        onChange={e => setGenInput(g => ({ ...g, brand: e.target.value }))} required />
                                    <button type="submit" className="btn-primary"><RefreshCw size={16} /> Generate</button>
                                </form>

                                {genResult && (
                                    <div>
                                        <h4>Cold Openers (3 variations)</h4>
                                        {genResult.openers.map((msg, i) => (
                                            <div key={i} className="out-msg-item">
                                                <div className="out-msg-type">Opener {i + 1}</div>
                                                <p className="out-msg-text">{msg}</p>
                                                <button className="gen-copy-btn" style={{ marginTop: 8 }} onClick={() => copyText(msg, `gen-o-${i}`)}>
                                                    {copied === `gen-o-${i}` ? <><CheckCircle size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
                                                </button>
                                            </div>
                                        ))}
                                        <h4 style={{ marginTop: 16 }}>Follow-ups (2)</h4>
                                        {genResult.followUps.map((msg, i) => (
                                            <div key={i} className="out-msg-item">
                                                <div className="out-msg-type">Follow-up {i + 1}</div>
                                                <p className="out-msg-text">{msg}</p>
                                                <button className="gen-copy-btn" style={{ marginTop: 8 }} onClick={() => copyText(msg, `gen-f-${i}`)}>
                                                    {copied === `gen-f-${i}` ? <><CheckCircle size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                .out-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 16px; }
                .out-card {
                    background: rgba(30,30,45,0.6); border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 16px; padding: 20px; cursor: pointer; transition: all 0.2s; position: relative;
                }
                .out-card:hover { border-color: rgba(99,102,241,0.3); transform: translateY(-2px); }
                .out-card.reminder { border-color: rgba(245,158,11,0.3); }
                .out-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
                .out-card-creator { display: flex; align-items: center; gap: 10px; }
                .out-avatar {
                    width: 36px; height: 36px; border-radius: 10px;
                    background: rgba(99,102,241,0.15); color: var(--accent-primary);
                    display: flex; align-items: center; justify-content: center;
                }
                .out-name { font-weight: 600; font-size: 0.9rem; color: var(--text-primary); }
                .out-channel { display: flex; align-items: center; gap: 4px; font-size: 0.75rem; color: var(--text-muted); }
                .out-reminder-badge {
                    display: flex; align-items: center; gap: 4px; padding: 3px 8px;
                    border-radius: 20px; font-size: 0.65rem; font-weight: 600;
                    background: rgba(245,158,11,0.15); color: #f59e0b;
                }
                .out-card-message { font-size: 0.8rem; color: var(--text-secondary); line-height: 1.4; margin-bottom: 12px; }
                .out-card-footer { display: flex; gap: 16px; font-size: 0.75rem; color: var(--text-muted); }
                .out-card-footer span { display: flex; align-items: center; gap: 4px; }
                .out-card-actions {
                    display: flex; gap: 8px; align-items: center; margin-top: 12px;
                    padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.04);
                }
                .out-status-select {
                    padding: 4px 10px; border-radius: 20px; font-size: 0.7rem; font-weight: 600;
                    border: none; cursor: pointer;
                }
                .out-card-actions button.danger {
                    width: 28px; height: 28px; border-radius: 8px; border: none;
                    background: rgba(239,68,68,0.1); color: #ef4444;
                    display: flex; align-items: center; justify-content: center; cursor: pointer;
                }

                .out-detail-meta { display: flex; gap: 16px; font-size: 0.85rem; color: var(--text-muted); flex-wrap: wrap; }
                .out-msg-item {
                    background: rgba(30,30,45,0.5); border: 1px solid rgba(255,255,255,0.04);
                    border-radius: 12px; padding: 14px; margin-bottom: 10px;
                }
                .out-msg-type { font-size: 0.75rem; font-weight: 600; color: var(--accent-primary); margin-bottom: 6px; }
                .out-msg-text { font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5; }
                .out-msg-meta { font-size: 0.75rem; color: var(--text-muted); margin-top: 8px; }
                .out-reminder-note {
                    display: flex; align-items: center; gap: 8px; margin-top: 16px; padding: 12px;
                    background: rgba(245,158,11,0.08); border: 1px solid rgba(245,158,11,0.2);
                    border-radius: 10px; font-size: 0.85rem; color: #f59e0b;
                }
                .gen-input {
                    flex: 1; min-width: 150px; padding: 10px 14px;
                    background: rgba(30,30,45,0.8); border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 10px; color: var(--text-primary); font-size: 0.85rem;
                }

                @media (max-width: 768px) { .out-grid { grid-template-columns: 1fr; } }
            `}</style>
        </div>
    )
}

export default OutreachDashboard
