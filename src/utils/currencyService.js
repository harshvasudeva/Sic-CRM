
// Currency Exchange Rate Service
// Fetches live rates and caches them to avoid excessive API calls

const API_URL = 'https://api.exchangerate-api.com/v4/latest/'
const CACHE_KEY = 'sic_crm_exchange_rates_cache'
const CACHE_DURATION = 60 * 60 * 1000 // 1 hour

function getCache() {
    try {
        const cached = localStorage.getItem(CACHE_KEY)
        if (!cached) return null
        const data = JSON.parse(cached)
        if (Date.now() - data.timestamp > CACHE_DURATION) return null
        return data
    } catch {
        return null
    }
}

function setCache(baseCurrency, rates) {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
        baseCurrency,
        rates,
        timestamp: Date.now()
    }))
}

/**
 * Fetch exchange rate for a single target currency (legacy support).
 */
export async function fetchExchangeRate(targetCurrency) {
    if (targetCurrency === 'USD') return 1

    try {
        const allRates = await fetchAllRates('USD')
        return allRates[targetCurrency] || 1
    } catch (error) {
        console.error('Currency API Error:', error)
        return 1
    }
}

/**
 * Fetch all exchange rates for a given base currency.
 * Uses caching to avoid excessive API calls.
 */
export async function fetchAllRates(baseCurrency = 'INR') {
    // Check cache first
    const cached = getCache()
    if (cached && cached.baseCurrency === baseCurrency) {
        return cached.rates
    }

    try {
        const response = await fetch(`${API_URL}${baseCurrency}`)
        if (!response.ok) throw new Error('Failed to fetch rates')
        const data = await response.json()
        setCache(baseCurrency, data.rates)
        return data.rates
    } catch (error) {
        console.error('Currency API Error:', error)
        // Return fallback rates relative to INR
        return getFallbackRates(baseCurrency)
    }
}

/**
 * Convert amount between currencies using live rates.
 */
export async function convertAmount(amount, fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) return amount
    try {
        const rates = await fetchAllRates(fromCurrency)
        const rate = rates[toCurrency]
        if (!rate) return amount
        return Math.round(amount * rate * 100) / 100
    } catch {
        return amount
    }
}

/**
 * Get the exchange rate between two currencies.
 */
export async function getRate(fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) return 1
    try {
        const rates = await fetchAllRates(fromCurrency)
        return rates[toCurrency] || 1
    } catch {
        return 1
    }
}

/**
 * Get cached rates (synchronous - returns null if no cache).
 */
export function getCachedRates() {
    const cached = getCache()
    return cached ? { rates: cached.rates, baseCurrency: cached.baseCurrency, age: Date.now() - cached.timestamp } : null
}

/**
 * Fallback rates when API is unavailable (approximate, INR-centric).
 */
function getFallbackRates(baseCurrency) {
    const inrRates = {
        INR: 1, USD: 0.012, EUR: 0.011, GBP: 0.0094, JPY: 1.79,
        CNY: 0.087, CAD: 0.016, AUD: 0.018, CHF: 0.011, SGD: 0.016,
        AED: 0.044, SAR: 0.045, BRL: 0.059, MXN: 0.21, KRW: 16.2
    }

    if (baseCurrency === 'INR') return inrRates

    // Convert fallback rates to requested base
    const inrToBase = inrRates[baseCurrency]
    if (!inrToBase) return inrRates

    const converted = {}
    for (const [code, rate] of Object.entries(inrRates)) {
        converted[code] = Math.round((rate / inrToBase) * 1000000) / 1000000
    }
    return converted
}
