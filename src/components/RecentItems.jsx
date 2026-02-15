import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, FileText, Users, Package, ShoppingCart, X } from 'lucide-react'
import { getRecentItems } from '../stores/settingsStore'

const typeIcons = {
    lead: Users,
    contact: Users,
    deal: ShoppingCart,
    invoice: FileText,
    product: Package,
    order: ShoppingCart,
    default: FileText
}

function RecentItems() {
    const [isOpen, setIsOpen] = useState(false)
    const navigate = useNavigate()
    const ref = useRef(null)
    const recent = getRecentItems()

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setIsOpen(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    if (recent.length === 0) return null

    return (
        <div ref={ref} style={{ position: 'relative' }}>
            <button
                className="header-btn"
                onClick={() => setIsOpen(!isOpen)}
                title="Recent Items"
            >
                <Clock size={20} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        style={{
                            position: 'absolute',
                            top: 'calc(100% + 8px)',
                            right: 0,
                            width: '320px',
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border-color)',
                            borderRadius: 'var(--radius-lg)',
                            boxShadow: 'var(--shadow-lg)',
                            zIndex: 100,
                            overflow: 'hidden'
                        }}
                    >
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '14px 16px',
                            borderBottom: '1px solid var(--border-color)'
                        }}>
                            <h3 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Recent Items</h3>
                            <button onClick={() => setIsOpen(false)} style={{ color: 'var(--text-muted)', padding: '2px' }}>
                                <X size={16} />
                            </button>
                        </div>
                        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            {recent.slice(0, 8).map((item, idx) => {
                                const Icon = typeIcons[item.type] || typeIcons.default
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => { navigate(item.path); setIsOpen(false) }}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            padding: '12px 16px',
                                            width: '100%',
                                            textAlign: 'left',
                                            borderBottom: '1px solid var(--border-color)',
                                            transition: 'background 0.15s',
                                            cursor: 'pointer'
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '8px',
                                            background: 'rgba(99,102,241,0.15)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'var(--accent-primary)',
                                            flexShrink: 0
                                        }}>
                                            <Icon size={16} />
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{
                                                fontSize: '0.85rem',
                                                fontWeight: 500,
                                                color: 'var(--text-primary)',
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap'
                                            }}>
                                                {item.title}
                                            </div>
                                            {item.subtitle && (
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                                    {item.subtitle}
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                )
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default RecentItems
