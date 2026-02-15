import { createContext, useContext, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, AlertCircle, Info, Undo2 } from 'lucide-react'

const ToastContext = createContext(null)

const toastTypes = {
    success: { icon: Check, color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' },
    error: { icon: X, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' },
    warning: { icon: AlertCircle, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
    info: { icon: Info, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)' }
}

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([])

    const addToast = useCallback((message, type = 'info', duration = 4000, options = {}) => {
        const id = Date.now() + Math.random()
        setToasts(prev => [...prev, { id, message, type, ...options }])

        if (duration > 0) {
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id))
            }, duration)
        }

        return id
    }, [])

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id))
    }, [])

    const toast = {
        success: (msg, duration, options) => addToast(msg, 'success', duration, options),
        error: (msg, duration, options) => addToast(msg, 'error', duration, options),
        warning: (msg, duration, options) => addToast(msg, 'warning', duration, options),
        info: (msg, duration, options) => addToast(msg, 'info', duration, options),
        // Toast with undo - shows an Undo button for 5 seconds
        undo: (msg, undoFn, duration = 5000) => addToast(msg, 'info', duration, { undoFn }),
        remove: removeToast
    }

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <div className="toast-container">
                <AnimatePresence>
                    {toasts.map(t => {
                        const config = toastTypes[t.type]
                        const Icon = config.icon
                        return (
                            <motion.div
                                key={t.id}
                                className="toast"
                                style={{ background: config.bg, borderColor: config.color }}
                                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, x: 100 }}
                            >
                                <div className="toast-icon" style={{ color: config.color }}>
                                    <Icon size={18} />
                                </div>
                                <span className="toast-message">{t.message}</span>
                                {t.undoFn && (
                                    <button
                                        className="toast-undo"
                                        onClick={() => { t.undoFn(); removeToast(t.id) }}
                                    >
                                        <Undo2 size={14} />
                                        Undo
                                    </button>
                                )}
                                <button className="toast-close" onClick={() => removeToast(t.id)}>
                                    <X size={16} />
                                </button>
                            </motion.div>
                        )
                    })}
                </AnimatePresence>
            </div>

            <style>{`
        .toast-container {
          position: fixed;
          bottom: 24px;
          right: 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          z-index: 5000;
          pointer-events: none;
        }

        .toast {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          background: var(--bg-secondary);
          border: 1px solid;
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-lg);
          pointer-events: auto;
          min-width: 300px;
          max-width: 420px;
        }

        .toast-icon {
          flex-shrink: 0;
        }

        .toast-message {
          flex: 1;
          font-size: 0.9rem;
          color: var(--text-primary);
        }

        .toast-undo {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          background: rgba(99, 102, 241, 0.2);
          border: 1px solid rgba(99, 102, 241, 0.3);
          border-radius: 6px;
          color: var(--accent-primary);
          font-size: 0.8rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
          flex-shrink: 0;
        }

        .toast-undo:hover {
          background: rgba(99, 102, 241, 0.3);
        }

        .toast-close {
          flex-shrink: 0;
          padding: 4px;
          color: var(--text-muted);
          transition: color 0.2s;
        }

        .toast-close:hover {
          color: var(--text-primary);
        }
      `}</style>
        </ToastContext.Provider>
    )
}

export function useToast() {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider')
    }
    return context
}
