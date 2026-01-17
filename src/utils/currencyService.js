
// Free API for exchange rates
const API_URL = 'https://api.exchangerate-api.com/v4/latest/USD';

export async function fetchExchangeRate(targetCurrency) {
    if (targetCurrency === 'USD') return 1;

    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch rates');
        const data = await response.json();
        return data.rates[targetCurrency] || 1;
    } catch (error) {
        console.error('Currency API Error:', error);
        return 1; // Fallback to 1:1 if API fails
    }
}
