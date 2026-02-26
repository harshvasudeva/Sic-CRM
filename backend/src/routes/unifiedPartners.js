/**
 * Unified Partners Routes - CRUD for the polymorphic partners table (A1, A2).
 * Replaces separate customer/vendor tables with a single partner entity.
 */
const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { authMiddleware } = require('../middleware/auth')

router.use(authMiddleware)

// List all partners with optional filters
router.get('/', async (req, res) => {
  try {
    const { type, search, page = 1, limit = 50, sort = 'name', order = 'asc' } = req.query
    const where = {}
    if (type) where.type = type
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { company: { contains: search, mode: 'insensitive' } },
      ]
    }
    const [partners, total] = await Promise.all([
      prisma.partner.findMany({
        where,
        orderBy: { [sort]: order },
        skip: (page - 1) * limit,
        take: Number(limit),
        include: { addresses: true, tags: { include: { tag: true } } },
      }),
      prisma.partner.count({ where }),
    ])
    res.json({ data: partners, total, page: Number(page), pages: Math.ceil(total / limit) })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Get single partner
router.get('/:id', async (req, res) => {
  try {
    const partner = await prisma.partner.findUnique({
      where: { id: req.params.id },
      include: {
        addresses: true,
        tags: { include: { tag: true } },
        attachments: true,
        activities: { orderBy: { createdAt: 'desc' }, take: 20 },
        comments: { orderBy: { createdAt: 'desc' }, take: 20 },
      },
    })
    if (!partner) return res.status(404).json({ error: 'Partner not found' })
    res.json(partner)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Create partner
router.post('/', async (req, res) => {
  try {
    const { addresses, tags, ...data } = req.body
    const partner = await prisma.partner.create({
      data: {
        ...data,
        addresses: addresses ? { create: addresses } : undefined,
        tags: tags ? { create: tags.map(tagId => ({ tagId })) } : undefined,
      },
      include: { addresses: true, tags: { include: { tag: true } } },
    })
    res.status(201).json(partner)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// Update partner
router.put('/:id', async (req, res) => {
  try {
    const { addresses, tags, ...data } = req.body
    const partner = await prisma.partner.update({
      where: { id: req.params.id },
      data,
      include: { addresses: true, tags: { include: { tag: true } } },
    })
    res.json(partner)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// Soft-delete partner
router.delete('/:id', async (req, res) => {
  try {
    await prisma.partner.update({
      where: { id: req.params.id },
      data: { isActive: false },
    })
    res.json({ success: true })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// Partner addresses
router.post('/:id/addresses', async (req, res) => {
  try {
    const address = await prisma.address.create({
      data: { ...req.body, partnerId: req.params.id },
    })
    res.status(201).json(address)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// Partner activities timeline
router.get('/:id/activities', async (req, res) => {
  try {
    const activities = await prisma.unifiedActivity.findMany({
      where: { entityType: 'partner', entityId: req.params.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    res.json(activities)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Merge duplicate partners
router.post('/merge', async (req, res) => {
  try {
    const { primaryId, duplicateIds } = req.body
    if (!primaryId || !duplicateIds?.length) {
      return res.status(400).json({ error: 'primaryId and duplicateIds required' })
    }
    // Move all related records to primary partner
    for (const dupId of duplicateIds) {
      await prisma.$transaction([
        prisma.address.updateMany({ where: { partnerId: dupId }, data: { partnerId: primaryId } }),
        prisma.unifiedActivity.updateMany({ where: { entityType: 'partner', entityId: dupId }, data: { entityId: primaryId } }),
        prisma.comment.updateMany({ where: { entityType: 'partner', entityId: dupId }, data: { entityId: primaryId } }),
        prisma.partner.update({ where: { id: dupId }, data: { isActive: false, metadata: { merged_into: primaryId } } }),
      ])
    }
    const primary = await prisma.partner.findUnique({ where: { id: primaryId }, include: { addresses: true } })
    res.json({ success: true, partner: primary, mergedCount: duplicateIds.length })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

module.exports = router
