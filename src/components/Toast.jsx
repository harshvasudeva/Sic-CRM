import { createContext, useContext, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, X, AlertCircle, Info } from 'lucide-react'

const ToastContext = createContext(null)

const toastTypes = {
    success: { icon: Check, color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' },
    error: { icon: X, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' },
    warning: { icon: AlertCircle, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' },
    info: { icon: Info, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)' }
}

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([])

    const addToast = useCallback((message, type = 'info', duration = 4000) => {
        const id = Date.now()
        setToasts(prev => [...prev, { id, message, type }])

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
        success: (msg, duration) => addToast(msg, 'success', duration),
        error: (msg, duration) => addToast(msg, 'error', duration),
        warning: (msg, duration) => addToast(msg, 'warning', duration),
        info: (msg, duration) => addToast(msg, 'info', duration),
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
          max-width: 400px;
        }

        .toast-icon {
          flex-shrink: 0;
        }

        .toast-message {
          flex: 1;
          font-size: 0.9rem;
          color: var(--text-primary);
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
