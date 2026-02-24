import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    Lock, Mail, Phone, MessageCircle, Building2, Copy, Check,
    Search, User, Shield, Clock, AlertCircle, ChevronDown
} from 'lucide-react'
import { getCreators } from '../../stores/influencerStore'

const styles = {
    page: { padding: '24px', maxWidth: 1200, margin: '0 auto' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    title: { color: '#fff', fontSize: 22, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 },
    subtitle: { color: '#94a3b8', fontSize: 13, marginTop: 4 },
    card: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 20 },
    searchBar: { display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center' },
    searchInput: { flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 12px 10px 36px', color: '#fff', fontSize: 14, outline: 'none' },
    table: { width: '100%', borderCollapse: 'separate', borderSpacing: '0 6px' },
    th: { color: '#94a3b8', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid rgba(255,255,255,0.08)' },
    td: { padding: '12px', color: '#e2e8f0', fontSize: 13, verticalAlign: 'middle' },
    row: { background: 'rgba(255,255,255,0.03)', borderRadius: 8 },
    contactField: { display: 'flex', alignItems: 'center', gap: 8 },
    copyBtn: { background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', padding: 4, borderRadius: 4, transition: 'color 0.2s' },
    completenessBar: { width: '100%', height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' },
    completenessFill: (pct) => ({ width: `${pct}%`, height: '100%', background: pct >= 80 ? '#10b981' : pct >= 50 ? '#f59e0b' : '#ef4444', borderRadius: 3, transition: 'width 0.3s' }),
    badge: (color) => ({ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600, background: `${color}22`, color }),
    statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 },
    statCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '14px 18px', textAlign: 'center' },
    verifiedDate: { color: '#64748b', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 },
    emptyField: { color: '#475569', fontStyle: 'italic', fontSize: 12 },
    contactCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 16, marginBottom: 12 },
    avatar: { width: 40, height: 40, borderRadius: '50%', background: '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 15, fontWeight: 700, flexShrink: 0 },
    select: { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px', color: '#fff', fontSize: 13, outline: 'none' },
}

const sampleManagerData = {
    'cr-001': { manager: 'Ankit Talent Mgmt', managerPhone: '+91-99887-76655', agency: 'Talent Connect India', lastVerified: '2026-02-10' },
    'cr-002': { manager: 'Siddharth PR', managerPhone: '+91-88776-65544', agency: 'DigiTalent Co', lastVerified: '2026-01-28' },
    'cr-003': { manager: null, managerPhone: null, agency: null, lastVerified: '2026-02-15' },
    'cr-004': { manager: 'Meera Associates', managerPhone: '+91-77665-54433', agency: 'Meera Associates', lastVerified: '2026-01-20' },
    'cr-005': { manager: null, managerPhone: null, agency: 'WanderTalent', lastVerified: '2026-02-01' },
    'cr-006': { manager: 'Rahul Mgmt', managerPhone: '+91-66554-43322', agency: 'LaughFactory Talent', lastVerified: '2026-02-18' },
}

function getCompleteness(creator, extra) {
    const fields = [creator.contactEmail, creator.contactWhatsApp, extra?.manager, extra?.managerPhone, extra?.agency]
    const filled = fields.filter(Boolean).length
    return Math.round((filled / fields.length) * 100)
}

export default function ContactVault() {
    const [creators, setCreators] = useState([])
    const [search, setSearch] = useState('')
    const [copiedId, setCopiedId] = useState(null)
    const [sortBy, setSortBy] = useState('name')

    useEffect(() => { setCreators(getCreators()) }, [])

    function copyToClipboard(text, id) {
        navigator.clipboard.writeText(text)
        setCopiedId(id)
        setTimeout(() => setCopiedId(null), 1500)
    }

    const filtered = creators
        .filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.handle.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => {
            if (sortBy === 'name') return a.name.localeCompare(b.name)
            if (sortBy === 'completeness') {
                const aP = getCompleteness(a, sampleManagerData[a.id])
                const bP = getCompleteness(b, sampleManagerData[b.id])
                return bP - aP
            }
            return 0
        })

    const avgCompleteness = filtered.length > 0
        ? Math.round(filtered.reduce((s, c) => s + getCompleteness(c, sampleManagerData[c.id]), 0) / filtered.length)
        : 0
    const withEmail = filtered.filter(c => c.contactEmail).length
    const withWhatsApp = filtered.filter(c => c.contactWhatsApp).length
    const withManager = filtered.filter(c => sampleManagerData[c.id]?.manager).length

    function CopyableField({ value, fieldId, icon: Icon }) {
        if (!value) return <span style={styles.emptyField}>Not provided</span>
        return (
            <div style={styles.contactField}>
                <Icon size={13} color="#64748b" />
                <span style={{ color: '#e2e8f0', fontSize: 13 }}>{value}</span>
                <button style={styles.copyBtn} onClick={() => copyToClipboard(value, fieldId)} title="Copy">
                    {copiedId === fieldId ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
                </button>
            </div>
        )
    }

    return (
        <motion.div style={styles.page} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div style={styles.header}>
                <div>
                    <div style={styles.title}><Lock size={22} color="#6366f1" /> Contact Vault</div>
                    <div style={styles.subtitle}>Secure contact directory for all your creators</div>
                </div>
            </div>

            <div style={styles.statsRow}>
                {[
                    { label: 'Avg. Completeness', value: `${avgCompleteness}%`, color: avgCompleteness >= 70 ? '#10b981' : '#f59e0b' },
                    { label: 'With Email', value: withEmail, color: '#3b82f6' },
                    { label: 'With WhatsApp', value: withWhatsApp, color: '#22c55e' },
                    { label: 'With Manager', value: withManager, color: '#8b5cf6' },
                ].map(s => (
                    <div key={s.label} style={styles.statCard}>
                        <div style={{ color: s.color, fontSize: 22, fontWeight: 700 }}>{s.value}</div>
                        <div style={{ color: '#94a3b8', fontSize: 12 }}>{s.label}</div>
                    </div>
                ))}
            </div>

            <div style={styles.searchBar}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <Search size={14} style={{ position: 'absolute', left: 12, top: 12, color: '#64748b' }} />
                    <input style={styles.searchInput} value={search} onChange={e => setSearch(e.target.value)} placeholder="Search contacts by name or handle..." />
                </div>
                <select style={styles.select} value={sortBy} onChange={e => setSortBy(e.target.value)}>
                    <option value="name">Sort: Name</option>
                    <option value="completeness">Sort: Completeness</option>
                </select>
            </div>

            <div>
                {filtered.map((creator, idx) => {
                    const extra = sampleManagerData[creator.id] || {}
                    const completeness = getCompleteness(creator, extra)
                    return (
                        <motion.div
                            key={creator.id}
                            style={styles.contactCard}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                        >
                            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                                <div style={styles.avatar}>{creator.name[0]}</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                        <div>
                                            <div style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>{creator.name}</div>
                                            <div style={{ color: '#94a3b8', fontSize: 12 }}>{creator.handle} | {creator.platform} | {creator.niche}</div>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ color: '#94a3b8', fontSize: 11, marginBottom: 4 }}>Completeness: {completeness}%</div>
                                            <div style={{ ...styles.completenessBar, width: 120 }}>
                                                <div style={styles.completenessFill(completeness)} />
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '8px 24px' }}>
                                        <div>
                                            <div style={{ color: '#64748b', fontSize: 11, marginBottom: 3, textTransform: 'uppercase' }}>Email</div>
                                            <CopyableField value={creator.contactEmail} fieldId={`${creator.id}-email`} icon={Mail} />
                                        </div>
                                        <div>
                                            <div style={{ color: '#64748b', fontSize: 11, marginBottom: 3, textTransform: 'uppercase' }}>WhatsApp</div>
                                            <CopyableField value={creator.contactWhatsApp} fieldId={`${creator.id}-wa`} icon={MessageCircle} />
                                        </div>
                                        <div>
                                            <div style={{ color: '#64748b', fontSize: 11, marginBottom: 3, textTransform: 'uppercase' }}>Manager</div>
                                            <CopyableField value={extra.manager} fieldId={`${creator.id}-mgr`} icon={User} />
                                        </div>
                                        <div>
                                            <div style={{ color: '#64748b', fontSize: 11, marginBottom: 3, textTransform: 'uppercase' }}>Manager Phone</div>
                                            <CopyableField value={extra.managerPhone} fieldId={`${creator.id}-mgrph`} icon={Phone} />
                                        </div>
                                        <div>
                                            <div style={{ color: '#64748b', fontSize: 11, marginBottom: 3, textTransform: 'uppercase' }}>Agency</div>
                                            <CopyableField value={extra.agency} fieldId={`${creator.id}-agency`} icon={Building2} />
                                        </div>
                                        <div>
                                            <div style={{ color: '#64748b', fontSize: 11, marginBottom: 3, textTransform: 'uppercase' }}>Last Verified</div>
                                            <div style={styles.verifiedDate}>
                                                {extra.lastVerified ? (
                                                    <><Shield size={12} color="#10b981" /> {extra.lastVerified}</>
                                                ) : (
                                                    <><AlertCircle size={12} color="#f59e0b" /> Not verified</>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )
                })}
            </div>

            {filtered.length === 0 && (
                <div style={{ ...styles.card, textAlign: 'center', padding: 60, color: '#64748b' }}>
                    <Search size={40} strokeWidth={1} />
                    <div style={{ marginTop: 12, fontSize: 15 }}>No contacts found</div>
                </div>
            )}
        </motion.div>
    )
}
