import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
    ChevronUp,
    ChevronDown,
    Search,
    Download,
    Filter
} from 'lucide-react'

function DataTable({
    columns,
    data,
    title,
    searchable = true,
    exportable = true
}) {
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
    const [searchQuery, setSearchQuery] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10

    // Sort data
    const sortedData = useMemo(() => {
        let sortableData = [...data]
        if (sortConfig.key) {
            sortableData.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? -1 : 1
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? 1 : -1
                }
                return 0
            })
        }
        return sortableData
    }, [data, sortConfig])

    // Filter data
    const filteredData = useMemo(() => {
        if (!searchQuery) return sortedData
        return sortedData.filter(item =>
            Object.values(item).some(value =>
                String(value).toLowerCase().includes(searchQuery.toLowerCase())
            )
        )
    }, [sortedData, searchQuery])

    // Paginate data
    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage
        return filteredData.slice(start, start + itemsPerPage)
    }, [filteredData, currentPage])

    const totalPages = Math.ceil(filteredData.length / itemsPerPage)

    const handleSort = (key) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }))
    }

    const handleExport = () => {
        const csv = [
            columns.map(col => col.label).join(','),
            ...filteredData.map(row =>
                columns.map(col => `"${row[col.key] || ''}"`).join(',')
            )
        ].join('\n')

        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${title || 'data'}.csv`
        a.click()
        URL.revokeObjectURL(url)
    }

    return (
        <div className="data-table-container">
            {/* Header */}
            <div className="data-table-header">
                <div className="data-table-title">
                    {title && <h3>{title}</h3>}
                    <span className="data-table-count">{filteredData.length} items</span>
                </div>
                <div className="data-table-actions">
                    {searchable && (
                        <div className="data-table-search">
                            <Search size={18} />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    )}
                    {exportable && (
                        <button className="data-table-btn" onClick={handleExport}>
                            <Download size={18} />
                            Export
                        </button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="data-table-wrapper">
                <table className="data-table">
                    <thead>
                        <tr>
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    onClick={() => column.sortable !== false && handleSort(column.key)}
                                    className={column.sortable !== false ? 'sortable' : ''}
                                >
                                    <div className="th-content">
                                        <span>{column.label}</span>
                                        {column.sortable !== false && (
                                            <div className="sort-icons">
                                                <ChevronUp
                                                    size={14}
                                                    className={sortConfig.key === column.key && sortConfig.direction === 'asc' ? 'active' : ''}
                                                />
                                                <ChevronDown
                                                    size={14}
                                                    className={sortConfig.key === column.key && sortConfig.direction === 'desc' ? 'active' : ''}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map((row, rowIndex) => (
                            <motion.tr
                                key={rowIndex}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: rowIndex * 0.02 }}
                            >
                                {columns.map((column) => (
                                    <td key={column.key}>
                                        {column.render
                                            ? column.render(row[column.key], row)
                                            : row[column.key]
                                        }
                                    </td>
                                ))}
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="data-table-pagination">
                    <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(p => p - 1)}
                    >
                        Previous
                    </button>
                    <div className="pagination-info">
                        Page {currentPage} of {totalPages}
                    </div>
                    <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage(p => p + 1)}
                    >
                        Next
                    </button>
                </div>
            )}

            <style>{`
        .data-table-container {
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          overflow: hidden;
        }

        .data-table-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px;
          border-bottom: 1px solid var(--border-color);
          flex-wrap: wrap;
          gap: 16px;
        }

        .data-table-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .data-table-title h3 {
          font-size: 1.1rem;
          font-weight: 600;
        }

        .data-table-count {
          font-size: 0.8rem;
          color: var(--text-muted);
          background: rgba(255, 255, 255, 0.05);
          padding: 4px 10px;
          border-radius: 12px;
        }

        .data-table-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .data-table-search {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
        }

        .data-table-search svg {
          color: var(--text-muted);
        }

        .data-table-search input {
          background: transparent;
          border: none;
          color: var(--text-primary);
          font-size: 0.9rem;
          width: 150px;
        }

        .data-table-search input:focus {
          outline: none;
        }

        .data-table-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: var(--accent-gradient);
          border-radius: var(--radius-md);
          color: white;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .data-table-wrapper {
          overflow-x: auto;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
        }

        .data-table th {
          text-align: left;
          padding: 14px 16px;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          background: rgba(0, 0, 0, 0.2);
          border-bottom: 1px solid var(--border-color);
        }

        .data-table th.sortable {
          cursor: pointer;
          user-select: none;
        }

        .data-table th.sortable:hover {
          color: var(--text-primary);
        }

        .th-content {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .sort-icons {
          display: flex;
          flex-direction: column;
          gap: -4px;
        }

        .sort-icons svg {
          color: var(--text-muted);
          opacity: 0.3;
        }

        .sort-icons svg.active {
          opacity: 1;
          color: var(--accent-primary);
        }

        .data-table td {
          padding: 14px 16px;
          font-size: 0.9rem;
          border-bottom: 1px solid var(--border-color);
        }

        .data-table tbody tr:hover {
          background: rgba(255, 255, 255, 0.02);
        }

        .data-table tbody tr:last-child td {
          border-bottom: none;
        }

        .data-table-pagination {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          padding: 16px;
          border-top: 1px solid var(--border-color);
        }

        .data-table-pagination button {
          padding: 8px 16px;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          color: var(--text-secondary);
          font-size: 0.85rem;
          transition: all 0.2s;
        }

        .data-table-pagination button:hover:not(:disabled) {
          border-color: var(--accent-primary);
          color: var(--accent-primary);
        }

        .data-table-pagination button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .pagination-info {
          font-size: 0.85rem;
          color: var(--text-muted);
        }
      `}</style>
        </div>
    )
}

export default DataTable
