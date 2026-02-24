import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Bookmark, Plus, Play, Edit3, Trash2, Star, Search } from 'lucide-react'

const STORAGE_KEY = 'sic-search-presets'

const initialPresets = [
  { id: 'sp-1', name: 'Beauty Micro-Influencers Mumbai', filters: { niche: 'Lifestyle', city: 'Mumbai', tier: 'micro', platform: 'Instagram' }, isDefault: true, usageCount: 12, lastUsed: '2026-02-20' },
  { id: 'sp-2', name: 'Tech YouTube Creators', filters: { niche: 'Tech', platform: 'YouTube', tier: 'macro' }, isDefault: false, usageCount: 8, lastUsed: '2026-02-18' },
  { id: 'sp-3', name: 'High Engagement Food Bloggers', filters: { niche: 'Food', minEngagement: '5%', status: 'Closed' }, isDefault: false, usageCount: 5, lastUsed: '2026-02-15' }
]

const s = {
  page: { padding: '24px', maxWidth: 1000, margin: '0 auto' },
  title: { fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: 20 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  btn: { padding: '8px 16px', borderRadius: 8, background: '#6366f1', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' },
  grid: { display: 'grid', gap: 12 },
  card: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 16, display: 'flex', alignItems: 'center', gap: 16 },
  chip: { padding: '3px 10px', borderRadius: 12, fontSize: '0.75rem', background: 'rgba(99,102,241,0.15)', color: '#818cf8', display: 'inline-block', margin: '2px' },
  modal: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalContent: { background: '#1e1e2e', borderRadius: 16, padding: 24, width: 420, border: '1px solid rgba(255,255,255,0.1)' },
  input: { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '0.9rem', marginBottom: 12 }
}

function getPresets() {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) return JSON.parse(stored)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(initialPresets))
  return initialPresets
}

export default function SavedSearchPresets() {
  const [presets, setPresets] = useState([])
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [editId, setEditId] = useState(null)

  useEffect(() => { setPresets(getPresets()) }, [])

  const save = (data) => { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); setPresets(data) }

  const handleCreate = () => {
    if (!newName.trim()) return
    const updated = [...presets, { id: `sp-${Date.now()}`, name: newName, filters: { niche: 'All', platform: 'All' }, isDefault: false, usageCount: 0, lastUsed: null }]
    save(updated)
    setShowCreate(false)
    setNewName('')
  }

  const handleDelete = (id) => save(presets.filter(p => p.id !== id))
  const toggleDefault = (id) => save(presets.map(p => ({ ...p, isDefault: p.id === id ? !p.isDefault : false })))
  const applyPreset = (id) => {
    save(presets.map(p => p.id === id ? { ...p, usageCount: p.usageCount + 1, lastUsed: new Date().toISOString().split('T')[0] } : p))
  }

  return (
    <div style={s.page}>
      <motion.div style={s.header} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div>
          <h1 style={s.title}><Bookmark size={22} style={{ color: '#6366f1', marginRight: 8, verticalAlign: 'middle' }} />Saved Search Presets</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: -12 }}>Save and reuse your favorite filter combinations</p>
        </div>
        <button style={s.btn} onClick={() => setShowCreate(true)}><Plus size={16} /> Save Current Search</button>
      </motion.div>

      <div style={s.grid}>
        {presets.map((preset, i) => (
          <motion.div key={preset.id} style={s.card} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem' }}>{preset.name}</span>
                {preset.isDefault && <span style={{ ...s.chip, background: 'rgba(245,158,11,0.2)', color: '#fbbf24' }}><Star size={10} /> Default</span>}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2, marginBottom: 6 }}>
                {Object.entries(preset.filters).map(([key, val]) => (
                  <span key={key} style={s.chip}>{key}: {val}</span>
                ))}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                Used {preset.usageCount} times {preset.lastUsed ? `| Last: ${preset.lastUsed}` : ''}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={() => applyPreset(preset.id)} style={{ ...s.btn, padding: '6px 12px' }}><Play size={14} /> Apply</button>
              <button onClick={() => toggleDefault(preset.id)} style={{ background: 'none', border: 'none', color: preset.isDefault ? '#fbbf24' : '#94a3b8', cursor: 'pointer' }}><Star size={16} /></button>
              <button onClick={() => handleDelete(preset.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
            </div>
          </motion.div>
        ))}
      </div>

      {presets.length === 0 && <div style={{ textAlign: 'center', color: '#94a3b8', padding: 40 }}>No saved presets. Create one to get started!</div>}

      {showCreate && (
        <div style={s.modal} onClick={() => setShowCreate(false)}>
          <motion.div style={s.modalContent} onClick={e => e.stopPropagation()} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <h3 style={{ color: '#fff', marginBottom: 16 }}>Save Search Preset</h3>
            <input style={s.input} placeholder="Preset name..." value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCreate()} autoFocus />
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={s.btn} onClick={handleCreate}>Save Preset</button>
              <button style={{ ...s.btn, background: 'rgba(255,255,255,0.1)' }} onClick={() => setShowCreate(false)}>Cancel</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
