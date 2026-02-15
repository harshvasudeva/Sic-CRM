/**
 * Approval Workflow Store
 * Manages multi-stage approval flows for POs and other documents.
 * Integrates with settings for threshold and currency-aware approval logic.
 */

import { getSettings } from './settingsStore'
import { convertCurrency, getBaseCurrency, formatCurrency } from './currencyStore'

const STORAGE_KEY = 'sic_crm_approvals'

const APPROVAL_STATUSES = {
  PENDING: 'pending',
  SUBMITTED: 'submitted',
  MANAGER_APPROVED: 'manager_approved',
  FINANCE_APPROVED: 'finance_approved',
  APPROVED: 'approved',
  REJECTED: 'rejected',
}

const APPROVAL_CHAIN = [
  { role: 'manager', label: 'Manager', level: 1 },
  { role: 'finance_head', label: 'Finance Head', level: 2 },
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

/**
 * Check if an amount (in a given currency) requires approval.
 * Converts to base currency before comparing to threshold.
 */
export function requiresApproval(amount, currency = null) {
  const settings = getSettings()
  if (!settings.approvalEnabled) return false

  const threshold = settings.approvalThreshold || 5000
  const baseCurrency = getBaseCurrency()
  const docCurrency = currency || baseCurrency

  // Convert the amount to base currency for comparison
  const amountInBase = docCurrency === baseCurrency
    ? amount
    : convertCurrency(amount, docCurrency, baseCurrency)

  return amountInBase > threshold
}

/**
 * Get the threshold in a specific currency for display.
 */
export function getThresholdInCurrency(currency) {
  const settings = getSettings()
  const threshold = settings.approvalThreshold || 5000
  const baseCurrency = getBaseCurrency()

  if (currency === baseCurrency) return threshold
  return convertCurrency(threshold, baseCurrency, currency)
}

/**
 * Get formatted threshold string with conversion.
 */
export function getFormattedThreshold(displayCurrency = null) {
  const settings = getSettings()
  const threshold = settings.approvalThreshold || 5000
  const baseCurrency = getBaseCurrency()

  const baseFormatted = formatCurrency(threshold, baseCurrency)
  if (!displayCurrency || displayCurrency === baseCurrency) return baseFormatted

  const converted = convertCurrency(threshold, baseCurrency, displayCurrency)
  return `${baseFormatted} (${formatCurrency(converted, displayCurrency)})`
}

/**
 * Submit a document for approval.
 */
export function submitForApproval({ documentId, documentType, amount, currency, submittedBy, description }) {
  const store = getStore()
  const baseCurrency = getBaseCurrency()
  const amountInBase = currency === baseCurrency
    ? amount
    : convertCurrency(amount, currency, baseCurrency)

  const approval = {
    id: `approval-${Date.now()}`,
    documentId,
    documentType, // 'purchase_order', 'expense_claim', etc.
    amount,
    currency: currency || baseCurrency,
    amountInBase,
    submittedBy: submittedBy || 'Admin',
    description: description || `${documentType} #${documentId}`,
    status: APPROVAL_STATUSES.SUBMITTED,
    submittedAt: new Date().toISOString(),
    approvalChain: APPROVAL_CHAIN.map(step => ({
      ...step,
      status: 'pending',
      approvedBy: null,
      approvedAt: null,
      comment: '',
    })),
    history: [{
      action: 'submitted',
      by: submittedBy || 'Admin',
      at: new Date().toISOString(),
      comment: 'Submitted for approval',
    }],
  }

  store.push(approval)
  save(store)
  return approval
}

/**
 * Approve at a specific level.
 */
export function approveAtLevel(approvalId, level, approvedBy, comment = '') {
  const store = getStore()
  const idx = store.findIndex(a => a.id === approvalId)
  if (idx === -1) return null

  const approval = store[idx]
  const step = approval.approvalChain.find(s => s.level === level)
  if (!step) return null

  step.status = 'approved'
  step.approvedBy = approvedBy || 'Admin'
  step.approvedAt = new Date().toISOString()
  step.comment = comment

  // Check if all levels approved
  const allApproved = approval.approvalChain.every(s => s.status === 'approved')
  if (allApproved) {
    approval.status = APPROVAL_STATUSES.APPROVED
  } else if (level === 1) {
    approval.status = APPROVAL_STATUSES.MANAGER_APPROVED
  }

  approval.history.push({
    action: 'approved',
    by: approvedBy || 'Admin',
    at: new Date().toISOString(),
    comment: comment || `Approved at level ${level}`,
    level,
  })

  store[idx] = approval
  save(store)
  return approval
}

/**
 * Reject at any level.
 */
export function rejectApproval(approvalId, rejectedBy, comment = '') {
  const store = getStore()
  const idx = store.findIndex(a => a.id === approvalId)
  if (idx === -1) return null

  const approval = store[idx]
  approval.status = APPROVAL_STATUSES.REJECTED

  approval.history.push({
    action: 'rejected',
    by: rejectedBy || 'Admin',
    at: new Date().toISOString(),
    comment: comment || 'Rejected',
  })

  store[idx] = approval
  save(store)
  return approval
}

/**
 * Get approval for a specific document.
 */
export function getApprovalForDocument(documentId, documentType) {
  const store = getStore()
  return store.find(a => a.documentId === documentId && a.documentType === documentType) || null
}

/**
 * Get all pending approvals (for approval inbox).
 */
export function getPendingApprovals(role = null) {
  const store = getStore()
  return store.filter(a => {
    if (a.status === APPROVAL_STATUSES.APPROVED || a.status === APPROVAL_STATUSES.REJECTED) return false
    if (!role) return true
    // Check if the current role's level is pending
    const step = a.approvalChain.find(s => s.role === role)
    if (!step) return false
    // Previous levels must be approved
    const prevSteps = a.approvalChain.filter(s => s.level < step.level)
    const prevAllApproved = prevSteps.every(s => s.status === 'approved')
    return prevAllApproved && step.status === 'pending'
  })
}

/**
 * Get all approvals with optional filters.
 */
export function getApprovals(filters = {}) {
  let store = getStore()
  if (filters.status) store = store.filter(a => a.status === filters.status)
  if (filters.documentType) store = store.filter(a => a.documentType === filters.documentType)
  return store.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
}

export { APPROVAL_STATUSES, APPROVAL_CHAIN }
