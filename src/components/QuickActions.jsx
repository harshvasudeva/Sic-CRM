import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  X,
  FileText,
  Users,
  Package,
  ShoppingCart,
  Receipt,
  UserPlus
} from 'lucide-react'

const actions = [
  { icon: FileText, label: 'New Quote', color: '#6366f1', path: '/sales/quotations?action=create' },
  { icon: ShoppingCart, label: 'New Order', color: '#3b82f6', path: '/sales/orders?action=create' },
  { icon: Receipt, label: 'New Invoice', color: '#10b981', path: '/sales/invoices?action=create' },
  { icon: Package, label: 'Add Product', color: '#f59e0b', path: '/products?action=create' },
  { icon: Users, label: 'New Lead', color: '#ec4899', path: '/crm/leads?action=create' },
  { icon: UserPlus, label: 'Add Employee', color: '#8b5cf6', path: '/hr/employees?action=create' },
]

function QuickActions() {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()

  const handleActionClick = (path) => {
    setIsOpen(false)
    navigate(path)
  }

  return (
    <div className="quick-actions">
      {/* Action Buttons */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="quick-actions-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            {/* Action Items */}
            <div className="quick-actions-menu">
              {actions.map((action, index) => (
                <motion.button
                  key={index}
                  className="quick-action-item"
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.8 }}
                  transition={{ delay: (actions.length - 1 - index) * 0.05 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleActionClick(action.path)}
                >
                  <span className="quick-action-label">{action.label}</span>
                  <div
                    className="quick-action-icon"
                    style={{ background: action.color }}
                  >
                    <action.icon size={20} />
                  </div>
                </motion.button>
              ))}
            </div>
          </>
        )}
      </AnimatePresence>

      {/* FAB Button */}
      <motion.button
        className="fab-button"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{ rotate: isOpen ? 45 : 0 }}
      >
        {isOpen ? <X size={24} /> : <Plus size={24} />}
      </motion.button>

      <style>{`
        .quick-actions {
          position: fixed;
          bottom: 32px;
          right: 32px;
          z-index: 1000;
        }

        .quick-actions-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
        }

        .quick-actions-menu {
          position: absolute;
          bottom: 70px;
          right: 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .quick-action-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 8px 8px 16px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 30px;
          white-space: nowrap;
          transition: all 0.2s;
        }

        .quick-action-item:hover {
          border-color: var(--accent-primary);
        }

        .quick-action-label {
          font-size: 0.9rem;
          color: var(--text-primary);
          font-weight: 500;
        }

        .quick-action-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .fab-button {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: var(--accent-gradient);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);
          position: relative;
          z-index: 10;
        }

        @media (max-width: 768px) {
          .quick-actions {
            bottom: 20px;
            right: 20px;
          }
        }
      `}</style>
    </div>
  )
}

export default QuickActions
