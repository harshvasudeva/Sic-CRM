/**
 * Data Export / Takeout Utility - export data in CSV, JSON, or PDF format.
 */

/**
 * Export data as CSV and trigger download.
 */
export function exportToCSV(data, filename = 'export', columns) {
  if (!data || data.length === 0) return

  const keys = columns ? columns.map(c => c.key || c) : Object.keys(data[0])
  const headers = columns ? columns.map(c => c.label || c.key || c) : keys

  const csvRows = [
    headers.join(','),
    ...data.map(row =>
      keys.map(key => {
        let val = row[key]
        if (val === null || val === undefined) val = ''
        val = String(val).replace(/"/g, '""')
        if (val.includes(',') || val.includes('"') || val.includes('\n')) {
          val = `"${val}"`
        }
        return val
      }).join(',')
    ),
  ]

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
  downloadBlob(blob, `${filename}.csv`)
}

/**
 * Export data as JSON and trigger download.
 */
export function exportToJSON(data, filename = 'export') {
  const json = JSON.stringify(data, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  downloadBlob(blob, `${filename}.json`)
}

/**
 * Export data as a printable HTML table (opens print dialog).
 */
export function exportToPrint(data, title = 'Report', columns) {
  if (!data || data.length === 0) return

  const keys = columns ? columns.map(c => c.key || c) : Object.keys(data[0])
  const headers = columns ? columns.map(c => c.label || c.key || c) : keys

  const tableRows = data.map(row =>
    `<tr>${keys.map(k => `<td style="padding:8px 12px;border-bottom:1px solid #eee">${row[k] ?? ''}</td>`).join('')}</tr>`
  ).join('')

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title}</title>
      <style>
        body { font-family: -apple-system, sans-serif; padding: 20px; color: #333; }
        h1 { font-size: 1.4rem; margin-bottom: 4px; }
        .meta { color: #666; font-size: 0.85rem; margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
        th { text-align: left; padding: 10px 12px; background: #f5f5f5; border-bottom: 2px solid #ddd; font-weight: 600; }
        td { padding: 8px 12px; border-bottom: 1px solid #eee; }
        tr:hover td { background: #fafafa; }
        @media print { body { padding: 0; } }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <p class="meta">Exported on ${new Date().toLocaleString()} | ${data.length} records</p>
      <table>
        <thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
        <tbody>${tableRows}</tbody>
      </table>
    </body>
    </html>
  `

  const printWindow = window.open('', '_blank')
  printWindow.document.write(html)
  printWindow.document.close()
  printWindow.focus()
  setTimeout(() => printWindow.print(), 500)
}

/**
 * Full data takeout - exports all CRM data from localStorage.
 */
export function fullDataTakeout() {
  const takeout = {}
  const prefix = 'sic_crm_'

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key.startsWith(prefix)) {
      try {
        takeout[key] = JSON.parse(localStorage.getItem(key))
      } catch {
        takeout[key] = localStorage.getItem(key)
      }
    }
  }

  takeout._meta = {
    exportedAt: new Date().toISOString(),
    version: '2.0.0',
    recordCount: Object.keys(takeout).length - 1,
  }

  exportToJSON(takeout, `sic-crm-takeout-${new Date().toISOString().split('T')[0]}`)
  return takeout
}

/**
 * Import data from a takeout file.
 */
export function importDataTakeout(data) {
  const imported = []
  for (const [key, value] of Object.entries(data)) {
    if (key === '_meta') continue
    if (key.startsWith('sic_crm_')) {
      localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value))
      imported.push(key)
    }
  }
  return imported
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
