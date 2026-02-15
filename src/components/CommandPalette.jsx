import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Search, FileText, DollarSign, ShoppingCart, Truck, ArrowRight,
    Package, Users, Calendar, CreditCard, Receipt, Calculator,
    FileSpreadsheet, Printer, Download, Upload, HelpCircle,
    Settings, Hash, RefreshCw, Filter, X, LayoutDashboard,
    UserCircle, Factory, Sparkles, BarChart3, Megaphone
} from 'lucide-react'
import { getRecentItems } from '../stores/settingsStore'

// All navigable pages
const ALL_PAGES = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, route: '/' },
    { id: 'sales', name: 'Sales', icon: ShoppingCart, route: '/sales' },
    { id: 'quotations', name: 'Quotations', icon: FileText, route: '/sales/quotations' },
    { id: 'sales-orders', name: 'Sales Orders', icon: ShoppingCart, route: '/sales/orders' },
    { id: 'invoices', name: 'Invoices', icon: Receipt, route: '/sales/invoices' },
    { id: 'credit-notes', name: 'Credit Notes', icon: FileText, route: '/sales/credit-notes' },
    { id: 'delivery-notes', name: 'Delivery Notes', icon: Truck, route: '/sales/delivery-notes' },
    { id: 'pricing-rules', name: 'Pricing Rules', icon: DollarSign, route: '/sales/pricing' },
    { id: 'sales-targets', name: 'Sales Targets', icon: BarChart3, route: '/sales/targets' },
    { id: 'products', name: 'Products', icon: Package, route: '/products' },
    { id: 'price-lists', name: 'Price Lists', icon: DollarSign, route: '/products/price-lists' },
    { id: 'purchase', name: 'Purchase', icon: Truck, route: '/purchase' },
    { id: 'vendors', name: 'Vendors', icon: Users, route: '/purchase/vendors' },
    { id: 'purchase-orders', name: 'Purchase Orders', icon: ShoppingCart, route: '/purchase/orders' },
    { id: 'purchase-req', name: 'Purchase Requisitions', icon: FileText, route: '/purchase/requisitions' },
    { id: 'rfqs', name: 'RFQs', icon: FileText, route: '/purchase/rfqs' },
    { id: 'grns', name: 'Goods Received', icon: Package, route: '/purchase/grns' },
    { id: 'supplier-invoices', name: 'Supplier Invoices', icon: Receipt, route: '/purchase/supplier-invoices' },
    { id: 'accounting', name: 'Accounting', icon: Calculator, route: '/accounting' },
    { id: 'journal', name: 'Journal Entries', icon: FileText, route: '/accounting/journal-entries' },
    { id: 'general-ledger', name: 'General Ledger', icon: FileSpreadsheet, route: '/accounting/general-ledger' },
    { id: 'bank', name: 'Bank Accounts', icon: CreditCard, route: '/accounting/bank' },
    { id: 'acc-expenses', name: 'Expenses', icon: DollarSign, route: '/accounting/expenses' },
    { id: 'budgets', name: 'Budgets', icon: Calculator, route: '/accounting/budgets' },
    { id: 'receivable', name: 'Accounts Receivable', icon: DollarSign, route: '/accounting/receivable' },
    { id: 'payable', name: 'Accounts Payable', icon: DollarSign, route: '/accounting/payable' },
    { id: 'chart-of-accounts', name: 'Chart of Accounts', icon: FileSpreadsheet, route: '/accounting/chart-of-accounts' },
    { id: 'financial-reports', name: 'Financial Reports', icon: BarChart3, route: '/accounting/reports' },
    { id: 'fixed-assets', name: 'Fixed Assets', icon: Package, route: '/accounting/assets' },
    { id: 'taxation', name: 'Taxation', icon: Calculator, route: '/accounting/taxation' },
    { id: 'inventory', name: 'Inventory', icon: Package, route: '/inventory' },
    { id: 'stock-movements', name: 'Stock Movements', icon: ArrowRight, route: '/inventory/movements' },
    { id: 'stock-transfers', name: 'Stock Transfers', icon: Truck, route: '/inventory/transfers' },
    { id: 'warehouses', name: 'Warehouses', icon: Package, route: '/inventory/warehouses' },
    { id: 'crm', name: 'CRM', icon: UserCircle, route: '/crm' },
    { id: 'leads', name: 'Leads', icon: Users, route: '/crm/leads' },
    { id: 'opportunities', name: 'Opportunities', icon: ShoppingCart, route: '/crm/opportunities' },
    { id: 'contacts', name: 'Contacts', icon: Users, route: '/crm/contacts' },
    { id: 'activities', name: 'Activities', icon: Calendar, route: '/crm/activities' },
    { id: 'hr', name: 'HR & Employees', icon: Users, route: '/hr' },
    { id: 'employees', name: 'Employees', icon: Users, route: '/hr/employees' },
    { id: 'recruitment', name: 'Recruitment', icon: Users, route: '/hr/recruitment' },
    { id: 'attendance', name: 'Attendance', icon: Calendar, route: '/hr/attendance' },
    { id: 'leaves', name: 'Leave Management', icon: Calendar, route: '/hr/leaves' },
    { id: 'payroll', name: 'Payroll', icon: DollarSign, route: '/hr/payroll' },
    { id: 'manufacturing', name: 'Manufacturing', icon: Factory, route: '/manufacturing' },
    { id: 'influencer', name: 'Influencer Marketing', icon: Megaphone, route: '/influencer' },
    { id: 'specialized', name: 'Specialized', icon: Sparkles, route: '/specialized' },
    { id: 'pos', name: 'Point of Sale', icon: ShoppingCart, route: '/specialized/pos' },
    { id: 'reports', name: 'Reports', icon: BarChart3, route: '/reports' },
    { id: 'settings', name: 'Settings', icon: Settings, route: '/settings' },
]

// Quick actions
const QUICK_ACTIONS = [
    { id: 'create-invoice', name: 'Create Invoice', icon: Receipt, route: '/sales/invoices?action=create', section: 'Actions' },
    { id: 'create-quote', name: 'Create Quote', icon: FileText, route: '/sales/quotations?action=create', section: 'Actions' },
    { id: 'create-order', name: 'Create Sales Order', icon: ShoppingCart, route: '/sales/orders?action=create', section: 'Actions' },
    { id: 'new-lead', name: 'New Lead', icon: Users, route: '/crm/leads?action=create', section: 'Actions' },
    { id: 'new-contact', name: 'New Contact', icon: Users, route: '/crm/contacts?action=create', section: 'Actions' },
    { id: 'add-product', name: 'Add Product', icon: Package, route: '/products?action=create', section: 'Actions' },
    { id: 'add-employee', name: 'Add Employee', icon: Users, route: '/hr/employees?action=create', section: 'Actions' },
    { id: 'journal-entry', name: 'Journal Entry', icon: FileText, route: '/accounting/journal-entries?action=create', section: 'Actions' },
]

function CommandPalette({ isOpen, onClose, onHelp }) {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedIndex, setSelectedIndex] = useState(0)
    const navigate = useNavigate()
    const inputRef = useRef(null)

    // Get recent items for "Recent" section
    const recentItems = getRecentItems().slice(0, 5).map(r => ({
        id: `recent-${r.path}`,
        name: r.title,
        icon: FileText,
        route: r.path,
        section: 'Recent'
    }))

    // Build filtered results
    const filteredResults = (() => {
        if (!searchTerm) {
            return [
                ...recentItems,
                ...QUICK_ACTIONS.slice(0, 6),
                ...ALL_PAGES.slice(0, 8)
            ]
        }
        const term = searchTerm.toLowerCase()
        const pages = ALL_PAGES.filter(p =>
            p.name.toLowerCase().includes(term) || p.id.includes(term)
        ).map(p => ({ ...p, section: 'Pages' }))
        const actions = QUICK_ACTIONS.filter(a =>
            a.name.toLowerCase().includes(term) || a.id.includes(term)
        )
        return [...actions, ...pages]
    })()

    const handleSelect = (item) => {
        if (item.route) {
            navigate(item.route)
        }
        onClose()
        setSearchTerm('')
        setSelectedIndex(0)
    }

    const handleKeyDown = useCallback((e) => {
        if (!isOpen) return
        if (e.key === 'Escape') {
            e.preventDefault()
            onClose()
            setSearchTerm('')
            return
        }
        if (e.key === 'ArrowDown') {
            e.preventDefault()
            setSelectedIndex(prev => Math.min(prev + 1, filteredResults.length - 1))
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setSelectedIndex(prev => Math.max(prev - 1, 0))
        } else if (e.key === 'Enter' && filteredResults[selectedIndex]) {
            e.preventDefault()
            handleSelect(filteredResults[selectedIndex])
        }
    }, [isOpen, filteredResults, selectedIndex, onClose])

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown)
            setTimeout(() => inputRef.current?.focus(), 100)
        }
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, handleKeyDown])

    useEffect(() => {
        setSelectedIndex(0)
    }, [searchTerm])

    if (!isOpen) return null

    return (
        <AnimatePresence>
            <motion.div
                className="cmd-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
            >
                <motion.div
                    className="cmd-palette"
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Search Input */}
                    <div className="cmd-search">
                        <Search size={20} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Search pages, actions, records... (type to filter)"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button onClick={onClose} style={{ padding: '4px', color: 'var(--text-muted)' }}>
                            <X size={18} />
                        </button>
                    </div>

                    {/* Results */}
                    <div className="cmd-results">
                        {filteredResults.length === 0 ? (
                            <div className="cmd-empty">
                                <Search size={40} style={{ opacity: 0.3 }} />
                                <p>No results found for "{searchTerm}"</p>
                            </div>
                        ) : (
                            filteredResults.map((item, index) => {
                                const Icon = item.icon
                                const showSection = index === 0 ||
                                    filteredResults[index - 1]?.section !== item.section
                                return (
                                    <div key={item.id}>
                                        {showSection && item.section && (
                                            <div className="cmd-section-label">{item.section}</div>
                                        )}
                                        <button
                                            className={`cmd-item ${index === selectedIndex ? 'selected' : ''}`}
                                            onClick={() => handleSelect(item)}
                                            onMouseEnter={() => setSelectedIndex(index)}
                                        >
                                            <div className="cmd-item-icon">
                                                <Icon size={18} />
                                            </div>
                                            <span className="cmd-item-name">{item.name}</span>
                                            <ArrowRight size={14} style={{ color: 'var(--text-muted)', opacity: 0.5 }} />
                                        </button>
                                    </div>
                                )
                            })
                        )}
                    </div>

                    {/* Footer */}
                    <div className="cmd-footer">
                        <div className="cmd-shortcuts">
                            <span><kbd>↑↓</kbd> Navigate</span>
                            <span><kbd>Enter</kbd> Select</span>
                            <span><kbd>Esc</kbd> Close</span>
                        </div>
                        <button onClick={() => { onHelp?.(); onClose() }} style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            color: 'var(--text-muted)', fontSize: '0.8rem'
                        }}>
                            <HelpCircle size={14} />
                            All Shortcuts
                        </button>
                    </div>
                </motion.div>
            </motion.div>

            <style>{`
                .cmd-overlay {
                    position: fixed;
                    inset: 0;
                    z-index: 9999;
                    display: flex;
                    align-items: flex-start;
                    justify-content: center;
                    padding-top: 15vh;
                    background: rgba(0, 0, 0, 0.7);
                    backdrop-filter: blur(4px);
                }

                .cmd-palette {
                    width: 640px;
                    max-height: 480px;
                    background: var(--bg-secondary);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-lg);
                    box-shadow: var(--shadow-lg), 0 0 60px rgba(99, 102, 241, 0.1);
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }

                .cmd-search {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 16px 20px;
                    border-bottom: 1px solid var(--border-color);
                }

                .cmd-search input {
                    flex: 1;
                    background: transparent !important;
                    border: none !important;
                    color: var(--text-primary) !important;
                    font-size: 1rem;
                    padding: 0 !important;
                    box-shadow: none !important;
                }

                .cmd-search input:focus {
                    outline: none;
                    box-shadow: none !important;
                }

                .cmd-search input::placeholder {
                    color: var(--text-muted);
                }

                .cmd-results {
                    flex: 1;
                    overflow-y: auto;
                    padding: 8px;
                }

                .cmd-section-label {
                    padding: 8px 12px 4px;
                    font-size: 0.7rem;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.06em;
                    color: var(--text-muted);
                }

                .cmd-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    width: 100%;
                    padding: 10px 12px;
                    border-radius: var(--radius-sm);
                    transition: all 0.1s;
                    cursor: pointer;
                    text-align: left;
                }

                .cmd-item:hover, .cmd-item.selected {
                    background: rgba(99, 102, 241, 0.15);
                }

                .cmd-item.selected {
                    background: rgba(99, 102, 241, 0.2);
                }

                .cmd-item-icon {
                    width: 32px;
                    height: 32px;
                    border-radius: 8px;
                    background: rgba(99, 102, 241, 0.1);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: var(--accent-primary);
                    flex-shrink: 0;
                }

                .cmd-item-name {
                    flex: 1;
                    font-size: 0.9rem;
                    color: var(--text-primary);
                    font-weight: 500;
                }

                .cmd-empty {
                    text-align: center;
                    padding: 40px 20px;
                    color: var(--text-muted);
                }

                .cmd-empty p {
                    margin-top: 12px;
                    font-size: 0.9rem;
                }

                .cmd-footer {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 12px 20px;
                    border-top: 1px solid var(--border-color);
                }

                .cmd-shortcuts {
                    display: flex;
                    gap: 16px;
                }

                .cmd-shortcuts span {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    font-size: 0.75rem;
                    color: var(--text-muted);
                }

                .cmd-shortcuts kbd {
                    display: inline-block;
                    padding: 2px 6px;
                    background: rgba(255, 255, 255, 0.06);
                    border: 1px solid var(--border-color);
                    border-radius: 4px;
                    font-size: 0.7rem;
                    font-family: inherit;
                }
            `}</style>
        </AnimatePresence>
    )
}

export default CommandPalette
