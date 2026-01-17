
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
    baseCurrency: 'USD',
    locale: 'en-IN',
    dateFormat: 'DD/MM/YYYY',
    theme: 'dark',
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
        return { ...defaultSettings, ...JSON.parse(stored) }
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
    return CURRENCIES[settings.currency] || CURRENCIES.USD
}

// Format currency value
export function formatCurrency(value, currencyCode = null) {
    const amount = Number(value) || 0
    const settings = getSettings()

    // If specific currency code provided, just format it (assuming value is already in that currency)
    // If NOT provided, we assume value is in BASE currency and needs conversion
    const targetCurrencyCode = currencyCode || settings.currency
    const currency = CURRENCIES[targetCurrencyCode] || CURRENCIES.USD

    // Calculate converted amount if using system currency
    let displayAmount = amount
    if (!currencyCode && settings.currency !== settings.baseCurrency) {
        // Display = Base * Rate
        // e.g. 1 USD * 83 = 83 INR
        displayAmount = amount * (settings.exchangeRate || 1)
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
    CURRENCIES
}

