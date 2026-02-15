/**
 * Product Bundle (Kitting) Store - manage product bundles/kits.
 * Bundles are groups of products sold together at a bundled price.
 */

const STORAGE_KEY = 'sic_crm_product_bundles'

function getStore() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function save(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function getBundles() {
  return getStore()
}

export function getBundle(id) {
  return getStore().find(b => b.id === id)
}

export function createBundle(bundle) {
  const store = getStore()
  const totals = calculateBundleTotals(bundle.items || [])
  const newBundle = {
    ...bundle,
    id: `bnd_${Date.now()}`,
    ...totals,
    status: bundle.status || 'active',
    createdAt: new Date().toISOString(),
  }
  store.push(newBundle)
  save(store)
  return newBundle
}

export function updateBundle(id, updates) {
  const store = getStore()
  const idx = store.findIndex(b => b.id === id)
  if (idx === -1) return null
  const totals = updates.items ? calculateBundleTotals(updates.items) : {}
  store[idx] = { ...store[idx], ...updates, ...totals, updatedAt: new Date().toISOString() }
  save(store)
  return store[idx]
}

export function deleteBundle(id) {
  save(getStore().filter(b => b.id !== id))
}

export function calculateBundleTotals(items) {
  const individualTotal = items.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0)
  const bundlePrice = items.reduce((sum, item) => sum + (item.bundlePrice || item.price || 0) * (item.quantity || 1), 0)
  const savings = individualTotal - bundlePrice
  const savingsPercent = individualTotal > 0 ? (savings / individualTotal * 100) : 0

  return {
    individualTotal,
    bundlePrice,
    savings,
    savingsPercent: Math.round(savingsPercent * 100) / 100,
    itemCount: items.reduce((sum, item) => sum + (item.quantity || 1), 0),
  }
}

export function addItemToBundle(bundleId, item) {
  const bundle = getBundle(bundleId)
  if (!bundle) return null
  const items = [...(bundle.items || []), { ...item, id: `bi_${Date.now()}` }]
  return updateBundle(bundleId, { items })
}

export function removeItemFromBundle(bundleId, itemId) {
  const bundle = getBundle(bundleId)
  if (!bundle) return null
  const items = (bundle.items || []).filter(i => i.id !== itemId)
  return updateBundle(bundleId, { items })
}
