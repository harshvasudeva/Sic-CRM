import { useState, useEffect, useCallback } from 'react'
import Modal from './Modal'

const SHORTCUTS = {
    'F1': 'Help / Select',
    'F2': 'Date',
    'F4': 'Contra Voucher',
    'F5': 'Payment Voucher',
    'F6': 'Receipt Voucher',
    'F7': 'Journal Voucher',
    'F8': 'Sales Voucher',
    'F9': 'Purchase Voucher',
    'F10': 'Memo Voucher',
    'Ctrl+A': 'Accept/Alter',
    'Ctrl+Enter': 'Accept Form',
    'Alt+C': 'Cancel Voucher',
    'Alt+I': 'Voucher Register',
    'Alt+P': 'Print',
    'Ctrl+P': 'Print',
    'Ctrl+E': 'Export',
    'Ctrl+K': 'Command Palette',
    'Ctrl+S': 'Save',
    'Ctrl+B': 'Backup',
    'Ctrl+R': 'Restore',
    'Alt+G': 'Go to Field',
    'Alt+R': 'Repeat Narration',
    'Alt+N': 'New Voucher',
    'Alt+D': 'Delete Line',
    'Alt+U': 'Duplicate Line',
    'Alt+T': 'Calculator',
    'Esc': 'Cancel / Close',
    'Enter': 'Next Field / Accept',
    'Tab': 'Next Field',
    'Shift+Tab': 'Previous Field',
    'Arrow Up': 'Move Up',
    'Arrow Down': 'Move Down',
    'Arrow Left': 'Move Left',
    'Arrow Right': 'Move Right',
    'Home': 'First Field',
    'End': 'Last Field',
    'PageUp': 'Page Up',
    'PageDown': 'Page Down',
    'Delete': 'Delete Line Item',
    'Insert': 'Add Line Item',
    'Ctrl+Z': 'Undo',
    'Ctrl+Y': 'Redo',
    'Ctrl+F': 'Find / Search',
    'Ctrl+N': 'New',
    'Ctrl+O': 'Open',
    'Ctrl+W': 'Close Window',
    'Ctrl+Q': 'Quit Application',
}

const VOUCHER_SHORTCUTS = {
    payment: 'F5',
    receipt: 'F6',
    journal: 'F7',
    sales: 'F8',
    purchase: 'F9',
    contra: 'F4',
    memo: 'F10',
    creditNote: 'Ctrl+F8',
    debitNote: 'Ctrl+F9',
    deliveryChallan: 'Alt+F8',
    receiptNote: 'Alt+F6',
    reversalJournal: 'Alt+F7',
    stockJournal: 'Alt+F10',
    physicalStock: 'Alt+P',
    purchaseOrder: 'Alt+O',
    salesOrder: 'Alt+S',
    rejectionsIn: 'Alt+R',
    rejectionsOut: 'Alt+E',
}

const TALLY_FEATURES = {
    vouchers: [
        { key: 'payment', name: 'Payment Voucher', shortcut: 'F5', description: 'Record cash/bank payments to vendors and expenses' },
        { key: 'receipt', name: 'Receipt Voucher', shortcut: 'F6', description: 'Record cash/bank receipts from customers' },
        { key: 'contra', name: 'Contra Voucher', shortcut: 'F4', description: 'Transfer between cash and bank accounts' },
        { key: 'journal', name: 'Journal Voucher', shortcut: 'F7', description: 'Record non-cash transactions and adjustments' },
        { key: 'sales', name: 'Sales Voucher', shortcut: 'F8', description: 'Create sales invoices and credit sales' },
        { key: 'purchase', name: 'Purchase Voucher', shortcut: 'F9', description: 'Create purchase invoices from vendors' },
        { key: 'memo', name: 'Memo Voucher', shortcut: 'F10', description: 'Record stock and accounting memos' },
        { key: 'creditNote', name: 'Credit Note', shortcut: 'Ctrl+F8', description: 'Issue credit notes to customers' },
        { key: 'debitNote', name: 'Debit Note', shortcut: 'Ctrl+F9', description: 'Issue debit notes to vendors' },
        { key: 'delivery', name: 'Delivery Challan', shortcut: 'Alt+F8', description: 'Create delivery notes for sales' },
        { key: 'receiptNote', name: 'Receipt Note', shortcut: 'Alt+F6', description: 'Create receipt notes for purchases' },
        { key: 'reversal', name: 'Reversal Journal', shortcut: 'Alt+F7', description: 'Reverse posted vouchers' },
    ],
    inventory: [
        { key: 'stockJournal', name: 'Stock Journal', shortcut: 'Alt+F10', description: 'Adjust stock quantities manually' },
        { key: 'physicalStock', name: 'Physical Stock', shortcut: 'Alt+P', description: 'Verify and reconcile physical stock' },
        { key: 'stockTransfer', name: 'Stock Transfer', shortcut: 'Alt+T', description: 'Transfer stock between warehouses' },
        { key: 'reorderLevel', name: 'Reorder Level', description: 'Set minimum stock for reorder alerts' },
        { key: 'batchWise', name: 'Batch-wise Stock', description: 'Track inventory by batch numbers' },
        { key: 'multipleUnits', name: 'Alternate Units', description: 'Multiple units of measure per item' },
        { key: 'priceLists', name: 'Multiple Price Lists', description: 'Different price levels for customers' },
    ],
    accounting: [
        { key: 'costCenter', name: 'Cost Centers', description: 'Track expenses by department/project' },
        { key: 'costCategory', name: 'Cost Categories', description: 'Group cost centers by category' },
        { key: 'multipleCurrency', name: 'Multi-Currency', description: 'Transact in multiple currencies' },
        { key: 'billByBill', name: 'Bill-by-Bill', description: 'Reference purchase to sales orders' },
        { key: 'interestCalc', name: 'Interest Calculation', description: 'Auto-calculate interest on dues' },
        { key: 'tds', name: 'TDS (Tax Deducted at Source)', description: 'Calculate and deduct TDS' },
        { key: 'gst', name: 'GST / VAT', description: 'Compliant GST invoicing and reporting' },
        { key: 'excise', name: 'Excise Duty', description: 'Manufacturing excise tracking' },
        { key: 'budgetControl', name: 'Budget & Cost Control', description: 'Monitor budgets vs actuals' },
        { key: 'tallyVault', name: 'Tally Vault', description: 'Secure data encryption' },
    ],
    reports: [
        { key: 'balanceSheet', name: 'Balance Sheet', description: 'Assets = Liabilities + Equity' },
        { key: 'pl', name: 'Profit & Loss', description: 'Revenue - Expenses = Profit/Loss' },
        { key: 'trialBalance', name: 'Trial Balance', description: 'Debit = Credit verification' },
        { key: 'stockSummary', name: 'Stock Summary', description: 'Item-wise stock position' },
        { key: 'vatCompliance', name: 'VAT Compliance', description: 'VAT returns and registers' },
        { key: 'gstReturns', name: 'GST Returns', description: 'GSTR-1, GSTR-2, GSTR-3' },
        { key: 'tdsReturns', name: 'TDS Returns', description: 'Form 26Q, 26AS, 27EQ' },
        { key: 'exciseRegister', name: 'Excise Registers', description: 'RG-1, RG-23C reports' },
        { key: 'misReports', name: 'MIS Reports', description: 'Management Information System reports' },
    ],
    payroll: [
        { key: 'employee', name: 'Employee Master', description: 'Complete employee profiles' },
        { key: 'attendance', name: 'Attendance', description: 'Daily attendance and leave management' },
        { key: 'payroll', name: 'Payroll', description: 'Salary processing and payslips' },
        { key: 'esic', name: 'ESIC Contribution', description: 'ESIC returns and payments' },
        { key: 'pf', name: 'PF Contribution', description: 'PF returns and payments' },
        { key: 'professionalTax', name: 'Professional Tax', description: 'PTEC registration and payments' },
        { key: 'gratuity', name: 'Gratuity', description: 'Gratuity calculation and payment' },
        { key: 'bonus', name: 'Bonus', description: 'Ex-gratia and performance bonus' },
    ],
}

function ShortcutHelp({ isOpen, onClose }) {
    const [searchTerm, setSearchTerm] = useState('')
    const [activeCategory, setActiveCategory] = useState('all')

    const categories = ['all', 'vouchers', 'inventory', 'accounting', 'reports', 'payroll']

    const filteredShortcuts = Object.entries(SHORTCUTS).filter(([key, description]) => {
        if (searchTerm) {
            return key.toLowerCase().includes(searchTerm.toLowerCase()) ||
                   description.toLowerCase().includes(searchTerm.toLowerCase())
        }
        return true
    })

    const filteredFeatures = Object.entries(TALLY_FEATURES).reduce((acc, [category, features]) => {
        if (activeCategory === 'all' || activeCategory === category) {
            acc[category] = features.filter(f =>
                !searchTerm ||
                f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                f.description.toLowerCase().includes(searchTerm.toLowerCase())
            )
        }
        return acc
    }, {})

    const handleShortcut = useCallback((e) => {
        const key = e.key
        let modifier = ''
        if (e.ctrlKey) modifier += 'Ctrl+'
        if (e.altKey) modifier += 'Alt+'
        if (e.shiftKey) modifier += 'Shift+'
        const fullKey = modifier + key.charAt(0).toUpperCase() + key.slice(1)

        if (SHORTCUTS[fullKey]) {
            e.preventDefault()
            console.log('Shortcut pressed:', fullKey, '-', SHORTCUTS[fullKey])
        }
    }, [])

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleShortcut)
        }
        return () => {
            document.removeEventListener('keydown', handleShortcut)
        }
    }, [isOpen, handleShortcut])

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Keyboard Shortcuts" size="large">
            <div className="flex gap-4 mb-4">
                <input
                    type="text"
                    placeholder="Search shortcuts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                />
                <div className="flex gap-1 bg-gray-800 rounded-lg p-1">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-3 py-1.5 rounded text-sm capitalize ${
                                activeCategory === cat ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-300'
                            }`}
                        >
                            {cat.replace('_', ' ')}
                        </button>
                    ))}
                </div>
            </div>

            <div className="max-h-96 overflow-y-auto">
                {(activeCategory === 'all' || activeCategory === 'shortcuts') && (
                    <div>
                        <h3 className="text-lg font-semibold mb-3 text-blue-400">General Shortcuts</h3>
                        <div className="grid grid-cols-2 gap-2 mb-6">
                            {filteredShortcuts.map(([key, description]) => (
                                <div key={key} className="bg-gray-800 p-3 rounded border border-gray-700">
                                    <div className="flex items-center gap-3">
                                        <kbd className="bg-gray-700 px-2 py-1 rounded font-mono text-xs border border-gray-600">
                                            {key}
                                        </kbd>
                                        <span className="text-sm text-gray-300">{description}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {Object.entries(filteredFeatures).map(([category, features]) => {
                    if (features.length === 0) return null

                    return (
                        <div key={category} className="mb-6">
                            <h3 className="text-lg font-semibold mb-3 text-blue-400 capitalize">
                                {category.replace('_', ' ')} Features
                            </h3>
                            <div className="space-y-2">
                                {features.map(feature => (
                                    <div key={feature.key} className="bg-gray-800 p-3 rounded border border-gray-700">
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex-1">
                                                <div className="font-medium text-white mb-1">{feature.name}</div>
                                                <div className="text-sm text-gray-400">{feature.description}</div>
                                            </div>
                                            {feature.shortcut && (
                                                <kbd className="bg-blue-600/20 text-blue-400 px-3 py-1 rounded font-mono text-sm border border-blue-600/30 whitespace-nowrap">
                                                    {feature.shortcut}
                                                </kbd>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className="mt-4 p-4 bg-gray-800 rounded border border-gray-700">
                <div className="flex items-start gap-3">
                    <div className="p-2 bg-yellow-600/20 rounded">
                        <span className="text-2xl">💡</span>
                    </div>
                    <div>
                        <div className="font-semibold text-yellow-400 mb-1">Tip</div>
                        <div className="text-sm text-gray-300">
                            Press <kbd className="bg-gray-700 px-1.5 py-0.5 rounded font-mono text-xs">Ctrl+K</kbd> to open the command palette for quick access to all features and vouchers.
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    )
}

export { ShortcutHelp, SHORTCUTS, VOUCHER_SHORTCUTS, TALLY_FEATURES }
