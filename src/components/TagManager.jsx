/**
 * TagManager - Polymorphic tag management component.
 * @param {Array<{id,name,color}>} tags - Current tags
 * @param {Function} onTagsChange - Callback with updated tags array
 * @param {Array<{id,name,color}>} availableTags - All available tags for autocomplete
 * @param {boolean} readOnly - Disable editing
 */
import { useState, useMemo, useRef, useCallback } from 'react'
import { X, Plus, Tag } from 'lucide-react'

const PRESET_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function TagManager({ tags = [], onTagsChange, availableTags = [], readOnly = false }) {
  const [search, setSearch] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [newColor, setNewColor] = useState(PRESET_COLORS[0])
  const inputRef = useRef(null)

  const suggestions = useMemo(() => {
    const tagIds = new Set(tags.map(t => t.id))
    return availableTags.filter(t => !tagIds.has(t.id) && t.name.toLowerCase().includes(search.toLowerCase()))
  }, [availableTags, tags, search])

  const removeTag = useCallback((tagId) => {
    onTagsChange?.(tags.filter(t => t.id !== tagId))
  }, [tags, onTagsChange])

  const addTag = useCallback((tag) => {
    onTagsChange?.([...tags, tag])
    setSearch('')
    setShowDropdown(false)
  }, [tags, onTagsChange])

  const createTag = useCallback(() => {
    if (!search.trim()) return
    const tag = { id: `tag-${Date.now()}`, name: search.trim(), color: newColor }
    addTag(tag)
    setShowCreate(false)
  }, [search, newColor, addTag])

  const s = {
    container: { display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center' },
    pill: (color) => ({
      display: 'inline-flex', alignItems: 'center', gap: 3, padding: '2px 8px', borderRadius: 10,
      fontSize: 11, fontWeight: 500, background: (color || '#6366f1') + '20', color: color || '#6366f1',
      border: `1px solid ${(color || '#6366f1')}40`,
    }),
    removeBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: 'inherit', opacity: 0.6 },
    addWrap: { position: 'relative' },
    addBtn: { display: 'flex', alignItems: 'center', gap: 2, padding: '2px 6px', borderRadius: 10, border: '1px dashed var(--border)', background: 'none', color: 'var(--text-secondary)', fontSize: 11, cursor: 'pointer' },
    input: { width: 100, background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 4, color: 'var(--text-primary)', padding: '3px 6px', fontSize: 11, outline: 'none' },
    dropdown: { position: 'absolute', top: '100%', left: 0, marginTop: 4, background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 6, minWidth: 160, maxHeight: 150, overflowY: 'auto', zIndex: 50, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' },
    option: { padding: '5px 8px', fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-primary)' },
    colorRow: { display: 'flex', gap: 4, padding: '4px 8px', borderTop: '1px solid var(--border)' },
    colorDot: (c, sel) => ({ width: 16, height: 16, borderRadius: '50%', background: c, cursor: 'pointer', border: sel ? '2px solid #fff' : '2px solid transparent', boxShadow: sel ? '0 0 0 1px var(--accent)' : 'none' }),
    createBtn: { width: '100%', padding: '5px 8px', border: 'none', background: 'var(--accent)', color: '#fff', fontSize: 11, cursor: 'pointer', borderRadius: '0 0 5px 5px' },
  }

  return (
    <div style={s.container}>
      {tags.map(tag => (
        <span key={tag.id} style={s.pill(tag.color)}>
          <Tag size={10} /> {tag.name}
          {!readOnly && <button style={s.removeBtn} onClick={() => removeTag(tag.id)}><X size={10} /></button>}
        </span>
      ))}
      {!readOnly && (
        <div style={s.addWrap}>
          {!showDropdown ? (
            <button style={s.addBtn} onClick={() => { setShowDropdown(true); setTimeout(() => inputRef.current?.focus(), 50) }}><Plus size={10} /> Tag</button>
          ) : (
            <>
              <input ref={inputRef} style={s.input} value={search} onChange={e => setSearch(e.target.value)} onBlur={() => setTimeout(() => setShowDropdown(false), 200)} placeholder="Search tags..." onKeyDown={e => { if (e.key === 'Enter') { suggestions.length ? addTag(suggestions[0]) : setShowCreate(true) } if (e.key === 'Escape') setShowDropdown(false) }} />
              <div style={s.dropdown}>
                {suggestions.slice(0, 8).map(tag => (
                  <div key={tag.id} style={s.option} onMouseDown={() => addTag(tag)}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: tag.color || '#6366f1' }} /> {tag.name}
                  </div>
                ))}
                {suggestions.length === 0 && search.trim() && (
                  <>
                    <div style={{ ...s.option, color: 'var(--text-secondary)' }}>Create "{search}"</div>
                    <div style={s.colorRow}>
                      {PRESET_COLORS.map(c => <div key={c} style={s.colorDot(c, c === newColor)} onMouseDown={() => setNewColor(c)} />)}
                    </div>
                    <button style={s.createBtn} onMouseDown={createTag}>Create Tag</button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
