import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wand2, ChevronRight, ChevronLeft, Search, Check, Plus, Trash2, Save, Rocket, Users, FileText, Eye, Calendar, DollarSign, Target, Star } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { getCreators, createCampaign, getCreatorTier, getCreatorTierLabel, getCreatorTierColor, calculateCreatorScore } from '../../stores/influencerStore'
import { getCurrency } from '../../stores/settingsStore'

const STEPS = ['Details', 'Select Creators', 'Set Deliverables', 'Review & Launch']
const PLATFORMS = ['Instagram', 'YouTube', 'Twitter', 'LinkedIn', 'TikTok']
const OBJECTIVES = ['Brand Awareness', 'Product Launch', 'Sales', 'App Downloads', 'Lead Generation']
const CONTENT_TYPES = ['Reel', 'Story', 'Static Post', 'Carousel', 'Dedicated Video', 'Shorts', 'Blog Post']
const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899']

const card = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 20 }
const input = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 14px', color: '#fff', width: '100%', fontSize: 14, outline: 'none' }
const btnPrimary = { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }
const btnSecondary = { background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 20px', cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }

export default function CampaignBuilder() {
    const [step, setStep] = useState(0)
    const [creators, setCreators] = useState([])
    const [search, setSearch] = useState('')
    const [platformFilter, setPlatformFilter] = useState('')

    const [details, setDetails] = useState({ name: '', brand: '', platform: 'Instagram', budget: '', objective: 'Brand Awareness', startDate: '', endDate: '' })
    const [selectedCreators, setSelectedCreators] = useState([])
    const [deliverables, setDeliverables] = useState({})
    const [saved, setSaved] = useState(false)

    const sym = getCurrency().symbol

    useEffect(() => { setCreators(getCreators()) }, [])

    const formatCurrency = v => {
        const n = Number(v)
        if (n >= 100000) return `${sym}${(n / 100000).toFixed(1)}L`
        if (n >= 1000) return `${sym}${(n / 1000).toFixed(1)}K`
        return `${sym}${n}`
    }

    const formatNum = n => {
        if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
        if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
        return String(n)
    }

    const filteredCreators = creators.filter(c => {
        if (platformFilter && c.platform !== platformFilter) return false
        if (search) {
            const s = search.toLowerCase()
            return c.name.toLowerCase().includes(s) || c.handle.toLowerCase().includes(s) || c.niche.toLowerCase().includes(s)
        }
        return true
    })

    const toggleCreator = id => {
        setSelectedCreators(prev => {
            if (prev.includes(id)) return prev.filter(x => x !== id)
            return [...prev, id]
        })
    }

    const getSelectedCreatorObjects = () => creators.filter(c => selectedCreators.includes(c.id))

    const addDeliverable = creatorId => {
        setDeliverables(prev => ({
            ...prev,
            [creatorId]: [...(prev[creatorId] || []), { type: 'Reel', quantity: 1, dueDate: '', fee: 0 }]
        }))
    }

    const updateDeliverable = (creatorId, index, field, value) => {
        setDeliverables(prev => {
            const items = [...(prev[creatorId] || [])]
            items[index] = { ...items[index], [field]: value }
            return { ...prev, [creatorId]: items }
        })
    }

    const removeDeliverable = (creatorId, index) => {
        setDeliverables(prev => {
            const items = [...(prev[creatorId] || [])]
            items.splice(index, 1)
            return { ...prev, [creatorId]: items }
        })
    }

    const totalAllocated = Object.values(deliverables).flat().reduce((s, d) => s + Number(d.fee || 0), 0)
    const budgetNum = Number(details.budget) || 0
    const budgetRemaining = budgetNum - totalAllocated

    const pieData = getSelectedCreatorObjects().map((c, i) => {
        const creatorFees = (deliverables[c.id] || []).reduce((s, d) => s + Number(d.fee || 0), 0)
        return { name: c.name, value: creatorFees, color: COLORS[i % COLORS.length] }
    }).filter(d => d.value > 0)
    if (budgetRemaining > 0) pieData.push({ name: 'Unallocated', value: budgetRemaining, color: '#374151' })

    const canNext = () => {
        if (step === 0) return details.name && details.brand && details.budget && details.startDate && details.endDate
        if (step === 1) return selectedCreators.length > 0
        if (step === 2) return Object.values(deliverables).flat().length > 0
        return true
    }

    const handleLaunch = (status = 'Planning') => {
        const campaignData = {
            ...details,
            budget: budgetNum,
            status,
            creators: getSelectedCreatorObjects().map(c => ({
                creatorId: c.id,
                deliverables: (deliverables[c.id] || []).map(d => ({ type: d.type, quantity: Number(d.quantity), status: 'Pending', dueDate: d.dueDate })),
                totalFee: (deliverables[c.id] || []).reduce((s, d) => s + Number(d.fee || 0), 0),
                paymentStatus: 'Unpaid',
                contentInsights: null
            }))
        }
        createCampaign(campaignData)
        setSaved(true)
    }

    return (
        <div style={{ padding: '24px 32px', color: '#fff', minHeight: '100vh' }}>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
                <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}><span style={{ background: 'linear-gradient(135deg, #6366f1, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Campaign</span> Builder</h1>
                <p style={{ color: '#94a3b8', margin: '4px 0 0' }}>Create and launch influencer campaigns step by step</p>
            </motion.div>

            {/* Progress Bar */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 32, alignItems: 'center' }}>
                {STEPS.map((s, i) => (
                    <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
                        <div style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, background: i <= step ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.05)', border: i <= step ? 'none' : '1px solid rgba(255,255,255,0.1)', color: i <= step ? '#fff' : '#64748b', flexShrink: 0 }}>
                            {i < step ? <Check size={14} /> : i + 1}
                        </div>
                        <span style={{ fontSize: 13, color: i <= step ? '#fff' : '#64748b', whiteSpace: 'nowrap' }}>{s}</span>
                        {i < STEPS.length - 1 && <div style={{ flex: 1, height: 2, background: i < step ? '#6366f1' : 'rgba(255,255,255,0.1)', borderRadius: 1, minWidth: 20 }} />}
                    </div>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {/* Step 1: Details */}
                {step === 0 && (
                    <motion.div key="step0" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} style={card}>
                        <h2 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 8 }}><FileText size={18} /> Campaign Details</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                            <div>
                                <label style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4, display: 'block' }}>Campaign Name *</label>
                                <input style={input} placeholder="e.g. Summer Glow Campaign" value={details.name} onChange={e => setDetails(p => ({ ...p, name: e.target.value }))} />
                            </div>
                            <div>
                                <label style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4, display: 'block' }}>Brand *</label>
                                <input style={input} placeholder="e.g. Nykaa" value={details.brand} onChange={e => setDetails(p => ({ ...p, brand: e.target.value }))} />
                            </div>
                            <div>
                                <label style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4, display: 'block' }}>Platform</label>
                                <select style={input} value={details.platform} onChange={e => setDetails(p => ({ ...p, platform: e.target.value }))}>
                                    {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </div>
                            <div>
                                <label style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4, display: 'block' }}>Budget ({sym}) *</label>
                                <input style={input} type="number" placeholder="e.g. 500000" value={details.budget} onChange={e => setDetails(p => ({ ...p, budget: e.target.value }))} />
                            </div>
                            <div>
                                <label style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4, display: 'block' }}>Objective</label>
                                <select style={input} value={details.objective} onChange={e => setDetails(p => ({ ...p, objective: e.target.value }))}>
                                    {OBJECTIVES.map(o => <option key={o} value={o}>{o}</option>)}
                                </select>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div>
                                    <label style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4, display: 'block' }}>Start Date *</label>
                                    <input style={input} type="date" value={details.startDate} onChange={e => setDetails(p => ({ ...p, startDate: e.target.value }))} />
                                </div>
                                <div>
                                    <label style={{ fontSize: 12, color: '#94a3b8', marginBottom: 4, display: 'block' }}>End Date *</label>
                                    <input style={input} type="date" value={details.endDate} onChange={e => setDetails(p => ({ ...p, endDate: e.target.value }))} />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Step 2: Select Creators */}
                {step === 1 && (
                    <motion.div key="step1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} style={card}>
                        <h2 style={{ fontSize: 18, fontWeight: 600, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}><Users size={18} /> Select Creators ({selectedCreators.length} selected)</h2>
                        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                            <div style={{ position: 'relative', flex: 1 }}>
                                <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                                <input style={{ ...input, paddingLeft: 36 }} placeholder="Search creators..." value={search} onChange={e => setSearch(e.target.value)} />
                            </div>
                            <select style={{ ...input, width: 160 }} value={platformFilter} onChange={e => setPlatformFilter(e.target.value)}>
                                <option value="">All Platforms</option>
                                {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                        </div>
                        <div style={{ display: 'grid', gap: 8, maxHeight: 420, overflowY: 'auto' }}>
                            {filteredCreators.map(c => {
                                const score = calculateCreatorScore(c)
                                const tier = getCreatorTier(c.followers)
                                const isSelected = selectedCreators.includes(c.id)
                                return (
                                    <motion.div key={c.id} whileHover={{ scale: 1.01 }} onClick={() => toggleCreator(c.id)} style={{ ...card, padding: 14, display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', border: isSelected ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.1)', background: isSelected ? 'rgba(99,102,241,0.1)' : 'rgba(255,255,255,0.03)' }}>
                                        <div style={{ width: 24, height: 24, borderRadius: 6, background: isSelected ? '#6366f1' : 'rgba(255,255,255,0.05)', border: isSelected ? 'none' : '1px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            {isSelected && <Check size={14} color="#fff" />}
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontWeight: 600, fontSize: 14 }}>{c.name}</div>
                                            <div style={{ fontSize: 12, color: '#94a3b8' }}>{c.handle} - {c.niche} - {c.city}</div>
                                        </div>
                                        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexShrink: 0 }}>
                                            <span style={{ fontSize: 12, color: '#94a3b8' }}>{formatNum(c.followers)} followers</span>
                                            <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: getCreatorTierColor(tier) + '22', color: getCreatorTierColor(tier), fontWeight: 600 }}>{getCreatorTierLabel(tier)}</span>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <Star size={13} color="#f59e0b" fill="#f59e0b" />
                                                <span style={{ fontSize: 13, fontWeight: 600 }}>{score.total}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </div>
                    </motion.div>
                )}

                {/* Step 3: Set Deliverables */}
                {step === 2 && (
                    <motion.div key="step2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}><Target size={18} /> Deliverables per Creator</h2>
                            <div style={{ fontSize: 13, color: budgetRemaining < 0 ? '#ef4444' : '#10b981' }}>
                                Budget: {formatCurrency(totalAllocated)} / {formatCurrency(budgetNum)} ({budgetRemaining >= 0 ? formatCurrency(budgetRemaining) + ' remaining' : 'Over by ' + formatCurrency(Math.abs(budgetRemaining))})
                            </div>
                        </div>
                        {getSelectedCreatorObjects().map(c => (
                            <div key={c.id} style={{ ...card, marginBottom: 12 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                    <div>
                                        <div style={{ fontWeight: 600 }}>{c.name}</div>
                                        <div style={{ fontSize: 12, color: '#94a3b8' }}>{c.handle} - Rate: {formatCurrency(c.lastQuotedRate)}</div>
                                    </div>
                                    <button style={btnSecondary} onClick={() => addDeliverable(c.id)}><Plus size={14} /> Add</button>
                                </div>
                                {(deliverables[c.id] || []).length > 0 && (
                                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                        <thead>
                                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                                <th style={{ textAlign: 'left', padding: '8px 0', fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>Content Type</th>
                                                <th style={{ textAlign: 'left', padding: '8px 0', fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>Qty</th>
                                                <th style={{ textAlign: 'left', padding: '8px 0', fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>Due Date</th>
                                                <th style={{ textAlign: 'left', padding: '8px 0', fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>Fee ({sym})</th>
                                                <th style={{ width: 40 }}></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(deliverables[c.id] || []).map((d, i) => (
                                                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                    <td style={{ padding: '6px 0' }}>
                                                        <select style={{ ...input, width: 150 }} value={d.type} onChange={e => updateDeliverable(c.id, i, 'type', e.target.value)}>
                                                            {CONTENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                                        </select>
                                                    </td>
                                                    <td style={{ padding: '6px 0' }}>
                                                        <input style={{ ...input, width: 60 }} type="number" min="1" value={d.quantity} onChange={e => updateDeliverable(c.id, i, 'quantity', e.target.value)} />
                                                    </td>
                                                    <td style={{ padding: '6px 0' }}>
                                                        <input style={{ ...input, width: 140 }} type="date" value={d.dueDate} onChange={e => updateDeliverable(c.id, i, 'dueDate', e.target.value)} />
                                                    </td>
                                                    <td style={{ padding: '6px 0' }}>
                                                        <input style={{ ...input, width: 100 }} type="number" value={d.fee} onChange={e => updateDeliverable(c.id, i, 'fee', e.target.value)} />
                                                    </td>
                                                    <td style={{ padding: '6px 0' }}>
                                                        <button style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 4 }} onClick={() => removeDeliverable(c.id, i)}><Trash2 size={14} /></button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                                {!(deliverables[c.id] || []).length && <div style={{ fontSize: 13, color: '#64748b', textAlign: 'center', padding: 12 }}>No deliverables added yet. Click "Add" to set deliverables.</div>}
                            </div>
                        ))}
                    </motion.div>
                )}

                {/* Step 4: Review & Launch */}
                {step === 3 && (
                    <motion.div key="step3" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                        {saved ? (
                            <div style={{ ...card, textAlign: 'center', padding: 60 }}>
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
                                    <Rocket size={48} color="#10b981" style={{ marginBottom: 16 }} />
                                </motion.div>
                                <h2 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 8px' }}>Campaign Created!</h2>
                                <p style={{ color: '#94a3b8' }}>Your campaign has been saved and is ready to go.</p>
                            </div>
                        ) : (
                            <>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                    <div style={card}>
                                        <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 8 }}><Eye size={16} /> Campaign Summary</h3>
                                        <div style={{ display: 'grid', gap: 10 }}>
                                            {[
                                                ['Campaign', details.name],
                                                ['Brand', details.brand],
                                                ['Platform', details.platform],
                                                ['Objective', details.objective],
                                                ['Budget', formatCurrency(budgetNum)],
                                                ['Dates', `${details.startDate} to ${details.endDate}`],
                                                ['Creators', selectedCreators.length],
                                                ['Total Deliverables', Object.values(deliverables).flat().length],
                                                ['Allocated', formatCurrency(totalAllocated)],
                                            ].map(([label, value]) => (
                                                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                                                    <span style={{ color: '#94a3b8' }}>{label}</span>
                                                    <span style={{ fontWeight: 500 }}>{value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    <div style={card}>
                                        <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 14px', display: 'flex', alignItems: 'center', gap: 8 }}><DollarSign size={16} /> Budget Breakdown</h3>
                                        {pieData.length > 0 ? (
                                            <ResponsiveContainer width="100%" height={220}>
                                                <PieChart>
                                                    <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} innerRadius={50} dataKey="value" paddingAngle={2}>
                                                        {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                                                    </Pie>
                                                    <Tooltip formatter={v => formatCurrency(v)} contentStyle={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        ) : <div style={{ textAlign: 'center', color: '#64748b', padding: 40 }}>No allocations yet</div>}
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                                            {pieData.map(d => (
                                                <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                                                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color }} />
                                                    <span style={{ color: '#94a3b8' }}>{d.name}: {formatCurrency(d.value)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ ...card, marginTop: 16 }}>
                                    <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 14px' }}>Creator Breakdown</h3>
                                    {getSelectedCreatorObjects().map(c => {
                                        const cDels = deliverables[c.id] || []
                                        const cTotal = cDels.reduce((s, d) => s + Number(d.fee || 0), 0)
                                        return (
                                            <div key={c.id} style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                                    <span style={{ fontWeight: 500, fontSize: 14 }}>{c.name}</span>
                                                    <span style={{ fontWeight: 600, color: '#10b981' }}>{formatCurrency(cTotal)}</span>
                                                </div>
                                                <div style={{ fontSize: 12, color: '#94a3b8' }}>
                                                    {cDels.map(d => `${d.quantity}x ${d.type}`).join(', ') || 'No deliverables'}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Navigation */}
            {!saved && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
                    <button style={btnSecondary} onClick={() => step > 0 && setStep(step - 1)} disabled={step === 0}>
                        <ChevronLeft size={16} /> Back
                    </button>
                    <div style={{ display: 'flex', gap: 10 }}>
                        {step === 3 && (
                            <button style={btnSecondary} onClick={() => handleLaunch('Draft')}>
                                <Save size={14} /> Save as Draft
                            </button>
                        )}
                        {step < 3 ? (
                            <button style={{ ...btnPrimary, opacity: canNext() ? 1 : 0.5 }} onClick={() => canNext() && setStep(step + 1)} disabled={!canNext()}>
                                Next <ChevronRight size={16} />
                            </button>
                        ) : (
                            <button style={btnPrimary} onClick={() => handleLaunch('Active')}>
                                <Rocket size={14} /> Launch Campaign
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
