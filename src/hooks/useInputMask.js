import { useCallback } from 'react'

// Phone number formatter: (555) 123-4567
export function formatPhone(value) {
    const digits = value.replace(/\D/g, '').slice(0, 10)
    if (digits.length === 0) return ''
    if (digits.length <= 3) return `(${digits}`
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`
}

// Currency formatter
export function formatCurrencyInput(value, symbol = '$') {
    const num = value.replace(/[^\d.]/g, '')
    const parts = num.split('.')
    if (parts.length > 2) return symbol + parts[0] + '.' + parts.slice(1).join('')
    const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    return symbol + (parts.length === 2 ? `${intPart}.${parts[1].slice(0, 2)}` : intPart)
}

// Date formatter: DD/MM/YYYY
export function formatDateInput(value) {
    const digits = value.replace(/\D/g, '').slice(0, 8)
    if (digits.length <= 2) return digits
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
}

// Percentage formatter
export function formatPercentage(value) {
    const num = value.replace(/[^\d.]/g, '')
    return num ? `${num}%` : ''
}

// GST/Tax ID formatter
export function formatGSTIN(value) {
    return value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 15)
}

// Hook that returns an onChange handler with formatting
export function useInputMask(formatter) {
    return useCallback((e) => {
        const formatted = formatter(e.target.value)
        e.target.value = formatted
        return formatted
    }, [formatter])
}

// Email validation
export function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// Phone validation
export function isValidPhone(phone) {
    return /^\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/.test(phone.replace(/\D/g, '') ? phone : '')
}

// URL validation
export function isValidURL(url) {
    try { new URL(url); return true } catch { return false }
}
