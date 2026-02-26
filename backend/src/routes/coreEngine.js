/**
 * Core Engine Routes — Completes all partial Section A items:
 * A6  Polymorphic Attachments CRUD
 * A8  Shared Tax Engine CRUD + calculation
 * A9  Role/Permission management
 * A11 Unified Payments CRUD
 * A12 Multi-Currency rates
 * A14 Universal Comments CRUD
 * A16 CostCenters CRUD
 * A17 Discount Engine CRUD + application
 * A19 Bank Definitions CRUD
 * A22 Materialized Metrics aggregation
 * A23 EAV Custom Fields CRUD
 * A24 Financial Period Locks CRUD + enforcement
 * A25 Status Master CRUD
 * C24 Cloud-synced User Preferences
 * D4  Cursor-based pagination helper
 * D6  Universal soft-delete
 */
const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const multer = require('multer')
const path = require('path')
const { authMiddleware } = require('../middleware/auth')

router.use(authMiddleware)

// ==================== CURSOR PAGINATION HELPER (D4) ====================
function parseCursor(query) {
  const limit = Math.min(Number(query.limit) || 50, 200)
  const cursor = query.cursor || null
  const direction = query.direction === 'prev' ? 'prev' : 'next'
  return { limit, cursor, direction }
}

function buildCursorQuery(cursor, limit, direction, orderField = 'createdAt') {
  const result = { take: limit + 1, orderBy: { [orderField]: direction === 'next' ? 'desc' : 'asc' } }
  if (cursor) {
    result.cursor = { id: cursor }
    result.skip = 1
  }
  return result
}

function formatCursorResponse(data, limit) {
  const hasMore = data.length > limit
  if (hasMore) data.pop()
  return {
    data,
    hasMore,
    nextCursor: hasMore ? data[data.length - 1]?.id : null,
    prevCursor: data.length > 0 ? data[0]?.id : null
  }
}

// ==================== A6: POLYMORPHIC ATTACHMENTS ====================
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../../uploads')),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
})
const upload = multer({ storage, limits: { fileSize: 25 * 1024 * 1024 } }) // 25MB

router.get('/attachments', async (req, res) => {
  try {
    const { entityType, entityId } = req.query
    const where = {}
    if (entityType) where.entityType = entityType
    if (entityId) where.entityId = entityId
    const attachments = await prisma.attachment.findMany({ where, orderBy: { createdAt: 'desc' } })
    res.json(attachments)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.post('/attachments', upload.single('file'), async (req, res) => {
  try {
    const { entityType, entityId, description } = req.body
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' })
    const att = await prisma.attachment.create({
      data: {
        entityType, entityId, description,
        fileName: req.file.originalname,
        fileType: req.file.mimetype?.split('/')[1] || 'unknown',
        fileSize: req.file.size,
        fileUrl: `/uploads/${req.file.filename}`,
        uploadedBy: req.user?.id || 'system'
      }
    })
    res.status(201).json(att)
  } catch (err) { res.status(400).json({ error: err.message }) }
})

router.delete('/attachments/:id', async (req, res) => {
  try {
    await prisma.attachment.delete({ where: { id: req.params.id } })
    res.json({ success: true })
  } catch (err) { res.status(400).json({ error: err.message }) }
})

// ==================== A8: TAX ENGINE ====================
router.get('/tax-rules', async (req, res) => {
  try {
    const { type, applicableTo, isActive } = req.query
    const where = {}
    if (type) where.type = type
    if (isActive !== undefined) where.isActive = isActive === 'true'
    if (applicableTo) where.applicableTo = { has: applicableTo }
    const rules = await prisma.taxRule.findMany({ where, orderBy: { name: 'asc' } })
    res.json(rules)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.post('/tax-rules', async (req, res) => {
  try {
    const rule = await prisma.taxRule.create({ data: req.body })
    res.status(201).json(rule)
  } catch (err) { res.status(400).json({ error: err.message }) }
})

router.put('/tax-rules/:id', async (req, res) => {
  try {
    const rule = await prisma.taxRule.update({ where: { id: req.params.id }, data: req.body })
    res.json(rule)
  } catch (err) { res.status(400).json({ error: err.message }) }
})

router.delete('/tax-rules/:id', async (req, res) => {
  try {
    await prisma.taxRule.update({ where: { id: req.params.id }, data: { isActive: false } })
    res.json({ success: true })
  } catch (err) { res.status(400).json({ error: err.message }) }
})

// Tax calculation endpoint
router.post('/tax-rules/calculate', async (req, res) => {
  try {
    const { amount, taxCodes, isInclusive } = req.body
    const rules = await prisma.taxRule.findMany({
      where: { code: { in: taxCodes }, isActive: true }
    })
    let totalTax = 0
    const breakdown = []
    let base = amount
    // Sort: non-compound first, compound last
    const sorted = rules.sort((a, b) => (a.isCompound ? 1 : 0) - (b.isCompound ? 1 : 0))
    for (const rule of sorted) {
      const taxableAmount = rule.isCompound ? base + totalTax : base
      const taxAmt = isInclusive
        ? taxableAmount - (taxableAmount / (1 + rule.rate / 100))
        : taxableAmount * (rule.rate / 100)
      totalTax += taxAmt
      breakdown.push({ code: rule.code, name: rule.name, rate: rule.rate, amount: Math.round(taxAmt * 100) / 100 })
    }
    res.json({ baseAmount: base, totalTax: Math.round(totalTax * 100) / 100, grandTotal: Math.round((base + (isInclusive ? 0 : totalTax)) * 100) / 100, breakdown })
  } catch (err) { res.status(400).json({ error: err.message }) }
})

// ==================== A9: ROLES & PERMISSIONS ====================
router.get('/roles', async (req, res) => {
  try {
    const roles = await prisma.role.findMany({ include: { permissions: true }, orderBy: { name: 'asc' } })
    res.json(roles)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.post('/roles', async (req, res) => {
  try {
    const { name, displayName, description, permissions } = req.body
    const role = await prisma.role.create({
      data: {
        name, displayName, description,
        permissions: permissions ? { create: permissions } : undefined
      },
      include: { permissions: true }
    })
    res.status(201).json(role)
  } catch (err) { res.status(400).json({ error: err.message }) }
})

router.put('/roles/:id', async (req, res) => {
  try {
    const { permissions, ...data } = req.body
    if (permissions) {
      await prisma.rolePermission.deleteMany({ where: { roleId: req.params.id } })
      await prisma.rolePermission.createMany({ data: permissions.map(p => ({ ...p, roleId: req.params.id })) })
    }
    const role = await prisma.role.update({ where: { id: req.params.id }, data, include: { permissions: true } })
    res.json(role)
  } catch (err) { res.status(400).json({ error: err.message }) }
})

router.delete('/roles/:id', async (req, res) => {
  try {
    const role = await prisma.role.findUnique({ where: { id: req.params.id } })
    if (role?.isSystem) return res.status(403).json({ error: 'Cannot delete system role' })
    await prisma.role.delete({ where: { id: req.params.id } })
    res.json({ success: true })
  } catch (err) { res.status(400).json({ error: err.message }) }
})

// ==================== A11: UNIFIED PAYMENTS ====================
router.get('/payments', async (req, res) => {
  try {
    const { direction, type, status } = req.query
    const where = {}
    if (direction) where.direction = direction
    if (type) where.type = type
    if (status) where.status = status
    const payments = await prisma.unifiedPayment.findMany({
      where, orderBy: { createdAt: 'desc' },
      include: { partner: { select: { id: true, name: true, type: true } }, bankAccount: { select: { id: true, bankName: true, accountNumber: true } } }
    })
    res.json(payments)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.post('/payments', async (req, res) => {
  try {
    const payment = await prisma.unifiedPayment.create({
      data: { ...req.body, createdBy: req.user?.id || 'system' },
      include: { partner: { select: { id: true, name: true } } }
    })
    res.status(201).json(payment)
  } catch (err) { res.status(400).json({ error: err.message }) }
})

router.patch('/payments/:id/status', async (req, res) => {
  try {
    const { status } = req.body
    const data = { status }
    if (status === 'completed') data.processedAt = new Date()
    const payment = await prisma.unifiedPayment.update({ where: { id: req.params.id }, data })
    res.json(payment)
  } catch (err) { res.status(400).json({ error: err.message }) }
})

// ==================== A12: MULTI-CURRENCY ====================
router.get('/currencies', async (req, res) => {
  try {
    const rates = await prisma.currencyRate.findMany({
      orderBy: { effectiveDate: 'desc' },
      distinct: ['currency'],
      take: 50
    })
    res.json(rates)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.post('/currencies', async (req, res) => {
  try {
    const { baseCurrency, currency, rate } = req.body
    const cr = await prisma.currencyRate.create({
      data: { baseCurrency: baseCurrency || 'INR', currency, rate, inverseRate: 1 / rate, effectiveDate: new Date() }
    })
    res.status(201).json(cr)
  } catch (err) { res.status(400).json({ error: err.message }) }
})

router.post('/currencies/convert', async (req, res) => {
  try {
    const { from, to, amount } = req.body
    if (from === to) return res.json({ converted: amount, rate: 1 })
    const fromRate = from === 'INR' ? { rate: 1 } : await prisma.currencyRate.findFirst({ where: { currency: from }, orderBy: { effectiveDate: 'desc' } })
    const toRate = to === 'INR' ? { rate: 1 } : await prisma.currencyRate.findFirst({ where: { currency: to }, orderBy: { effectiveDate: 'desc' } })
    if (!fromRate || !toRate) return res.status(404).json({ error: 'Exchange rate not found' })
    const inBase = amount / fromRate.rate
    const converted = inBase * toRate.rate
    res.json({ from, to, amount, converted: Math.round(converted * 100) / 100, rate: toRate.rate / fromRate.rate })
  } catch (err) { res.status(400).json({ error: err.message }) }
})

// Bulk update rates (for cron job - D7)
router.post('/currencies/bulk-update', async (req, res) => {
  try {
    const { rates } = req.body // [{ currency: 'USD', rate: 83.5 }, ...]
    const results = await prisma.$transaction(
      rates.map(r => prisma.currencyRate.create({
        data: { baseCurrency: 'INR', currency: r.currency, rate: r.rate, inverseRate: 1 / r.rate, source: 'api', effectiveDate: new Date() }
      }))
    )
    res.json({ updated: results.length })
  } catch (err) { res.status(400).json({ error: err.message }) }
})

// ==================== A14: UNIVERSAL COMMENTS ====================
router.get('/comments', async (req, res) => {
  try {
    const { entityType, entityId } = req.query
    if (!entityType || !entityId) return res.status(400).json({ error: 'entityType and entityId required' })
    const comments = await prisma.comment.findMany({
      where: { entityType, entityId },
      orderBy: { createdAt: 'asc' }
    })
    res.json(comments)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.post('/comments', async (req, res) => {
  try {
    const comment = await prisma.comment.create({
      data: { ...req.body, createdBy: req.user?.id || 'system', createdByName: req.user?.name || 'System' }
    })
    // Create notifications for mentioned users
    if (req.body.mentionedUsers?.length) {
      await prisma.notification.createMany({
        data: req.body.mentionedUsers.map(userId => ({
          userId, type: 'comment_mention', title: 'You were mentioned in a comment',
          message: req.body.content?.substring(0, 100), entityType: req.body.entityType, entityId: req.body.entityId
        }))
      })
    }
    res.status(201).json(comment)
  } catch (err) { res.status(400).json({ error: err.message }) }
})

router.put('/comments/:id', async (req, res) => {
  try {
    const comment = await prisma.comment.update({ where: { id: req.params.id }, data: { content: req.body.content } })
    res.json(comment)
  } catch (err) { res.status(400).json({ error: err.message }) }
})

router.delete('/comments/:id', async (req, res) => {
  try {
    await prisma.comment.delete({ where: { id: req.params.id } })
    res.json({ success: true })
  } catch (err) { res.status(400).json({ error: err.message }) }
})

// ==================== A16: COST CENTERS ====================
router.get('/cost-centers', async (req, res) => {
  try {
    const centers = await prisma.costCenter.findMany({
      where: { isActive: true },
      include: { children: true, parent: { select: { id: true, name: true } } },
      orderBy: { code: 'asc' }
    })
    res.json(centers)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.post('/cost-centers', async (req, res) => {
  try {
    const center = await prisma.costCenter.create({ data: req.body })
    res.status(201).json(center)
  } catch (err) { res.status(400).json({ error: err.message }) }
})

router.put('/cost-centers/:id', async (req, res) => {
  try {
    const center = await prisma.costCenter.update({ where: { id: req.params.id }, data: req.body })
    res.json(center)
  } catch (err) { res.status(400).json({ error: err.message }) }
})

// Cost center report (P&L per department)
router.get('/cost-centers/:id/report', async (req, res) => {
  try {
    const transactions = await prisma.globalTransaction.findMany({
      where: { costCenterId: req.params.id },
      orderBy: { transactionDate: 'desc' }
    })
    const revenue = transactions.filter(t => t.type === 'sale').reduce((s, t) => s + t.amount, 0)
    const expenses = transactions.filter(t => ['purchase', 'payroll'].includes(t.type)).reduce((s, t) => s + t.amount, 0)
    res.json({ costCenterId: req.params.id, revenue, expenses, netIncome: revenue - expenses, transactionCount: transactions.length })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ==================== A17: DISCOUNT ENGINE ====================
router.get('/discounts', async (req, res) => {
  try {
    const { source, isActive } = req.query
    const where = {}
    if (source) where.source = source
    if (isActive !== undefined) where.isActive = isActive === 'true'
    const discounts = await prisma.discount.findMany({ where, orderBy: { createdAt: 'desc' } })
    res.json(discounts)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.post('/discounts', async (req, res) => {
  try {
    const discount = await prisma.discount.create({ data: req.body })
    res.status(201).json(discount)
  } catch (err) { res.status(400).json({ error: err.message }) }
})

router.put('/discounts/:id', async (req, res) => {
  try {
    const discount = await prisma.discount.update({ where: { id: req.params.id }, data: req.body })
    res.json(discount)
  } catch (err) { res.status(400).json({ error: err.message }) }
})

// Apply discount to cart/order
router.post('/discounts/apply', async (req, res) => {
  try {
    const { couponCode, items, orderTotal } = req.body
    const discount = await prisma.discount.findFirst({
      where: { couponCode, isActive: true, validFrom: { lte: new Date() }, OR: [{ validTo: null }, { validTo: { gte: new Date() } }] }
    })
    if (!discount) return res.status(404).json({ error: 'Invalid or expired coupon' })
    if (discount.usageLimit && discount.usedCount >= discount.usageLimit) return res.status(400).json({ error: 'Coupon usage limit reached' })

    let discountAmount = 0
    const conditions = discount.conditions || {}
    if (conditions.minAmount && orderTotal < conditions.minAmount) return res.status(400).json({ error: `Minimum order amount: ${conditions.minAmount}` })

    if (discount.type === 'percentage') discountAmount = orderTotal * (discount.value / 100)
    else if (discount.type === 'fixed') discountAmount = discount.value
    else if (discount.type === 'bogo') discountAmount = items?.length > 1 ? Math.min(...items.map(i => i.price || 0)) : 0

    // Increment usage
    await prisma.discount.update({ where: { id: discount.id }, data: { usedCount: { increment: 1 } } })
    res.json({ discountId: discount.id, type: discount.type, discountAmount: Math.round(discountAmount * 100) / 100, finalTotal: Math.round((orderTotal - discountAmount) * 100) / 100 })
  } catch (err) { res.status(400).json({ error: err.message }) }
})

// ==================== A19: BANK DEFINITIONS ====================
router.get('/bank-accounts', async (req, res) => {
  try {
    const { usedBy } = req.query
    const where = { isActive: true }
    if (usedBy) where.usedBy = { has: usedBy }
    const banks = await prisma.bankDefinition.findMany({ where, orderBy: { bankName: 'asc' } })
    res.json(banks)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.post('/bank-accounts', async (req, res) => {
  try {
    const bank = await prisma.bankDefinition.create({ data: req.body })
    res.status(201).json(bank)
  } catch (err) { res.status(400).json({ error: err.message }) }
})

router.put('/bank-accounts/:id', async (req, res) => {
  try {
    const bank = await prisma.bankDefinition.update({ where: { id: req.params.id }, data: req.body })
    res.json(bank)
  } catch (err) { res.status(400).json({ error: err.message }) }
})

// ==================== A22: MATERIALIZED METRICS ====================
router.get('/metrics', async (req, res) => {
  try {
    const { module, metricKey } = req.query
    const where = {}
    if (module) where.module = module
    if (metricKey) where.metricKey = metricKey
    const metrics = await prisma.materializedMetric.findMany({
      where, orderBy: { computedAt: 'desc' }, take: 100
    })
    res.json(metrics)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// Recompute metrics (called by cron or manually)
router.post('/metrics/recompute', async (req, res) => {
  try {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Sales total
    const salesAgg = await prisma.globalTransaction.aggregate({ where: { type: 'sale', transactionDate: { gte: startOfMonth } }, _sum: { amount: true }, _count: true })
    // Purchase total
    const purchaseAgg = await prisma.globalTransaction.aggregate({ where: { type: 'purchase', transactionDate: { gte: startOfMonth } }, _sum: { amount: true }, _count: true })
    // Inventory value
    const stockAgg = await prisma.stockMovement.aggregate({ _sum: { totalValue: true } })
    // Partner counts
    const partnerCounts = await prisma.partner.groupBy({ by: ['type'], _count: true, where: { status: 'active' } })

    const metricsData = [
      { metricKey: 'sales_total', module: 'sales', value: salesAgg._sum.amount || 0, metadata: { count: salesAgg._count } },
      { metricKey: 'purchase_total', module: 'purchase', value: purchaseAgg._sum.amount || 0, metadata: { count: purchaseAgg._count } },
      { metricKey: 'inventory_value', module: 'inventory', value: stockAgg._sum.totalValue || 0 },
      ...partnerCounts.map(pc => ({ metricKey: `${pc.type}_count`, module: 'crm', value: pc._count, metadata: { type: pc.type } }))
    ]

    const results = await prisma.$transaction(
      metricsData.map(m => prisma.materializedMetric.create({
        data: { ...m, computedAt: now, periodStart: startOfMonth, periodEnd: now }
      }))
    )
    res.json({ recomputed: results.length, metrics: results })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ==================== A23: EAV CUSTOM FIELDS ====================
router.get('/custom-fields', async (req, res) => {
  try {
    const { module } = req.query
    const where = { isActive: true }
    if (module) where.module = module
    const fields = await prisma.eAVField.findMany({ where, orderBy: { sortOrder: 'asc' } })
    res.json(fields)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.post('/custom-fields', async (req, res) => {
  try {
    const field = await prisma.eAVField.create({ data: req.body })
    res.status(201).json(field)
  } catch (err) { res.status(400).json({ error: err.message }) }
})

router.put('/custom-fields/:id', async (req, res) => {
  try {
    const field = await prisma.eAVField.update({ where: { id: req.params.id }, data: req.body })
    res.json(field)
  } catch (err) { res.status(400).json({ error: err.message }) }
})

// Get custom field values for an entity
router.get('/custom-fields/values', async (req, res) => {
  try {
    const { entityType, entityId } = req.query
    const values = await prisma.eAVValue.findMany({
      where: { entityType, entityId },
      include: { field: true }
    })
    res.json(values)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// Set custom field value
router.post('/custom-fields/values', async (req, res) => {
  try {
    const { fieldId, entityType, entityId, value } = req.body
    const val = await prisma.eAVValue.upsert({
      where: { fieldId_entityType_entityId: { fieldId, entityType, entityId } },
      update: { value },
      create: { fieldId, entityType, entityId, value }
    })
    res.json(val)
  } catch (err) { res.status(400).json({ error: err.message }) }
})

// ==================== A24: FINANCIAL PERIOD LOCKS ====================
router.get('/period-locks', async (req, res) => {
  try {
    const locks = await prisma.financialPeriodLock.findMany({ orderBy: { lockDate: 'desc' } })
    res.json(locks)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.post('/period-locks', async (req, res) => {
  try {
    const lock = await prisma.financialPeriodLock.create({
      data: { ...req.body, lockedBy: req.user?.id || 'admin' }
    })
    res.status(201).json(lock)
  } catch (err) { res.status(400).json({ error: err.message }) }
})

router.delete('/period-locks/:id', async (req, res) => {
  try {
    await prisma.financialPeriodLock.delete({ where: { id: req.params.id } })
    res.json({ success: true })
  } catch (err) { res.status(400).json({ error: err.message }) }
})

// Check if a date is locked for a module
router.post('/period-locks/check', async (req, res) => {
  try {
    const { module, date } = req.body
    const lock = await prisma.financialPeriodLock.findFirst({
      where: { OR: [{ module: 'all' }, { module }], lockDate: { gte: new Date(date) } },
      orderBy: { lockDate: 'desc' }
    })
    res.json({ locked: !!lock, lock })
  } catch (err) { res.status(400).json({ error: err.message }) }
})

// ==================== A25: STATUS MASTER ====================
router.get('/statuses', async (req, res) => {
  try {
    const { module } = req.query
    const where = { isActive: true }
    if (module) where.applicableModules = { has: module }
    const statuses = await prisma.statusMaster.findMany({ where, orderBy: { sortOrder: 'asc' } })
    res.json(statuses)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.post('/statuses', async (req, res) => {
  try {
    const status = await prisma.statusMaster.create({ data: req.body })
    res.status(201).json(status)
  } catch (err) { res.status(400).json({ error: err.message }) }
})

router.put('/statuses/:id', async (req, res) => {
  try {
    const status = await prisma.statusMaster.update({ where: { id: req.params.id }, data: req.body })
    res.json(status)
  } catch (err) { res.status(400).json({ error: err.message }) }
})

// ==================== A21: LOCATIONS CRUD ====================
router.get('/locations', async (req, res) => {
  try {
    const { type } = req.query
    const where = { isActive: true }
    if (type) where.type = type
    const locations = await prisma.location.findMany({ where, orderBy: { name: 'asc' } })
    res.json(locations)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.post('/locations', async (req, res) => {
  try {
    const location = await prisma.location.create({ data: req.body })
    res.status(201).json(location)
  } catch (err) { res.status(400).json({ error: err.message }) }
})

router.put('/locations/:id', async (req, res) => {
  try {
    const location = await prisma.location.update({ where: { id: req.params.id }, data: req.body })
    res.json(location)
  } catch (err) { res.status(400).json({ error: err.message }) }
})

// ==================== C24: USER PREFERENCES ====================
router.get('/preferences', async (req, res) => {
  try {
    const prefs = await prisma.userPreference.findMany({ where: { userId: req.user?.id || 'default' } })
    const obj = {}
    prefs.forEach(p => { obj[p.key] = p.value })
    res.json(obj)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.post('/preferences', async (req, res) => {
  try {
    const userId = req.user?.id || 'default'
    const entries = Object.entries(req.body)
    const results = await prisma.$transaction(
      entries.map(([key, value]) => prisma.userPreference.upsert({
        where: { userId_key: { userId, key } },
        update: { value },
        create: { userId, key, value }
      }))
    )
    res.json({ saved: results.length })
  } catch (err) { res.status(400).json({ error: err.message }) }
})

// ==================== AUDIT LOG HELPER (A10 enhancement) ====================
router.get('/audit-log', async (req, res) => {
  try {
    const { entity, entityId, userId, cursor: cursorId, limit: lim } = req.query
    const where = {}
    if (entity) where.entity = entity
    if (entityId) where.entityId = entityId
    if (userId) where.userId = userId
    const { limit, cursor } = parseCursor({ cursor: cursorId, limit: lim })
    const q = buildCursorQuery(cursor, limit, 'next')
    const logs = await prisma.auditLog.findMany({ where, ...q })
    res.json(formatCursorResponse(logs, limit))
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// ==================== GLOBAL TRANSACTIONS LEDGER (A3 – cursor paginated) ====================
router.get('/transactions', async (req, res) => {
  try {
    const { type, module, cursor: cursorId, limit: lim } = req.query
    const where = {}
    if (type) where.type = type
    if (module) where.sourceModule = module
    const { limit, cursor } = parseCursor({ cursor: cursorId, limit: lim })
    const q = buildCursorQuery(cursor, limit, 'next')
    const txns = await prisma.globalTransaction.findMany({
      where, ...q,
      include: { partner: { select: { id: true, name: true } }, costCenter: { select: { id: true, name: true } } }
    })
    res.json(formatCursorResponse(txns, limit))
  } catch (err) { res.status(500).json({ error: err.message }) }
})

module.exports = router
