import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Calendar, Plus, X, Clock, CheckCircle, Edit2, Trash2,
    Instagram, Youtube, FileText, Eye, AlertCircle, ShieldCheck, AlertTriangle
} from 'lucide-react'
import {
    getContentSchedule, createContentScheduleItem, updateContentScheduleItem,
    deleteContentScheduleItem, getCampaigns, getCreators
} from '../../stores/influencerStore'
import { checkContentCompliance, getAvailableCompetitorBrands } from '../../utils/complianceChecker'

function ContentScheduling() {
    const [schedule, setSchedule] = useState([])
    const [campaigns, setCampaigns] = useState([])
    const [creators, setCreators] = useState([])
    const [filter, setFilter] = useState('')
    const [showForm, setShowForm] = useState(false)
    const [editItem, setEditItem] = useState(null)
    const [viewMode, setViewMode] = useState('list')
    const [complianceResults, setComplianceResults] = useState({})

    function runComplianceCheck(item) {
        const campaign = campaigns.find(c => c.id === item.campaignId)
        const brandName = campaign?.brand || ''
        const result = checkContentCompliance(item, brandName)
        setComplianceResults(prev => ({ ...prev, [item.id]: result }))
    }

    function runAllComplianceChecks() {
        const results = {}
        schedule.forEach(item => {
            const campaign = campaigns.find(c => c.id === item.campaignId)
            results[item.id] = checkContentCompliance(item, campaign?.brand || '')
        })
        setComplianceResults(results)
    }

    const [form, setForm] = useState({
        campaignId: '', creatorId: '', creatorName: '', contentType: 'Reel',
        platform: 'Instagram', scheduledDate: '', scheduledTime: '12:00',
        status: 'Draft', caption: '', hashtags: '', notes: ''
    })

    useEffect(() => { reload() }, [filter])

    function reload() {
        setSchedule(getContentSchedule(filter ? { status: filter } : {}))
        setCampaigns(getCampaigns())
        setCreators(getCreators())
    }

    function handleSubmit(e) {
        e.preventDefault()
        const creator = creators.find(c => c.id === form.creatorId)
        const data = { ...form, creatorName: creator?.name || form.creatorName }
        if (editItem) updateContentScheduleItem(editItem.id, data)
        else createContentScheduleItem(data)
        setShowForm(false); setEditItem(null)
        setForm({ campaignId: '', creatorId: '', creatorName: '', contentType: 'Reel', platform: 'Instagram', scheduledDate: '', scheduledTime: '12:00', status: 'Draft', caption: '', hashtags: '', notes: '' })
        reload()
    }

    function handleEdit(item) {
        setEditItem(item)
        setForm({ ...item })
        setShowForm(true)
    }

    function handleStatusUpdate(id, status) {
        updateContentScheduleItem(id, { status })
        reload()
    }

    function handleDelete(id) {
        if (confirm('Delete content item?')) { deleteContentScheduleItem(id); reload() }
    }

    const statusColors = { Draft: '#6b7280', Scheduled: '#3b82f6', Published: '#10b981', Overdue: '#ef4444' }
    const contentTypes = ['Reel', 'Story', 'Static', 'Carousel', 'Dedicated Video', 'Shorts', 'Blog Post', 'Tweet']

    const groupedByDate = {}
    schedule.forEach(item => {
        const date = item.scheduledDate || 'Unscheduled'
        if (!groupedByDate[date]) groupedByDate[date] = []
        groupedByDate[date].push(item)
    })
    const sortedDates = Object.keys(groupedByDate).sort()

    return (
        <div className="page">
            <motion.div className="page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <div>
                    <h1 className="page-title"><span className="gradient-text">Content</span> Schedule</h1>
                    <p className="page-description">{schedule.length} content pieces • Plan and track creator content delivery</p>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button className="btn-secondary" onClick={runAllComplianceChecks} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <ShieldCheck size={16} /> Compliance Check
                    </button>
                    <button className="btn-primary" onClick={() => { setEditItem(null); setForm({ campaignId: '', creatorId: '', creatorName: '', contentType: 'Reel', platform: 'Instagram', scheduledDate: '', scheduledTime: '12:00', status: 'Draft', caption: '', hashtags: '', notes: '' }); setShowForm(true) }}>
                        <Plus size={18} /> Schedule Content
                    </button>
                </div>
            </motion.div>

            <div className="camp-filters">
                {['', 'Draft', 'Scheduled', 'Published', 'Overdue'].map(s => (
                    <button key={s} className={`camp-filter-btn ${filter === s ? 'active' : ''}`}
                        onClick={() => setFilter(s)}>{s || 'All'}</button>
                ))}
            </div>

            <div className="cs-timeline">
                {sortedDates.map(date => (
                    <div key={date} className="cs-date-group">
                        <div className="cs-date-header">
                            <Calendar size={16} />
                            <span>{date === 'Unscheduled' ? 'Unscheduled' : new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                            <span className="cs-date-count">{groupedByDate[date].length} items</span>
                        </div>
                        <div className="cs-items">
                            {groupedByDate[date].map((item, i) => {
                                const isOverdue = item.status !== 'Published' && new Date(item.scheduledDate) < new Date()
                                return (
                                    <motion.div key={item.id} className={`cs-item ${isOverdue ? 'overdue' : ''}`}
                                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
                                        <div className="cs-item-time">
                                            <Clock size={14} /> {item.scheduledTime || '—'}
                                        </div>
                                        <div className="cs-item-content">
                                            <div className="cs-item-header">
                                                <div className="cs-item-type">
                                                    {item.platform === 'Instagram' ? <Instagram size={14} /> : <Youtube size={14} />}
                                                    {item.contentType}
                                                </div>
                                                <span className="inf-status-badge" style={{ background: `${statusColors[isOverdue ? 'Overdue' : item.status]}20`, color: statusColors[isOverdue ? 'Overdue' : item.status] }}>
                                                    {isOverdue ? 'Overdue' : item.status}
                                                </span>
                                            </div>
                                            <div className="cs-item-creator">{item.creatorName}</div>
                                            {item.caption && <p className="cs-item-caption">{item.caption}</p>}
                                            {item.hashtags && <div className="cs-item-tags">{item.hashtags}</div>}
                                            {item.notes && <div className="cs-item-notes">{item.notes}</div>}
                                            {complianceResults[item.id] && (
                                                <div className={`cs-compliance ${complianceResults[item.id].passed ? 'passed' : 'failed'}`}>
                                                    <div className="cs-compliance-header">
                                                        {complianceResults[item.id].passed
                                                            ? <><ShieldCheck size={14} /> Compliance: Passed ({complianceResults[item.id].score}/100)</>
                                                            : <><AlertTriangle size={14} /> Compliance: Issues Found ({complianceResults[item.id].score}/100)</>
                                                        }
                                                    </div>
                                                    {complianceResults[item.id].issues.map((issue, ii) => (
                                                        <div key={ii} className={`cs-compliance-issue severity-${issue.severity}`}>
                                                            <span>{issue.icon}</span> <span>{issue.message}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            <div className="cs-item-actions">
                                                <button onClick={() => runComplianceCheck(item)} title="Check Compliance" style={{ color: '#10b981' }}>
                                                    <ShieldCheck size={14} />
                                                </button>
                                                <select value={item.status}
                                                    onChange={e => handleStatusUpdate(item.id, e.target.value)}
                                                    className="out-status-select"
                                                    style={{ background: `${statusColors[item.status]}15`, color: statusColors[item.status] }}>
                                                    <option>Draft</option><option>Scheduled</option><option>Published</option>
                                                </select>
                                                <button onClick={() => handleEdit(item)}><Edit2 size={14} /></button>
                                                <button className="danger" onClick={() => handleDelete(item.id)}><Trash2 size={14} /></button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </div>
                    </div>
                ))}
                {schedule.length === 0 && <div className="inf-empty">No content scheduled. Start scheduling creator content!</div>}
            </div>

            {/* Form Modal */}
            <AnimatePresence>
                {showForm && (
                    <motion.div className="inf-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowForm(false)}>
                        <motion.div className="inf-modal" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()}>
                            <div className="inf-modal-header">
                                <h2>{editItem ? 'Edit Content' : 'Schedule Content'}</h2>
                                <button onClick={() => setShowForm(false)}><X size={20} /></button>
                            </div>
                            <form className="inf-form" onSubmit={handleSubmit}>
                                <div className="inf-form-grid">
                                    <div className="inf-form-group"><label>Campaign</label>
                                        <select value={form.campaignId} onChange={e => setForm(f => ({ ...f, campaignId: e.target.value }))}>
                                            <option value="">Select Campaign</option>
                                            {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select></div>
                                    <div className="inf-form-group"><label>Creator *</label>
                                        <select value={form.creatorId} onChange={e => setForm(f => ({ ...f, creatorId: e.target.value }))} required>
                                            <option value="">Select Creator</option>
                                            {creators.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select></div>
                                    <div className="inf-form-group"><label>Content Type</label>
                                        <select value={form.contentType} onChange={e => setForm(f => ({ ...f, contentType: e.target.value }))}>
                                            {contentTypes.map(t => <option key={t}>{t}</option>)}
                                        </select></div>
                                    <div className="inf-form-group"><label>Platform</label>
                                        <select value={form.platform} onChange={e => setForm(f => ({ ...f, platform: e.target.value }))}>
                                            <option>Instagram</option><option>YouTube</option><option>Twitter</option><option>LinkedIn</option>
                                        </select></div>
                                    <div className="inf-form-group"><label>Date *</label>
                                        <input type="date" value={form.scheduledDate} onChange={e => setForm(f => ({ ...f, scheduledDate: e.target.value }))} required /></div>
                                    <div className="inf-form-group"><label>Time</label>
                                        <input type="time" value={form.scheduledTime} onChange={e => setForm(f => ({ ...f, scheduledTime: e.target.value }))} /></div>
                                    <div className="inf-form-group"><label>Status</label>
                                        <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                                            <option>Draft</option><option>Scheduled</option><option>Published</option>
                                        </select></div>
                                    <div className="inf-form-group full-width"><label>Caption</label>
                                        <textarea value={form.caption} onChange={e => setForm(f => ({ ...f, caption: e.target.value }))} rows={2} /></div>
                                    <div className="inf-form-group full-width"><label>Hashtags</label>
                                        <input value={form.hashtags} onChange={e => setForm(f => ({ ...f, hashtags: e.target.value }))} placeholder="#brand #campaign" /></div>
                                    <div className="inf-form-group full-width"><label>Notes</label>
                                        <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} /></div>
                                </div>
                                <div className="inf-form-btns">
                                    <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                                    <button type="submit" className="btn-primary">{editItem ? 'Update' : 'Schedule'}</button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                .cs-timeline { display: flex; flex-direction: column; gap: 24px; }
                .cs-date-header {
                    display: flex; align-items: center; gap: 10px; padding: 10px 0;
                    font-size: 0.9rem; font-weight: 600; color: var(--text-primary);
                    border-bottom: 1px solid rgba(255,255,255,0.06); margin-bottom: 12px;
                }
                .cs-date-count {
                    font-size: 0.75rem; font-weight: 400; color: var(--text-muted);
                    padding: 2px 10px; border-radius: 20px; background: rgba(255,255,255,0.05);
                }
                .cs-items { display: flex; flex-direction: column; gap: 10px; padding-left: 16px; border-left: 2px solid rgba(99,102,241,0.2); }
                .cs-item {
                    display: flex; gap: 16px; background: rgba(30,30,45,0.6);
                    border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; padding: 16px;
                    transition: all 0.2s;
                }
                .cs-item:hover { border-color: rgba(99,102,241,0.3); }
                .cs-item.overdue { border-color: rgba(239,68,68,0.3); }
                .cs-item-time { font-size: 0.8rem; color: var(--text-muted); display: flex; align-items: flex-start; gap: 4px; min-width: 60px; padding-top: 2px; }
                .cs-item-content { flex: 1; }
                .cs-item-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
                .cs-item-type { display: flex; align-items: center; gap: 6px; font-size: 0.8rem; font-weight: 600; color: var(--accent-primary); }
                .cs-item-creator { font-weight: 600; font-size: 0.9rem; color: var(--text-primary); margin-bottom: 6px; }
                .cs-item-caption { font-size: 0.8rem; color: var(--text-secondary); line-height: 1.4; margin-bottom: 4px; }
                .cs-item-tags { font-size: 0.75rem; color: #6366f1; margin-bottom: 4px; }
                .cs-item-notes { font-size: 0.75rem; color: var(--text-muted); font-style: italic; margin-bottom: 8px; }
                .cs-item-actions { display: flex; gap: 8px; align-items: center; }
                .cs-item-actions button {
                    width: 28px; height: 28px; border-radius: 8px; border: none;
                    background: rgba(255,255,255,0.05); color: var(--text-secondary);
                    display: flex; align-items: center; justify-content: center; cursor: pointer;
                }
                .cs-item-actions button:hover { background: rgba(99,102,241,0.15); color: var(--accent-primary); }
                .cs-item-actions button.danger:hover { background: rgba(239,68,68,0.15); color: #ef4444; }

                .cs-compliance { margin-bottom: 10px; padding: 10px; border-radius: 10px; font-size: 0.8rem; }
                .cs-compliance.passed { background: rgba(16,185,129,0.08); border: 1px solid rgba(16,185,129,0.2); }
                .cs-compliance.failed { background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2); }
                .cs-compliance-header { display: flex; align-items: center; gap: 6px; font-weight: 600; margin-bottom: 6px; }
                .cs-compliance.passed .cs-compliance-header { color: #10b981; }
                .cs-compliance.failed .cs-compliance-header { color: #ef4444; }
                .cs-compliance-issue { display: flex; align-items: center; gap: 6px; padding: 3px 0; color: var(--text-secondary); font-size: 0.75rem; }
                .cs-compliance-issue.severity-high { color: #ef4444; }
                .cs-compliance-issue.severity-medium { color: #f59e0b; }
                .cs-compliance-issue.severity-low { color: var(--text-muted); }
            `}</style>
        </div>
    )
}

export default ContentScheduling
