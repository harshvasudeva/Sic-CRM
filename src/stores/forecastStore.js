/**
 * Sales Forecasting Store - weighted pipeline forecasting.
 * Uses deal stage probabilities to calculate forecast amounts.
 */

const STORAGE_KEY = 'sic_crm_forecasts'

const STAGE_PROBABILITIES = {
  'New': 0.10,
  'Contacted': 0.20,
  'Qualified': 0.35,
  'Proposal': 0.50,
  'Negotiation': 0.70,
  'Verbal Yes': 0.85,
  'Won': 1.00,
  'Lost': 0.00,
}

function getStore() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : { stageProbabilities: STAGE_PROBABILITIES, snapshots: [] }
  } catch {
    return { stageProbabilities: STAGE_PROBABILITIES, snapshots: [] }
  }
}

function save(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

/**
 * Calculate weighted forecast from deals.
 */
export function calculateForecast(deals) {
  const { stageProbabilities } = getStore()

  let totalPipeline = 0
  let weightedForecast = 0
  let bestCase = 0
  let worstCase = 0
  const byStage = {}

  for (const deal of deals) {
    const value = deal.value || deal.amount || 0
    const stage = deal.stage || deal.status || 'New'
    const probability = stageProbabilities[stage] ?? 0.10

    totalPipeline += value
    weightedForecast += value * probability
    bestCase += value * Math.min(1, probability + 0.2)
    worstCase += value * Math.max(0, probability - 0.2)

    if (!byStage[stage]) {
      byStage[stage] = { count: 0, total: 0, weighted: 0, probability }
    }
    byStage[stage].count++
    byStage[stage].total += value
    byStage[stage].weighted += value * probability
  }

  return {
    totalPipeline: Math.round(totalPipeline),
    weightedForecast: Math.round(weightedForecast),
    bestCase: Math.round(bestCase),
    worstCase: Math.round(worstCase),
    dealCount: deals.length,
    avgDealSize: deals.length > 0 ? Math.round(totalPipeline / deals.length) : 0,
    byStage,
    calculatedAt: new Date().toISOString(),
  }
}

/**
 * Calculate monthly forecast from deals with close dates.
 */
export function calculateMonthlyForecast(deals, months = 6) {
  const { stageProbabilities } = getStore()
  const now = new Date()
  const monthly = []

  for (let i = 0; i < months; i++) {
    const targetMonth = new Date(now.getFullYear(), now.getMonth() + i, 1)
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + i + 1, 0)
    const monthLabel = targetMonth.toLocaleString('default', { month: 'short', year: 'numeric' })

    const monthDeals = deals.filter(d => {
      const closeDate = new Date(d.closeDate || d.expectedClose || d.dueDate)
      return closeDate >= targetMonth && closeDate <= monthEnd
    })

    const forecast = calculateForecast(monthDeals)
    monthly.push({ month: monthLabel, ...forecast })
  }

  return monthly
}

/**
 * Save a forecast snapshot for historical comparison.
 */
export function saveForecastSnapshot(forecast) {
  const store = getStore()
  store.snapshots.push({
    ...forecast,
    id: `snap_${Date.now()}`,
    savedAt: new Date().toISOString(),
  })
  // Keep last 12 snapshots
  if (store.snapshots.length > 12) {
    store.snapshots = store.snapshots.slice(-12)
  }
  save(store)
}

export function getForecastSnapshots() {
  return getStore().snapshots
}

export function getStageProbabilities() {
  return getStore().stageProbabilities
}

export function updateStageProbabilities(probabilities) {
  const store = getStore()
  store.stageProbabilities = { ...store.stageProbabilities, ...probabilities }
  save(store)
}
