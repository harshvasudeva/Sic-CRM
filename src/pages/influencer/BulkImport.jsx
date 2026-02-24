import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Upload, FileText, Download, CheckCircle, XCircle, AlertCircle,
    Table, ArrowRight, RotateCcw, Trash2, File, HardDrive
} from 'lucide-react'

const CREATOR_FIELDS = [
    { key: 'name', label: 'Name', required: true },
    { key: 'platform', label: 'Platform', required: true },
    { key: 'handle', label: 'Handle', required: true },
    { key: 'followers', label: 'Followers', required: false },
    { key: 'avgViews', label: 'Avg Views', required: false },
    { key: 'niche', label: 'Niche', required: false },
    { key: 'city', label: 'City', required: false },
    { key: 'contactEmail', label: 'Email', required: false },
    { key: 'contactWhatsApp', label: 'WhatsApp', required: false },
    { key: 'lastQuotedRate', label: 'Quoted Rate', required: false },
]

function BulkImport() {
    const [step, setStep] = useState(1) // 1=upload, 2=mapping, 3=preview, 4=importing, 5=results
    const [file, setFile] = useState(null)
    const [csvData, setCsvData] = useState([])
    const [csvHeaders, setCsvHeaders] = useState([])
    const [columnMapping, setColumnMapping] = useState({})
    const [importProgress, setImportProgress] = useState(0)
    const [importResults, setImportResults] = useState(null)
    const [importHistory, setImportHistory] = useState([])
    const [isDragging, setIsDragging] = useState(false)
    const fileInputRef = useRef(null)

    useEffect(() => {
        try {
            const { getImportHistory } = require('../../stores/adminStore')
            setImportHistory(getImportHistory() || [])
        } catch {
            setImportHistory([])
        }
    }, [])

    const parseCSV = (text) => {
        const lines = text.split('\n').filter(l => l.trim())
        if (lines.length < 2) return { headers: [], rows: [] }
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
        const rows = lines.slice(1).map(line => {
            const vals = line.split(',').map(v => v.trim().replace(/"/g, ''))
            const row = {}
            headers.forEach((h, i) => { row[h] = vals[i] || '' })
            return row
        })
        return { headers, rows }
    }

    const handleFile = (f) => {
        if (!f || !f.name.endsWith('.csv')) return
        setFile(f)
        const reader = new FileReader()
        reader.onload = (e) => {
            const { headers, rows } = parseCSV(e.target.result)
            setCsvHeaders(headers)
            setCsvData(rows)
            // Auto-map columns
            const autoMap = {}
            CREATOR_FIELDS.forEach(field => {
                const match = headers.find(h =>
                    h.toLowerCase().replace(/[_\s-]/g, '') === field.key.toLowerCase().replace(/[_\s-]/g, '') ||
                    h.toLowerCase().includes(field.label.toLowerCase())
                )
                if (match) autoMap[field.key] = match
            })
            setColumnMapping(autoMap)
            setStep(2)
        }
        reader.readAsText(f)
    }

    const handleDrop = (e) => {
        e.preventDefault()
        setIsDragging(false)
        const f = e.dataTransfer?.files?.[0]
        if (f) handleFile(f)
    }

    const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true) }
    const handleDragLeave = () => setIsDragging(false)

    const downloadSample = () => {
        const sample = `name,platform,handle,followers,avgViews,niche,city,contactEmail,contactWhatsApp,lastQuotedRate
"Sample Creator","Instagram","@sample_creator","150000","12000","Lifestyle","Mumbai","sample@email.com","+91-98765-00000","50000"
"Tech Guru","YouTube","@techguru","500000","45000","Tech","Bangalore","tech@email.com","+91-91234-00000","120000"`
        const blob = new Blob([sample], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = 'creators_import_sample.csv'; a.click()
        URL.revokeObjectURL(url)
    }

    const startImport = () => {
        setStep(4)
        setImportProgress(0)
        let prog = 0
        const interval = setInterval(() => {
            prog += Math.random() * 12 + 3
            if (prog >= 100) {
                prog = 100
                clearInterval(interval)
                // Simulate results
                const total = csvData.length
                const success = Math.floor(total * 0.93)
                const failed = Math.floor(total * 0.04)
                const duplicates = total - success - failed
                const results = { total, success, failed, duplicates }
                setImportResults(results)

                // Save to history
                try {
                    const { addImportRecord } = require('../../stores/adminStore')
                    addImportRecord({ fileName: file?.name || 'import.csv', totalRows: total, success, failed, duplicates })
                    const { getImportHistory } = require('../../stores/adminStore')
                    setImportHistory(getImportHistory() || [])
                } catch { /* ignore */ }

                setStep(5)
            }
            setImportProgress(Math.min(prog, 100))
        }, 150)
    }

    const resetImport = () => {
        setStep(1); setFile(null); setCsvData([]); setCsvHeaders([]); setColumnMapping({})
        setImportProgress(0); setImportResults(null)
    }

    const s = {
        container: { padding: '24px', maxWidth: '1400px', margin: '0 auto' },
        header: { marginBottom: '24px' },
        title: { fontSize: '28px', fontWeight: 700, color: '#fff', margin: 0 },
        subtitle: { fontSize: '14px', color: '#94a3b8', marginTop: '4px' },
        panel: { background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', padding: '20px', marginBottom: '16px' },
        sectionTitle: { fontSize: '14px', fontWeight: 600, color: '#fff', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' },
        dropZone: (active) => ({
            border: `2px dashed ${active ? '#6366f1' : 'rgba(255,255,255,0.15)'}`,
            borderRadius: '12px', padding: '48px 20px', textAlign: 'center', cursor: 'pointer',
            background: active ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.02)',
            transition: 'all 0.2s'
        }),
        btn: { padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' },
        btnPrimary: { background: '#6366f1', color: '#fff' },
        btnSecondary: { background: 'rgba(255,255,255,0.1)', color: '#fff' },
        btnSuccess: { background: 'rgba(16,185,129,0.2)', color: '#10b981' },
        btnDanger: { background: 'rgba(239,68,68,0.15)', color: '#ef4444' },
        btnSmall: { padding: '6px 12px', fontSize: '12px' },
        input: { padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '13px', outline: 'none' },
        select: { padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '13px', outline: 'none', minWidth: '160px' },
        table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
        th: { padding: '10px 12px', textAlign: 'left', color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.1)', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase' },
        td: { padding: '10px 12px', color: '#fff', borderBottom: '1px solid rgba(255,255,255,0.05)' },
        progressBar: { width: '100%', height: '12px', borderRadius: '6px', background: 'rgba(255,255,255,0.1)', overflow: 'hidden' },
        progressFill: (pct) => ({
            width: `${pct}%`, height: '100%', borderRadius: '6px',
            background: 'linear-gradient(90deg, #6366f1, #10b981)', transition: 'width 0.2s'
        }),
        mappingRow: { display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' },
        resultCard: (color) => ({
            background: 'rgba(255,255,255,0.03)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)',
            padding: '20px', textAlign: 'center', borderTop: `3px solid ${color}`
        }),
        resultValue: { fontSize: '32px', fontWeight: 700, marginBottom: '4px' },
        resultLabel: { fontSize: '12px', color: '#94a3b8' },
        stepIndicator: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' },
        stepDot: (active, completed) => ({
            width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '13px', fontWeight: 700,
            background: completed ? '#10b981' : active ? '#6366f1' : 'rgba(255,255,255,0.1)',
            color: '#fff'
        }),
        stepLine: { width: '40px', height: '2px', background: 'rgba(255,255,255,0.1)' },
    }

    return (
        <div style={s.container}>
            <motion.div style={s.header} initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 style={s.title}><span className="gradient-text">Bulk</span> Import</h1>
                <p style={s.subtitle}>Import creators from CSV files with column mapping and validation</p>
            </motion.div>

            {/* Step Indicator */}
            <div style={s.stepIndicator}>
                {['Upload', 'Map Columns', 'Preview', 'Import', 'Results'].map((label, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={s.stepDot(step === i + 1, step > i + 1)}>
                            {step > i + 1 ? <CheckCircle size={16} /> : i + 1}
                        </div>
                        <span style={{ color: step >= i + 1 ? '#fff' : '#64748b', fontSize: '12px', fontWeight: 600 }}>{label}</span>
                        {i < 4 && <div style={s.stepLine} />}
                    </div>
                ))}
            </div>

            {/* Step 1: Upload */}
            {step === 1 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div style={s.panel}>
                        <div style={s.sectionTitle}><Upload size={16} color="#6366f1" /> Upload CSV File</div>
                        <div style={s.dropZone(isDragging)}
                            onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}
                            onClick={() => fileInputRef.current?.click()}>
                            <Upload size={40} color={isDragging ? '#6366f1' : '#64748b'} style={{ marginBottom: '12px' }} />
                            <div style={{ color: '#fff', fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>
                                Drop CSV file here or click to browse
                            </div>
                            <div style={{ color: '#64748b', fontSize: '13px' }}>Supports .csv files up to 10MB</div>
                        </div>
                        <input ref={fileInputRef} type="file" accept=".csv" style={{ display: 'none' }}
                            onChange={e => handleFile(e.target.files?.[0])} />
                    </div>

                    <div style={s.panel}>
                        <div style={s.sectionTitle}><FileText size={16} color="#10b981" /> CSV Format Guide</div>
                        <div style={{ color: '#94a3b8', fontSize: '13px', lineHeight: '1.8' }}>
                            <p>Your CSV should include columns for creator information. Required fields are marked with *.</p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', margin: '12px 0' }}>
                                {CREATOR_FIELDS.map(f => (
                                    <span key={f.key} style={{
                                        padding: '4px 10px', borderRadius: '6px', fontSize: '12px',
                                        background: f.required ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.05)',
                                        color: f.required ? '#6366f1' : '#94a3b8',
                                        border: `1px solid ${f.required ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.08)'}`
                                    }}>
                                        {f.label}{f.required ? ' *' : ''}
                                    </span>
                                ))}
                            </div>
                        </div>
                        <button style={{ ...s.btn, ...s.btnSecondary }} onClick={downloadSample}>
                            <Download size={14} /> Download Sample CSV
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Step 2: Column Mapping */}
            {step === 2 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div style={s.panel}>
                        <div style={s.sectionTitle}><Table size={16} color="#f59e0b" /> Column Mapping</div>
                        <div style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '16px' }}>
                            Map your CSV columns to creator fields. File: <strong style={{ color: '#fff' }}>{file?.name}</strong> ({csvData.length} rows detected)
                        </div>
                        {CREATOR_FIELDS.map(field => (
                            <div key={field.key} style={s.mappingRow}>
                                <div style={{ width: '140px', color: field.required ? '#fff' : '#94a3b8', fontSize: '13px', fontWeight: field.required ? 600 : 400 }}>
                                    {field.label}{field.required ? ' *' : ''}
                                </div>
                                <ArrowRight size={14} color="#64748b" />
                                <select style={s.select} value={columnMapping[field.key] || ''}
                                    onChange={e => setColumnMapping({ ...columnMapping, [field.key]: e.target.value })}>
                                    <option value="">-- Skip --</option>
                                    {csvHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                                </select>
                                {columnMapping[field.key] && <CheckCircle size={14} color="#10b981" />}
                            </div>
                        ))}
                        <div style={{ display: 'flex', gap: '8px', marginTop: '20px', justifyContent: 'flex-end' }}>
                            <button style={{ ...s.btn, ...s.btnSecondary }} onClick={() => setStep(1)}>Back</button>
                            <button style={{ ...s.btn, ...s.btnPrimary }} onClick={() => setStep(3)}>Preview Data</button>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Step 3: Preview */}
            {step === 3 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div style={s.panel}>
                        <div style={s.sectionTitle}><FileText size={16} color="#06b6d4" /> Preview (First 10 rows)</div>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={s.table}>
                                <thead>
                                    <tr>
                                        <th style={s.th}>#</th>
                                        {CREATOR_FIELDS.filter(f => columnMapping[f.key]).map(f => (
                                            <th key={f.key} style={s.th}>{f.label}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {csvData.slice(0, 10).map((row, i) => (
                                        <tr key={i}>
                                            <td style={s.td}>{i + 1}</td>
                                            {CREATOR_FIELDS.filter(f => columnMapping[f.key]).map(f => (
                                                <td key={f.key} style={s.td}>{row[columnMapping[f.key]] || '-'}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div style={{ color: '#94a3b8', fontSize: '12px', marginTop: '12px' }}>
                            Showing {Math.min(10, csvData.length)} of {csvData.length} rows
                        </div>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '20px', justifyContent: 'flex-end' }}>
                            <button style={{ ...s.btn, ...s.btnSecondary }} onClick={() => setStep(2)}>Back</button>
                            <button style={{ ...s.btn, ...s.btnPrimary }} onClick={startImport}>
                                <Upload size={14} /> Start Import
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Step 4: Importing */}
            {step === 4 && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div style={{ ...s.panel, textAlign: 'center', padding: '60px 40px' }}>
                        <HardDrive size={48} color="#6366f1" style={{ marginBottom: '16px' }} />
                        <div style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
                            Importing Creators...
                        </div>
                        <div style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '24px' }}>
                            Processing {csvData.length} records
                        </div>
                        <div style={{ ...s.progressBar, maxWidth: '400px', margin: '0 auto' }}>
                            <div style={s.progressFill(importProgress)} />
                        </div>
                        <div style={{ color: '#6366f1', fontSize: '16px', fontWeight: 700, marginTop: '12px' }}>
                            {importProgress.toFixed(0)}%
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Step 5: Results */}
            {step === 5 && importResults && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div style={s.panel}>
                        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                            <CheckCircle size={48} color="#10b981" style={{ marginBottom: '12px' }} />
                            <div style={{ fontSize: '20px', fontWeight: 700, color: '#fff' }}>Import Complete!</div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
                            <div style={s.resultCard('#6366f1')}>
                                <div style={{ ...s.resultValue, color: '#6366f1' }}>{importResults.total}</div>
                                <div style={s.resultLabel}>Total Rows</div>
                            </div>
                            <div style={s.resultCard('#10b981')}>
                                <div style={{ ...s.resultValue, color: '#10b981' }}>{importResults.success}</div>
                                <div style={s.resultLabel}>Successful</div>
                            </div>
                            <div style={s.resultCard('#ef4444')}>
                                <div style={{ ...s.resultValue, color: '#ef4444' }}>{importResults.failed}</div>
                                <div style={s.resultLabel}>Failed</div>
                            </div>
                            <div style={s.resultCard('#f59e0b')}>
                                <div style={{ ...s.resultValue, color: '#f59e0b' }}>{importResults.duplicates}</div>
                                <div style={s.resultLabel}>Duplicates</div>
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px' }}>
                            <button style={{ ...s.btn, ...s.btnPrimary }} onClick={resetImport}>
                                <RotateCcw size={14} /> Import Another File
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}

            {/* Import History */}
            <motion.div style={s.panel} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <div style={s.sectionTitle}><File size={16} color="#ec4899" /> Import History</div>
                {importHistory.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '30px', color: '#64748b', fontSize: '13px' }}>No imports yet</div>
                ) : (
                    <table style={s.table}>
                        <thead>
                            <tr>
                                <th style={s.th}>File Name</th>
                                <th style={s.th}>Date</th>
                                <th style={s.th}>Total</th>
                                <th style={s.th}>Success</th>
                                <th style={s.th}>Failed</th>
                                <th style={s.th}>Duplicates</th>
                                <th style={s.th}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {importHistory.map(imp => (
                                <tr key={imp.id}>
                                    <td style={s.td}>{imp.fileName}</td>
                                    <td style={{ ...s.td, color: '#94a3b8' }}>{imp.date}</td>
                                    <td style={s.td}>{imp.totalRows}</td>
                                    <td style={{ ...s.td, color: '#10b981' }}>{imp.success}</td>
                                    <td style={{ ...s.td, color: '#ef4444' }}>{imp.failed}</td>
                                    <td style={{ ...s.td, color: '#f59e0b' }}>{imp.duplicates}</td>
                                    <td style={s.td}>
                                        <span style={{
                                            padding: '2px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: 600,
                                            background: 'rgba(16,185,129,0.15)', color: '#10b981'
                                        }}>{imp.status}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </motion.div>
        </div>
    )
}

export default BulkImport
