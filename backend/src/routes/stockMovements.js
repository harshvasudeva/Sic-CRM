/**
 * Stock Movements Routes - Append-only inventory ledger (A4, A5).
 * All stock changes are recorded as immutable movements.
 */
const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { authMiddleware } = require('../middleware/auth')

router.use(authMiddleware)

// List movements with filters
router.get('/', async (req, res) => {
  try {
    const { itemId, locationId, type, dateFrom, dateTo, page = 1, limit = 50 } = req.query
    const where = {}
    if (itemId) where.itemId = itemId
    if (locationId) where.locationId = locationId
    if (type) where.type = type
    if (dateFrom || dateTo) {
      where.createdAt = {}
      if (dateFrom) where.createdAt.gte = new Date(dateFrom)
      if (dateTo) where.createdAt.lte = new Date(dateTo)
    }
    const [movements, total] = await Promise.all([
      prisma.stockMovement.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: Number(limit),
        include: { item: true },
      }),
      prisma.stockMovement.count({ where }),
    ])
    res.json({ data: movements, total, page: Number(page), pages: Math.ceil(total / limit) })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Create a stock movement (append-only)
router.post('/', async (req, res) => {
  try {
    const movement = await prisma.stockMovement.create({
      data: {
        ...req.body,
        userId: req.user?.id || 'system',
      },
      include: { item: true },
    })
    res.status(201).json(movement)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// Get current stock levels (computed from movements)
router.get('/levels', async (req, res) => {
  try {
    const { locationId } = req.query
    const where = locationId ? { locationId } : {}
    const movements = await prisma.stockMovement.groupBy({
      by: ['itemId', 'locationId'],
      where,
      _sum: { quantity: true },
    })
    // Enrich with item details
    const itemIds = [...new Set(movements.map(m => m.itemId))]
    const items = await prisma.itemCatalog.findMany({
      where: { id: { in: itemIds } },
    })
    const itemMap = Object.fromEntries(items.map(i => [i.id, i]))
    const levels = movements.map(m => ({
      itemId: m.itemId,
      locationId: m.locationId,
      quantity: m._sum.quantity || 0,
      item: itemMap[m.itemId] || null,
    }))
    res.json(levels)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Item catalog CRUD
router.get('/items', async (req, res) => {
  try {
    const { search, type, page = 1, limit = 50 } = req.query
    const where = { isActive: true }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
      ]
    }
    if (type) {
      if (type === 'sellable') where.canBeSold = true
      else if (type === 'purchasable') where.canBePurchased = true
      else if (type === 'asset') where.isAsset = true
    }
    const [items, total] = await Promise.all([
      prisma.itemCatalog.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: (page - 1) * limit,
        take: Number(limit),
      }),
      prisma.itemCatalog.count({ where }),
    ])
    res.json({ data: items, total, page: Number(page), pages: Math.ceil(total / limit) })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/items', async (req, res) => {
  try {
    const item = await prisma.itemCatalog.create({ data: req.body })
    res.status(201).json(item)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

router.put('/items/:id', async (req, res) => {
  try {
    const item = await prisma.itemCatalog.update({
      where: { id: req.params.id },
      data: req.body,
    })
    res.json(item)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// Batch stock intake (for GRN / manufacturing output)
router.post('/batch', async (req, res) => {
  try {
    const { movements } = req.body
    if (!Array.isArray(movements) || movements.length === 0) {
      return res.status(400).json({ error: 'movements array required' })
    }
    const results = await prisma.$transaction(
      movements.map(m => prisma.stockMovement.create({
        data: { ...m, userId: req.user?.id || 'system' },
      }))
    )
    res.status(201).json({ created: results.length, movements: results })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

module.exports = router
