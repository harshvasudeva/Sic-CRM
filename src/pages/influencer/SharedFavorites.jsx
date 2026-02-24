import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Heart, Plus, X, Users, Share2, Star, Search } from 'lucide-react'
import { getCreators } from '../../stores/influencerStore'
import { getSharedLists, createSharedList, updateSharedList, deleteSharedList } from '../../stores/teamStore'

const s = {
  page: { padding: '24px', maxWidth: 1200, margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: '1.5rem', fontWeight: 700, color: '#fff' },
  btn: { padding: '8px 16px', borderRadius: 8, background: '#6366f1', color: '#fff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 },
  card: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: 20 },
  cardTitle: { fontSize: '1.1rem', fontWeight: 600, color: '#fff', marginBottom: 8 },
  meta: { fontSize: '0.8rem', color: '#94a3b8', marginBottom: 12 },
  badge: { display: 'inline-block', padding: '2px 8px', borderRadius: 12, fontSize: '0.75rem', background: 'rgba(99,102,241,0.2)', color: '#818cf8', marginRight: 4 },
  creatorChip: { display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 16, background: 'rgba(255,255,255,0.08)', color: '#e2e8f0', fontSize: '0.8rem', margin: '2px' },
  modal: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modalContent: { background: '#1e1e2e', borderRadius: 16, padding: 24, width: 480, maxHeight: '80vh', overflow: 'auto', border: '1px solid rgba(255,255,255,0.1)' },
  input: { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '0.9rem', marginBottom: 12 },
  actions: { display: 'flex', gap: 8, marginTop: 12 }
}

export default function SharedFavorites() {
  const [lists, setLists] = useState([])
  const [creators, setCreators] = useState([])
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [selectedCreators, setSelectedCreators] = useState([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    setLists(getSharedLists())
    setCreators(getCreators())
  }, [])

  const handleCreate = () => {
    if (!newName.trim()) return
    createSharedList({ name: newName, creatorIds: selectedCreators, workspaceId: 'ws-001', createdBy: 'usr-001', createdByName: 'Current User' })
    setLists(getSharedLists())
    setShowCreate(false)
    setNewName('')
    setSelectedCreators([])
  }

  const handleDelete = (id) => {
    deleteSharedList(id)
    setLists(getSharedLists())
  }

  const toggleCreator = (id) => {
    setSelectedCreators(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id])
  }

  const getCreatorName = (id) => creators.find(c => c.id === id)?.name || id
  const filtered = search ? creators.filter(c => c.name.toLowerCase().includes(search.toLowerCase())) : creators

  return (
    <div style={s.page}>
      <motion.div style={s.header} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div>
          <h1 style={s.title}><Heart size={22} style={{ color: '#ec4899', marginRight: 8, verticalAlign: 'middle' }} />Shared Favorites</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: 4 }}>Team-wide curated creator lists</p>
        </div>
        <button style={s.btn} onClick={() => setShowCreate(true)}><Plus size={16} /> New List</button>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[{ label: 'Total Lists', value: lists.length, icon: Heart }, { label: 'Total Creators', value: lists.reduce((s, l) => s + (l.creatorIds?.length || 0), 0), icon: Users }, { label: 'Shared With Team', value: lists.filter(l => l.sharedWith?.length > 0).length, icon: Share2 }].map((stat, i) => (
          <motion.div key={i} style={s.card} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <stat.icon size={18} style={{ color: '#6366f1', marginBottom: 8 }} />
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff' }}>{stat.value}</div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <div style={s.grid}>
        {lists.map((list, i) => (
          <motion.div key={list.id} style={s.card} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div style={s.cardTitle}><Star size={16} style={{ color: '#f59e0b', marginRight: 6 }} />{list.name}</div>
              <button onClick={() => handleDelete(list.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><X size={14} /></button>
            </div>
            <div style={s.meta}>Created by {list.createdByName || 'Unknown'} on {list.createdAt}</div>
            <div style={s.meta}>{list.creatorIds?.length || 0} creators | Shared with {list.sharedWith?.length || 0} members</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
              {(list.creatorIds || []).map(id => (
                <span key={id} style={s.creatorChip}>{getCreatorName(id)}</span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {showCreate && (
        <div style={s.modal} onClick={() => setShowCreate(false)}>
          <motion.div style={s.modalContent} onClick={e => e.stopPropagation()} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
            <h3 style={{ color: '#fff', marginBottom: 16 }}>Create Shared List</h3>
            <input style={s.input} placeholder="List name..." value={newName} onChange={e => setNewName(e.target.value)} />
            <div style={{ position: 'relative', marginBottom: 12 }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
              <input style={{ ...s.input, paddingLeft: 36 }} placeholder="Search creators..." value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            <div style={{ maxHeight: 200, overflow: 'auto' }}>
              {filtered.map(c => (
                <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', color: '#e2e8f0', fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={selectedCreators.includes(c.id)} onChange={() => toggleCreator(c.id)} />
                  {c.name} <span style={{ color: '#94a3b8' }}>({c.platform})</span>
                </label>
              ))}
            </div>
            <div style={s.actions}>
              <button style={s.btn} onClick={handleCreate}>Create List</button>
              <button style={{ ...s.btn, background: 'rgba(255,255,255,0.1)' }} onClick={() => setShowCreate(false)}>Cancel</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
