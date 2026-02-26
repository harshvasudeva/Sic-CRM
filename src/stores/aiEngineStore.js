/**
 * AI Engine Store - Section E: Analytics, AI & Automations (E1-E12)
 *
 * Implements all twelve AI/analytics features using deterministic offline logic
 * (string similarity, simple statistics, pattern matching) with localStorage persistence.
 *
 * E1  - AI Data Deduplication
 * E2  - Predictive Procurement
 * E3  - Dynamic Pricing
 * E4  - OCR Processing
 * E5  - Dunning Automation
 * E6  - LLM Context Summarization
 * E7  - Anomaly Detection
 * E8  - Route Optimization
 * E9  - Bank Reconciliation
 * E10 - PTO Leave Forecasting
 * E11 - Predictive Maintenance
 * E12 - Natural Language Query
 */

// ==================== STORAGE KEYS ====================
const STORAGE_KEYS = {
  deduplicationQueue: 'sic-crm-dedup-queue',
  procurementForecasts: 'sic-crm-procurement-forecasts',
  pricingRules: 'sic-crm-dynamic-pricing',
  ocrResults: 'sic-crm-ocr-results',
  dunningSchedules: 'sic-crm-dunning-schedules',
  aiSummaries: 'sic-crm-ai-summaries',
  anomalyAlerts: 'sic-crm-anomaly-alerts',
  routeOptimizations: 'sic-crm-routes',
  bankReconciliation: 'sic-crm-bank-recon',
  leaveForecasts: 'sic-crm-leave-forecasts',
  maintenanceOrders: 'sic-crm-maintenance-orders',
  nlQueryHistory: 'sic-crm-nl-queries'
}

// ==================== LOCAL STORAGE HELPERS ====================

/**
 * Load data from localStorage with fallback to initial value.
 * @param {string} key - Storage key
 * @param {*} initial - Default value if key is missing or corrupt
 * @returns {*} Parsed data or initial value
 */
function getStore(key, initial) {
  try {
    const stored = localStorage.getItem(key)
    if (stored) return JSON.parse(stored)
  } catch (e) {
    console.warn(`[aiEngineStore] Failed to parse ${key}:`, e)
  }
  localStorage.setItem(key, JSON.stringify(initial))
  return initial
}

/**
 * Persist data to localStorage.
 * @param {string} key - Storage key
 * @param {*} data - Data to persist
 */
function setStore(key, data) {
  localStorage.setItem(key, JSON.stringify(data))
}

/**
 * Generate a unique ID with an optional prefix.
 * @param {string} prefix
 * @returns {string}
 */
function genId(prefix = 'ai') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

/**
 * Get today's date as an ISO string (date portion only).
 * @returns {string}
 */
function today() {
  return new Date().toISOString().slice(0, 10)
}

/**
 * Get current ISO timestamp.
 * @returns {string}
 */
function now() {
  return new Date().toISOString()
}

// ==================== STRING SIMILARITY (shared utility) ====================

/**
 * Compute the Levenshtein edit distance between two strings.
 * @param {string} a
 * @param {string} b
 * @returns {number} Edit distance
 */
function levenshtein(a, b) {
  const la = a.length
  const lb = b.length
  if (la === 0) return lb
  if (lb === 0) return la
  const matrix = []
  for (let i = 0; i <= lb; i++) matrix[i] = [i]
  for (let j = 0; j <= la; j++) matrix[0][j] = j
  for (let i = 1; i <= lb; i++) {
    for (let j = 1; j <= la; j++) {
      const cost = b.charAt(i - 1) === a.charAt(j - 1) ? 0 : 1
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      )
    }
  }
  return matrix[lb][la]
}

/**
 * Compute similarity ratio between two strings (0-1, higher = more similar).
 * @param {string} a
 * @param {string} b
 * @returns {number} Similarity ratio
 */
function similarity(a, b) {
  if (!a || !b) return 0
  const sa = a.toLowerCase().trim()
  const sb = b.toLowerCase().trim()
  if (sa === sb) return 1
  const maxLen = Math.max(sa.length, sb.length)
  if (maxLen === 0) return 1
  return 1 - levenshtein(sa, sb) / maxLen
}

/**
 * Normalize a string for fuzzy comparison (lowercase, trimmed, collapsed whitespace).
 * @param {string} str
 * @returns {string}
 */
function normalize(str) {
  return (str || '').toLowerCase().trim().replace(/\s+/g, ' ')
}

// ==================== CROSS-STORE DATA ACCESS HELPERS ====================

function getCRMData() {
  try { return JSON.parse(localStorage.getItem('sic-crm-leads') || '[]') } catch { return [] }
}
function getContacts() {
  try { return JSON.parse(localStorage.getItem('sic-crm-contacts') || '[]') } catch { return [] }
}
function getOpportunities() {
  try { return JSON.parse(localStorage.getItem('sic-crm-opportunities') || '[]') } catch { return [] }
}
function getActivities() {
  try { return JSON.parse(localStorage.getItem('sic-crm-activities') || '[]') } catch { return [] }
}
function getInvoices() {
  try { return JSON.parse(localStorage.getItem('sic-sales-invoices') || '[]') } catch { return [] }
}
function getSalesOrders() {
  try { return JSON.parse(localStorage.getItem('sic-sales-orders') || '[]') } catch { return [] }
}
function getProducts() {
  try { return JSON.parse(localStorage.getItem('sic-inventory-products') || '[]') } catch { return [] }
}
function getVendors() {
  try { return JSON.parse(localStorage.getItem('erp_vendors') || '[]') } catch { return [] }
}
function getPurchaseOrders() {
  try { return JSON.parse(localStorage.getItem('erp_purchaseOrders') || '[]') } catch { return [] }
}
function getJournalEntries() {
  try { return JSON.parse(localStorage.getItem('sic-accounting-journal-entries') || '[]') } catch { return [] }
}
function getExpenses() {
  try { return JSON.parse(localStorage.getItem('sic-accounting-expenses') || '[]') } catch { return [] }
}

// ========================================================================================
// E1 - AI DATA DEDUPLICATION
// ========================================================================================

/** @type {Array} Default seed for deduplication queue */
const SEED_DEDUP_QUEUE = [
  { id: 'dup-001', entityType: 'lead', recordA: 'lead-001', recordB: 'lead-008', nameA: 'John Carter', nameB: 'Jon Carter', similarityScore: 0.91, field: 'name', status: 'pending', detectedAt: '2026-02-20T10:15:00Z' },
  { id: 'dup-002', entityType: 'contact', recordA: 'cont-003', recordB: 'cont-015', nameA: 'Priya Sharma', nameB: 'Priya K. Sharma', similarityScore: 0.87, field: 'name', status: 'pending', detectedAt: '2026-02-21T09:00:00Z' },
  { id: 'dup-003', entityType: 'lead', recordA: 'lead-002', recordB: 'lead-012', nameA: 'Emily Watson', nameB: 'Emily Wattson', similarityScore: 0.93, field: 'name', status: 'merged', mergedAt: '2026-02-22T14:30:00Z', detectedAt: '2026-02-19T11:45:00Z' },
  { id: 'dup-004', entityType: 'contact', recordA: 'cont-007', recordB: 'cont-021', nameA: 'rajesh@sharmaelectronics.in', nameB: 'rajesh.sharma@sharmaelectronics.in', similarityScore: 0.85, field: 'email', status: 'dismissed', detectedAt: '2026-02-18T08:20:00Z' },
  { id: 'dup-005', entityType: 'lead', recordA: 'lead-005', recordB: 'lead-018', nameA: 'David Kim', nameB: 'David K.', similarityScore: 0.78, field: 'name', status: 'pending', detectedAt: '2026-02-23T16:00:00Z' }
]

/**
 * Scan a given entity type for potential duplicate records using Levenshtein similarity.
 * Compares name and email fields to detect fuzzy matches above a configurable threshold.
 * @param {string} entityType - One of 'lead', 'contact', 'opportunity'
 * @param {number} [threshold=0.75] - Minimum similarity score to flag as duplicate
 * @returns {Array<Object>} List of duplicate pair objects
 */
export function scanForDuplicates(entityType, threshold = 0.75) {
  let records = []
  if (entityType === 'lead') records = getCRMData()
  else if (entityType === 'contact') records = getContacts()
  else if (entityType === 'opportunity') records = getOpportunities()

  const queue = getStore(STORAGE_KEYS.deduplicationQueue, SEED_DEDUP_QUEUE)
  const newDuplicates = []

  for (let i = 0; i < records.length; i++) {
    for (let j = i + 1; j < records.length; j++) {
      const a = records[i]
      const b = records[j]

      // Check name similarity
      const nameSim = similarity(a.name || a.company || '', b.name || b.company || '')
      if (nameSim >= threshold) {
        const exists = queue.some(
          q => (q.recordA === a.id && q.recordB === b.id) ||
               (q.recordA === b.id && q.recordB === a.id)
        )
        if (!exists) {
          const dup = {
            id: genId('dup'),
            entityType,
            recordA: a.id,
            recordB: b.id,
            nameA: a.name || a.company || '',
            nameB: b.name || b.company || '',
            similarityScore: Math.round(nameSim * 100) / 100,
            field: 'name',
            status: 'pending',
            detectedAt: now()
          }
          newDuplicates.push(dup)
          queue.push(dup)
        }
      }

      // Check email similarity
      if (a.email && b.email) {
        const emailSim = similarity(a.email, b.email)
        if (emailSim >= threshold) {
          const exists = queue.some(
            q => (q.recordA === a.id && q.recordB === b.id && q.field === 'email')
          )
          if (!exists) {
            const dup = {
              id: genId('dup'),
              entityType,
              recordA: a.id,
              recordB: b.id,
              nameA: a.email,
              nameB: b.email,
              similarityScore: Math.round(emailSim * 100) / 100,
              field: 'email',
              status: 'pending',
              detectedAt: now()
            }
            newDuplicates.push(dup)
            queue.push(dup)
          }
        }
      }
    }
  }

  setStore(STORAGE_KEYS.deduplicationQueue, queue)
  return newDuplicates
}

/**
 * Merge two records by keeping the primary and archiving the duplicate.
 * The primary record gains any fields present only on the duplicate.
 * @param {string} entityType - 'lead', 'contact', or 'opportunity'
 * @param {string} primaryId - ID of the record to keep
 * @param {string} duplicateId - ID of the record to archive/remove
 * @returns {Object} Result with merged record details
 */
export function mergeRecords(entityType, primaryId, duplicateId) {
  const storageMap = {
    lead: 'sic-crm-leads',
    contact: 'sic-crm-contacts',
    opportunity: 'sic-crm-opportunities'
  }
  const key = storageMap[entityType]
  if (!key) return { success: false, error: 'Unknown entity type' }

  let records = []
  try { records = JSON.parse(localStorage.getItem(key) || '[]') } catch { records = [] }

  const primary = records.find(r => r.id === primaryId)
  const duplicate = records.find(r => r.id === duplicateId)
  if (!primary || !duplicate) return { success: false, error: 'Record(s) not found' }

  // Fill in blank fields from duplicate into primary
  Object.keys(duplicate).forEach(field => {
    if (field === 'id' || field === 'createdAt') return
    if (!primary[field] && duplicate[field]) {
      primary[field] = duplicate[field]
    }
  })
  primary.mergedFrom = primary.mergedFrom || []
  primary.mergedFrom.push({ id: duplicateId, mergedAt: now() })

  // Remove duplicate
  records = records.filter(r => r.id !== duplicateId)
  localStorage.setItem(key, JSON.stringify(records))

  // Update dedup queue
  const queue = getStore(STORAGE_KEYS.deduplicationQueue, SEED_DEDUP_QUEUE)
  queue.forEach(q => {
    if ((q.recordA === primaryId && q.recordB === duplicateId) ||
        (q.recordA === duplicateId && q.recordB === primaryId)) {
      q.status = 'merged'
      q.mergedAt = now()
    }
  })
  setStore(STORAGE_KEYS.deduplicationQueue, queue)

  return { success: true, mergedRecord: primary, removedId: duplicateId }
}

/**
 * Get the admin deduplication queue with optional status filter.
 * @param {string} [statusFilter] - Optional filter: 'pending', 'merged', 'dismissed'
 * @returns {Array<Object>} Queue entries
 */
export function getDuplicateQueue(statusFilter) {
  const queue = getStore(STORAGE_KEYS.deduplicationQueue, SEED_DEDUP_QUEUE)
  if (statusFilter) return queue.filter(q => q.status === statusFilter)
  return queue
}

/**
 * Dismiss a duplicate entry (mark as not-a-duplicate).
 * @param {string} dupId - Dedup queue entry ID
 * @returns {Object} Updated entry
 */
export function dismissDuplicate(dupId) {
  const queue = getStore(STORAGE_KEYS.deduplicationQueue, SEED_DEDUP_QUEUE)
  const entry = queue.find(q => q.id === dupId)
  if (entry) {
    entry.status = 'dismissed'
    entry.dismissedAt = now()
  }
  setStore(STORAGE_KEYS.deduplicationQueue, queue)
  return entry
}

// ========================================================================================
// E2 - PREDICTIVE PROCUREMENT
// ========================================================================================

/** @type {Array} Default seed for procurement forecasts */
const SEED_PROCUREMENT_FORECASTS = [
  { id: 'pf-001', itemId: 'prod-001', itemName: 'Widget Pro', currentStock: 156, avgDailySales: 3.2, leadTimeDays: 14, reorderPoint: 95, reorderDate: '2026-03-05', suggestedQty: 200, status: 'upcoming', confidence: 'high', generatedAt: '2026-02-20T08:00:00Z' },
  { id: 'pf-002', itemId: 'prod-002', itemName: 'Gadget X', currentStock: 85, avgDailySales: 2.1, leadTimeDays: 10, reorderPoint: 51, reorderDate: '2026-03-06', suggestedQty: 100, status: 'upcoming', confidence: 'medium', generatedAt: '2026-02-20T08:00:00Z' },
  { id: 'pf-003', itemId: 'prod-003', itemName: 'Component A', currentStock: 340, avgDailySales: 8.5, leadTimeDays: 21, reorderPoint: 229, reorderDate: '2026-02-27', suggestedQty: 500, status: 'urgent', confidence: 'high', generatedAt: '2026-02-20T08:00:00Z' },
  { id: 'pf-004', itemId: 'prod-005', itemName: 'Assembly Kit B', currentStock: 45, avgDailySales: 1.0, leadTimeDays: 7, reorderPoint: 17, reorderDate: '2026-03-15', suggestedQty: 50, status: 'planned', confidence: 'low', generatedAt: '2026-02-20T08:00:00Z' }
]

/**
 * Calculate the sales velocity for an item over a given period.
 * Uses sales order line items to count units shipped.
 * @param {string} itemId - Product ID
 * @param {number} [periodDays=30] - Look-back window in days
 * @returns {Object} Velocity data: { totalSold, periodDays, avgPerDay }
 */
export function getSalesVelocity(itemId, periodDays = 30) {
  const orders = getSalesOrders()
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - periodDays)
  const cutoffStr = cutoff.toISOString().slice(0, 10)

  let totalSold = 0
  orders.forEach(order => {
    if (order.orderDate >= cutoffStr || order.createdAt >= cutoffStr) {
      const items = order.items || order.lineItems || []
      items.forEach(li => {
        if (li.productId === itemId || li.itemId === itemId || li.sku === itemId) {
          totalSold += li.quantity || li.qty || 0
        }
      })
    }
  })

  // Fallback: use a realistic simulated velocity if no data
  if (totalSold === 0) {
    const hash = itemId.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
    totalSold = (hash % 50) + 10
  }

  return {
    itemId,
    totalSold,
    periodDays,
    avgPerDay: Math.round((totalSold / periodDays) * 100) / 100
  }
}

/**
 * Calculate the predicted reorder date for a specific item.
 * Based on current stock, daily sales velocity, and vendor lead time.
 * @param {string} itemId - Product ID
 * @returns {Object} Reorder forecast for the item
 */
export function calculateReorderDate(itemId) {
  const products = getProducts()
  const product = products.find(p => p.id === itemId)
  if (!product) return { error: 'Product not found' }

  const velocity = getSalesVelocity(itemId, 30)
  const dailyRate = velocity.avgPerDay || 1
  const leadTime = product.leadTimeDays || 14
  const safetyStock = product.minStock || product.reorderLevel || 20
  const currentStock = product.stock || 0

  // Days until stock hits the reorder point
  const daysUntilReorder = Math.max(0, Math.floor((currentStock - safetyStock) / dailyRate))
  // We must order leadTime days before running out
  const daysUntilOrder = Math.max(0, daysUntilReorder - leadTime)

  const reorderDate = new Date()
  reorderDate.setDate(reorderDate.getDate() + daysUntilOrder)

  const suggestedQty = Math.ceil(dailyRate * (leadTime + 30)) // Enough for lead time + 30-day buffer

  let status = 'planned'
  if (daysUntilOrder <= 0) status = 'urgent'
  else if (daysUntilOrder <= 7) status = 'upcoming'

  const forecast = {
    id: genId('pf'),
    itemId,
    itemName: product.name,
    currentStock,
    avgDailySales: dailyRate,
    leadTimeDays: leadTime,
    reorderPoint: safetyStock,
    reorderDate: reorderDate.toISOString().slice(0, 10),
    daysUntilOrder,
    suggestedQty,
    status,
    confidence: dailyRate > 2 ? 'high' : dailyRate > 0.5 ? 'medium' : 'low',
    generatedAt: now()
  }

  // Persist
  const forecasts = getStore(STORAGE_KEYS.procurementForecasts, SEED_PROCUREMENT_FORECASTS)
  const idx = forecasts.findIndex(f => f.itemId === itemId)
  if (idx >= 0) forecasts[idx] = forecast
  else forecasts.push(forecast)
  setStore(STORAGE_KEYS.procurementForecasts, forecasts)

  return forecast
}

/**
 * Generate procurement forecasts for all active inventory items.
 * Returns a list of items that need reordering, sorted by urgency.
 * @returns {Array<Object>} List of procurement forecasts
 */
export function generateProcurementForecast() {
  const products = getProducts()
  const forecasts = []
  products.filter(p => p.status === 'active' && p.type === 'stockable').forEach(p => {
    const f = calculateReorderDate(p.id)
    if (!f.error) forecasts.push(f)
  })
  forecasts.sort((a, b) => (a.daysUntilOrder || 999) - (b.daysUntilOrder || 999))
  return forecasts
}

/**
 * Get all persisted procurement forecasts.
 * @returns {Array<Object>}
 */
export function getProcurementForecasts() {
  return getStore(STORAGE_KEYS.procurementForecasts, SEED_PROCUREMENT_FORECASTS)
}

// ========================================================================================
// E3 - DYNAMIC PRICING
// ========================================================================================

/** @type {Object} Default seed for dynamic pricing */
const SEED_PRICING = {
  rules: [
    { id: 'pr-001', name: 'Standard Markup', category: 'Finished Goods', markupType: 'percentage', markupValue: 40, minMargin: 20, maxDiscount: 15, isActive: true, createdAt: '2026-01-01' },
    { id: 'pr-002', name: 'Raw Material Passthrough', category: 'Raw Materials', markupType: 'percentage', markupValue: 25, minMargin: 10, maxDiscount: 5, isActive: true, createdAt: '2026-01-01' },
    { id: 'pr-003', name: 'Service Premium', category: 'Services', markupType: 'fixed', markupValue: 500, minMargin: 30, maxDiscount: 10, isActive: true, createdAt: '2026-01-15' },
    { id: 'pr-004', name: 'Seasonal Discount Q1', category: 'Finished Goods', markupType: 'percentage', markupValue: 30, minMargin: 15, maxDiscount: 25, isActive: false, createdAt: '2026-02-01' }
  ],
  history: [
    { id: 'ph-001', itemId: 'prod-001', itemName: 'Widget Pro', oldCost: 3200, newCost: 3500, oldPrice: 4800, newPrice: 5000, changeReason: 'Vendor cost increase', appliedRule: 'pr-001', changedAt: '2026-02-10' },
    { id: 'ph-002', itemId: 'prod-002', itemName: 'Gadget X', oldCost: 1500, newCost: 1500, oldPrice: 2800, newPrice: 2500, changeReason: 'Competitive adjustment', appliedRule: 'pr-001', changedAt: '2026-02-12' },
    { id: 'ph-003', itemId: 'prod-003', itemName: 'Component A', oldCost: 600, newCost: 650, oldPrice: 850, newPrice: 910, changeReason: 'Vendor cost increase', appliedRule: 'pr-002', changedAt: '2026-02-15' }
  ]
}

/**
 * Recalculate the price for an item based on cost changes and active pricing rules.
 * Applies the matching category rule and ensures minimum margin is maintained.
 * @param {string} itemId - Product ID
 * @returns {Object} New pricing details with before/after comparison
 */
export function recalculatePricing(itemId) {
  const products = getProducts()
  const product = products.find(p => p.id === itemId)
  if (!product) return { error: 'Product not found' }

  const pricingData = getStore(STORAGE_KEYS.pricingRules, SEED_PRICING)
  const applicableRule = pricingData.rules.find(
    r => r.isActive && r.category === product.category
  ) || pricingData.rules.find(r => r.isActive)

  if (!applicableRule) return { error: 'No active pricing rule found' }

  const cost = product.cost || 0
  let newPrice

  if (applicableRule.markupType === 'percentage') {
    newPrice = Math.round(cost * (1 + applicableRule.markupValue / 100))
  } else {
    newPrice = cost + applicableRule.markupValue
  }

  // Ensure minimum margin
  const effectiveMargin = ((newPrice - cost) / newPrice) * 100
  if (effectiveMargin < applicableRule.minMargin) {
    newPrice = Math.round(cost / (1 - applicableRule.minMargin / 100))
  }

  const oldPrice = product.price || 0
  const priceChanged = newPrice !== oldPrice

  if (priceChanged) {
    const historyEntry = {
      id: genId('ph'),
      itemId,
      itemName: product.name,
      oldCost: cost,
      newCost: cost,
      oldPrice,
      newPrice,
      changeReason: 'Dynamic pricing recalculation',
      appliedRule: applicableRule.id,
      margin: Math.round(effectiveMargin * 100) / 100,
      changedAt: now()
    }
    pricingData.history.push(historyEntry)
    setStore(STORAGE_KEYS.pricingRules, pricingData)
  }

  return {
    itemId,
    itemName: product.name,
    cost,
    oldPrice,
    newPrice,
    priceChanged,
    margin: Math.round(((newPrice - cost) / newPrice) * 100 * 100) / 100,
    appliedRule: applicableRule.name
  }
}

/**
 * Get the pricing change history for a specific item or all items.
 * @param {string} [itemId] - Optional product ID filter
 * @returns {Array<Object>} Price change history
 */
export function getPricingHistory(itemId) {
  const data = getStore(STORAGE_KEYS.pricingRules, SEED_PRICING)
  if (itemId) return data.history.filter(h => h.itemId === itemId)
  return data.history
}

/**
 * Set bulk pricing rules. Replaces or inserts rules by matching category.
 * @param {Array<Object>} rules - Array of pricing rule objects
 * @returns {Array<Object>} Updated rule list
 */
export function setBulkPricing(rules) {
  const data = getStore(STORAGE_KEYS.pricingRules, SEED_PRICING)
  rules.forEach(newRule => {
    const idx = data.rules.findIndex(r => r.category === newRule.category && r.name === newRule.name)
    if (idx >= 0) {
      data.rules[idx] = { ...data.rules[idx], ...newRule, updatedAt: now() }
    } else {
      data.rules.push({ id: genId('pr'), ...newRule, isActive: true, createdAt: now() })
    }
  })
  setStore(STORAGE_KEYS.pricingRules, data)
  return data.rules
}

/**
 * Get all active pricing rules.
 * @returns {Array<Object>}
 */
export function getPricingRules() {
  return getStore(STORAGE_KEYS.pricingRules, SEED_PRICING).rules
}

// ========================================================================================
// E4 - OCR PROCESSING
// ========================================================================================

/** @type {Array} Default seed for OCR results */
const SEED_OCR_RESULTS = [
  {
    id: 'ocr-001', imageUrl: '/uploads/receipt-001.jpg', status: 'completed',
    extractedData: {
      vendorName: 'Sharma Electronics', invoiceNumber: 'SE-2026-4501', date: '2026-02-10',
      total: 12500, taxAmount: 1875, subtotal: 10625, currency: 'INR',
      lineItems: [
        { description: 'USB-C Cable 2m', quantity: 10, unitPrice: 350, total: 3500 },
        { description: 'HDMI Adapter', quantity: 5, unitPrice: 625, total: 3125 },
        { description: 'Wireless Mouse', quantity: 5, unitPrice: 800, total: 4000 }
      ]
    },
    confidence: 0.94, processedAt: '2026-02-10T14:30:00Z'
  },
  {
    id: 'ocr-002', imageUrl: '/uploads/receipt-002.jpg', status: 'completed',
    extractedData: {
      vendorName: 'Kumar Office Supplies', invoiceNumber: 'KOS-8832', date: '2026-02-14',
      total: 8750, taxAmount: 1312, subtotal: 7438, currency: 'INR',
      lineItems: [
        { description: 'A4 Paper Reams (75 GSM)', quantity: 20, unitPrice: 250, total: 5000 },
        { description: 'Ballpoint Pens Box', quantity: 10, unitPrice: 120, total: 1200 },
        { description: 'Sticky Notes Pack', quantity: 15, unitPrice: 82.5, total: 1238 }
      ]
    },
    confidence: 0.91, processedAt: '2026-02-14T09:15:00Z'
  },
  {
    id: 'ocr-003', imageUrl: '/uploads/receipt-003.jpg', status: 'review_needed',
    extractedData: {
      vendorName: 'Unclear Vendor Name', invoiceNumber: null, date: '2026-02-18',
      total: 3200, taxAmount: 480, subtotal: 2720, currency: 'INR',
      lineItems: [
        { description: 'Misc supplies', quantity: 1, unitPrice: 2720, total: 2720 }
      ]
    },
    confidence: 0.52, processedAt: '2026-02-18T16:45:00Z'
  }
]

/**
 * Simulate OCR parsing of an uploaded receipt image.
 * Returns deterministically generated extracted data based on image URL hashing.
 * @param {string} imageUrl - URL or path to the receipt image
 * @returns {Object} OCR result with extracted vendor, total, tax, line items
 */
export function processReceipt(imageUrl) {
  const ocrResults = getStore(STORAGE_KEYS.ocrResults, SEED_OCR_RESULTS)

  // Deterministic simulation based on image URL
  const hash = (imageUrl || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const vendors = getVendors()
  const vendor = vendors[hash % Math.max(vendors.length, 1)] || { name: 'Unknown Vendor' }
  const subtotal = 1000 + (hash % 50000)
  const taxRate = 0.15
  const taxAmount = Math.round(subtotal * taxRate)
  const total = subtotal + taxAmount

  const itemCount = 1 + (hash % 5)
  const lineItems = []
  const sampleItems = ['Office Supplies', 'Electronic Components', 'Packaging Materials', 'Printing Services', 'Hardware Tools', 'Cleaning Products', 'Safety Equipment']
  for (let i = 0; i < itemCount; i++) {
    const qty = 1 + ((hash + i) % 20)
    const unitPrice = 50 + ((hash * (i + 1)) % 5000)
    lineItems.push({
      description: sampleItems[(hash + i) % sampleItems.length],
      quantity: qty,
      unitPrice: Math.round(unitPrice),
      total: Math.round(qty * unitPrice)
    })
  }

  const confidence = 0.7 + (hash % 25) / 100
  const result = {
    id: genId('ocr'),
    imageUrl,
    status: confidence > 0.8 ? 'completed' : 'review_needed',
    extractedData: {
      vendorName: vendor.name || 'Unknown Vendor',
      invoiceNumber: `INV-${hash % 10000}`,
      date: today(),
      total,
      taxAmount,
      subtotal,
      currency: 'INR',
      lineItems
    },
    confidence: Math.round(confidence * 100) / 100,
    processedAt: now()
  }

  ocrResults.push(result)
  setStore(STORAGE_KEYS.ocrResults, ocrResults)
  return result
}

/**
 * Get all OCR processing results, optionally filtered by status.
 * @param {string} [statusFilter] - 'completed', 'review_needed', or 'failed'
 * @returns {Array<Object>}
 */
export function getOCRResults(statusFilter) {
  const results = getStore(STORAGE_KEYS.ocrResults, SEED_OCR_RESULTS)
  if (statusFilter) return results.filter(r => r.status === statusFilter)
  return results
}

/**
 * Update an OCR result after manual review.
 * @param {string} ocrId - OCR result ID
 * @param {Object} corrections - Corrected extracted data fields
 * @returns {Object} Updated OCR result
 */
export function correctOCRResult(ocrId, corrections) {
  const results = getStore(STORAGE_KEYS.ocrResults, SEED_OCR_RESULTS)
  const result = results.find(r => r.id === ocrId)
  if (!result) return { error: 'OCR result not found' }

  Object.assign(result.extractedData, corrections)
  result.status = 'completed'
  result.correctedAt = now()
  result.manuallyReviewed = true
  setStore(STORAGE_KEYS.ocrResults, results)
  return result
}

// ========================================================================================
// E5 - DUNNING AUTOMATION
// ========================================================================================

/** @type {Object} Default seed for dunning schedules */
const SEED_DUNNING = {
  rules: [
    { id: 'dr-001', name: 'Standard Collection', steps: [
      { day: 7, action: 'friendly_email', template: 'Just a friendly reminder that invoice {{invoiceNumber}} for {{amount}} is now past due.', severity: 'low' },
      { day: 14, action: 'stern_email', template: 'Second notice: Invoice {{invoiceNumber}} is 14 days overdue. Please remit payment of {{amount}} immediately.', severity: 'medium' },
      { day: 30, action: 'phone_task', template: 'Call {{contactName}} regarding overdue invoice {{invoiceNumber}} ({{amount}}, 30 days overdue).', severity: 'high' },
      { day: 45, action: 'hold_account', template: 'Account {{companyName}} placed on hold due to invoice {{invoiceNumber}} being 45+ days overdue.', severity: 'critical' }
    ], isDefault: true, isActive: true, createdAt: '2026-01-01' },
    { id: 'dr-002', name: 'VIP Client Collection', steps: [
      { day: 14, action: 'friendly_email', template: 'Hi {{contactName}}, we noticed invoice {{invoiceNumber}} is outstanding. Please let us know if there are any issues.', severity: 'low' },
      { day: 30, action: 'phone_task', template: 'Personal call to {{contactName}} about outstanding balance of {{amount}}.', severity: 'medium' },
      { day: 60, action: 'escalate_manager', template: 'Escalate {{companyName}} account to management. Outstanding: {{amount}} for 60+ days.', severity: 'high' }
    ], isDefault: false, isActive: true, createdAt: '2026-01-15' }
  ],
  schedules: [
    { id: 'ds-001', invoiceId: 'inv-005', invoiceNumber: 'INV-2026-005', contactName: 'Rajesh Sharma', companyName: 'Sharma Electronics', amount: 45000, dueDate: '2026-02-01', daysOverdue: 25, ruleId: 'dr-001', currentStep: 2, lastAction: 'stern_email', lastActionDate: '2026-02-15', nextAction: 'phone_task', nextActionDate: '2026-03-03', status: 'in_progress' },
    { id: 'ds-002', invoiceId: 'inv-008', invoiceNumber: 'INV-2026-008', contactName: 'Amit Patel', companyName: 'TechServe Solutions', amount: 125000, dueDate: '2026-01-20', daysOverdue: 37, ruleId: 'dr-001', currentStep: 3, lastAction: 'phone_task', lastActionDate: '2026-02-19', nextAction: 'hold_account', nextActionDate: '2026-03-06', status: 'in_progress' },
    { id: 'ds-003', invoiceId: 'inv-012', invoiceNumber: 'INV-2026-012', contactName: 'Priya Kumar', companyName: 'Kumar Office Supplies', amount: 8750, dueDate: '2026-02-10', daysOverdue: 16, ruleId: 'dr-001', currentStep: 1, lastAction: 'friendly_email', lastActionDate: '2026-02-17', nextAction: 'stern_email', nextActionDate: '2026-02-24', status: 'in_progress' },
    { id: 'ds-004', invoiceId: 'inv-003', invoiceNumber: 'INV-2026-003', contactName: 'Vikram Singh', companyName: 'CloudNine IT', amount: 250000, dueDate: '2026-01-15', daysOverdue: 42, ruleId: 'dr-002', currentStep: 2, lastAction: 'phone_task', lastActionDate: '2026-02-14', nextAction: 'escalate_manager', nextActionDate: '2026-03-16', status: 'in_progress' }
  ],
  actionLog: [
    { id: 'da-001', scheduleId: 'ds-001', action: 'friendly_email', performedAt: '2026-02-08', status: 'sent' },
    { id: 'da-002', scheduleId: 'ds-001', action: 'stern_email', performedAt: '2026-02-15', status: 'sent' },
    { id: 'da-003', scheduleId: 'ds-002', action: 'friendly_email', performedAt: '2026-01-27', status: 'sent' },
    { id: 'da-004', scheduleId: 'ds-002', action: 'stern_email', performedAt: '2026-02-03', status: 'sent' },
    { id: 'da-005', scheduleId: 'ds-002', action: 'phone_task', performedAt: '2026-02-19', status: 'created_task' }
  ]
}

/**
 * Get the dunning schedule and escalation timeline for a specific invoice.
 * @param {string} invoiceId - Invoice ID
 * @returns {Object|null} Dunning schedule for the invoice
 */
export function getDunningSchedule(invoiceId) {
  const data = getStore(STORAGE_KEYS.dunningSchedules, SEED_DUNNING)
  const schedule = data.schedules.find(s => s.invoiceId === invoiceId)
  if (!schedule) return null
  const rule = data.rules.find(r => r.id === schedule.ruleId)
  const actions = data.actionLog.filter(a => a.scheduleId === schedule.id)
  return { ...schedule, rule, actions }
}

/**
 * Process all overdue invoices and advance dunning steps as needed.
 * Creates new schedules for invoices that just became overdue.
 * @returns {Object} Summary of dunning actions taken
 */
export function processDunning() {
  const invoices = getInvoices()
  const data = getStore(STORAGE_KEYS.dunningSchedules, SEED_DUNNING)
  const todayStr = today()
  const actions = []

  // Find overdue invoices not yet in the dunning system
  const overdueInvoices = invoices.filter(inv => {
    const isPaid = inv.status === 'paid' || inv.status === 'cancelled'
    const isOverdue = inv.dueDate && inv.dueDate < todayStr
    const alreadyTracked = data.schedules.some(s => s.invoiceId === inv.id)
    return !isPaid && isOverdue && !alreadyTracked
  })

  // Create new dunning schedules
  overdueInvoices.forEach(inv => {
    const dueDate = new Date(inv.dueDate)
    const daysOverdue = Math.floor((new Date() - dueDate) / (1000 * 60 * 60 * 24))
    const defaultRule = data.rules.find(r => r.isDefault && r.isActive)
    if (!defaultRule) return

    const schedule = {
      id: genId('ds'),
      invoiceId: inv.id,
      invoiceNumber: inv.invoiceNumber || inv.number || inv.id,
      contactName: inv.contactName || inv.customerName || 'Unknown',
      companyName: inv.company || inv.customerCompany || 'Unknown',
      amount: inv.total || inv.grandTotal || 0,
      dueDate: inv.dueDate,
      daysOverdue,
      ruleId: defaultRule.id,
      currentStep: 0,
      lastAction: null,
      lastActionDate: null,
      nextAction: defaultRule.steps[0]?.action || 'friendly_email',
      nextActionDate: todayStr,
      status: 'in_progress'
    }
    data.schedules.push(schedule)
    actions.push({ type: 'new_schedule', invoiceId: inv.id, schedule: schedule.id })
  })

  // Advance existing schedules
  data.schedules.filter(s => s.status === 'in_progress').forEach(schedule => {
    const rule = data.rules.find(r => r.id === schedule.ruleId)
    if (!rule) return
    const dueDate = new Date(schedule.dueDate)
    const daysOverdue = Math.floor((new Date() - dueDate) / (1000 * 60 * 60 * 24))
    schedule.daysOverdue = daysOverdue

    // Check if next step should fire
    const nextStepIndex = schedule.currentStep + 1
    if (nextStepIndex < rule.steps.length) {
      const nextStep = rule.steps[nextStepIndex]
      if (daysOverdue >= nextStep.day) {
        schedule.currentStep = nextStepIndex
        schedule.lastAction = nextStep.action
        schedule.lastActionDate = todayStr

        const futureStep = rule.steps[nextStepIndex + 1]
        schedule.nextAction = futureStep ? futureStep.action : 'completed'
        if (futureStep) {
          const nextDate = new Date(schedule.dueDate)
          nextDate.setDate(nextDate.getDate() + futureStep.day)
          schedule.nextActionDate = nextDate.toISOString().slice(0, 10)
        } else {
          schedule.nextActionDate = null
        }

        data.actionLog.push({
          id: genId('da'),
          scheduleId: schedule.id,
          action: nextStep.action,
          performedAt: todayStr,
          status: nextStep.action === 'phone_task' ? 'created_task' : 'sent'
        })

        actions.push({ type: 'step_advanced', scheduleId: schedule.id, action: nextStep.action, severity: nextStep.severity })
      }
    }
  })

  setStore(STORAGE_KEYS.dunningSchedules, data)
  return { processed: overdueInvoices.length, actionsTriggered: actions.length, actions }
}

/**
 * Create a new dunning rule with custom escalation steps.
 * @param {Object} rule - Rule definition with name, steps, etc.
 * @returns {Object} Created rule
 */
export function createDunningRule(rule) {
  const data = getStore(STORAGE_KEYS.dunningSchedules, SEED_DUNNING)
  const newRule = {
    id: genId('dr'),
    ...rule,
    isActive: true,
    createdAt: now()
  }
  data.rules.push(newRule)
  setStore(STORAGE_KEYS.dunningSchedules, data)
  return newRule
}

/**
 * Get all dunning schedules with optional status filter.
 * @param {string} [statusFilter] - 'in_progress', 'completed', 'paused'
 * @returns {Array<Object>}
 */
export function getDunningSchedules(statusFilter) {
  const data = getStore(STORAGE_KEYS.dunningSchedules, SEED_DUNNING)
  if (statusFilter) return data.schedules.filter(s => s.status === statusFilter)
  return data.schedules
}

/**
 * Get all dunning rules.
 * @returns {Array<Object>}
 */
export function getDunningRules() {
  return getStore(STORAGE_KEYS.dunningSchedules, SEED_DUNNING).rules
}

// ========================================================================================
// E6 - LLM CONTEXT SUMMARIZATION
// ========================================================================================

/** @type {Array} Default seed for AI summaries */
const SEED_AI_SUMMARIES = [
  {
    id: 'sum-001', contactId: 'cont-001', contactName: 'John Carter',
    summary: [
      'Engaged in 12 interactions over the past 60 days, primarily focused on enterprise licensing.',
      'Requested a product demo on Jan 15 which was positively received; follow-up meeting scheduled.',
      'Budget approval is pending internal review at TechStart Inc; expected decision by March.',
      'Key concern: integration with existing Salesforce instance and data migration timeline.'
    ],
    sentimentScore: 0.72, engagement: 'high', lastUpdated: '2026-02-20T10:00:00Z'
  },
  {
    id: 'sum-002', contactId: 'cont-003', contactName: 'Priya Sharma',
    summary: [
      'Long-standing vendor relationship (2+ years) with consistent order volume.',
      'Recently raised concerns about delivery delays on last two orders.',
      'Responded well to proposed SLA improvement plan; willing to continue partnership.',
      'Next touchpoint: quarterly business review scheduled for March 15.'
    ],
    sentimentScore: 0.58, engagement: 'medium', lastUpdated: '2026-02-18T14:30:00Z'
  }
]

/**
 * Summarize the last N interactions for a given contact into concise bullet points.
 * Uses deterministic logic to create summaries from activities and opportunities.
 * @param {string} contactId - Contact ID
 * @param {number} [limit=40] - Maximum number of activities to analyse
 * @returns {Object} Summary with bullets, sentiment, and engagement level
 */
export function summarizeInteractions(contactId, limit = 40) {
  const activities = getActivities()
  const contacts = getContacts()
  const opportunities = getOpportunities()

  const contact = contacts.find(c => c.id === contactId) || { name: 'Unknown Contact' }
  const contactActivities = activities
    .filter(a => a.contactId === contactId || a.relatedTo === contactId)
    .sort((a, b) => (b.date || b.createdAt || '').localeCompare(a.date || a.createdAt || ''))
    .slice(0, limit)

  const relatedDeals = opportunities.filter(o =>
    o.contactId === contactId || o.contactName === contact.name
  )

  // Build deterministic summary bullets
  const bullets = []
  const activityCount = contactActivities.length
  const daySpan = activityCount > 0 ? 60 : 0

  if (activityCount > 0) {
    const types = {}
    contactActivities.forEach(a => { types[a.type || 'interaction'] = (types[a.type || 'interaction'] || 0) + 1 })
    const topType = Object.entries(types).sort((a, b) => b[1] - a[1])[0]
    bullets.push(`Engaged in ${activityCount} interactions over the past ${daySpan} days, primarily ${topType ? topType[0] + 's' : 'general touchpoints'}.`)
  } else {
    bullets.push(`No recent interactions found. Consider scheduling a check-in call.`)
  }

  if (relatedDeals.length > 0) {
    const totalValue = relatedDeals.reduce((sum, d) => sum + (d.value || 0), 0)
    const stages = [...new Set(relatedDeals.map(d => d.stage))]
    bullets.push(`${relatedDeals.length} active deal(s) worth ${totalValue.toLocaleString()}, currently in ${stages.join(', ')} stage(s).`)
  }

  // Sentiment heuristic: positive words in notes
  const allNotes = contactActivities.map(a => (a.notes || a.description || '').toLowerCase()).join(' ')
  const positiveWords = ['great', 'happy', 'pleased', 'interested', 'approved', 'agreed', 'positive', 'excellent']
  const negativeWords = ['concern', 'delay', 'issue', 'problem', 'unhappy', 'complaint', 'declined', 'rejected']
  const posCount = positiveWords.filter(w => allNotes.includes(w)).length
  const negCount = negativeWords.filter(w => allNotes.includes(w)).length
  const sentimentScore = Math.round(((posCount + 1) / (posCount + negCount + 2)) * 100) / 100

  if (sentimentScore > 0.6) {
    bullets.push(`Overall sentiment is positive; the contact appears engaged and receptive.`)
  } else if (sentimentScore < 0.4) {
    bullets.push(`Sentiment trend is declining; proactive outreach recommended to address concerns.`)
  } else {
    bullets.push(`Sentiment is neutral; maintain regular follow-ups to strengthen the relationship.`)
  }

  const lastActivity = contactActivities[0]
  if (lastActivity) {
    bullets.push(`Last interaction: ${lastActivity.type || 'touchpoint'} on ${lastActivity.date || lastActivity.createdAt || 'unknown date'}.`)
  }

  const engagement = activityCount > 10 ? 'high' : activityCount > 3 ? 'medium' : 'low'

  const summaryObj = {
    id: genId('sum'),
    contactId,
    contactName: contact.name || 'Unknown',
    summary: bullets.slice(0, 4),
    sentimentScore,
    engagement,
    activityCount,
    lastUpdated: now()
  }

  // Persist
  const summaries = getStore(STORAGE_KEYS.aiSummaries, SEED_AI_SUMMARIES)
  const idx = summaries.findIndex(s => s.contactId === contactId)
  if (idx >= 0) summaries[idx] = summaryObj
  else summaries.push(summaryObj)
  setStore(STORAGE_KEYS.aiSummaries, summaries)

  return summaryObj
}

/**
 * Generate an email draft based on the contact's interaction history.
 * @param {string} contactId - Contact ID
 * @param {string} context - Email context/purpose (e.g., 'follow_up', 'proposal', 'check_in')
 * @returns {Object} Generated email draft with subject and body
 */
export function generateEmailDraft(contactId, context) {
  const contacts = getContacts()
  const contact = contacts.find(c => c.id === contactId) || {}
  const summary = summarizeInteractions(contactId)
  const name = contact.name || 'Valued Customer'
  const firstName = name.split(' ')[0]

  const templates = {
    follow_up: {
      subject: `Following up on our recent conversation`,
      body: `Hi ${firstName},\n\nI wanted to follow up on our recent discussion. ${summary.summary[0] || ''}\n\nI believe there are great opportunities for us to collaborate further. Would you be available for a quick call this week to discuss next steps?\n\nLooking forward to hearing from you.\n\nBest regards`
    },
    proposal: {
      subject: `Proposal for ${contact.company || 'your organization'}`,
      body: `Dear ${firstName},\n\nThank you for your continued interest. Based on our conversations, I have prepared a tailored proposal that addresses your key requirements.\n\n${summary.summary[1] || 'I believe this solution will provide significant value to your team.'}\n\nPlease find the proposal attached. I would love to schedule a walkthrough at your convenience.\n\nWarm regards`
    },
    check_in: {
      subject: `Checking in - How are things going?`,
      body: `Hi ${firstName},\n\nIt has been a while since we last connected, and I wanted to check in to see how everything is going on your end.\n\n${summary.sentimentScore < 0.5 ? 'I understand there may have been some concerns previously, and I want to ensure we address them.' : 'I hope our previous interactions have been valuable to your team.'}\n\nIs there anything we can assist you with? I am happy to hop on a call whenever works best.\n\nBest`
    },
    thank_you: {
      subject: `Thank you for your business`,
      body: `Dear ${firstName},\n\nI wanted to personally thank you for your continued partnership. ${summary.summary[0] || 'Your trust in our services means a great deal to us.'}\n\nWe are committed to delivering exceptional value and look forward to growing our relationship further.\n\nPlease do not hesitate to reach out if there is anything you need.\n\nWith appreciation`
    }
  }

  const template = templates[context] || templates.follow_up
  return {
    contactId,
    contactName: name,
    email: contact.email || '',
    context,
    subject: template.subject,
    body: template.body,
    generatedAt: now()
  }
}

/**
 * Get AI-generated next-best-action suggestions for a given entity.
 * @param {string} entityType - 'contact', 'lead', 'opportunity'
 * @param {string} entityId - Entity ID
 * @returns {Array<Object>} Suggested actions
 */
export function getAISuggestions(entityType, entityId) {
  const suggestions = []

  if (entityType === 'contact') {
    const summary = summarizeInteractions(entityId)
    if (summary.engagement === 'low') {
      suggestions.push({ action: 'schedule_call', priority: 'high', reason: 'Low engagement detected. Re-engage with a personal call.' })
      suggestions.push({ action: 'send_content', priority: 'medium', reason: 'Share relevant case study or whitepaper to rekindle interest.' })
    }
    if (summary.sentimentScore < 0.4) {
      suggestions.push({ action: 'escalate_to_manager', priority: 'high', reason: 'Declining sentiment. Involve a senior team member.' })
    }
    if (summary.engagement === 'high') {
      suggestions.push({ action: 'send_proposal', priority: 'medium', reason: 'High engagement. Time to present a tailored proposal.' })
    }
  }

  if (entityType === 'lead') {
    const leads = getCRMData()
    const lead = leads.find(l => l.id === entityId)
    if (lead) {
      if (lead.status === 'new') suggestions.push({ action: 'qualify_lead', priority: 'high', reason: 'New lead needs qualification within 24 hours.' })
      if (lead.score > 80) suggestions.push({ action: 'convert_to_opportunity', priority: 'high', reason: `High lead score (${lead.score}). Ready for conversion.` })
      if (!lead.lastContact) suggestions.push({ action: 'first_contact', priority: 'urgent', reason: 'No contact made yet. Reach out immediately.' })
    }
  }

  if (entityType === 'opportunity') {
    const opps = getOpportunities()
    const opp = opps.find(o => o.id === entityId)
    if (opp) {
      if (opp.stage === 'proposal') suggestions.push({ action: 'follow_up', priority: 'high', reason: 'Proposal sent. Follow up to advance deal.' })
      if (opp.stage === 'negotiation') suggestions.push({ action: 'prepare_contract', priority: 'high', reason: 'In negotiation. Prepare final contract terms.' })
      if (opp.value > 100000) suggestions.push({ action: 'involve_executive', priority: 'medium', reason: 'High-value deal. Consider executive sponsorship.' })
    }
  }

  // Always add a generic suggestion
  if (suggestions.length === 0) {
    suggestions.push({ action: 'log_activity', priority: 'low', reason: 'No specific actions needed. Keep the record updated.' })
  }

  return suggestions
}

/**
 * Get cached AI summaries.
 * @returns {Array<Object>}
 */
export function getAISummaries() {
  return getStore(STORAGE_KEYS.aiSummaries, SEED_AI_SUMMARIES)
}

// ========================================================================================
// E7 - ANOMALY DETECTION
// ========================================================================================

/** @type {Array} Default seed for anomaly alerts */
const SEED_ANOMALY_ALERTS = [
  { id: 'anom-001', type: 'high_amount', entity: 'invoice', entityId: 'inv-015', description: 'Invoice amount (850,000) is 3.2 standard deviations above the mean invoice value.', amount: 850000, threshold: 320000, deviations: 3.2, severity: 'critical', status: 'open', detectedAt: '2026-02-18T09:30:00Z' },
  { id: 'anom-002', type: 'unusual_frequency', entity: 'expense', entityId: 'exp-042', description: '7 expense claims filed by same employee in 3 days (avg: 2 per week).', count: 7, expectedCount: 2, severity: 'warning', status: 'open', detectedAt: '2026-02-20T11:15:00Z' },
  { id: 'anom-003', type: 'duplicate_payment', entity: 'payment', entityId: 'pay-028', description: 'Potential duplicate: two payments of 45,000 to same vendor within 24 hours.', amount: 45000, vendorName: 'Sharma Electronics', severity: 'high', status: 'investigating', detectedAt: '2026-02-21T14:00:00Z', assignedTo: 'emp-001' },
  { id: 'anom-004', type: 'off_hours', entity: 'journal_entry', entityId: 'je-045', description: 'Journal entry of 125,000 posted at 2:30 AM outside business hours.', amount: 125000, postedAt: '2026-02-19T02:30:00Z', severity: 'warning', status: 'resolved', detectedAt: '2026-02-19T08:00:00Z', resolution: 'Verified as legitimate quarter-end adjustment by CFO.' },
  { id: 'anom-005', type: 'vendor_mismatch', entity: 'purchase_order', entityId: 'po-019', description: 'PO amount (95,000) exceeds vendor credit limit (80,000) by 18.75%.', amount: 95000, limit: 80000, severity: 'warning', status: 'open', detectedAt: '2026-02-22T10:45:00Z' }
]

/**
 * Scan recent transactions for statistical anomalies.
 * Uses standard deviation from the mean to flag outlier amounts,
 * plus pattern-based checks for duplicates and off-hours activity.
 * @returns {Object} Scan results with newly detected anomalies
 */
export function scanForAnomalies() {
  const invoices = getInvoices()
  const expenses = getExpenses()
  const journalEntries = getJournalEntries()
  const alerts = getStore(STORAGE_KEYS.anomalyAlerts, SEED_ANOMALY_ALERTS)
  const newAlerts = []

  // -- Amount anomaly detection on invoices --
  const invoiceAmounts = invoices.map(i => i.total || i.grandTotal || 0).filter(a => a > 0)
  if (invoiceAmounts.length > 3) {
    const mean = invoiceAmounts.reduce((s, v) => s + v, 0) / invoiceAmounts.length
    const variance = invoiceAmounts.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / invoiceAmounts.length
    const stdDev = Math.sqrt(variance)

    invoices.forEach(inv => {
      const amount = inv.total || inv.grandTotal || 0
      if (amount > 0 && stdDev > 0) {
        const deviations = (amount - mean) / stdDev
        if (deviations > 2.5) {
          const exists = alerts.some(a => a.entityId === inv.id && a.type === 'high_amount')
          if (!exists) {
            const alert = {
              id: genId('anom'),
              type: 'high_amount',
              entity: 'invoice',
              entityId: inv.id,
              description: `Invoice amount (${amount.toLocaleString()}) is ${deviations.toFixed(1)} standard deviations above the mean.`,
              amount,
              threshold: Math.round(mean + 2.5 * stdDev),
              deviations: Math.round(deviations * 10) / 10,
              severity: deviations > 3 ? 'critical' : 'high',
              status: 'open',
              detectedAt: now()
            }
            newAlerts.push(alert)
            alerts.push(alert)
          }
        }
      }
    })
  }

  // -- Expense frequency anomaly --
  const expenseByEmployee = {}
  const recentCutoff = new Date()
  recentCutoff.setDate(recentCutoff.getDate() - 7)
  expenses.forEach(exp => {
    const empId = exp.employeeId || exp.submittedBy || 'unknown'
    const expDate = new Date(exp.date || exp.createdAt)
    if (expDate >= recentCutoff) {
      expenseByEmployee[empId] = (expenseByEmployee[empId] || 0) + 1
    }
  })
  Object.entries(expenseByEmployee).forEach(([empId, count]) => {
    if (count > 5) {
      const exists = alerts.some(a => a.type === 'unusual_frequency' && a.description.includes(empId))
      if (!exists) {
        const alert = {
          id: genId('anom'),
          type: 'unusual_frequency',
          entity: 'expense',
          entityId: empId,
          description: `${count} expense claims filed by employee ${empId} in 7 days (expected: 2-3).`,
          count,
          expectedCount: 3,
          severity: 'warning',
          status: 'open',
          detectedAt: now()
        }
        newAlerts.push(alert)
        alerts.push(alert)
      }
    }
  })

  // -- Off-hours journal entries --
  journalEntries.forEach(je => {
    const createdAt = je.createdAt || je.entryDate
    if (createdAt) {
      const hour = new Date(createdAt).getHours()
      if (hour < 6 || hour > 22) {
        const exists = alerts.some(a => a.entityId === je.id && a.type === 'off_hours')
        if (!exists) {
          const amount = je.totalDebit || 0
          const alert = {
            id: genId('anom'),
            type: 'off_hours',
            entity: 'journal_entry',
            entityId: je.id,
            description: `Journal entry of ${amount.toLocaleString()} posted at ${hour}:00 outside business hours.`,
            amount,
            postedAt: createdAt,
            severity: amount > 50000 ? 'high' : 'warning',
            status: 'open',
            detectedAt: now()
          }
          newAlerts.push(alert)
          alerts.push(alert)
        }
      }
    }
  })

  setStore(STORAGE_KEYS.anomalyAlerts, alerts)
  return {
    scannedInvoices: invoices.length,
    scannedExpenses: expenses.length,
    scannedJournalEntries: journalEntries.length,
    newAlerts: newAlerts.length,
    alerts: newAlerts
  }
}

/**
 * Get all anomaly alerts, optionally filtered by status or severity.
 * @param {Object} [filters] - { status, severity, type }
 * @returns {Array<Object>}
 */
export function getAnomalyAlerts(filters = {}) {
  let alerts = getStore(STORAGE_KEYS.anomalyAlerts, SEED_ANOMALY_ALERTS)
  if (filters.status) alerts = alerts.filter(a => a.status === filters.status)
  if (filters.severity) alerts = alerts.filter(a => a.severity === filters.severity)
  if (filters.type) alerts = alerts.filter(a => a.type === filters.type)
  return alerts
}

/**
 * Resolve an anomaly alert with a resolution note.
 * @param {string} alertId - Anomaly alert ID
 * @param {string} resolution - Description of the resolution
 * @returns {Object} Updated alert
 */
export function resolveAnomaly(alertId, resolution) {
  const alerts = getStore(STORAGE_KEYS.anomalyAlerts, SEED_ANOMALY_ALERTS)
  const alert = alerts.find(a => a.id === alertId)
  if (!alert) return { error: 'Alert not found' }
  alert.status = 'resolved'
  alert.resolution = resolution
  alert.resolvedAt = now()
  setStore(STORAGE_KEYS.anomalyAlerts, alerts)
  return alert
}

// ========================================================================================
// E8 - ROUTE OPTIMIZATION
// ========================================================================================

/** @type {Object} Default seed for route optimizations */
const SEED_ROUTES = {
  routes: [
    {
      id: 'route-001', agentId: 'emp-003', agentName: 'Ravi Kumar', date: '2026-02-25',
      stops: [
        { id: 'stop-1', name: 'Sharma Electronics', address: '45 Nehru Place, Delhi', lat: 28.5494, lng: 77.2519, type: 'delivery', estimatedTime: '09:30', completed: true },
        { id: 'stop-2', name: 'TechServe Solutions', address: '78 Andheri East, Mumbai', lat: 19.1136, lng: 72.8697, type: 'service_call', estimatedTime: '11:00', completed: true },
        { id: 'stop-3', name: 'Kumar Office Supplies', address: '12 MG Road, Bangalore', lat: 12.9716, lng: 77.5946, type: 'delivery', estimatedTime: '14:00', completed: false },
        { id: 'stop-4', name: 'GreenPack Packaging', address: '56 Industrial Area, Pune', lat: 18.5204, lng: 73.8567, type: 'pickup', estimatedTime: '16:30', completed: false }
      ],
      totalDistance: 142.5, estimatedDuration: 285, status: 'in_progress', optimizedAt: '2026-02-25T07:00:00Z'
    },
    {
      id: 'route-002', agentId: 'emp-005', agentName: 'Suresh Patel', date: '2026-02-26',
      stops: [
        { id: 'stop-5', name: 'Patel Raw Materials', address: '34 GIDC, Ahmedabad', lat: 23.0225, lng: 72.5714, type: 'pickup', estimatedTime: '09:00', completed: false },
        { id: 'stop-6', name: 'Singh Furniture Works', address: '23 Rajouri Garden, Delhi', lat: 28.6491, lng: 77.1135, type: 'delivery', estimatedTime: '12:00', completed: false },
        { id: 'stop-7', name: 'CloudNine IT Services', address: '90 Cyber City, Gurugram', lat: 28.4595, lng: 77.0266, type: 'service_call', estimatedTime: '15:00', completed: false }
      ],
      totalDistance: 98.3, estimatedDuration: 195, status: 'planned', optimizedAt: '2026-02-25T18:00:00Z'
    }
  ]
}

/**
 * Calculate Euclidean distance between two coordinates.
 * @param {{lat: number, lng: number}} a
 * @param {{lat: number, lng: number}} b
 * @returns {number} Distance in approximate km
 */
function geoDistance(a, b) {
  const dx = (a.lat - b.lat) * 111 // ~111 km per degree latitude
  const dy = (a.lng - b.lng) * 85  // approximate for India's latitude
  return Math.sqrt(dx * dx + dy * dy)
}

/**
 * Optimize a set of stops using a nearest-neighbor heuristic (simplified TSP).
 * Sorts stops by geographic proximity starting from the first stop.
 * @param {Array<Object>} stops - Array of stop objects with lat/lng coordinates
 * @returns {Object} Optimized route with total distance and estimated duration
 */
export function optimizeRoute(stops) {
  if (!stops || stops.length < 2) return { stops: stops || [], totalDistance: 0, estimatedDuration: 0 }

  // Nearest-neighbor heuristic
  const optimized = [stops[0]]
  const remaining = [...stops.slice(1)]

  while (remaining.length > 0) {
    const current = optimized[optimized.length - 1]
    let nearestIdx = 0
    let nearestDist = Infinity
    remaining.forEach((stop, idx) => {
      const dist = geoDistance(current, stop)
      if (dist < nearestDist) {
        nearestDist = dist
        nearestIdx = idx
      }
    })
    optimized.push(remaining[nearestIdx])
    remaining.splice(nearestIdx, 1)
  }

  // Calculate totals
  let totalDistance = 0
  for (let i = 1; i < optimized.length; i++) {
    totalDistance += geoDistance(optimized[i - 1], optimized[i])
  }
  totalDistance = Math.round(totalDistance * 10) / 10

  // Estimate time: assign arrival based on 30 min per stop + travel
  const startHour = 9
  optimized.forEach((stop, idx) => {
    const minutes = idx * 45 // 45 min per stop including travel
    const hour = startHour + Math.floor(minutes / 60)
    const min = minutes % 60
    stop.estimatedTime = `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`
    stop.order = idx + 1
  })

  return {
    stops: optimized,
    totalDistance,
    estimatedDuration: optimized.length * 45,
    optimizedAt: now()
  }
}

/**
 * Get the daily route plan for a specific agent.
 * @param {string} agentId - Employee/agent ID
 * @param {string} date - Date string (YYYY-MM-DD)
 * @returns {Object|null} Route for the given agent and date
 */
export function getRouteForAgent(agentId, date) {
  const data = getStore(STORAGE_KEYS.routeOptimizations, SEED_ROUTES)
  return data.routes.find(r => r.agentId === agentId && r.date === date) || null
}

/**
 * Save an optimized route to the store.
 * @param {Object} route - Route object with agentId, date, stops, etc.
 * @returns {Object} Saved route
 */
export function saveRoute(route) {
  const data = getStore(STORAGE_KEYS.routeOptimizations, SEED_ROUTES)
  const savedRoute = {
    id: genId('route'),
    ...route,
    status: 'planned',
    optimizedAt: now()
  }
  // Replace existing route for same agent/date or add new
  const idx = data.routes.findIndex(r => r.agentId === route.agentId && r.date === route.date)
  if (idx >= 0) data.routes[idx] = savedRoute
  else data.routes.push(savedRoute)
  setStore(STORAGE_KEYS.routeOptimizations, data)
  return savedRoute
}

/**
 * Get all saved routes, optionally filtered by status.
 * @param {string} [statusFilter] - 'planned', 'in_progress', 'completed'
 * @returns {Array<Object>}
 */
export function getRoutes(statusFilter) {
  const data = getStore(STORAGE_KEYS.routeOptimizations, SEED_ROUTES)
  if (statusFilter) return data.routes.filter(r => r.status === statusFilter)
  return data.routes
}

/**
 * Mark a stop as completed.
 * @param {string} routeId - Route ID
 * @param {string} stopId - Stop ID within the route
 * @returns {Object} Updated route
 */
export function completeStop(routeId, stopId) {
  const data = getStore(STORAGE_KEYS.routeOptimizations, SEED_ROUTES)
  const route = data.routes.find(r => r.id === routeId)
  if (!route) return { error: 'Route not found' }
  const stop = route.stops.find(s => s.id === stopId)
  if (stop) {
    stop.completed = true
    stop.completedAt = now()
  }
  // Check if all stops done
  if (route.stops.every(s => s.completed)) {
    route.status = 'completed'
  } else {
    route.status = 'in_progress'
  }
  setStore(STORAGE_KEYS.routeOptimizations, data)
  return route
}

// ========================================================================================
// E9 - BANK RECONCILIATION
// ========================================================================================

/** @type {Object} Default seed for bank reconciliation */
const SEED_BANK_RECON = {
  bankEntries: [
    { id: 'be-001', date: '2026-02-10', description: 'NEFT-TechStart Inc', amount: 120000, type: 'credit', reference: 'NEFT202602101234', bankAccount: 'HDFC-001', matchedInvoiceId: 'inv-001', matchConfidence: 0.95, status: 'matched' },
    { id: 'be-002', date: '2026-02-12', description: 'CHQ DEP Global Retail', amount: 75000, type: 'credit', reference: 'CHQ8834521', bankAccount: 'HDFC-001', matchedInvoiceId: 'inv-003', matchConfidence: 0.88, status: 'matched' },
    { id: 'be-003', date: '2026-02-14', description: 'IMPS Sharma Electronics', amount: 45000, type: 'credit', reference: 'IMPS20260214678', bankAccount: 'HDFC-001', matchedInvoiceId: null, matchConfidence: 0, status: 'unmatched' },
    { id: 'be-004', date: '2026-02-15', description: 'NEFT Payment Innovation Labs', amount: 92500, type: 'credit', reference: 'NEFT202602159876', bankAccount: 'HDFC-001', matchedInvoiceId: null, matchConfidence: 0, status: 'unmatched' },
    { id: 'be-005', date: '2026-02-18', description: 'RTGS CloudNine IT Svc', amount: 250000, type: 'credit', reference: 'RTGS20260218432', bankAccount: 'HDFC-001', matchedInvoiceId: null, matchConfidence: 0, status: 'unmatched' },
    { id: 'be-006', date: '2026-02-20', description: 'UPI-Misc deposit', amount: 3200, type: 'credit', reference: 'UPI20260220112', bankAccount: 'HDFC-001', matchedInvoiceId: null, matchConfidence: 0, status: 'unmatched' },
    { id: 'be-007', date: '2026-02-11', description: 'NEFT-Vendor Pmt Sharma Elec', amount: 65000, type: 'debit', reference: 'NEFT202602115555', bankAccount: 'HDFC-001', matchedInvoiceId: null, matchConfidence: 0, status: 'unmatched' },
    { id: 'be-008', date: '2026-02-16', description: 'NEFT-Vendor Pmt TechServe', amount: 205600, type: 'debit', reference: 'NEFT202602166666', bankAccount: 'HDFC-001', matchedInvoiceId: null, matchConfidence: 0, status: 'unmatched' }
  ],
  matchLog: [
    { id: 'ml-001', bankEntryId: 'be-001', invoiceId: 'inv-001', matchType: 'auto', confidence: 0.95, matchedAt: '2026-02-10T18:00:00Z', matchedBy: 'system' },
    { id: 'ml-002', bankEntryId: 'be-002', invoiceId: 'inv-003', matchType: 'auto', confidence: 0.88, matchedAt: '2026-02-12T18:00:00Z', matchedBy: 'system' }
  ]
}

/**
 * Import bank statement entries into the reconciliation system.
 * @param {Array<Object>} entries - Array of bank entries with date, description, amount, type, reference
 * @returns {Object} Import result summary
 */
export function importBankStatement(entries) {
  const data = getStore(STORAGE_KEYS.bankReconciliation, SEED_BANK_RECON)
  let imported = 0
  let skipped = 0

  entries.forEach(entry => {
    const exists = data.bankEntries.some(e => e.reference === entry.reference)
    if (exists) {
      skipped++
      return
    }
    data.bankEntries.push({
      id: genId('be'),
      ...entry,
      matchedInvoiceId: null,
      matchConfidence: 0,
      status: 'unmatched',
      importedAt: now()
    })
    imported++
  })

  setStore(STORAGE_KEYS.bankReconciliation, data)
  return { imported, skipped, total: data.bankEntries.length }
}

/**
 * Automatically match unmatched bank entries to open invoices using amount + name matching.
 * Uses a combination of exact amount match and fuzzy name comparison.
 * @returns {Object} Summary of matches found
 */
export function autoMatchTransactions() {
  const data = getStore(STORAGE_KEYS.bankReconciliation, SEED_BANK_RECON)
  const invoices = getInvoices()
  const purchaseOrders = getPurchaseOrders()
  const matches = []

  data.bankEntries.filter(e => e.status === 'unmatched').forEach(entry => {
    let bestMatch = null
    let bestConfidence = 0

    if (entry.type === 'credit') {
      // Match credits against invoices
      invoices.forEach(inv => {
        const invAmount = inv.total || inv.grandTotal || 0
        const amountMatch = invAmount > 0 && Math.abs(invAmount - entry.amount) / invAmount < 0.02 // Within 2%
        const nameMatch = similarity(
          entry.description,
          inv.customerName || inv.contactName || inv.company || ''
        )
        const confidence = (amountMatch ? 0.6 : 0) + (nameMatch * 0.4)
        if (confidence > bestConfidence && confidence > 0.5) {
          bestConfidence = confidence
          bestMatch = { invoiceId: inv.id, confidence }
        }
      })
    } else {
      // Match debits against purchase orders
      purchaseOrders.forEach(po => {
        const poAmount = po.total || 0
        const amountMatch = poAmount > 0 && Math.abs(poAmount - entry.amount) / poAmount < 0.02
        const vendorName = getVendors().find(v => v.id === po.vendorId)?.name || ''
        const nameMatch = similarity(entry.description, vendorName)
        const confidence = (amountMatch ? 0.6 : 0) + (nameMatch * 0.4)
        if (confidence > bestConfidence && confidence > 0.5) {
          bestConfidence = confidence
          bestMatch = { invoiceId: po.id, confidence }
        }
      })
    }

    if (bestMatch) {
      entry.matchedInvoiceId = bestMatch.invoiceId
      entry.matchConfidence = Math.round(bestMatch.confidence * 100) / 100
      entry.status = bestMatch.confidence > 0.8 ? 'matched' : 'review_needed'
      data.matchLog.push({
        id: genId('ml'),
        bankEntryId: entry.id,
        invoiceId: bestMatch.invoiceId,
        matchType: 'auto',
        confidence: entry.matchConfidence,
        matchedAt: now(),
        matchedBy: 'system'
      })
      matches.push({ bankEntryId: entry.id, invoiceId: bestMatch.invoiceId, confidence: entry.matchConfidence })
    }
  })

  setStore(STORAGE_KEYS.bankReconciliation, data)
  return { matchesFound: matches.length, matches }
}

/**
 * Get all unmatched bank entries that need manual reconciliation.
 * @returns {Array<Object>}
 */
export function getUnmatchedEntries() {
  const data = getStore(STORAGE_KEYS.bankReconciliation, SEED_BANK_RECON)
  return data.bankEntries.filter(e => e.status === 'unmatched' || e.status === 'review_needed')
}

/**
 * Manually confirm a match between a bank entry and an invoice.
 * @param {string} bankEntryId - Bank entry ID
 * @param {string} invoiceId - Invoice ID to match against
 * @returns {Object} Updated bank entry
 */
export function confirmMatch(bankEntryId, invoiceId) {
  const data = getStore(STORAGE_KEYS.bankReconciliation, SEED_BANK_RECON)
  const entry = data.bankEntries.find(e => e.id === bankEntryId)
  if (!entry) return { error: 'Bank entry not found' }

  entry.matchedInvoiceId = invoiceId
  entry.matchConfidence = 1.0
  entry.status = 'matched'

  data.matchLog.push({
    id: genId('ml'),
    bankEntryId,
    invoiceId,
    matchType: 'manual',
    confidence: 1.0,
    matchedAt: now(),
    matchedBy: 'user'
  })

  setStore(STORAGE_KEYS.bankReconciliation, data)
  return entry
}

/**
 * Get the full bank reconciliation data.
 * @returns {Object} { bankEntries, matchLog }
 */
export function getBankReconciliation() {
  return getStore(STORAGE_KEYS.bankReconciliation, SEED_BANK_RECON)
}

// ========================================================================================
// E10 - PTO LEAVE FORECASTING
// ========================================================================================

/** @type {Array} Default seed for leave forecasts */
const SEED_LEAVE_FORECASTS = [
  {
    id: 'lf-001', employeeId: 'emp-001', employeeName: 'Admin User', leaveType: 'annual',
    currentBalance: 12, accrualRate: 1.5, accrualPeriod: 'monthly',
    usedThisYear: 6, totalEntitlement: 24,
    projection: [
      { month: '2026-03', projected: 13.5, planned: 0, net: 13.5 },
      { month: '2026-04', projected: 15.0, planned: 3, net: 12.0 },
      { month: '2026-05', projected: 13.5, planned: 0, net: 13.5 },
      { month: '2026-06', projected: 15.0, planned: 5, net: 10.0 }
    ],
    generatedAt: '2026-02-20T10:00:00Z'
  },
  {
    id: 'lf-002', employeeId: 'emp-002', employeeName: 'Sarah Chen', leaveType: 'annual',
    currentBalance: 8, accrualRate: 1.5, accrualPeriod: 'monthly',
    usedThisYear: 10, totalEntitlement: 24,
    projection: [
      { month: '2026-03', projected: 9.5, planned: 2, net: 7.5 },
      { month: '2026-04', projected: 9.0, planned: 0, net: 9.0 },
      { month: '2026-05', projected: 10.5, planned: 0, net: 10.5 },
      { month: '2026-06', projected: 12.0, planned: 5, net: 7.0 }
    ],
    generatedAt: '2026-02-20T10:00:00Z'
  }
]

/**
 * Forecast the leave balance for an employee at a target date.
 * Calculates based on current balance, accrual rate, and planned leaves.
 * @param {string} employeeId - Employee ID
 * @param {string} targetDate - Target date in YYYY-MM-DD format
 * @returns {Object} Forecast result with projected balance
 */
export function forecastLeaveBalance(employeeId, targetDate) {
  const forecasts = getStore(STORAGE_KEYS.leaveForecasts, SEED_LEAVE_FORECASTS)
  const existing = forecasts.find(f => f.employeeId === employeeId)

  // Use existing data or create defaults
  const currentBalance = existing ? existing.currentBalance : 15
  const accrualRate = existing ? existing.accrualRate : 1.5
  const employeeName = existing ? existing.employeeName : `Employee ${employeeId}`

  const target = new Date(targetDate)
  const current = new Date()
  const monthsDiff = (target.getFullYear() - current.getFullYear()) * 12 + (target.getMonth() - current.getMonth())

  const accruedByTarget = currentBalance + (Math.max(0, monthsDiff) * accrualRate)
  // Estimate planned usage based on historical rate
  const usedThisYear = existing ? existing.usedThisYear : 4
  const monthlyUsageRate = usedThisYear > 0 ? usedThisYear / current.getMonth() : 0.5
  const estimatedUsage = Math.round(monthlyUsageRate * Math.max(0, monthsDiff) * 10) / 10

  const projectedBalance = Math.round((accruedByTarget - estimatedUsage) * 10) / 10

  return {
    employeeId,
    employeeName,
    targetDate,
    currentBalance,
    accrualRate,
    monthsUntilTarget: Math.max(0, monthsDiff),
    accruedByTarget: Math.round(accruedByTarget * 10) / 10,
    estimatedUsage,
    projectedBalance,
    canTakeLeave: projectedBalance > 0,
    maxConsecutiveDays: Math.floor(projectedBalance),
    generatedAt: now()
  }
}

/**
 * Get a month-by-month leave projection for an employee through end of year.
 * @param {string} employeeId - Employee ID
 * @returns {Object} Projection with monthly breakdown
 */
export function getLeaveProjection(employeeId) {
  const forecasts = getStore(STORAGE_KEYS.leaveForecasts, SEED_LEAVE_FORECASTS)
  const existing = forecasts.find(f => f.employeeId === employeeId)

  const currentBalance = existing ? existing.currentBalance : 15
  const accrualRate = existing ? existing.accrualRate : 1.5
  const employeeName = existing ? existing.employeeName : `Employee ${employeeId}`
  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()

  const projection = []
  let runningBalance = currentBalance

  for (let m = currentMonth + 1; m <= 12; m++) {
    runningBalance += accrualRate
    // Simulate some planned usage in popular vacation months
    const plannedUsage = [4, 6, 7, 12].includes(m) ? Math.min(3, runningBalance) : 0
    const net = Math.round((runningBalance - plannedUsage) * 10) / 10
    projection.push({
      month: `${currentYear}-${String(m).padStart(2, '0')}`,
      projected: Math.round(runningBalance * 10) / 10,
      planned: plannedUsage,
      net
    })
    runningBalance = net
  }

  const result = {
    id: existing ? existing.id : genId('lf'),
    employeeId,
    employeeName,
    leaveType: 'annual',
    currentBalance,
    accrualRate,
    accrualPeriod: 'monthly',
    usedThisYear: existing ? existing.usedThisYear : 4,
    totalEntitlement: 24,
    projection,
    generatedAt: now()
  }

  // Persist
  const idx = forecasts.findIndex(f => f.employeeId === employeeId)
  if (idx >= 0) forecasts[idx] = result
  else forecasts.push(result)
  setStore(STORAGE_KEYS.leaveForecasts, forecasts)

  return result
}

/**
 * Get all leave forecasts.
 * @returns {Array<Object>}
 */
export function getLeaveForecasts() {
  return getStore(STORAGE_KEYS.leaveForecasts, SEED_LEAVE_FORECASTS)
}

// ========================================================================================
// E11 - PREDICTIVE MAINTENANCE
// ========================================================================================

/** @type {Object} Default seed for maintenance system */
const SEED_MAINTENANCE = {
  machines: [
    { id: 'mch-001', name: 'CNC Lathe A1', type: 'cnc_lathe', location: 'Shop Floor 1', runHours: 4250, maxRunHours: 5000, lastService: '2026-01-10', serviceInterval: 500, status: 'operational', healthScore: 72, alerts: ['Approaching max run hours - 85% utilization'] },
    { id: 'mch-002', name: 'Hydraulic Press B2', type: 'hydraulic_press', location: 'Shop Floor 2', runHours: 1200, maxRunHours: 3000, lastService: '2026-02-01', serviceInterval: 750, status: 'operational', healthScore: 92, alerts: [] },
    { id: 'mch-003', name: 'Conveyor Belt C3', type: 'conveyor', location: 'Assembly Line', runHours: 8900, maxRunHours: 10000, lastService: '2025-12-15', serviceInterval: 1000, status: 'warning', healthScore: 45, alerts: ['Overdue for service by 400+ hours', 'Bearing temperature elevated'] },
    { id: 'mch-004', name: 'Welding Robot D4', type: 'welding_robot', location: 'Shop Floor 1', runHours: 2800, maxRunHours: 6000, lastService: '2026-01-25', serviceInterval: 600, status: 'operational', healthScore: 88, alerts: [] },
    { id: 'mch-005', name: 'Packaging Machine E5', type: 'packaging', location: 'Dispatch Area', runHours: 5100, maxRunHours: 5500, lastService: '2026-01-05', serviceInterval: 400, status: 'critical', healthScore: 28, alerts: ['Exceeded service interval by 700 hours', 'Motor vibration anomaly detected', 'Immediate maintenance required'] },
    { id: 'mch-006', name: 'Injection Molder F6', type: 'injection_mold', location: 'Shop Floor 3', runHours: 3400, maxRunHours: 8000, lastService: '2026-02-10', serviceInterval: 800, status: 'operational', healthScore: 85, alerts: [] }
  ],
  workOrders: [
    { id: 'wo-001', machineId: 'mch-003', machineName: 'Conveyor Belt C3', type: 'preventive', priority: 'high', description: 'Replace bearings and lubricate chain. Conveyor has 8900 hours and is overdue for service.', scheduledDate: '2026-02-28', assignedTo: 'Maintenance Team A', estimatedHours: 6, parts: ['Bearing Set', 'Chain Lubricant', 'Belt Tensioner'], status: 'scheduled', createdAt: '2026-02-20T09:00:00Z' },
    { id: 'wo-002', machineId: 'mch-005', machineName: 'Packaging Machine E5', type: 'corrective', priority: 'critical', description: 'Motor replacement and full inspection. Machine showing vibration anomaly and exceeded service hours.', scheduledDate: '2026-02-26', assignedTo: 'Maintenance Team B', estimatedHours: 12, parts: ['Motor Assembly', 'Coupling Kit', 'Vibration Dampener'], status: 'in_progress', createdAt: '2026-02-22T14:00:00Z' },
    { id: 'wo-003', machineId: 'mch-001', machineName: 'CNC Lathe A1', type: 'preventive', priority: 'medium', description: 'Scheduled 5000-hour major service. Spindle inspection, coolant system flush, tool holder calibration.', scheduledDate: '2026-03-10', assignedTo: 'Maintenance Team A', estimatedHours: 8, parts: ['Coolant Fluid', 'Spindle Bearing', 'Filter Kit'], status: 'scheduled', createdAt: '2026-02-24T11:00:00Z' }
  ]
}

/**
 * Check all machines against maintenance thresholds.
 * Flags machines approaching or exceeding service intervals.
 * @returns {Array<Object>} Machines that need attention, sorted by urgency
 */
export function checkMaintenanceThresholds() {
  const data = getStore(STORAGE_KEYS.maintenanceOrders, SEED_MAINTENANCE)
  const alerts = []

  data.machines.forEach(machine => {
    const hoursSinceService = machine.runHours - (machine.lastServiceHours || 0)
    const utilizationPct = Math.round((machine.runHours / machine.maxRunHours) * 100)
    const serviceOverdue = hoursSinceService > machine.serviceInterval
    const approachingLimit = utilizationPct > 80

    // Recalculate health score
    let healthScore = 100
    if (serviceOverdue) healthScore -= 30
    if (approachingLimit) healthScore -= 20
    if (utilizationPct > 90) healthScore -= 20
    if (hoursSinceService > machine.serviceInterval * 1.5) healthScore -= 15
    healthScore = Math.max(0, Math.min(100, healthScore))

    machine.healthScore = healthScore
    machine.alerts = []

    if (healthScore < 30) {
      machine.status = 'critical'
      machine.alerts.push('Immediate maintenance required')
    } else if (healthScore < 60) {
      machine.status = 'warning'
    } else {
      machine.status = 'operational'
    }

    if (serviceOverdue) {
      machine.alerts.push(`Overdue for service by ${hoursSinceService - machine.serviceInterval} hours`)
    }
    if (approachingLimit) {
      machine.alerts.push(`${utilizationPct}% of max run hours reached`)
    }

    if (machine.status !== 'operational') {
      alerts.push({
        machineId: machine.id,
        machineName: machine.name,
        status: machine.status,
        healthScore,
        alerts: machine.alerts,
        runHours: machine.runHours,
        utilizationPct
      })
    }
  })

  setStore(STORAGE_KEYS.maintenanceOrders, data)
  return alerts.sort((a, b) => a.healthScore - b.healthScore)
}

/**
 * Schedule a maintenance work order for a specific machine.
 * @param {string} machineId - Machine ID
 * @param {Object} [overrides] - Optional overrides for the work order fields
 * @returns {Object} Created work order
 */
export function scheduleMaintenanceOrder(machineId, overrides = {}) {
  const data = getStore(STORAGE_KEYS.maintenanceOrders, SEED_MAINTENANCE)
  const machine = data.machines.find(m => m.id === machineId)
  if (!machine) return { error: 'Machine not found' }

  const isCritical = machine.healthScore < 30
  const scheduledDate = new Date()
  scheduledDate.setDate(scheduledDate.getDate() + (isCritical ? 1 : 7))

  const workOrder = {
    id: genId('wo'),
    machineId,
    machineName: machine.name,
    type: isCritical ? 'corrective' : 'preventive',
    priority: isCritical ? 'critical' : machine.healthScore < 60 ? 'high' : 'medium',
    description: `${isCritical ? 'Emergency' : 'Scheduled'} maintenance for ${machine.name}. Current run hours: ${machine.runHours}. Health score: ${machine.healthScore}%.`,
    scheduledDate: scheduledDate.toISOString().slice(0, 10),
    assignedTo: overrides.assignedTo || 'Maintenance Team A',
    estimatedHours: overrides.estimatedHours || (isCritical ? 8 : 4),
    parts: overrides.parts || [],
    status: 'scheduled',
    createdAt: now(),
    ...overrides
  }

  data.workOrders.push(workOrder)
  setStore(STORAGE_KEYS.maintenanceOrders, data)
  return workOrder
}

/**
 * Get the health dashboard for all machines.
 * @returns {Array<Object>} Machine statuses sorted by health score (worst first)
 */
export function getMachineHealth() {
  const data = getStore(STORAGE_KEYS.maintenanceOrders, SEED_MAINTENANCE)
  return data.machines
    .map(m => ({
      id: m.id,
      name: m.name,
      type: m.type,
      location: m.location,
      runHours: m.runHours,
      maxRunHours: m.maxRunHours,
      utilizationPct: Math.round((m.runHours / m.maxRunHours) * 100),
      healthScore: m.healthScore,
      status: m.status,
      lastService: m.lastService,
      alerts: m.alerts
    }))
    .sort((a, b) => a.healthScore - b.healthScore)
}

/**
 * Get all maintenance work orders, optionally filtered by status.
 * @param {string} [statusFilter] - 'scheduled', 'in_progress', 'completed', 'cancelled'
 * @returns {Array<Object>}
 */
export function getMaintenanceOrders(statusFilter) {
  const data = getStore(STORAGE_KEYS.maintenanceOrders, SEED_MAINTENANCE)
  if (statusFilter) return data.workOrders.filter(wo => wo.status === statusFilter)
  return data.workOrders
}

// ========================================================================================
// E12 - NATURAL LANGUAGE QUERY
// ========================================================================================

/** @type {Array} Default seed for NL query history */
const SEED_NL_QUERIES = [
  {
    id: 'nlq-001', query: 'top 5 sales reps by revenue', parsedIntent: 'aggregate',
    parsedEntity: 'opportunities', parsedMetric: 'value', parsedGroupBy: 'assignedTo',
    parsedSort: 'desc', parsedLimit: 5,
    results: [
      { name: 'Sarah Chen', total: 485000 },
      { name: 'Ravi Kumar', total: 372000 },
      { name: 'Priya Sharma', total: 290000 },
      { name: 'Amit Patel', total: 215000 },
      { name: 'Vikram Singh', total: 180000 }
    ],
    executedAt: '2026-02-20T10:30:00Z', executionMs: 45
  },
  {
    id: 'nlq-002', query: 'overdue invoices over 50000', parsedIntent: 'filter',
    parsedEntity: 'invoices', parsedFilters: { status: 'overdue', amountMin: 50000 },
    results: [
      { invoiceNumber: 'INV-2026-008', customer: 'TechServe Solutions', amount: 125000, daysOverdue: 37 },
      { invoiceNumber: 'INV-2026-003', customer: 'CloudNine IT', amount: 250000, daysOverdue: 42 }
    ],
    executedAt: '2026-02-21T14:15:00Z', executionMs: 32
  },
  {
    id: 'nlq-003', query: 'total purchases last month', parsedIntent: 'aggregate',
    parsedEntity: 'purchase_orders', parsedMetric: 'total', parsedPeriod: 'last_month',
    results: [{ label: 'Total Purchases (January 2026)', value: 662890 }],
    executedAt: '2026-02-22T09:00:00Z', executionMs: 28
  }
]

/**
 * Keyword mapping for intent parsing.
 * @type {Object}
 */
const NL_KEYWORDS = {
  entities: {
    'sales': 'opportunities', 'deals': 'opportunities', 'opportunities': 'opportunities', 'revenue': 'opportunities',
    'invoices': 'invoices', 'invoice': 'invoices', 'billing': 'invoices',
    'leads': 'leads', 'lead': 'leads', 'prospects': 'leads',
    'contacts': 'contacts', 'contact': 'contacts', 'customers': 'contacts',
    'products': 'products', 'items': 'products', 'inventory': 'products',
    'orders': 'sales_orders', 'sales orders': 'sales_orders',
    'purchases': 'purchase_orders', 'purchase': 'purchase_orders', 'vendors': 'vendors',
    'expenses': 'expenses', 'expense': 'expenses',
    'employees': 'employees', 'staff': 'employees'
  },
  intents: {
    'top': 'aggregate', 'total': 'aggregate', 'sum': 'aggregate', 'average': 'aggregate', 'count': 'aggregate',
    'how many': 'aggregate', 'how much': 'aggregate',
    'overdue': 'filter', 'pending': 'filter', 'active': 'filter', 'open': 'filter',
    'list': 'list', 'show': 'list', 'find': 'list', 'get': 'list',
    'compare': 'compare', 'trend': 'trend', 'growth': 'trend'
  },
  periods: {
    'today': 0, 'yesterday': 1, 'this week': 7, 'last week': 14,
    'this month': 30, 'last month': 60, 'this quarter': 90, 'last quarter': 180,
    'this year': 365, 'q1': 'Q1', 'q2': 'Q2', 'q3': 'Q3', 'q4': 'Q4'
  }
}

/**
 * Parse a natural language query into a structured query object.
 * Uses keyword matching to determine intent, entity, filters, and aggregations.
 * @param {string} query - Natural language query string
 * @returns {Object} Parsed query with intent, entity, filters, and metadata
 */
export function processNLQuery(query) {
  const q = normalize(query)
  const words = q.split(' ')

  // Detect entity
  let parsedEntity = null
  Object.entries(NL_KEYWORDS.entities).forEach(([keyword, entity]) => {
    if (q.includes(keyword)) parsedEntity = entity
  })

  // Detect intent
  let parsedIntent = 'list'
  Object.entries(NL_KEYWORDS.intents).forEach(([keyword, intent]) => {
    if (q.includes(keyword)) parsedIntent = intent
  })

  // Detect numeric limit (e.g., "top 10")
  let parsedLimit = null
  const limitMatch = q.match(/top\s+(\d+)/)
  if (limitMatch) parsedLimit = parseInt(limitMatch[1])

  // Detect amount filter (e.g., "over $10k", "above 50000")
  let amountMin = null
  const amountMatch = q.match(/(over|above|more than|greater than)\s+\$?(\d+[kmb]?)/i)
  if (amountMatch) {
    let val = amountMatch[2].toLowerCase()
    if (val.endsWith('k')) val = parseFloat(val) * 1000
    else if (val.endsWith('m')) val = parseFloat(val) * 1000000
    else if (val.endsWith('b')) val = parseFloat(val) * 1000000000
    else val = parseFloat(val)
    amountMin = val
  }

  // Detect time period
  let parsedPeriod = null
  Object.entries(NL_KEYWORDS.periods).forEach(([keyword, period]) => {
    if (q.includes(keyword)) parsedPeriod = { keyword, value: period }
  })

  // Detect status filters
  let statusFilter = null
  const statuses = ['overdue', 'pending', 'active', 'paid', 'unpaid', 'open', 'closed', 'won', 'lost', 'new', 'qualified']
  statuses.forEach(status => {
    if (q.includes(status)) statusFilter = status
  })

  // Detect group-by field (e.g., "by rep", "by category", "by month")
  let parsedGroupBy = null
  const groupByMatch = q.match(/by\s+(rep|sales\s*rep|agent|category|month|quarter|vendor|customer|status|type)/)
  if (groupByMatch) {
    const groupMap = {
      'rep': 'assignedTo', 'sales rep': 'assignedTo', 'salesrep': 'assignedTo', 'agent': 'assignedTo',
      'category': 'category', 'month': 'month', 'quarter': 'quarter',
      'vendor': 'vendorId', 'customer': 'customerName', 'status': 'status', 'type': 'type'
    }
    parsedGroupBy = groupMap[groupByMatch[1]] || groupByMatch[1]
  }

  // Detect sort direction
  let parsedSort = 'desc'
  if (q.includes('lowest') || q.includes('least') || q.includes('bottom') || q.includes('ascending')) {
    parsedSort = 'asc'
  }

  // Detect metric
  let parsedMetric = 'count'
  if (q.includes('revenue') || q.includes('total') || q.includes('amount') || q.includes('value') || q.includes('sum')) {
    parsedMetric = 'value'
  }

  const parsed = {
    originalQuery: query,
    parsedIntent,
    parsedEntity: parsedEntity || 'unknown',
    parsedMetric,
    parsedGroupBy,
    parsedSort,
    parsedLimit,
    parsedPeriod,
    parsedFilters: {
      ...(statusFilter ? { status: statusFilter } : {}),
      ...(amountMin ? { amountMin } : {})
    }
  }

  return parsed
}

/**
 * Execute a parsed query against the local data stores and return results.
 * @param {Object} parsedQuery - Output from processNLQuery
 * @returns {Object} Query results with data and metadata
 */
export function executeQuery(parsedQuery) {
  const startTime = Date.now()
  let data = []

  // Load the appropriate dataset
  const entityLoaders = {
    opportunities: getOpportunities,
    invoices: getInvoices,
    leads: getCRMData,
    contacts: getContacts,
    products: getProducts,
    sales_orders: getSalesOrders,
    purchase_orders: getPurchaseOrders,
    vendors: getVendors,
    expenses: getExpenses
  }

  const loader = entityLoaders[parsedQuery.parsedEntity]
  if (!loader) {
    return {
      success: false,
      error: `Unable to identify the data source for "${parsedQuery.parsedEntity}". Try specifying: invoices, leads, contacts, products, sales, purchases, or expenses.`,
      results: [],
      executionMs: Date.now() - startTime
    }
  }

  data = loader() || []

  // Apply status filter
  if (parsedQuery.parsedFilters?.status) {
    const status = parsedQuery.parsedFilters.status
    data = data.filter(item => {
      const itemStatus = (item.status || '').toLowerCase()
      if (status === 'overdue') {
        return item.dueDate && item.dueDate < today() && itemStatus !== 'paid' && itemStatus !== 'cancelled'
      }
      return itemStatus === status
    })
  }

  // Apply amount filter
  if (parsedQuery.parsedFilters?.amountMin) {
    const min = parsedQuery.parsedFilters.amountMin
    data = data.filter(item => (item.value || item.total || item.grandTotal || item.amount || 0) >= min)
  }

  // Apply period filter
  if (parsedQuery.parsedPeriod) {
    const daysBack = typeof parsedQuery.parsedPeriod.value === 'number' ? parsedQuery.parsedPeriod.value : 90
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - daysBack)
    const cutoffStr = cutoff.toISOString().slice(0, 10)
    data = data.filter(item => {
      const date = item.date || item.orderDate || item.createdAt || item.entryDate || ''
      return date >= cutoffStr
    })
  }

  let results = []

  if (parsedQuery.parsedIntent === 'aggregate' && parsedQuery.parsedGroupBy) {
    // Group and aggregate
    const groups = {}
    data.forEach(item => {
      const key = item[parsedQuery.parsedGroupBy] || 'Unknown'
      if (!groups[key]) groups[key] = { name: key, total: 0, count: 0 }
      groups[key].total += item.value || item.total || item.grandTotal || item.amount || 0
      groups[key].count++
    })
    results = Object.values(groups)
    results.sort((a, b) => parsedQuery.parsedSort === 'desc' ? b.total - a.total : a.total - b.total)
    if (parsedQuery.parsedLimit) results = results.slice(0, parsedQuery.parsedLimit)
  } else if (parsedQuery.parsedIntent === 'aggregate') {
    // Simple aggregate
    const total = data.reduce((sum, item) => sum + (item.value || item.total || item.grandTotal || item.amount || 0), 0)
    results = [{ label: `Total ${parsedQuery.parsedEntity}`, value: total, count: data.length }]
  } else {
    // List / filter
    results = data.map(item => ({
      id: item.id,
      name: item.name || item.invoiceNumber || item.orderNumber || item.company || item.contactName || item.id,
      amount: item.value || item.total || item.grandTotal || item.amount || 0,
      status: item.status || 'N/A',
      date: item.date || item.orderDate || item.createdAt || 'N/A'
    }))
    results.sort((a, b) => parsedQuery.parsedSort === 'desc' ? b.amount - a.amount : a.amount - b.amount)
    if (parsedQuery.parsedLimit) results = results.slice(0, parsedQuery.parsedLimit)
  }

  const executionMs = Date.now() - startTime

  // Save to history
  const history = getStore(STORAGE_KEYS.nlQueryHistory, SEED_NL_QUERIES)
  const historyEntry = {
    id: genId('nlq'),
    query: parsedQuery.originalQuery,
    parsedIntent: parsedQuery.parsedIntent,
    parsedEntity: parsedQuery.parsedEntity,
    parsedMetric: parsedQuery.parsedMetric,
    parsedGroupBy: parsedQuery.parsedGroupBy,
    parsedSort: parsedQuery.parsedSort,
    parsedLimit: parsedQuery.parsedLimit,
    parsedFilters: parsedQuery.parsedFilters,
    parsedPeriod: parsedQuery.parsedPeriod,
    results: results.slice(0, 20), // Cap stored results
    executedAt: now(),
    executionMs
  }
  history.push(historyEntry)
  if (history.length > 100) history.splice(0, history.length - 100) // Keep last 100
  setStore(STORAGE_KEYS.nlQueryHistory, history)

  return {
    success: true,
    query: parsedQuery.originalQuery,
    intent: parsedQuery.parsedIntent,
    entity: parsedQuery.parsedEntity,
    resultCount: results.length,
    results,
    executionMs
  }
}

/**
 * Get the history of past natural language queries with their results.
 * @param {number} [limit=20] - Maximum entries to return
 * @returns {Array<Object>}
 */
export function getQueryHistory(limit = 20) {
  const history = getStore(STORAGE_KEYS.nlQueryHistory, SEED_NL_QUERIES)
  return history.slice(-limit).reverse()
}

/**
 * Convenience function: parse + execute a natural language query in one call.
 * @param {string} query - Natural language query string
 * @returns {Object} Query results
 */
export function askMyDB(query) {
  const parsed = processNLQuery(query)
  return executeQuery(parsed)
}

// ========================================================================================
// SEED DATA INITIALIZATION
// ========================================================================================

/**
 * Initialize all AI Engine seed data. Call once on app startup.
 * Only seeds data that does not already exist in localStorage.
 */
export function initializeAIEngine() {
  getStore(STORAGE_KEYS.deduplicationQueue, SEED_DEDUP_QUEUE)
  getStore(STORAGE_KEYS.procurementForecasts, SEED_PROCUREMENT_FORECASTS)
  getStore(STORAGE_KEYS.pricingRules, SEED_PRICING)
  getStore(STORAGE_KEYS.ocrResults, SEED_OCR_RESULTS)
  getStore(STORAGE_KEYS.dunningSchedules, SEED_DUNNING)
  getStore(STORAGE_KEYS.aiSummaries, SEED_AI_SUMMARIES)
  getStore(STORAGE_KEYS.anomalyAlerts, SEED_ANOMALY_ALERTS)
  getStore(STORAGE_KEYS.routeOptimizations, SEED_ROUTES)
  getStore(STORAGE_KEYS.bankReconciliation, SEED_BANK_RECON)
  getStore(STORAGE_KEYS.leaveForecasts, SEED_LEAVE_FORECASTS)
  getStore(STORAGE_KEYS.maintenanceOrders, SEED_MAINTENANCE)
  getStore(STORAGE_KEYS.nlQueryHistory, SEED_NL_QUERIES)
}

// ========================================================================================
// DEFAULT EXPORT
// ========================================================================================

export default {
  // E1 - Deduplication
  scanForDuplicates,
  mergeRecords,
  getDuplicateQueue,
  dismissDuplicate,
  // E2 - Predictive Procurement
  getSalesVelocity,
  calculateReorderDate,
  generateProcurementForecast,
  getProcurementForecasts,
  // E3 - Dynamic Pricing
  recalculatePricing,
  getPricingHistory,
  setBulkPricing,
  getPricingRules,
  // E4 - OCR Processing
  processReceipt,
  getOCRResults,
  correctOCRResult,
  // E5 - Dunning Automation
  getDunningSchedule,
  processDunning,
  createDunningRule,
  getDunningSchedules,
  getDunningRules,
  // E6 - LLM Summarization
  summarizeInteractions,
  generateEmailDraft,
  getAISuggestions,
  getAISummaries,
  // E7 - Anomaly Detection
  scanForAnomalies,
  getAnomalyAlerts,
  resolveAnomaly,
  // E8 - Route Optimization
  optimizeRoute,
  getRouteForAgent,
  saveRoute,
  getRoutes,
  completeStop,
  // E9 - Bank Reconciliation
  importBankStatement,
  autoMatchTransactions,
  getUnmatchedEntries,
  confirmMatch,
  getBankReconciliation,
  // E10 - Leave Forecasting
  forecastLeaveBalance,
  getLeaveProjection,
  getLeaveForecasts,
  // E11 - Predictive Maintenance
  checkMaintenanceThresholds,
  scheduleMaintenanceOrder,
  getMachineHealth,
  getMaintenanceOrders,
  // E12 - Natural Language Query
  processNLQuery,
  executeQuery,
  getQueryHistory,
  askMyDB,
  // Initialization
  initializeAIEngine
}
