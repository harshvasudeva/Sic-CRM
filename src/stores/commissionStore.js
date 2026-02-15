/**
 * Commission Calculator Store - manages sales commission rules and calculations.
 */

const STORAGE_KEY = 'sic_crm_commissions'

const DEFAULT_RULES = [
  { id: 'c1', name: 'Base Commission', type: 'percentage', value: 5, minDealValue: 0, maxDealValue: Infinity, product: '*', active: true },
  { id: 'c2', name: 'Premium Deals (>1L)', type: 'percentage', value: 7, minDealValue: 100000, maxDealValue: Infinity, product: '*', active: true },
  { id: 'c3', name: 'Enterprise Deals (>5L)', type: 'percentage', value: 10, minDealValue: 500000, maxDealValue: Infinity, product: '*', active: true },
  { id: 'c4', name: 'Referral Bonus', type: 'flat', value: 2000, minDealValue: 0, maxDealValue: Infinity, product: '*', source: 'Referral', active: true },
]

const DEFAULT_TIERS = [
  { id: 't1', name: 'Bronze', minTarget: 0, maxTarget: 50, multiplier: 1.0 },
  { id: 't2', name: 'Silver', minTarget: 50, maxTarget: 80, multiplier: 1.15 },
  { id: 't3', name: 'Gold', minTarget: 80, maxTarget: 100, multiplier: 1.3 },
  { id: 't4', name: 'Platinum', minTarget: 100, maxTarget: Infinity, multiplier: 1.5 },
]

function getConfig() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
    return { rules: DEFAULT_RULES, tiers: DEFAULT_TIERS }
  } catch {
    return { rules: DEFAULT_RULES, tiers: DEFAULT_TIERS }
  }
}

function saveConfig(config) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
}

/**
 * Calculate commission for a single deal.
 */
export function calculateCommission(deal) {
  const { rules } = getConfig()
  let commission = 0
  const appliedRules = []

  for (const rule of rules) {
    if (!rule.active) continue
    const dealValue = deal.value || deal.amount || 0

    if (dealValue < rule.minDealValue) continue
    if (dealValue > rule.maxDealValue) continue
    if (rule.product !== '*' && deal.product !== rule.product) continue
    if (rule.source && deal.source !== rule.source) continue

    let ruleCommission = 0
    if (rule.type === 'percentage') {
      ruleCommission = dealValue * (rule.value / 100)
    } else {
      ruleCommission = rule.value
    }

    if (ruleCommission > commission) {
      commission = ruleCommission
      appliedRules.length = 0
      appliedRules.push({ ...rule, calculated: ruleCommission })
    }
  }

  return { commission: Math.round(commission * 100) / 100, appliedRules }
}

/**
 * Calculate commission with target achievement tier multiplier.
 */
export function calculateWithTier(deal, targetAchievementPercent) {
  const { tiers } = getConfig()
  const base = calculateCommission(deal)

  const tier = tiers.find(t => targetAchievementPercent >= t.minTarget && targetAchievementPercent < t.maxTarget) || tiers[0]

  return {
    ...base,
    tier: tier.name,
    multiplier: tier.multiplier,
    finalCommission: Math.round(base.commission * tier.multiplier * 100) / 100,
  }
}

/**
 * Calculate total commissions for a sales rep over a list of deals.
 */
export function calculateTotalCommissions(deals, targetAchievementPercent = 100) {
  let total = 0
  const breakdown = []

  for (const deal of deals) {
    const result = calculateWithTier(deal, targetAchievementPercent)
    total += result.finalCommission
    breakdown.push({ deal, ...result })
  }

  return { total: Math.round(total * 100) / 100, breakdown }
}

export function getCommissionRules() {
  return getConfig().rules
}

export function updateCommissionRules(rules) {
  const config = getConfig()
  config.rules = rules
  saveConfig(config)
}

export function addCommissionRule(rule) {
  const config = getConfig()
  config.rules.push({ ...rule, id: `c_${Date.now()}`, active: true })
  saveConfig(config)
}

export function removeCommissionRule(id) {
  const config = getConfig()
  config.rules = config.rules.filter(r => r.id !== id)
  saveConfig(config)
}

export function getCommissionTiers() {
  return getConfig().tiers
}

export function updateCommissionTiers(tiers) {
  const config = getConfig()
  config.tiers = tiers
  saveConfig(config)
}
