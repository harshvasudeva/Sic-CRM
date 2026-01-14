import { motion } from 'framer-motion'
import {
    Inbox,
    FileText,
    Users,
    Package,
    ShoppingCart,
    BarChart3,
    Plus
} from 'lucide-react'

const emptyStateConfig = {
    default: {
        icon: Inbox,
        title: 'No data yet',
        description: 'There\'s nothing here at the moment. Data will appear once you start adding items.'
    },
    orders: {
        icon: ShoppingCart,
        title: 'No orders yet',
        description: 'When customers place orders, they\'ll appear here for you to manage.',
        action: { label: 'Create Order', icon: Plus }
    },
    products: {
        icon: Package,
        title: 'No products yet',
        description: 'Add your first product to start selling and managing inventory.',
        action: { label: 'Add Product', icon: Plus }
    },
    customers: {
        icon: Users,
        title: 'No customers yet',
        description: 'Your customer list is empty. Start by adding your first customer.',
        action: { label: 'Add Customer', icon: Plus }
    },
    reports: {
        icon: BarChart3,
        title: 'No data to display',
        description: 'Reports will be generated once you have enough activity in the system.'
    },
    documents: {
        icon: FileText,
        title: 'No documents',
        description: 'Upload or create documents to see them listed here.',
        action: { label: 'Upload Document', icon: Plus }
    },
    search: {
        icon: Inbox,
        title: 'No results found',
        description: 'Try adjusting your search or filter criteria to find what you\'re looking for.'
    }
}

function EmptyState({ type = 'default', title, description, action, onAction }) {
    const config = emptyStateConfig[type] || emptyStateConfig.default
    const Icon = config.icon
    const displayTitle = title || config.title
    const displayDescription = description || config.description
    const displayAction = action || config.action

    return (
        <motion.div
            className="empty-state"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="empty-state-icon">
                <Icon size={48} />
            </div>
            <h3 className="empty-state-title">{displayTitle}</h3>
            <p className="empty-state-description">{displayDescription}</p>

            {displayAction && onAction && (
                <button className="empty-state-action" onClick={onAction}>
                    {displayAction.icon && <displayAction.icon size={18} />}
                    {displayAction.label}
                </button>
            )}

            <style>{`
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 40px;
          text-align: center;
        }

        .empty-state-icon {
          width: 100px;
          height: 100px;
          border-radius: 24px;
          background: rgba(99, 102, 241, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent-primary);
          margin-bottom: 24px;
        }

        .empty-state-title {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .empty-state-description {
          font-size: 0.95rem;
          color: var(--text-secondary);
          max-width: 360px;
          line-height: 1.5;
          margin-bottom: 24px;
        }

        .empty-state-action {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: var(--accent-gradient);
          border-radius: var(--radius-md);
          color: white;
          font-size: 0.9rem;
          font-weight: 500;
          transition: all 0.2s;
        }

        .empty-state-action:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(99, 102, 241, 0.4);
        }
      `}</style>
        </motion.div>
    )
}

export default EmptyState
