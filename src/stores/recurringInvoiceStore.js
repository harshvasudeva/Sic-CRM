/**
 * Recurring Invoices Store - manages recurring invoice configurations.
 * Supports daily, weekly, monthly, quarterly, yearly frequencies.
 */

const STORAGE_KEY = 'sic_crm_recurring_invoices'

const FREQUENCIES = [
  { value: 'daily', label: 'Daily', days: 1 },
  { value: 'weekly', label: 'Weekly', days: 7 },
  { value: 'biweekly', label: 'Bi-weekly', days: 14 },
  { value: 'monthly', label: 'Monthly', days: 30 },
  { value: 'quarterly', label: 'Quarterly', days: 90 },
  { value: 'semiannual', label: 'Semi-annual', days: 182 },
  { value: 'yearly', label: 'Yearly', days: 365 },
]

function getStore() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function save(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function getRecurringInvoices() {
  return getStore()
}

export function getRecurringInvoice(id) {
  return getStore().find(r => r.id === id)
}

export function createRecurringInvoice(config) {
  const store = getStore()
  const newRecurring = {
    ...config,
    id: `ri_${Date.now()}`,
    status: 'active',
    invoicesGenerated: 0,
    lastGenerated: null,
    nextDue: config.startDate || new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
  }
  store.push(newRecurring)
  save(store)
  return newRecurring
}

export function updateRecurringInvoice(id, updates) {
  const store = getStore()
  const idx = store.findIndex(r => r.id === id)
  if (idx === -1) return null
  store[idx] = { ...store[idx], ...updates, updatedAt: new Date().toISOString() }
  save(store)
  return store[idx]
}

export function deleteRecurringInvoice(id) {
  save(getStore().filter(r => r.id !== id))
}

export function pauseRecurringInvoice(id) {
  return updateRecurringInvoice(id, { status: 'paused' })
}

export function resumeRecurringInvoice(id) {
  return updateRecurringInvoice(id, { status: 'active' })
}

export function calculateNextDueDate(lastDate, frequency) {
  const freq = FREQUENCIES.find(f => f.value === frequency)
  if (!freq || !lastDate) return null
  const date = new Date(lastDate)
  date.setDate(date.getDate() + freq.days)
  return date.toISOString().split('T')[0]
}

export function getDueRecurring() {
  const today = new Date().toISOString().split('T')[0]
  return getStore().filter(r => r.status === 'active' && r.nextDue <= today)
}

export function generateInvoiceFromRecurring(recurringId) {
  const recurring = getRecurringInvoice(recurringId)
  if (!recurring) return null

  const invoice = {
    id: `inv_${Date.now()}`,
    number: `INV-R-${String(recurring.invoicesGenerated + 1).padStart(4, '0')}`,
    customerName: recurring.customerName,
    customerEmail: recurring.customerEmail,
    items: recurring.items || [],
    amount: recurring.amount,
    currency: recurring.currency || 'INR',
    dueDate: recurring.nextDue,
    status: 'draft',
    recurringId: recurring.id,
    createdAt: new Date().toISOString(),
  }

  updateRecurringInvoice(recurringId, {
    invoicesGenerated: recurring.invoicesGenerated + 1,
    lastGenerated: new Date().toISOString(),
    nextDue: calculateNextDueDate(recurring.nextDue, recurring.frequency),
  })

  return invoice
}

export { FREQUENCIES }
