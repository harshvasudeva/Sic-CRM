/**
 * Stock Alert Store - manages low stock alerts and reorder points.
 */

const STORAGE_KEY = 'sic_crm_stock_alerts'

function getStore() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : { alerts: [], config: getDefaultConfig() }
  } catch {
    return { alerts: [], config: getDefaultConfig() }
  }
}

function getDefaultConfig() {
  return {
    enabled: true,
    checkInterval: 'daily',
    defaultReorderPoint: 10,
    defaultReorderQty: 50,
    notifyOnLow: true,
    notifyOnOutOfStock: true,
  }
}

function save(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

/**
 * Check stock levels and generate alerts.
 */
export function checkStockLevels(products) {
  const store = getStore()
  const alerts = []

  for (const product of products) {
    const qty = product.quantity || product.stock || 0
    const reorderPoint = product.reorderPoint || store.config.defaultReorderPoint
    const reorderQty = product.reorderQty || store.config.defaultReorderQty

    if (qty <= 0) {
      alerts.push({
        id: `alert_${product.id}_oos`,
        productId: product.id,
        productName: product.name || product.title,
        type: 'out_of_stock',
        severity: 'critical',
        currentStock: qty,
        reorderPoint,
        reorderQty,
        message: `${product.name || product.title} is out of stock`,
        createdAt: new Date().toISOString(),
      })
    } else if (qty <= reorderPoint) {
      alerts.push({
        id: `alert_${product.id}_low`,
        productId: product.id,
        productName: product.name || product.title,
        type: 'low_stock',
        severity: 'warning',
        currentStock: qty,
        reorderPoint,
        reorderQty,
        message: `${product.name || product.title} is low (${qty} remaining, reorder at ${reorderPoint})`,
        createdAt: new Date().toISOString(),
      })
    }
  }

  store.alerts = alerts
  store.lastChecked = new Date().toISOString()
  save(store)
  return alerts
}

export function getActiveAlerts() {
  return getStore().alerts
}

export function dismissAlert(alertId) {
  const store = getStore()
  store.alerts = store.alerts.filter(a => a.id !== alertId)
  save(store)
}

export function getAlertConfig() {
  return getStore().config
}

export function updateAlertConfig(config) {
  const store = getStore()
  store.config = { ...store.config, ...config }
  save(store)
}

export function setProductReorderPoint(productId, reorderPoint, reorderQty) {
  const store = getStore()
  if (!store.productOverrides) store.productOverrides = {}
  store.productOverrides[productId] = { reorderPoint, reorderQty }
  save(store)
}
