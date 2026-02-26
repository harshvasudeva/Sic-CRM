/**
 * Workflow Routes - Automation engine API (B1-B25).
 * Manages workflow definitions, executions, and event triggers.
 */
const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { authMiddleware } = require('../middleware/auth')

router.use(authMiddleware)

// --- Workflow Definitions ---

// List workflow definitions
router.get('/definitions', async (req, res) => {
  try {
    const { isActive, search } = req.query
    const where = {}
    if (isActive !== undefined) where.isActive = isActive === 'true'
    if (search) where.name = { contains: search, mode: 'insensitive' }
    const definitions = await prisma.workflowDefinition.findMany({ where, orderBy: { name: 'asc' } })
    res.json(definitions)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Get single definition
router.get('/definitions/:id', async (req, res) => {
  try {
    const def = await prisma.workflowDefinition.findUnique({ where: { id: req.params.id } })
    if (!def) return res.status(404).json({ error: 'Workflow not found' })
    res.json(def)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Create definition
router.post('/definitions', async (req, res) => {
  try {
    const def = await prisma.workflowDefinition.create({ data: req.body })
    res.status(201).json(def)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// Update definition
router.put('/definitions/:id', async (req, res) => {
  try {
    const def = await prisma.workflowDefinition.update({ where: { id: req.params.id }, data: req.body })
    res.json(def)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// Toggle active/inactive
router.patch('/definitions/:id/toggle', async (req, res) => {
  try {
    const def = await prisma.workflowDefinition.findUnique({ where: { id: req.params.id } })
    if (!def) return res.status(404).json({ error: 'Not found' })
    const updated = await prisma.workflowDefinition.update({
      where: { id: req.params.id },
      data: { isActive: !def.isActive },
    })
    res.json(updated)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// --- Workflow Executions ---

// List executions
router.get('/executions', async (req, res) => {
  try {
    const { workflowId, status, page = 1, limit = 50 } = req.query
    const where = {}
    if (workflowId) where.workflowId = workflowId
    if (status) where.status = status
    const [executions, total] = await Promise.all([
      prisma.workflowExecution.findMany({
        where,
        orderBy: { startedAt: 'desc' },
        skip: (page - 1) * limit,
        take: Number(limit),
        include: { workflow: { select: { name: true } } },
      }),
      prisma.workflowExecution.count({ where }),
    ])
    res.json({ data: executions, total, page: Number(page), pages: Math.ceil(total / limit) })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Trigger workflow manually
router.post('/trigger', async (req, res) => {
  try {
    const { workflowId, eventType, payload } = req.body
    if (!workflowId && !eventType) {
      return res.status(400).json({ error: 'workflowId or eventType required' })
    }

    let workflow
    if (workflowId) {
      workflow = await prisma.workflowDefinition.findUnique({ where: { id: workflowId } })
    } else {
      workflow = await prisma.workflowDefinition.findFirst({
        where: { triggerEvent: eventType, isActive: true },
      })
    }
    if (!workflow) return res.status(404).json({ error: 'No matching workflow found' })

    const execution = await prisma.workflowExecution.create({
      data: {
        workflowId: workflow.id,
        status: 'running',
        triggerData: payload || {},
        currentStep: 0,
        log: [{ step: 0, action: 'triggered', timestamp: new Date().toISOString(), by: req.user?.id || 'manual' }],
      },
    })
    res.status(201).json(execution)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// Get execution details
router.get('/executions/:id', async (req, res) => {
  try {
    const exec = await prisma.workflowExecution.findUnique({
      where: { id: req.params.id },
      include: { workflow: true },
    })
    if (!exec) return res.status(404).json({ error: 'Execution not found' })
    res.json(exec)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Cancel execution
router.patch('/executions/:id/cancel', async (req, res) => {
  try {
    const exec = await prisma.workflowExecution.update({
      where: { id: req.params.id },
      data: {
        status: 'cancelled',
        completedAt: new Date(),
      },
    })
    res.json(exec)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// --- Approval Requests ---

// List pending approvals for current user
router.get('/approvals', async (req, res) => {
  try {
    const { status = 'pending' } = req.query
    const approvals = await prisma.approvalRequest.findMany({
      where: { status },
      orderBy: { createdAt: 'desc' },
      include: { workflow: { select: { name: true } } },
    })
    res.json(approvals)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Act on an approval
router.patch('/approvals/:id', async (req, res) => {
  try {
    const { action, comment } = req.body // action: 'approved' | 'rejected' | 'escalated'
    if (!['approved', 'rejected', 'escalated'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action' })
    }
    const approval = await prisma.approvalRequest.update({
      where: { id: req.params.id },
      data: {
        status: action,
        resolvedAt: new Date(),
        resolvedBy: req.user?.id || 'unknown',
        comment,
      },
    })
    res.json(approval)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// --- Tags (Polymorphic) ---

router.get('/tags', async (req, res) => {
  try {
    const tags = await prisma.tag.findMany({ orderBy: { name: 'asc' } })
    res.json(tags)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/tags', async (req, res) => {
  try {
    const tag = await prisma.tag.create({ data: req.body })
    res.status(201).json(tag)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// Assign tag to entity
router.post('/tags/assign', async (req, res) => {
  try {
    const { tagId, entityType, entityId } = req.body
    const assignment = await prisma.tagAssignment.create({ data: { tagId, entityType, entityId } })
    res.status(201).json(assignment)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// --- Notifications ---

router.get('/notifications', async (req, res) => {
  try {
    const { isRead } = req.query
    const where = { userId: req.user?.id || 'default' }
    if (isRead !== undefined) where.isRead = isRead === 'true'
    const notifications = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    res.json(notifications)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.patch('/notifications/:id/read', async (req, res) => {
  try {
    const notif = await prisma.notification.update({
      where: { id: req.params.id },
      data: { isRead: true },
    })
    res.json(notif)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

router.patch('/notifications/read-all', async (req, res) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user?.id || 'default', isRead: false },
      data: { isRead: true },
    })
    res.json({ success: true })
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

module.exports = router
