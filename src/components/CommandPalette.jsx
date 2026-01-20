import { useState, useEffect, useCallback } from 'react'
import { Search, FileText, DollarSign, ShoppingCart, Truck, ArrowLeft, ArrowRight, Package, Users, Calendar, CreditCard, Receipt, Calculator, FileSpreadsheet, Printer, Download, Upload, HelpCircle, Settings, Hash, RefreshCw, Filter, X } from 'lucide-react'

const VOUCHER_TYPES = [
    { id: 'payment', name: 'Payment', icon: DollarSign, shortcut: 'F5', color: 'bg-green-600', route: '/accounting/payment' },
    { id: 'receipt', name: 'Receipt', icon: Receipt, shortcut: 'F6', color: 'bg-blue-600', route: '/accounting/receipt' },
    { id: 'contra', name: 'Contra', icon: ArrowLeft, shortcut: 'F4', color: 'bg-purple-600', route: '/accounting/contra' },
    { id: 'journal', name: 'Journal', icon: FileText, shortcut: 'F7', color: 'bg-indigo-600', route: '/accounting/journal' },
    { id: 'sales', name: 'Sales', icon: ShoppingCart, shortcut: 'F8', color: 'bg-emerald-600', route: '/sales/invoices' },
    { id: 'purchase', name: 'Purchase', icon: ShoppingCart, shortcut: 'F9', color: 'bg-orange-600', route: '/purchase/orders' },
    { id: 'memo', name: 'Memo', icon: FileText, shortcut: 'F10', color: 'bg-gray-600', route: '/accounting/memo' },
    { id: 'credit-note', name: 'Credit Note', icon: Receipt, shortcut: 'Ctrl+F8', color: 'bg-red-600', route: '/sales/credit-notes' },
    { id: 'debit-note', name: 'Debit Note', icon: FileText, shortcut: 'Ctrl+F9', color: 'bg-yellow-600', route: '/purchase/returns' },
    { id: 'delivery', name: 'Delivery', icon: Truck, shortcut: 'Alt+F8', color: 'bg-cyan-600', route: '/sales/delivery' },
    { id: 'receipt-note', name: 'Receipt Note', icon: Receipt, shortcut: 'Alt+F6', color: 'bg-teal-600', route: '/purchase/receipt-notes' },
    { id: 'reversal', name: 'Reversal', icon: RefreshCw, shortcut: 'Alt+F7', color: 'bg-rose-600', route: '/accounting/reversal' },
    { id: 'stock-journal', name: 'Stock Journal', icon: FileText, shortcut: 'Alt+F10', color: 'bg-amber-600', route: '/inventory/stock-journal' },
    { id: 'physical-stock', name: 'Physical Stock', icon: Package, shortcut: 'Alt+P', color: 'bg-lime-600', route: '/inventory/physical-stock' },
]

const INVENTORY_ACTIONS = [
    { id: 'items', name: 'Item Master', icon: Package, route: '/products' },
    { id: 'groups', name: 'Stock Groups', icon: FileSpreadsheet, route: '/products/groups' },
    { id: 'categories', name: 'Stock Categories', icon: Filter, route: '/products/categories' },
    { id: 'units', name: 'Units', icon: Calculator, route: '/products/units' },
    { id: 'godowns', name: 'Godowns', icon: Package, route: '/inventory/warehouses' },
    { id: 'stock-summary', name: 'Stock Summary', icon: FileSpreadsheet, route: '/reports/stock-summary' },
    { id: 'movement', name: 'Stock Movement', icon: ArrowRight, route: '/inventory/movements' },
    { id: 'transfer', name: 'Stock Transfer', icon: Truck, route: '/inventory/transfers' },
]

const ACCOUNTING_ACTIONS = [
    { id: 'accounts', name: 'Chart of Accounts', icon: FileSpreadsheet, route: '/accounting/chart' },
    { id: 'cost-center', name: 'Cost Centers', icon: Users, route: '/accounting/cost-centers' },
    { id: 'budgets', name: 'Budgets', icon: Calculator, route: '/accounting/budgets' },
    { id: 'bank', name: 'Bank Accounts', icon: CreditCard, route: '/accounting/bank' },
    { id: 'payable', name: 'Accounts Payable', icon: DollarSign, route: '/accounting/payable' },
    { id: 'receivable', name: 'Accounts Receivable', icon: DollarSign, route: '/accounting/receivable' },
    { id: 'gst', name: 'GST Reports', icon: FileSpreadsheet, route: '/reports/gst' },
    { id: 'tds', name: 'TDS Reports', icon: FileSpreadsheet, route: '/reports/tds' },
]

const PAYROLL_ACTIONS = [
    { id: 'employees', name: 'Employees', icon: Users, route: '/hr/employees' },
    { id: 'attendance', name: 'Attendance', icon: Calendar, route: '/hr/attendance' },
    { id: 'payroll', name: 'Payroll', icon: DollarSign, route: '/hr/payroll' },
    { id: 'leaves', name: 'Leave Management', icon: Calendar, route: '/hr/leaves' },
]

const REPORTS_ACTIONS = [
    { id: 'balance-sheet', name: 'Balance Sheet', icon: FileSpreadsheet, route: '/accounting/reports' },
    { id: 'pl', name: 'Profit & Loss', icon: FileSpreadsheet, route: '/accounting/reports' },
    { id: 'trial-balance', name: 'Trial Balance', icon: FileSpreadsheet, route: '/accounting/reports' },
    { id: 'stock-summary', name: 'Stock Summary', icon: FileSpreadsheet, route: '/reports/stock' },
    { id: 'sales-register', name: 'Sales Register', icon: FileText, route: '/reports/sales' },
    { id: 'purchase-register', name: 'Purchase Register', icon: FileText, route: '/reports/purchase' },
]

const SYSTEM_ACTIONS = [
    { id: 'backup', name: 'Take Backup', icon: Download, shortcut: 'Ctrl+B', action: 'backup' },
    { id: 'restore', name: 'Restore Backup', icon: Upload, shortcut: 'Ctrl+R', action: 'restore' },
    { id: 'export', name: 'Export Data', icon: Download, shortcut: 'Ctrl+E', action: 'export' },
    { id: 'import', name: 'Import Data', icon: Upload, shortcut: 'Ctrl+I', action: 'import' },
    { id: 'print', name: 'Print', icon: Printer, shortcut: 'Ctrl+P', action: 'print' },
]

function CommandPalette({ isOpen, onClose, onSelect }) {
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [activeTab, setActiveTab] = useState('vouchers')
    const [backendResults, setBackendResults] = useState([])

    const tabs = [
        { id: 'vouchers', name: 'Vouchers', icon: FileText },
        { id: 'inventory', name: 'Inventory', icon: Package },
        { id: 'accounting', name: 'Accounting', icon: Calculator },
        { id: 'payroll', name: 'Payroll', icon: Users },
        { id: 'reports', name: 'Reports', icon: Hash },
        { id: 'system', name: 'System', icon: Settings },
    ]

    const allActions = {
        vouchers: VOUCHER_TYPES,
        inventory: INVENTORY_ACTIONS,
        accounting: ACCOUNTING_ACTIONS,
        payroll: PAYROLL_ACTIONS,
        reports: REPORTS_ACTIONS,
        system: SYSTEM_ACTIONS,
    }

    // Backend search
    useEffect(() => {
        if (searchTerm.length < 2) {
            setBackendResults([])
            return
        }
        const timer = setTimeout(async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/search?q=${searchTerm}`)
                const data = await res.json()
                setBackendResults(data.map(item => ({
                    id: `bs-${item.link}`,
                    name: item.title,
                    icon: Search,
                    route: item.link,
                    color: 'bg-indigo-600',
                    shortcut: item.type
                })))
            } catch (e) {
                console.error(e)
            }
        }, 300)
        return () => clearTimeout(timer)
    }, [searchTerm])

    const currentActions = [...(allActions[activeTab] || []), ...backendResults]

    const filteredActions = currentActions.filter(action =>
        !searchTerm ||
        action.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        action.id.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleKeyDown = useCallback((e) => {
        if (!isOpen) return

        if (e.key === 'Escape') {
            e.preventDefault()
            onClose()
            return
        }

        if (e.key === 'ArrowDown') {
            e.preventDefault()
            setSelectedIndex(prev => Math.min(prev + 1, filteredActions.length - 1))
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setSelectedIndex(prev => Math.max(prev - 1, 0))
        } else if (e.key === 'Enter' && filteredActions[selectedIndex]) {
            e.preventDefault()
            handleSelect(filteredActions[selectedIndex])
        } else if (e.key === 'Tab') {
            e.preventDefault()
            const currentIndex = tabs.findIndex(t => t.id === activeTab)
            const nextIndex = e.shiftKey
                ? Math.max(currentIndex - 1, 0)
                : Math.min(currentIndex + 1, tabs.length - 1)
            setActiveTab(tabs[nextIndex].id)
        }
    }, [isOpen, filteredActions, selectedIndex, activeTab, onClose])

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown)
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown)
        }
    }, [isOpen, handleKeyDown])

    useEffect(() => {
        setSelectedIndex(0)
    }, [activeTab, searchTerm])

    const handleSelect = (action) => {
        if (action.action) {
            onSelect(action.action, action)
        } else if (action.route) {
            onSelect('navigate', action.route)
            onClose()
        }
    }

    const renderActionIcon = (action) => {
        const Icon = action.icon
        return (
            <div className={`p-2 rounded-lg ${action.color || 'bg-blue-600/20'} ${action.color ? '' : 'text-blue-400'}`}>
                <Icon size={20} className={action.color ? 'text-white' : ''} />
            </div>
        )
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={onClose}>
            <div
                className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-[800px] max-h-[600px] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-4 border-b border-gray-700">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search vouchers, items, reports... (Ctrl+K)"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                            className="w-full bg-gray-800 border border-gray-600 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-blue-500 text-lg"
                        />
                        <button
                            onClick={onClose}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex gap-1 mt-3 bg-gray-800 rounded-lg p-1">
                        {tabs.map(tab => {
                            const TabIcon = tab.icon
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex-1 flex items-center gap-2 px-3 py-2 rounded text-sm capitalize transition-all ${activeTab === tab.id
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700'
                                        }`}
                                >
                                    <TabIcon size={16} />
                                    {tab.name}
                                </button>
                            )
                        })}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2">
                    {filteredActions.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">
                            <FileText size={48} className="mx-auto mb-4 opacity-50" />
                            <p className="text-lg">No results found</p>
                            <p className="text-sm mt-1">Try a different search term</p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {filteredActions.map((action, index) => (
                                <button
                                    key={action.id}
                                    onClick={() => handleSelect(action)}
                                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${index === selectedIndex
                                            ? 'bg-blue-600'
                                            : 'bg-gray-800 hover:bg-gray-750'
                                        }`}
                                >
                                    {renderActionIcon(action)}
                                    <div className="flex-1 text-left">
                                        <div className={`font-medium ${index === selectedIndex ? 'text-white' : 'text-gray-100'}`}>
                                            {action.name}
                                        </div>
                                        {action.shortcut && (
                                            <div className={`text-xs ${index === selectedIndex ? 'text-blue-200' : 'text-gray-500'}`}>
                                                Press <kbd className="bg-gray-700 px-1.5 py-0.5 rounded ml-1">{action.shortcut}</kbd>
                                            </div>
                                        )}
                                    </div>
                                    {action.route && (
                                        <ArrowRight size={16} className={index === selectedIndex ? 'text-blue-200' : 'text-gray-600'} />
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-gray-700">
                    <div className="flex items-center justify-between text-sm text-gray-400">
                        <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                                <kbd className="bg-gray-700 px-1.5 py-0.5 rounded text-xs">↑↓</kbd> Navigate
                            </span>
                            <span className="flex items-center gap-1">
                                <kbd className="bg-gray-700 px-1.5 py-0.5 rounded text-xs">Enter</kbd> Select
                            </span>
                            <span className="flex items-center gap-1">
                                <kbd className="bg-gray-700 px-1.5 py-0.5 rounded text-xs">Tab</kbd> Switch Tab
                            </span>
                            <span className="flex items-center gap-1">
                                <kbd className="bg-gray-700 px-1.5 py-0.5 rounded text-xs">Esc</kbd> Close
                            </span>
                        </div>
                        <button onClick={() => onSelect('help')} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                            <HelpCircle size={16} />
                            <span>View All Shortcuts</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CommandPalette
