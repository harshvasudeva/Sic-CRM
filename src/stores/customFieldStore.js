/**
 * Custom Field Builder Store - allows users to define custom fields per module.
 * Fields are stored in localStorage and can be used in any form.
 */

const STORAGE_KEY = 'sic_crm_custom_fields'

const FIELD_TYPES = [
  { value: 'text', label: 'Text', icon: 'Type' },
  { value: 'number', label: 'Number', icon: 'Hash' },
  { value: 'email', label: 'Email', icon: 'Mail' },
  { value: 'phone', label: 'Phone', icon: 'Phone' },
  { value: 'url', label: 'URL', icon: 'Link' },
  { value: 'date', label: 'Date', icon: 'Calendar' },
  { value: 'datetime', label: 'Date & Time', icon: 'Clock' },
  { value: 'select', label: 'Dropdown', icon: 'ChevronDown' },
  { value: 'multiselect', label: 'Multi-Select', icon: 'List' },
  { value: 'checkbox', label: 'Checkbox', icon: 'CheckSquare' },
  { value: 'textarea', label: 'Long Text', icon: 'AlignLeft' },
  { value: 'currency', label: 'Currency', icon: 'DollarSign' },
  { value: 'percentage', label: 'Percentage', icon: 'Percent' },
  { value: 'rating', label: 'Rating', icon: 'Star' },
]

const MODULES = [
  'leads', 'contacts', 'deals', 'accounts', 'invoices',
  'quotations', 'products', 'vendors', 'employees',
  'purchaseOrders', 'salesOrders', 'tickets',
]

function getStore() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
    return {}
  } catch {
    return {}
  }
}

function saveStore(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

/**
 * Get all custom fields for a module.
 */
export function getCustomFields(module) {
  const store = getStore()
  return store[module] || []
}

/**
 * Get all custom fields across all modules.
 */
export function getAllCustomFields() {
  return getStore()
}

/**
 * Add a custom field to a module.
 */
export function addCustomField(module, field) {
  const store = getStore()
  if (!store[module]) store[module] = []

  const newField = {
    ...field,
    id: `cf_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    key: field.key || field.label.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''),
    module,
    createdAt: new Date().toISOString(),
    order: store[module].length,
  }

  store[module].push(newField)
  saveStore(store)
  return newField
}

/**
 * Update an existing custom field.
 */
export function updateCustomField(module, fieldId, updates) {
  const store = getStore()
  if (!store[module]) return null

  const idx = store[module].findIndex(f => f.id === fieldId)
  if (idx === -1) return null

  store[module][idx] = { ...store[module][idx], ...updates, updatedAt: new Date().toISOString() }
  saveStore(store)
  return store[module][idx]
}

/**
 * Delete a custom field.
 */
export function deleteCustomField(module, fieldId) {
  const store = getStore()
  if (!store[module]) return
  store[module] = store[module].filter(f => f.id !== fieldId)
  saveStore(store)
}

/**
 * Reorder custom fields within a module.
 */
export function reorderCustomFields(module, fieldIds) {
  const store = getStore()
  if (!store[module]) return

  const reordered = fieldIds.map((id, idx) => {
    const field = store[module].find(f => f.id === id)
    return field ? { ...field, order: idx } : null
  }).filter(Boolean)

  store[module] = reordered
  saveStore(store)
}

/**
 * Get the custom field data for a specific record.
 */
export function getCustomFieldValues(module, recordId) {
  try {
    const key = `sic_crm_cf_values_${module}_${recordId}`
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

/**
 * Save custom field values for a record.
 */
export function saveCustomFieldValues(module, recordId, values) {
  const key = `sic_crm_cf_values_${module}_${recordId}`
  localStorage.setItem(key, JSON.stringify(values))
}

/**
 * Validate a custom field value.
 */
export function validateCustomField(field, value) {
  if (field.required && (value === undefined || value === null || value === '')) {
    return `${field.label} is required`
  }

  if (value === undefined || value === null || value === '') return null

  switch (field.type) {
    case 'email': {
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRe.test(value)) return 'Invalid email address'
      break
    }
    case 'url': {
      try { new URL(value) } catch { return 'Invalid URL' }
      break
    }
    case 'number':
    case 'currency':
    case 'percentage': {
      if (isNaN(parseFloat(value))) return 'Must be a number'
      if (field.min !== undefined && parseFloat(value) < field.min) return `Minimum value is ${field.min}`
      if (field.max !== undefined && parseFloat(value) > field.max) return `Maximum value is ${field.max}`
      break
    }
    case 'text':
    case 'textarea': {
      if (field.maxLength && String(value).length > field.maxLength) return `Maximum ${field.maxLength} characters`
      break
    }
    default:
      break
  }

  return null
}

export { FIELD_TYPES, MODULES }
