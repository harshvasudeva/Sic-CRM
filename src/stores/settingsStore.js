
import { fetchExchangeRate } from '../utils/currencyService'

const SETTINGS_KEY = 'sic-crm-settings'

// Default Tally-like keyboard shortcuts
const defaultShortcuts = [
    { sequence: 'dal', path: '/accounting/general-ledger', label: 'General Ledger', description: 'Display All Ledgers' },
    { sequence: 'das', path: '/sales', label: 'Sales Ledger', description: 'Display All Sales' },
    { sequence: 'dap', path: '/purchase', label: 'Purchase Ledger', description: 'Display All Purchases' },
    { sequence: 'dsor', path: '/accounting/receivable', label: 'Accounts Receivable', description: 'Display Statement of Receivables' },
    { sequence: 'dsop', path: '/accounting/payable', label: 'Accounts Payable', description: 'Display Statement of Payables' },
    { sequence: 'dsog', path: '/accounting/chart', label: 'Chart of Accounts', description: 'Display Statement of Groups' },
]

const defaultSettings = {
    currency: 'INR',
    exchangeRate: 1, // Conversion rate from Base (USD) to Current
    baseCurrency: 'INR',
    locale: 'en-IN',
    dateFormat: 'DD/MM/YYYY',
    theme: 'dark',         // 'dark' | 'light' | 'system'
    density: 'comfortable', // 'compact' | 'comfortable' | 'spacious'
    defaultLandingPage: '/', // user-configurable landing page
    focusMode: false,
    showRelativeDates: true,
    sidebarCollapsedGroups: [], // collapsed nav groups
    companyName: 'Sic CRM',

    // Phase 1: Accounting Compliance
    fiscalYearStartMonth: 3, // 3 = April (0-indexed)
    fiscalYearEndMonth: 2,   // 2 = March
    taxIdLabel: 'GSTIN',     // Customizable: GSTIN, VAT, TIN
    taxIdNumber: '',
    secondaryTaxIdLabel: 'PAN',
    secondaryTaxIdNumber: '',
    address: { street: '', city: '', state: '', zip: '', country: 'India' },

    // Phase 1: Validation Rules
    lockDate: null, // No transactions before this date
    enforceDoubleEntry: true,
    negativeCashAllowed: false,

    // Phase 6: Taxation (GST/VAT)
    defaultTaxType: 'GST', // GST, VAT, Sales Tax
    taxRates: [
        { id: 'tax-001', name: 'GST 5%', rate: 5, type: 'igst', code: 'GST5' },
        { id: 'tax-002', name: 'GST 12%', rate: 12, type: 'igst', code: 'GST12' },
        { id: 'tax-003', name: 'GST 18%', rate: 18, type: 'igst', code: 'GST18' },
        { id: 'tax-004', name: 'GST 28%', rate: 28, type: 'igst', code: 'GST28' },
        { id: 'tax-005', name: 'Exempt', rate: 0, type: 'exempt', code: 'GST0' }
    ],

    // Phase 9: Automation & AI
    aiConfig: {
        provider: 'ollama', // ollama, openai, gemini
        enabled: true,
        endpoint: 'http://localhost:11434',
        model: 'llama3',
        apiKey: '' // Encrypted/Stored securely in real app
    },

    // Phase 10: Parity Extras (UDF)
    udfConfig: [
        { id: 'udf-001', label: 'Project Code', type: 'text', module: 'journal', enabled: true },
        { id: 'udf-002', label: 'Cost Center Ref', type: 'text', module: 'journal', enabled: true },
        { id: 'udf-003', label: 'Vehicle No', type: 'text', module: 'expense', enabled: true }
    ],

    // Keyboard Shortcuts
    shortcuts: defaultShortcuts
}

// Currency configurations
export const CURRENCIES = {
    USD: { symbol: '$', code: 'USD', locale: 'en-US', name: 'US Dollar' },
    INR: { symbol: '₹', code: 'INR', locale: 'en-IN', name: 'Indian Rupee' },
    EUR: { symbol: '€', code: 'EUR', locale: 'de-DE', name: 'Euro' },
    GBP: { symbol: '£', code: 'GBP', locale: 'en-GB', name: 'British Pound' },
    JPY: { symbol: '¥', code: 'JPY', locale: 'ja-JP', name: 'Japanese Yen' },
    CNY: { symbol: '¥', code: 'CNY', locale: 'zh-CN', name: 'Chinese Yuan' },
    CAD: { symbol: '$', code: 'CAD', locale: 'en-CA', name: 'Canadian Dollar' },
    AUD: { symbol: '$', code: 'AUD', locale: 'en-AU', name: 'Australian Dollar' },
    CHF: { symbol: 'Fr', code: 'CHF', locale: 'de-CH', name: 'Swiss Franc' },
    SGD: { symbol: '$', code: 'SGD', locale: 'en-SG', name: 'Singapore Dollar' },
    AED: { symbol: 'د.إ', code: 'AED', locale: 'ar-AE', name: 'UAE Dirham' },
    SAR: { symbol: '﷼', code: 'SAR', locale: 'ar-SA', name: 'Saudi Riyal' },
    BRL: { symbol: 'R$', code: 'BRL', locale: 'pt-BR', name: 'Brazilian Real' },
    MXN: { symbol: '$', code: 'MXN', locale: 'es-MX', name: 'Mexican Peso' },
    KRW: { symbol: '₩', code: 'KRW', locale: 'ko-KR', name: 'South Korean Won' }
}

// Get settings
export function getSettings() {
    const stored = localStorage.getItem(SETTINGS_KEY)
    if (stored) {
        const merged = { ...defaultSettings, ...JSON.parse(stored) }
        try {
            const currencyPrefs = JSON.parse(localStorage.getItem('sic_crm_currencies') || 'null')
            if (currencyPrefs) {
                merged.currency = currencyPrefs.displayCurrency || currencyPrefs.baseCurrency || merged.currency
                merged.baseCurrency = currencyPrefs.baseCurrency || merged.baseCurrency || merged.currency
            }
        } catch {
            // ignore currency store sync errors
        }
        return merged
    }
    return defaultSettings
}

// Update settings
export function updateSettings(newSettings) {
    const current = getSettings()
    const updated = { ...current, ...newSettings }
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated))
    return updated
}

// Get current currency config
export function getCurrency() {
    const settings = getSettings()
    return CURRENCIES[settings.currency] || CURRENCIES.INR
}

// Read exchange rates from currencyStore's localStorage (avoids circular import)
function getExchangeRates() {
    try {
        const stored = localStorage.getItem('sic_crm_currencies')
        if (stored) return JSON.parse(stored).rates || {}
    } catch {}
    return { INR: 1, USD: 0.012, EUR: 0.011, GBP: 0.0094, AED: 0.044, SAR: 0.045, SGD: 0.016, AUD: 0.018, CAD: 0.016, JPY: 1.79, CNY: 0.087, CHF: 0.011, BRL: 0.059, MXN: 0.21, KRW: 16.2 }
}

// Convert amount between currencies using stored rates
export function convertAmount(amount, fromCurrency, toCurrency) {
    if (!fromCurrency || !toCurrency || fromCurrency === toCurrency) return amount
    const rates = getExchangeRates()
    const fromRate = rates[fromCurrency] || 1
    const toRate = rates[toCurrency] || 1
    return Math.round((amount / fromRate) * toRate * 100) / 100
}

/**
 * Format and display a monetary value in the user's display currency.
 * 
 * @param {number} value - The amount to format
 * @param {string|null} recordCurrency - The currency the value was stored in.
 *   If provided, the amount is converted from recordCurrency → displayCurrency.
 *   If null/undefined, assumes value is already in displayCurrency (backward compatible).
 */
export function formatCurrency(value, recordCurrency = null) {
    const amount = Number(value) || 0
    const settings = getSettings()
    const displayCurrencyCode = settings.currency || 'INR'
    const currency = CURRENCIES[displayCurrencyCode] || CURRENCIES.INR

    // Convert from record's stored currency to user's display currency
    let displayAmount = amount
    if (recordCurrency && recordCurrency !== displayCurrencyCode) {
        displayAmount = convertAmount(amount, recordCurrency, displayCurrencyCode)
    }

    try {
        return new Intl.NumberFormat(currency.locale, {
            style: 'currency',
            currency: currency.code,
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(displayAmount)
    } catch (e) {
        return `${currency.symbol}${displayAmount.toLocaleString()}`
    }
}

// Format number without currency symbol
export function formatNumber(value) {
    const amount = Number(value) || 0
    const currency = getCurrency()
    return new Intl.NumberFormat(currency.locale).format(amount)
}

// Set currency
export async function setCurrency(currencyCode) {
    if (CURRENCIES[currencyCode]) {
        const rate = await fetchExchangeRate(currencyCode)
        updateSettings({
            currency: currencyCode,
            exchangeRate: rate
        })
        return true
    }
    return false
}

// Phase 1: Fiscal Year Helpers
export function getFiscalYear(dateString = new Date()) {
    const date = new Date(dateString)
    const settings = getSettings()
    const currentYear = date.getFullYear()
    const currentMonth = date.getMonth() // 0-11

    if (currentMonth < settings.fiscalYearStartMonth) {
        return `${currentYear - 1}-${currentYear}`
    }
    return `${currentYear}-${currentYear + 1}`
}


export function isDateLocked(dateString) {
    const settings = getSettings()
    if (!settings.lockDate) return false
    return new Date(dateString) <= new Date(settings.lockDate)
}

// Keyboard Shortcuts
export function getShortcuts() {
    const settings = getSettings()
    return settings.shortcuts || defaultShortcuts
}

export function saveShortcuts(shortcuts) {
    updateSettings({ shortcuts })
    return shortcuts
}

export function resetShortcuts() {
    updateSettings({ shortcuts: defaultShortcuts })
    return defaultShortcuts
}

// ============= Theme Management =============
export function getEffectiveTheme() {
    const settings = getSettings()
    if (settings.theme === 'system') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return settings.theme || 'dark'
}

export function applyTheme() {
    const theme = getEffectiveTheme()
    const settings = getSettings()
    document.documentElement.setAttribute('data-theme', theme)
    document.documentElement.setAttribute('data-density', settings.density || 'comfortable')
    // Update browser tab title dynamically
    const pageName = document.title.split(' - ')[0] || 'Dashboard'
    document.title = `${pageName} - ${settings.companyName || 'Sic CRM'}`
}

export function toggleTheme() {
    const settings = getSettings()
    const newTheme = settings.theme === 'dark' ? 'light' : 'dark'
    updateSettings({ theme: newTheme })
    applyTheme()
    return newTheme
}

export function setDensity(density) {
    updateSettings({ density })
    document.documentElement.setAttribute('data-density', density)
}

// ============= Recent Items =============
const RECENT_KEY = 'sic-crm-recent-items'
const MAX_RECENT = 10

export function getRecentItems() {
    try {
        return JSON.parse(localStorage.getItem(RECENT_KEY)) || []
    } catch { return [] }
}

export function addRecentItem(item) {
    // item: { id, title, path, type, subtitle }
    const recent = getRecentItems().filter(r => r.path !== item.path)
    recent.unshift({ ...item, visitedAt: Date.now() })
    localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)))
}

// ============= Saved Filters =============
const FILTERS_KEY = 'sic-crm-saved-filters'

export function getSavedFilters(module) {
    try {
        const all = JSON.parse(localStorage.getItem(FILTERS_KEY)) || {}
        return module ? (all[module] || []) : all
    } catch { return module ? [] : {} }
}

export function saveFilter(module, filter) {
    // filter: { id, name, criteria }
    const all = getSavedFilters()
    if (!all[module]) all[module] = []
    all[module] = all[module].filter(f => f.id !== filter.id)
    all[module].push({ ...filter, id: filter.id || `filter-${Date.now()}` })
    localStorage.setItem(FILTERS_KEY, JSON.stringify(all))
}

export function deleteFilter(module, filterId) {
    const all = getSavedFilters()
    if (all[module]) {
        all[module] = all[module].filter(f => f.id !== filterId)
        localStorage.setItem(FILTERS_KEY, JSON.stringify(all))
    }
}

// ============= Auto-Save Drafts =============
const DRAFTS_KEY = 'sic-crm-drafts'

export function saveDraft(formId, data) {
    try {
        const drafts = JSON.parse(localStorage.getItem(DRAFTS_KEY)) || {}
        drafts[formId] = { data, savedAt: Date.now() }
        localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts))
    } catch { /* ignore */ }
}

export function getDraft(formId) {
    try {
        const drafts = JSON.parse(localStorage.getItem(DRAFTS_KEY)) || {}
        return drafts[formId] || null
    } catch { return null }
}

export function clearDraft(formId) {
    try {
        const drafts = JSON.parse(localStorage.getItem(DRAFTS_KEY)) || {}
        delete drafts[formId]
        localStorage.setItem(DRAFTS_KEY, JSON.stringify(drafts))
    } catch { /* ignore */ }
}

// ============= Audit Log =============
const AUDIT_KEY = 'sic-crm-audit-log'
const MAX_AUDIT = 500

export function addAuditEntry(entry) {
    // entry: { action, module, recordId, changes, user }
    try {
        const log = JSON.parse(localStorage.getItem(AUDIT_KEY)) || []
        log.unshift({
            ...entry,
            id: `audit-${Date.now()}`,
            timestamp: new Date().toISOString(),
            user: entry.user || 'Admin'
        })
        localStorage.setItem(AUDIT_KEY, JSON.stringify(log.slice(0, MAX_AUDIT)))
    } catch { /* ignore */ }
}

export function getAuditLog(filters = {}) {
    try {
        let log = JSON.parse(localStorage.getItem(AUDIT_KEY)) || []
        if (filters.module) log = log.filter(e => e.module === filters.module)
        if (filters.recordId) log = log.filter(e => e.recordId === filters.recordId)
        if (filters.action) log = log.filter(e => e.action === filters.action)
        return log
    } catch { return [] }
}

// ============= Relative Date Formatter =============
export function formatRelativeDate(dateStr) {
    const settings = getSettings()
    if (!settings.showRelativeDates) return dateStr
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now - date
    const diffSec = Math.floor(diffMs / 1000)
    const diffMin = Math.floor(diffSec / 60)
    const diffHr = Math.floor(diffMin / 60)
    const diffDay = Math.floor(diffHr / 24)

    if (diffSec < 60) return 'just now'
    if (diffMin < 60) return `${diffMin}m ago`
    if (diffHr < 24) return `${diffHr}h ago`
    if (diffDay < 7) return `${diffDay}d ago`
    return dateStr
}

export default {
    getSettings,
    updateSettings,
    getCurrency,
    formatCurrency,
    formatNumber,
    setCurrency,
    getShortcuts,
    saveShortcuts,
    resetShortcuts,
    getEffectiveTheme,
    applyTheme,
    toggleTheme,
    setDensity,
    getRecentItems,
    addRecentItem,
    getSavedFilters,
    saveFilter,
    deleteFilter,
    saveDraft,
    getDraft,
    clearDraft,
    addAuditEntry,
    getAuditLog,
    formatRelativeDate,
    CURRENCIES
}

