import { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  LayoutDashboard,
  ShoppingCart,
  Package,
  Truck,
  Calculator,
  Users,
  UserCircle,
  Factory,
  Sparkles,
  Settings,
  FileText,
  HelpCircle,
  Plus,
  ArrowRight,
  Command,
  BarChart3
} from 'lucide-react'

const commands = [
  // Navigation
  { id: 'nav-dashboard', type: 'navigation', icon: LayoutDashboard, label: 'Go to Dashboard', path: '/' },
  { id: 'nav-sales', type: 'navigation', icon: ShoppingCart, label: 'Go to Sales', path: '/sales' },
  { id: 'nav-products', type: 'navigation', icon: Package, label: 'Go to Products', path: '/products' },
  { id: 'nav-purchase', type: 'navigation', icon: Truck, label: 'Go to Purchase', path: '/purchase' },
  { id: 'nav-accounting', type: 'navigation', icon: Calculator, label: 'Go to Accounting', path: '/accounting' },
  { id: 'nav-crm', type: 'navigation', icon: Users, label: 'Go to CRM', path: '/crm' },
  { id: 'nav-hr', type: 'navigation', icon: UserCircle, label: 'Go to HR', path: '/hr' },
  { id: 'nav-manufacturing', type: 'navigation', icon: Factory, label: 'Go to Manufacturing', path: '/manufacturing' },
  { id: 'nav-specialized', type: 'navigation', icon: Sparkles, label: 'Go to Specialized', path: '/specialized' },
  { id: 'nav-reports', type: 'navigation', icon: BarChart3, label: 'Go to Reports', path: '/reports' },
  { id: 'nav-settings', type: 'navigation', icon: Settings, label: 'Go to Settings', path: '/settings' },

  // Actions
  { id: 'action-quote', type: 'action', icon: FileText, label: 'Create New Quote', action: 'new-quote' },
  { id: 'action-order', type: 'action', icon: ShoppingCart, label: 'Create New Order', action: 'new-order' },
  { id: 'action-product', type: 'action', icon: Package, label: 'Add New Product', action: 'new-product' },
  { id: 'action-lead', type: 'action', icon: Users, label: 'Create New Lead', action: 'new-lead' },
  { id: 'action-employee', type: 'action', icon: UserCircle, label: 'Add New Employee', action: 'new-employee' },

  // Utilities
  { id: 'util-help', type: 'utility', icon: HelpCircle, label: 'Open Help', action: 'help' },
]

function CommandPalette({ isOpen, onClose, onHelp }) {
  const navigate = useNavigate()
  const inputRef = useRef(null)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Filter commands based on query
  const filteredCommands = useMemo(() => {
    if (!query) return commands
    const lowerQuery = query.toLowerCase()
    return commands.filter(cmd =>
      cmd.label.toLowerCase().includes(lowerQuery) ||
      cmd.type.toLowerCase().includes(lowerQuery)
    )
  }, [query])

  // Reset selection when filtered results change
  useEffect(() => {
    setSelectedIndex(0)
  }, [filteredCommands])

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
    if (!isOpen) {
      setQuery('')
      setSelectedIndex(0)
    }
  }, [isOpen])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex(i => Math.min(i + 1, filteredCommands.length - 1))
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex(i => Math.max(i - 1, 0))
          break
        case 'Enter':
          e.preventDefault()
          if (filteredCommands[selectedIndex]) {
            executeCommand(filteredCommands[selectedIndex])
          }
          break
        case 'Escape':
          e.preventDefault()
          onClose()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, selectedIndex, filteredCommands, onClose])

  const executeCommand = (command) => {
    if (command.type === 'navigation') {
      navigate(command.path)
    } else if (command.action === 'help' && onHelp) {
      onHelp()
    }
    onClose()
  }

  const getTypeLabel = (type) => {
    switch (type) {
      case 'navigation': return 'Navigate'
      case 'action': return 'Action'
      case 'utility': return 'Utility'
      default: return type
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="command-palette-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="command-palette"
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input */}
            <div className="command-input-wrapper">
              <Search size={20} className="command-search-icon" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Type a command or search..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="command-input"
              />
              <div className="command-kbd">
                <kbd>Esc</kbd>
              </div>
            </div>

            {/* Results */}
            <div className="command-results">
              {filteredCommands.length === 0 ? (
                <div className="command-empty">
                  <span>No results found for "{query}"</span>
                </div>
              ) : (
                filteredCommands.map((command, index) => (
                  <motion.button
                    key={command.id}
                    className={`command-item ${index === selectedIndex ? 'selected' : ''}`}
                    onClick={() => executeCommand(command)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.02 }}
                  >
                    <div className="command-item-left">
                      <div className="command-item-icon">
                        <command.icon size={18} />
                      </div>
                      <span className="command-item-label">{command.label}</span>
                    </div>
                    <div className="command-item-right">
                      <span className="command-item-type">{getTypeLabel(command.type)}</span>
                      <ArrowRight size={16} className="command-item-arrow" />
                    </div>
                  </motion.button>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="command-footer">
              <div className="command-hint">
                <kbd>↑</kbd><kbd>↓</kbd> navigate
              </div>
              <div className="command-hint">
                <kbd>↵</kbd> select
              </div>
              <div className="command-hint">
                <kbd>Esc</kbd> close
              </div>
            </div>
          </motion.div>

          <style>{`
            .command-palette-overlay {
              position: fixed;
              inset: 0;
              background: rgba(0, 0, 0, 0.7);
              backdrop-filter: blur(8px);
              display: flex;
              align-items: flex-start;
              justify-content: center;
              padding-top: 120px;
              z-index: 3000;
            }

            .command-palette {
              width: 100%;
              max-width: 600px;
              background: var(--bg-secondary);
              border: 1px solid var(--border-color);
              border-radius: var(--radius-xl);
              box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
              overflow: hidden;
            }

            .command-input-wrapper {
              display: flex;
              align-items: center;
              gap: 12px;
              padding: 16px 20px;
              border-bottom: 1px solid var(--border-color);
            }

            .command-search-icon {
              color: var(--text-muted);
              flex-shrink: 0;
            }

            .command-input {
              flex: 1;
              background: transparent;
              border: none;
              color: var(--text-primary);
              font-size: 1.1rem;
            }

            .command-input:focus {
              outline: none;
            }

            .command-input::placeholder {
              color: var(--text-muted);
            }

            .command-kbd kbd {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              min-width: 24px;
              height: 24px;
              padding: 0 8px;
              background: var(--bg-tertiary);
              border: 1px solid var(--border-color);
              border-radius: 6px;
              font-size: 0.75rem;
              color: var(--text-muted);
            }

            .command-results {
              max-height: 400px;
              overflow-y: auto;
              padding: 8px;
            }

            .command-empty {
              padding: 40px 20px;
              text-align: center;
              color: var(--text-muted);
            }

            .command-item {
              display: flex;
              align-items: center;
              justify-content: space-between;
              width: 100%;
              padding: 12px 16px;
              border-radius: var(--radius-md);
              text-align: left;
              transition: all 0.15s;
            }

            .command-item:hover,
            .command-item.selected {
              background: rgba(99, 102, 241, 0.15);
            }

            .command-item-left {
              display: flex;
              align-items: center;
              gap: 12px;
            }

            .command-item-icon {
              width: 36px;
              height: 36px;
              border-radius: 10px;
              background: rgba(255, 255, 255, 0.05);
              display: flex;
              align-items: center;
              justify-content: center;
              color: var(--accent-primary);
            }

            .command-item.selected .command-item-icon {
              background: var(--accent-gradient);
              color: white;
            }

            .command-item-label {
              font-size: 0.95rem;
              color: var(--text-primary);
            }

            .command-item-right {
              display: flex;
              align-items: center;
              gap: 12px;
            }

            .command-item-type {
              font-size: 0.75rem;
              color: var(--text-muted);
              text-transform: uppercase;
              letter-spacing: 0.05em;
            }

            .command-item-arrow {
              color: var(--text-muted);
              opacity: 0;
              transition: opacity 0.15s;
            }

            .command-item.selected .command-item-arrow {
              opacity: 1;
              color: var(--accent-primary);
            }

            .command-footer {
              display: flex;
              align-items: center;
              justify-content: center;
              gap: 24px;
              padding: 12px 20px;
              border-top: 1px solid var(--border-color);
              background: rgba(0, 0, 0, 0.2);
            }

            .command-hint {
              display: flex;
              align-items: center;
              gap: 6px;
              font-size: 0.75rem;
              color: var(--text-muted);
            }

            .command-hint kbd {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              min-width: 20px;
              height: 20px;
              padding: 0 6px;
              background: var(--bg-tertiary);
              border: 1px solid var(--border-color);
              border-radius: 4px;
              font-size: 0.7rem;
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default CommandPalette
