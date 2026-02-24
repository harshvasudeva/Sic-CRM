import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Download, Share2, User, BarChart3, Star, Briefcase, Users,
    CheckSquare, Square, Image, FileText, Eye, Palette
} from 'lucide-react'
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899']

const SECTIONS = [
    { key: 'overview', label: 'Profile Overview', icon: User },
    { key: 'stats', label: 'Key Statistics', icon: BarChart3 },
    { key: 'scores', label: 'Creator Scores', icon: Star },
    { key: 'charts', label: 'Performance Charts', icon: BarChart3 },
    { key: 'deals', label: 'Deal History', icon: Briefcase },
    { key: 'audience', label: 'Audience Info', icon: Users },
    { key: 'brands', label: 'Brands Worked With', icon: Briefcase },
]

const TEMPLATES = [
    { key: 'minimal', label: 'Minimal', desc: 'Clean, focused on key metrics' },
    { key: 'detailed', label: 'Detailed', desc: 'Full breakdown with all sections' },
    { key: 'executive', label: 'Executive', desc: 'Summary view for decision makers' },
]

function CreatorProfileExport() {
    const [creators, setCreators] = useState([])
    const [selectedCreator, setSelectedCreator] = useState(null)
    const [selectedSections, setSelectedSections] = useState(['overview', 'stats', 'scores', 'charts', 'deals'])
    const [template, setTemplate] = useState('detailed')
    const [shareLink, setShareLink] = useState('')
    const [brandLogo, setBrandLogo] = useState(null)

    useEffect(() => {
        try {
            const { getCreatorsWithScores } = require('../../stores/influencerStore')
            const all = getCreatorsWithScores() || []
            setCreators(all)
            if (all.length > 0) setSelectedCreator(all[0])
        } catch {
            setCreators([])
        }
    }, [])

    const toggleSection = (key) => {
        setSelectedSections(prev =>
            prev.includes(key) ? prev.filter(s => s !== key) : [...prev, key]
        )
    }

    const applyTemplate = (key) => {
        setTemplate(key)
        if (key === 'minimal') setSelectedSections(['overview', 'stats'])
        if (key === 'detailed') setSelectedSections(['overview', 'stats', 'scores', 'charts', 'deals', 'audience', 'brands'])
        if (key === 'executive') setSelectedSections(['overview', 'stats', 'scores', 'deals'])
    }

    const handleExportPDF = () => {
        window.print()
    }

    const handleShareLink = () => {
        const link = `https://app.siccrm.com/shared/creator/${selectedCreator?.id || 'unknown'}?t=${Date.now()}`
        setShareLink(link)
        navigator.clipboard?.writeText(link)
    }

    const formatNum = (n) => {
        if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
        if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
        return String(n || 0)
    }

    const reelData = (selectedCreator?.reelViews || []).map((v, i) => ({ name: `Post ${i + 1}`, views: v }))
    const dealData = (selectedCreator?.dealHistory || []).map(d => ({ name: d.brand, amount: d.amount }))

    const s = {
        container: { padding: '24px', maxWidth: '1400px', margin: '0 auto' },
        header: { marginBottom: '24px' },
        title: { fontSize: '28px', fontWeight: 700, color: '#fff', margin: 0 },
        subtitle: { fontSize: '14px', color: '#94a3b8', marginTop: '4px' },
        grid: { display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px' },
        panel: { background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', padding: '20px' },
        sectionTitle: { fontSize: '14px', fontWeight: 600, color: '#fff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' },
        creatorBtn: (active) => ({
            width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid',
            borderColor: active ? '#6366f1' : 'rgba(255,255,255,0.08)',
            background: active ? 'rgba(99,102,241,0.15)' : 'transparent',
            color: '#fff', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px'
        }),
        avatar: { width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px', color: '#fff', flexShrink: 0 },
        checkRow: (active) => ({
            display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 0', cursor: 'pointer',
            color: active ? '#fff' : '#94a3b8', fontSize: '13px'
        }),
        templateBtn: (active) => ({
            padding: '10px 14px', borderRadius: '8px', border: '1px solid',
            borderColor: active ? '#6366f1' : 'rgba(255,255,255,0.1)',
            background: active ? 'rgba(99,102,241,0.15)' : 'transparent',
            cursor: 'pointer', textAlign: 'left', color: '#fff', width: '100%', marginBottom: '8px'
        }),
        btn: { padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' },
        btnPrimary: { background: '#6366f1', color: '#fff' },
        btnSecondary: { background: 'rgba(255,255,255,0.1)', color: '#fff' },
        statCard: { background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '14px', border: '1px solid rgba(255,255,255,0.06)' },
        statValue: { fontSize: '20px', fontWeight: 700, color: '#fff' },
        statLabel: { fontSize: '11px', color: '#94a3b8', marginTop: '2px' },
        previewSection: { marginBottom: '20px' },
        divider: { border: 'none', borderTop: '1px solid rgba(255,255,255,0.06)', margin: '16px 0' },
        table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
        th: { padding: '8px 12px', textAlign: 'left', color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.1)', fontWeight: 600, fontSize: '12px' },
        td: { padding: '8px 12px', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.05)' },
        logoUpload: { border: '2px dashed rgba(255,255,255,0.15)', borderRadius: '8px', padding: '20px', textAlign: 'center', cursor: 'pointer', color: '#64748b', fontSize: '13px' },
        shareLinkBox: { background: 'rgba(99,102,241,0.1)', borderRadius: '8px', padding: '10px 14px', color: '#6366f1', fontSize: '12px', wordBreak: 'break-all', marginTop: '8px' },
    }

    const c = selectedCreator

    return (
        <div style={s.container}>
            <motion.div style={s.header} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 style={s.title}><span className="gradient-text">Creator Profile</span> Export</h1>
                <p style={s.subtitle}>Generate pitch decks and shareable creator profiles</p>
            </motion.div>

            <div style={s.grid}>
                {/* Left Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Creator Selector */}
                    <motion.div style={s.panel} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                        <div style={s.sectionTitle}><User size={16} color="#6366f1" /> Select Creator</div>
                        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                            {creators.map(cr => (
                                <button key={cr.id} style={s.creatorBtn(c?.id === cr.id)} onClick={() => setSelectedCreator(cr)}>
                                    <div style={s.avatar}>{cr.name.charAt(0)}</div>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '13px' }}>{cr.name}</div>
                                        <div style={{ color: '#94a3b8', fontSize: '11px' }}>{cr.platform} | {formatNum(cr.followers)}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </motion.div>

                    {/* Sections */}
                    <motion.div style={s.panel} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
                        <div style={s.sectionTitle}><CheckSquare size={16} color="#10b981" /> Include Sections</div>
                        {SECTIONS.map(sec => (
                            <div key={sec.key} style={s.checkRow(selectedSections.includes(sec.key))} onClick={() => toggleSection(sec.key)}>
                                {selectedSections.includes(sec.key) ?
                                    <CheckSquare size={16} color="#6366f1" /> :
                                    <Square size={16} />}
                                <sec.icon size={14} />
                                {sec.label}
                            </div>
                        ))}
                    </motion.div>

                    {/* Template */}
                    <motion.div style={s.panel} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                        <div style={s.sectionTitle}><Palette size={16} color="#f59e0b" /> Template</div>
                        {TEMPLATES.map(t => (
                            <button key={t.key} style={s.templateBtn(template === t.key)} onClick={() => applyTemplate(t.key)}>
                                <div style={{ fontWeight: 600, fontSize: '13px' }}>{t.label}</div>
                                <div style={{ color: '#94a3b8', fontSize: '11px' }}>{t.desc}</div>
                            </button>
                        ))}
                    </motion.div>

                    {/* Brand Logo */}
                    <motion.div style={s.panel} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}>
                        <div style={s.sectionTitle}><Image size={16} color="#ec4899" /> Brand Logo</div>
                        <div style={s.logoUpload} onClick={() => document.getElementById('logo-upload')?.click()}>
                            {brandLogo ? (
                                <div style={{ color: '#10b981' }}>Logo uploaded</div>
                            ) : (
                                <>
                                    <Image size={24} style={{ marginBottom: '8px' }} />
                                    <div>Click to upload logo</div>
                                    <div style={{ fontSize: '11px', marginTop: '4px' }}>PNG, JPG up to 2MB</div>
                                </>
                            )}
                        </div>
                        <input id="logo-upload" type="file" accept="image/*" style={{ display: 'none' }}
                            onChange={e => setBrandLogo(e.target.files?.[0]?.name || null)} />
                    </motion.div>

                    {/* Actions */}
                    <motion.div style={s.panel} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <button style={{ ...s.btn, ...s.btnPrimary, justifyContent: 'center' }} onClick={handleExportPDF}>
                                <Download size={16} /> Download PDF
                            </button>
                            <button style={{ ...s.btn, ...s.btnSecondary, justifyContent: 'center' }} onClick={handleShareLink}>
                                <Share2 size={16} /> Share Link
                            </button>
                        </div>
                        {shareLink && <div style={s.shareLinkBox}>{shareLink}</div>}
                    </motion.div>
                </div>

                {/* Preview */}
                <motion.div style={{ ...s.panel, minHeight: '600px' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <div style={s.sectionTitle}><Eye size={16} color="#6366f1" /> Profile Preview</div>
                        <span style={{ color: '#64748b', fontSize: '12px', textTransform: 'capitalize' }}>{template} template</span>
                    </div>

                    {!c ? (
                        <div style={{ textAlign: 'center', padding: '80px 20px', color: '#64748b' }}>
                            <User size={48} style={{ marginBottom: '12px', opacity: 0.5 }} />
                            <p>Select a creator to preview profile</p>
                        </div>
                    ) : (
                        <>
                            {/* Overview */}
                            {selectedSections.includes('overview') && (
                                <div style={s.previewSection}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                                        <div style={{ ...s.avatar, width: '56px', height: '56px', fontSize: '22px' }}>{c.name.charAt(0)}</div>
                                        <div>
                                            <div style={{ fontSize: '20px', fontWeight: 700, color: '#fff' }}>{c.name}</div>
                                            <div style={{ color: '#94a3b8', fontSize: '13px' }}>{c.handle} | {c.platform} | {c.niche}</div>
                                            <div style={{ color: '#64748b', fontSize: '12px' }}>{c.city}</div>
                                        </div>
                                    </div>
                                    <hr style={s.divider} />
                                </div>
                            )}

                            {/* Stats */}
                            {selectedSections.includes('stats') && (
                                <div style={s.previewSection}>
                                    <div style={{ ...s.sectionTitle, fontSize: '13px' }}>Key Statistics</div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                                        <div style={s.statCard}>
                                            <div style={{ ...s.statValue, color: '#6366f1' }}>{formatNum(c.followers)}</div>
                                            <div style={s.statLabel}>Followers</div>
                                        </div>
                                        <div style={s.statCard}>
                                            <div style={{ ...s.statValue, color: '#10b981' }}>{formatNum(c.avgViews)}</div>
                                            <div style={s.statLabel}>Avg Views</div>
                                        </div>
                                        <div style={s.statCard}>
                                            <div style={{ ...s.statValue, color: '#f59e0b' }}>{((c.avgViews / c.followers) * 100).toFixed(1)}%</div>
                                            <div style={s.statLabel}>Engagement</div>
                                        </div>
                                    </div>
                                    <hr style={s.divider} />
                                </div>
                            )}

                            {/* Scores */}
                            {selectedSections.includes('scores') && (
                                <div style={s.previewSection}>
                                    <div style={{ ...s.sectionTitle, fontSize: '13px' }}>Creator Scores</div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                                        {[
                                            { label: 'Overall Score', value: c.score || '-', color: '#6366f1' },
                                            { label: 'Engagement Score', value: c.engagementScore || '-', color: '#10b981' },
                                            { label: 'Consistency', value: c.consistencyScore || '-', color: '#f59e0b' },
                                            { label: 'Growth Score', value: c.growthScore || '-', color: '#06b6d4' },
                                        ].map((sc, i) => (
                                            <div key={i} style={s.statCard}>
                                                <div style={{ ...s.statValue, color: sc.color, fontSize: '18px' }}>{sc.value}</div>
                                                <div style={s.statLabel}>{sc.label}</div>
                                            </div>
                                        ))}
                                    </div>
                                    <hr style={s.divider} />
                                </div>
                            )}

                            {/* Charts */}
                            {selectedSections.includes('charts') && reelData.length > 0 && (
                                <div style={s.previewSection}>
                                    <div style={{ ...s.sectionTitle, fontSize: '13px' }}>Performance Chart</div>
                                    <ResponsiveContainer width="100%" height={200}>
                                        <BarChart data={reelData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                                            <XAxis dataKey="name" stroke="#64748b" fontSize={10} tick={{ fill: '#94a3b8' }} />
                                            <YAxis stroke="#64748b" fontSize={10} tick={{ fill: '#94a3b8' }} />
                                            <Tooltip contentStyle={{ background: '#1e1e2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                                            <Bar dataKey="views" fill="#6366f1" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                    <hr style={s.divider} />
                                </div>
                            )}

                            {/* Deals */}
                            {selectedSections.includes('deals') && (
                                <div style={s.previewSection}>
                                    <div style={{ ...s.sectionTitle, fontSize: '13px' }}>Deal History</div>
                                    {c.dealHistory && c.dealHistory.length > 0 ? (
                                        <table style={s.table}>
                                            <thead>
                                                <tr>
                                                    <th style={s.th}>Brand</th>
                                                    <th style={s.th}>Amount</th>
                                                    <th style={s.th}>Deliverables</th>
                                                    <th style={s.th}>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {c.dealHistory.map(d => (
                                                    <tr key={d.id}>
                                                        <td style={s.td}>{d.brand}</td>
                                                        <td style={s.td}>{formatNum(d.amount)}</td>
                                                        <td style={s.td}>{d.deliverables}</td>
                                                        <td style={s.td}>
                                                            <span style={{
                                                                padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600,
                                                                background: d.status === 'Completed' ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.15)',
                                                                color: d.status === 'Completed' ? '#10b981' : '#f59e0b'
                                                            }}>{d.status}</span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <div style={{ color: '#64748b', fontSize: '13px', textAlign: 'center', padding: '12px' }}>No deals yet</div>
                                    )}
                                    <hr style={s.divider} />
                                </div>
                            )}

                            {/* Audience */}
                            {selectedSections.includes('audience') && (
                                <div style={s.previewSection}>
                                    <div style={{ ...s.sectionTitle, fontSize: '13px' }}>Audience Info</div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
                                        <div style={s.statCard}>
                                            <div style={s.statLabel}>Primary Platform</div>
                                            <div style={{ color: '#fff', fontSize: '14px', fontWeight: 600, marginTop: '4px' }}>{c.platform}</div>
                                        </div>
                                        <div style={s.statCard}>
                                            <div style={s.statLabel}>Niche</div>
                                            <div style={{ color: '#fff', fontSize: '14px', fontWeight: 600, marginTop: '4px' }}>{c.niche}</div>
                                        </div>
                                        <div style={s.statCard}>
                                            <div style={s.statLabel}>Location</div>
                                            <div style={{ color: '#fff', fontSize: '14px', fontWeight: 600, marginTop: '4px' }}>{c.city}</div>
                                        </div>
                                        <div style={s.statCard}>
                                            <div style={s.statLabel}>View/Follow Ratio</div>
                                            <div style={{ color: '#fff', fontSize: '14px', fontWeight: 600, marginTop: '4px' }}>{((c.avgViews / c.followers) * 100).toFixed(1)}%</div>
                                        </div>
                                    </div>
                                    <hr style={s.divider} />
                                </div>
                            )}

                            {/* Brands */}
                            {selectedSections.includes('brands') && (
                                <div style={s.previewSection}>
                                    <div style={{ ...s.sectionTitle, fontSize: '13px' }}>Brands Worked With</div>
                                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                        {(c.brandsWorkedWith || []).map((brand, i) => (
                                            <span key={i} style={{
                                                padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
                                                background: `${COLORS[i % COLORS.length]}22`, color: COLORS[i % COLORS.length],
                                                border: `1px solid ${COLORS[i % COLORS.length]}33`
                                            }}>{brand}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </motion.div>
            </div>
        </div>
    )
}

export default CreatorProfileExport
