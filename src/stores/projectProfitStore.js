/**
 * Project Profitability Store - track revenue, costs, and margins per project.
 */

const STORAGE_KEY = 'sic_crm_project_profit'

function getStore() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : {}
  } catch {
    return {}
  }
}

function save(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

/**
 * Create or update a project's financial tracking.
 */
export function upsertProject(projectId, data) {
  const store = getStore()
  store[projectId] = {
    ...store[projectId],
    ...data,
    id: projectId,
    updatedAt: new Date().toISOString(),
  }
  if (!store[projectId].createdAt) store[projectId].createdAt = new Date().toISOString()
  if (!store[projectId].revenues) store[projectId].revenues = []
  if (!store[projectId].costs) store[projectId].costs = []
  save(store)
  return store[projectId]
}

/**
 * Add revenue to a project.
 */
export function addRevenue(projectId, item) {
  const store = getStore()
  if (!store[projectId]) store[projectId] = { id: projectId, revenues: [], costs: [] }

  store[projectId].revenues.push({
    ...item,
    id: `rev_${Date.now()}`,
    createdAt: new Date().toISOString(),
  })
  save(store)
  return calculateProfitability(projectId)
}

/**
 * Add cost/expense to a project.
 */
export function addCost(projectId, item) {
  const store = getStore()
  if (!store[projectId]) store[projectId] = { id: projectId, revenues: [], costs: [] }

  store[projectId].costs.push({
    ...item,
    id: `cost_${Date.now()}`,
    createdAt: new Date().toISOString(),
  })
  save(store)
  return calculateProfitability(projectId)
}

/**
 * Calculate profitability for a project.
 */
export function calculateProfitability(projectId) {
  const store = getStore()
  const project = store[projectId]
  if (!project) return null

  const totalRevenue = (project.revenues || []).reduce((s, r) => s + (r.amount || 0), 0)
  const totalCost = (project.costs || []).reduce((s, c) => s + (c.amount || 0), 0)
  const profit = totalRevenue - totalCost
  const margin = totalRevenue > 0 ? (profit / totalRevenue * 100) : 0

  const costBreakdown = {}
  for (const cost of project.costs || []) {
    const cat = cost.category || 'Other'
    costBreakdown[cat] = (costBreakdown[cat] || 0) + (cost.amount || 0)
  }

  return {
    projectId,
    projectName: project.name || projectId,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    totalCost: Math.round(totalCost * 100) / 100,
    profit: Math.round(profit * 100) / 100,
    margin: Math.round(margin * 100) / 100,
    costBreakdown,
    status: margin >= 20 ? 'profitable' : margin >= 0 ? 'marginal' : 'loss',
    color: margin >= 20 ? '#22c55e' : margin >= 0 ? '#f59e0b' : '#ef4444',
  }
}

/**
 * Get all projects with profitability.
 */
export function getAllProjectProfits() {
  const store = getStore()
  return Object.keys(store)
    .map(id => calculateProfitability(id))
    .filter(Boolean)
    .sort((a, b) => b.margin - a.margin)
}

/**
 * Get project financial details.
 */
export function getProjectFinancials(projectId) {
  const store = getStore()
  return store[projectId] || null
}

export const COST_CATEGORIES = [
  'Labor', 'Materials', 'Equipment', 'Travel', 'Software',
  'Subcontractor', 'Marketing', 'Overhead', 'Other',
]
