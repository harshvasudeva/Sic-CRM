import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Truck,
  Calculator,
  Users,
  UserCircle,
  Factory,
  Sparkles,
  Menu,
  X,
  HelpCircle,
  Settings
} from 'lucide-react'
import { useState } from 'react'
import HelpModal from './HelpModal'

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/sales', icon: ShoppingCart, label: 'Sales' },
  { path: '/products', icon: Package, label: 'Products' },
  { path: '/purchase', icon: Truck, label: 'Purchase' },
  { path: '/accounting', icon: Calculator, label: 'Accounting' },
  { path: '/crm', icon: Users, label: 'CRM' },
  { path: '/hr', icon: UserCircle, label: 'HR & Employees' },
  { path: '/manufacturing', icon: Factory, label: 'Manufacturing' },
  { path: '/specialized', icon: Sparkles, label: 'Specialized' },
  { path: '/settings', icon: Settings, label: 'Settings' },
]

function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const location = useLocation()

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="mobile-menu-btn"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <motion.div
            className="logo"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="logo-icon">
              <Sparkles size={28} />
            </div>
            <div className="logo-text">
              <span className="logo-name">Sic CRM</span>
              <span className="logo-tagline">Enterprise Suite</span>
            </div>
          </motion.div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item, index) => (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <NavLink
                to={item.path}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
                {location.pathname === item.path && (
                  <motion.div
                    className="nav-indicator"
                    layoutId="nav-indicator"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </NavLink>
            </motion.div>
          ))}
        </nav>

        <div className="sidebar-footer">
          {/* Help Button */}
          <motion.button
            className="help-btn"
            onClick={() => setHelpOpen(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <HelpCircle size={18} />
            <span>Help & Guide</span>
          </motion.button>

          <div className="footer-info">
            <div className="version-badge">
              <span>v2.0.0</span>
            </div>
            <p>© 2026 Sic CRM</p>
          </div>
        </div>
      </aside>

      {/* Help Modal */}
      <HelpModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} />

      <style>{`
        .mobile-menu-btn {
          display: none;
          position: fixed;
          top: 20px;
          left: 20px;
          z-index: 1001;
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: rgba(30, 30, 45, 0.9);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          align-items: center;
          justify-content: center;
        }

        .sidebar-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          z-index: 999;
        }

        @media (max-width: 1024px) {
          .mobile-menu-btn {
            display: flex;
          }
          .sidebar-overlay {
            display: block;
          }
        }

        .sidebar {
          position: fixed;
          left: 0;
          top: 0;
          bottom: 0;
          width: var(--sidebar-width);
          background: rgba(12, 12, 18, 0.95);
          backdrop-filter: blur(30px);
          border-right: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          z-index: 1000;
          transition: transform 0.3s ease;
        }

        @media (max-width: 1024px) {
          .sidebar {
            transform: translateX(-100%);
          }
          .sidebar.open {
            transform: translateX(0);
          }
        }

        .sidebar-header {
          padding: 24px;
          border-bottom: 1px solid var(--border-color);
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .logo-icon {
          width: 48px;
          height: 48px;
          border-radius: 14px;
          background: var(--accent-gradient);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 4px 20px rgba(99, 102, 241, 0.3);
        }

        .logo-text {
          display: flex;
          flex-direction: column;
        }

        .logo-name {
          font-size: 1.4rem;
          font-weight: 700;
          background: var(--accent-gradient);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .logo-tagline {
          font-size: 0.75rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .sidebar-nav {
          flex: 1;
          padding: 20px 12px;
          overflow-y: auto;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 14px 16px;
          border-radius: 12px;
          color: var(--text-secondary);
          transition: all 0.2s ease;
          position: relative;
          margin-bottom: 4px;
        }

        .nav-item:hover {
          color: var(--text-primary);
          background: rgba(255, 255, 255, 0.05);
        }

        .nav-item.active {
          color: white;
          background: rgba(99, 102, 241, 0.15);
        }

        .nav-item.active svg {
          color: var(--accent-primary);
        }

        .nav-indicator {
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 24px;
          background: var(--accent-gradient);
          border-radius: 0 4px 4px 0;
        }

        .sidebar-footer {
          padding: 16px;
          border-top: 1px solid var(--border-color);
        }

        .help-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          padding: 14px 20px;
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2));
          border: 1px solid rgba(99, 102, 241, 0.3);
          border-radius: 12px;
          color: var(--accent-primary);
          font-size: 0.9rem;
          font-weight: 500;
          margin-bottom: 16px;
          transition: all 0.2s ease;
        }

        .help-btn:hover {
          background: linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(139, 92, 246, 0.3));
          border-color: rgba(99, 102, 241, 0.5);
        }

        .footer-info {
          text-align: center;
        }

        .version-badge {
          display: inline-block;
          padding: 4px 12px;
          background: rgba(99, 102, 241, 0.15);
          border-radius: 20px;
          font-size: 0.75rem;
          color: var(--accent-primary);
          margin-bottom: 8px;
        }

        .sidebar-footer p {
          font-size: 0.75rem;
          color: var(--text-muted);
        }
      `}</style>
    </>
  )
}

export default Sidebar
