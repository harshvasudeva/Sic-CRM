import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'

function Modal({
    isOpen,
    onClose,
    title,
    children,
    size = 'medium',
    showClose = true
}) {
    // Prevent scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => {
            document.body.style.overflow = ''
        }
    }, [isOpen])

    // Handle escape key
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose()
            }
        }
        window.addEventListener('keydown', handleEsc)
        return () => window.removeEventListener('keydown', handleEsc)
    }, [isOpen, onClose])

    const sizeClasses = {
        small: '400px',
        medium: '560px',
        large: '720px',
        xlarge: '900px',
        full: '95vw'
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="modal-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        className="modal-container"
                        style={{ maxWidth: sizeClasses[size] }}
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {title && (
                            <div className="modal-header">
                                <h2 className="modal-title">{title}</h2>
                                {showClose && (
                                    <button className="modal-close" onClick={onClose}>
                                        <X size={20} />
                                    </button>
                                )}
                            </div>
                        )}
                        <div className="modal-body">
                            {children}
                        </div>
                    </motion.div>

                    <style>{`
            .modal-overlay {
              position: fixed;
              inset: 0;
              background: rgba(0, 0, 0, 0.75);
              backdrop-filter: blur(4px);
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 20px;
              z-index: 2000;
            }

            .modal-container {
              width: 100%;
              max-height: 90vh;
              background: var(--bg-secondary);
              border: 1px solid var(--border-color);
              border-radius: var(--radius-xl);
              display: flex;
              flex-direction: column;
              overflow: hidden;
              box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            }

            .modal-header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding: 20px 24px;
              border-bottom: 1px solid var(--border-color);
            }

            .modal-title {
              font-size: 1.15rem;
              font-weight: 600;
            }

            .modal-close {
              width: 36px;
              height: 36px;
              border-radius: 10px;
              background: rgba(255, 255, 255, 0.05);
              display: flex;
              align-items: center;
              justify-content: center;
              color: var(--text-muted);
              transition: all 0.2s;
            }

            .modal-close:hover {
              background: rgba(255, 255, 255, 0.1);
              color: white;
            }

            .modal-body {
              flex: 1;
              overflow-y: auto;
              padding: 24px;
            }
          `}</style>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

// Modal Footer component
export function ModalFooter({ children }) {
    return (
        <div className="modal-footer">
            {children}
            <style>{`
        .modal-footer {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 12px;
          padding: 20px 24px;
          border-top: 1px solid var(--border-color);
          margin: 0 -24px -24px;
        }
      `}</style>
        </div>
    )
}

export default Modal
