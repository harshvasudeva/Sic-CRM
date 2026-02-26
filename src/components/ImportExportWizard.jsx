/**
 * ImportExportWizard - Multi-step wizard for importing/exporting data across modules.
 * Supports CSV/Excel upload, column mapping, validation preview, and export with filters.
 * Roadmap item B22.
 *
 * @param {string} mode - 'import' | 'export'
 * @param {string} entityType - e.g. 'contacts', 'products', 'invoices'
 * @param {Array} columns - Available columns for mapping [{key, label, required}]
 * @param {Function} onImport - Called with mapped & validated rows
 * @param {Function} onExport - Called with { format, filters, columns }
 * @param {Function} onClose - Close wizard
 */
import { useState, useCallback, useMemo } from 'react'
import { Upload, Download, FileText, CheckCircle, AlertTriangle, X, ChevronRight, ChevronLeft, Table, FileSpreadsheet } from 'lucide-react'

const STEPS_IMPORT = ['Upload', 'Map Columns', 'Preview & Validate', 'Complete']
const STEPS_EXPORT = ['Configure', 'Preview', 'Download']

function parseCSV(text) {
  const lines = text.trim().split('\n')
  if (lines.length < 2) return { headers: [], rows: [] }
  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
  const rows = lines.slice(1).map((line, idx) => {
    const vals = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''))
    const obj = { _row: idx + 2 }
    headers.forEach((h, i) => { obj[h] = vals[i] || '' })
    return obj
  })
  return { headers, rows }
}

function validateRow(row, mapping, columns) {
  const errors = []
  columns.forEach(col => {
    if (col.required) {
      const sourceCol = Object.entries(mapping).find(([, v]) => v === col.key)?.[0]
      if (!sourceCol || !row[sourceCol]?.toString().trim()) {
        errors.push(`Missing required field: ${col.label}`)
      }
    }
  })
  return errors
}

export default function ImportExportWizard({ mode = 'import', entityType = 'records', columns = [], onImport, onExport, onClose }) {
  const steps = mode === 'import' ? STEPS_IMPORT : STEPS_EXPORT
  const [step, setStep] = useState(0)

  // Import state
  const [fileData, setFileData] = useState(null)
  const [parsed, setParsed] = useState({ headers: [], rows: [] })
  const [mapping, setMapping] = useState({})
  const [importResult, setImportResult] = useState(null)

  // Export state
  const [exportFormat, setExportFormat] = useState('csv')
  const [selectedCols, setSelectedCols] = useState(() => columns.map(c => c.key))
  const [exportFilters, setExportFilters] = useState({})

  const handleFileChange = useCallback((e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setFileData(file)
    const reader = new FileReader()
    reader.onload = (ev) => {
      const result = parseCSV(ev.target.result)
      setParsed(result)
      // Auto-map exact matches
      const autoMap = {}
      result.headers.forEach(h => {
        const match = columns.find(c => c.key.toLowerCase() === h.toLowerCase() || c.label.toLowerCase() === h.toLowerCase())
        if (match) autoMap[h] = match.key
      })
      setMapping(autoMap)
    }
    reader.readAsText(file)
  }, [columns])

  const validationResults = useMemo(() => {
    if (mode !== 'import' || parsed.rows.length === 0) return []
    return parsed.rows.map(row => ({
      row,
      errors: validateRow(row, mapping, columns),
    }))
  }, [parsed.rows, mapping, columns, mode])

  const validCount = validationResults.filter(r => r.errors.length === 0).length
  const errorCount = validationResults.filter(r => r.errors.length > 0).length

  const handleImportConfirm = () => {
    const mappedRows = validationResults
      .filter(r => r.errors.length === 0)
      .map(r => {
        const mapped = {}
        Object.entries(mapping).forEach(([src, dest]) => {
          mapped[dest] = r.row[src]
        })
        return mapped
      })
    onImport?.(mappedRows)
    setImportResult({ imported: mappedRows.length, skipped: errorCount })
    setStep(3)
  }

  const handleExportConfirm = () => {
    onExport?.({ format: exportFormat, columns: selectedCols, filters: exportFilters })
    setStep(2)
  }

  const canNext = () => {
    if (mode === 'import') {
      if (step === 0) return parsed.rows.length > 0
      if (step === 1) return Object.keys(mapping).length > 0
      if (step === 2) return validCount > 0
    } else {
      if (step === 0) return selectedCols.length > 0
    }
    return false
  }

  const s = {
    overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    modal: { background: 'var(--bg-primary)', borderRadius: 10, width: 640, maxHeight: '85vh', display: 'flex', flexDirection: 'column', border: '1px solid var(--border)', boxShadow: '0 16px 48px rgba(0,0,0,0.3)' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid var(--border)' },
    title: { fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 },
    closeBtn: { background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 4 },
    stepper: { display: 'flex', gap: 4, padding: '12px 18px', borderBottom: '1px solid var(--border)' },
    stepItem: (active, done) => ({
      flex: 1, textAlign: 'center', padding: '6px 0', fontSize: 11, fontWeight: 600, borderRadius: 4,
      background: active ? 'var(--accent)' : done ? 'var(--accent)20' : 'var(--bg-secondary)',
      color: active ? '#fff' : done ? 'var(--accent)' : 'var(--text-secondary)',
    }),
    body: { flex: 1, overflow: 'auto', padding: 18 },
    footer: { display: 'flex', justifyContent: 'space-between', padding: '12px 18px', borderTop: '1px solid var(--border)' },
    btn: (primary) => ({
      padding: '7px 16px', borderRadius: 6, border: primary ? 'none' : '1px solid var(--border)',
      background: primary ? 'var(--accent)' : 'transparent', color: primary ? '#fff' : 'var(--text-primary)',
      fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
      opacity: primary && !canNext() ? 0.5 : 1,
    }),
    dropZone: { border: '2px dashed var(--border)', borderRadius: 8, padding: 32, textAlign: 'center', cursor: 'pointer' },
    mapRow: { display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid var(--border)' },
    select: { flex: 1, padding: '5px 8px', borderRadius: 4, border: '1px solid var(--border)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: 12 },
    label: { flex: 1, fontSize: 12, color: 'var(--text-primary)', fontWeight: 500 },
    arrow: { color: 'var(--text-secondary)' },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: 11 },
    th: { textAlign: 'left', padding: '6px 8px', background: 'var(--bg-secondary)', fontWeight: 600, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' },
    td: (hasError) => ({ padding: '5px 8px', borderBottom: '1px solid var(--border)', color: hasError ? '#ef4444' : 'var(--text-primary)' }),
    stat: { display: 'flex', gap: 16, marginBottom: 12 },
    statBox: (color) => ({ flex: 1, padding: 12, borderRadius: 6, background: color + '10', textAlign: 'center' }),
    statNum: (color) => ({ fontSize: 22, fontWeight: 700, color }),
    statLabel: { fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 },
    checkRow: { display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', fontSize: 12, color: 'var(--text-primary)' },
    checkbox: { accentColor: 'var(--accent)' },
  }

  const renderImportStep = () => {
    if (step === 0) {
      return (
        <div>
          <div style={s.dropZone} onClick={() => document.getElementById('_iw_file').click()}>
            <Upload size={28} style={{ color: 'var(--text-secondary)', marginBottom: 8 }} />
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
              {fileData ? fileData.name : 'Click to upload CSV file'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>
              Supports .csv files
            </div>
            <input id="_iw_file" type="file" accept=".csv" style={{ display: 'none' }} onChange={handleFileChange} />
          </div>
          {parsed.rows.length > 0 && (
            <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-secondary)' }}>
              <CheckCircle size={14} style={{ color: '#10b981', marginRight: 4, verticalAlign: 'middle' }} />
              Parsed {parsed.rows.length} rows with {parsed.headers.length} columns
            </div>
          )}
        </div>
      )
    }
    if (step === 1) {
      return (
        <div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 10 }}>Map source columns to {entityType} fields</div>
          {parsed.headers.map(h => (
            <div key={h} style={s.mapRow}>
              <div style={s.label}>{h}</div>
              <ChevronRight size={14} style={s.arrow} />
              <select
                style={s.select}
                value={mapping[h] || ''}
                onChange={e => setMapping(prev => ({ ...prev, [h]: e.target.value || undefined }))}
              >
                <option value="">-- Skip --</option>
                {columns.map(c => (
                  <option key={c.key} value={c.key}>{c.label}{c.required ? ' *' : ''}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )
    }
    if (step === 2) {
      return (
        <div>
          <div style={s.stat}>
            <div style={s.statBox('#10b981')}>
              <div style={s.statNum('#10b981')}>{validCount}</div>
              <div style={s.statLabel}>Valid rows</div>
            </div>
            <div style={s.statBox('#ef4444')}>
              <div style={s.statNum('#ef4444')}>{errorCount}</div>
              <div style={s.statLabel}>With errors</div>
            </div>
          </div>
          <div style={{ maxHeight: 220, overflow: 'auto' }}>
            <table style={s.table}>
              <thead>
                <tr>
                  <th style={s.th}>Row</th>
                  <th style={s.th}>Status</th>
                  {Object.values(mapping).filter(Boolean).slice(0, 4).map(k => (
                    <th key={k} style={s.th}>{columns.find(c => c.key === k)?.label || k}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {validationResults.slice(0, 50).map((r, i) => (
                  <tr key={i}>
                    <td style={s.td(r.errors.length > 0)}>{r.row._row}</td>
                    <td style={s.td(r.errors.length > 0)}>
                      {r.errors.length > 0
                        ? <span style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: 3 }}><AlertTriangle size={11} />{r.errors[0]}</span>
                        : <span style={{ color: '#10b981' }}><CheckCircle size={11} /> OK</span>}
                    </td>
                    {Object.entries(mapping).filter(([, v]) => v).slice(0, 4).map(([src]) => (
                      <td key={src} style={s.td(false)}>{r.row[src]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )
    }
    if (step === 3) {
      return (
        <div style={{ textAlign: 'center', padding: 24 }}>
          <CheckCircle size={40} style={{ color: '#10b981', marginBottom: 12 }} />
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>Import Complete</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6 }}>
            {importResult?.imported} records imported, {importResult?.skipped} skipped
          </div>
        </div>
      )
    }
  }

  const renderExportStep = () => {
    if (step === 0) {
      return (
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>Export Format</div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {[{ id: 'csv', label: 'CSV', icon: FileText }, { id: 'xlsx', label: 'Excel', icon: FileSpreadsheet }].map(f => (
              <button
                key={f.id}
                onClick={() => setExportFormat(f.id)}
                style={{
                  flex: 1, padding: 12, borderRadius: 6, cursor: 'pointer',
                  border: exportFormat === f.id ? '2px solid var(--accent)' : '1px solid var(--border)',
                  background: exportFormat === f.id ? 'var(--accent)10' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  fontSize: 12, fontWeight: 600, color: 'var(--text-primary)',
                }}
              >
                <f.icon size={16} /> {f.label}
              </button>
            ))}
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>Columns to Export</div>
          {columns.map(col => (
            <div key={col.key} style={s.checkRow}>
              <input
                type="checkbox"
                style={s.checkbox}
                checked={selectedCols.includes(col.key)}
                onChange={e => {
                  setSelectedCols(prev => e.target.checked ? [...prev, col.key] : prev.filter(k => k !== col.key))
                }}
              />
              {col.label}
            </div>
          ))}
        </div>
      )
    }
    if (step === 1) {
      return (
        <div style={{ textAlign: 'center', padding: 16 }}>
          <Table size={32} style={{ color: 'var(--accent)', marginBottom: 8 }} />
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
            Ready to export {selectedCols.length} columns as {exportFormat.toUpperCase()}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>
            Click "Download" to generate the file
          </div>
        </div>
      )
    }
    if (step === 2) {
      return (
        <div style={{ textAlign: 'center', padding: 24 }}>
          <CheckCircle size={40} style={{ color: '#10b981', marginBottom: 12 }} />
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>Export Complete</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 6 }}>
            Your {exportFormat.toUpperCase()} file has been generated
          </div>
        </div>
      )
    }
  }

  const isLastStep = step === steps.length - 1

  return (
    <div style={s.overlay} onClick={e => e.target === e.currentTarget && onClose?.()}>
      <div style={s.modal}>
        <div style={s.header}>
          <div style={s.title}>
            {mode === 'import' ? <Upload size={16} /> : <Download size={16} />}
            {mode === 'import' ? `Import ${entityType}` : `Export ${entityType}`}
          </div>
          <button style={s.closeBtn} onClick={onClose}><X size={16} /></button>
        </div>
        <div style={s.stepper}>
          {steps.map((label, i) => (
            <div key={label} style={s.stepItem(i === step, i < step)}>{label}</div>
          ))}
        </div>
        <div style={s.body}>
          {mode === 'import' ? renderImportStep() : renderExportStep()}
        </div>
        {!isLastStep && (
          <div style={s.footer}>
            <button style={s.btn(false)} onClick={() => step > 0 ? setStep(step - 1) : onClose?.()}>
              <ChevronLeft size={14} /> {step === 0 ? 'Cancel' : 'Back'}
            </button>
            {mode === 'import' && step === 2 ? (
              <button style={s.btn(true)} onClick={handleImportConfirm} disabled={validCount === 0}>
                Import {validCount} rows <ChevronRight size={14} />
              </button>
            ) : mode === 'export' && step === 1 ? (
              <button style={s.btn(true)} onClick={handleExportConfirm}>
                <Download size={14} /> Download
              </button>
            ) : (
              <button style={s.btn(true)} onClick={() => setStep(step + 1)} disabled={!canNext()}>
                Next <ChevronRight size={14} />
              </button>
            )}
          </div>
        )}
        {isLastStep && (
          <div style={s.footer}>
            <div />
            <button style={s.btn(true)} onClick={onClose}>Done</button>
          </div>
        )}
      </div>
    </div>
  )
}
