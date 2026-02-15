/**
 * Lead Scoring Store - Configurable scoring rules for leads.
 * Assigns numeric scores to leads based on demographic and behavioral criteria.
 */

const STORAGE_KEY = 'sic_crm_lead_scoring'

const DEFAULT_RULES = [
  // Demographic rules
  { id: 'r1', category: 'demographic', field: 'company', condition: 'exists', value: '', points: 10, label: 'Has company name' },
  { id: 'r2', category: 'demographic', field: 'email', condition: 'contains', value: '@gmail.com', points: -5, label: 'Personal email (Gmail)' },
  { id: 'r3', category: 'demographic', field: 'email', condition: 'notContains', value: '@gmail.com', points: 10, label: 'Business email' },
  { id: 'r4', category: 'demographic', field: 'phone', condition: 'exists', value: '', points: 5, label: 'Has phone number' },
  { id: 'r5', category: 'demographic', field: 'source', condition: 'equals', value: 'Referral', points: 20, label: 'Referral source' },
  { id: 'r6', category: 'demographic', field: 'source', condition: 'equals', value: 'Website', points: 15, label: 'Website source' },
  { id: 'r7', category: 'demographic', field: 'source', condition: 'equals', value: 'Cold Call', points: 5, label: 'Cold call source' },

  // Engagement rules
  { id: 'r8', category: 'engagement', field: 'status', condition: 'equals', value: 'Contacted', points: 10, label: 'Has been contacted' },
  { id: 'r9', category: 'engagement', field: 'status', condition: 'equals', value: 'Qualified', points: 25, label: 'Qualified lead' },
  { id: 'r10', category: 'engagement', field: 'status', condition: 'equals', value: 'Proposal', points: 35, label: 'Proposal stage' },
  { id: 'r11', category: 'engagement', field: 'status', condition: 'equals', value: 'Negotiation', points: 45, label: 'Negotiation stage' },
  { id: 'r12', category: 'engagement', field: 'notes', condition: 'exists', value: '', points: 5, label: 'Has notes/comments' },

  // Value rules
  { id: 'r13', category: 'value', field: 'value', condition: 'greaterThan', value: '50000', points: 15, label: 'Deal value > 50K' },
  { id: 'r14', category: 'value', field: 'value', condition: 'greaterThan', value: '100000', points: 25, label: 'Deal value > 100K' },
  { id: 'r15', category: 'value', field: 'value', condition: 'greaterThan', value: '500000', points: 40, label: 'Deal value > 500K' },
]

const SCORE_THRESHOLDS = {
  hot: 70,
  warm: 40,
  cold: 0,
}

function getConfig() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
    const config = { rules: DEFAULT_RULES, thresholds: SCORE_THRESHOLDS }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
    return config
  } catch {
    return { rules: DEFAULT_RULES, thresholds: SCORE_THRESHOLDS }
  }
}

function saveConfig(config) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
}

// Check if a condition matches
function evaluateCondition(fieldValue, condition, ruleValue) {
  if (fieldValue === undefined || fieldValue === null) fieldValue = ''
  const strVal = String(fieldValue).toLowerCase().trim()
  const ruleVal = String(ruleValue).toLowerCase().trim()

  switch (condition) {
    case 'equals': return strVal === ruleVal
    case 'notEquals': return strVal !== ruleVal
    case 'contains': return strVal.includes(ruleVal)
    case 'notContains': return !strVal.includes(ruleVal)
    case 'exists': return strVal.length > 0
    case 'notExists': return strVal.length === 0
    case 'greaterThan': return parseFloat(fieldValue) > parseFloat(ruleValue)
    case 'lessThan': return parseFloat(fieldValue) < parseFloat(ruleValue)
    case 'startsWith': return strVal.startsWith(ruleVal)
    case 'endsWith': return strVal.endsWith(ruleVal)
    default: return false
  }
}

/**
 * Calculate the score for a lead based on current rules.
 */
export function calculateLeadScore(lead) {
  const { rules } = getConfig()
  let score = 0
  const matchedRules = []

  for (const rule of rules) {
    const fieldValue = lead[rule.field]
    if (evaluateCondition(fieldValue, rule.condition, rule.value)) {
      score += rule.points
      matchedRules.push({ ...rule, fieldValue })
    }
  }

  score = Math.max(0, Math.min(100, score))

  return {
    score,
    grade: getGrade(score),
    matchedRules,
    color: getGradeColor(score),
  }
}

function getGrade(score) {
  const { thresholds } = getConfig()
  if (score >= thresholds.hot) return 'Hot'
  if (score >= thresholds.warm) return 'Warm'
  return 'Cold'
}

function getGradeColor(score) {
  const { thresholds } = getConfig()
  if (score >= thresholds.hot) return '#ef4444'
  if (score >= thresholds.warm) return '#f59e0b'
  return '#6b7280'
}

/**
 * Score multiple leads at once and sort by score descending.
 */
export function scoreLeads(leads) {
  return leads
    .map(lead => ({ ...lead, scoring: calculateLeadScore(lead) }))
    .sort((a, b) => b.scoring.score - a.scoring.score)
}

/**
 * Get all scoring rules.
 */
export function getScoringRules() {
  return getConfig().rules
}

/**
 * Update scoring rules.
 */
export function updateScoringRules(rules) {
  const config = getConfig()
  config.rules = rules
  saveConfig(config)
}

/**
 * Add a new scoring rule.
 */
export function addScoringRule(rule) {
  const config = getConfig()
  config.rules.push({
    ...rule,
    id: `r_${Date.now()}`,
  })
  saveConfig(config)
}

/**
 * Remove a scoring rule.
 */
export function removeScoringRule(id) {
  const config = getConfig()
  config.rules = config.rules.filter(r => r.id !== id)
  saveConfig(config)
}

/**
 * Get scoring thresholds.
 */
export function getThresholds() {
  return getConfig().thresholds
}

/**
 * Update scoring thresholds.
 */
export function updateThresholds(thresholds) {
  const config = getConfig()
  config.thresholds = { ...config.thresholds, ...thresholds }
  saveConfig(config)
}

export const CONDITION_OPTIONS = [
  { value: 'equals', label: 'Equals' },
  { value: 'notEquals', label: 'Not equals' },
  { value: 'contains', label: 'Contains' },
  { value: 'notContains', label: 'Does not contain' },
  { value: 'exists', label: 'Has a value' },
  { value: 'notExists', label: 'Is empty' },
  { value: 'greaterThan', label: 'Greater than' },
  { value: 'lessThan', label: 'Less than' },
  { value: 'startsWith', label: 'Starts with' },
  { value: 'endsWith', label: 'Ends with' },
]
