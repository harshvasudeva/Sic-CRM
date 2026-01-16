// Settings Store with localStorage persistence

const SETTINGS_KEY = 'sic-crm-settings'

const defaultSettings = {
    currency: 'INR',
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
    negativeCashAllowed: false
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
    const currency = currencyCode ? CURRENCIES[currencyCode] : getCurrency()

    try {
        return new Intl.NumberFormat(currency.locale, {
            style: 'currency',
            currency: currency.code,
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(amount)
    } catch (e) {
        // Fallback if Intl fails
        return `${currency.symbol}${amount.toLocaleString()}`
    }
}

// Format number without currency symbol
export function formatNumber(value) {
    const amount = Number(value) || 0
    const currency = getCurrency()
    return new Intl.NumberFormat(currency.locale).format(amount)
}

// Set currency
export function setCurrency(currencyCode) {
    if (CURRENCIES[currencyCode]) {
        updateSettings({ currency: currencyCode })
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

    // If current month is before start month, fiscal year started previous cal year
    // Example: April (3) start. Current: Jan 2026. Fiscal Year: 2025-2026
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

export default {
    getSettings,
    updateSettings,
    getCurrency,
    formatCurrency,
    formatNumber,
    setCurrency,
    CURRENCIES
}
