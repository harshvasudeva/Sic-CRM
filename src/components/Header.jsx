import { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Search,
    Bell,
    User,
    ChevronRight,
    Settings,
    LogOut,
    X,
    Check,
    AlertCircle,
    Package,
    DollarSign
} from 'lucide-react'

const breadcrumbLabels = {
    '/': 'Dashboard',
    '/sales': 'Sales',
    '/products': 'Products',
    '/purchase': 'Purchase',
    '/accounting': 'Accounting',
    '/crm': 'CRM',
    '/hr': 'HR & Employees',
    '/manufacturing': 'Manufacturing',
    '/specialized': 'Specialized',
    '/settings': 'Settings'
}

const notifications = [
    { id: 1, type: 'success', icon: Check, title: 'Order Completed', message: 'Order #1234 has been delivered', time: '2 min ago' },
    { id: 2, type: 'warning', icon: AlertCircle, title: 'Low Stock Alert', message: 'Widget Pro is running low', time: '15 min ago' },
    { id: 3, type: 'info', icon: Package, title: 'New Shipment', message: 'Incoming shipment from Vendor A', time: '1 hour ago' },
    { id: 4, type: 'success', icon: DollarSign, title: 'Payment Received', message: '$2,500 from Acme Corp', time: '2 hours ago' },
]

function Header() {
    const location = useLocation()
    const navigate = useNavigate()
    const [searchOpen, setSearchOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const [notifOpen, setNotifOpen] = useState(false)
    const [userMenuOpen, setUserMenuOpen] = useState(false)
    const searchRef = useRef(null)
    const notifRef = useRef(null)
    const userRef = useRef(null)

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (notifRef.current && !notifRef.current.contains(e.target)) {
                setNotifOpen(false)
            }
            if (userRef.current && !userRef.current.contains(e.target)) {
                setUserMenuOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Focus search when opened
    useEffect(() => {
        if (searchOpen && searchRef.current) {
            searchRef.current.focus()
        }
    }, [searchOpen])

    const currentPage = breadcrumbLabels[location.pathname] || 'Page'

    return (
        <header className="header">
            {/* Breadcrumbs */}
            <div className="breadcrumbs">
                <span className="breadcrumb-item" onClick={() => navigate('/')}>
                    Home
                </span>
                <ChevronRight size={14} className="breadcrumb-sep" />
                <span className="breadcrumb-current">{currentPage}</span>
            </div>

            {/* Right Side */}
            <div className="header-actions">
                {/* Search */}
                <div className="search-wrapper">
                    <AnimatePresence>
                        {searchOpen && (
                            <motion.div
                                className="search-input-wrapper"
                                initial={{ width: 0, opacity: 0 }}
                                animate={{ width: 250, opacity: 1 }}
                                exit={{ width: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <input
                                    ref={searchRef}
                                    type="text"
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="search-input"
                                />
                                <button className="search-close" onClick={() => { setSearchOpen(false); setSearchQuery('') }}>
                                    <X size={16} />
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    {!searchOpen && (
                        <button className="header-btn" onClick={() => setSearchOpen(true)}>
                            <Search size={20} />
                        </button>
                    )}
                </div>

                {/* Notifications */}
                <div className="notif-wrapper" ref={notifRef}>
                    <button
                        className={`header-btn ${notifOpen ? 'active' : ''}`}
                        onClick={() => setNotifOpen(!notifOpen)}
                    >
                        <Bell size={20} />
                        <span className="notif-badge">4</span>
                    </button>

                    <AnimatePresence>
                        {notifOpen && (
                            <motion.div
                                className="dropdown notif-dropdown"
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                transition={{ duration: 0.15 }}
                            >
                                <div className="dropdown-header">
                                    <h3>Notifications</h3>
                                    <button className="mark-read">Mark all read</button>
                                </div>
                                <div className="notif-list">
                                    {notifications.map((notif) => (
                                        <div key={notif.id} className={`notif-item ${notif.type}`}>
                                            <div className={`notif-icon ${notif.type}`}>
                                                <notif.icon size={16} />
                                            </div>
                                            <div className="notif-content">
                                                <h4>{notif.title}</h4>
                                                <p>{notif.message}</p>
                                                <span className="notif-time">{notif.time}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="dropdown-footer">
                                    <button>View All Notifications</button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* User Menu */}
                <div className="user-wrapper" ref={userRef}>
                    <button
                        className={`user-btn ${userMenuOpen ? 'active' : ''}`}
                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                    >
                        <div className="user-avatar">
                            <User size={18} />
                        </div>
                        <span className="user-name">Admin</span>
                    </button>

                    <AnimatePresence>
                        {userMenuOpen && (
                            <motion.div
                                className="dropdown user-dropdown"
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                transition={{ duration: 0.15 }}
                            >
                                <div className="user-dropdown-header">
                                    <div className="user-dropdown-avatar">
                                        <User size={24} />
                                    </div>
                                    <div>
                                        <h4>Admin User</h4>
                                        <p>admin@siccrm.com</p>
                                    </div>
                                </div>
                                <div className="dropdown-divider"></div>
                                <button className="dropdown-item" onClick={() => { navigate('/settings'); setUserMenuOpen(false) }}>
                                    <Settings size={18} />
                                    Settings
                                </button>
                                <button className="dropdown-item danger">
                                    <LogOut size={18} />
                                    Sign Out
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <style>{`
        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 0;
          margin-bottom: 24px;
          border-bottom: 1px solid var(--border-color);
        }

        .breadcrumbs {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .breadcrumb-item {
          font-size: 0.9rem;
          color: var(--text-muted);
          cursor: pointer;
          transition: color 0.2s;
        }

        .breadcrumb-item:hover {
          color: var(--accent-primary);
        }

        .breadcrumb-sep {
          color: var(--text-muted);
        }

        .breadcrumb-current {
          font-size: 0.9rem;
          color: var(--text-primary);
          font-weight: 500;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .header-btn {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: var(--bg-glass);
          border: 1px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-secondary);
          transition: all 0.2s;
          position: relative;
        }

        .header-btn:hover, .header-btn.active {
          background: rgba(99, 102, 241, 0.15);
          border-color: var(--accent-primary);
          color: var(--accent-primary);
        }

        .notif-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: var(--error);
          color: white;
          font-size: 0.7rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .search-wrapper {
          display: flex;
          align-items: center;
        }

        .search-input-wrapper {
          display: flex;
          align-items: center;
          background: var(--bg-glass);
          border: 1px solid var(--border-color);
          border-radius: 10px;
          padding: 0 12px;
          overflow: hidden;
        }

        .search-input {
          flex: 1;
          padding: 10px 0;
          background: transparent;
          border: none;
          color: var(--text-primary);
          font-size: 0.9rem;
        }

        .search-input:focus {
          outline: none;
        }

        .search-input::placeholder {
          color: var(--text-muted);
        }

        .search-close {
          color: var(--text-muted);
          padding: 4px;
        }

        .search-close:hover {
          color: var(--text-primary);
        }

        /* Dropdowns */
        .notif-wrapper, .user-wrapper {
          position: relative;
        }

        .dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-lg);
          z-index: 100;
          overflow: hidden;
        }

        .notif-dropdown {
          width: 360px;
        }

        .dropdown-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px;
          border-bottom: 1px solid var(--border-color);
        }

        .dropdown-header h3 {
          font-size: 0.95rem;
          font-weight: 600;
        }

        .mark-read {
          font-size: 0.8rem;
          color: var(--accent-primary);
        }

        .notif-list {
          max-height: 300px;
          overflow-y: auto;
        }

        .notif-item {
          display: flex;
          gap: 12px;
          padding: 14px 16px;
          border-bottom: 1px solid var(--border-color);
          cursor: pointer;
          transition: background 0.2s;
        }

        .notif-item:hover {
          background: rgba(255, 255, 255, 0.03);
        }

        .notif-item:last-child {
          border-bottom: none;
        }

        .notif-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .notif-icon.success {
          background: rgba(16, 185, 129, 0.15);
          color: var(--success);
        }

        .notif-icon.warning {
          background: rgba(245, 158, 11, 0.15);
          color: var(--warning);
        }

        .notif-icon.info {
          background: rgba(59, 130, 246, 0.15);
          color: var(--info);
        }

        .notif-content h4 {
          font-size: 0.85rem;
          font-weight: 500;
          margin-bottom: 2px;
        }

        .notif-content p {
          font-size: 0.8rem;
          color: var(--text-secondary);
          margin-bottom: 4px;
        }

        .notif-time {
          font-size: 0.7rem;
          color: var(--text-muted);
        }

        .dropdown-footer {
          padding: 12px 16px;
          border-top: 1px solid var(--border-color);
          text-align: center;
        }

        .dropdown-footer button {
          font-size: 0.85rem;
          color: var(--accent-primary);
        }

        /* User Menu */
        .user-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 6px 14px 6px 6px;
          background: var(--bg-glass);
          border: 1px solid var(--border-color);
          border-radius: 10px;
          transition: all 0.2s;
        }

        .user-btn:hover, .user-btn.active {
          background: rgba(99, 102, 241, 0.15);
          border-color: var(--accent-primary);
        }

        .user-avatar {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: var(--accent-gradient);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .user-name {
          font-size: 0.9rem;
          color: var(--text-primary);
          font-weight: 500;
        }

        .user-dropdown {
          width: 220px;
        }

        .user-dropdown-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
        }

        .user-dropdown-avatar {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: var(--accent-gradient);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .user-dropdown-header h4 {
          font-size: 0.95rem;
          font-weight: 600;
        }

        .user-dropdown-header p {
          font-size: 0.8rem;
          color: var(--text-muted);
        }

        .dropdown-divider {
          height: 1px;
          background: var(--border-color);
        }

        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 12px 16px;
          color: var(--text-secondary);
          font-size: 0.9rem;
          text-align: left;
          transition: all 0.2s;
        }

        .dropdown-item:hover {
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-primary);
        }

        .dropdown-item.danger:hover {
          background: rgba(239, 68, 68, 0.1);
          color: var(--error);
        }
      `}</style>
        </header>
    )
}

export default Header
