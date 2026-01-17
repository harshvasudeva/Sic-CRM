import { getSettings, isDateLocked } from './settingsStore'
import { analyzeTransactionsAI, detectAnomaliesRuleBased } from '../utils/aiService'

const STORAGE_KEYS = {
    chartOfAccounts: 'sic-accounting-coa',
    journalEntries: 'sic-accounting-journal-entries',
    auditLog: 'sic-accounting-audit-log', // Phase 1: Audit Trail
    ledgerAccounts: 'sic-accounting-ledger',
    bankAccounts: 'sic-accounting-bank-accounts',
    taxes: 'sic-accounting-taxes',
    budgets: 'sic-accounting-budgets',
    expenses: 'sic-accounting-expenses',
    accountsPayable: 'sic-accounting-accounts-payable',
    accountsReceivable: 'sic-accounting-accounts-receivable'
}

// ==================== CHART OF ACCOUNTS (Updated for Phase 1 Hierarchy) ====================
// Hierarchy: Primary Group -> Sub Group -> Ledger
const initialChartOfAccounts = [
    // ASSETS
    { id: 'grp-001', code: '1000', name: 'Current Assets', type: 'asset', category: 'group', parent: null, isGroup: true },
    { id: 'grp-002', code: '1100', name: 'Cash and Bank', type: 'asset', category: 'group', parent: 'grp-001', isGroup: true },
    { id: 'coa-001', code: '1110', name: 'Cash in Hand', type: 'asset', category: 'current_assets', parent: 'grp-002', isGroup: false },
    { id: 'coa-002', code: '1120', name: 'HDFC Bank', type: 'asset', category: 'current_assets', parent: 'grp-002', isGroup: false },

    { id: 'grp-003', code: '1200', name: 'Sundry Debtors', type: 'asset', category: 'group', parent: 'grp-001', isGroup: true },
    { id: 'coa-003', code: '1210', name: 'Accounts Receivable', type: 'asset', category: 'current_assets', parent: 'grp-003', isGroup: false },

    // LIABILITIES
    { id: 'grp-004', code: '2000', name: 'Current Liabilities', type: 'liability', category: 'group', parent: null, isGroup: true },
    { id: 'grp-005', code: '2100', name: 'Sundry Creditors', type: 'liability', category: 'group', parent: 'grp-004', isGroup: true },
    { id: 'coa-006', code: '2110', name: 'Accounts Payable', type: 'liability', category: 'current_liabilities', parent: 'grp-005', isGroup: false },

    // EXPENSES
    { id: 'grp-006', code: '5000', name: 'Indirect Expenses', type: 'expense', category: 'group', parent: null, isGroup: true },
    { id: 'coa-010', code: '5100', name: 'Office Rent', type: 'expense', category: 'operating', parent: 'grp-006', isGroup: false },

    // REVENUE
    { id: 'grp-007', code: '3000', name: 'Direct Income', type: 'equity', category: 'group', parent: null, isGroup: true },
    { id: 'coa-008', code: '3100', name: 'Sales Account', type: 'equity', category: 'revenue', parent: 'grp-007', isGroup: false }
]

// ==================== JOURNAL ENTRIES ====================
const initialJournalEntries = [
    {
        id: 'je-001',
        journalNumber: 'JE-2026-001',
        entryDate: '2026-01-15',
        description: 'Sales revenue for Q1',
        reference: 'INV-2026-001',
        lines: [
            { accountId: 'coa-003', debit: 120000, credit: 0, description: 'Accounts Receivable' },
            { accountId: 'coa-008', debit: 0, credit: 120000, description: 'Revenue' }
        ],
        totalDebit: 120000,
        totalCredit: 120000,
        status: 'posted',
        postedBy: 'emp-001',
        createdAt: '2026-01-15'
    }
]

// ==================== BANK ACCOUNTS ====================
const initialBankAccounts = [
    {
        id: 'bank-001',
        accountNumber: '****1234',
        bankName: 'Chase Business',
        accountType: 'checking',
        currency: 'USD',
        balance: 450000,
        openingBalance: 500000,
        asOf: '2026-01-15',
        status: 'active',
        createdAt: '2026-01-01'
    },
    {
        id: 'bank-002',
        accountNumber: '****5678',
        bankName: 'Bank of America',
        accountType: 'savings',
        currency: 'USD',
        balance: 250000,
        openingBalance: 200000,
        asOf: '2026-01-15',
        status: 'active',
        createdAt: '2026-01-01'
    }
]

// ==================== TAXES ====================
const initialTaxes = [
    { id: 'tax-001', name: 'Sales Tax', code: 'ST-01', rate: 8.5, type: 'sales', status: 'active' },
    { id: 'tax-002', name: 'Federal Income Tax', code: 'FIT-01', rate: 21, type: 'income', status: 'active' },
    { id: 'tax-003', name: 'State Income Tax', code: 'SIT-01', rate: 5, type: 'income', status: 'active' }
]

// ==================== BUDGETS ====================
const initialBudgets = [
    {
        id: 'budget-001',
        name: 'Q1 2026 Budget',
        fiscalYear: '2026',
        period: 'Q1',
        department: 'Sales',
        startDate: '2026-01-01',
        endDate: '2026-03-31',
        items: [
            { accountId: 'coa-010', category: 'Marketing', budgeted: 50000, actual: 45000, variance: -5000 }
        ],
        totalBudgeted: 50000,
        totalActual: 45000,
        status: 'active',
        createdAt: '2026-01-01'
    }
]

// ==================== EXPENSES ====================
const initialExpenses = [
    {
        id: 'exp-001',
        expenseNumber: 'EXP-2026-001',
        date: '2026-01-10',
        description: 'Office supplies purchase',
        accountId: 'coa-010',
        categoryId: 'office',
        subcategoryId: 'supplies',
        vendorId: 'vendor-002',
        amount: 2500,
        taxAmount: 212.5,
        totalAmount: 2712.5,
        status: 'paid',
        paidDate: '2026-01-10',
        approvedBy: 'emp-001',
        notes: 'Monthly office supplies',
        createdAt: '2026-01-10'
    }
]

// ==================== ACCOUNTS PAYABLE ====================
const initialAccountsPayable = [
    {
        id: 'ap-001',
        vendorId: 'vendor-001',
        invoiceNumber: 'INV-2026-001',
        invoiceDate: '2026-01-21',
        dueDate: '2026-02-20',
        amount: 5600,
        balance: 5600,
        status: 'pending',
        paidAmount: 0,
        createdAt: '2026-01-21'
    }
]

// ==================== ACCOUNTS RECEIVABLE ====================
const initialAccountsReceivable = [
    {
        id: 'ar-001',
        customerId: 'cont-001',
        invoiceNumber: 'INV-2026-001',
        invoiceDate: '2026-01-12',
        dueDate: '2026-02-11',
        amount: 120000,
        balance: 120000,
        status: 'pending',
        paidAmount: 0,
        daysOverdue: 0,
        createdAt: '2026-01-12'
    }
]

// ==================== HELPERS ====================
function getStore(key, initial) {
    const stored = localStorage.getItem(key)
    if (stored) return JSON.parse(stored)
    localStorage.setItem(key, JSON.stringify(initial))
    return initial
}

function setStore(key, data) {
    localStorage.setItem(key, JSON.stringify(data))
}

function generateNumber(prefix, year, sequence) {
    return `${prefix}-${year}-${String(sequence).padStart(4, '0')}`
}

// ==================== CHART OF ACCOUNTS CRUD ====================
export function getChartOfAccounts(filters = {}) {
    let coa = getStore(STORAGE_KEYS.chartOfAccounts, initialChartOfAccounts)
    if (filters.type) coa = coa.filter(a => a.type === filters.type)
    if (filters.category) coa = coa.filter(a => a.category === filters.category)
    return coa
}

export function getAccount(id) {
    return getChartOfAccounts().find(a => a.id === id)
}

export function createAccount(data) {
    const coa = getStore(STORAGE_KEYS.chartOfAccounts, initialChartOfAccounts)
    const newAccount = {
        ...data,
        id: `coa-${Date.now()}`,
        createdAt: new Date().toISOString().split('T')[0]
    }
    coa.push(newAccount)
    setStore(STORAGE_KEYS.chartOfAccounts, coa)
    return newAccount
}

export function updateAccount(id, data) {
    const coa = getStore(STORAGE_KEYS.chartOfAccounts, initialChartOfAccounts)
    const index = coa.findIndex(a => a.id === id)
    if (index === -1) return null
    coa[index] = { ...coa[index], ...data }
    setStore(STORAGE_KEYS.chartOfAccounts, coa)
    return coa[index]
}

export function deleteAccount(id) {
    const coa = getStore(STORAGE_KEYS.chartOfAccounts, initialChartOfAccounts).filter(a => a.id !== id)
    setStore(STORAGE_KEYS.chartOfAccounts, coa)
    return true
}

// ==================== JOURNAL ENTRIES CRUD ====================
export function getJournalEntries(filters = {}) {
    let entries = getStore(STORAGE_KEYS.journalEntries, initialJournalEntries)
    if (filters.status) entries = entries.filter(e => e.status === filters.status)
    if (filters.startDate) entries = entries.filter(e => e.entryDate >= filters.startDate)
    if (filters.endDate) entries = entries.filter(e => e.entryDate <= filters.endDate)
    return entries
}

// Phase 2: Bank Reconciliation Action
export function reconcileTransaction(entryId, bankDate) {
    const entries = getStore(STORAGE_KEYS.journalEntries, initialJournalEntries)
    const index = entries.findIndex(e => e.id === entryId)
    if (index === -1) throw new Error('Entry not found')

    entries[index] = {
        ...entries[index],
        reconciled: true,
        bankDate: bankDate
    }
    setStore(STORAGE_KEYS.journalEntries, entries)
    return entries[index]
}


// Phase 1: Audit Logger
function logAudit(action, entity, entityId, details, user = 'system') {
    const logs = getStore(STORAGE_KEYS.auditLog, [])
    logs.push({
        id: `audit-${Date.now()}`,
        timestamp: new Date().toISOString(),
        action, entity, entityId, details, user
    })
    setStore(STORAGE_KEYS.auditLog, logs)
}

export function createJournalEntry(data) {
    const entries = getStore(STORAGE_KEYS.journalEntries, initialJournalEntries)

    // Phase 1: Date Lock Check (Fiscal Year)
    if (isDateLocked(data.entryDate)) {
        throw new Error('Transaction date is in a locked fiscal period.')
    }

    const startCount = entries.length
    // Phase 1: Voucher Numbering (e.g., JE-2026-001)
    const journalNumber = data.journalNumber || generateNumber('JE', new Date().getFullYear(), startCount + 1)

    // Phase 1: Strict Double Entry Validation
    const totalDebit = data.lines.reduce((sum, line) => sum + (Number(line.debit) || 0), 0)
    const totalCredit = data.lines.reduce((sum, line) => sum + (Number(line.credit) || 0), 0)

    // Allow small rounding difference (floating point)
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
        throw new Error(`Double Entry Violation: Debits (${totalDebit}) must equal Credits (${totalCredit})`)
    }

    const newEntry = {
        ...data,
        id: `je-${Date.now()}`,
        journalNumber,
        entryDate: data.entryDate || new Date().toISOString().split('T')[0],
        totalDebit,
        totalCredit,
        status: 'posted', // Auto-post for Phase 1
        voucherType: data.voucherType || 'Journal',

        // Phase 2: Banking & Instrument Details
        instrumentType: data.instrumentType || null, // Cheque, NEFT, UPI
        instrumentNumber: data.instrumentNumber || null,
        instrumentDate: data.instrumentDate || null,
        bankDate: null, // For BRS (Cleared Date)
        reconciled: false,

        createdAt: new Date().toISOString()
    }

    entries.push(newEntry)
    setStore(STORAGE_KEYS.journalEntries, entries)

    // Log Audit
    logAudit('CREATE', 'JournalEntry', newEntry.id, `Created voucher ${journalNumber} for ${totalDebit}`)

    return newEntry
}


export function postJournalEntry(id) {
    const entries = getStore(STORAGE_KEYS.journalEntries, initialJournalEntries)
    const index = entries.findIndex(e => e.id === id)
    if (index === -1) return null
    entries[index] = { ...entries[index], status: 'posted', postedAt: new Date().toISOString().split('T')[0] }
    setStore(STORAGE_KEYS.journalEntries, entries)
    return entries[index]
}

export function updateJournalEntry(id, data) {
    const entries = getStore(STORAGE_KEYS.journalEntries, initialJournalEntries)
    const index = entries.findIndex(e => e.id === id)
    if (index === -1) return null
    entries[index] = { ...entries[index], ...data }
    setStore(STORAGE_KEYS.journalEntries, entries)
    return entries[index]
}

// ==================== BANK ACCOUNTS CRUD ====================
export function getBankAccounts() {
    return getStore(STORAGE_KEYS.bankAccounts, initialBankAccounts)
}

export function createBankAccount(data) {
    const accounts = getStore(STORAGE_KEYS.bankAccounts, initialBankAccounts)
    const newAccount = {
        ...data,
        id: `bank-${Date.now()}`,
        currency: data.currency || getSettings().currency || 'INR',
        balance: data.openingBalance || 0,
        asOf: data.asOf || new Date().toISOString().split('T')[0],
        status: 'active',
        createdAt: new Date().toISOString().split('T')[0]
    }
    accounts.push(newAccount)
    setStore(STORAGE_KEYS.bankAccounts, accounts)
    return newAccount
}

export function updateBankAccount(id, data) {
    const accounts = getStore(STORAGE_KEYS.bankAccounts, initialBankAccounts)
    const index = accounts.findIndex(a => a.id === id)
    if (index === -1) return null
    accounts[index] = { ...accounts[index], ...data }
    setStore(STORAGE_KEYS.bankAccounts, accounts)
    return accounts[index]
}

// ==================== BUDGETS CRUD ====================
export function getBudgets(filters = {}) {
    let budgets = getStore(STORAGE_KEYS.budgets, initialBudgets)
    if (filters.status) budgets = budgets.filter(b => b.status === filters.status)
    if (filters.department) budgets = budgets.filter(b => b.department === filters.department)
    return budgets
}

export function createBudget(data) {
    const budgets = getStore(STORAGE_KEYS.budgets, initialBudgets)

    const totalBudgeted = data.items.reduce((sum, item) => sum + item.budgeted, 0)

    const newBudget = {
        ...data,
        id: `budget-${Date.now()}`,
        totalBudgeted,
        totalActual: 0,
        status: 'active',
        createdAt: new Date().toISOString().split('T')[0]
    }
    budgets.push(newBudget)
    setStore(STORAGE_KEYS.budgets, budgets)
    return newBudget
}

export function updateBudget(id, data) {
    const budgets = getStore(STORAGE_KEYS.budgets, initialBudgets)
    const index = budgets.findIndex(b => b.id === id)
    if (index === -1) return null
    budgets[index] = { ...budgets[index], ...data }
    setStore(STORAGE_KEYS.budgets, budgets)
    return budgets[index]
}

// ==================== EXPENSES CRUD ====================
export function getExpenses(filters = {}) {
    let expenses = getStore(STORAGE_KEYS.expenses, initialExpenses)
    if (filters.status) expenses = expenses.filter(e => e.status === filters.status)
    if (filters.categoryId) expenses = expenses.filter(e => e.categoryId === filters.categoryId)
    return expenses
}

export function createExpense(data) {
    const expenses = getStore(STORAGE_KEYS.expenses, initialExpenses)
    const existingCount = expenses.length
    const expenseNumber = generateNumber('EXP', new Date().getFullYear(), existingCount + 1)

    const newExpense = {
        ...data,
        id: `exp-${Date.now()}`,
        expenseNumber: data.expenseNumber || expenseNumber,
        date: data.date || new Date().toISOString().split('T')[0],
        taxAmount: data.taxAmount || 0,
        totalAmount: data.amount + (data.taxAmount || 0),
        status: 'pending',
        paidDate: null,
        approvedBy: null,
        createdAt: new Date().toISOString().split('T')[0]
    }
    expenses.push(newExpense)
    setStore(STORAGE_KEYS.expenses, expenses)
    return newExpense
}

export function approveExpense(id, approvedBy) {
    const expenses = getStore(STORAGE_KEYS.expenses, initialExpenses)
    const index = expenses.findIndex(e => e.id === id)
    if (index === -1) return null
    expenses[index] = { ...expenses[index], approvedBy, status: 'approved' }
    setStore(STORAGE_KEYS.expenses, expenses)
    return expenses[index]
}

export function payExpense(id, paidDate) {
    const expenses = getStore(STORAGE_KEYS.expenses, initialExpenses)
    const index = expenses.findIndex(e => e.id === id)
    if (index === -1) return null
    expenses[index] = { ...expenses[index], status: 'paid', paidDate: paidDate || new Date().toISOString().split('T')[0] }
    setStore(STORAGE_KEYS.expenses, expenses)
    return expenses[index]
}

// ==================== ACCOUNTS PAYABLE CRUD ====================
export function getAccountsPayable(filters = {}) {
    let ap = getStore(STORAGE_KEYS.accountsPayable, initialAccountsPayable)
    if (filters.status) ap = ap.filter(a => a.status === filters.status)
    if (filters.vendorId) ap = ap.filter(a => a.vendorId === filters.vendorId)
    return ap
}

export function createAccountsPayable(data) {
    const ap = getStore(STORAGE_KEYS.accountsPayable, initialAccountsPayable)

    const newAP = {
        ...data,
        id: `ap-${Date.now()}`,
        invoiceDate: data.invoiceDate || new Date().toISOString().split('T')[0],
        dueDate: data.dueDate || new Date().toISOString().split('T')[0],
        balance: data.amount,
        status: 'pending',
        paidAmount: 0,
        createdAt: new Date().toISOString().split('T')[0]
    }
    ap.push(newAP)
    setStore(STORAGE_KEYS.accountsPayable, ap)
    return newAP
}

export function payAccountsPayable(id, amount) {
    const ap = getStore(STORAGE_KEYS.accountsPayable, initialAccountsPayable)
    const index = ap.findIndex(a => a.id === id)
    if (index === -1) return null

    ap[index] = {
        ...ap[index],
        paidAmount: ap[index].paidAmount + amount,
        balance: ap[index].balance - amount,
        status: ap[index].balance <= amount ? 'paid' : 'partial'
    }
    setStore(STORAGE_KEYS.accountsPayable, ap)
    return ap[index]
}

// ==================== ACCOUNTS RECEIVABLE CRUD ====================
export function getAccountsReceivable(filters = {}) {
    let ar = getStore(STORAGE_KEYS.accountsReceivable, initialAccountsReceivable)
    if (filters.status) ar = ar.filter(a => a.status === filters.status)
    if (filters.overdue) {
        const today = new Date().toISOString().split('T')[0]
        ar = ar.filter(a => a.status === 'pending' && a.dueDate < today)
    }
    return ar
}

export function createAccountsReceivable(data) {
    const ar = getStore(STORAGE_KEYS.accountsReceivable, initialAccountsReceivable)

    const existingCount = ar.length
    // Phase 6: Tax Integration
    const taxRate = data.taxRate || 18 // Default 18% if not specified
    const amount = Number(data.amount) || 0
    const taxAmount = (amount * taxRate) / (100 + taxRate) // Back-calculate tax from inclusive amount
    const taxableValue = amount - taxAmount

    const newAR = {
        ...data,
        id: `ar-${Date.now()}`,
        invoiceDate: data.invoiceDate || new Date().toISOString().split('T')[0],
        dueDate: data.dueDate || new Date().toISOString().split('T')[0],

        // Financials
        amount,
        taxableValue,
        taxRate,
        taxAmount,

        balance: amount,
        status: 'pending',
        paidAmount: 0,
        daysOverdue: 0,
        createdAt: new Date().toISOString().split('T')[0]
    }
    ar.push(newAR)
    setStore(STORAGE_KEYS.accountsReceivable, ar)
    return newAR
}

export function receiveAccountsReceivable(id, amount) {
    const ar = getStore(STORAGE_KEYS.accountsReceivable, initialAccountsReceivable)
    const index = ar.findIndex(a => a.id === id)
    if (index === -1) return null

    ar[index] = {
        ...ar[index],
        paidAmount: ar[index].paidAmount + amount,
        balance: ar[index].balance - amount,
        status: ar[index].balance <= amount ? 'paid' : 'partial'
    }
    setStore(STORAGE_KEYS.accountsReceivable, ar)
    return ar[index]
}

// ==================== ESTIMATES (QUOTES) CRUD (Phase 3) ====================
export function getEstimates(filters = {}) {
    let estimates = getStore('sic-accounting-estimates', [])
    if (filters.status) estimates = estimates.filter(e => e.status === filters.status)
    if (filters.customerId) estimates = estimates.filter(e => e.customerId === filters.customerId)
    return estimates
}

export function createEstimate(data) {
    const estimates = getStore('sic-accounting-estimates', [])
    const existingCount = estimates.length
    const estimateNumber = generateNumber('EST', new Date().getFullYear(), existingCount + 1)

    const newEstimate = {
        ...data,
        id: `est-${Date.now()}`,
        estimateNumber: data.estimateNumber || estimateNumber,
        date: data.date || new Date().toISOString().split('T')[0],
        expiryDate: data.expiryDate || new Date().toISOString().split('T')[0],
        status: 'draft', // draft, sent, accepted, rejected, invoiced
        totalAmount: data.amount, // Simplified for Phase 3
        createdAt: new Date().toISOString().split('T')[0]
    }
    estimates.push(newEstimate)
    setStore('sic-accounting-estimates', estimates)
    return newEstimate
}

export function updateEstimateStatus(id, status) {
    const estimates = getStore('sic-accounting-estimates', [])
    const index = estimates.findIndex(e => e.id === id)
    if (index === -1) return null
    estimates[index] = { ...estimates[index], status }
    setStore('sic-accounting-estimates', estimates)
    return estimates[index]
}

export function convertEstimateToInvoice(estimateId) {
    const estimates = getStore('sic-accounting-estimates', [])
    const estimate = estimates.find(e => e.id === estimateId)
    if (!estimate) throw new Error('Estimate not found')

    // Create Invoice (AR)
    const newInvoice = createAccountsReceivable({
        customerId: estimate.customerId,
        amount: estimate.totalAmount,
        invoiceDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Net 30 default
        status: 'pending',
        notes: `Converted from Estimate ${estimate.estimateNumber}`
    })

    // Update Estimate Status
    updateEstimateStatus(estimateId, 'invoiced')

    return newInvoice
}

// ==================== PURCHASE ORDERS & GRN (Phase 4) ====================
export function getPurchaseOrders(filters = {}) {
    let pos = getStore('sic-accounting-pos', [])
    if (filters.status) pos = pos.filter(p => p.status === filters.status)
    return pos
}

export function createPurchaseOrder(data) {
    const pos = getStore('sic-accounting-pos', [])
    const existingCount = pos.length
    const poNumber = generateNumber('PO', new Date().getFullYear(), existingCount + 1)

    const newPO = {
        ...data,
        id: `po-${Date.now()}`,
        poNumber: poNumber,
        date: data.date || new Date().toISOString().split('T')[0],
        expectedDate: data.expectedDate || null,
        status: 'open', // open, received, billed
        totalAmount: data.amount,
        vendorId: data.vendorId,
        createdAt: new Date().toISOString()
    }
    pos.push(newPO)
    setStore('sic-accounting-pos', pos)
    return newPO
}

export function createGRN(poId, receivedDate) {
    const pos = getStore('sic-accounting-pos', [])
    const index = pos.findIndex(p => p.id === poId)
    if (index === -1) throw new Error('PO not found')

    // Update PO Status
    pos[index] = { ...pos[index], status: 'received' }
    setStore('sic-accounting-pos', pos)

    // Create Bill (AP)
    createAccountsPayable({
        vendorId: pos[index].vendorId,
        billNumber: `BILL-${pos[index].poNumber}`,
        billDate: receivedDate || new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        amount: pos[index].totalAmount
    })

    // logAudit('CREATE', 'GRN', poId, `Goods Received for PO ${pos[index].poNumber}`)
}

// ==================== INVENTORY & COSTING (Phase 5) ====================
export function getStockItems() {
    return getStore('sic-accounting-stock-items', [])
}

export function createStockItem(data) {
    const items = getStore('sic-accounting-stock-items', [])
    const newItem = {
        ...data,
        id: `item-${Date.now()}`,
        sku: data.sku || `SKU-${items.length + 1}`,
        valuationMethod: data.valuationMethod || 'FIFO', // FIFO, Weighted Average
        currentStock: 0,
        currentValue: 0,
        createdAt: new Date().toISOString()
    }
    items.push(newItem)
    setStore('sic-accounting-stock-items', items)
    return newItem
}

export function createStockJournal(data) {
    const items = getStore('sic-accounting-stock-items', [])
    const journals = getStore('sic-accounting-stock-journals', [])

    // Process each line item
    data.lines.forEach(line => {
        const itemIndex = items.findIndex(i => i.id === line.itemId)
        if (itemIndex === -1) return

        const qty = Number(line.qty)
        const rate = Number(line.rate)

        if (data.type === 'in') {
            // Purchase / Inward
            items[itemIndex].currentStock += qty
            items[itemIndex].currentValue += (qty * rate)
        } else if (data.type === 'out') {
            // Sale / Outward
            if (items[itemIndex].currentStock < qty) throw new Error(`Insufficient stock for ${items[itemIndex].name}`)
            items[itemIndex].currentStock -= qty

            // Simple valuation adjustment (Average Cost implication)
            const avgRate = items[itemIndex].currentValue / (items[itemIndex].currentStock + qty)
            items[itemIndex].currentValue -= (qty * avgRate)
        }
    })

    const newJournal = {
        ...data,
        id: `sj-${Date.now()}`,
        date: data.date || new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString()
    }
    journals.push(newJournal)

    setStore('sic-accounting-stock-items', items)
    setStore('sic-accounting-stock-journals', journals)
    return newJournal
}

export function getInventoryValuationReport() {
    const items = getStore('sic-accounting-stock-items', [])
    return items.map(item => ({
        ...item,
        avgRate: item.currentStock > 0 ? (item.currentValue / item.currentStock) : 0
    }))
}

// ==================== FINANCIAL REPORTS ====================
export function getTrialBalance(asOf) {
    const asOfDate = asOf || new Date().toISOString().split('T')[0]
    const journalEntries = getJournalEntries({ status: 'posted', endDate: asOfDate })

    const balances = {}
    journalEntries.forEach(entry => {
        entry.lines.forEach(line => {
            if (!balances[line.accountId]) {
                balances[line.accountId] = { debit: 0, credit: 0 }
            }
            balances[line.accountId].debit += line.debit
            balances[line.accountId].credit += line.credit
        })
    })

    return Object.entries(balances).map(([accountId, amounts]) => {
        const account = getAccount(accountId)
        return {
            accountId,
            accountName: account?.name || 'Unknown',
            accountType: account?.type || 'asset',
            debit: amounts.debit,
            credit: amounts.credit,
            balance: amounts.debit - amounts.credit
        }
    })
}

export function getProfitAndLoss(startDate, endDate) {
    const journalEntries = getJournalEntries({ status: 'posted', startDate, endDate })

    let revenue = 0
    let expenses = 0
    let cogs = 0

    journalEntries.forEach(entry => {
        entry.lines.forEach(line => {
            const account = getAccount(line.accountId)
            if (!account) return

            if (account.type === 'equity' && account.category === 'revenue') {
                revenue += line.credit - line.debit
            } else if (account.type === 'expense') {
                if (account.category === 'cogs') {
                    cogs += line.debit - line.credit
                } else if (account.category === 'operating') {
                    expenses += line.debit - line.credit
                }
            }
        })
    })

    return {
        revenue,
        cogs,
        grossProfit: revenue - cogs,
        expenses,
        netProfit: revenue - cogs - expenses,
        startDate,
        endDate
    }
}

export function getBalanceSheet(asOf) {
    const trialBalance = getTrialBalance(asOf)

    let totalAssets = 0
    let totalLiabilities = 0
    let totalEquity = 0

    trialBalance.forEach(item => {
        if (item.accountType === 'asset') {
            totalAssets += item.balance
        } else if (item.accountType === 'liability') {
            totalLiabilities += item.balance
        } else if (item.accountType === 'equity') {
            totalEquity += item.balance
        }
    })

    return {
        totalAssets,
        totalLiabilities,
        totalEquity: totalAssets - totalLiabilities,
        asOf
    }
}



// ==================== TAXATION (Phase 6) ====================
export function getTaxRates() {
    return getSettings().taxRates || []
}

export function getGSTR1Report(startDate, endDate) {
    // Outward Supplies (Sales)
    const journals = getJournalEntries({ status: 'posted', startDate, endDate })

    // Filter for entries that involve revenue and have tax details (simplified)
    // In real implementation, we'd check for specific 'Sales' voucher types or account groups
    const salesEntries = journals.filter(j =>
        j.lines.some(l => {
            const acc = getAccount(l.accountId)
            return acc && acc.type === 'equity' && acc.category === 'revenue'
        })
    )

    return salesEntries.map(entry => {
        // Assume first line is receivable (customer) and last is revenue
        // This is heuristic for demo. Real app needs structured voucher data.
        const customerLine = entry.lines.find(l => getAccount(l.accountId)?.category === 'current_assets')
        return {
            date: entry.entryDate,
            invoiceNumber: entry.reference || entry.journalNumber,
            customerName: customerLine ? customerLine.description : 'Cash Customer', // Simplified
            taxableValue: entry.totalDebit, // Simplified
            taxRate: 18, // Default or fetch from line if stored
            taxAmount: (entry.totalDebit * 18) / 100, // Simplified calc
            placeOfSupply: 'State'
        }
    })
}

export function getGSTR3BReport(startDate, endDate) {
    // Summary of Outward Supplies & ITC
    const sales = getGSTR1Report(startDate, endDate)
    const totalSales = sales.reduce((sum, s) => sum + s.taxableValue, 0)
    const outputTax = sales.reduce((sum, s) => sum + s.taxAmount, 0)

    // Input Tax Credit (Purchases/Expenses)
    const expenses = getExpenses({ status: 'paid', startDate, endDate })
    const totalPurchases = expenses.reduce((sum, e) => sum + e.totalAmount, 0)
    const inputTax = expenses.reduce((sum, e) => sum + (e.taxAmount || 0), 0)

    return {
        outwardSupplies: {
            taxableValue: totalSales,
            integratedTax: outputTax, // Simplified: assuming all IGST for demo
            centralTax: 0,
            stateTax: 0,
            cess: 0
        },
        eligibleITC: {
            integratedTax: inputTax,
            centralTax: 0,
            stateTax: 0,
            cess: 0
        },
        netTaxPayable: Math.max(0, outputTax - inputTax)
    }
}

export function getCashFlowStatement(startDate, endDate) {
    const journalEntries = getJournalEntries({ status: 'posted', startDate, endDate })

    let operatingActivities = 0
    let investingActivities = 0
    let financingActivities = 0

    journalEntries.forEach(entry => {
        // Simplified Logic: content based classification would be complex without explicit tags
        // Attempting standard heuristics based on Account Types involved

        let isInvesting = false
        let isFinancing = false
        let isOperating = true // Default

        // Check lines for specific account categories
        entry.lines.forEach(line => {
            const account = getAccount(line.accountId)
            if (!account) return

            if (account.category === 'fixed_assets' || account.category === 'investments') {
                isInvesting = true
                isOperating = false
            } else if (account.type === 'equity' || (account.type === 'liability' && account.category === 'long_term')) {
                isFinancing = true
                isOperating = false
            }
        })

        // Determine Net Cash Impact for this entry
        // Find 'Bank' or 'Cash' lines
        const cashLine = entry.lines.find(l => {
            const acc = getAccount(l.accountId)
            return acc && (acc.category === 'cash' || acc.category === 'bank')
        })

        if (cashLine) {
            const cashImpact = cashLine.debit - cashLine.credit // Debit increases cash, Credit decreases
            if (isInvesting) {
                investingActivities += cashImpact
            } else if (isFinancing) {
                financingActivities += cashImpact
            } else {
                operatingActivities += cashImpact
            }
        }
    })

    return {
        operatingActivities,
        investingActivities,
        financingActivities,
        netCashFlow: operatingActivities + investingActivities + financingActivities
    }
}

// Phase 2: Bank Reconciliation Report (BRS)
export function getBankReconciliationReport(accountId, asOfDate) {
    const journalEntries = getJournalEntries({ status: 'posted', endDate: asOfDate })
    const account = getAccount(accountId)
    // if (!account || account.category !== 'current_assets') throw new Error('Invalid Bank Account')

    let bookBalance = 0
    let unclearedDebits = []  // Cheques deposited but not cleared
    let unclearedCredits = [] // Cheques issued but not presented

    journalEntries.forEach(entry => {
        const line = entry.lines.find(l => l.accountId === accountId)
        if (!line) return

        // Update Book Balance
        bookBalance += (line.debit - line.credit)

        // Check Reconciliation Status
        // If entry is NOT reconciled OR reconciled AFTER the report date
        const isUncleared = !entry.reconciled || (entry.bankDate && entry.bankDate > asOfDate)

        if (isUncleared) {
            if (line.debit > 0) unclearedDebits.push({ ...entry, amount: line.debit })
            if (line.credit > 0) unclearedCredits.push({ ...entry, amount: line.credit })
        }
    })

    const totalUnclearedDebits = unclearedDebits.reduce((sum, e) => sum + e.amount, 0)
    const totalUnclearedCredits = unclearedCredits.reduce((sum, e) => sum + e.amount, 0)

    // Bank Balance = Book Balance + Unpresented Cheques (Credits) - Uncleared Deposits (Debits)
    const bankBalance = bookBalance + totalUnclearedCredits - totalUnclearedDebits

    return {
        accountId,
        asOfDate,
        bookBalance,
        bankBalance,
        unclearedDebits,
        unclearedCredits
    }
}

// ==================== FIXED ASSETS CRUD ====================
export function getFixedAssets() {
    return getStore('fixedAssets', [])
}

export function createFixedAsset(data) {
    const assets = getStore('fixedAssets', [])
    const newAsset = {
        ...data,
        id: Date.now(),
        createdAt: new Date().toISOString()
    }
    assets.push(newAsset)
    localStorage.setItem('fixedAssets', JSON.stringify(assets))
    return newAsset
}

export function updateFixedAsset(id, data) {
    const assets = getStore('fixedAssets', [])
    const index = assets.findIndex(a => a.id === id)
    if (index === -1) return null
    assets[index] = { ...assets[index], ...data, updatedAt: new Date().toISOString() }
    localStorage.setItem('fixedAssets', JSON.stringify(assets))
    return assets[index]
}

export function deleteFixedAsset(id) {
    const assets = getStore('fixedAssets', []).filter(a => a.id !== id)
    localStorage.setItem('fixedAssets', JSON.stringify(assets))
    return true
}

// ==================== COST CENTERS & BUDGETING (Phase 7) ====================
export function getCostCenters() {
    return getStore('costCenters', [])
}

export function createCostCenter(data) {
    const centers = getCostCenters()
    const newCenter = {
        ...data,
        id: `cc-${Date.now()}`,
        createdAt: new Date().toISOString()
    }
    centers.push(newCenter)
    setStore('costCenters', centers)
    return newCenter
}

export function getCostCenterReport(costCenterId) {
    // 1. Get Expenses allocated to this Cost Center
    // Assuming expenses have costCenterId based on previous context updates or will be added
    const expenses = getExpenses({ status: 'paid' }) // or 'approved'
        .filter(e => e.costCenterId === costCenterId)

    // Note: If expense structure doesn't have costCenterId yet, this will return 0 until updated
    const totalExpense = expenses.reduce((sum, e) => sum + e.totalAmount, 0)

    // 2. Get Revenue (Invoices/Journal Entries) allocated
    // For simplicity in this phase, assuming Journal Entries or Invoices have costCenterId
    // Adding a filter for Journal Entries
    const journals = getJournalEntries({ status: 'posted' })
        .filter(j => j.costCenterId === costCenterId)

    // Calculate Revenue from Journals (Credit to Revenue Accounts)
    let totalRevenue = 0
    journals.forEach(j => {
        j.lines.forEach(line => {
            // Logic to identify revenue lines. 
            // Simplified: Assuming all 'credit' in this filtered view is revenue for now
            totalRevenue += line.credit
        })
    })

    return {
        costCenterId,
        totalRevenue: totalRevenue || 0,
        totalExpense: totalExpense || 0,
        netProfit: (totalRevenue || 0) - (totalExpense || 0),
        margin: totalRevenue > 0 ? ((totalRevenue - totalExpense) / totalRevenue * 100) : 0
    }
}

export function getBudgetVarianceReport() {
    const budgets = getStore(STORAGE_KEYS.budgets, initialBudgets)
    const currentYear = new Date().getFullYear()

    return budgets.map(budget => {
        // Calculate Actuals for this Budget Category (e.g., 'Travel')
        // Matching by 'category' name or ID from Expenses

        const expenses = getExpenses()
            // Simplified matching: if budget.category matches expense.category or budget.name matches expense category
            // Ideally should use ID. 
            .filter(e => (e.category === budget.category || e.category === budget.name) && e.date.startsWith(String(currentYear)))

        const actualAmount = expenses.reduce((sum, e) => sum + e.totalAmount, 0)
        const variance = budget.amount - actualAmount
        const variancePercent = budget.amount > 0 ? (variance / budget.amount) * 100 : 0

        return {
            ...budget,
            actualAmount,
            variance,
            variancePercent, // Positive = Under Budget (Good), Negative = Over Budget
            status: variance >= 0 ? 'On Track' : 'Over Budget'
        }
    })
}

// ==================== AUTOMATION & AI (Phase 9) ====================

export async function getAnomalies() {
    const transactions = [
        ...getJournalEntries(),
        ...getExpenses()
    ]

    // 1. Run Rule-Based Checks (Instant)
    const ruleAnomalies = detectAnomaliesRuleBased(transactions)

    // 2. Run AI Checks (Async, Optional)
    let aiAnomalies = []
    try {
        aiAnomalies = await analyzeTransactionsAI(transactions)
    } catch (e) {
        console.warn('Skipping AI analysis', e)
    }

    // Merge Unique Anomalies
    const combined = [...ruleAnomalies]
    aiAnomalies.forEach(ai => {
        if (!combined.find(c => c.id === ai.id)) {
            combined.push({ ...ai, source: 'AI' })
        }
    })

    return combined
}

const initialRecurringTemplates = [] // In real app, persist this
export function getRecurringTemplates() {
    return getStore('recurringTemplates', initialRecurringTemplates)
}

export function createRecurringTemplate(data) {
    const templates = getRecurringTemplates()
    const newTemplate = {
        ...data,
        id: `tpl-${Date.now()}`,
        status: 'active',
        nextRun: data.startDate // Initial run date
    }
    templates.push(newTemplate)
    setStore('recurringTemplates', templates)
    return newTemplate
}

export function processRecurringDue() {
    const templates = getRecurringTemplates()
    const today = new Date().toISOString().split('T')[0]
    let processedCount = 0

    const updatedTemplates = templates.map(tpl => {
        if (tpl.status === 'active' && tpl.nextRun <= today) {
            // Create Journal Entry
            createJournalEntry({
                ...tpl.entryData,
                entryDate: today,
                description: `${tpl.entryData.description} (Recurring)`
            })

            // Calculate Next Run
            const nextDate = new Date(tpl.nextRun)
            if (tpl.frequency === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1)
            else if (tpl.frequency === 'weekly') nextDate.setDate(nextDate.getDate() + 7)

            processedCount++
            return {
                ...tpl,
                lastRun: today,
                nextRun: nextDate.toISOString().split('T')[0]
            }
        }
        return tpl
    })

    if (processedCount > 0) {
        setStore('recurringTemplates', updatedTemplates)
    }
    return processedCount
}

// ==================== ACCOUNTING STATS ====================
export function getAccountingStats() {
    const journalEntries = getJournalEntries()
    const expenses = getExpenses()
    const ap = getAccountsPayable()
    const ar = getAccountsReceivable()
    const bankAccounts = getBankAccounts()
    const budgets = getBudgets()
    const fixedAssets = getFixedAssets()

    const totalExpenses = expenses.reduce((sum, e) => sum + e.totalAmount, 0)
    const pendingExpenses = expenses.filter(e => e.status === 'pending').reduce((sum, e) => sum + e.totalAmount, 0)
    const paidExpenses = expenses.filter(e => e.status === 'paid').reduce((sum, e) => sum + e.totalAmount, 0)

    const totalBankBalance = bankAccounts.reduce((sum, a) => sum + a.balance, 0)
    const totalAP = ap.reduce((sum, a) => sum + a.balance, 0)
    const totalAR = ar.reduce((sum, a) => sum + a.balance, 0)
    const overdueAR = ar.filter(a => a.status === 'pending').reduce((sum, a) => sum + a.balance, 0)

    const totalBudgeted = budgets.reduce((sum, b) => sum + b.totalBudgeted, 0)
    const totalActual = budgets.reduce((sum, b) => sum + b.totalActual, 0)

    const totalAssetValue = fixedAssets.reduce((sum, a) => sum + a.currentValue, 0)
    const totalDepreciation = fixedAssets.reduce((sum, a) => sum + a.accumulatedDepreciation, 0)

    return {
        totalJournalEntries: journalEntries.length,
        postedEntries: journalEntries.filter(e => e.status === 'posted').length,
        totalExpenses: totalExpenses,
        pendingExpenses: pendingExpenses,
        paidExpenses: paidExpenses,
        totalBankBalance: totalBankBalance,
        totalAccountsPayable: totalAP,
        totalAccountsReceivable: totalAR,
        overdueReceivable: overdueAR,
        totalBudgeted: totalBudgeted,
        totalActual: totalActual,
        budgetVariance: totalActual - totalBudgeted,
        totalAssetValue,
        totalDepreciation
    }
}
