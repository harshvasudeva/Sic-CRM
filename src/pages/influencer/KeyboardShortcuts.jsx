import { useState } from 'react'
import { motion } from 'framer-motion'
import { Keyboard, Search, Navigation, Zap, Target, Printer } from 'lucide-react'

const shortcuts = {
  Navigation: [
    { keys: ['G', 'D'], desc: 'Go to Dashboard' },
    { keys: ['G', 'C'], desc: 'Go to Creator Database' },
    { keys: ['G', 'A'], desc: 'Go to Analytics' },
    { keys: ['G', 'M'], desc: 'Go to Campaigns' },
    { keys: ['G', 'O'], desc: 'Go to Outreach' },
    { keys: ['G', 'S'], desc: 'Go to Settings' }
  ],
  Actions: [
    { keys: ['N'], desc: 'Create New Item' },
    { keys: ['E'], desc: 'Edit Selected' },
    { keys: ['D'], desc: 'Delete Selected' },
    { keys: ['S'], desc: 'Save Current' },
    { keys: ['Ctrl', 'Z'], desc: 'Undo' },
    { keys: ['Ctrl', 'Shift', 'Z'], desc: 'Redo' }
  ],
  Search: [
    { keys: ['/'], desc: 'Focus Search Bar' },
    { keys: ['Ctrl', 'K'], desc: 'Command Palette' },
    { keys: ['Esc'], desc: 'Close Search / Modal' },
    { keys: ['Enter'], desc: 'Apply Search' },
    { keys: ['Tab'], desc: 'Next Search Filter' }
  ],
  Campaign: [
    { keys: ['C', 'N'], desc: 'New Campaign' },
    { keys: ['C', 'B'], desc: 'Campaign Builder' },
    { keys: ['C', 'T'], desc: 'Campaign Templates' },
    { keys: ['C', 'R'], desc: 'Campaign Reports' }
  ],
  Creator: [
    { keys: ['F'], desc: 'Add to Favorites' },
    { keys: ['W'], desc: 'Add to Watchlist' },
    { keys: ['P'], desc: 'View Profile' },
    { keys: ['R'], desc: 'Start Outreach' },
    { keys: ['T'], desc: 'Add Tag' }
  ]
}

const categoryIcons = { Navigation, Actions: Zap, Search, Campaign: Target, Creator: Target }

const s = {
  page: { padding: '24px', maxWidth: 900, margin: '0 auto' },
  title: { fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: 4 },
  search: { width: '100%', padding: '10px 14px 10px 36px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: '#fff', fontSize: '0.9rem', marginBottom: 24 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: '1rem', fontWeight: 600, color: '#fff', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 },
  card: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, overflow: 'hidden' },
  row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)' },
  keys: { display: 'flex', gap: 4 },
  key: { padding: '4px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', fontSize: '0.8rem', fontFamily: 'monospace', fontWeight: 600, minWidth: 28, textAlign: 'center' },
  desc: { color: '#94a3b8', fontSize: '0.85rem' },
  plus: { color: '#64748b', fontSize: '0.75rem', margin: '0 2px' },
  printBtn: { padding: '8px 16px', borderRadius: 8, background: 'rgba(255,255,255,0.1)', color: '#e2e8f0', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem' }
}

export default function KeyboardShortcuts() {
  const [search, setSearch] = useState('')

  const filtered = {}
  Object.entries(shortcuts).forEach(([cat, items]) => {
    const f = search ? items.filter(i => i.desc.toLowerCase().includes(search.toLowerCase()) || i.keys.join(' ').toLowerCase().includes(search.toLowerCase())) : items
    if (f.length > 0) filtered[cat] = f
  })

  return (
    <div style={s.page}>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 20 }}>
          <div>
            <h1 style={s.title}><Keyboard size={22} style={{ color: '#6366f1', marginRight: 8, verticalAlign: 'middle' }} />Keyboard Shortcuts</h1>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Power-user navigation shortcuts. Press <span style={{ ...s.key, display: 'inline', padding: '2px 6px', fontSize: '0.7rem' }}>?</span> anywhere to open this page.</p>
          </div>
          <button style={s.printBtn} onClick={() => window.print()}><Printer size={14} /> Print</button>
        </div>
      </motion.div>

      <div style={{ position: 'relative', marginBottom: 24 }}>
        <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: '#94a3b8' }} />
        <input style={s.search} placeholder="Search shortcuts..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {Object.entries(filtered).map(([category, items], ci) => {
        const Icon = categoryIcons[category] || Keyboard
        return (
          <motion.div key={category} style={s.section} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: ci * 0.1 }}>
            <div style={s.sectionTitle}><Icon size={16} style={{ color: '#6366f1' }} />{category}</div>
            <div style={s.card}>
              {items.map((item, i) => (
                <div key={i} style={{ ...s.row, borderBottom: i < items.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                  <span style={s.desc}>{item.desc}</span>
                  <div style={s.keys}>
                    {item.keys.map((key, ki) => (
                      <span key={ki} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        {ki > 0 && <span style={s.plus}>+</span>}
                        <span style={s.key}>{key}</span>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )
      })}

      {Object.keys(filtered).length === 0 && <div style={{ textAlign: 'center', color: '#94a3b8', padding: 40 }}>No shortcuts match your search</div>}

      <motion.div style={{ ...s.card, padding: 16, marginTop: 24, background: 'rgba(99,102,241,0.1)', borderColor: 'rgba(99,102,241,0.2)' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
        <div style={{ color: '#818cf8', fontSize: '0.85rem' }}>
          <strong>Pro tip:</strong> Chord shortcuts (like G then D) require pressing keys in sequence, not simultaneously. Press the first key, release, then press the second key within 500ms.
        </div>
      </motion.div>
    </div>
  )
}
