import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

function ContextMenu({ x, y, items, onClose }) {
    const ref = useRef(null)

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) onClose()
        }
        const escHandler = (e) => { if (e.key === 'Escape') onClose() }
        document.addEventListener('mousedown', handler)
        document.addEventListener('keydown', escHandler)
        return () => {
            document.removeEventListener('mousedown', handler)
            document.removeEventListener('keydown', escHandler)
        }
    }, [onClose])

    if (!items || items.length === 0) return null

    return (
        <AnimatePresence>
            <motion.div
                ref={ref}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.1 }}
                style={{
                    position: 'fixed',
                    top: y,
                    left: x,
                    zIndex: 9999,
                    minWidth: '180px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-lg)',
                    padding: '4px',
                    overflow: 'hidden'
                }}
            >
                {items.map((item, idx) => {
                    if (item.divider) {
                        return <div key={idx} style={{
                            height: '1px',
                            background: 'var(--border-color)',
                            margin: '4px 0'
                        }} />
                    }
                    const Icon = item.icon
                    return (
                        <button
                            key={idx}
                            onClick={() => { item.onClick?.(); onClose() }}
                            disabled={item.disabled}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                width: '100%',
                                padding: '10px 12px',
                                borderRadius: 'var(--radius-sm)',
                                color: item.danger ? 'var(--error)' : 'var(--text-secondary)',
                                fontSize: '0.85rem',
                                textAlign: 'left',
                                transition: 'all 0.15s',
                                cursor: item.disabled ? 'not-allowed' : 'pointer',
                                opacity: item.disabled ? 0.5 : 1
                            }}
                            onMouseEnter={e => {
                                if (!item.disabled) {
                                    e.currentTarget.style.background = item.danger
                                        ? 'rgba(239,68,68,0.1)'
                                        : 'rgba(255,255,255,0.05)'
                                    e.currentTarget.style.color = item.danger
                                        ? 'var(--error)'
                                        : 'var(--text-primary)'
                                }
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.background = 'transparent'
                                e.currentTarget.style.color = item.danger ? 'var(--error)' : 'var(--text-secondary)'
                            }}
                        >
                            {Icon && <Icon size={16} />}
                            <span style={{ flex: 1 }}>{item.label}</span>
                            {item.shortcut && (
                                <span style={{
                                    fontSize: '0.7rem',
                                    color: 'var(--text-muted)',
                                    background: 'rgba(255,255,255,0.05)',
                                    padding: '2px 6px',
                                    borderRadius: '4px'
                                }}>
                                    {item.shortcut}
                                </span>
                            )}
                        </button>
                    )
                })}
            </motion.div>
        </AnimatePresence>
    )
}

export default ContextMenu
