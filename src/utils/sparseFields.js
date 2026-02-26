/**
 * C15: Sparse Fieldsets / Selective Field Fetching
 * Optimizes API payloads by requesting only needed fields.
 * Works with the existing REST API by adding field selection query params.
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

/**
 * Build a URL with sparse fieldset parameters
 * @param {string} endpoint - API endpoint path
 * @param {string[]} fields - Fields to include in response
 * @param {object} params - Additional query parameters
 * @returns {string} Full URL with field selection
 */
export function buildSparseUrl(endpoint, fields = [], params = {}) {
  const url = new URL(`${API_BASE}/${endpoint}`)
  if (fields.length > 0) {
    url.searchParams.set('fields', fields.join(','))
  }
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      url.searchParams.set(key, String(value))
    }
  })
  return url.toString()
}

/**
 * Fetch with sparse fields - wraps standard fetch
 */
export async function fetchSparse(endpoint, fields = [], options = {}) {
  const url = buildSparseUrl(endpoint, fields, options.params)
  const token = localStorage.getItem('token')
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  })
  if (!res.ok) throw new Error(`API Error: ${res.status}`)
  return res.json()
}

/**
 * Predefined field sets for common use cases
 */
export const FIELD_SETS = {
  // Dropdown/select options - minimal fields
  dropdown: {
    partners: ['id', 'name', 'type'],
    items: ['id', 'sku', 'name'],
    accounts: ['id', 'code', 'name', 'type'],
    locations: ['id', 'name', 'code', 'type'],
    employees: ['id', 'name', 'department']
  },

  // List view - moderate fields
  list: {
    partners: ['id', 'name', 'type', 'email', 'phone', 'status', 'createdAt'],
    items: ['id', 'sku', 'name', 'category', 'salesPrice', 'canBeSold', 'isActive'],
    invoices: ['id', 'invoiceNumber', 'customerName', 'totalAmount', 'status', 'createdAt']
  },

  // Detail view - all fields
  detail: {
    partners: null, // null = all fields
    items: null,
    invoices: null
  }
}

/**
 * Hook-like getter for field set
 */
export function getFieldSet(entity, view = 'list') {
  return FIELD_SETS[view]?.[entity] || null
}
