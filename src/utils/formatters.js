// Relative date formatting
export function relativeDate(dateStr) {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now - date
    const diffSecs = Math.floor(diffMs / 1000)
    const diffMins = Math.floor(diffSecs / 60)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)
    const diffWeeks = Math.floor(diffDays / 7)
    const diffMonths = Math.floor(diffDays / 30)

    if (diffSecs < 60) return 'just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays === 1) return 'yesterday'
    if (diffDays < 7) return `${diffDays}d ago`
    if (diffWeeks < 4) return `${diffWeeks}w ago`
    if (diffMonths < 12) return `${diffMonths}mo ago`
    return date.toLocaleDateString()
}

// Click-to-call link formatter
export function telLink(phone) {
    if (!phone) return null
    const cleaned = phone.replace(/[^\d+]/g, '')
    return `tel:${cleaned}`
}

// Click-to-email link formatter
export function mailLink(email) {
    if (!email) return null
    return `mailto:${email}`
}

// Format phone number for display
export function formatPhone(phone) {
    if (!phone) return ''
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length === 10) {
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
    }
    if (cleaned.length === 11) {
        return `+${cleaned[0]} (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`
    }
    return phone
}

// Format file size
export function formatFileSize(bytes) {
    if (!bytes) return '0 B'
    const units = ['B', 'KB', 'MB', 'GB']
    let i = 0
    let size = bytes
    while (size >= 1024 && i < units.length - 1) {
        size /= 1024
        i++
    }
    return `${size.toFixed(i > 0 ? 1 : 0)} ${units[i]}`
}

// Truncate text with ellipsis
export function truncate(str, maxLength = 50) {
    if (!str || str.length <= maxLength) return str
    return str.slice(0, maxLength) + '...'
}

// Slugify a string
export function slugify(str) {
    return str
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '')
}

// Format number with commas
export function formatNumber(num) {
    if (num == null) return '0'
    return Number(num).toLocaleString()
}

// Calculate percentage
export function percentage(value, total) {
    if (!total) return 0
    return Math.round((value / total) * 100)
}
