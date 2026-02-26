// Global Ledger Store — Implements A3 (Global Transactions Ledger), A8 (Shared Tax Engine),
// A11 (Shared Payments Gateway), A12 (Global Multi-Currency), A16 (Unified Cost Centers),
// A17 (Shared Discount Engine), A18 (Linked Chart of Accounts), A19 (Centralized Bank Definitions)

const STORAGE_KEYS = {
    transactions: 'sic-crm-global-transactions',
    taxRules: 'sic-crm-tax-rules',
    paymentGateway: 'sic-crm-payment-gateway',
    exchangeRates: 'sic-crm-exchange-rates-v2',
    costCenters: 'sic-crm-cost-centers',
    discountEngine: 'sic-crm-discounts',
    coaLinks: 'sic-crm-coa-links',
    bankDefinitions: 'sic-crm-bank-definitions'
}

function load(key) {
    try { return JSON.parse(localStorage.getItem(key)) || null } catch { return null }
}
function save(key, data) { localStorage.setItem(key, JSON.stringify(data)) }
function genId(prefix) { return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` }

// ============================================================
// SEED DATA
// ============================================================

// ==================== GLOBAL TRANSACTIONS LEDGER ====================
const SEED_TRANSACTIONS = [
    {
        id: 'txn-001', transactionDate: '2026-01-15', type: 'sale', sourceModule: 'sales',
        sourceId: 'so-001', partnerId: 'cust-001', amount: 150000, currency: 'INR',
        taxAmount: 27000, netAmount: 123000, costCenterId: 'cc-001',
        description: 'Sale of 30 Widget Pro units', reference: 'INV-2026-001',
        status: 'posted', createdBy: 'admin', createdAt: '2026-01-15T10:30:00Z'
    },
    {
        id: 'txn-002', transactionDate: '2026-01-18', type: 'purchase', sourceModule: 'purchase',
        sourceId: 'po-001', partnerId: 'v-001', amount: 376000, currency: 'INR',
        taxAmount: 54000, netAmount: 322000, costCenterId: 'cc-002',
        description: 'Purchase of 5 Dell Vostro Laptops', reference: 'PO-0001',
        status: 'posted', createdBy: 'admin', createdAt: '2026-01-18T09:00:00Z'
    },
    {
        id: 'txn-003', transactionDate: '2026-01-25', type: 'payroll', sourceModule: 'hr',
        sourceId: 'payroll-jan-2026', partnerId: null, amount: 850000, currency: 'INR',
        taxAmount: 0, netAmount: 850000, costCenterId: 'cc-003',
        description: 'January 2026 Payroll — 15 employees', reference: 'PAY-2026-01',
        status: 'posted', createdBy: 'hr-admin', createdAt: '2026-01-25T14:00:00Z'
    },
    {
        id: 'txn-004', transactionDate: '2026-02-01', type: 'sale', sourceModule: 'pos',
        sourceId: 'pos-txn-0045', partnerId: 'cust-walk-in', amount: 7500, currency: 'INR',
        taxAmount: 1350, netAmount: 6150, costCenterId: 'cc-001',
        description: 'POS walk-in sale — Gadget X x3', reference: 'POS-0045',
        status: 'posted', createdBy: 'cashier-01', createdAt: '2026-02-01T11:15:00Z'
    },
    {
        id: 'txn-005', transactionDate: '2026-02-05', type: 'refund', sourceModule: 'sales',
        sourceId: 'ret-001', partnerId: 'cust-003', amount: -5000, currency: 'INR',
        taxAmount: -900, netAmount: -4100, costCenterId: 'cc-001',
        description: 'Refund for defective Gadget X', reference: 'RET-2026-001',
        status: 'posted', createdBy: 'admin', createdAt: '2026-02-05T16:00:00Z'
    },
    {
        id: 'txn-006', transactionDate: '2026-02-08', type: 'manufacturing', sourceModule: 'manufacturing',
        sourceId: 'mo-001', partnerId: null, amount: 45000, currency: 'INR',
        taxAmount: 0, netAmount: 45000, costCenterId: 'cc-004',
        description: 'Manufacturing order — 100 Widget Pro assemblies', reference: 'MO-2026-001',
        status: 'posted', createdBy: 'prod-mgr', createdAt: '2026-02-08T08:30:00Z'
    },
    {
        id: 'txn-007', transactionDate: '2026-02-10', type: 'transfer', sourceModule: 'accounting',
        sourceId: 'jv-001', partnerId: null, amount: 200000, currency: 'INR',
        taxAmount: 0, netAmount: 200000, costCenterId: 'cc-002',
        description: 'Inter-department fund transfer — IT to Operations', reference: 'JV-2026-001',
        status: 'posted', createdBy: 'cfo', createdAt: '2026-02-10T10:00:00Z'
    },
    {
        id: 'txn-008', transactionDate: '2026-02-12', type: 'sale', sourceModule: 'ecommerce',
        sourceId: 'ecom-order-1021', partnerId: 'cust-online-055', amount: 12500, currency: 'USD',
        taxAmount: 0, netAmount: 12500, costCenterId: 'cc-001',
        description: 'E-commerce export order — 5 Widget Pro', reference: 'ECOM-1021',
        status: 'posted', createdBy: 'system', createdAt: '2026-02-12T03:45:00Z'
    }
]

// ==================== SHARED TAX ENGINE ====================
const SEED_TAX_RULES = [
    {
        id: 'tax-001', name: 'GST 18%', rate: 18, type: 'gst', code: 'GST18',
        applicableTo: ['sales', 'purchase', 'pos'], region: 'IN',
        isCompound: false, isInclusive: false,
        effectiveFrom: '2025-01-01', effectiveTo: null
    },
    {
        id: 'tax-002', name: 'GST 12%', rate: 12, type: 'gst', code: 'GST12',
        applicableTo: ['sales', 'purchase'], region: 'IN',
        isCompound: false, isInclusive: false,
        effectiveFrom: '2025-01-01', effectiveTo: null
    },
    {
        id: 'tax-003', name: 'GST 5%', rate: 5, type: 'gst', code: 'GST5',
        applicableTo: ['sales', 'purchase', 'pos'], region: 'IN',
        isCompound: false, isInclusive: false,
        effectiveFrom: '2025-01-01', effectiveTo: null
    },
    {
        id: 'tax-004', name: 'GST 28% (Luxury)', rate: 28, type: 'gst', code: 'GST28',
        applicableTo: ['sales', 'purchase'], region: 'IN',
        isCompound: false, isInclusive: false,
        effectiveFrom: '2025-01-01', effectiveTo: null
    },
    {
        id: 'tax-005', name: 'VAT 20% (UK)', rate: 20, type: 'vat', code: 'VATUK20',
        applicableTo: ['sales', 'purchase'], region: 'GB',
        isCompound: false, isInclusive: true,
        effectiveFrom: '2025-01-01', effectiveTo: null
    },
    {
        id: 'tax-006', name: 'Sales Tax 8.5% (US-CA)', rate: 8.5, type: 'sales_tax', code: 'USTX-CA',
        applicableTo: ['sales', 'pos'], region: 'US-CA',
        isCompound: false, isInclusive: false,
        effectiveFrom: '2025-01-01', effectiveTo: null
    },
    {
        id: 'tax-007', name: 'Excise Duty 10%', rate: 10, type: 'excise', code: 'EXCISE10',
        applicableTo: ['purchase'], region: 'IN',
        isCompound: true, isInclusive: false,
        effectiveFrom: '2025-01-01', effectiveTo: null
    },
    {
        id: 'tax-008', name: 'VAT 19% (EU-DE)', rate: 19, type: 'vat', code: 'VATDE19',
        applicableTo: ['sales', 'purchase'], region: 'EU-DE',
        isCompound: false, isInclusive: true,
        effectiveFrom: '2025-01-01', effectiveTo: null
    },
    {
        id: 'tax-009', name: 'Zero Rated', rate: 0, type: 'gst', code: 'GST0',
        applicableTo: ['sales', 'purchase', 'pos', 'returns'], region: 'IN',
        isCompound: false, isInclusive: false,
        effectiveFrom: '2025-01-01', effectiveTo: null
    }
]

// ==================== SHARED PAYMENTS GATEWAY ====================
const SEED_PAYMENTS = [
    {
        id: 'pay-001', direction: 'inbound', type: 'customer_payment',
        partnerId: 'cust-001', amount: 150000, currency: 'INR',
        paymentMethod: 'bank_transfer', referenceNumber: 'NEFT-20260118-001',
        bankAccountId: 'bank-001', status: 'completed',
        linkedTransactionId: 'txn-001', gatewayResponse: null,
        processedAt: '2026-01-18T12:00:00Z'
    },
    {
        id: 'pay-002', direction: 'outbound', type: 'vendor_payment',
        partnerId: 'v-001', amount: 376000, currency: 'INR',
        paymentMethod: 'bank_transfer', referenceNumber: 'RTGS-20260120-001',
        bankAccountId: 'bank-001', status: 'completed',
        linkedTransactionId: 'txn-002', gatewayResponse: null,
        processedAt: '2026-01-20T15:30:00Z'
    },
    {
        id: 'pay-003', direction: 'outbound', type: 'payroll',
        partnerId: null, amount: 850000, currency: 'INR',
        paymentMethod: 'batch_transfer', referenceNumber: 'PAY-BATCH-202601',
        bankAccountId: 'bank-002', status: 'completed',
        linkedTransactionId: 'txn-003', gatewayResponse: null,
        processedAt: '2026-01-25T16:00:00Z'
    },
    {
        id: 'pay-004', direction: 'inbound', type: 'customer_payment',
        partnerId: 'cust-walk-in', amount: 7500, currency: 'INR',
        paymentMethod: 'upi', referenceNumber: 'UPI-20260201-045',
        bankAccountId: 'bank-001', status: 'completed',
        linkedTransactionId: 'txn-004', gatewayResponse: { upiTxnId: 'UPI123456789' },
        processedAt: '2026-02-01T11:16:00Z'
    },
    {
        id: 'pay-005', direction: 'outbound', type: 'refund',
        partnerId: 'cust-003', amount: 5000, currency: 'INR',
        paymentMethod: 'bank_transfer', referenceNumber: 'REF-20260206-001',
        bankAccountId: 'bank-001', status: 'completed',
        linkedTransactionId: 'txn-005', gatewayResponse: null,
        processedAt: '2026-02-06T10:00:00Z'
    },
    {
        id: 'pay-006', direction: 'outbound', type: 'influencer_payout',
        partnerId: 'inf-001', amount: 25000, currency: 'INR',
        paymentMethod: 'bank_transfer', referenceNumber: 'INF-PAY-20260210-001',
        bankAccountId: 'bank-001', status: 'pending',
        linkedTransactionId: null, gatewayResponse: null,
        processedAt: null
    },
    {
        id: 'pay-007', direction: 'inbound', type: 'customer_payment',
        partnerId: 'cust-online-055', amount: 12500, currency: 'USD',
        paymentMethod: 'credit_card', referenceNumber: 'STRIPE-PI-20260212-1021',
        bankAccountId: 'bank-003', status: 'completed',
        linkedTransactionId: 'txn-008', gatewayResponse: { stripePaymentIntentId: 'pi_3abc123' },
        processedAt: '2026-02-12T03:50:00Z'
    }
]

// ==================== EXCHANGE RATES (v2) ====================
const SEED_EXCHANGE_RATES = {
    baseCurrency: 'INR',
    rates: {
        INR: 1,
        USD: 0.01193,
        EUR: 0.01095,
        GBP: 0.00943,
        AED: 0.04381,
        SAR: 0.04474,
        SGD: 0.01597,
        AUD: 0.01832,
        CAD: 0.01633,
        JPY: 1.791,
        CNY: 0.08681,
        CHF: 0.01058,
        BRL: 0.05898,
        MXN: 0.2095,
        KRW: 16.22
    },
    lastUpdated: '2026-02-15T06:00:00Z'
}

// ==================== COST CENTERS ====================
const SEED_COST_CENTERS = [
    {
        id: 'cc-001', name: 'Sales & Distribution', code: 'CC-SALES',
        type: 'department', parentId: null, managerId: 'emp-005',
        budget: 2500000, isActive: true
    },
    {
        id: 'cc-002', name: 'Information Technology', code: 'CC-IT',
        type: 'department', parentId: null, managerId: 'emp-003',
        budget: 3000000, isActive: true
    },
    {
        id: 'cc-003', name: 'Human Resources', code: 'CC-HR',
        type: 'department', parentId: null, managerId: 'emp-002',
        budget: 1200000, isActive: true
    },
    {
        id: 'cc-004', name: 'Manufacturing', code: 'CC-MFG',
        type: 'department', parentId: null, managerId: 'emp-008',
        budget: 5000000, isActive: true
    },
    {
        id: 'cc-005', name: 'Marketing & Influencer Ops', code: 'CC-MKT',
        type: 'department', parentId: null, managerId: 'emp-010',
        budget: 1800000, isActive: true
    },
    {
        id: 'cc-006', name: 'Administration & Finance', code: 'CC-ADMIN',
        type: 'department', parentId: null, managerId: 'emp-001',
        budget: 900000, isActive: true
    },
    {
        id: 'cc-007', name: 'Warehouse Operations', code: 'CC-WH',
        type: 'location', parentId: 'cc-004', managerId: 'emp-012',
        budget: 750000, isActive: true
    },
    {
        id: 'cc-008', name: 'Project Alpha — ERP Migration', code: 'CC-PRJA',
        type: 'project', parentId: 'cc-002', managerId: 'emp-003',
        budget: 1500000, isActive: true
    },
    {
        id: 'cc-009', name: 'R&D Lab', code: 'CC-RND',
        type: 'department', parentId: null, managerId: 'emp-015',
        budget: 2000000, isActive: true
    }
]

// ==================== DISCOUNT ENGINE ====================
const SEED_DISCOUNTS = [
    {
        id: 'disc-001', name: 'Summer Sale 10%', type: 'percentage', value: 10,
        conditions: { minAmount: 5000, minQty: null, applicableProducts: [], applicableCategories: ['Finished Goods'], customerGroups: [] },
        validFrom: '2026-04-01', validTo: '2026-06-30',
        usageLimit: 500, usedCount: 0, couponCode: 'SUMMER10',
        isActive: true, source: 'ecommerce'
    },
    {
        id: 'disc-002', name: 'Bulk Purchase 15%', type: 'percentage', value: 15,
        conditions: { minAmount: 50000, minQty: 20, applicableProducts: [], applicableCategories: [], customerGroups: ['wholesale'] },
        validFrom: '2026-01-01', validTo: '2026-12-31',
        usageLimit: null, usedCount: 12, couponCode: null,
        isActive: true, source: 'pos'
    },
    {
        id: 'disc-003', name: 'Flat 500 Off', type: 'fixed', value: 500,
        conditions: { minAmount: 2000, minQty: null, applicableProducts: [], applicableCategories: [], customerGroups: [] },
        validFrom: '2026-02-01', validTo: '2026-03-31',
        usageLimit: 1000, usedCount: 45, couponCode: 'FLAT500',
        isActive: true, source: 'pos'
    },
    {
        id: 'disc-004', name: 'Buy 2 Get 1 Free — Gadget X', type: 'bogo', value: 1,
        conditions: { minAmount: null, minQty: 2, applicableProducts: ['prod-002'], applicableCategories: [], customerGroups: [] },
        validFrom: '2026-02-14', validTo: '2026-02-28',
        usageLimit: 200, usedCount: 8, couponCode: 'BOGO-GX',
        isActive: true, source: 'ecommerce'
    },
    {
        id: 'disc-005', name: 'Tiered Volume Discount', type: 'tiered', value: null,
        conditions: {
            minAmount: null, minQty: null, applicableProducts: [], applicableCategories: ['Finished Goods'],
            customerGroups: [],
            tiers: [
                { minQty: 10, discount: 5 },
                { minQty: 25, discount: 8 },
                { minQty: 50, discount: 12 },
                { minQty: 100, discount: 18 }
            ]
        },
        validFrom: '2026-01-01', validTo: '2026-12-31',
        usageLimit: null, usedCount: 3, couponCode: null,
        isActive: true, source: 'pos'
    },
    {
        id: 'disc-006', name: 'Influencer Referral 20%', type: 'percentage', value: 20,
        conditions: { minAmount: 1000, minQty: null, applicableProducts: [], applicableCategories: [], customerGroups: ['influencer_referral'] },
        validFrom: '2026-01-01', validTo: '2026-12-31',
        usageLimit: null, usedCount: 67, couponCode: 'INFREF20',
        isActive: true, source: 'influencer'
    }
]

// ==================== COA LINKS ====================
const SEED_COA_LINKS = [
    {
        id: 'coa-link-001', inventoryAccountId: 'acc-1400', revenueAccountId: 'acc-4100',
        cogsAccountId: 'acc-5100', assetAccountId: 'acc-1500', module: 'sales'
    },
    {
        id: 'coa-link-002', inventoryAccountId: 'acc-1400', revenueAccountId: null,
        cogsAccountId: 'acc-5100', assetAccountId: 'acc-1500', module: 'purchase'
    },
    {
        id: 'coa-link-003', inventoryAccountId: 'acc-1400', revenueAccountId: 'acc-4200',
        cogsAccountId: 'acc-5200', assetAccountId: null, module: 'manufacturing'
    },
    {
        id: 'coa-link-004', inventoryAccountId: null, revenueAccountId: 'acc-4100',
        cogsAccountId: null, assetAccountId: null, module: 'pos'
    },
    {
        id: 'coa-link-005', inventoryAccountId: null, revenueAccountId: null,
        cogsAccountId: null, assetAccountId: 'acc-1600', module: 'hr'
    }
]

// ==================== BANK DEFINITIONS ====================
const SEED_BANK_DEFINITIONS = [
    {
        id: 'bank-001', bankName: 'HDFC Bank', accountName: 'SIC Technologies Pvt Ltd — Current',
        accountNumber: '50200012345678', ifscCode: 'HDFC0001234', swiftCode: 'HDFCINBB',
        currency: 'INR', accountType: 'current', isDefault: true,
        usedBy: ['all']
    },
    {
        id: 'bank-002', bankName: 'ICICI Bank', accountName: 'SIC Technologies — Payroll',
        accountNumber: '012345678901', ifscCode: 'ICIC0005678', swiftCode: 'ABORINBB',
        currency: 'INR', accountType: 'current', isDefault: false,
        usedBy: ['hr']
    },
    {
        id: 'bank-003', bankName: 'Citibank', accountName: 'SIC Technologies — Foreign Currency',
        accountNumber: '8876543210', ifscCode: 'CITI0000003', swiftCode: 'CIABORINBX',
        currency: 'USD', accountType: 'current', isDefault: false,
        usedBy: ['purchase', 'accounting']
    },
    {
        id: 'bank-004', bankName: 'State Bank of India', accountName: 'SIC Technologies — Savings',
        accountNumber: '30987654321', ifscCode: 'SBIN0001000', swiftCode: 'SBININBB',
        currency: 'INR', accountType: 'savings', isDefault: false,
        usedBy: ['accounting']
    }
]

// ============================================================
// INIT
// ============================================================
function initStore(key, seed) {
    if (!load(key)) save(key, seed)
}

initStore(STORAGE_KEYS.transactions, SEED_TRANSACTIONS)
initStore(STORAGE_KEYS.taxRules, SEED_TAX_RULES)
initStore(STORAGE_KEYS.paymentGateway, SEED_PAYMENTS)
initStore(STORAGE_KEYS.exchangeRates, SEED_EXCHANGE_RATES)
initStore(STORAGE_KEYS.costCenters, SEED_COST_CENTERS)
initStore(STORAGE_KEYS.discountEngine, SEED_DISCOUNTS)
initStore(STORAGE_KEYS.coaLinks, SEED_COA_LINKS)
initStore(STORAGE_KEYS.bankDefinitions, SEED_BANK_DEFINITIONS)

// ============================================================
// A3 — GLOBAL TRANSACTIONS LEDGER
// ============================================================

export const recordTransaction = (data) => {
    const all = load(STORAGE_KEYS.transactions) || []
    const txn = {
        ...data,
        id: genId('txn'),
        status: data.status || 'posted',
        createdAt: new Date().toISOString()
    }
    all.push(txn)
    save(STORAGE_KEYS.transactions, all)
    return txn
}

export const getTransactions = (filters = {}) => {
    let data = load(STORAGE_KEYS.transactions) || []
    if (filters.type) data = data.filter(t => t.type === filters.type)
    if (filters.sourceModule) data = data.filter(t => t.sourceModule === filters.sourceModule)
    if (filters.partnerId) data = data.filter(t => t.partnerId === filters.partnerId)
    if (filters.costCenterId) data = data.filter(t => t.costCenterId === filters.costCenterId)
    if (filters.status) data = data.filter(t => t.status === filters.status)
    if (filters.currency) data = data.filter(t => t.currency === filters.currency)
    if (filters.dateFrom) data = data.filter(t => t.transactionDate >= filters.dateFrom)
    if (filters.dateTo) data = data.filter(t => t.transactionDate <= filters.dateTo)
    if (filters.search) {
        const s = filters.search.toLowerCase()
        data = data.filter(t =>
            (t.description || '').toLowerCase().includes(s) ||
            (t.reference || '').toLowerCase().includes(s)
        )
    }
    return data.sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate))
}

export const getTransactionsByEntity = (sourceModule, sourceId) => {
    const data = load(STORAGE_KEYS.transactions) || []
    return data.filter(t => t.sourceModule === sourceModule && t.sourceId === sourceId)
}

export const getLedgerBalance = (filters = {}) => {
    const txns = getTransactions(filters)
    return txns.reduce((acc, t) => {
        acc.totalAmount += (t.amount || 0)
        acc.totalTax += (t.taxAmount || 0)
        acc.totalNet += (t.netAmount || 0)
        acc.count += 1
        return acc
    }, { totalAmount: 0, totalTax: 0, totalNet: 0, count: 0 })
}

export const getTransactionSummary = (groupBy = 'type', filters = {}) => {
    const txns = getTransactions(filters)
    const summary = {}
    txns.forEach(t => {
        let key
        if (groupBy === 'type') key = t.type
        else if (groupBy === 'module') key = t.sourceModule
        else if (groupBy === 'costCenter') key = t.costCenterId || 'unassigned'
        else if (groupBy === 'month') key = t.transactionDate ? t.transactionDate.substring(0, 7) : 'unknown'
        else key = t.type

        if (!summary[key]) summary[key] = { count: 0, totalAmount: 0, totalTax: 0, totalNet: 0 }
        summary[key].count += 1
        summary[key].totalAmount += (t.amount || 0)
        summary[key].totalTax += (t.taxAmount || 0)
        summary[key].totalNet += (t.netAmount || 0)
    })
    return summary
}

export const voidTransaction = (id) => {
    const all = load(STORAGE_KEYS.transactions) || []
    const idx = all.findIndex(t => t.id === id)
    if (idx !== -1) {
        all[idx] = { ...all[idx], status: 'void' }
        save(STORAGE_KEYS.transactions, all)
    }
    return all[idx] || null
}

// ============================================================
// A8 — SHARED TAX ENGINE
// ============================================================

export const getTaxRules = (filters = {}) => {
    let data = load(STORAGE_KEYS.taxRules) || []
    if (filters.type) data = data.filter(r => r.type === filters.type)
    if (filters.region) data = data.filter(r => r.region === filters.region)
    if (filters.module) data = data.filter(r => (r.applicableTo || []).includes(filters.module))
    const today = new Date().toISOString().split('T')[0]
    if (filters.activeOnly) {
        data = data.filter(r =>
            r.effectiveFrom <= today && (!r.effectiveTo || r.effectiveTo >= today)
        )
    }
    return data
}

export const calculateTax = (amount, taxRuleIds = [], isInclusive = false) => {
    const rules = load(STORAGE_KEYS.taxRules) || []
    let totalTax = 0
    const breakdown = []

    // Separate compound and non-compound taxes
    const selectedRules = rules.filter(r => taxRuleIds.includes(r.id))
    const nonCompound = selectedRules.filter(r => !r.isCompound)
    const compound = selectedRules.filter(r => r.isCompound)

    let baseAmount = amount
    if (isInclusive) {
        const totalRate = nonCompound.reduce((sum, r) => sum + r.rate, 0)
        baseAmount = amount / (1 + totalRate / 100)
    }

    // Non-compound taxes first (applied on base)
    nonCompound.forEach(rule => {
        const tax = baseAmount * (rule.rate / 100)
        totalTax += tax
        breakdown.push({ ruleId: rule.id, name: rule.name, rate: rule.rate, taxAmount: Math.round(tax * 100) / 100 })
    })

    // Compound taxes (applied on base + non-compound taxes)
    const amountAfterNonCompound = baseAmount + totalTax
    compound.forEach(rule => {
        const tax = amountAfterNonCompound * (rule.rate / 100)
        totalTax += tax
        breakdown.push({ ruleId: rule.id, name: rule.name, rate: rule.rate, taxAmount: Math.round(tax * 100) / 100 })
    })

    return {
        baseAmount: Math.round(baseAmount * 100) / 100,
        totalTax: Math.round(totalTax * 100) / 100,
        totalWithTax: Math.round((baseAmount + totalTax) * 100) / 100,
        breakdown
    }
}

export const getApplicableTaxes = (module, region) => {
    const rules = load(STORAGE_KEYS.taxRules) || []
    const today = new Date().toISOString().split('T')[0]
    return rules.filter(r =>
        (r.applicableTo || []).includes(module) &&
        (!region || r.region === region) &&
        r.effectiveFrom <= today &&
        (!r.effectiveTo || r.effectiveTo >= today)
    )
}

export const createTaxRule = (data) => {
    const all = load(STORAGE_KEYS.taxRules) || []
    const rule = { ...data, id: genId('tax') }
    all.push(rule)
    save(STORAGE_KEYS.taxRules, all)
    return rule
}

export const updateTaxRule = (id, data) => {
    const all = load(STORAGE_KEYS.taxRules) || []
    const idx = all.findIndex(r => r.id === id)
    if (idx !== -1) { all[idx] = { ...all[idx], ...data }; save(STORAGE_KEYS.taxRules, all) }
    return all[idx] || null
}

export const deleteTaxRule = (id) => {
    const all = (load(STORAGE_KEYS.taxRules) || []).filter(r => r.id !== id)
    save(STORAGE_KEYS.taxRules, all)
    return true
}

// ============================================================
// A11 — SHARED PAYMENTS GATEWAY
// ============================================================

export const recordPayment = (data) => {
    const all = load(STORAGE_KEYS.paymentGateway) || []
    const payment = {
        ...data,
        id: genId('pay'),
        status: data.status || 'pending',
        processedAt: data.status === 'completed' ? new Date().toISOString() : null
    }
    all.push(payment)
    save(STORAGE_KEYS.paymentGateway, all)
    return payment
}

export const getPayments = (filters = {}) => {
    let data = load(STORAGE_KEYS.paymentGateway) || []
    if (filters.direction) data = data.filter(p => p.direction === filters.direction)
    if (filters.type) data = data.filter(p => p.type === filters.type)
    if (filters.status) data = data.filter(p => p.status === filters.status)
    if (filters.partnerId) data = data.filter(p => p.partnerId === filters.partnerId)
    if (filters.currency) data = data.filter(p => p.currency === filters.currency)
    if (filters.paymentMethod) data = data.filter(p => p.paymentMethod === filters.paymentMethod)
    if (filters.bankAccountId) data = data.filter(p => p.bankAccountId === filters.bankAccountId)
    if (filters.dateFrom) data = data.filter(p => p.processedAt && p.processedAt >= filters.dateFrom)
    if (filters.dateTo) data = data.filter(p => p.processedAt && p.processedAt <= filters.dateTo)
    return data.sort((a, b) => {
        const aDate = a.processedAt || '9999'
        const bDate = b.processedAt || '9999'
        return bDate.localeCompare(aDate)
    })
}

export const getPaymentsByPartner = (partnerId) => {
    const data = load(STORAGE_KEYS.paymentGateway) || []
    return data.filter(p => p.partnerId === partnerId)
}

export const reconcilePayment = (paymentId, transactionId) => {
    const all = load(STORAGE_KEYS.paymentGateway) || []
    const idx = all.findIndex(p => p.id === paymentId)
    if (idx !== -1) {
        all[idx] = {
            ...all[idx],
            linkedTransactionId: transactionId,
            status: 'completed',
            processedAt: all[idx].processedAt || new Date().toISOString()
        }
        save(STORAGE_KEYS.paymentGateway, all)
    }
    return all[idx] || null
}

export const updatePaymentStatus = (id, status) => {
    const all = load(STORAGE_KEYS.paymentGateway) || []
    const idx = all.findIndex(p => p.id === id)
    if (idx !== -1) {
        all[idx] = {
            ...all[idx],
            status,
            processedAt: status === 'completed' ? new Date().toISOString() : all[idx].processedAt
        }
        save(STORAGE_KEYS.paymentGateway, all)
    }
    return all[idx] || null
}

// ============================================================
// A12 — GLOBAL MULTI-CURRENCY (Exchange Rates v2)
// ============================================================

export const getExchangeRates = () => {
    return load(STORAGE_KEYS.exchangeRates) || SEED_EXCHANGE_RATES
}

export const getRate = (fromCurrency, toCurrency) => {
    const store = load(STORAGE_KEYS.exchangeRates) || SEED_EXCHANGE_RATES
    const fromRate = store.rates[fromCurrency]
    const toRate = store.rates[toCurrency]
    if (!fromRate || !toRate) return null
    // Convert via base currency
    return toRate / fromRate
}

export const convert = (amount, fromCurrency, toCurrency) => {
    const rate = getRate(fromCurrency, toCurrency)
    if (rate === null) return null
    return Math.round(amount * rate * 100) / 100
}

export const refreshRates = () => {
    // Simulated rate refresh — apply small random fluctuation
    const store = load(STORAGE_KEYS.exchangeRates) || SEED_EXCHANGE_RATES
    const updated = { ...store, rates: { ...store.rates }, lastUpdated: new Date().toISOString() }
    Object.keys(updated.rates).forEach(currency => {
        if (currency === store.baseCurrency) return
        const fluctuation = 1 + (Math.random() - 0.5) * 0.02  // +/- 1%
        updated.rates[currency] = Math.round(updated.rates[currency] * fluctuation * 100000) / 100000
    })
    save(STORAGE_KEYS.exchangeRates, updated)
    return updated
}

export const setBaseCurrency = (currency) => {
    const store = load(STORAGE_KEYS.exchangeRates) || SEED_EXCHANGE_RATES
    store.baseCurrency = currency
    save(STORAGE_KEYS.exchangeRates, store)
    return store
}

// ============================================================
// A16 — UNIFIED COST CENTERS
// ============================================================

export const getCostCenters = (filters = {}) => {
    let data = load(STORAGE_KEYS.costCenters) || []
    if (filters.type) data = data.filter(c => c.type === filters.type)
    if (filters.isActive !== undefined) data = data.filter(c => c.isActive === filters.isActive)
    if (filters.parentId) data = data.filter(c => c.parentId === filters.parentId)
    if (filters.search) {
        const s = filters.search.toLowerCase()
        data = data.filter(c => c.name.toLowerCase().includes(s) || c.code.toLowerCase().includes(s))
    }
    return data
}

export const getCostCenter = (id) => {
    const data = load(STORAGE_KEYS.costCenters) || []
    return data.find(c => c.id === id) || null
}

export const createCostCenter = (data) => {
    const all = load(STORAGE_KEYS.costCenters) || []
    const cc = { ...data, id: genId('cc'), isActive: data.isActive !== false }
    all.push(cc)
    save(STORAGE_KEYS.costCenters, all)
    return cc
}

export const updateCostCenter = (id, data) => {
    const all = load(STORAGE_KEYS.costCenters) || []
    const idx = all.findIndex(c => c.id === id)
    if (idx !== -1) { all[idx] = { ...all[idx], ...data }; save(STORAGE_KEYS.costCenters, all) }
    return all[idx] || null
}

export const deleteCostCenter = (id) => {
    const all = (load(STORAGE_KEYS.costCenters) || []).filter(c => c.id !== id)
    save(STORAGE_KEYS.costCenters, all)
    return true
}

export const getCostCenterPL = (costCenterId, dateRange = {}) => {
    // Cross-reference with transactions ledger for P&L
    const txns = getTransactions({ costCenterId, ...dateRange })
    const revenue = txns.filter(t => ['sale'].includes(t.type)).reduce((sum, t) => sum + (t.netAmount || 0), 0)
    const expenses = txns.filter(t => ['purchase', 'payroll', 'manufacturing'].includes(t.type)).reduce((sum, t) => sum + Math.abs(t.netAmount || 0), 0)
    const refunds = txns.filter(t => t.type === 'refund').reduce((sum, t) => sum + Math.abs(t.netAmount || 0), 0)
    return {
        costCenterId,
        revenue,
        expenses,
        refunds,
        netProfit: revenue - expenses - refunds,
        transactionCount: txns.length
    }
}

// ============================================================
// A17 — SHARED DISCOUNT ENGINE
// ============================================================

export const getDiscounts = (filters = {}) => {
    let data = load(STORAGE_KEYS.discountEngine) || []
    if (filters.source) data = data.filter(d => d.source === filters.source)
    if (filters.type) data = data.filter(d => d.type === filters.type)
    if (filters.isActive !== undefined) data = data.filter(d => d.isActive === filters.isActive)
    if (filters.activeOnly) {
        const today = new Date().toISOString().split('T')[0]
        data = data.filter(d =>
            d.isActive &&
            d.validFrom <= today &&
            d.validTo >= today &&
            (d.usageLimit === null || d.usedCount < d.usageLimit)
        )
    }
    return data
}

export const calculateDiscount = (cartItems = [], discountIds = []) => {
    const discounts = load(STORAGE_KEYS.discountEngine) || []
    const today = new Date().toISOString().split('T')[0]
    let totalDiscount = 0
    const applied = []

    const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const cartQty = cartItems.reduce((sum, item) => sum + item.quantity, 0)

    discountIds.forEach(discId => {
        const disc = discounts.find(d => d.id === discId)
        if (!disc || !disc.isActive) return
        if (disc.validFrom > today || disc.validTo < today) return
        if (disc.usageLimit !== null && disc.usedCount >= disc.usageLimit) return

        const cond = disc.conditions || {}
        if (cond.minAmount && cartTotal < cond.minAmount) return
        if (cond.minQty && cartQty < cond.minQty) return

        let discountAmount = 0
        if (disc.type === 'percentage') {
            discountAmount = cartTotal * (disc.value / 100)
        } else if (disc.type === 'fixed') {
            discountAmount = disc.value
        } else if (disc.type === 'bogo') {
            // Buy N get disc.value free (cheapest item)
            const eligibleItems = cond.applicableProducts && cond.applicableProducts.length
                ? cartItems.filter(i => cond.applicableProducts.includes(i.productId))
                : cartItems
            if (eligibleItems.length > 0) {
                const cheapest = Math.min(...eligibleItems.map(i => i.price))
                discountAmount = cheapest * disc.value
            }
        } else if (disc.type === 'tiered' && cond.tiers) {
            const applicableTier = [...cond.tiers].sort((a, b) => b.minQty - a.minQty).find(t => cartQty >= t.minQty)
            if (applicableTier) {
                discountAmount = cartTotal * (applicableTier.discount / 100)
            }
        }

        if (discountAmount > 0) {
            totalDiscount += discountAmount
            applied.push({ discountId: disc.id, name: disc.name, type: disc.type, amount: Math.round(discountAmount * 100) / 100 })
        }
    })

    return {
        cartTotal,
        totalDiscount: Math.round(totalDiscount * 100) / 100,
        finalAmount: Math.round((cartTotal - totalDiscount) * 100) / 100,
        applied
    }
}

export const validateCoupon = (code) => {
    const discounts = load(STORAGE_KEYS.discountEngine) || []
    const today = new Date().toISOString().split('T')[0]
    const disc = discounts.find(d => d.couponCode && d.couponCode.toUpperCase() === code.toUpperCase())
    if (!disc) return { valid: false, reason: 'Coupon code not found' }
    if (!disc.isActive) return { valid: false, reason: 'Coupon is inactive' }
    if (disc.validFrom > today) return { valid: false, reason: 'Coupon is not yet active' }
    if (disc.validTo < today) return { valid: false, reason: 'Coupon has expired' }
    if (disc.usageLimit !== null && disc.usedCount >= disc.usageLimit) return { valid: false, reason: 'Coupon usage limit reached' }
    return { valid: true, discount: disc }
}

export const applyDiscount = (discountId) => {
    const all = load(STORAGE_KEYS.discountEngine) || []
    const idx = all.findIndex(d => d.id === discountId)
    if (idx !== -1) {
        all[idx] = { ...all[idx], usedCount: (all[idx].usedCount || 0) + 1 }
        save(STORAGE_KEYS.discountEngine, all)
    }
    return all[idx] || null
}

export const createDiscount = (data) => {
    const all = load(STORAGE_KEYS.discountEngine) || []
    const disc = { ...data, id: genId('disc'), usedCount: 0, isActive: data.isActive !== false }
    all.push(disc)
    save(STORAGE_KEYS.discountEngine, all)
    return disc
}

export const updateDiscount = (id, data) => {
    const all = load(STORAGE_KEYS.discountEngine) || []
    const idx = all.findIndex(d => d.id === id)
    if (idx !== -1) { all[idx] = { ...all[idx], ...data }; save(STORAGE_KEYS.discountEngine, all) }
    return all[idx] || null
}

export const deleteDiscount = (id) => {
    const all = (load(STORAGE_KEYS.discountEngine) || []).filter(d => d.id !== id)
    save(STORAGE_KEYS.discountEngine, all)
    return true
}

// ============================================================
// A18 — LINKED CHART OF ACCOUNTS
// ============================================================

export const getAccountMappings = () => {
    return load(STORAGE_KEYS.coaLinks) || []
}

export const getAccountMapping = (module) => {
    const all = load(STORAGE_KEYS.coaLinks) || []
    return all.find(m => m.module === module) || null
}

export const createAccountMapping = (data) => {
    const all = load(STORAGE_KEYS.coaLinks) || []
    const mapping = { ...data, id: genId('coa-link') }
    all.push(mapping)
    save(STORAGE_KEYS.coaLinks, all)
    return mapping
}

export const updateAccountMapping = (id, data) => {
    const all = load(STORAGE_KEYS.coaLinks) || []
    const idx = all.findIndex(m => m.id === id)
    if (idx !== -1) { all[idx] = { ...all[idx], ...data }; save(STORAGE_KEYS.coaLinks, all) }
    return all[idx] || null
}

export const autoPostToAccounting = (transaction) => {
    // Generate journal entry mapping from transaction using CoA links
    const mapping = getAccountMapping(transaction.sourceModule)
    if (!mapping) return null

    const entries = []
    if (transaction.type === 'sale') {
        if (mapping.revenueAccountId) entries.push({ accountId: mapping.revenueAccountId, credit: transaction.netAmount, debit: 0 })
        if (mapping.cogsAccountId) entries.push({ accountId: mapping.cogsAccountId, credit: 0, debit: transaction.netAmount * 0.6 }) // approx COGS
        entries.push({ accountId: 'acc-1100', credit: 0, debit: transaction.amount }) // Accounts Receivable
        if (transaction.taxAmount) entries.push({ accountId: 'acc-2100', credit: transaction.taxAmount, debit: 0 }) // Tax Payable
    } else if (transaction.type === 'purchase') {
        if (mapping.inventoryAccountId) entries.push({ accountId: mapping.inventoryAccountId, credit: 0, debit: transaction.netAmount })
        entries.push({ accountId: 'acc-2000', credit: transaction.amount, debit: 0 }) // Accounts Payable
        if (transaction.taxAmount) entries.push({ accountId: 'acc-1300', credit: 0, debit: transaction.taxAmount }) // Input Tax Credit
    }

    return {
        transactionId: transaction.id,
        journalEntries: entries,
        postedAt: new Date().toISOString()
    }
}

// ============================================================
// A19 — CENTRALIZED BANK DEFINITIONS
// ============================================================

export const getBankDefinitions = (filters = {}) => {
    let data = load(STORAGE_KEYS.bankDefinitions) || []
    if (filters.currency) data = data.filter(b => b.currency === filters.currency)
    if (filters.accountType) data = data.filter(b => b.accountType === filters.accountType)
    if (filters.module) data = data.filter(b => b.usedBy.includes('all') || b.usedBy.includes(filters.module))
    return data
}

export const getBankDefinition = (id) => {
    const data = load(STORAGE_KEYS.bankDefinitions) || []
    return data.find(b => b.id === id) || null
}

export const getDefaultBank = (module) => {
    const data = load(STORAGE_KEYS.bankDefinitions) || []
    // First try module-specific default, then general default
    const moduleBank = data.find(b => b.isDefault && b.usedBy.includes(module))
    if (moduleBank) return moduleBank
    return data.find(b => b.isDefault && b.usedBy.includes('all')) || data[0] || null
}

export const createBankDefinition = (data) => {
    const all = load(STORAGE_KEYS.bankDefinitions) || []
    const bank = { ...data, id: genId('bank') }
    all.push(bank)
    save(STORAGE_KEYS.bankDefinitions, all)
    return bank
}

export const updateBankDefinition = (id, data) => {
    const all = load(STORAGE_KEYS.bankDefinitions) || []
    const idx = all.findIndex(b => b.id === id)
    if (idx !== -1) { all[idx] = { ...all[idx], ...data }; save(STORAGE_KEYS.bankDefinitions, all) }
    return all[idx] || null
}

export const deleteBankDefinition = (id) => {
    const all = (load(STORAGE_KEYS.bankDefinitions) || []).filter(b => b.id !== id)
    save(STORAGE_KEYS.bankDefinitions, all)
    return true
}

export const setDefaultBank = (id) => {
    const all = load(STORAGE_KEYS.bankDefinitions) || []
    all.forEach((b, idx) => { all[idx] = { ...b, isDefault: b.id === id } })
    save(STORAGE_KEYS.bankDefinitions, all)
    return all.find(b => b.id === id) || null
}
