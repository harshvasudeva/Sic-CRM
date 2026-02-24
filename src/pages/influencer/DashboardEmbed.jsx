import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Link2, Copy, Code, Eye, Lock, Calendar, Users, Trash2,
    Plus, Settings, Globe, Shield, Clock, CheckSquare, Square
} from 'lucide-react'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899']
const STORAGE_KEY = 'sic-embed-links'

const METRICS_OPTIONS = [
    { key: 'followers', label: 'Followers' },
    { key: 'engagement', label: 'Engagement Rate' },
    { key: 'views', label: 'Avg Views' },
    { key: 'score', label: 'Creator Score' },
    { key: 'cost', label: 'Cost / Rate' },
    { key: 'deals', label: 'Deal History' },
    { key: 'niche', label: 'Niche' },
    { key: 'platform', label: 'Platform' },
]

function DashboardEmbed() {
    const [creators, setCreators] = useState([])
    const [selectedCreators, setSelectedCreators] = useState([])
    const [selectedMetrics, setSelectedMetrics] = useState(['followers', 'engagement', 'views', 'score'])
    const [branding, setBranding] = useState('Sic CRM')
    const [passwordProtect, setPasswordProtect] = useState(false)
    const [password, setPassword] = useState('')
    const [expiryDate, setExpiryDate] = useState('2026-03-31')
    const [embedLinks, setEmbedLinks] = useState([])
    const [showPreview, setShowPreview] = useState(false)
    const [copiedId, setCopiedId] = useState(null)

    useEffect(() => {
        try {
            const { getCreatorsWithScores } = require('../../stores/influencerStore')
            setCreators(getCreatorsWithScores() || [])
        } catch { setCreators([]) }

        try {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || []
            setEmbedLinks(saved)
        } catch { setEmbedLinks([]) }
    }, [])

    const toggleCreator = (id) => {
        setSelectedCreators(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        )
    }

    const toggleMetric = (key) => {
        setSelectedMetrics(prev =>
            prev.includes(key) ? prev.filter(m => m !== key) : [...prev, key]
        )
    }

    const generateLink = () => {
        if (selectedCreators.length === 0) return
        const embed = {
            id: `emb-${Date.now()}`,
            creators: selectedCreators,
            creatorNames: selectedCreators.map(id => creators.find(c => c.id === id)?.name || id),
            metrics: selectedMetrics,
            branding,
            passwordProtected: passwordProtect,
            expiryDate,
            link: `https://app.siccrm.com/embed/${Date.now().toString(36)}`,
            iframeCode: `<iframe src="https://app.siccrm.com/embed/${Date.now().toString(36)}" width="100%" height="600" frameborder="0"></iframe>`,
            createdAt: new Date().toISOString(),
            accessLog: [
                { viewer: 'Anonymous', date: new Date().toISOString(), ip: '192.168.1.1' }
            ]
        }
        const updated = [embed, ...embedLinks]
        setEmbedLinks(updated)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    }

    const copyToClipboard = (text, id) => {
        navigator.clipboard?.writeText(text)
        setCopiedId(id)
        setTimeout(() => setCopiedId(null), 2000)
    }

    const deleteEmbed = (id) => {
        const updated = embedLinks.filter(e => e.id !== id)
        setEmbedLinks(updated)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    }

    const formatNum = (n) => {
        if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
        if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
        return String(n || 0)
    }

    const previewCreators = creators.filter(c => selectedCreators.includes(c.id))
    const chartData = previewCreators.map(c => ({
        name: c.name.split(' ')[0],
        followers: c.followers,
        views: c.avgViews,
        score: (c.score || 0) * 1000,
    }))

    const s = {
        container: { padding: '24px', maxWidth: '1400px', margin: '0 auto' },
        header: { marginBottom: '24px' },
        title: { fontSize: '28px', fontWeight: 700, color: '#fff', margin: 0 },
        subtitle: { fontSize: '14px', color: '#94a3b8', marginTop: '4px' },
        grid: { display: 'grid', gridTemplateColumns: '340px 1fr', gap: '24px' },
        panel: { background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', padding: '20px', marginBottom: '16px' },
        sectionTitle: { fontSize: '14px', fontWeight: 600, color: '#fff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' },
        creatorBtn: (active) => ({
            display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', borderRadius: '8px',
            border: '1px solid', borderColor: active ? '#6366f1' : 'rgba(255,255,255,0.06)',
            background: active ? 'rgba(99,102,241,0.12)' : 'transparent',
            color: '#fff', cursor: 'pointer', width: '100%', marginBottom: '4px', textAlign: 'left'
        }),
        avatar: { width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px', color: '#fff', flexShrink: 0 },
        checkRow: (active) => ({
            display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0', cursor: 'pointer',
            color: active ? '#fff' : '#94a3b8', fontSize: '13px'
        }),
        input: { width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '13px', outline: 'none', boxSizing: 'border-box' },
        btn: { padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' },
        btnPrimary: { background: '#6366f1', color: '#fff' },
        btnSecondary: { background: 'rgba(255,255,255,0.1)', color: '#fff' },
        btnDanger: { background: 'rgba(239,68,68,0.15)', color: '#ef4444' },
        btnSmall: { padding: '4px 10px', fontSize: '12px' },
        codeBlock: { background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '12px', fontFamily: 'monospace', fontSize: '11px', color: '#94a3b8', overflowX: 'auto', position: 'relative', wordBreak: 'break-all' },
        table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
        th: { padding: '10px 12px', textAlign: 'left', color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.1)', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase' },
        td: { padding: '10px 12px', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.05)' },
        previewBox: { background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)', padding: '20px' },
        toggleWrapper: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' },
        toggle: (active) => ({
            width: '40px', height: '22px', borderRadius: '11px', cursor: 'pointer', position: 'relative',
            background: active ? '#6366f1' : 'rgba(255,255,255,0.15)', border: 'none', transition: 'background 0.2s'
        }),
        toggleDot: (active) => ({
            width: '16px', height: '16px', borderRadius: '50%', background: '#fff', position: 'absolute',
            top: '3px', left: active ? '21px' : '3px', transition: 'left 0.2s'
        }),
    }

    return (
        <div style={s.container}>
            <motion.div style={s.header} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 style={s.title}><span className="gradient-text">Dashboard</span> Embed</h1>
                <p style={s.subtitle}>Generate shareable, read-only dashboard links for stakeholders</p>
            </motion.div>

            <div style={s.grid}>
                {/* Left Config */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Creator Shortlist */}
                    <motion.div style={s.panel} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                        <div style={s.sectionTitle}><Users size={16} color="#6366f1" /> Creator Shortlist</div>
                        <div style={{ maxHeight: '220px', overflowY: 'auto' }}>
                            {creators.map(cr => (
                                <button key={cr.id} style={s.creatorBtn(selectedCreators.includes(cr.id))} onClick={() => toggleCreator(cr.id)}>
                                    {selectedCreators.includes(cr.id) ?
                                        <CheckSquare size={16} color="#6366f1" /> :
                                        <Square size={16} color="#64748b" />}
                                    <div style={s.avatar}>{cr.name.charAt(0)}</div>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '12px' }}>{cr.name}</div>
                                        <div style={{ color: '#94a3b8', fontSize: '10px' }}>{cr.platform} | {formatNum(cr.followers)}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                        <div style={{ color: '#64748b', fontSize: '11px', marginTop: '8px' }}>{selectedCreators.length} selected</div>
                    </motion.div>

                    {/* Metrics */}
                    <motion.div style={s.panel} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
                        <div style={s.sectionTitle}><Settings size={16} color="#10b981" /> Metrics to Show</div>
                        {METRICS_OPTIONS.map(m => (
                            <div key={m.key} style={s.checkRow(selectedMetrics.includes(m.key))} onClick={() => toggleMetric(m.key)}>
                                {selectedMetrics.includes(m.key) ?
                                    <CheckSquare size={16} color="#6366f1" /> :
                                    <Square size={16} />}
                                {m.label}
                            </div>
                        ))}
                    </motion.div>

                    {/* Config */}
                    <motion.div style={s.panel} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                        <div style={s.sectionTitle}><Globe size={16} color="#f59e0b" /> Configuration</div>
                        <div style={{ marginBottom: '12px' }}>
                            <label style={{ color: '#94a3b8', fontSize: '12px', display: 'block', marginBottom: '4px' }}>Branding Text</label>
                            <input value={branding} onChange={e => setBranding(e.target.value)} style={s.input} />
                        </div>
                        <div style={s.toggleWrapper}>
                            <button style={s.toggle(passwordProtect)} onClick={() => setPasswordProtect(!passwordProtect)}>
                                <div style={s.toggleDot(passwordProtect)} />
                            </button>
                            <span style={{ color: '#fff', fontSize: '13px' }}><Shield size={14} style={{ verticalAlign: 'middle' }} /> Password Protection</span>
                        </div>
                        {passwordProtect && (
                            <div style={{ marginBottom: '12px' }}>
                                <input type="password" placeholder="Set password..." value={password}
                                    onChange={e => setPassword(e.target.value)} style={s.input} />
                            </div>
                        )}
                        <div style={{ marginBottom: '12px' }}>
                            <label style={{ color: '#94a3b8', fontSize: '12px', display: 'block', marginBottom: '4px' }}>
                                <Calendar size={12} style={{ verticalAlign: 'middle' }} /> Expiry Date
                            </label>
                            <input type="date" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} style={s.input} />
                        </div>
                    </motion.div>

                    {/* Generate */}
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button style={{ ...s.btn, ...s.btnPrimary, flex: 1, justifyContent: 'center' }} onClick={generateLink}>
                                <Link2 size={16} /> Generate Link
                            </button>
                            <button style={{ ...s.btn, ...s.btnSecondary }} onClick={() => setShowPreview(!showPreview)}>
                                <Eye size={16} />
                            </button>
                        </div>
                    </motion.div>
                </div>

                {/* Right Content */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Preview */}
                    <AnimatePresence>
                        {showPreview && (
                            <motion.div style={s.panel} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                                <div style={s.sectionTitle}><Eye size={16} color="#6366f1" /> Embed Preview</div>
                                <div style={s.previewBox}>
                                    <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                                        <div style={{ fontSize: '16px', fontWeight: 700, color: '#fff' }}>{branding}</div>
                                        <div style={{ color: '#64748b', fontSize: '11px' }}>Creator Dashboard | {selectedCreators.length} Creators</div>
                                    </div>
                                    {previewCreators.length > 0 ? (
                                        <>
                                            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(previewCreators.length, 4)}, 1fr)`, gap: '10px', marginBottom: '16px' }}>
                                                {previewCreators.slice(0, 4).map((cr, i) => (
                                                    <div key={cr.id} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '12px', border: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
                                                        <div style={{ ...s.avatar, margin: '0 auto 8px', width: '40px', height: '40px', fontSize: '16px' }}>{cr.name.charAt(0)}</div>
                                                        <div style={{ fontSize: '12px', fontWeight: 600, color: '#fff' }}>{cr.name}</div>
                                                        <div style={{ fontSize: '10px', color: '#94a3b8' }}>{formatNum(cr.followers)} followers</div>
                                                    </div>
                                                ))}
                                            </div>
                                            {chartData.length > 0 && (
                                                <ResponsiveContainer width="100%" height={200}>
                                                    <BarChart data={chartData}>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                                                        <XAxis dataKey="name" stroke="#64748b" fontSize={10} tick={{ fill: '#94a3b8' }} />
                                                        <YAxis stroke="#64748b" fontSize={10} tick={{ fill: '#94a3b8' }} />
                                                        <Tooltip contentStyle={{ background: '#1e1e2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                                                        <Bar dataKey="followers" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                                        <Bar dataKey="views" fill="#10b981" radius={[4, 4, 0, 0]} />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            )}
                                        </>
                                    ) : (
                                        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '13px' }}>
                                            Select creators to see preview
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Generated Links */}
                    <motion.div style={s.panel} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <div style={s.sectionTitle}><Link2 size={16} color="#06b6d4" /> Generated Embed Links</div>
                        {embedLinks.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '13px' }}>
                                No embed links generated yet. Select creators and click Generate Link.
                            </div>
                        ) : (
                            embedLinks.map(emb => (
                                <div key={emb.id} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)', padding: '16px', marginBottom: '12px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                        <div>
                                            <div style={{ color: '#fff', fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>
                                                {emb.creatorNames?.join(', ') || 'Dashboard Embed'}
                                            </div>
                                            <div style={{ color: '#64748b', fontSize: '11px' }}>
                                                Created: {new Date(emb.createdAt).toLocaleDateString()} | Expires: {emb.expiryDate}
                                                {emb.passwordProtected && <span> | <Lock size={10} style={{ verticalAlign: 'middle' }} /> Protected</span>}
                                            </div>
                                        </div>
                                        <button style={{ ...s.btn, ...s.btnSmall, ...s.btnDanger }} onClick={() => deleteEmbed(emb.id)}>
                                            <Trash2 size={12} />
                                        </button>
                                    </div>

                                    {/* Link */}
                                    <div style={{ marginBottom: '8px' }}>
                                        <div style={{ color: '#94a3b8', fontSize: '11px', marginBottom: '4px' }}>Share Link:</div>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <div style={{ ...s.codeBlock, flex: 1, padding: '8px 12px' }}>{emb.link}</div>
                                            <button style={{ ...s.btn, ...s.btnSmall, ...s.btnSecondary }}
                                                onClick={() => copyToClipboard(emb.link, `link-${emb.id}`)}>
                                                <Copy size={12} /> {copiedId === `link-${emb.id}` ? 'Copied!' : 'Copy'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Iframe Code */}
                                    <div style={{ marginBottom: '10px' }}>
                                        <div style={{ color: '#94a3b8', fontSize: '11px', marginBottom: '4px' }}>Embed Code:</div>
                                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                            <div style={{ ...s.codeBlock, flex: 1, padding: '8px 12px' }}>{emb.iframeCode}</div>
                                            <button style={{ ...s.btn, ...s.btnSmall, ...s.btnSecondary }}
                                                onClick={() => copyToClipboard(emb.iframeCode, `code-${emb.id}`)}>
                                                <Code size={12} /> {copiedId === `code-${emb.id}` ? 'Copied!' : 'Copy'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Access Log */}
                                    {emb.accessLog && emb.accessLog.length > 0 && (
                                        <div>
                                            <div style={{ color: '#94a3b8', fontSize: '11px', marginBottom: '4px' }}>
                                                <Clock size={10} style={{ verticalAlign: 'middle' }} /> Access Log:
                                            </div>
                                            {emb.accessLog.map((log, i) => (
                                                <div key={i} style={{ fontSize: '11px', color: '#64748b', paddingLeft: '12px' }}>
                                                    {log.viewer} - {new Date(log.date).toLocaleString()} ({log.ip})
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    )
}

export default DashboardEmbed
