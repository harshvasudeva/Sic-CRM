import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import {
    RefreshCw, Clock, Calendar, AlertTriangle, CheckCircle, XCircle,
    Play, Settings, RotateCcw, Activity
} from 'lucide-react'
import {
    BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer
} from 'recharts'

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899']

function DataRefreshScheduler() {
    const [schedule, setSchedule] = useState(null)
    const [frequency, setFrequency] = useState('Daily')
    const [time, setTime] = useState('02:00')
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [refreshProgress, setRefreshProgress] = useState(0)
    const [creatorStatuses, setCreatorStatuses] = useState([])
    const [failureLog, setFailureLog] = useState([])
    const progressRef = useRef(null)

    useEffect(() => {
        try {
            const { getRefreshSchedule } = require('../../stores/adminStore')
            const sch = getRefreshSchedule()
            setSchedule(sch)
            setFrequency(sch.frequency || 'Daily')
            setTime(sch.time || '02:00')
        } catch {
            setSchedule({
                frequency: 'Daily', time: '02:00',
                lastRefresh: new Date().toISOString(), creatorsRefreshed: 0, failures: 0, history: []
            })
        }

        // Generate sample creator statuses
        try {
            const { getCreatorsWithScores } = require('../../stores/influencerStore')
            const creators = getCreatorsWithScores() || []
            setCreatorStatuses(creators.map(c => ({
                id: c.id, name: c.name, platform: c.platform,
                lastRefreshed: new Date(Date.now() - Math.random() * 86400000).toISOString(),
                status: Math.random() > 0.05 ? 'Success' : 'Failed',
                dataPoints: Math.floor(Math.random() * 20 + 5)
            })))
        } catch {
            setCreatorStatuses([])
        }

        setFailureLog([
            { id: 'f-1', creator: 'Sneha Joshi', error: 'Rate limit exceeded', date: '2026-02-24T02:15:00Z', retried: false },
            { id: 'f-2', creator: 'Unknown Creator', error: 'Profile not found', date: '2026-02-24T02:18:00Z', retried: true },
            { id: 'f-3', creator: 'Rohan Verma', error: 'Timeout after 30s', date: '2026-02-22T02:12:00Z', retried: true },
        ])
    }, [])

    const saveSchedule = () => {
        try {
            const { updateRefreshSchedule } = require('../../stores/adminStore')
            const updated = updateRefreshSchedule({ frequency, time })
            setSchedule(updated)
        } catch {
            setSchedule(prev => ({ ...prev, frequency, time }))
        }
    }

    const startManualRefresh = () => {
        setIsRefreshing(true)
        setRefreshProgress(0)
        let prog = 0
        const interval = setInterval(() => {
            prog += Math.random() * 8 + 2
            if (prog >= 100) {
                prog = 100
                clearInterval(interval)
                setTimeout(() => {
                    setIsRefreshing(false)
                    setRefreshProgress(0)
                    setCreatorStatuses(prev => prev.map(c => ({
                        ...c, lastRefreshed: new Date().toISOString(),
                        status: Math.random() > 0.03 ? 'Success' : 'Failed'
                    })))
                }, 500)
            }
            setRefreshProgress(Math.min(prog, 100))
        }, 200)
        progressRef.current = interval
    }

    const retryFailure = (id) => {
        setFailureLog(prev => prev.map(f => f.id === id ? { ...f, retried: true } : f))
    }

    const historyData = (schedule?.history || []).map(h => ({
        date: h.date?.slice(5, 10) || '',
        refreshed: h.refreshed || 0,
        failed: h.failed || 0,
        duration: parseFloat(h.duration) || 0,
    })).reverse()

    const s = {
        container: { padding: '24px', maxWidth: '1400px', margin: '0 auto' },
        header: { marginBottom: '24px' },
        title: { fontSize: '28px', fontWeight: 700, color: '#fff', margin: 0 },
        subtitle: { fontSize: '14px', color: '#94a3b8', marginTop: '4px' },
        panel: { background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', padding: '20px', marginBottom: '16px' },
        sectionTitle: { fontSize: '14px', fontWeight: 600, color: '#fff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' },
        grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' },
        grid3: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '16px' },
        infoRow: { display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' },
        infoLabel: { color: '#94a3b8', fontSize: '13px' },
        infoValue: { color: '#fff', fontSize: '13px', fontWeight: 600 },
        input: { padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '13px', outline: 'none', width: '100%', boxSizing: 'border-box' },
        select: { padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '13px', outline: 'none', width: '100%', boxSizing: 'border-box' },
        btn: { padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' },
        btnPrimary: { background: '#6366f1', color: '#fff' },
        btnSecondary: { background: 'rgba(255,255,255,0.1)', color: '#fff' },
        btnSuccess: { background: 'rgba(16,185,129,0.2)', color: '#10b981' },
        btnDanger: { background: 'rgba(239,68,68,0.15)', color: '#ef4444' },
        btnSmall: { padding: '4px 10px', fontSize: '12px' },
        progressBar: { width: '100%', height: '8px', borderRadius: '4px', background: 'rgba(255,255,255,0.1)', overflow: 'hidden' },
        progressFill: (pct) => ({
            width: `${pct}%`, height: '100%', borderRadius: '4px',
            background: 'linear-gradient(90deg, #6366f1, #8b5cf6)', transition: 'width 0.2s ease'
        }),
        table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
        th: { padding: '10px 12px', textAlign: 'left', color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.1)', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase' },
        td: { padding: '10px 12px', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.05)' },
        statusBadge: (status) => ({
            display: 'inline-flex', alignItems: 'center', gap: '4px',
            padding: '2px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 600,
            background: status === 'Success' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
            color: status === 'Success' ? '#10b981' : '#ef4444'
        }),
        statCard: (color) => ({
            background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)',
            padding: '16px', borderLeft: `3px solid ${color}`
        }),
    }

    if (!schedule) return <div style={{ color: '#94a3b8', padding: '40px', textAlign: 'center' }}>Loading...</div>

    return (
        <div style={s.container}>
            <motion.div style={s.header} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 style={s.title}><span className="gradient-text">Data Refresh</span> Scheduler</h1>
                <p style={s.subtitle}>Configure and monitor creator data refresh schedules</p>
            </motion.div>

            {/* Last Refresh Info + Config */}
            <div style={s.grid2}>
                {/* Last Refresh */}
                <motion.div style={s.panel} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <div style={s.sectionTitle}><Clock size={16} color="#06b6d4" /> Last Refresh</div>
                    <div style={s.infoRow}>
                        <span style={s.infoLabel}>Date</span>
                        <span style={s.infoValue}>{new Date(schedule.lastRefresh).toLocaleString()}</span>
                    </div>
                    <div style={s.infoRow}>
                        <span style={s.infoLabel}>Creators Refreshed</span>
                        <span style={{ ...s.infoValue, color: '#10b981' }}>{schedule.creatorsRefreshed}</span>
                    </div>
                    <div style={s.infoRow}>
                        <span style={s.infoLabel}>Failures</span>
                        <span style={{ ...s.infoValue, color: schedule.failures > 0 ? '#ef4444' : '#10b981' }}>{schedule.failures}</span>
                    </div>
                    <div style={s.infoRow}>
                        <span style={s.infoLabel}>Success Rate</span>
                        <span style={{ ...s.infoValue, color: '#10b981' }}>
                            {schedule.creatorsRefreshed > 0 ? ((1 - schedule.failures / schedule.creatorsRefreshed) * 100).toFixed(1) : 0}%
                        </span>
                    </div>

                    {/* Manual Refresh */}
                    <div style={{ marginTop: '16px' }}>
                        <button style={{ ...s.btn, ...s.btnPrimary, width: '100%', justifyContent: 'center', opacity: isRefreshing ? 0.7 : 1 }}
                            onClick={startManualRefresh} disabled={isRefreshing}>
                            <RefreshCw size={16} className={isRefreshing ? 'spinning' : ''} />
                            {isRefreshing ? `Refreshing... ${refreshProgress.toFixed(0)}%` : 'Refresh Now'}
                        </button>
                        {isRefreshing && (
                            <div style={{ ...s.progressBar, marginTop: '10px' }}>
                                <div style={s.progressFill(refreshProgress)} />
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Schedule Config */}
                <motion.div style={s.panel} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                    <div style={s.sectionTitle}><Settings size={16} color="#f59e0b" /> Schedule Configuration</div>
                    <div style={{ marginBottom: '14px' }}>
                        <label style={{ color: '#94a3b8', fontSize: '12px', display: 'block', marginBottom: '4px' }}>Frequency</label>
                        <select value={frequency} onChange={e => setFrequency(e.target.value)} style={s.select}>
                            <option value="Daily">Daily</option>
                            <option value="Weekly">Weekly</option>
                            <option value="Monthly">Monthly</option>
                        </select>
                    </div>
                    <div style={{ marginBottom: '14px' }}>
                        <label style={{ color: '#94a3b8', fontSize: '12px', display: 'block', marginBottom: '4px' }}>Time (UTC)</label>
                        <input type="time" value={time} onChange={e => setTime(e.target.value)} style={s.input} />
                    </div>
                    <div style={s.infoRow}>
                        <span style={s.infoLabel}>Current Schedule</span>
                        <span style={s.infoValue}>{schedule.frequency} @ {schedule.time} UTC</span>
                    </div>
                    <button style={{ ...s.btn, ...s.btnSuccess, marginTop: '16px' }} onClick={saveSchedule}>
                        <CheckCircle size={14} /> Save Configuration
                    </button>
                </motion.div>
            </div>

            {/* Refresh History Chart */}
            <motion.div style={s.panel} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <div style={s.sectionTitle}><Activity size={16} color="#6366f1" /> Refresh History</div>
                {historyData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={historyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                            <XAxis dataKey="date" stroke="#64748b" fontSize={11} tick={{ fill: '#94a3b8' }} />
                            <YAxis stroke="#64748b" fontSize={11} tick={{ fill: '#94a3b8' }} />
                            <Tooltip contentStyle={{ background: '#1e1e2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                            <Bar dataKey="refreshed" fill="#10b981" radius={[4, 4, 0, 0]} name="Refreshed" />
                            <Bar dataKey="failed" fill="#ef4444" radius={[4, 4, 0, 0]} name="Failed" />
                        </BarChart>
                    </ResponsiveContainer>
                ) : (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>No history data available</div>
                )}
            </motion.div>

            {/* Creator Status Table + Failure Log */}
            <div style={s.grid2}>
                {/* Creator Refresh Status */}
                <motion.div style={s.panel} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                    <div style={s.sectionTitle}><RefreshCw size={16} color="#10b981" /> Per-Creator Refresh Status</div>
                    <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                        <table style={s.table}>
                            <thead>
                                <tr>
                                    <th style={s.th}>Creator</th>
                                    <th style={s.th}>Platform</th>
                                    <th style={s.th}>Last Refreshed</th>
                                    <th style={s.th}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {creatorStatuses.map(cr => (
                                    <tr key={cr.id}>
                                        <td style={s.td}>{cr.name}</td>
                                        <td style={s.td}>
                                            <span style={{ fontSize: '12px', color: '#94a3b8' }}>{cr.platform}</span>
                                        </td>
                                        <td style={s.td}>
                                            <span style={{ fontSize: '12px', color: '#94a3b8' }}>{new Date(cr.lastRefreshed).toLocaleString()}</span>
                                        </td>
                                        <td style={s.td}>
                                            <span style={s.statusBadge(cr.status)}>
                                                {cr.status === 'Success' ? <CheckCircle size={10} /> : <XCircle size={10} />}
                                                {cr.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                {/* Failure Log */}
                <motion.div style={s.panel} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <div style={s.sectionTitle}><AlertTriangle size={16} color="#ef4444" /> Failure Log</div>
                    {failureLog.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '13px' }}>
                            <CheckCircle size={32} style={{ marginBottom: '8px', opacity: 0.5 }} />
                            <p>No failures recorded</p>
                        </div>
                    ) : (
                        <table style={s.table}>
                            <thead>
                                <tr>
                                    <th style={s.th}>Creator</th>
                                    <th style={s.th}>Error</th>
                                    <th style={s.th}>Date</th>
                                    <th style={s.th}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {failureLog.map(f => (
                                    <tr key={f.id}>
                                        <td style={s.td}>{f.creator}</td>
                                        <td style={{ ...s.td, color: '#ef4444', fontSize: '12px' }}>{f.error}</td>
                                        <td style={{ ...s.td, fontSize: '12px', color: '#94a3b8' }}>{new Date(f.date).toLocaleString()}</td>
                                        <td style={s.td}>
                                            {f.retried ? (
                                                <span style={{ color: '#64748b', fontSize: '11px' }}>Retried</span>
                                            ) : (
                                                <button style={{ ...s.btn, ...s.btnSmall, ...s.btnDanger }} onClick={() => retryFailure(f.id)}>
                                                    <RotateCcw size={10} /> Retry
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </motion.div>
            </div>
        </div>
    )
}

export default DataRefreshScheduler
