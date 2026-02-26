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

// --- E4: Churn Risk Scoring ---

router.get('/churn-risk', async (req, res) => {
  try {
    const { partnerId } = req.query
    const where = { isActive: true, type: { in: ['customer', 'both'] } }
    if (partnerId) where.id = partnerId

    const partners = await prisma.partner.findMany({
      where,
      select: { id: true, name: true, email: true, createdAt: true },
      take: 100,
    })

    const now = Date.now()
    const results = []
    for (const p of partners) {
      // Get last transaction date
      const lastTx = await prisma.globalTransaction.findFirst({
        where: { partnerId: p.id },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true, amount: true },
      })

      // Get transaction count in last 90 days
      const txCount = await prisma.globalTransaction.count({
        where: { partnerId: p.id, createdAt: { gte: new Date(now - 90 * 86400000) } },
      })

      // Score: higher = more risk
      let score = 0
      const daysSinceLastTx = lastTx ? (now - new Date(lastTx.createdAt).getTime()) / 86400000 : 999
      if (daysSinceLastTx > 180) score += 40
      else if (daysSinceLastTx > 90) score += 25
      else if (daysSinceLastTx > 60) score += 15
      else if (daysSinceLastTx > 30) score += 5
      if (txCount === 0) score += 30
      else if (txCount <= 2) score += 15
      // Account age bonus (newer = higher risk)
      const accountAgeDays = (now - new Date(p.createdAt).getTime()) / 86400000
      if (accountAgeDays < 90) score += 10

      results.push({
        partnerId: p.id,
        name: p.name,
        email: p.email,
        churnScore: Math.min(score, 100),
        riskLevel: score >= 60 ? 'high' : score >= 30 ? 'medium' : 'low',
        daysSinceLastTransaction: Math.round(daysSinceLastTx),
        recentTransactionCount: txCount,
        factors: [
          daysSinceLastTx > 60 ? 'inactive' : null,
          txCount === 0 ? 'no_recent_orders' : null,
          accountAgeDays < 90 ? 'new_account' : null,
        ].filter(Boolean),
      })
    }

    results.sort((a, b) => b.churnScore - a.churnScore)
    res.json({ customers: results, analyzed: results.length })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// --- E5: Sentiment Analysis ---

router.post('/sentiment', async (req, res) => {
  try {
    const { text, entityType, entityId } = req.body
    if (!text) return res.status(400).json({ error: 'text is required' })

    // Keyword-based sentiment scoring (production: integrate OpenAI / HuggingFace)
    const positiveWords = ['great', 'excellent', 'amazing', 'good', 'love', 'happy', 'perfect', 'best', 'wonderful', 'fantastic', 'satisfied', 'thank', 'pleased', 'awesome', 'outstanding']
    const negativeWords = ['bad', 'terrible', 'awful', 'worst', 'hate', 'angry', 'poor', 'horrible', 'disappointed', 'frustrat', 'annoy', 'complain', 'unacceptable', 'issue', 'problem', 'broken', 'slow', 'late']
    const words = text.toLowerCase().split(/\s+/)
    let posCount = 0, negCount = 0
    words.forEach(w => {
      if (positiveWords.some(pw => w.includes(pw))) posCount++
      if (negativeWords.some(nw => w.includes(nw))) negCount++
    })
    const total = posCount + negCount || 1
    const score = ((posCount - negCount) / total + 1) / 2 // 0 to 1

    const sentiment = score > 0.6 ? 'positive' : score < 0.4 ? 'negative' : 'neutral'

    // Log as activity if entity provided
    if (entityType && entityId) {
      await prisma.unifiedActivity.create({
        data: {
          entityType,
          entityId,
          action: 'sentiment_analysis',
          details: { sentiment, score, textLength: text.length },
          userId: req.user?.id,
        },
      })
    }

    res.json({ sentiment, score: parseFloat(score.toFixed(3)), positiveSignals: posCount, negativeSignals: negCount, wordCount: words.length })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// --- E6: Smart Recommendations ---

router.get('/recommendations/:partnerId', async (req, res) => {
  try {
    const { partnerId } = req.params

    // Get partner's purchase history
    const transactions = await prisma.globalTransaction.findMany({
      where: { partnerId, type: 'sale' },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: { metadata: true, amount: true, createdAt: true },
    })

    // Get all items for recommendation pool
    const items = await prisma.itemCatalog.findMany({
      where: { isActive: true },
      select: { id: true, name: true, category: true, sellingPrice: true },
      take: 200,
    })

    // Extract purchased item IDs from metadata
    const purchasedItemIds = new Set()
    transactions.forEach(t => {
      const meta = typeof t.metadata === 'string' ? JSON.parse(t.metadata || '{}') : (t.metadata || {})
      if (meta.itemId) purchasedItemIds.add(meta.itemId)
      if (meta.items) meta.items.forEach(i => purchasedItemIds.add(i.itemId || i.id))
    })

    // Find categories they buy from
    const purchasedCategories = new Set()
    items.forEach(item => { if (purchasedItemIds.has(item.id) && item.category) purchasedCategories.add(item.category) })

    // Recommend items in same categories they haven't bought
    const recommendations = items
      .filter(item => !purchasedItemIds.has(item.id) && purchasedCategories.has(item.category))
      .slice(0, 10)
      .map(item => ({
        itemId: item.id,
        name: item.name,
        category: item.category,
        price: item.sellingPrice,
        reason: 'category_affinity',
      }))

    // Also add top-selling items they haven't bought
    const popularItems = items
      .filter(item => !purchasedItemIds.has(item.id) && !recommendations.some(r => r.itemId === item.id))
      .slice(0, 5)
      .map(item => ({
        itemId: item.id,
        name: item.name,
        category: item.category,
        price: item.sellingPrice,
        reason: 'popular_item',
      }))

    res.json({
      partnerId,
      recommendations: [...recommendations, ...popularItems],
      basedOn: { purchaseCount: transactions.length, categoriesBought: [...purchasedCategories] },
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// --- E8: Forecasting ---

router.get('/forecast/:metric', async (req, res) => {
  try {
    const { metric } = req.params
    const { periods = 6 } = req.query

    let historicalData = []

    if (metric === 'revenue') {
      // Aggregate monthly revenue from transactions
      const transactions = await prisma.globalTransaction.findMany({
        where: { type: 'sale', createdAt: { gte: new Date(Date.now() - 365 * 86400000) } },
        select: { amount: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      })
      // Group by month
      const monthlyMap = {}
      transactions.forEach(t => {
        const key = `${t.createdAt.getFullYear()}-${String(t.createdAt.getMonth() + 1).padStart(2, '0')}`
        monthlyMap[key] = (monthlyMap[key] || 0) + Math.abs(Number(t.amount))
      })
      historicalData = Object.entries(monthlyMap).map(([month, value]) => ({ month, value }))
    } else if (metric === 'orders') {
      const transactions = await prisma.globalTransaction.findMany({
        where: { type: 'sale', createdAt: { gte: new Date(Date.now() - 365 * 86400000) } },
        select: { createdAt: true },
      })
      const monthlyMap = {}
      transactions.forEach(t => {
        const key = `${t.createdAt.getFullYear()}-${String(t.createdAt.getMonth() + 1).padStart(2, '0')}`
        monthlyMap[key] = (monthlyMap[key] || 0) + 1
      })
      historicalData = Object.entries(monthlyMap).map(([month, value]) => ({ month, value }))
    } else {
      return res.status(400).json({ error: 'Supported metrics: revenue, orders' })
    }

    if (historicalData.length < 3) {
      return res.json({ forecast: [], message: 'Insufficient historical data (need 3+ months)' })
    }

    // Simple linear regression forecast
    const values = historicalData.map(d => d.value)
    const n = values.length
    const sumX = (n * (n - 1)) / 2
    const sumY = values.reduce((a, b) => a + b, 0)
    const sumXY = values.reduce((s, v, i) => s + i * v, 0)
    const sumXX = values.reduce((s, _, i) => s + i * i, 0)
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n

    const forecast = []
    for (let i = 0; i < Number(periods); i++) {
      const futureIdx = n + i
      const predicted = Math.max(0, intercept + slope * futureIdx)
      const lastMonth = historicalData[historicalData.length - 1].month
      const [y, m] = lastMonth.split('-').map(Number)
      const futureDate = new Date(y, m + i, 1)
      forecast.push({
        month: `${futureDate.getFullYear()}-${String(futureDate.getMonth() + 1).padStart(2, '0')}`,
        predicted: Math.round(predicted * 100) / 100,
        confidence: Math.max(0.5, 1 - i * 0.08), // Decreasing confidence
      })
    }

    res.json({
      metric,
      historical: historicalData,
      forecast,
      model: 'linear_regression',
      trend: slope > 0 ? 'upward' : slope < 0 ? 'downward' : 'flat',
      trendStrength: Math.abs(slope).toFixed(2),
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// --- E9: Lead Scoring ---

router.get('/lead-score/:partnerId', async (req, res) => {
  try {
    const { partnerId } = req.params
    const partner = await prisma.partner.findUnique({
      where: { id: partnerId },
      select: { id: true, name: true, email: true, type: true, createdAt: true, metadata: true },
    })
    if (!partner) return res.status(404).json({ error: 'Partner not found' })

    let score = 0
    const factors = []

    // 1. Has email: +10
    if (partner.email) { score += 10; factors.push({ factor: 'has_email', points: 10 }) }

    // 2. Transaction history
    const txCount = await prisma.globalTransaction.count({ where: { partnerId } })
    if (txCount > 10) { score += 25; factors.push({ factor: 'frequent_buyer', points: 25 }) }
    else if (txCount > 3) { score += 15; factors.push({ factor: 'repeat_buyer', points: 15 }) }
    else if (txCount > 0) { score += 8; factors.push({ factor: 'has_purchased', points: 8 }) }

    // 3. Recent activity (activities in last 30 days)
    const recentActivities = await prisma.unifiedActivity.count({
      where: { entityId: partnerId, createdAt: { gte: new Date(Date.now() - 30 * 86400000) } },
    })
    if (recentActivities > 5) { score += 20; factors.push({ factor: 'highly_engaged', points: 20 }) }
    else if (recentActivities > 0) { score += 10; factors.push({ factor: 'recently_active', points: 10 }) }

    // 4. Has phone + address (completeness)
    const addresses = await prisma.address.count({ where: { partnerId } })
    if (addresses > 0) { score += 10; factors.push({ factor: 'has_address', points: 10 }) }

    // 5. Revenue value (total spend)
    const totalSpend = await prisma.globalTransaction.aggregate({
      where: { partnerId, type: 'sale' },
      _sum: { amount: true },
    })
    const spend = Number(totalSpend._sum.amount || 0)
    if (spend > 100000) { score += 25; factors.push({ factor: 'high_value', points: 25 }) }
    else if (spend > 10000) { score += 15; factors.push({ factor: 'mid_value', points: 15 }) }
    else if (spend > 0) { score += 5; factors.push({ factor: 'has_revenue', points: 5 }) }

    // Cap at 100
    score = Math.min(score, 100)

    res.json({
      partnerId,
      name: partner.name,
      leadScore: score,
      grade: score >= 80 ? 'A' : score >= 60 ? 'B' : score >= 40 ? 'C' : score >= 20 ? 'D' : 'F',
      factors,
      totalTransactions: txCount,
      totalSpend: spend,
      recentActivityCount: recentActivities,
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// --- E10: Document Intelligence ---

router.post('/documents/extract', async (req, res) => {
  try {
    const { documentUrl, documentType = 'invoice' } = req.body

    // Simulated OCR / document extraction (production: integrate Google Vision, AWS Textract, or Azure Form Recognizer)
    // In a real implementation, this would accept a multipart upload or URL and run through an OCR pipeline
    const extractionTemplates = {
      invoice: {
        fields: ['invoice_number', 'date', 'due_date', 'vendor_name', 'total_amount', 'tax_amount', 'line_items'],
        confidence: 0.87,
      },
      receipt: {
        fields: ['merchant_name', 'date', 'total', 'tax', 'payment_method', 'items'],
        confidence: 0.82,
      },
      purchase_order: {
        fields: ['po_number', 'date', 'vendor', 'ship_to', 'items', 'total'],
        confidence: 0.85,
      },
      contract: {
        fields: ['parties', 'effective_date', 'expiry_date', 'terms', 'value'],
        confidence: 0.78,
      },
    }

    const template = extractionTemplates[documentType] || extractionTemplates.invoice

    res.json({
      status: 'extracted',
      documentType,
      extractedFields: template.fields.reduce((acc, f) => {
        acc[f] = { value: `[Extracted ${f}]`, confidence: template.confidence + (Math.random() * 0.1 - 0.05) }
        return acc
      }, {}),
      averageConfidence: template.confidence,
      message: 'Document extraction simulated. Connect OCR provider (Google Vision / AWS Textract) for production use.',
      supportedTypes: Object.keys(extractionTemplates),
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// --- E11: Voice / NLP Commands ---

router.post('/voice/command', async (req, res) => {
  try {
    const { transcript } = req.body
    if (!transcript) return res.status(400).json({ error: 'transcript is required' })

    const t = transcript.toLowerCase()

    // Intent recognition via keyword matching (production: integrate with Dialogflow / Rasa / OpenAI)
    let intent = 'unknown'
    let action = null
    let entities = {}

    if (t.includes('create') && (t.includes('invoice') || t.includes('bill'))) {
      intent = 'create_invoice'
      action = { route: '/invoices/new', method: 'navigate' }
    } else if (t.includes('show') && t.includes('dashboard')) {
      intent = 'show_dashboard'
      action = { route: '/dashboard', method: 'navigate' }
    } else if ((t.includes('find') || t.includes('search') || t.includes('look up')) && (t.includes('customer') || t.includes('client'))) {
      intent = 'search_customer'
      const nameMatch = t.match(/(?:for|named?)\s+(\w+(?:\s+\w+)?)/i)
      entities.searchTerm = nameMatch?.[1] || ''
      action = { route: '/crm/contacts', method: 'navigate', params: { search: entities.searchTerm } }
    } else if (t.includes('check') && t.includes('stock')) {
      intent = 'check_stock'
      action = { route: '/inventory', method: 'navigate' }
    } else if (t.includes('open') && t.includes('report')) {
      intent = 'open_reports'
      action = { route: '/reports', method: 'navigate' }
    } else if (t.includes('add') && (t.includes('note') || t.includes('comment'))) {
      intent = 'add_note'
      action = { method: 'input', target: 'comment_field' }
    } else if (t.includes('schedule') && (t.includes('meeting') || t.includes('call'))) {
      intent = 'schedule_meeting'
      action = { route: '/crm/activities/new', method: 'navigate' }
    }

    res.json({
      transcript,
      intent,
      action,
      entities,
      confidence: intent !== 'unknown' ? 0.85 : 0.2,
      message: intent === 'unknown' ? 'Could not understand command. Try: "create invoice", "show dashboard", "find customer John", "check stock"' : `Recognized: ${intent}`,
      supportedCommands: ['create invoice', 'show dashboard', 'find customer [name]', 'check stock', 'open reports', 'add note', 'schedule meeting'],
    })
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
