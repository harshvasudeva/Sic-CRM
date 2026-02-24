import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    FileText, Download, Printer, Save, Clock, BarChart3, LineChart as LineChartIcon,
    PieChart as PieChartIcon, Filter, Calendar, CheckSquare, Square, Trash2, Eye
} from 'lucide-react'
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899']

const METRICS = [
    { key: 'followers', label: 'Followers' },
    { key: 'engagement', label: 'Engagement Rate' },
    { key: 'views', label: 'Avg Views' },
    { key: 'roi', label: 'ROI %' },
    { key: 'cpe', label: 'Cost Per Engagement' },
    { key: 'cost', label: 'Total Cost' },
    { key: 'reach', label: 'Reach' },
    { key: 'conversions', label: 'Conversions' },
    { key: 'clicks', label: 'Clicks' },
    { key: 'impressions', label: 'Impressions' },
]

const STORAGE_KEY = 'sic-report-templates'
const HISTORY_KEY = 'sic-report-history'

function ReportBuilder() {
    const [creators, setCreators] = useState([])
    const [campaigns, setCampaigns] = useState([])
    const [selectedMetrics, setSelectedMetrics] = useState(['followers', 'engagement', 'views', 'roi'])
    const [dateRange, setDateRange] = useState({ start: '2026-01-01', end: '2026-02-24' })
    const [creatorFilter, setCreatorFilter] = useState('')
    const [campaignFilter, setCampaignFilter] = useState('')
    const [chartType, setChartType] = useState('bar')
    const [templates, setTemplates] = useState([])
    const [history, setHistory] = useState([])
    const [templateName, setTemplateName] = useState('')
    const [showPreview, setShowPreview] = useState(false)

    useEffect(() => {
        try {
            const { getCreatorsWithScores, getCampaigns } = require('../../stores/influencerStore')
            setCreators(getCreatorsWithScores() || [])
            setCampaigns(getCampaigns() || [])
        } catch { setCreators([]); setCampaigns([]) }

        try {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)) || []
            setTemplates(saved)
        } catch { setTemplates([]) }

        try {
            const saved = JSON.parse(localStorage.getItem(HISTORY_KEY)) || []
            setHistory(saved)
        } catch { setHistory([]) }
    }, [])

    const toggleMetric = (key) => {
        setSelectedMetrics(prev =>
            prev.includes(key) ? prev.filter(m => m !== key) : [...prev, key]
        )
    }

    const generatePreviewData = () => {
        const filteredCreators = creators.filter(c =>
            !creatorFilter || c.name.toLowerCase().includes(creatorFilter.toLowerCase())
        )
        return filteredCreators.slice(0, 10).map(c => {
            const row = { name: c.name }
            selectedMetrics.forEach(m => {
                switch (m) {
                    case 'followers': row[m] = c.followers || 0; break
                    case 'engagement': row[m] = ((c.score || 0) * 1.2).toFixed(1); break
                    case 'views': row[m] = c.avgViews || 0; break
                    case 'roi': row[m] = (Math.random() * 300 + 50).toFixed(0); break
                    case 'cpe': row[m] = (Math.random() * 5 + 0.5).toFixed(2); break
                    case 'cost': row[m] = c.lastQuotedRate || 0; break
                    case 'reach': row[m] = Math.floor((c.followers || 0) * 0.3); break
                    case 'conversions': row[m] = Math.floor(Math.random() * 500 + 50); break
                    case 'clicks': row[m] = Math.floor(Math.random() * 5000 + 500); break
                    case 'impressions': row[m] = Math.floor((c.avgViews || 0) * 2.5); break
                    default: row[m] = 0
                }
            })
            return row
        })
    }

    const previewData = generatePreviewData()

    const formatNum = (n) => {
        const num = Number(n)
        if (isNaN(num)) return n
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
        return String(num)
    }

    const exportCSV = () => {
        const headers = ['Name', ...selectedMetrics.map(m => METRICS.find(x => x.key === m)?.label || m)]
        const rows = previewData.map(r => [r.name, ...selectedMetrics.map(m => r[m])])
        const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = 'report.csv'; a.click()
        URL.revokeObjectURL(url)
        addToHistory('CSV Export')
    }

    const exportPDF = () => {
        window.print()
        addToHistory('PDF Export')
    }

    const saveTemplate = () => {
        if (!templateName.trim()) return
        const template = {
            id: `tpl-${Date.now()}`,
            name: templateName,
            metrics: selectedMetrics,
            chartType,
            dateRange,
            createdAt: new Date().toISOString()
        }
        const updated = [template, ...templates]
        setTemplates(updated)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
        setTemplateName('')
    }

    const loadTemplate = (tpl) => {
        setSelectedMetrics(tpl.metrics)
        setChartType(tpl.chartType)
        if (tpl.dateRange) setDateRange(tpl.dateRange)
    }

    const deleteTemplate = (id) => {
        const updated = templates.filter(t => t.id !== id)
        setTemplates(updated)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    }

    const addToHistory = (type) => {
        const entry = {
            id: `rpt-${Date.now()}`,
            type,
            metrics: selectedMetrics.length,
            rows: previewData.length,
            date: new Date().toISOString()
        }
        const updated = [entry, ...history].slice(0, 20)
        setHistory(updated)
        localStorage.setItem(HISTORY_KEY, JSON.stringify(updated))
    }

    const s = {
        container: { padding: '24px', maxWidth: '1400px', margin: '0 auto' },
        header: { marginBottom: '24px' },
        title: { fontSize: '28px', fontWeight: 700, color: '#fff', margin: 0 },
        subtitle: { fontSize: '14px', color: '#94a3b8', marginTop: '4px' },
        grid: { display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px' },
        panel: { background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', padding: '20px' },
        sectionTitle: { fontSize: '14px', fontWeight: 600, color: '#fff', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' },
        checkRow: { display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 0', cursor: 'pointer', color: '#94a3b8', fontSize: '13px' },
        checkRowActive: { color: '#fff' },
        input: { width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '13px', outline: 'none', boxSizing: 'border-box' },
        btn: { padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' },
        btnPrimary: { background: '#6366f1', color: '#fff' },
        btnSecondary: { background: 'rgba(255,255,255,0.1)', color: '#fff' },
        btnDanger: { background: 'rgba(239,68,68,0.2)', color: '#ef4444' },
        btnGroup: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' },
        table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
        th: { padding: '10px 12px', textAlign: 'left', color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.1)', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase' },
        td: { padding: '10px 12px', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.05)' },
        chartTypeBtn: (active) => ({
            padding: '6px 12px', borderRadius: '6px', border: '1px solid',
            borderColor: active ? '#6366f1' : 'rgba(255,255,255,0.1)',
            background: active ? 'rgba(99,102,241,0.2)' : 'transparent',
            color: active ? '#6366f1' : '#94a3b8', cursor: 'pointer', fontSize: '12px',
            display: 'flex', alignItems: 'center', gap: '4px'
        }),
        templateItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' },
        templateName: { color: '#fff', fontSize: '13px', cursor: 'pointer' },
        templateDate: { color: '#64748b', fontSize: '11px' },
        historyItem: { display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '12px' },
        divider: { border: 'none', borderTop: '1px solid rgba(255,255,255,0.08)', margin: '16px 0' },
    }

    const renderChart = () => {
        if (previewData.length === 0) return null
        const metric = selectedMetrics[0]
        if (!metric) return null

        if (chartType === 'bar') {
            return (
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={previewData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                        <XAxis dataKey="name" stroke="#64748b" fontSize={11} tick={{ fill: '#94a3b8' }} />
                        <YAxis stroke="#64748b" fontSize={11} tick={{ fill: '#94a3b8' }} />
                        <Tooltip contentStyle={{ background: '#1e1e2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                        {selectedMetrics.slice(0, 4).map((m, i) => (
                            <Bar key={m} dataKey={m} fill={COLORS[i % COLORS.length]} radius={[4, 4, 0, 0]} />
                        ))}
                    </BarChart>
                </ResponsiveContainer>
            )
        }
        if (chartType === 'line') {
            return (
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={previewData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                        <XAxis dataKey="name" stroke="#64748b" fontSize={11} tick={{ fill: '#94a3b8' }} />
                        <YAxis stroke="#64748b" fontSize={11} tick={{ fill: '#94a3b8' }} />
                        <Tooltip contentStyle={{ background: '#1e1e2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                        {selectedMetrics.slice(0, 4).map((m, i) => (
                            <Line key={m} type="monotone" dataKey={m} stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={{ r: 4 }} />
                        ))}
                    </LineChart>
                </ResponsiveContainer>
            )
        }
        if (chartType === 'pie') {
            const pieData = previewData.slice(0, 8).map(r => ({ name: r.name, value: Number(r[metric]) || 0 }))
            return (
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, value }) => `${name}: ${formatNum(value)}`}>
                            {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip contentStyle={{ background: '#1e1e2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }} />
                    </PieChart>
                </ResponsiveContainer>
            )
        }
        return null
    }

    return (
        <div style={s.container}>
            <motion.div style={s.header} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 style={s.title}><span className="gradient-text">Report</span> Builder</h1>
                <p style={s.subtitle}>Build custom reports with flexible metrics, charts, and export options</p>
            </motion.div>

            <div style={s.grid}>
                {/* Left Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Metric Selector */}
                    <motion.div style={s.panel} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                        <div style={s.sectionTitle}><CheckSquare size={16} color="#6366f1" /> Metrics</div>
                        {METRICS.map(m => (
                            <div key={m.key} style={{ ...s.checkRow, ...(selectedMetrics.includes(m.key) ? s.checkRowActive : {}) }}
                                onClick={() => toggleMetric(m.key)}>
                                {selectedMetrics.includes(m.key) ?
                                    <CheckSquare size={16} color="#6366f1" /> :
                                    <Square size={16} />}
                                {m.label}
                            </div>
                        ))}
                    </motion.div>

                    {/* Date Range */}
                    <motion.div style={s.panel} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
                        <div style={s.sectionTitle}><Calendar size={16} color="#06b6d4" /> Date Range</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <label style={{ color: '#94a3b8', fontSize: '12px' }}>From</label>
                            <input type="date" value={dateRange.start} onChange={e => setDateRange({ ...dateRange, start: e.target.value })} style={s.input} />
                            <label style={{ color: '#94a3b8', fontSize: '12px' }}>To</label>
                            <input type="date" value={dateRange.end} onChange={e => setDateRange({ ...dateRange, end: e.target.value })} style={s.input} />
                        </div>
                    </motion.div>

                    {/* Filters */}
                    <motion.div style={s.panel} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                        <div style={s.sectionTitle}><Filter size={16} color="#10b981" /> Filters</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <input placeholder="Filter by creator name..." value={creatorFilter}
                                onChange={e => setCreatorFilter(e.target.value)} style={s.input} />
                            <select value={campaignFilter} onChange={e => setCampaignFilter(e.target.value)} style={s.input}>
                                <option value="">All Campaigns</option>
                                {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    </motion.div>

                    {/* Chart Type */}
                    <motion.div style={s.panel} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 }}>
                        <div style={s.sectionTitle}><BarChart3 size={16} color="#f59e0b" /> Chart Type</div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button style={s.chartTypeBtn(chartType === 'bar')} onClick={() => setChartType('bar')}>
                                <BarChart3 size={14} /> Bar
                            </button>
                            <button style={s.chartTypeBtn(chartType === 'line')} onClick={() => setChartType('line')}>
                                <LineChartIcon size={14} /> Line
                            </button>
                            <button style={s.chartTypeBtn(chartType === 'pie')} onClick={() => setChartType('pie')}>
                                <PieChartIcon size={14} /> Pie
                            </button>
                        </div>
                    </motion.div>

                    {/* Save Template */}
                    <motion.div style={s.panel} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                        <div style={s.sectionTitle}><Save size={16} color="#ec4899" /> Save Template</div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <input placeholder="Template name..." value={templateName}
                                onChange={e => setTemplateName(e.target.value)} style={{ ...s.input, flex: 1 }} />
                            <button style={{ ...s.btn, ...s.btnPrimary }} onClick={saveTemplate}>Save</button>
                        </div>
                        {templates.length > 0 && (
                            <div style={{ marginTop: '12px' }}>
                                {templates.map(t => (
                                    <div key={t.id} style={s.templateItem}>
                                        <div>
                                            <div style={s.templateName} onClick={() => loadTemplate(t)}>{t.name}</div>
                                            <div style={s.templateDate}>{t.metrics.length} metrics</div>
                                        </div>
                                        <button style={{ ...s.btn, ...s.btnDanger, padding: '4px 8px' }} onClick={() => deleteTemplate(t.id)}>
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* Main Content */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Actions Bar */}
                    <motion.div style={{ ...s.panel, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        <div style={{ color: '#94a3b8', fontSize: '13px' }}>
                            {selectedMetrics.length} metrics selected | {previewData.length} rows
                        </div>
                        <div style={s.btnGroup}>
                            <button style={{ ...s.btn, ...s.btnSecondary }} onClick={() => setShowPreview(!showPreview)}>
                                <Eye size={14} /> {showPreview ? 'Hide' : 'Show'} Preview
                            </button>
                            <button style={{ ...s.btn, ...s.btnPrimary }} onClick={exportCSV}>
                                <Download size={14} /> CSV
                            </button>
                            <button style={{ ...s.btn, ...s.btnSecondary }} onClick={exportPDF}>
                                <Printer size={14} /> PDF
                            </button>
                        </div>
                    </motion.div>

                    {/* Chart */}
                    <motion.div style={s.panel} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <div style={s.sectionTitle}><BarChart3 size={16} color="#6366f1" /> Chart Preview</div>
                        {selectedMetrics.length > 0 && previewData.length > 0 ? renderChart() : (
                            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#64748b' }}>
                                Select metrics and ensure creators exist to see chart preview
                            </div>
                        )}
                    </motion.div>

                    {/* Data Table */}
                    <AnimatePresence>
                        {showPreview && (
                            <motion.div style={s.panel} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}>
                                <div style={s.sectionTitle}><FileText size={16} color="#10b981" /> Data Preview</div>
                                <div style={{ overflowX: 'auto' }}>
                                    <table style={s.table}>
                                        <thead>
                                            <tr>
                                                <th style={s.th}>Creator</th>
                                                {selectedMetrics.map(m => (
                                                    <th key={m} style={s.th}>{METRICS.find(x => x.key === m)?.label || m}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {previewData.map((row, i) => (
                                                <tr key={i}>
                                                    <td style={s.td}>{row.name}</td>
                                                    {selectedMetrics.map(m => (
                                                        <td key={m} style={s.td}>{formatNum(row[m])}</td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Report History */}
                    <motion.div style={s.panel} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                        <div style={s.sectionTitle}><Clock size={16} color="#f59e0b" /> Report History</div>
                        {history.length === 0 ? (
                            <div style={{ color: '#64748b', fontSize: '13px', textAlign: 'center', padding: '20px' }}>No reports generated yet</div>
                        ) : (
                            history.slice(0, 10).map(h => (
                                <div key={h.id} style={s.historyItem}>
                                    <span style={{ color: '#fff' }}>{h.type}</span>
                                    <span style={{ color: '#94a3b8' }}>{h.metrics} metrics, {h.rows} rows</span>
                                    <span style={{ color: '#64748b' }}>{new Date(h.date).toLocaleDateString()}</span>
                                </div>
                            ))
                        )}
                    </motion.div>
                </div>
            </div>
        </div>
    )
}

export default ReportBuilder
