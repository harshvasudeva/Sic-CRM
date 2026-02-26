/**
 * AI Engine Routes - AI/ML features API (E1-E12).
 * Deduplication, predictions, anomaly detection, NL queries, etc.
 */
const express = require('express')
const router = express.Router()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { authMiddleware } = require('../middleware/auth')

router.use(authMiddleware)

// --- Deduplication (E1) ---

router.post('/deduplicate', async (req, res) => {
  try {
    const { entityType = 'partner', threshold = 0.8 } = req.body
    let records = []
    if (entityType === 'partner') {
      records = await prisma.partner.findMany({ where: { isActive: true }, select: { id: true, name: true, email: true, phone: true } })
    }

    // Simple Levenshtein-based matching
    const duplicates = []
    for (let i = 0; i < records.length; i++) {
      for (let j = i + 1; j < records.length; j++) {
        const sim = nameSimilarity(records[i].name, records[j].name)
        const emailMatch = records[i].email && records[j].email && records[i].email.toLowerCase() === records[j].email.toLowerCase()
        if (sim >= threshold || emailMatch) {
          duplicates.push({
            pair: [records[i], records[j]],
            similarity: sim,
            reason: emailMatch ? 'email_match' : 'name_similarity',
          })
        }
      }
    }

    // Log result
    if (duplicates.length > 0) {
      await prisma.deduplicationResult.create({
        data: {
          entityType,
          duplicatesFound: duplicates.length,
          results: duplicates.slice(0, 100),
          status: 'pending_review',
        },
      })
    }

    res.json({ duplicates: duplicates.slice(0, 50), total: duplicates.length })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// --- Anomaly Detection (E7) ---

router.post('/anomalies/detect', async (req, res) => {
  try {
    const { metricType = 'transaction_amount', lookbackDays = 90 } = req.body
    const since = new Date(Date.now() - lookbackDays * 86400000)

    const transactions = await prisma.globalTransaction.findMany({
      where: { createdAt: { gte: since } },
      select: { id: true, amount: true, createdAt: true, type: true },
      orderBy: { createdAt: 'asc' },
    })

    if (transactions.length < 10) {
      return res.json({ anomalies: [], message: 'Insufficient data for analysis' })
    }

    const amounts = transactions.map(t => Math.abs(Number(t.amount)))
    const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length
    const stdDev = Math.sqrt(amounts.reduce((s, v) => s + (v - mean) ** 2, 0) / amounts.length)
    const threshold = mean + 2.5 * stdDev

    const anomalies = transactions
      .filter(t => Math.abs(Number(t.amount)) > threshold)
      .map(t => ({
        transactionId: t.id,
        amount: t.amount,
        type: t.type,
        date: t.createdAt,
        deviation: ((Math.abs(Number(t.amount)) - mean) / stdDev).toFixed(2),
        severity: Math.abs(Number(t.amount)) > mean + 3 * stdDev ? 'high' : 'medium',
      }))

    // Store anomaly alerts
    for (const a of anomalies.slice(0, 20)) {
      await prisma.anomalyAlert.create({
        data: {
          metricType,
          entityType: 'transaction',
          entityId: a.transactionId,
          expectedValue: mean,
          actualValue: Number(a.amount),
          deviation: parseFloat(a.deviation),
          severity: a.severity,
        },
      })
    }

    res.json({ anomalies, stats: { mean: mean.toFixed(2), stdDev: stdDev.toFixed(2), threshold: threshold.toFixed(2), totalAnalyzed: transactions.length } })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// List anomaly alerts
router.get('/anomalies', async (req, res) => {
  try {
    const { severity, isResolved, limit = 50 } = req.query
    const where = {}
    if (severity) where.severity = severity
    if (isResolved !== undefined) where.isResolved = isResolved === 'true'
    const alerts = await prisma.anomalyAlert.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
    })
    res.json(alerts)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// Resolve anomaly
router.patch('/anomalies/:id/resolve', async (req, res) => {
  try {
    const alert = await prisma.anomalyAlert.update({
      where: { id: req.params.id },
      data: { isResolved: true },
    })
    res.json(alert)
  } catch (err) {
    res.status(400).json({ error: err.message })
  }
})

// --- Natural Language Query (E12) ---

router.post('/nl-query', async (req, res) => {
  try {
    const { query } = req.body
    if (!query) return res.status(400).json({ error: 'query is required' })

    // Simple keyword-based query parser
    const result = parseNLQuery(query)

    // Log the query
    await prisma.nLQueryLog.create({
      data: {
        query,
        parsedIntent: result.intent,
        generatedSQL: result.sql || '',
        resultCount: result.data?.length || 0,
        userId: req.user?.id || 'anonymous',
      },
    })

    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// --- Predictive Analytics (E2, E3) ---

router.get('/predictions/procurement', async (req, res) => {
  try {
    const { itemId } = req.query
    // Return simple moving average based prediction
    const movements = await prisma.stockMovement.findMany({
      where: itemId ? { itemId, type: 'sale' } : { type: 'sale' },
      orderBy: { createdAt: 'desc' },
      take: 90,
    })
    if (movements.length < 7) {
      return res.json({ prediction: null, message: 'Insufficient sales data' })
    }
    const dailyUsage = movements.reduce((sum, m) => sum + Math.abs(m.quantity), 0) / 90
    const prediction = {
      dailyUsage: dailyUsage.toFixed(2),
      weeklyUsage: (dailyUsage * 7).toFixed(2),
      monthlyUsage: (dailyUsage * 30).toFixed(2),
      reorderPoint: Math.ceil(dailyUsage * 14), // 2-week safety stock
      suggestedOrderQty: Math.ceil(dailyUsage * 30), // 1-month supply
    }
    res.json({ prediction, basedOnRecords: movements.length })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// --- Utility Functions ---

function nameSimilarity(a, b) {
  if (!a || !b) return 0
  a = a.toLowerCase().trim()
  b = b.toLowerCase().trim()
  if (a === b) return 1
  const matrix = Array.from({ length: a.length + 1 }, (_, i) => Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)))
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      matrix[i][j] = a[i - 1] === b[j - 1]
        ? matrix[i - 1][j - 1]
        : 1 + Math.min(matrix[i - 1][j], matrix[i][j - 1], matrix[i - 1][j - 1])
    }
  }
  const maxLen = Math.max(a.length, b.length)
  return maxLen === 0 ? 1 : 1 - matrix[a.length][b.length] / maxLen
}

function parseNLQuery(query) {
  const q = query.toLowerCase()
  if (q.includes('revenue') || q.includes('sales total')) {
    return { intent: 'revenue_summary', sql: 'SELECT SUM(amount) FROM transactions WHERE type=sale', data: [], message: 'Revenue query parsed - connect to live DB for results' }
  }
  if (q.includes('overdue') && q.includes('invoice')) {
    return { intent: 'overdue_invoices', sql: 'SELECT * FROM invoices WHERE dueDate < NOW() AND status != paid', data: [], message: 'Overdue invoices query parsed' }
  }
  if (q.includes('top') && (q.includes('customer') || q.includes('client'))) {
    return { intent: 'top_customers', sql: 'SELECT partnerId, SUM(amount) FROM transactions GROUP BY partnerId ORDER BY SUM DESC LIMIT 10', data: [], message: 'Top customers query parsed' }
  }
  if (q.includes('stock') || q.includes('inventory')) {
    return { intent: 'stock_levels', sql: 'SELECT itemId, SUM(quantity) FROM stock_movements GROUP BY itemId', data: [], message: 'Stock levels query parsed' }
  }
  return { intent: 'unknown', sql: '', data: [], message: 'Could not parse query. Try: "show revenue", "overdue invoices", "top customers", "stock levels"' }
}

module.exports = router
