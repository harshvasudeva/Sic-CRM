// Accounting Store with localStorage persistence

const STORAGE_KEYS = {
    chartOfAccounts: 'sic-accounting-coa',
    journalEntries: 'sic-accounting-journal-entries',
    ledgerAccounts: 'sic-accounting-ledger',
    bankAccounts: 'sic-accounting-bank-accounts',
    taxes: 'sic-accounting-taxes',
    budgets: 'sic-accounting-budgets',
    expenses: 'sic-accounting-expenses',
    accountsPayable: 'sic-accounting-accounts-payable',
    accountsReceivable: 'sic-accounting-accounts-receivable'
}

// ==================== CHART OF ACCOUNTS ====================
const initialChartOfAccounts = [
    { id: 'coa-001', code: '1000', name: 'Cash', type: 'asset', category: 'current_assets', parent: null },
    { id: 'coa-002', code: '1100', name: 'Bank Accounts', type: 'asset', category: 'current_assets', parent: null },
    { id: 'coa-003', code: '1200', name: 'Accounts Receivable', type: 'asset', category: 'current_assets', parent: null },
    { id: 'coa-004', code: '1500', name: 'Inventory', type: 'asset', category: 'current_assets', parent: null },
    { id: 'coa-005', code: '2000', name: 'Fixed Assets', type: 'asset', category: 'non_current_assets', parent: null },
    { id: 'coa-006', code: '2000', name: 'Accounts Payable', type: 'liability', category: 'current_liabilities', parent: null },
    { id: 'coa-007', code: '2200', name: 'Accrued Expenses', type: 'liability', category: 'current_liabilities', parent: null },
    { id: 'coa-008', code: '3000', name: 'Revenue', type: 'equity', category: 'revenue', parent: null },
    { id: 'coa-009', code: '4000', name: 'Cost of Goods Sold', type: 'expense', category: 'cogs', parent: null },
    { id: 'coa-010', code: '5000', name: 'Operating Expenses', type: 'expense', category: 'operating', parent: null }
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

export function createJournalEntry(data) {
    const entries = getStore(STORAGE_KEYS.journalEntries, initialJournalEntries)
    const existingCount = entries.length
    const journalNumber = generateNumber('JE', new Date().getFullYear(), existingCount + 1)
    
    const totalDebit = data.lines.reduce((sum, line) => sum + line.debit, 0)
    const totalCredit = data.lines.reduce((sum, line) => sum + line.credit, 0)
    
    if (totalDebit !== totalCredit) {
        throw new Error('Debits and credits must balance')
    }
    
    const newEntry = {
        ...data,
        id: `je-${Date.now()}`,
        journalNumber: data.journalNumber || journalNumber,
        entryDate: data.entryDate || new Date().toISOString().split('T')[0],
        totalDebit,
        totalCredit,
        status: 'draft',
        createdAt: new Date().toISOString().split('T')[0]
    }
    entries.push(newEntry)
    setStore(STORAGE_KEYS.journalEntries, entries)
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
    
    const newAR = {
        ...data,
        id: `ar-${Date.now()}`,
        invoiceDate: data.invoiceDate || new Date().toISOString().split('T')[0],
        dueDate: data.dueDate || new Date().toISOString().split('T')[0],
        balance: data.amount,
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

// ==================== ACCOUNTING STATS ====================
export function getAccountingStats() {
    const journalEntries = getJournalEntries()
    const expenses = getExpenses()
    const ap = getAccountsPayable()
    const ar = getAccountsReceivable()
    const bankAccounts = getBankAccounts()
    const budgets = getBudgets()
    
    const totalExpenses = expenses.reduce((sum, e) => sum + e.totalAmount, 0)
    const pendingExpenses = expenses.filter(e => e.status === 'pending').reduce((sum, e) => sum + e.totalAmount, 0)
    const paidExpenses = expenses.filter(e => e.status === 'paid').reduce((sum, e) => sum + e.totalAmount, 0)
    
    const totalBankBalance = bankAccounts.reduce((sum, a) => sum + a.balance, 0)
    const totalAP = ap.reduce((sum, a) => sum + a.balance, 0)
    const totalAR = ar.reduce((sum, a) => sum + a.balance, 0)
    const overdueAR = ar.filter(a => a.status === 'pending').reduce((sum, a) => sum + a.balance, 0)
    
    const totalBudgeted = budgets.reduce((sum, b) => sum + b.totalBudgeted, 0)
    const totalActual = budgets.reduce((sum, b) => sum + b.totalActual, 0)
    
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
        budgetVariance: totalActual - totalBudgeted
    }
}
