/**
 * DashboardComposer - Drag-free configurable dashboard grid.
 * Users pick widgets from a catalog, arrange in a responsive grid.
 * Roadmap item B24.
 *
 * @param {Array} widgets - [{id, type, title, size, config, component}]
 * @param {Array} catalog - [{type, title, description, defaultSize, icon}]
 * @param {Function} onLayoutChange - Called with updated widget list
 * @param {Function} onAddWidget - Called with widget type from catalog
 * @param {Function} onRemoveWidget - Called with widget id
 * @param {Function} onConfigWidget - Called with { id, config }
 */
import { useState } from 'react'
import { Plus, X, Settings, Maximize2, Minimize2, GripVertical, LayoutGrid, BarChart3, Users, DollarSign, Package, TrendingUp, Activity, PieChart } from 'lucide-react'

const SIZE_OPTIONS = [
  { key: '1x1', cols: 1, rows: 1, label: 'Small' },
  { key: '2x1', cols: 2, rows: 1, label: 'Wide' },
  { key: '1x2', cols: 1, rows: 2, label: 'Tall' },
  { key: '2x2', cols: 2, rows: 2, label: 'Large' },
]

const DEFAULT_ICONS = {
  chart: BarChart3,
  users: Users,
  revenue: DollarSign,
  inventory: Package,
  trends: TrendingUp,
  activity: Activity,
  pie: PieChart,
  grid: LayoutGrid,
}

export default function DashboardComposer({ widgets = [], catalog = [], onLayoutChange, onAddWidget, onRemoveWidget, onConfigWidget }) {
  const [showCatalog, setShowCatalog] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [configuring, setConfiguring] = useState(null)
  const [dragIndex, setDragIndex] = useState(null)
  const [dragOverIndex, setDragOverIndex] = useState(null)

  const handleDragStart = (e, index) => {
    if (!editMode) return
    setDragIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', index)
  }

  const handleDragOver = (e, index) => {
    e.preventDefault()
    if (dragIndex === null || dragIndex === index) return
    setDragOverIndex(index)
  }

  const handleDrop = (e, dropIndex) => {
    e.preventDefault()
    if (dragIndex === null || dragIndex === dropIndex) return
    const updated = [...widgets]
    const [dragged] = updated.splice(dragIndex, 1)
    updated.splice(dropIndex, 0, dragged)
    onLayoutChange?.(updated)
    setDragIndex(null)
    setDragOverIndex(null)
  }

  const handleDragEnd = () => {
    setDragIndex(null)
    setDragOverIndex(null)
  }

  const moveWidget = (id, direction) => {
    const idx = widgets.findIndex(w => w.id === id)
    if (idx < 0) return
    const newIdx = direction === 'up' ? Math.max(0, idx - 1) : Math.min(widgets.length - 1, idx + 1)
    if (newIdx === idx) return
    const updated = [...widgets]
    const [item] = updated.splice(idx, 1)
    updated.splice(newIdx, 0, item)
    onLayoutChange?.(updated)
  }

  const resizeWidget = (id, newSize) => {
    const updated = widgets.map(w => w.id === id ? { ...w, size: newSize } : w)
    onLayoutChange?.(updated)
  }

  const s = {
    container: { padding: 0 },
    toolbar: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '8px 0', marginBottom: 8,
    },
    toolBtn: (active) => ({
      padding: '5px 12px', borderRadius: 6, border: '1px solid var(--border)',
      background: active ? 'var(--accent)' : 'transparent',
      color: active ? '#fff' : 'var(--text-primary)',
      fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
    }),
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: 10,
    },
    widget: (size, editing) => {
      const sizeObj = SIZE_OPTIONS.find(s => s.key === size) || SIZE_OPTIONS[0]
      return {
        gridColumn: `span ${sizeObj.cols}`,
        gridRow: `span ${sizeObj.rows}`,
        background: 'var(--bg-secondary)',
        border: editing ? '2px dashed var(--accent)' : '1px solid var(--border)',
        borderRadius: 8,
        minHeight: sizeObj.rows * 140,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
      }
    },
    widgetHeader: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '8px 10px', borderBottom: '1px solid var(--border)', flexShrink: 0,
    },
    widgetTitle: { fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 },
    widgetActions: { display: 'flex', gap: 2 },
    widgetBtn: { background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 2 },
    widgetBody: { flex: 1, padding: 10, overflow: 'auto' },
    emptyWidget: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)', fontSize: 12 },
    catalog: {
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
    catalogPanel: {
      background: 'var(--bg-primary)', borderRadius: 10, width: 480, maxHeight: '70vh',
      border: '1px solid var(--border)', boxShadow: '0 16px 48px rgba(0,0,0,0.3)',
      display: 'flex', flexDirection: 'column',
    },
    catalogHeader: {
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '12px 16px', borderBottom: '1px solid var(--border)',
    },
    catalogTitle: { fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' },
    catalogList: { flex: 1, overflow: 'auto', padding: 12 },
    catalogItem: {
      display: 'flex', gap: 10, padding: '10px 12px', borderRadius: 6,
      border: '1px solid var(--border)', marginBottom: 8, cursor: 'pointer',
      background: 'var(--bg-secondary)',
    },
    catalogItemIcon: (color) => ({
      width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: (color || 'var(--accent)') + '18', color: color || 'var(--accent)', flexShrink: 0,
    }),
    catalogItemBody: { flex: 1 },
    catalogItemTitle: { fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' },
    catalogItemDesc: { fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 },
    sizeSelector: {
      position: 'absolute', top: 32, right: 8, background: 'var(--bg-primary)',
      border: '1px solid var(--border)', borderRadius: 6, padding: 6,
      boxShadow: '0 4px 16px rgba(0,0,0,0.2)', zIndex: 10,
    },
    sizeOption: (active) => ({
      padding: '4px 10px', borderRadius: 4, cursor: 'pointer',
      fontSize: 11, fontWeight: 500,
      background: active ? 'var(--accent)' : 'transparent',
      color: active ? '#fff' : 'var(--text-primary)',
      marginBottom: 2,
    }),
  }

  return (
    <div style={s.container}>
      <div style={s.toolbar}>
        <div style={{ display: 'flex', gap: 6 }}>
          <button style={s.toolBtn(editMode)} onClick={() => setEditMode(!editMode)}>
            <Settings size={13} /> {editMode ? 'Done Editing' : 'Edit Layout'}
          </button>
          <button style={s.toolBtn(false)} onClick={() => setShowCatalog(true)}>
            <Plus size={13} /> Add Widget
          </button>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
          {widgets.length} widget{widgets.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div style={s.grid}>
        {widgets.map((w, idx) => {
          const IconComp = DEFAULT_ICONS[w.icon] || LayoutGrid
          return (
            <div
              key={w.id}
              style={{
                ...s.widget(w.size || '1x1', editMode),
                opacity: dragIndex === idx ? 0.5 : 1,
                border: dragOverIndex === idx ? '2px solid var(--accent)' : s.widget(w.size || '1x1', editMode).border,
                cursor: editMode ? 'grab' : 'default',
              }}
              draggable={editMode}
              onDragStart={(e) => handleDragStart(e, idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDrop={(e) => handleDrop(e, idx)}
              onDragEnd={handleDragEnd}
            >
              <div style={s.widgetHeader}>
                <div style={s.widgetTitle}>
                  {editMode && <GripVertical size={12} style={{ color: 'var(--text-secondary)' }} />}
                  <IconComp size={13} />
                  {w.title || w.type}
                </div>
                <div style={s.widgetActions}>
                  {editMode && (
                    <>
                      <button style={s.widgetBtn} title="Move up" onClick={() => moveWidget(w.id, 'up')}>
                        <Minimize2 size={11} />
                      </button>
                      <button style={s.widgetBtn} title="Move down" onClick={() => moveWidget(w.id, 'down')}>
                        <Maximize2 size={11} />
                      </button>
                      <button style={s.widgetBtn} title="Resize" onClick={() => setConfiguring(configuring === w.id ? null : w.id)}>
                        <Settings size={11} />
                      </button>
                      <button style={s.widgetBtn} title="Remove" onClick={() => onRemoveWidget?.(w.id)}>
                        <X size={11} />
                      </button>
                    </>
                  )}
                </div>
              </div>
              {configuring === w.id && (
                <div style={s.sizeSelector}>
                  {SIZE_OPTIONS.map(opt => (
                    <div
                      key={opt.key}
                      style={s.sizeOption(w.size === opt.key)}
                      onClick={() => { resizeWidget(w.id, opt.key); setConfiguring(null) }}
                    >
                      {opt.label} ({opt.key})
                    </div>
                  ))}
                </div>
              )}
              <div style={s.widgetBody}>
                {w.component ? (
                  w.component
                ) : (
                  <div style={s.emptyWidget}>
                    <IconComp size={20} style={{ opacity: 0.3 }} />
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {widgets.length === 0 && (
          <div style={{ gridColumn: 'span 4', padding: 40, textAlign: 'center' }}>
            <LayoutGrid size={32} style={{ color: 'var(--text-secondary)', marginBottom: 8, opacity: 0.3 }} />
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              No widgets added. Click "Add Widget" to get started.
            </div>
          </div>
        )}
      </div>

      {showCatalog && (
        <div style={s.catalog} onClick={e => e.target === e.currentTarget && setShowCatalog(false)}>
          <div style={s.catalogPanel}>
            <div style={s.catalogHeader}>
              <span style={s.catalogTitle}>Widget Catalog</span>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }} onClick={() => setShowCatalog(false)}>
                <X size={16} />
              </button>
            </div>
            <div style={s.catalogList}>
              {catalog.length === 0 && (
                <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-secondary)', fontSize: 12 }}>
                  No widgets available in catalog
                </div>
              )}
              {catalog.map(item => {
                const CatIcon = DEFAULT_ICONS[item.icon] || LayoutGrid
                return (
                  <div
                    key={item.type}
                    style={s.catalogItem}
                    onClick={() => { onAddWidget?.(item.type); setShowCatalog(false) }}
                  >
                    <div style={s.catalogItemIcon(item.color)}>
                      <CatIcon size={18} />
                    </div>
                    <div style={s.catalogItemBody}>
                      <div style={s.catalogItemTitle}>{item.title}</div>
                      <div style={s.catalogItemDesc}>{item.description}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
