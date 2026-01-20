import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Users, FileText, Database, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef(null)
  const navigate = useNavigate()

  // Toggle with keyboard
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(prev => !prev)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100)
  }, [isOpen])

  useEffect(() => {
    if (query.length < 2) {
      setResults([])
      return
    }

    const timer = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`http://localhost:5000/api/search?q=${query}`)
        const data = await res.json()
        setResults(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query])

  const handleSelect = (link) => {
    setIsOpen(false)
    navigate(link)
  }

  const getIcon = (type) => {
    switch (type) {
      case 'Employee': return <Users size={16} />
      case 'Asset': return <Database size={16} />
      case 'Candidate': return <Users size={16} />
      default: return <FileText size={16} />
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            justifyContent: 'center',
            paddingTop: '15vh'
          }}
          onClick={() => setIsOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 600,
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 12,
              boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              height: 'fit-content',
              maxHeight: '60vh'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16, borderBottom: '1px solid var(--border-color)' }}>
              <Search size={20} style={{ color: 'var(--text-muted)' }} />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search anything... (Employees, Assets, etc.)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  fontSize: '1.1rem',
                  color: 'var(--text-primary)',
                  outline: 'none'
                }}
              />
              <div style={{ fontSize: '0.7rem', padding: '2px 6px', border: '1px solid var(--border-color)', borderRadius: 4, color: 'var(--text-muted)' }}>ESC</div>
            </div>

            <div style={{ overflowY: 'auto', padding: 8 }}>
              {loading && <div style={{ padding: 16, textAlign: 'center', color: 'var(--text-muted)' }}>Searching...</div>}

              {!loading && results.length === 0 && query.length >= 2 && (
                <div style={{ padding: 16, textAlign: 'center', color: 'var(--text-muted)' }}>No results found</div>
              )}

              {results.map((item, i) => (
                <div
                  key={i}
                  onClick={() => handleSelect(item.link)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 12px',
                    borderRadius: 8,
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: 'rgba(255,255,255,0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-secondary)'
                  }}>
                    {getIcon(item.type)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 500, fontSize: '0.95rem' }}>{item.title}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.type} • {item.subtitle}</div>
                  </div>
                  <ArrowRight size={14} style={{ color: 'var(--text-muted)' }} />
                </div>
              ))}
            </div>

            <div style={{ padding: '8px 16px', fontSize: '0.75rem', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.2)', borderTop: '1px solid var(--border-color)' }}>
              Search enabled for CRM & HR Modules
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default GlobalSearch
