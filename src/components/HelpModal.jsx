import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    X,
    Sparkles,
    ShoppingCart,
    Package,
    Truck,
    Calculator,
    Users,
    UserCircle,
    Factory,
    Keyboard,
    BookOpen,
    Layers,
    Zap,
    HelpCircle,
    ChevronRight
} from 'lucide-react'

const tabs = [
    { id: 'overview', label: 'Overview', icon: BookOpen },
    { id: 'modules', label: 'Modules', icon: Layers },
    { id: 'shortcuts', label: 'Shortcuts', icon: Keyboard },
]

const modules = [
    {
        icon: ShoppingCart,
        title: 'Sales',
        description: 'Manage quotations, orders, invoices, and payments',
        features: ['Quotation Templates', 'Invoicing Policies', 'Sales Teams', 'Analytics']
    },
    {
        icon: Package,
        title: 'Products',
        description: 'Product types, variants, pricing, and loyalty programs',
        features: ['Goods/Services/Combos', 'Attributes & Variants', 'Price Lists', 'Gift Cards']
    },
    {
        icon: Truck,
        title: 'Purchase',
        description: 'RFQs, purchase orders, and vendor management',
        features: ['Bill Matching', 'Three-Way Matching', 'Drop Shipping', 'Vendor Bills']
    },
    {
        icon: Calculator,
        title: 'Accounting',
        description: 'Full-featured accounting with real-time dashboards',
        features: ['Journal Entries', 'Asset Management', 'Reporting Suite', 'Localization']
    },
    {
        icon: Users,
        title: 'CRM',
        description: 'Lead and opportunity management with pipeline views',
        features: ['Pipeline Stages', 'Lead Scoring', 'Map View', 'Lost Reasons']
    },
    {
        icon: UserCircle,
        title: 'HR & Employees',
        description: 'Complete HR management with org charts and skills',
        features: ['Employee Profiles', 'Contracts', 'Skill Tracking', 'Work Locations']
    },
    {
        icon: Factory,
        title: 'Manufacturing',
        description: 'MRP and inventory management',
        features: ['Bill of Materials', 'Work Centers', 'Stock Moves', 'Routes']
    },
    {
        icon: Sparkles,
        title: 'Specialized',
        description: 'POS, Communication, Rentals, and E-commerce',
        features: ['Point of Sale', 'Discuss', 'Rental', 'Website Builder']
    }
]

const shortcuts = [
    { keys: ['Esc'], description: 'Close modal / Cancel action' },
    { keys: ['?'], description: 'Open help' },
    { keys: ['Ctrl', 'K'], description: 'Open command palette' },
    { keys: ['Ctrl', 'S'], description: 'Save current form' },
    { keys: ['Ctrl', 'N'], description: 'Create new record' },
    { keys: ['←', '→'], description: 'Navigate between records' },
]

function HelpModal({ isOpen, onClose }) {
    const [activeTab, setActiveTab] = useState('overview')

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose()
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, onClose])

    // Prevent scroll when modal is open
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

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="help-modal-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        className="help-modal"
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="help-modal-header">
                            <div className="help-modal-title">
                                <div className="help-modal-icon">
                                    <HelpCircle size={24} />
                                </div>
                                <div>
                                    <h2>Sic CRM Help Center</h2>
                                    <p>Everything you need to know about the platform</p>
                                </div>
                            </div>
                            <button className="help-modal-close" onClick={onClose}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="help-modal-tabs">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    className={`help-modal-tab ${activeTab === tab.id ? 'active' : ''}`}
                                    onClick={() => setActiveTab(tab.id)}
                                >
                                    <tab.icon size={18} />
                                    <span>{tab.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* Content */}
                        <div className="help-modal-content">
                            <AnimatePresence mode="wait">
                                {activeTab === 'overview' && (
                                    <motion.div
                                        key="overview"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="help-section"
                                    >
                                        <div className="help-hero">
                                            <Sparkles size={48} className="help-hero-icon" />
                                            <h3>Welcome to Sic CRM</h3>
                                            <p>Your comprehensive enterprise resource planning solution</p>
                                        </div>

                                        <div className="help-features-grid">
                                            <div className="help-feature-card">
                                                <div className="help-feature-icon purple">
                                                    <Zap size={24} />
                                                </div>
                                                <h4>All-in-One Platform</h4>
                                                <p>Manage sales, products, accounting, CRM, HR, and manufacturing from a single unified interface.</p>
                                            </div>
                                            <div className="help-feature-card">
                                                <div className="help-feature-icon blue">
                                                    <Layers size={24} />
                                                </div>
                                                <h4>8 Integrated Modules</h4>
                                                <p>Each module works seamlessly with others. Data flows automatically across the entire system.</p>
                                            </div>
                                            <div className="help-feature-card">
                                                <div className="help-feature-icon green">
                                                    <BookOpen size={24} />
                                                </div>
                                                <h4>Easy to Use</h4>
                                                <p>Modern, intuitive interface with keyboard shortcuts and quick actions for power users.</p>
                                            </div>
                                        </div>

                                        <div className="help-tip">
                                            <span className="help-tip-badge">💡 Pro Tip</span>
                                            <p>Use the sidebar to navigate between modules. Each module page contains detailed features and workflows.</p>
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === 'modules' && (
                                    <motion.div
                                        key="modules"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="help-section"
                                    >
                                        <div className="help-modules-grid">
                                            {modules.map((module, index) => (
                                                <motion.div
                                                    key={index}
                                                    className="help-module-card"
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: index * 0.05 }}
                                                >
                                                    <div className="help-module-header">
                                                        <div className="help-module-icon">
                                                            <module.icon size={20} />
                                                        </div>
                                                        <h4>{module.title}</h4>
                                                    </div>
                                                    <p className="help-module-desc">{module.description}</p>
                                                    <div className="help-module-features">
                                                        {module.features.map((feature, i) => (
                                                            <span key={i} className="help-module-feature">
                                                                <ChevronRight size={12} />
                                                                {feature}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {activeTab === 'shortcuts' && (
                                    <motion.div
                                        key="shortcuts"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="help-section"
                                    >
                                        <div className="help-shortcuts-list">
                                            {shortcuts.map((shortcut, index) => (
                                                <motion.div
                                                    key={index}
                                                    className="help-shortcut-item"
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.05 }}
                                                >
                                                    <div className="help-shortcut-keys">
                                                        {shortcut.keys.map((key, i) => (
                                                            <span key={i}>
                                                                <kbd>{key}</kbd>
                                                                {i < shortcut.keys.length - 1 && <span className="key-separator">+</span>}
                                                            </span>
                                                        ))}
                                                    </div>
                                                    <span className="help-shortcut-desc">{shortcut.description}</span>
                                                </motion.div>
                                            ))}
                                        </div>

                                        <div className="help-tip">
                                            <span className="help-tip-badge">⌨️ Keyboard First</span>
                                            <p>Sic CRM is designed for keyboard power users. Learn these shortcuts to navigate faster!</p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Footer */}
                        <div className="help-modal-footer">
                            <span>Press <kbd>Esc</kbd> to close</span>
                            <span className="help-version">Sic CRM v2.0.0</span>
                        </div>
                    </motion.div>

                    <style>{`
            .help-modal-overlay {
              position: fixed;
              inset: 0;
              background: rgba(0, 0, 0, 0.8);
              backdrop-filter: blur(8px);
              display: flex;
              align-items: center;
              justify-content: center;
              z-index: 2000;
              padding: 20px;
            }

            .help-modal {
              width: 100%;
              max-width: 900px;
              max-height: 85vh;
              background: var(--bg-secondary);
              border: 1px solid var(--border-color);
              border-radius: var(--radius-xl);
              display: flex;
              flex-direction: column;
              overflow: hidden;
              box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            }

            .help-modal-header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding: 24px;
              border-bottom: 1px solid var(--border-color);
            }

            .help-modal-title {
              display: flex;
              align-items: center;
              gap: 16px;
            }

            .help-modal-icon {
              width: 48px;
              height: 48px;
              border-radius: 14px;
              background: var(--accent-gradient);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
            }

            .help-modal-title h2 {
              font-size: 1.25rem;
              font-weight: 600;
              margin-bottom: 4px;
            }

            .help-modal-title p {
              font-size: 0.875rem;
              color: var(--text-muted);
            }

            .help-modal-close {
              width: 40px;
              height: 40px;
              border-radius: 10px;
              background: rgba(255, 255, 255, 0.05);
              display: flex;
              align-items: center;
              justify-content: center;
              color: var(--text-secondary);
              transition: all 0.2s;
            }

            .help-modal-close:hover {
              background: rgba(255, 255, 255, 0.1);
              color: white;
            }

            .help-modal-tabs {
              display: flex;
              gap: 8px;
              padding: 16px 24px;
              border-bottom: 1px solid var(--border-color);
              background: rgba(0, 0, 0, 0.2);
            }

            .help-modal-tab {
              display: flex;
              align-items: center;
              gap: 8px;
              padding: 10px 16px;
              border-radius: 10px;
              font-size: 0.9rem;
              color: var(--text-secondary);
              transition: all 0.2s;
            }

            .help-modal-tab:hover {
              background: rgba(255, 255, 255, 0.05);
              color: var(--text-primary);
            }

            .help-modal-tab.active {
              background: var(--accent-gradient);
              color: white;
            }

            .help-modal-content {
              flex: 1;
              overflow-y: auto;
              padding: 24px;
            }

            .help-section {
              min-height: 300px;
            }

            .help-hero {
              text-align: center;
              padding: 32px 0;
              margin-bottom: 32px;
            }

            .help-hero-icon {
              color: var(--accent-primary);
              margin-bottom: 16px;
            }

            .help-hero h3 {
              font-size: 1.75rem;
              font-weight: 700;
              margin-bottom: 8px;
              background: var(--accent-gradient);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
            }

            .help-hero p {
              color: var(--text-secondary);
              font-size: 1rem;
            }

            .help-features-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 20px;
              margin-bottom: 32px;
            }

            @media (max-width: 768px) {
              .help-features-grid {
                grid-template-columns: 1fr;
              }
            }

            .help-feature-card {
              background: var(--bg-glass);
              border: 1px solid var(--border-color);
              border-radius: var(--radius-lg);
              padding: 24px;
              text-align: center;
            }

            .help-feature-icon {
              width: 56px;
              height: 56px;
              border-radius: 14px;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 16px;
              color: white;
            }

            .help-feature-icon.purple { background: linear-gradient(135deg, #6366f1, #8b5cf6); }
            .help-feature-icon.blue { background: linear-gradient(135deg, #3b82f6, #06b6d4); }
            .help-feature-icon.green { background: linear-gradient(135deg, #10b981, #34d399); }

            .help-feature-card h4 {
              font-size: 1rem;
              margin-bottom: 8px;
            }

            .help-feature-card p {
              font-size: 0.85rem;
              color: var(--text-secondary);
              line-height: 1.5;
            }

            .help-tip {
              background: rgba(99, 102, 241, 0.1);
              border: 1px solid rgba(99, 102, 241, 0.3);
              border-radius: var(--radius-md);
              padding: 16px 20px;
              display: flex;
              align-items: center;
              gap: 16px;
            }

            .help-tip-badge {
              background: var(--accent-gradient);
              color: white;
              padding: 6px 12px;
              border-radius: 20px;
              font-size: 0.8rem;
              font-weight: 500;
              white-space: nowrap;
            }

            .help-tip p {
              font-size: 0.9rem;
              color: var(--text-secondary);
            }

            .help-modules-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 16px;
            }

            @media (max-width: 600px) {
              .help-modules-grid {
                grid-template-columns: 1fr;
              }
            }

            .help-module-card {
              background: var(--bg-glass);
              border: 1px solid var(--border-color);
              border-radius: var(--radius-md);
              padding: 20px;
              transition: all 0.2s;
            }

            .help-module-card:hover {
              border-color: var(--accent-primary);
            }

            .help-module-header {
              display: flex;
              align-items: center;
              gap: 12px;
              margin-bottom: 10px;
            }

            .help-module-icon {
              width: 36px;
              height: 36px;
              border-radius: 10px;
              background: var(--accent-gradient);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
            }

            .help-module-header h4 {
              font-size: 1rem;
              font-weight: 600;
            }

            .help-module-desc {
              font-size: 0.85rem;
              color: var(--text-secondary);
              margin-bottom: 12px;
            }

            .help-module-features {
              display: flex;
              flex-direction: column;
              gap: 6px;
            }

            .help-module-feature {
              display: flex;
              align-items: center;
              gap: 6px;
              font-size: 0.8rem;
              color: var(--text-muted);
            }

            .help-module-feature svg {
              color: var(--accent-primary);
            }

            .help-shortcuts-list {
              display: flex;
              flex-direction: column;
              gap: 12px;
              margin-bottom: 32px;
            }

            .help-shortcut-item {
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding: 16px 20px;
              background: var(--bg-glass);
              border: 1px solid var(--border-color);
              border-radius: var(--radius-md);
            }

            .help-shortcut-keys {
              display: flex;
              align-items: center;
              gap: 4px;
            }

            .help-shortcut-keys kbd {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              min-width: 28px;
              height: 28px;
              padding: 0 8px;
              background: var(--bg-tertiary);
              border: 1px solid var(--border-color);
              border-radius: 6px;
              font-size: 0.8rem;
              font-family: inherit;
              color: var(--text-primary);
            }

            .key-separator {
              color: var(--text-muted);
              margin: 0 4px;
            }

            .help-shortcut-desc {
              color: var(--text-secondary);
              font-size: 0.9rem;
            }

            .help-modal-footer {
              display: flex;
              align-items: center;
              justify-content: space-between;
              padding: 16px 24px;
              border-top: 1px solid var(--border-color);
              background: rgba(0, 0, 0, 0.2);
            }

            .help-modal-footer span {
              font-size: 0.8rem;
              color: var(--text-muted);
            }

            .help-modal-footer kbd {
              display: inline-flex;
              align-items: center;
              justify-content: center;
              min-width: 24px;
              height: 22px;
              padding: 0 6px;
              background: var(--bg-tertiary);
              border: 1px solid var(--border-color);
              border-radius: 4px;
              font-size: 0.75rem;
              font-family: inherit;
              margin: 0 4px;
            }

            .help-version {
              color: var(--accent-primary) !important;
            }
          `}</style>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default HelpModal
