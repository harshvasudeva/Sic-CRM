/**
 * Vendor Scorecard Store - rate and evaluate vendors on multiple criteria.
 */

const STORAGE_KEY = 'sic_crm_vendor_scorecards'

const CRITERIA = [
  { id: 'quality', label: 'Product Quality', weight: 25 },
  { id: 'delivery', label: 'On-time Delivery', weight: 20 },
  { id: 'pricing', label: 'Competitive Pricing', weight: 20 },
  { id: 'communication', label: 'Communication', weight: 15 },
  { id: 'reliability', label: 'Reliability', weight: 10 },
  { id: 'flexibility', label: 'Flexibility', weight: 10 },
]

function getStore() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : { scorecards: {}, criteria: CRITERIA }
  } catch {
    return { scorecards: {}, criteria: CRITERIA }
  }
}

function save(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

/**
 * Rate a vendor on all criteria.
 * @param {string} vendorId
 * @param {Object} ratings - { quality: 4, delivery: 3, ... } (1-5 scale)
 * @param {string} notes - Optional review notes
 */
export function rateVendor(vendorId, ratings, notes = '') {
  const store = getStore()
  if (!store.scorecards[vendorId]) {
    store.scorecards[vendorId] = { reviews: [], vendorId }
  }

  const review = {
    id: `rev_${Date.now()}`,
    ratings,
    notes,
    weightedScore: calculateWeightedScore(ratings, store.criteria),
    createdAt: new Date().toISOString(),
  }

  store.scorecards[vendorId].reviews.push(review)
  store.scorecards[vendorId].averageScore = calculateAverageScore(store.scorecards[vendorId].reviews)
  store.scorecards[vendorId].lastReviewed = review.createdAt

  save(store)
  return review
}

function calculateWeightedScore(ratings, criteria) {
  let total = 0
  let totalWeight = 0

  for (const criterion of criteria) {
    const rating = ratings[criterion.id]
    if (rating !== undefined) {
      total += (rating / 5) * criterion.weight
      totalWeight += criterion.weight
    }
  }

  return totalWeight > 0 ? Math.round((total / totalWeight) * 100) : 0
}

function calculateAverageScore(reviews) {
  if (reviews.length === 0) return 0
  const total = reviews.reduce((sum, r) => sum + r.weightedScore, 0)
  return Math.round(total / reviews.length)
}

/**
 * Get a vendor's scorecard with all reviews.
 */
export function getVendorScorecard(vendorId) {
  const store = getStore()
  return store.scorecards[vendorId] || { reviews: [], vendorId, averageScore: 0 }
}

/**
 * Get all vendor scorecards ranked by score.
 */
export function getAllScorecards() {
  const store = getStore()
  return Object.values(store.scorecards)
    .sort((a, b) => (b.averageScore || 0) - (a.averageScore || 0))
}

/**
 * Get the grading criteria.
 */
export function getCriteria() {
  return getStore().criteria
}

/**
 * Update grading criteria weights.
 */
export function updateCriteria(criteria) {
  const store = getStore()
  store.criteria = criteria
  save(store)
}

/**
 * Get grade label from score.
 */
export function getGradeFromScore(score) {
  if (score >= 90) return { grade: 'A', label: 'Excellent', color: '#22c55e' }
  if (score >= 75) return { grade: 'B', label: 'Good', color: '#3b82f6' }
  if (score >= 60) return { grade: 'C', label: 'Average', color: '#eab308' }
  if (score >= 40) return { grade: 'D', label: 'Below Average', color: '#f97316' }
  return { grade: 'F', label: 'Poor', color: '#ef4444' }
}
