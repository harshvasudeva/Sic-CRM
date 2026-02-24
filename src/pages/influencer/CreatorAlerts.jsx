import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Bell, BellOff, Check, CheckCheck, Trash2, Users, TrendingUp,
    Handshake, DollarSign, Settings, Filter, X, AlertTriangle,
    Info, AlertCircle, Eye, EyeOff
} from 'lucide-react'

const STORAGE_KEY = 'sic-influencer-alerts'
const SETTINGS_KEY = 'sic-influencer-alert-settings'

const ALERT_TYPES = {
    follower_milestone: { label: 'Follower Milestone', icon: Users, color: '#3b82f6' },
    engagement_spike: { label: 'Engagement Spike', icon: TrendingUp, color: '#10b981' },
    new_collab: { label: 'New Collaboration', icon: Handshake, color: '#8b5cf6' },
    rate_change: { label: 'Rate Change', icon: DollarSign, color: '#f59e0b' },
}

const SEVERITY_CONFIG = {
    high: { label: 'High', color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
    medium: { label: 'Medium', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
    low: { label: 'Low', color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
    info: { label: 'Info', color: '#3b82f6', bg: 'rgba(59,130,246,0.15)' },
}

const styles = {
    page: { padding: '24px', maxWidth: 1000, margin: '0 auto' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    title: { color: '#fff', fontSize: 22, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 10 },
    subtitle: { color: '#94a3b8', fontSize: 13, marginTop: 4 },
    card: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 20 },
    alertItem: (read) => ({
        display: 'flex', gap: 14, padding: '14px 16px', borderRadius: 10, marginBottom: 8,
        background: read ? 'rgba(255,255,255,0.02)' : 'rgba(99,102,241,0.08)',
        border: `1px solid ${read ? 'rgba(255,255,255,0.06)' : 'rgba(99,102,241,0.2)'}`,
        transition: 'all 0.2s', cursor: 'pointer',
        opacity: read ? 0.7 : 1
    }),
    iconCircle: (color) => ({ width: 40, height: 40, borderRadius: '50%', background: `${color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }),
    severityBadge: (severity) => ({
        display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600,
        background: SEVERITY_CONFIG[severity]?.bg || 'rgba(255,255,255,0.05)',
        color: SEVERITY_CONFIG[severity]?.color || '#94a3b8',
    }),
    btnPrimary: { background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 },
    btnGhost: { background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '6px 12px', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 },
    statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 },
    statCard: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: '12px 16px', textAlign: 'center' },
    filterBar: { display: 'flex', gap: 10, marginBottom: 16, alignItems: 'center', flexWrap: 'wrap' },
    select: { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px', color: '#fff', fontSize: 13, outline: 'none' },
    settingsPanel: { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 16, marginBottom: 16 },
    toggle: (active) => ({ width: 40, height: 22, borderRadius: 11, background: active ? '#6366f1' : 'rgba(255,255,255,0.15)', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }),
    toggleDot: (active) => ({ width: 16, height: 16, borderRadius: '50%', background: '#fff', position: 'absolute', top: 3, left: active ? 21 : 3, transition: 'left 0.2s' }),
    emptyState: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 60, color: '#64748b' },
}

const sampleAlerts = [
    { id: 'alert-001', type: 'follower_milestone', severity: 'high', creatorName: 'Priya Sharma', message: 'Priya Sharma crossed 500K followers on Instagram! Consider reaching out for a premium campaign.', read: false, dismissed: false, createdAt: '2026-02-24T09:00:00' },
    { id: 'alert-002', type: 'engagement_spike', severity: 'medium', creatorName: 'Rohan Verma', message: 'Rohan Verma\'s latest video got 3x average views (540K vs 180K average). Viral content detected.', read: false, dismissed: false, createdAt: '2026-02-23T14:30:00' },
    { id: 'alert-003', type: 'new_collab', severity: 'info', creatorName: 'Aditya Kapoor', message: 'Aditya Kapoor posted sponsored content with competitor brand Paytm. Monitor for exclusivity conflicts.', read: false, dismissed: false, createdAt: '2026-02-22T11:00:00' },
    { id: 'alert-004', type: 'rate_change', severity: 'high', creatorName: 'Karthik Iyer', message: 'Karthik Iyer increased rates by 25% (150K to 187.5K). Budget impact on planned campaigns.', read: true, dismissed: false, createdAt: '2026-02-21T16:00:00' },
    { id: 'alert-005', type: 'engagement_spike', severity: 'low', creatorName: 'Ananya Reddy', message: 'Ananya Reddy\'s engagement rate improved by 15% over the last 2 weeks. Trending upward.', read: true, dismissed: false, createdAt: '2026-02-20T10:00:00' },
]

const defaultSettings = {
    follower_milestone: true,
    engagement_spike: true,
    new_collab: true,
    rate_change: true,
}

export default function CreatorAlerts() {
    const [alerts, setAlerts] = useState(() => {
        const stored = localStorage.getItem(STORAGE_KEY)
        return stored ? JSON.parse(stored) : sampleAlerts
    })
    const [settings, setSettings] = useState(() => {
        const stored = localStorage.getItem(SETTINGS_KEY)
        return stored ? JSON.parse(stored) : defaultSettings
    })
    const [showSettings, setShowSettings] = useState(false)
    const [filterType, setFilterType] = useState('')
    const [filterSeverity, setFilterSeverity] = useState('')
    const [showRead, setShowRead] = useState(true)

    useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts)) }, [alerts])
    useEffect(() => { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)) }, [settings])

    function markRead(id) {
        setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a))
    }

    function markAllRead() {
        setAlerts(prev => prev.map(a => ({ ...a, read: true })))
    }

    function dismissAlert(id) {
        setAlerts(prev => prev.map(a => a.id === id ? { ...a, dismissed: true } : a))
    }

    function toggleSetting(key) {
        setSettings(prev => ({ ...prev, [key]: !prev[key] }))
    }

    const visibleAlerts = alerts
        .filter(a => !a.dismissed)
        .filter(a => !filterType || a.type === filterType)
        .filter(a => !filterSeverity || a.severity === filterSeverity)
        .filter(a => showRead || !a.read)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    const unreadCount = alerts.filter(a => !a.read && !a.dismissed).length
    const stats = {
        total: alerts.filter(a => !a.dismissed).length,
        unread: unreadCount,
        high: alerts.filter(a => !a.dismissed && a.severity === 'high').length,
        today: alerts.filter(a => !a.dismissed && a.createdAt.startsWith('2026-02-24')).length,
    }

    function formatTime(iso) {
        const d = new Date(iso)
        const now = new Date()
        const diff = now - d
        if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`
        if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    }

    return (
        <motion.div style={styles.page} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <div style={styles.header}>
                <div>
                    <div style={styles.title}>
                        <Bell size={22} color="#6366f1" /> Creator Alerts
                        {unreadCount > 0 && <span style={{ background: '#ef4444', color: '#fff', borderRadius: 10, padding: '2px 8px', fontSize: 12, fontWeight: 700 }}>{unreadCount}</span>}
                    </div>
                    <div style={styles.subtitle}>Stay updated on creator milestones, engagement changes, and more</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button style={styles.btnGhost} onClick={() => setShowSettings(!showSettings)}><Settings size={14} /> Settings</button>
                    <button style={styles.btnPrimary} onClick={markAllRead}><CheckCheck size={14} /> Mark All Read</button>
                </div>
            </div>

            <div style={styles.statsRow}>
                {[{ label: 'Total Alerts', value: stats.total, color: '#6366f1' }, { label: 'Unread', value: stats.unread, color: '#f59e0b' }, { label: 'High Severity', value: stats.high, color: '#ef4444' }, { label: 'Today', value: stats.today, color: '#10b981' }].map(s => (
                    <div key={s.label} style={styles.statCard}>
                        <div style={{ color: s.color, fontSize: 22, fontWeight: 700 }}>{s.value}</div>
                        <div style={{ color: '#94a3b8', fontSize: 12 }}>{s.label}</div>
                    </div>
                ))}
            </div>

            <AnimatePresence>
                {showSettings && (
                    <motion.div style={styles.settingsPanel} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                        <div style={{ color: '#fff', fontWeight: 600, fontSize: 14, marginBottom: 12 }}>Alert Settings</div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                            {Object.entries(ALERT_TYPES).map(([key, cfg]) => (
                                <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <cfg.icon size={14} color={cfg.color} />
                                        <span style={{ color: '#e2e8f0', fontSize: 13 }}>{cfg.label}</span>
                                    </div>
                                    <div style={styles.toggle(settings[key])} onClick={() => toggleSetting(key)}>
                                        <div style={styles.toggleDot(settings[key])} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div style={styles.filterBar}>
                <Filter size={14} color="#94a3b8" />
                <select style={styles.select} value={filterType} onChange={e => setFilterType(e.target.value)}>
                    <option value="">All Types</option>
                    {Object.entries(ALERT_TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
                <select style={styles.select} value={filterSeverity} onChange={e => setFilterSeverity(e.target.value)}>
                    <option value="">All Severities</option>
                    {Object.entries(SEVERITY_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
                <button style={styles.btnGhost} onClick={() => setShowRead(!showRead)}>
                    {showRead ? <Eye size={13} /> : <EyeOff size={13} />} {showRead ? 'Hide Read' : 'Show Read'}
                </button>
                <div style={{ marginLeft: 'auto', color: '#64748b', fontSize: 12 }}>{visibleAlerts.length} alerts</div>
            </div>

            <div style={styles.card}>
                {visibleAlerts.length === 0 ? (
                    <div style={styles.emptyState}>
                        <BellOff size={40} strokeWidth={1} />
                        <div style={{ marginTop: 12, fontSize: 15 }}>No alerts</div>
                        <div style={{ fontSize: 12, marginTop: 4 }}>You are all caught up</div>
                    </div>
                ) : (
                    <AnimatePresence>
                        {visibleAlerts.map(alert => {
                            const typeConfig = ALERT_TYPES[alert.type] || ALERT_TYPES.engagement_spike
                            const Icon = typeConfig.icon
                            return (
                                <motion.div
                                    key={alert.id}
                                    style={styles.alertItem(alert.read)}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10, height: 0 }}
                                    onClick={() => markRead(alert.id)}
                                >
                                    <div style={styles.iconCircle(typeConfig.color)}>
                                        <Icon size={18} color={typeConfig.color} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <span style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>{alert.creatorName}</span>
                                                <span style={styles.severityBadge(alert.severity)}>{SEVERITY_CONFIG[alert.severity]?.label}</span>
                                                {!alert.read && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#6366f1' }} />}
                                            </div>
                                            <span style={{ color: '#64748b', fontSize: 11, flexShrink: 0 }}>{formatTime(alert.createdAt)}</span>
                                        </div>
                                        <div style={{ color: '#94a3b8', fontSize: 13, lineHeight: 1.5, marginBottom: 6 }}>{alert.message}</div>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <span style={{ color: typeConfig.color, fontSize: 11, background: `${typeConfig.color}15`, padding: '2px 8px', borderRadius: 8 }}>{typeConfig.label}</span>
                                            {!alert.read && (
                                                <button style={{ background: 'none', border: 'none', color: '#6366f1', fontSize: 11, cursor: 'pointer', padding: 0 }} onClick={e => { e.stopPropagation(); markRead(alert.id) }}>
                                                    Mark read
                                                </button>
                                            )}
                                            <button style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: 11, cursor: 'pointer', padding: 0 }} onClick={e => { e.stopPropagation(); dismissAlert(alert.id) }}>
                                                Dismiss
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </AnimatePresence>
                )}
            </div>
        </motion.div>
    )
}
