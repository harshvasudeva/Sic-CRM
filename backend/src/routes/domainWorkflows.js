/**
 * Domain-Specific Workflow Routes
 * B9:  Vendor Portal (self-service RFQ, PO ack, invoice submission)
 * B12: CRM → HR Recruitment Mirror (pipeline → hiring stages sync)
 * B17: HR Timeclock → POS Interlock (clock-in required for POS)
 * B19: Product Matrix Engine (variant axes, SKU generation)
 */
const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { authMiddleware } = require('../middleware/auth')

router.use(authMiddleware)

// =====================================================
// B9: Vendor Portal
// =====================================================

/**
 * GET /vendor-portal/rfqs - List RFQs available for the vendor
 */
router.get('/vendor-portal/rfqs', async (req, res) => {
  try {
    const vendorId = req.query.vendorId || req.user?.partnerId
    if (!vendorId) return res.status(400).json({ error: 'vendorId required' })

    // RFQs are stored as quotations with type 'purchase' directed to this vendor
    const rfqs = await prisma.globalTransaction.findMany({
      where: {
        partnerId: vendorId,
        type: 'purchase_order',
        status: { in: ['draft', 'sent', 'pending'] },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    res.json(rfqs)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/**
 * POST /vendor-portal/rfq-response - Vendor responds to an RFQ
 */
router.post('/vendor-portal/rfq-response', async (req, res) => {
  try {
    const { rfqId, proposedPrice, deliveryDays, notes, accepted } = req.body
    if (!rfqId) return res.status(400).json({ error: 'rfqId required' })

    const rfq = await prisma.globalTransaction.findUnique({ where: { id: rfqId } })
    if (!rfq) return res.status(404).json({ error: 'RFQ not found' })

    const response = await prisma.unifiedActivity.create({
      data: {
        entityType: 'vendor_rfq_response',
        entityId: rfqId,
        action: accepted ? 'rfq_accepted' : 'rfq_declined',
        details: { proposedPrice, deliveryDays, notes, accepted },
        userId: req.user?.id,
      },
    })

    // Update RFQ status
    await prisma.globalTransaction.update({
      where: { id: rfqId },
      data: { status: accepted ? 'vendor_accepted' : 'vendor_declined' },
    })

    res.json({ message: `RFQ ${accepted ? 'accepted' : 'declined'}`, response })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/**
 * POST /vendor-portal/acknowledge-po - Vendor acknowledges a PO
 */
router.post('/vendor-portal/acknowledge-po', async (req, res) => {
  try {
    const { poId, expectedDeliveryDate, notes } = req.body
    if (!poId) return res.status(400).json({ error: 'poId required' })

    const po = await prisma.globalTransaction.findUnique({ where: { id: poId } })
    if (!po) return res.status(404).json({ error: 'PO not found' })

    await prisma.globalTransaction.update({
      where: { id: poId },
      data: {
        status: 'acknowledged',
        metadata: {
          ...(typeof po.metadata === 'object' ? po.metadata : {}),
          vendorAck: { date: new Date(), expectedDeliveryDate, notes },
        },
      },
    })

    await prisma.unifiedActivity.create({
      data: {
        entityType: 'purchase_order',
        entityId: poId,
        action: 'po_acknowledged',
        details: { expectedDeliveryDate, notes },
        userId: req.user?.id,
      },
    })

    res.json({ message: 'PO acknowledged', expectedDeliveryDate })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/**
 * POST /vendor-portal/submit-invoice - Vendor submits invoice against PO
 */
router.post('/vendor-portal/submit-invoice', async (req, res) => {
  try {
    const { poId, invoiceNumber, amount, lineItems, attachmentUrls } = req.body
    if (!poId || !invoiceNumber) return res.status(400).json({ error: 'poId and invoiceNumber required' })

    const vendorInvoice = await prisma.globalTransaction.create({
      data: {
        type: 'vendor_invoice',
        status: 'pending_review',
        amount: amount || 0,
        partnerId: req.user?.partnerId || req.body.vendorId,
        metadata: { poId, invoiceNumber, lineItems, attachmentUrls, submittedBy: req.user?.id },
      },
    })

    // Link to PO
    await prisma.unifiedActivity.create({
      data: {
        entityType: 'vendor_invoice',
        entityId: vendorInvoice.id,
        action: 'invoice_submitted',
        details: { poId, invoiceNumber, amount },
        userId: req.user?.id,
      },
    })

    res.status(201).json({ message: 'Invoice submitted for review', invoice: vendorInvoice })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/**
 * GET /vendor-portal/documents - List documents exchanged with vendor
 */
router.get('/vendor-portal/documents', async (req, res) => {
  try {
    const vendorId = req.query.vendorId || req.user?.partnerId
    if (!vendorId) return res.status(400).json({ error: 'vendorId required' })

    const docs = await prisma.attachment.findMany({
      where: { entityType: { in: ['vendor', 'purchase_order', 'vendor_invoice'] }, entityId: vendorId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })
    res.json(docs)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// =====================================================
// B12: CRM → HR Recruitment Mirror
// =====================================================

// In-memory pipeline stage mapping (could be a DB table)
const PIPELINE_TO_RECRUITMENT = {
  lead: 'sourced',
  qualified: 'screened',
  proposal: 'interviewed',
  negotiation: 'offer_extended',
  closed_won: 'hired',
  closed_lost: 'rejected',
}

/**
 * POST /recruitment/mirror - Mirror a CRM deal stage to HR recruitment
 */
router.post('/recruitment/mirror', async (req, res) => {
  try {
    const { dealId, partnerId, candidateName, email, currentStage, position } = req.body
    if (!dealId || !currentStage) return res.status(400).json({ error: 'dealId and currentStage required' })

    const recruitmentStage = PIPELINE_TO_RECRUITMENT[currentStage] || currentStage

    // Create/update HR activity for this candidate
    const existing = await prisma.unifiedActivity.findFirst({
      where: { entityType: 'recruitment', entityId: dealId },
      orderBy: { createdAt: 'desc' },
    })

    if (existing) {
      await prisma.unifiedActivity.update({
        where: { id: existing.id },
        data: {
          details: {
            ...((typeof existing.details === 'object' ? existing.details : {}) || {}),
            recruitmentStage,
            crmStage: currentStage,
            candidateName,
            position,
            lastSynced: new Date(),
          },
        },
      })
    } else {
      await prisma.unifiedActivity.create({
        data: {
          entityType: 'recruitment',
          entityId: dealId,
          action: 'recruitment_created',
          details: {
            candidateName,
            email,
            position,
            recruitmentStage,
            crmStage: currentStage,
            mirroredFrom: 'crm_deal',
          },
          userId: req.user?.id,
        },
      })
    }

    res.json({
      message: 'CRM deal mirrored to recruitment',
      crmStage: currentStage,
      recruitmentStage,
      mapping: PIPELINE_TO_RECRUITMENT,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/**
 * GET /recruitment/pipeline - Get recruitment pipeline (mirrored from CRM)
 */
router.get('/recruitment/pipeline', async (req, res) => {
  try {
    const activities = await prisma.unifiedActivity.findMany({
      where: { entityType: 'recruitment' },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    // Group by stage
    const pipeline = {}
    Object.values(PIPELINE_TO_RECRUITMENT).forEach(s => { pipeline[s] = [] })
    activities.forEach(a => {
      const details = typeof a.details === 'object' ? a.details : {}
      const stage = details.recruitmentStage || 'sourced'
      if (!pipeline[stage]) pipeline[stage] = []
      pipeline[stage].push({
        id: a.id,
        entityId: a.entityId,
        candidateName: details.candidateName,
        position: details.position,
        crmStage: details.crmStage,
        lastSynced: details.lastSynced || a.updatedAt,
      })
    })

    res.json({ pipeline, stageMapping: PIPELINE_TO_RECRUITMENT })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// =====================================================
// B17: HR Timeclock → POS Interlock
// =====================================================

// In-memory timeclock store (production: use Redis or DB table)
const timeclockStore = new Map()

/**
 * POST /timeclock/clock-in - Employee clocks in
 */
router.post('/timeclock/clock-in', async (req, res) => {
  try {
    const { employeeId, locationId } = req.body
    const userId = employeeId || req.user?.id
    if (!userId) return res.status(400).json({ error: 'employeeId required' })

    if (timeclockStore.has(userId)) {
      return res.status(409).json({ error: 'Already clocked in', clockedInAt: timeclockStore.get(userId).clockedInAt })
    }

    const entry = {
      employeeId: userId,
      locationId,
      clockedInAt: new Date(),
      status: 'active',
    }
    timeclockStore.set(userId, entry)

    // Log activity
    await prisma.unifiedActivity.create({
      data: {
        entityType: 'timeclock',
        entityId: userId,
        action: 'clock_in',
        details: { locationId, timestamp: entry.clockedInAt },
        userId: req.user?.id,
      },
    })

    res.json({ message: 'Clocked in', ...entry })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/**
 * POST /timeclock/clock-out - Employee clocks out
 */
router.post('/timeclock/clock-out', async (req, res) => {
  try {
    const { employeeId } = req.body
    const userId = employeeId || req.user?.id
    if (!userId) return res.status(400).json({ error: 'employeeId required' })

    const entry = timeclockStore.get(userId)
    if (!entry) return res.status(404).json({ error: 'Not clocked in' })

    const duration = Date.now() - new Date(entry.clockedInAt).getTime()
    timeclockStore.delete(userId)

    await prisma.unifiedActivity.create({
      data: {
        entityType: 'timeclock',
        entityId: userId,
        action: 'clock_out',
        details: { locationId: entry.locationId, clockedInAt: entry.clockedInAt, clockedOutAt: new Date(), durationMs: duration },
        userId: req.user?.id,
      },
    })

    res.json({ message: 'Clocked out', durationMinutes: Math.round(duration / 60000), clockedInAt: entry.clockedInAt, clockedOutAt: new Date() })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/**
 * GET /timeclock/status/:employeeId - Check if employee is clocked in (POS interlock)
 */
router.get('/timeclock/status/:employeeId', async (req, res) => {
  try {
    const entry = timeclockStore.get(req.params.employeeId)
    res.json({
      employeeId: req.params.employeeId,
      isClockedIn: !!entry,
      posAllowed: !!entry,
      ...(entry || {}),
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/**
 * Middleware: POS interlock - require clock-in before POS operations
 */
router.post('/pos/validate-session', async (req, res) => {
  try {
    const { employeeId } = req.body
    const userId = employeeId || req.user?.id
    if (!userId) return res.status(400).json({ error: 'employeeId required' })

    const entry = timeclockStore.get(userId)
    if (!entry) {
      return res.status(403).json({
        error: 'POS access denied: Employee must clock in first',
        posAllowed: false,
        action: 'require_clock_in',
      })
    }

    res.json({ posAllowed: true, employeeId: userId, clockedInAt: entry.clockedInAt, locationId: entry.locationId })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// =====================================================
// B19: Product Matrix Engine
// =====================================================

/**
 * POST /product-matrix/generate - Generate variant matrix from axes
 * Body: { baseProductId, axes: [{ name: "Size", values: ["S","M","L"] }, { name: "Color", values: ["Red","Blue"] }] }
 */
router.post('/product-matrix/generate', async (req, res) => {
  try {
    const { baseProductId, axes, baseSku, basePrice } = req.body
    if (!axes || !Array.isArray(axes) || axes.length === 0) {
      return res.status(400).json({ error: 'axes array required (e.g., [{ name: "Size", values: ["S","M","L"] }])' })
    }

    // Generate cartesian product of all axis values
    const combinations = axes.reduce((combos, axis) => {
      if (combos.length === 0) return axis.values.map(v => [{ axis: axis.name, value: v }])
      return combos.flatMap(combo => axis.values.map(v => [...combo, { axis: axis.name, value: v }]))
    }, [])

    // Generate SKU for each combination
    const variants = combinations.map((combo, idx) => {
      const skuParts = combo.map(c => c.value.substring(0, 3).toUpperCase())
      const sku = `${baseSku || 'PROD'}-${skuParts.join('-')}`
      return {
        index: idx,
        sku,
        attributes: combo.reduce((obj, c) => { obj[c.axis] = c.value; return obj }, {}),
        price: basePrice || 0,
        isActive: true,
      }
    })

    // Optionally persist as ItemCatalog entries
    if (baseProductId) {
      for (const v of variants) {
        await prisma.itemCatalog.upsert({
          where: { sku: v.sku },
          create: {
            sku: v.sku,
            name: `${baseSku || 'Product'} ${Object.values(v.attributes).join(' ')}`,
            type: 'variant',
            sellingPrice: v.price,
            category: 'variants',
            metadata: { baseProductId, axes: v.attributes },
            isActive: true,
          },
          update: {
            metadata: { baseProductId, axes: v.attributes },
            sellingPrice: v.price,
          },
        })
      }
    }

    res.json({
      baseProductId,
      axes: axes.map(a => ({ name: a.name, valueCount: a.values.length })),
      totalVariants: variants.length,
      variants,
      persisted: !!baseProductId,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/**
 * GET /product-matrix/:baseProductId - Get all variants of a product matrix
 */
router.get('/product-matrix/:baseProductId', async (req, res) => {
  try {
    const variants = await prisma.itemCatalog.findMany({
      where: {
        type: 'variant',
        metadata: { path: ['baseProductId'], equals: req.params.baseProductId },
      },
      orderBy: { sku: 'asc' },
    })

    // Extract axes from metadata
    const axisNames = new Set()
    const axisValues = {}
    variants.forEach(v => {
      const axes = v.metadata?.axes || {}
      Object.entries(axes).forEach(([name, value]) => {
        axisNames.add(name)
        if (!axisValues[name]) axisValues[name] = new Set()
        axisValues[name].add(value)
      })
    })

    res.json({
      baseProductId: req.params.baseProductId,
      variants,
      axes: [...axisNames].map(name => ({ name, values: [...(axisValues[name] || [])] })),
      totalVariants: variants.length,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

/**
 * PATCH /product-matrix/variant/:sku - Update a single variant (price, active status)
 */
router.patch('/product-matrix/variant/:sku', async (req, res) => {
  try {
    const { price, isActive } = req.body
    const data = {}
    if (price !== undefined) data.sellingPrice = price
    if (isActive !== undefined) data.isActive = isActive

    const variant = await prisma.itemCatalog.update({
      where: { sku: req.params.sku },
      data,
    })

    res.json(variant)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

/**
 * POST /product-matrix/bulk-price - Bulk update prices for matrix variants
 */
router.post('/product-matrix/bulk-price', async (req, res) => {
  try {
    const { baseProductId, priceAdjustments } = req.body
    // priceAdjustments: { "Size:L": 5, "Color:Red": -2 } — additive adjustments per axis:value

    if (!baseProductId || !priceAdjustments) {
      return res.status(400).json({ error: 'baseProductId and priceAdjustments required' })
    }

    const variants = await prisma.itemCatalog.findMany({
      where: {
        type: 'variant',
        metadata: { path: ['baseProductId'], equals: baseProductId },
      },
    })

    let updated = 0
    for (const v of variants) {
      const axes = v.metadata?.axes || {}
      let adjustment = 0
      Object.entries(axes).forEach(([axisName, axisValue]) => {
        const key = `${axisName}:${axisValue}`
        if (priceAdjustments[key]) adjustment += priceAdjustments[key]
      })
      if (adjustment !== 0) {
        await prisma.itemCatalog.update({
          where: { id: v.id },
          data: { sellingPrice: Number(v.sellingPrice || 0) + adjustment },
        })
        updated++
      }
    }

    res.json({ message: 'Bulk price update complete', updatedVariants: updated, totalVariants: variants.length })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
