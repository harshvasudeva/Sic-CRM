/**
 * Multi-Currency Store - manage currency conversions, customer preferences,
 * live exchange rates, and INR-focused formatting.
 */

import * as currencyService from '../utils/currencyService'

const STORAGE_KEY = 'sic_crm_currencies'

const DEFAULT_CURRENCIES = {
  baseCurrency: 'INR',
  displayCurrency: 'INR',
  rates: {
    INR: 1, USD: 0.012, EUR: 0.011, GBP: 0.0094, AED: 0.044,
    SAR: 0.045, SGD: 0.016, AUD: 0.018, CAD: 0.016, JPY: 1.79,
    CNY: 0.087, CHF: 0.011, BRL: 0.059, MXN: 0.21, KRW: 16.2
  },
  symbols: {
    INR: '\u20B9', USD: '$', EUR: '\u20AC', GBP: '\u00A3', AED: 'AED',
    SAR: 'SAR', SGD: 'S$', AUD: 'A$', CAD: 'C$', JPY: '\u00A5',
    CNY: '\u00A5', CHF: 'Fr', BRL: 'R$', MXN: '$', KRW: '\u20A9'
  },
  names: {
    INR: 'Indian Rupee', USD: 'US Dollar', EUR: 'Euro', GBP: 'British Pound',
    AED: 'UAE Dirham', SAR: 'Saudi Riyal', SGD: 'Singapore Dollar',
    AUD: 'Australian Dollar', CAD: 'Canadian Dollar', JPY: 'Japanese Yen',
    CNY: 'Chinese Yuan', CHF: 'Swiss Franc', BRL: 'Brazilian Real',
    MXN: 'Mexican Peso', KRW: 'South Korean Won'
  },
  locales: {
    INR: 'en-IN', USD: 'en-US', EUR: 'de-DE', GBP: 'en-GB', AED: 'ar-AE',
    SAR: 'ar-SA', SGD: 'en-SG', AUD: 'en-AU', CAD: 'en-CA', JPY: 'ja-JP',
    CNY: 'zh-CN', CHF: 'de-CH', BRL: 'pt-BR', MXN: 'es-MX', KRW: 'ko-KR'
  },
  customerCurrencies: {},
  lastUpdated: null,
}

function getStore() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return { ...DEFAULT_CURRENCIES, ...JSON.parse(stored) }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CURRENCIES))
    return DEFAULT_CURRENCIES
  } catch {
    return DEFAULT_CURRENCIES
  }
}

function save(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

// ============= Live Rate Sync =============

/**
 * Refresh exchange rates from API and persist them.
 * Rates are relative to baseCurrency (default INR).
 */
export async function refreshRates() {
  const store = getStore()
  try {
    const rates = currencyService.fetchAllRates
      ? await currencyService.fetchAllRates(store.baseCurrency)
      : store.rates
    // Only keep the currencies we support
    const filtered = {}
    for (const code of Object.keys(store.rates)) {
      filtered[code] = rates[code] || store.rates[code]
    }
    filtered[store.baseCurrency] = 1
    store.rates = filtered
    store.lastUpdated = new Date().toISOString()
    save(store)
    return filtered
  } catch {
    return store.rates
  }
}

/**
 * Get last rate update time.
 */
export function getLastRateUpdate() {
  const store = getStore()
  if (!store.lastUpdated) {
    const cached = currencyService.getCachedRates ? currencyService.getCachedRates() : null
    return cached ? new Date(Date.now() - cached.age).toISOString() : null
  }
  return store.lastUpdated
}

// ============= Conversion =============

/**
 * Convert amount from one currency to another using stored rates.
 * Rates are stored relative to baseCurrency.
 */
export function convertCurrency(amount, fromCurrency, toCurrency) {
  if (fromCurrency === toCurrency) return amount
  const store = getStore()

  const fromRate = store.rates[fromCurrency]
  const toRate = store.rates[toCurrency]
  if (!fromRate || !toRate) return amount

  // Convert: amount in fromCurrency -> baseCurrency -> toCurrency
  const inBase = amount / fromRate
  return Math.round(inBase * toRate * 100) / 100
}

/**
 * Convert amount from base currency to display currency (used by formatCurrencyDisplay).
 */
export function convertToDisplay(amount) {
  const store = getStore()
  return convertCurrency(amount, store.baseCurrency, store.displayCurrency)
}

// ============= Formatting =============

/**
 * Format a currency amount with proper symbol and locale.
 */
export function formatCurrency(amount, currency = null) {
  const store = getStore()
  const code = currency || store.displayCurrency || store.baseCurrency
  const locale = store.locales[code] || 'en-IN'

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    const symbol = store.symbols[code] || code
    return `${symbol}${Number(amount).toLocaleString(locale, { minimumFractionDigits: 2 })}`
  }
}

/**
 * Format amount in base currency and show converted equivalent.
 * e.g. "5,000 (USD 60.00)" when base=INR, display=USD
 */
export function formatWithConversion(amount, baseCurrencyOverride = null) {
  const store = getStore()
  const base = baseCurrencyOverride || store.baseCurrency
  const display = store.displayCurrency

  const baseFormatted = formatCurrency(amount, base)
  if (base === display) return baseFormatted

  const converted = convertCurrency(amount, base, display)
  const convertedFormatted = formatCurrency(converted, display)
  return `${baseFormatted} (${convertedFormatted})`
}

/**
 * Format amount with INR as primary and optional secondary currency.
 */
export function formatINR(amount) {
  return formatCurrency(amount, 'INR')
}

// ============= Currency Config =============

/**
 * Get all supported currencies with metadata.
 */
export function getSupportedCurrencies() {
  const store = getStore()
  return Object.keys(store.rates).map(code => ({
    code,
    symbol: store.symbols[code] || code,
    name: store.names[code] || code,
    rate: store.rates[code],
    locale: store.locales[code] || 'en-US',
  }))
}

/**
 * Get the base currency code.
 */
export function getBaseCurrency() {
  return getStore().baseCurrency
}

/**
 * Get the display currency code.
 */
export function getDisplayCurrency() {
  return getStore().displayCurrency || getStore().baseCurrency
}

/**
 * Set the display currency (what the user sees amounts converted to).
 */
export function setDisplayCurrency(code) {
  const store = getStore()
  store.displayCurrency = code
  save(store)
}

/**
 * Set the base currency (the primary accounting currency).
 */
export function setBaseCurrency(code) {
  const store = getStore()
  store.baseCurrency = code
  save(store)
}

// ============= Customer Currencies =============

/**
 * Set preferred currency for a customer.
 */
export function setCustomerCurrency(customerId, currency) {
  const store = getStore()
  store.customerCurrencies[customerId] = currency
  save(store)
}

/**
 * Get a customer's preferred currency.
 */
export function getCustomerCurrency(customerId) {
  const store = getStore()
  return store.customerCurrencies[customerId] || store.baseCurrency
}

// ============= Rate Helpers =============

/**
 * Update exchange rates manually.
 */
export function updateExchangeRates(rates) {
  const store = getStore()
  store.rates = { ...store.rates, ...rates }
  store.lastUpdated = new Date().toISOString()
  save(store)
}

/**
 * Get exchange rate between two currencies.
 */
export function getExchangeRate(fromCurrency, toCurrency) {
  const store = getStore()
  const fromRate = store.rates[fromCurrency] || 1
  const toRate = store.rates[toCurrency] || 1
  return toRate / fromRate
}

/**
 * Check if a given amount in a currency exceeds a threshold in the base currency.
 * Useful for approval flows: "is this PO > 5000 INR?"
 */
export function exceedsThreshold(amount, currency, thresholdInBase) {
  const store = getStore()
  const amountInBase = convertCurrency(amount, currency, store.baseCurrency)
  return amountInBase > thresholdInBase
}
