import { useState, useMemo, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
    ChevronUp, ChevronDown, Search, Download, Filter,
    Check, X, Edit3, Trash2, Copy, MoreHorizontal,
    CheckSquare, Square, Save, BookmarkPlus, Bookmark
} from 'lucide-react'
import ContextMenu from './ContextMenu'
import { getSavedFilters, saveFilter, deleteFilter } from '../stores/settingsStore'
import useVirtualList from '../hooks/useVirtualList'

function DataTable({
    columns,
    data,
    title,
    searchable = true,
    exportable = true,
    // New props
    onEdit,           // (row) => void - inline edit callback
    onDelete,         // (row) => void - delete callback
    onBulkAction,     // (selectedRows, action) => void
    onInlineEdit,     // (row, key, value) => void - save inline edit
    contextMenuItems, // (row) => [{label, icon, onClick}]
    inlineEditable = false,
    bulkEditable = false,
    filterModule,     // module name for saved filters
    emptyIcon,        // custom empty state icon
    emptyMessage = 'No data found',
    emptyAction,      // { label, onClick } for empty state
    rowKey = 'id',    // key to use for row identity
    virtualizeThreshold = 200, // Enable virtualization when rows exceed this count
}) {
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
    const [searchQuery, setSearchQuery] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const [selectedRows, setSelectedRows] = useState(new Set())
    const [editingCell, setEditingCell] = useState(null) // { rowIdx, colKey }
    const [editValue, setEditValue] = useState('')
    const [contextMenu, setContextMenu] = useState(null) // { x, y, row }
    const [showFilters, setShowFilters] = useState(false)
    const [activeFilters, setActiveFilters] = useState({})
    const [savedFilterName, setSavedFilterName] = useState('')
    const searchInputRef = useRef(null)

    // Sort data
    const safeData = Array.isArray(data) ? data : []
    const sortedData = useMemo(() => {
        let sortableData = [...safeData]
        if (sortConfig.key) {
            sortableData.sort((a, b) => {
                const aVal = a[sortConfig.key]
                const bVal = b[sortConfig.key]
                if (aVal == null) return 1
                if (bVal == null) return -1
                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1
                return 0
            })
        }
        return sortableData
    }, [safeData, sortConfig])

    // Filter data
    const filteredData = useMemo(() => {
        let result = sortedData

        // Text search
        if (searchQuery) {
            result = result.filter(item =>
                Object.values(item).some(value =>
                    String(value).toLowerCase().includes(searchQuery.toLowerCase())
                )
            )
        }

        // Column filters
        Object.entries(activeFilters).forEach(([key, value]) => {
            if (value) {
                result = result.filter(item =>
                    String(item[key]).toLowerCase().includes(value.toLowerCase())
                )
            }
        })

        return result
    }, [sortedData, searchQuery, activeFilters])

    // Virtualization for large datasets (C1)
    const shouldVirtualize = filteredData.length > virtualizeThreshold
    const virtualList = useVirtualList({
        itemCount: shouldVirtualize ? filteredData.length : 0,
        itemHeight: 48,
        overscan: 10
    })

    // Paginate data (skip if virtualizing)
    const paginatedData = useMemo(() => {
        if (shouldVirtualize) {
            return virtualList.items.map(vi => filteredData[vi.index]).filter(Boolean)
        }
        const start = (currentPage - 1) * itemsPerPage
        return filteredData.slice(start, start + itemsPerPage)
    }, [filteredData, currentPage, itemsPerPage, shouldVirtualize, virtualList.items])

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
                columns.map(col => `"${String(row[col.key] || '').replace(/"/g, '""')}"`).join(',')
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

    // Inline editing
    const startEdit = (rowIdx, colKey, currentValue) => {
        if (!inlineEditable) return
        setEditingCell({ rowIdx, colKey })
        setEditValue(currentValue || '')
    }

    const saveEdit = () => {
        if (editingCell && onInlineEdit) {
            const row = paginatedData[editingCell.rowIdx]
            onInlineEdit(row, editingCell.colKey, editValue)
        }
        setEditingCell(null)
        setEditValue('')
    }

    const cancelEdit = () => {
        setEditingCell(null)
        setEditValue('')
    }

    // Bulk selection
    const toggleSelectAll = () => {
        if (selectedRows.size === paginatedData.length) {
            setSelectedRows(new Set())
        } else {
            setSelectedRows(new Set(paginatedData.map(r => r[rowKey])))
        }
    }

    const toggleSelectRow = (id) => {
        const next = new Set(selectedRows)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        setSelectedRows(next)
    }

    // Context menu
    const handleContextMenu = (e, row) => {
        if (!contextMenuItems) return
        e.preventDefault()
        setContextMenu({ x: e.clientX, y: e.clientY, row })
    }

    // Saved filters
    const savedFilters = filterModule ? getSavedFilters(filterModule) : []

    const applySavedFilter = (filter) => {
        setActiveFilters(filter.criteria || {})
        setSearchQuery(filter.criteria?._search || '')
    }

    const handleSaveFilter = () => {
        if (!savedFilterName || !filterModule) return
        saveFilter(filterModule, {
            name: savedFilterName,
            criteria: { ...activeFilters, _search: searchQuery }
        })
        setSavedFilterName('')
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
                    {/* Saved Filters */}
                    {filterModule && savedFilters.length > 0 && (
                        <div style={{ display: 'flex', gap: '4px', marginRight: '8px' }}>
                            {savedFilters.map(f => (
                                <button
                                    key={f.id}
                                    onClick={() => applySavedFilter(f)}
                                    className="data-table-filter-chip"
                                    title={`Load filter: ${f.name}`}
                                >
                                    <Bookmark size={12} />
                                    {f.name}
                                    <span
                                        onClick={(e) => { e.stopPropagation(); deleteFilter(filterModule, f.id) }}
                                        style={{ marginLeft: '4px', cursor: 'pointer', opacity: 0.5 }}
                                    >
                                        <X size={10} />
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}

                    {searchable && (
                        <div className="data-table-search">
                            <Search size={18} />
                            <input
                                ref={searchInputRef}
                                type="text"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1) }}
                            />
                            {searchQuery && (
                                <button onClick={() => setSearchQuery('')} style={{ padding: '2px' }}>
                                    <X size={14} style={{ color: 'var(--text-muted)' }} />
                                </button>
                            )}
                        </div>
                    )}

                    {filterModule && (
                        <button
                            className="data-table-btn-sm"
                            onClick={() => setShowFilters(!showFilters)}
                            title="Save current filter"
                        >
                            <BookmarkPlus size={16} />
                        </button>
                    )}

                    {bulkEditable && selectedRows.size > 0 && (
                        <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                                className="data-table-btn-sm"
                                onClick={() => onBulkAction?.(Array.from(selectedRows), 'edit')}
                                style={{ background: 'rgba(99,102,241,0.2)', color: 'var(--accent-primary)' }}
                            >
                                <Edit3 size={14} />
                                Edit {selectedRows.size}
                            </button>
                            <button
                                className="data-table-btn-sm"
                                onClick={() => onBulkAction?.(Array.from(selectedRows), 'delete')}
                                style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--error)' }}
                            >
                                <Trash2 size={14} />
                                Delete
                            </button>
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

            {/* Save Filter Bar */}
            {showFilters && filterModule && (
                <div style={{
                    display: 'flex',
                    gap: '8px',
                    padding: '12px 20px',
                    borderBottom: '1px solid var(--border-color)',
                    alignItems: 'center'
                }}>
                    <input
                        type="text"
                        placeholder="Filter name..."
                        value={savedFilterName}
                        onChange={e => setSavedFilterName(e.target.value)}
                        style={{
                            padding: '6px 12px',
                            background: 'var(--bg-tertiary)',
                            border: '1px solid var(--border-color)',
                            borderRadius: '8px',
                            color: 'var(--text-primary)',
                            fontSize: '0.85rem',
                            width: '200px'
                        }}
                    />
                    <button className="data-table-btn-sm" onClick={handleSaveFilter}>
                        <Save size={14} /> Save Filter
                    </button>
                    <button className="data-table-btn-sm" onClick={() => setShowFilters(false)}>
                        <X size={14} />
                    </button>
                </div>
            )}

            {/* Table */}
            <div className="data-table-wrapper">
                <table className="data-table">
                    <thead>
                        <tr>
                            {bulkEditable && (
                                <th style={{ width: '40px' }}>
                                    <button onClick={toggleSelectAll} style={{ color: 'var(--text-muted)', padding: '2px' }}>
                                        {selectedRows.size === paginatedData.length && paginatedData.length > 0
                                            ? <CheckSquare size={16} style={{ color: 'var(--accent-primary)' }} />
                                            : <Square size={16} />
                                        }
                                    </button>
                                </th>
                            )}
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    onClick={() => column.sortable !== false && handleSort(column.key)}
                                    className={column.sortable !== false ? 'sortable' : ''}
                                    style={column.width ? { width: column.width } : {}}
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
                        {paginatedData.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length + (bulkEditable ? 1 : 0)}>
                                    <div style={{
                                        textAlign: 'center',
                                        padding: '48px 20px',
                                        color: 'var(--text-muted)'
                                    }}>
                                        {emptyIcon && <div style={{ marginBottom: '12px', opacity: 0.5 }}>{emptyIcon}</div>}
                                        <p style={{ fontSize: '1rem', marginBottom: '8px' }}>{emptyMessage}</p>
                                        {emptyAction && (
                                            <button
                                                onClick={emptyAction.onClick}
                                                style={{
                                                    marginTop: '8px',
                                                    padding: '8px 16px',
                                                    background: 'var(--accent-gradient)',
                                                    color: 'white',
                                                    borderRadius: 'var(--radius-md)',
                                                    fontSize: '0.85rem',
                                                    fontWeight: 500
                                                }}
                                            >
                                                {emptyAction.label}
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            paginatedData.map((row, rowIndex) => (
                                <motion.tr
                                    key={row[rowKey] || rowIndex}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: rowIndex * 0.02 }}
                                    onContextMenu={(e) => handleContextMenu(e, row)}
                                    className={selectedRows.has(row[rowKey]) ? 'selected' : ''}
                                >
                                    {bulkEditable && (
                                        <td style={{ width: '40px' }}>
                                            <button
                                                onClick={() => toggleSelectRow(row[rowKey])}
                                                style={{ color: 'var(--text-muted)', padding: '2px' }}
                                            >
                                                {selectedRows.has(row[rowKey])
                                                    ? <CheckSquare size={16} style={{ color: 'var(--accent-primary)' }} />
                                                    : <Square size={16} />
                                                }
                                            </button>
                                        </td>
                                    )}
                                    {columns.map((column) => (
                                        <td
                                            key={column.key}
                                            data-label={column.label || column.key}
                                            onDoubleClick={() => {
                                                if (column.editable && inlineEditable) {
                                                    startEdit(rowIndex, column.key, row[column.key])
                                                }
                                            }}
                                            style={column.editable && inlineEditable ? { cursor: 'pointer' } : {}}
                                        >
                                            {editingCell?.rowIdx === rowIndex && editingCell?.colKey === column.key ? (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <input
                                                        type={column.editType || 'text'}
                                                        value={editValue}
                                                        onChange={(e) => setEditValue(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') saveEdit()
                                                            if (e.key === 'Escape') cancelEdit()
                                                        }}
                                                        autoFocus
                                                        style={{
                                                            padding: '4px 8px',
                                                            background: 'var(--bg-tertiary)',
                                                            border: '1px solid var(--accent-primary)',
                                                            borderRadius: '6px',
                                                            color: 'var(--text-primary)',
                                                            fontSize: '0.85rem',
                                                            width: '100%'
                                                        }}
                                                    />
                                                    <button onClick={saveEdit} style={{ color: 'var(--success)', padding: '2px' }}>
                                                        <Check size={14} />
                                                    </button>
                                                    <button onClick={cancelEdit} style={{ color: 'var(--error)', padding: '2px' }}>
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ) : (
                                                column.render
                                                    ? column.render(row[column.key], row)
                                                    : row[column.key]
                                            )}
                                        </td>
                                    ))}
                                </motion.tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="data-table-pagination">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Show</span>
                        <select
                            value={itemsPerPage}
                            onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1) }}
                            style={{
                                padding: '4px 8px',
                                background: 'var(--bg-tertiary)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '6px',
                                color: 'var(--text-primary)',
                                fontSize: '0.8rem'
                            }}
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
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
                </div>
            )}

            {/* Context Menu */}
            {contextMenu && contextMenuItems && (
                <ContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    items={contextMenuItems(contextMenu.row)}
                    onClose={() => setContextMenu(null)}
                />
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
          padding: 16px 20px;
          border-bottom: 1px solid var(--border-color);
          flex-wrap: wrap;
          gap: 12px;
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
          gap: 8px;
          flex-wrap: wrap;
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
          flex-shrink: 0;
        }

        .data-table-search input {
          background: transparent !important;
          border: none !important;
          color: var(--text-primary) !important;
          font-size: 0.9rem;
          width: 150px;
          padding: 0 !important;
          box-shadow: none !important;
        }

        .data-table-search input:focus {
          outline: none;
          box-shadow: none !important;
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
          transition: all 0.15s;
        }

        .data-table-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(99,102,241,0.3);
        }

        .data-table-btn-sm {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: rgba(255,255,255,0.05);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          color: var(--text-secondary);
          font-size: 0.8rem;
          transition: all 0.15s;
        }

        .data-table-btn-sm:hover {
          border-color: var(--accent-primary);
          color: var(--text-primary);
        }

        .data-table-filter-chip {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          background: rgba(99,102,241,0.1);
          border: 1px solid rgba(99,102,241,0.2);
          border-radius: 14px;
          color: var(--accent-primary);
          font-size: 0.75rem;
          font-weight: 500;
          transition: all 0.15s;
        }

        .data-table-filter-chip:hover {
          background: rgba(99,102,241,0.2);
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
          padding: var(--density-padding, 14px 16px);
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          background: var(--bg-secondary, rgba(0, 0, 0, 0.2));
          border-bottom: 1px solid var(--border-color);
          position: sticky;
          top: 0;
          z-index: 10;
          backdrop-filter: blur(8px);
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
          padding: var(--density-padding, 14px 16px);
          font-size: var(--density-font, 0.9rem);
          border-bottom: 1px solid var(--border-color);
        }

        .data-table tbody tr {
          transition: background 0.15s;
        }

        .data-table tbody tr:hover {
          background: rgba(255, 255, 255, 0.02);
        }

        .data-table tbody tr.selected {
          background: rgba(99, 102, 241, 0.08);
        }

        .data-table tbody tr:last-child td {
          border-bottom: none;
        }

        .data-table-pagination {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 20px;
          border-top: 1px solid var(--border-color);
        }

        .data-table-pagination button {
          padding: 6px 14px;
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
