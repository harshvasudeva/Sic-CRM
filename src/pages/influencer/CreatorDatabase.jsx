import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Users, Search, Plus, Filter, Instagram, Youtube, MapPin, Eye,
    IndianRupee, Phone, Mail, Tag, Edit2, Trash2, X, ChevronDown,
    Star, MessageSquare, TrendingUp, Copy, ExternalLink
} from 'lucide-react'
import {
    getCreators, createCreator, updateCreator, deleteCreator, getLabels,
    createLabel, addDealToCreator, calculateSmartAvgViews, calculateSuggestedCPV,
    getCreatorsWithScores, verifyCreator, getCreatorTierLabel, getCreatorTierColor
} from '../../stores/influencerStore'
import { getCurrency } from '../../stores/settingsStore'
import CreatorScoreCard from '../../components/influencer/CreatorScoreCard'

function CreatorDatabase() {
    const [creators, setCreators] = useState([])
    const [labels, setLabels] = useState([])
    const [filters, setFilters] = useState({ search: '', platform: '', niche: '', status: '', city: '', label: '' })
    const [showForm, setShowForm] = useState(false)
    const [editingCreator, setEditingCreator] = useState(null)
    const [selectedCreator, setSelectedCreator] = useState(null)
    const [showDealForm, setShowDealForm] = useState(false)
    const [showFilters, setShowFilters] = useState(false)

    const [formData, setFormData] = useState({
        name: '', platform: 'Instagram', handle: '', followers: '', niche: '', city: '',
        contactWhatsApp: '', contactEmail: '', lastQuotedRate: '', lowestClosedRate: '',
        brandsWorkedWith: '', negotiationNotes: '', status: 'Cold', labels: [], reelViews: ''
    })

    const [dealForm, setDealForm] = useState({ brand: '', amount: '', deliverables: '', date: '', status: 'Completed' })

    useEffect(() => { loadData() }, [filters])

    function loadData() {
        setCreators(getCreatorsWithScores(filters))
        setLabels(getLabels())
    }

    function handleVerify(creatorId) {
        verifyCreator(creatorId, 'verified')
        loadData()
        if (selectedCreator?.id === creatorId) {
            setSelectedCreator(getCreatorsWithScores().find(c => c.id === creatorId))
        }
    }

    function resetForm() {
        setFormData({ name: '', platform: 'Instagram', handle: '', followers: '', niche: '', city: '',
            contactWhatsApp: '', contactEmail: '', lastQuotedRate: '', lowestClosedRate: '',
            brandsWorkedWith: '', negotiationNotes: '', status: 'Cold', labels: [], reelViews: '' })
        setEditingCreator(null)
        setShowForm(false)
    }

    function handleEdit(creator) {
        setEditingCreator(creator)
        setFormData({
            ...creator,
            followers: String(creator.followers),
            lastQuotedRate: String(creator.lastQuotedRate || ''),
            lowestClosedRate: String(creator.lowestClosedRate || ''),
            brandsWorkedWith: (creator.brandsWorkedWith || []).join(', '),
            reelViews: (creator.reelViews || []).join(', '),
        })
        setShowForm(true)
    }

    function handleSubmit(e) {
        e.preventDefault()
        const data = {
            ...formData,
            followers: Number(formData.followers) || 0,
            lastQuotedRate: Number(formData.lastQuotedRate) || 0,
            lowestClosedRate: Number(formData.lowestClosedRate) || 0,
            brandsWorkedWith: formData.brandsWorkedWith ? formData.brandsWorkedWith.split(',').map(b => b.trim()).filter(Boolean) : [],
            reelViews: formData.reelViews ? formData.reelViews.split(',').map(v => Number(v.trim())).filter(v => v > 0) : [],
        }
        if (editingCreator) {
            updateCreator(editingCreator.id, data)
        } else {
            createCreator(data)
        }
        resetForm()
        loadData()
    }

    function handleDelete(id) {
        if (confirm('Delete this creator?')) {
            deleteCreator(id)
            if (selectedCreator?.id === id) setSelectedCreator(null)
            loadData()
        }
    }

    function handleAddDeal(e) {
        e.preventDefault()
        addDealToCreator(selectedCreator.id, {
            ...dealForm,
            amount: Number(dealForm.amount) || 0,
        })
        setShowDealForm(false)
        setDealForm({ brand: '', amount: '', deliverables: '', date: '', status: 'Completed' })
        loadData()
        setSelectedCreator(getCreators().find(c => c.id === selectedCreator.id))
    }

    function toggleLabel(labelId) {
        setFormData(prev => ({
            ...prev,
            labels: prev.labels.includes(labelId)
                ? prev.labels.filter(l => l !== labelId)
                : [...prev.labels, labelId]
        }))
    }

    const formatNum = (n) => {
        if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
        if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
        return String(n)
    }

    const formatCurrency = (val) => {
        if (!val) return '—'
        const s = getCurrency().symbol
        if (val >= 100000) return `${s}${(val / 100000).toFixed(1)}L`
        if (val >= 1000) return `${s}${(val / 1000).toFixed(1)}K`
        return `${s}${val}`
    }

    const statusColors = { Cold: '#6b7280', Talking: '#3b82f6', Closed: '#10b981', Ghosted: '#ef4444' }
    const niches = ['Lifestyle', 'Tech', 'Fitness', 'Food', 'Travel', 'Comedy', 'Fashion', 'Beauty', 'Education', 'Finance', 'Gaming']
    const cities = [...new Set(getCreators().map(c => c.city))].sort()

    return (
        <div className="page">
            <motion.div className="page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <div>
                    <h1 className="page-title"><span className="gradient-text">Creator</span> Database</h1>
                    <p className="page-description">{creators.length} creators tracked • Search, filter, and manage your influencer network</p>
                </div>
                <button className="btn-primary" onClick={() => { resetForm(); setShowForm(true) }}>
                    <Plus size={18} /> Add Creator
                </button>
            </motion.div>

            {/* Search & Filters */}
            <div className="inf-toolbar">
                <div className="inf-search-box">
                    <Search size={18} />
                    <input type="text" placeholder="Search creators by name, handle, niche, city..."
                        value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value }))} />
                </div>
                <button className="inf-filter-toggle" onClick={() => setShowFilters(!showFilters)}>
                    <Filter size={16} /> Filters <ChevronDown size={14} style={{ transform: showFilters ? 'rotate(180deg)' : 'none' }} />
                </button>
            </div>

            <AnimatePresence>
                {showFilters && (
                    <motion.div className="inf-filters" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                        <select value={filters.platform} onChange={e => setFilters(f => ({ ...f, platform: e.target.value }))}>
                            <option value="">All Platforms</option>
                            <option value="Instagram">Instagram</option>
                            <option value="YouTube">YouTube</option>
                        </select>
                        <select value={filters.niche} onChange={e => setFilters(f => ({ ...f, niche: e.target.value }))}>
                            <option value="">All Niches</option>
                            {niches.map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                        <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}>
                            <option value="">All Statuses</option>
                            <option value="Cold">Cold</option>
                            <option value="Talking">Talking</option>
                            <option value="Closed">Closed</option>
                            <option value="Ghosted">Ghosted</option>
                        </select>
                        <select value={filters.city} onChange={e => setFilters(f => ({ ...f, city: e.target.value }))}>
                            <option value="">All Cities</option>
                            {cities.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <select value={filters.label} onChange={e => setFilters(f => ({ ...f, label: e.target.value }))}>
                            <option value="">All Labels</option>
                            {labels.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                        </select>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Creator Table */}
            <motion.div className="inf-table-wrap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                <table className="inf-table">
                    <thead>
                        <tr>
                            <th>Creator</th>
                            <th>Score / Tier</th>
                            <th>Platform</th>
                            <th>Followers</th>
                            <th>Avg Views</th>
                            <th>Suggested CPV</th>
                            <th>Niche</th>
                            <th>City</th>
                            <th>Last Quoted</th>
                            <th>Lowest Closed</th>
                            <th>Status</th>
                            <th>Labels</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {creators.map(c => (
                            <tr key={c.id} onClick={() => setSelectedCreator(c)} className={selectedCreator?.id === c.id ? 'selected' : ''}>
                                <td>
                                    <div className="inf-creator-cell">
                                        <div className="inf-creator-avatar">{c.name.charAt(0)}</div>
                                        <div>
                                            <div className="inf-creator-name">{c.name}</div>
                                            <div className="inf-creator-handle">{c.handle}</div>
                                        </div>
                                    </div>
                                </td>
                                <td><CreatorScoreCard creator={c} compact /></td>
                                <td>
                                    <span className="inf-platform-badge" style={{ background: c.platform === 'Instagram' ? '#E1306C20' : '#FF000020', color: c.platform === 'Instagram' ? '#E1306C' : '#FF0000' }}>
                                        {c.platform === 'Instagram' ? <Instagram size={14} /> : <Youtube size={14} />} {c.platform}
                                    </span>
                                </td>
                                <td className="inf-num">{formatNum(c.followers)}</td>
                                <td className="inf-num">{formatNum(c.avgViews)}</td>
                                <td className="inf-num inf-cpv">{formatCurrency(c.suggestedCPV)}</td>
                                <td>{c.niche}</td>
                                <td><span className="inf-city"><MapPin size={12} /> {c.city}</span></td>
                                <td className="inf-num">{formatCurrency(c.lastQuotedRate)}</td>
                                <td className="inf-num">{formatCurrency(c.lowestClosedRate)}</td>
                                <td>
                                    <span className="inf-status-badge" style={{ background: `${statusColors[c.status]}20`, color: statusColors[c.status] }}>
                                        {c.status}
                                    </span>
                                </td>
                                <td>
                                    <div className="inf-labels-cell">
                                        {(c.labels || []).slice(0, 2).map(lid => {
                                            const label = labels.find(l => l.id === lid)
                                            return label ? <span key={lid} className="inf-label-dot" style={{ background: label.color }} title={label.name}></span> : null
                                        })}
                                        {(c.labels || []).length > 2 && <span className="inf-label-more">+{c.labels.length - 2}</span>}
                                    </div>
                                </td>
                                <td>
                                    <div className="inf-actions" onClick={e => e.stopPropagation()}>
                                        <button onClick={() => handleEdit(c)} title="Edit"><Edit2 size={14} /></button>
                                        <button onClick={() => handleDelete(c.id)} title="Delete" className="danger"><Trash2 size={14} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {creators.length === 0 && (
                            <tr><td colSpan="13" className="inf-empty-row">No creators found. Add your first creator!</td></tr>
                        )}
                    </tbody>
                </table>
            </motion.div>

            {/* Creator Detail Panel */}
            <AnimatePresence>
                {selectedCreator && (
                    <motion.div className="inf-detail-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <motion.div className="inf-detail-panel" initial={{ x: 400 }} animate={{ x: 0 }} exit={{ x: 400 }}>
                            <div className="inf-detail-header">
                                <h2>{selectedCreator.name}</h2>
                                <button onClick={() => setSelectedCreator(null)}><X size={20} /></button>
                            </div>

                            <div className="inf-detail-body">
                                <div className="inf-detail-top">
                                    <div className="inf-detail-avatar">{selectedCreator.name.charAt(0)}</div>
                                    <div>
                                        <div className="inf-detail-handle">{selectedCreator.handle}</div>
                                        <span className="inf-platform-badge" style={{ background: selectedCreator.platform === 'Instagram' ? '#E1306C20' : '#FF000020', color: selectedCreator.platform === 'Instagram' ? '#E1306C' : '#FF0000' }}>
                                            {selectedCreator.platform}
                                        </span>
                                        <span className="inf-status-badge" style={{ background: `${statusColors[selectedCreator.status]}20`, color: statusColors[selectedCreator.status], marginLeft: 8 }}>
                                            {selectedCreator.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="inf-detail-stats">
                                    <div><Eye size={14} /> <strong>{formatNum(selectedCreator.followers)}</strong> Followers</div>
                                    <div><TrendingUp size={14} /> <strong>{formatNum(selectedCreator.avgViews)}</strong> Avg Views</div>
                                    <div><IndianRupee size={14} /> <strong>{formatCurrency(selectedCreator.suggestedCPV)}</strong> CPV Rate</div>
                                </div>

                                {selectedCreator.creatorScore && (
                                    <div className="inf-detail-section">
                                        <h4>Creator Score & Verification</h4>
                                        <CreatorScoreCard creator={selectedCreator} onVerify={handleVerify} />
                                    </div>
                                )}

                                <div className="inf-detail-section">
                                    <h4>Contact</h4>
                                    <div className="inf-detail-contact">
                                        {selectedCreator.contactWhatsApp && <div><Phone size={14} /> {selectedCreator.contactWhatsApp}</div>}
                                        {selectedCreator.contactEmail && <div><Mail size={14} /> {selectedCreator.contactEmail}</div>}
                                        <div><MapPin size={14} /> {selectedCreator.city}</div>
                                    </div>
                                </div>

                                <div className="inf-detail-section">
                                    <h4>Rates</h4>
                                    <div className="inf-detail-rates">
                                        <div>Last Quoted: <strong>{formatCurrency(selectedCreator.lastQuotedRate)}</strong></div>
                                        <div>Lowest Closed: <strong>{formatCurrency(selectedCreator.lowestClosedRate)}</strong></div>
                                        <div>Suggested (0.5 CPV): <strong>{formatCurrency(selectedCreator.suggestedCPV)}</strong></div>
                                    </div>
                                </div>

                                <div className="inf-detail-section">
                                    <h4>Labels</h4>
                                    <div className="inf-detail-labels">
                                        {(selectedCreator.labels || []).map(lid => {
                                            const label = labels.find(l => l.id === lid)
                                            return label ? (
                                                <span key={lid} className="inf-label-chip" style={{ background: `${label.color}20`, color: label.color, borderColor: `${label.color}40` }}>
                                                    {label.name}
                                                </span>
                                            ) : null
                                        })}
                                        {(!selectedCreator.labels || selectedCreator.labels.length === 0) && <span className="inf-muted">No labels</span>}
                                    </div>
                                </div>

                                <div className="inf-detail-section">
                                    <h4>Brands Worked With</h4>
                                    <div className="inf-detail-brands">
                                        {(selectedCreator.brandsWorkedWith || []).map((b, i) => (
                                            <span key={i} className="inf-brand-chip">{b}</span>
                                        ))}
                                        {(!selectedCreator.brandsWorkedWith || selectedCreator.brandsWorkedWith.length === 0) && <span className="inf-muted">None yet</span>}
                                    </div>
                                </div>

                                <div className="inf-detail-section">
                                    <h4>Negotiation Notes</h4>
                                    <p className="inf-detail-notes">{selectedCreator.negotiationNotes || 'No notes'}</p>
                                </div>

                                <div className="inf-detail-section">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <h4>Deal History</h4>
                                        <button className="btn-sm" onClick={() => setShowDealForm(true)}><Plus size={14} /> Add Deal</button>
                                    </div>
                                    {(selectedCreator.dealHistory || []).length === 0 && <p className="inf-muted">No deals yet</p>}
                                    {(selectedCreator.dealHistory || []).map(deal => (
                                        <div key={deal.id} className="inf-deal-item">
                                            <div className="inf-deal-brand">{deal.brand}</div>
                                            <div className="inf-deal-meta">{formatCurrency(deal.amount)} • {deal.deliverables} • {deal.date}</div>
                                            <span className="inf-deal-status" data-status={deal.status}>{deal.status}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {showDealForm && (
                                <div className="inf-deal-form-overlay">
                                    <form className="inf-deal-form" onSubmit={handleAddDeal}>
                                        <h4>Add Deal</h4>
                                        <input placeholder="Brand" value={dealForm.brand} onChange={e => setDealForm(d => ({ ...d, brand: e.target.value }))} required />
                                        <input placeholder={`Amount (${getCurrency().symbol})`} type="number" value={dealForm.amount} onChange={e => setDealForm(d => ({ ...d, amount: e.target.value }))} required />
                                        <input placeholder="Deliverables" value={dealForm.deliverables} onChange={e => setDealForm(d => ({ ...d, deliverables: e.target.value }))} required />
                                        <input type="date" value={dealForm.date} onChange={e => setDealForm(d => ({ ...d, date: e.target.value }))} required />
                                        <select value={dealForm.status} onChange={e => setDealForm(d => ({ ...d, status: e.target.value }))}>
                                            <option value="Completed">Completed</option>
                                            <option value="In Progress">In Progress</option>
                                            <option value="Cancelled">Cancelled</option>
                                            <option value="Partial">Partial</option>
                                        </select>
                                        <div className="inf-form-btns">
                                            <button type="button" className="btn-secondary" onClick={() => setShowDealForm(false)}>Cancel</button>
                                            <button type="submit" className="btn-primary">Add Deal</button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Creator Form Modal */}
            <AnimatePresence>
                {showForm && (
                    <motion.div className="inf-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => resetForm()}>
                        <motion.div className="inf-modal" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={e => e.stopPropagation()}>
                            <div className="inf-modal-header">
                                <h2>{editingCreator ? 'Edit Creator' : 'Add New Creator'}</h2>
                                <button onClick={resetForm}><X size={20} /></button>
                            </div>
                            <form className="inf-form" onSubmit={handleSubmit}>
                                <div className="inf-form-grid">
                                    <div className="inf-form-group">
                                        <label>Creator Name *</label>
                                        <input value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))} required />
                                    </div>
                                    <div className="inf-form-group">
                                        <label>Platform *</label>
                                        <select value={formData.platform} onChange={e => setFormData(f => ({ ...f, platform: e.target.value }))}>
                                            <option value="Instagram">Instagram</option>
                                            <option value="YouTube">YouTube</option>
                                        </select>
                                    </div>
                                    <div className="inf-form-group">
                                        <label>Handle *</label>
                                        <input value={formData.handle} onChange={e => setFormData(f => ({ ...f, handle: e.target.value }))} placeholder="@handle" required />
                                    </div>
                                    <div className="inf-form-group">
                                        <label>Followers</label>
                                        <input type="number" value={formData.followers} onChange={e => setFormData(f => ({ ...f, followers: e.target.value }))} />
                                    </div>
                                    <div className="inf-form-group">
                                        <label>Niche</label>
                                        <select value={formData.niche} onChange={e => setFormData(f => ({ ...f, niche: e.target.value }))}>
                                            <option value="">Select Niche</option>
                                            {niches.map(n => <option key={n} value={n}>{n}</option>)}
                                        </select>
                                    </div>
                                    <div className="inf-form-group">
                                        <label>City</label>
                                        <input value={formData.city} onChange={e => setFormData(f => ({ ...f, city: e.target.value }))} />
                                    </div>
                                    <div className="inf-form-group">
                                        <label>WhatsApp</label>
                                        <input value={formData.contactWhatsApp} onChange={e => setFormData(f => ({ ...f, contactWhatsApp: e.target.value }))} />
                                    </div>
                                    <div className="inf-form-group">
                                        <label>Email</label>
                                        <input type="email" value={formData.contactEmail} onChange={e => setFormData(f => ({ ...f, contactEmail: e.target.value }))} />
                                    </div>
                                    <div className="inf-form-group">
                                        <label>Last Quoted Rate ({getCurrency().symbol})</label>
                                        <input type="number" value={formData.lastQuotedRate} onChange={e => setFormData(f => ({ ...f, lastQuotedRate: e.target.value }))} />
                                    </div>
                                    <div className="inf-form-group">
                                        <label>Lowest Closed Rate ({getCurrency().symbol})</label>
                                        <input type="number" value={formData.lowestClosedRate} onChange={e => setFormData(f => ({ ...f, lowestClosedRate: e.target.value }))} />
                                    </div>
                                    <div className="inf-form-group">
                                        <label>Status</label>
                                        <select value={formData.status} onChange={e => setFormData(f => ({ ...f, status: e.target.value }))}>
                                            <option value="Cold">Cold</option>
                                            <option value="Talking">Talking</option>
                                            <option value="Closed">Closed</option>
                                            <option value="Ghosted">Ghosted</option>
                                        </select>
                                    </div>
                                    <div className="inf-form-group full-width">
                                        <label>Brands Worked With (comma separated)</label>
                                        <input value={formData.brandsWorkedWith} onChange={e => setFormData(f => ({ ...f, brandsWorkedWith: e.target.value }))} placeholder="Nykaa, Boat, Mamaearth" />
                                    </div>
                                    <div className="inf-form-group full-width">
                                        <label>Last 10 Reel Views (comma separated)</label>
                                        <input value={formData.reelViews} onChange={e => setFormData(f => ({ ...f, reelViews: e.target.value }))} placeholder="42000, 48000, 51000, ..." />
                                    </div>
                                    <div className="inf-form-group full-width">
                                        <label>Negotiation Notes</label>
                                        <textarea value={formData.negotiationNotes} onChange={e => setFormData(f => ({ ...f, negotiationNotes: e.target.value }))} rows={3} />
                                    </div>
                                    <div className="inf-form-group full-width">
                                        <label>Labels</label>
                                        <div className="inf-label-picker">
                                            {labels.map(l => (
                                                <button key={l.id} type="button"
                                                    className={`inf-label-pick ${formData.labels.includes(l.id) ? 'active' : ''}`}
                                                    style={{ '--label-color': l.color }}
                                                    onClick={() => toggleLabel(l.id)}>
                                                    {l.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="inf-form-btns">
                                    <button type="button" className="btn-secondary" onClick={resetForm}>Cancel</button>
                                    <button type="submit" className="btn-primary">{editingCreator ? 'Update' : 'Add'} Creator</button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                .inf-toolbar { display: flex; gap: 12px; margin-bottom: 16px; align-items: center; flex-wrap: wrap; }
                .inf-search-box {
                    flex: 1; min-width: 280px; display: flex; align-items: center; gap: 10px;
                    background: rgba(30,30,45,0.6); border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 12px; padding: 10px 16px;
                }
                .inf-search-box input { background: none; border: none; color: var(--text-primary); flex: 1; font-size: 0.9rem; outline: none; }
                .inf-search-box svg { color: var(--text-muted); }
                .inf-filter-toggle {
                    display: flex; align-items: center; gap: 6px; padding: 10px 16px;
                    background: rgba(30,30,45,0.6); border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 12px; color: var(--text-secondary); font-size: 0.85rem; cursor: pointer;
                }
                .inf-filter-toggle:hover { border-color: rgba(99,102,241,0.3); }
                .inf-filters {
                    display: flex; gap: 10px; margin-bottom: 16px; flex-wrap: wrap; overflow: hidden;
                }
                .inf-filters select {
                    background: rgba(30,30,45,0.8); border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 10px; padding: 8px 12px; color: var(--text-primary); font-size: 0.85rem;
                }

                .inf-table-wrap {
                    background: rgba(30,30,45,0.6); border: 1px solid rgba(255,255,255,0.06);
                    border-radius: 16px; overflow-x: auto; margin-bottom: 24px;
                }
                .inf-table { width: 100%; border-collapse: collapse; min-width: 1200px; }
                .inf-table th {
                    text-align: left; padding: 14px 16px; font-size: 0.75rem; font-weight: 600;
                    color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;
                    border-bottom: 1px solid rgba(255,255,255,0.06); white-space: nowrap;
                }
                .inf-table td {
                    padding: 12px 16px; font-size: 0.85rem; color: var(--text-secondary);
                    border-bottom: 1px solid rgba(255,255,255,0.03);
                }
                .inf-table tr { cursor: pointer; transition: background 0.15s; }
                .inf-table tbody tr:hover { background: rgba(255,255,255,0.02); }
                .inf-table tbody tr.selected { background: rgba(99,102,241,0.08); }
                .inf-num { font-variant-numeric: tabular-nums; text-align: right; }
                .inf-cpv { color: #10b981; font-weight: 600; }

                .inf-creator-cell { display: flex; align-items: center; gap: 10px; }
                .inf-creator-avatar {
                    width: 36px; height: 36px; border-radius: 10px;
                    background: rgba(99,102,241,0.15); color: var(--accent-primary);
                    display: flex; align-items: center; justify-content: center; font-weight: 700; flex-shrink: 0;
                }
                .inf-creator-name { font-weight: 600; color: var(--text-primary); white-space: nowrap; }
                .inf-creator-handle { font-size: 0.75rem; color: var(--text-muted); }

                .inf-platform-badge {
                    display: inline-flex; align-items: center; gap: 4px;
                    padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 600;
                }
                .inf-city { display: flex; align-items: center; gap: 4px; font-size: 0.8rem; }
                .inf-status-badge {
                    display: inline-block; padding: 4px 10px; border-radius: 20px;
                    font-size: 0.7rem; font-weight: 600; white-space: nowrap;
                }
                .inf-labels-cell { display: flex; align-items: center; gap: 4px; }
                .inf-label-dot { width: 10px; height: 10px; border-radius: 50%; display: inline-block; }
                .inf-label-more { font-size: 0.7rem; color: var(--text-muted); }

                .inf-actions { display: flex; gap: 4px; }
                .inf-actions button {
                    width: 30px; height: 30px; border-radius: 8px; border: none;
                    background: rgba(255,255,255,0.05); color: var(--text-secondary);
                    display: flex; align-items: center; justify-content: center; cursor: pointer;
                }
                .inf-actions button:hover { background: rgba(99,102,241,0.15); color: var(--accent-primary); }
                .inf-actions button.danger:hover { background: rgba(239,68,68,0.15); color: #ef4444; }
                .inf-empty-row { text-align: center; padding: 40px !important; color: var(--text-muted); }

                /* Detail Panel */
                .inf-detail-overlay {
                    position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 1000;
                    display: flex; justify-content: flex-end;
                }
                .inf-detail-panel {
                    width: 480px; max-width: 90vw; height: 100vh; overflow-y: auto;
                    background: rgba(18,18,28,0.98); border-left: 1px solid rgba(255,255,255,0.08);
                }
                .inf-detail-header {
                    display: flex; justify-content: space-between; align-items: center;
                    padding: 20px 24px; border-bottom: 1px solid rgba(255,255,255,0.06);
                }
                .inf-detail-header h2 { font-size: 1.2rem; }
                .inf-detail-header button { background: none; border: none; color: var(--text-secondary); cursor: pointer; }
                .inf-detail-body { padding: 20px 24px; }
                .inf-detail-top { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
                .inf-detail-avatar {
                    width: 56px; height: 56px; border-radius: 16px;
                    background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 1.4rem; font-weight: 700;
                }
                .inf-detail-handle { font-size: 0.9rem; color: var(--text-muted); margin-bottom: 6px; }
                .inf-detail-stats {
                    display: flex; gap: 20px; padding: 16px; margin-bottom: 20px;
                    background: rgba(30,30,45,0.5); border-radius: 12px;
                }
                .inf-detail-stats div {
                    display: flex; align-items: center; gap: 6px; font-size: 0.85rem; color: var(--text-secondary);
                }
                .inf-detail-stats strong { color: var(--text-primary); }
                .inf-detail-section { margin-bottom: 20px; }
                .inf-detail-section h4 { font-size: 0.85rem; font-weight: 600; color: var(--text-primary); margin-bottom: 10px; }
                .inf-detail-contact div { display: flex; align-items: center; gap: 8px; font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 6px; }
                .inf-detail-rates div { font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 4px; }
                .inf-detail-rates strong { color: var(--text-primary); }
                .inf-detail-labels { display: flex; flex-wrap: wrap; gap: 6px; }
                .inf-label-chip {
                    padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 600;
                    border: 1px solid;
                }
                .inf-detail-brands { display: flex; flex-wrap: wrap; gap: 6px; }
                .inf-brand-chip {
                    padding: 4px 12px; border-radius: 20px; font-size: 0.75rem;
                    background: rgba(99,102,241,0.1); color: var(--accent-primary); border: 1px solid rgba(99,102,241,0.2);
                }
                .inf-detail-notes { font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5; }
                .inf-muted { font-size: 0.8rem; color: var(--text-muted); }

                .inf-deal-item {
                    padding: 12px; background: rgba(30,30,45,0.5); border-radius: 10px; margin-bottom: 8px;
                }
                .inf-deal-brand { font-weight: 600; font-size: 0.85rem; color: var(--text-primary); }
                .inf-deal-meta { font-size: 0.75rem; color: var(--text-muted); margin-top: 4px; }
                .inf-deal-status { font-size: 0.7rem; font-weight: 600; color: #10b981; }
                .inf-deal-status[data-status="Partial"] { color: #f59e0b; }
                .inf-deal-status[data-status="Cancelled"] { color: #ef4444; }

                .btn-sm {
                    display: flex; align-items: center; gap: 4px; padding: 6px 12px;
                    background: rgba(99,102,241,0.15); color: var(--accent-primary);
                    border: 1px solid rgba(99,102,241,0.3); border-radius: 8px;
                    font-size: 0.75rem; cursor: pointer;
                }
                .btn-sm:hover { background: rgba(99,102,241,0.25); }

                .inf-deal-form-overlay {
                    position: absolute; inset: 0; background: rgba(0,0,0,0.6);
                    display: flex; align-items: center; justify-content: center; z-index: 10;
                }
                .inf-deal-form {
                    background: rgba(18,18,28,0.98); padding: 24px; border-radius: 16px;
                    border: 1px solid rgba(255,255,255,0.08); width: 350px;
                }
                .inf-deal-form h4 { margin-bottom: 16px; }
                .inf-deal-form input, .inf-deal-form select {
                    width: 100%; padding: 10px 12px; margin-bottom: 10px;
                    background: rgba(30,30,45,0.8); border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 10px; color: var(--text-primary); font-size: 0.85rem;
                }

                /* Modal */
                .inf-modal-overlay {
                    position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 1000;
                    display: flex; align-items: center; justify-content: center; padding: 20px;
                }
                .inf-modal {
                    background: rgba(18,18,28,0.98); border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 20px; width: 700px; max-width: 95vw; max-height: 90vh; overflow-y: auto;
                }
                .inf-modal-header {
                    display: flex; justify-content: space-between; align-items: center;
                    padding: 20px 24px; border-bottom: 1px solid rgba(255,255,255,0.06);
                }
                .inf-modal-header button { background: none; border: none; color: var(--text-secondary); cursor: pointer; }
                .inf-form { padding: 24px; }
                .inf-form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
                .inf-form-group { display: flex; flex-direction: column; gap: 6px; }
                .inf-form-group.full-width { grid-column: 1 / -1; }
                .inf-form-group label { font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); }
                .inf-form-group input, .inf-form-group select, .inf-form-group textarea {
                    padding: 10px 14px; background: rgba(30,30,45,0.8); border: 1px solid rgba(255,255,255,0.08);
                    border-radius: 10px; color: var(--text-primary); font-size: 0.85rem;
                }
                .inf-form-group textarea { resize: vertical; font-family: inherit; }
                .inf-form-group input:focus, .inf-form-group select:focus, .inf-form-group textarea:focus {
                    border-color: rgba(99,102,241,0.5); outline: none;
                }
                .inf-label-picker { display: flex; flex-wrap: wrap; gap: 6px; }
                .inf-label-pick {
                    padding: 6px 14px; border-radius: 20px; font-size: 0.75rem; font-weight: 600; cursor: pointer;
                    background: rgba(255,255,255,0.05); color: var(--text-secondary);
                    border: 1px solid rgba(255,255,255,0.08); transition: all 0.15s;
                }
                .inf-label-pick.active {
                    background: color-mix(in srgb, var(--label-color) 20%, transparent);
                    color: var(--label-color); border-color: var(--label-color);
                }

                .inf-form-btns {
                    display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;
                }

                .btn-primary {
                    display: flex; align-items: center; gap: 8px; padding: 10px 20px;
                    background: var(--accent-gradient); color: white; border: none;
                    border-radius: 10px; font-size: 0.85rem; font-weight: 600; cursor: pointer;
                }
                .btn-secondary {
                    padding: 10px 20px; background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.08); color: var(--text-secondary);
                    border-radius: 10px; font-size: 0.85rem; cursor: pointer;
                }

                @media (max-width: 768px) {
                    .inf-form-grid { grid-template-columns: 1fr; }
                    .inf-detail-panel { width: 100%; }
                }
            `}</style>
        </div>
    )
}

export default CreatorDatabase
