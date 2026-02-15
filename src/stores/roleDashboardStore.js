/**
 * Role-Based Dashboard Store - configure dashboards per user role.
 * Allows different roles to see different widgets and layouts.
 */

const STORAGE_KEY = 'sic_crm_role_dashboards'

const AVAILABLE_WIDGETS = [
  { id: 'revenue', label: 'Revenue Overview', module: 'sales', size: 'large' },
  { id: 'pipeline', label: 'Sales Pipeline', module: 'sales', size: 'large' },
  { id: 'leads', label: 'Lead Summary', module: 'crm', size: 'medium' },
  { id: 'activities', label: 'Recent Activities', module: 'crm', size: 'medium' },
  { id: 'invoices', label: 'Invoice Status', module: 'accounting', size: 'medium' },
  { id: 'expenses', label: 'Expense Tracker', module: 'accounting', size: 'medium' },
  { id: 'inventory', label: 'Stock Levels', module: 'inventory', size: 'medium' },
  { id: 'stockAlerts', label: 'Stock Alerts', module: 'inventory', size: 'small' },
  { id: 'employees', label: 'Employee Count', module: 'hr', size: 'small' },
  { id: 'attendance', label: 'Attendance Today', module: 'hr', size: 'small' },
  { id: 'leaves', label: 'Leave Requests', module: 'hr', size: 'medium' },
  { id: 'targets', label: 'Sales Targets', module: 'sales', size: 'medium' },
  { id: 'topDeals', label: 'Top Deals', module: 'crm', size: 'medium' },
  { id: 'forecast', label: 'Sales Forecast', module: 'sales', size: 'large' },
  { id: 'production', label: 'Production Orders', module: 'manufacturing', size: 'medium' },
  { id: 'vendors', label: 'Vendor Performance', module: 'purchase', size: 'medium' },
  { id: 'tasks', label: 'My Tasks', module: 'general', size: 'medium' },
  { id: 'calendar', label: 'Calendar', module: 'general', size: 'large' },
  { id: 'announcements', label: 'Announcements', module: 'hr', size: 'small' },
  { id: 'quickActions', label: 'Quick Actions', module: 'general', size: 'small' },
]

const DEFAULT_ROLE_CONFIGS = {
  admin: {
    name: 'Administrator',
    widgets: ['revenue', 'pipeline', 'leads', 'invoices', 'employees', 'stockAlerts', 'forecast', 'tasks'],
  },
  salesManager: {
    name: 'Sales Manager',
    widgets: ['revenue', 'pipeline', 'targets', 'topDeals', 'forecast', 'leads', 'activities', 'quickActions'],
  },
  salesRep: {
    name: 'Sales Representative',
    widgets: ['pipeline', 'leads', 'activities', 'targets', 'tasks', 'quickActions'],
  },
  accountant: {
    name: 'Accountant',
    widgets: ['invoices', 'expenses', 'revenue', 'quickActions'],
  },
  hrManager: {
    name: 'HR Manager',
    widgets: ['employees', 'attendance', 'leaves', 'announcements', 'tasks'],
  },
  inventoryManager: {
    name: 'Inventory Manager',
    widgets: ['inventory', 'stockAlerts', 'production', 'vendors', 'tasks'],
  },
  executive: {
    name: 'Executive',
    widgets: ['revenue', 'forecast', 'pipeline', 'employees', 'expenses', 'calendar'],
  },
}

function getStore() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
    const defaults = { roles: DEFAULT_ROLE_CONFIGS, currentRole: 'admin' }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaults))
    return defaults
  } catch {
    return { roles: DEFAULT_ROLE_CONFIGS, currentRole: 'admin' }
  }
}

function save(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function getCurrentRole() {
  return getStore().currentRole
}

export function setCurrentRole(role) {
  const store = getStore()
  store.currentRole = role
  save(store)
}

export function getRoleConfig(role) {
  const store = getStore()
  return store.roles[role] || store.roles.admin
}

export function getDashboardWidgets(role) {
  const config = getRoleConfig(role || getCurrentRole())
  return config.widgets
    .map(id => AVAILABLE_WIDGETS.find(w => w.id === id))
    .filter(Boolean)
}

export function updateRoleWidgets(role, widgets) {
  const store = getStore()
  if (!store.roles[role]) store.roles[role] = { name: role, widgets: [] }
  store.roles[role].widgets = widgets
  save(store)
}

export function addWidgetToRole(role, widgetId) {
  const store = getStore()
  if (!store.roles[role]) return
  if (!store.roles[role].widgets.includes(widgetId)) {
    store.roles[role].widgets.push(widgetId)
    save(store)
  }
}

export function removeWidgetFromRole(role, widgetId) {
  const store = getStore()
  if (!store.roles[role]) return
  store.roles[role].widgets = store.roles[role].widgets.filter(id => id !== widgetId)
  save(store)
}

export function getAllRoles() {
  return Object.entries(getStore().roles).map(([key, val]) => ({
    id: key,
    ...val,
  }))
}

export function createRole(id, config) {
  const store = getStore()
  store.roles[id] = config
  save(store)
}

export { AVAILABLE_WIDGETS }
