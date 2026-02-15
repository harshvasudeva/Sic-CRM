/**
 * Notification Store - actionable in-app notifications.
 * Notifications can have actions (e.g., "View Invoice", "Approve Leave").
 */

const STORAGE_KEY = 'sic_crm_notifications'

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

/**
 * Add a new notification.
 */
export function addNotification(notification) {
  const store = getStore()
  const newNotif = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    type: notification.type || 'info', // info, success, warning, error, action
    title: notification.title,
    message: notification.message,
    module: notification.module || 'general',
    actionLabel: notification.actionLabel,
    actionPath: notification.actionPath,
    read: false,
    createdAt: new Date().toISOString(),
    ...notification,
  }
  store.unshift(newNotif)

  // Keep max 100 notifications
  if (store.length > 100) store.length = 100

  save(store)
  return newNotif
}

/**
 * Get all notifications.
 */
export function getNotifications(filters = {}) {
  let notifs = getStore()
  if (filters.unreadOnly) notifs = notifs.filter(n => !n.read)
  if (filters.module) notifs = notifs.filter(n => n.module === filters.module)
  if (filters.type) notifs = notifs.filter(n => n.type === filters.type)
  return notifs
}

/**
 * Get unread count.
 */
export function getUnreadCount() {
  return getStore().filter(n => !n.read).length
}

/**
 * Mark a notification as read.
 */
export function markAsRead(notifId) {
  const store = getStore()
  const notif = store.find(n => n.id === notifId)
  if (notif) {
    notif.read = true
    notif.readAt = new Date().toISOString()
    save(store)
  }
}

/**
 * Mark all notifications as read.
 */
export function markAllAsRead() {
  const store = getStore()
  const now = new Date().toISOString()
  store.forEach(n => {
    if (!n.read) {
      n.read = true
      n.readAt = now
    }
  })
  save(store)
}

/**
 * Delete a notification.
 */
export function deleteNotification(notifId) {
  save(getStore().filter(n => n.id !== notifId))
}

/**
 * Clear all notifications.
 */
export function clearAllNotifications() {
  save([])
}

/**
 * Add common notification types.
 */
export function notifyInvoiceCreated(invoiceNumber, amount) {
  return addNotification({
    type: 'success',
    title: 'Invoice Created',
    message: `Invoice ${invoiceNumber} for ${amount} has been created`,
    module: 'sales',
    actionLabel: 'View Invoice',
    actionPath: '/sales/invoices',
  })
}

export function notifyLeadAssigned(leadName) {
  return addNotification({
    type: 'info',
    title: 'New Lead Assigned',
    message: `${leadName} has been assigned to you`,
    module: 'crm',
    actionLabel: 'View Lead',
    actionPath: '/crm/leads',
  })
}

export function notifyLowStock(productName, currentStock) {
  return addNotification({
    type: 'warning',
    title: 'Low Stock Alert',
    message: `${productName} is low on stock (${currentStock} remaining)`,
    module: 'inventory',
    actionLabel: 'View Inventory',
    actionPath: '/inventory',
  })
}

export function notifyLeaveRequest(employeeName) {
  return addNotification({
    type: 'action',
    title: 'Leave Request',
    message: `${employeeName} has requested leave`,
    module: 'hr',
    actionLabel: 'Review',
    actionPath: '/hr/leaves',
  })
}

export function notifyPaymentReceived(customerName, amount) {
  return addNotification({
    type: 'success',
    title: 'Payment Received',
    message: `Payment of ${amount} received from ${customerName}`,
    module: 'accounting',
    actionLabel: 'View Details',
    actionPath: '/accounting/receivable',
  })
}
