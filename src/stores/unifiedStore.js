/**
 * Unified Store - Consolidated data layer for the CRM platform.
 *
 * Roadmap items A1-A15, A20-A25:
 *   - Unified Partners Table (customers, vendors, influencers, employees)
 *   - Centralized Address Book with address-type tags
 *   - Polymorphic Attachments Repository
 *   - Unified Activities Timeline
 *   - Universal Commentary System with @mentions
 *   - Polymorphic Tags System
 *   - Centralized Notification Hub
 *   - Universal Approval Workflows (state machine)
 *   - Universal Status Master
 *   - Shared Location / Warehouse Model
 *   - EAV Custom Fields Extensions
 *   - Financial Period Locks
 *   - Daily Materialized Metrics Cache
 *
 * Storage: localStorage-first with future API fallback.
 */

// ============================================================
//  Storage helpers
// ============================================================

const STORAGE_KEYS = {
  partners: 'sic-crm-partners',
  addresses: 'sic-crm-addresses',
  attachments: 'sic-crm-attachments',
  activities: 'sic-crm-activities-unified',
  comments: 'sic-crm-comments',
  tags: 'sic-crm-tags',
  notifications: 'sic-crm-notifications',
  approvalWorkflows: 'sic-crm-approvals',
  statusMaster: 'sic-crm-status-master',
  locations: 'sic-crm-locations',
  eavFields: 'sic-crm-eav-fields',
  eavValues: 'sic-crm-eav-values',
  financialPeriodLocks: 'sic-crm-period-locks',
  metricsCache: 'sic-crm-metrics-cache',
}

function getStore(key, initial) {
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : initial
  } catch {
    return initial
  }
}

function setStore(key, data) {
  localStorage.setItem(key, JSON.stringify(data))
}

/** Generate a unique ID with a given prefix. */
function uid(prefix = 'id') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

/** Current ISO timestamp. */
function now() {
  return new Date().toISOString()
}

/** Current date string YYYY-MM-DD. */
function today() {
  return new Date().toISOString().split('T')[0]
}

// ============================================================
//  PARTNER TYPES  (enum)
// ============================================================

export const PARTNER_TYPES = {
  CUSTOMER: 'customer',
  VENDOR: 'vendor',
  INFLUENCER: 'influencer',
  EMPLOYEE: 'employee',
}

// ============================================================
//  A1 - PARTNERS  (Unified Customers + Vendors + Influencers)
// ============================================================

const initialPartners = [
  {
    id: 'ptn-001',
    type: 'customer',
    name: 'Acme Corp',
    displayName: 'Acme Corporation',
    email: 'info@acmecorp.com',
    phone: '+1-555-0100',
    mobile: '+1-555-0101',
    website: 'https://acmecorp.com',
    taxId: 'US-TAX-12345',
    industry: 'Technology',
    companySize: '50-200',
    creditLimit: 50000,
    paymentTerms: 'Net 30',
    currency: 'USD',
    notes: 'Key enterprise customer since 2024',
    isActive: true,
    tags: ['enterprise', 'priority'],
    createdAt: '2025-06-15T09:00:00Z',
    updatedAt: '2026-01-20T14:30:00Z',
    createdBy: 'emp-001',
  },
  {
    id: 'ptn-002',
    type: 'vendor',
    name: 'Global Supplies Ltd',
    displayName: 'Global Supplies',
    email: 'orders@globalsupplies.com',
    phone: '+44-20-7946-0958',
    mobile: null,
    website: 'https://globalsupplies.co.uk',
    taxId: 'GB-VAT-987654',
    industry: 'Manufacturing',
    companySize: '200-500',
    creditLimit: 0,
    paymentTerms: 'Net 45',
    currency: 'GBP',
    notes: 'Primary raw materials supplier',
    isActive: true,
    tags: ['raw-materials', 'uk-supplier'],
    createdAt: '2025-03-10T11:00:00Z',
    updatedAt: '2026-02-01T10:00:00Z',
    createdBy: 'emp-001',
  },
  {
    id: 'ptn-003',
    type: 'influencer',
    name: 'Sarah Digital',
    displayName: 'Sarah Digital Marketing',
    email: 'sarah@sarahdigital.io',
    phone: '+1-555-0303',
    mobile: '+1-555-0304',
    website: 'https://sarahdigital.io',
    taxId: null,
    industry: 'Marketing',
    companySize: '1-10',
    creditLimit: 0,
    paymentTerms: 'Due on Receipt',
    currency: 'USD',
    notes: 'Instagram & YouTube influencer, 250K followers',
    isActive: true,
    tags: ['social-media', 'youtube', 'instagram'],
    createdAt: '2025-11-01T08:00:00Z',
    updatedAt: '2026-01-15T16:00:00Z',
    createdBy: 'emp-002',
  },
  {
    id: 'ptn-004',
    type: 'customer',
    name: 'RetailMax Inc',
    displayName: 'RetailMax',
    email: 'procurement@retailmax.com',
    phone: '+1-555-0400',
    mobile: null,
    website: 'https://retailmax.com',
    taxId: 'US-TAX-67890',
    industry: 'Retail',
    companySize: '500-1000',
    creditLimit: 100000,
    paymentTerms: 'Net 60',
    currency: 'USD',
    notes: 'Large retail chain, quarterly orders',
    isActive: true,
    tags: ['retail', 'enterprise', 'bulk-buyer'],
    createdAt: '2025-01-20T10:00:00Z',
    updatedAt: '2026-02-10T09:00:00Z',
    createdBy: 'emp-001',
  },
  {
    id: 'ptn-005',
    type: 'employee',
    name: 'Ravi Sharma',
    displayName: 'Ravi Sharma',
    email: 'ravi.sharma@company.com',
    phone: '+91-98765-43210',
    mobile: '+91-98765-43210',
    website: null,
    taxId: 'IN-PAN-ABCDE1234F',
    industry: null,
    companySize: null,
    creditLimit: 0,
    paymentTerms: null,
    currency: 'INR',
    notes: 'Senior Sales Manager, Mumbai office',
    isActive: true,
    tags: ['sales-team', 'mumbai'],
    createdAt: '2024-08-01T06:00:00Z',
    updatedAt: '2026-02-20T12:00:00Z',
    createdBy: 'emp-001',
  },
]

/**
 * Get all partners, optionally filtered.
 * @param {{ type?: string, isActive?: boolean, search?: string }} [filters]
 * @returns {Array} List of partner objects.
 */
export function getPartners(filters = {}) {
  let data = getStore(STORAGE_KEYS.partners, initialPartners)
  if (filters.type) data = data.filter((p) => p.type === filters.type)
  if (filters.isActive !== undefined) data = data.filter((p) => p.isActive === filters.isActive)
  if (filters.search) {
    const q = filters.search.toLowerCase()
    data = data.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.displayName && p.displayName.toLowerCase().includes(q)) ||
        (p.email && p.email.toLowerCase().includes(q))
    )
  }
  if (filters.tags && filters.tags.length) {
    data = data.filter((p) => filters.tags.some((t) => (p.tags || []).includes(t)))
  }
  return data
}

/** Convenience accessors by type. */
export function getCustomers(filters = {}) {
  return getPartners({ ...filters, type: PARTNER_TYPES.CUSTOMER })
}
export function getVendors(filters = {}) {
  return getPartners({ ...filters, type: PARTNER_TYPES.VENDOR })
}
export function getInfluencers(filters = {}) {
  return getPartners({ ...filters, type: PARTNER_TYPES.INFLUENCER })
}
export function getEmployeePartners(filters = {}) {
  return getPartners({ ...filters, type: PARTNER_TYPES.EMPLOYEE })
}

/**
 * Get a single partner by ID.
 * @param {string} id
 * @returns {object|null}
 */
export function getPartnerById(id) {
  return getStore(STORAGE_KEYS.partners, initialPartners).find((p) => p.id === id) || null
}

/**
 * Create a new partner.
 * @param {object} data
 * @returns {object} The created partner.
 */
export function createPartner(data) {
  const partners = getStore(STORAGE_KEYS.partners, initialPartners)
  const partner = {
    id: uid('ptn'),
    type: data.type || PARTNER_TYPES.CUSTOMER,
    name: data.name || '',
    displayName: data.displayName || data.name || '',
    email: data.email || null,
    phone: data.phone || null,
    mobile: data.mobile || null,
    website: data.website || null,
    taxId: data.taxId || null,
    industry: data.industry || null,
    companySize: data.companySize || null,
    creditLimit: data.creditLimit || 0,
    paymentTerms: data.paymentTerms || 'Net 30',
    currency: data.currency || 'USD',
    notes: data.notes || '',
    isActive: data.isActive !== undefined ? data.isActive : true,
    tags: data.tags || [],
    createdAt: now(),
    updatedAt: now(),
    createdBy: data.createdBy || null,
    ...data,
    id: uid('ptn'),
  }
  partners.push(partner)
  setStore(STORAGE_KEYS.partners, partners)
  return partner
}

/**
 * Update an existing partner.
 * @param {string} id
 * @param {object} data Fields to update.
 * @returns {object|null}
 */
export function updatePartner(id, data) {
  const partners = getStore(STORAGE_KEYS.partners, initialPartners)
  const idx = partners.findIndex((p) => p.id === id)
  if (idx === -1) return null
  partners[idx] = { ...partners[idx], ...data, updatedAt: now() }
  setStore(STORAGE_KEYS.partners, partners)
  return partners[idx]
}

/**
 * Delete a partner by ID.
 * @param {string} id
 * @returns {boolean}
 */
export function deletePartner(id) {
  const partners = getStore(STORAGE_KEYS.partners, initialPartners).filter((p) => p.id !== id)
  setStore(STORAGE_KEYS.partners, partners)
  return true
}

// ============================================================
//  A2 - ADDRESSES  (Centralized Address Book)
// ============================================================

export const ADDRESS_TYPES = {
  BILLING: 'billing',
  SHIPPING: 'shipping',
  WAREHOUSE: 'warehouse',
  OFFICE: 'office',
  HOME: 'home',
}

const initialAddresses = [
  {
    id: 'addr-001',
    partnerId: 'ptn-001',
    companyId: null,
    label: 'HQ Billing',
    addressType: 'billing',
    line1: '123 Innovation Drive',
    line2: 'Suite 400',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94105',
    country: 'US',
    isPrimary: true,
    createdAt: '2025-06-15T09:00:00Z',
  },
  {
    id: 'addr-002',
    partnerId: 'ptn-001',
    companyId: null,
    label: 'Warehouse West',
    addressType: 'shipping',
    line1: '456 Logistics Blvd',
    line2: 'Dock 7',
    city: 'Oakland',
    state: 'CA',
    postalCode: '94607',
    country: 'US',
    isPrimary: false,
    createdAt: '2025-06-15T09:00:00Z',
  },
  {
    id: 'addr-003',
    partnerId: 'ptn-002',
    companyId: null,
    label: 'UK Office',
    addressType: 'billing',
    line1: '10 Downing Industrial Park',
    line2: 'Unit 3',
    city: 'London',
    state: 'Greater London',
    postalCode: 'SW1A 1AA',
    country: 'GB',
    isPrimary: true,
    createdAt: '2025-03-10T11:00:00Z',
  },
  {
    id: 'addr-004',
    partnerId: 'ptn-004',
    companyId: null,
    label: 'RetailMax DC',
    addressType: 'warehouse',
    line1: '789 Distribution Center Rd',
    line2: null,
    city: 'Dallas',
    state: 'TX',
    postalCode: '75201',
    country: 'US',
    isPrimary: false,
    createdAt: '2025-01-20T10:00:00Z',
  },
  {
    id: 'addr-005',
    partnerId: 'ptn-005',
    companyId: null,
    label: 'Mumbai Home',
    addressType: 'home',
    line1: '42 Palm Beach Road',
    line2: 'Apt 14B',
    city: 'Mumbai',
    state: 'Maharashtra',
    postalCode: '400001',
    country: 'IN',
    isPrimary: true,
    createdAt: '2024-08-01T06:00:00Z',
  },
]

/**
 * Get addresses filtered by partnerId, companyId, or addressType.
 * @param {{ partnerId?: string, companyId?: string, addressType?: string }} [filters]
 * @returns {Array}
 */
export function getAddresses(filters = {}) {
  let data = getStore(STORAGE_KEYS.addresses, initialAddresses)
  if (filters.partnerId) data = data.filter((a) => a.partnerId === filters.partnerId)
  if (filters.companyId) data = data.filter((a) => a.companyId === filters.companyId)
  if (filters.addressType) data = data.filter((a) => a.addressType === filters.addressType)
  return data
}

/** @param {string} id */
export function getAddressById(id) {
  return getStore(STORAGE_KEYS.addresses, initialAddresses).find((a) => a.id === id) || null
}

/**
 * Create a new address linked to a partner or company.
 * @param {object} data
 * @returns {object}
 */
export function createAddress(data) {
  const addresses = getStore(STORAGE_KEYS.addresses, initialAddresses)
  const address = {
    id: uid('addr'),
    partnerId: data.partnerId || null,
    companyId: data.companyId || null,
    label: data.label || '',
    addressType: data.addressType || ADDRESS_TYPES.BILLING,
    line1: data.line1 || '',
    line2: data.line2 || null,
    city: data.city || '',
    state: data.state || '',
    postalCode: data.postalCode || '',
    country: data.country || '',
    isPrimary: data.isPrimary || false,
    createdAt: now(),
    ...data,
    id: uid('addr'),
  }
  addresses.push(address)
  setStore(STORAGE_KEYS.addresses, addresses)
  return address
}

/** @param {string} id  @param {object} data */
export function updateAddress(id, data) {
  const addresses = getStore(STORAGE_KEYS.addresses, initialAddresses)
  const idx = addresses.findIndex((a) => a.id === id)
  if (idx === -1) return null
  addresses[idx] = { ...addresses[idx], ...data, updatedAt: now() }
  setStore(STORAGE_KEYS.addresses, addresses)
  return addresses[idx]
}

/** @param {string} id */
export function deleteAddress(id) {
  const addresses = getStore(STORAGE_KEYS.addresses, initialAddresses).filter((a) => a.id !== id)
  setStore(STORAGE_KEYS.addresses, addresses)
  return true
}

/**
 * Get the primary address for a partner.
 * @param {string} partnerId
 * @param {string} [addressType]
 * @returns {object|null}
 */
export function getPrimaryAddress(partnerId, addressType) {
  const addresses = getAddresses({ partnerId, addressType })
  return addresses.find((a) => a.isPrimary) || addresses[0] || null
}

// ============================================================
//  A3 - ATTACHMENTS  (Polymorphic Attachments Repository)
// ============================================================

const initialAttachments = [
  {
    id: 'att-001',
    entityType: 'partner',
    entityId: 'ptn-001',
    fileName: 'AcmeCorp_Contract_2025.pdf',
    fileType: 'application/pdf',
    fileSize: 245760,
    url: '/uploads/AcmeCorp_Contract_2025.pdf',
    thumbnailUrl: null,
    category: 'contract',
    description: 'Master service agreement 2025-2026',
    uploadedBy: 'emp-001',
    createdAt: '2025-06-20T14:00:00Z',
  },
  {
    id: 'att-002',
    entityType: 'partner',
    entityId: 'ptn-002',
    fileName: 'GlobalSupplies_Invoice_Jan2026.pdf',
    fileType: 'application/pdf',
    fileSize: 102400,
    url: '/uploads/GlobalSupplies_Invoice_Jan2026.pdf',
    thumbnailUrl: null,
    category: 'invoice',
    description: 'January 2026 raw materials invoice',
    uploadedBy: 'emp-002',
    createdAt: '2026-01-31T12:00:00Z',
  },
  {
    id: 'att-003',
    entityType: 'opportunity',
    entityId: 'opp-001',
    fileName: 'Proposal_Q1_Enterprise.pptx',
    fileType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    fileSize: 3145728,
    url: '/uploads/Proposal_Q1_Enterprise.pptx',
    thumbnailUrl: null,
    category: 'proposal',
    description: 'Q1 enterprise deal proposal deck',
    uploadedBy: 'emp-002',
    createdAt: '2026-01-10T10:00:00Z',
  },
]

/**
 * Get attachments for an entity (polymorphic).
 * @param {{ entityType?: string, entityId?: string, category?: string }} [filters]
 * @returns {Array}
 */
export function getAttachments(filters = {}) {
  let data = getStore(STORAGE_KEYS.attachments, initialAttachments)
  if (filters.entityType) data = data.filter((a) => a.entityType === filters.entityType)
  if (filters.entityId) data = data.filter((a) => a.entityId === filters.entityId)
  if (filters.category) data = data.filter((a) => a.category === filters.category)
  return data
}

/** @param {string} id */
export function getAttachmentById(id) {
  return getStore(STORAGE_KEYS.attachments, initialAttachments).find((a) => a.id === id) || null
}

/**
 * Track a new attachment upload.
 * @param {object} data Must include entityType, entityId, fileName.
 * @returns {object}
 */
export function createAttachment(data) {
  const attachments = getStore(STORAGE_KEYS.attachments, initialAttachments)
  const attachment = {
    id: uid('att'),
    entityType: data.entityType,
    entityId: data.entityId,
    fileName: data.fileName || 'untitled',
    fileType: data.fileType || 'application/octet-stream',
    fileSize: data.fileSize || 0,
    url: data.url || null,
    thumbnailUrl: data.thumbnailUrl || null,
    category: data.category || 'general',
    description: data.description || '',
    uploadedBy: data.uploadedBy || null,
    createdAt: now(),
    ...data,
    id: uid('att'),
  }
  attachments.push(attachment)
  setStore(STORAGE_KEYS.attachments, attachments)
  return attachment
}

/** @param {string} id  @param {object} data */
export function updateAttachment(id, data) {
  const attachments = getStore(STORAGE_KEYS.attachments, initialAttachments)
  const idx = attachments.findIndex((a) => a.id === id)
  if (idx === -1) return null
  attachments[idx] = { ...attachments[idx], ...data, updatedAt: now() }
  setStore(STORAGE_KEYS.attachments, attachments)
  return attachments[idx]
}

/** @param {string} id */
export function deleteAttachment(id) {
  const attachments = getStore(STORAGE_KEYS.attachments, initialAttachments).filter((a) => a.id !== id)
  setStore(STORAGE_KEYS.attachments, attachments)
  return true
}

/**
 * Count attachments for a given entity.
 * @param {string} entityType
 * @param {string} entityId
 * @returns {number}
 */
export function countAttachments(entityType, entityId) {
  return getAttachments({ entityType, entityId }).length
}

// ============================================================
//  A4 - ACTIVITIES  (Unified Activities Timeline)
// ============================================================

export const ACTIVITY_TYPES = {
  CALL: 'call',
  EMAIL: 'email',
  MEETING: 'meeting',
  NOTE: 'note',
  TASK: 'task',
}

const initialActivities = [
  {
    id: 'uact-001',
    entityType: 'partner',
    entityId: 'ptn-001',
    activityType: 'call',
    subject: 'Quarterly review call',
    description: 'Discussed Q4 performance and Q1 plans. Client satisfied with service.',
    outcome: 'Positive - renewal confirmed',
    dueDate: '2026-01-15',
    completedAt: '2026-01-15T15:30:00Z',
    isCompleted: true,
    priority: 'high',
    assignedTo: 'emp-002',
    duration: 45,
    createdBy: 'emp-002',
    createdAt: '2026-01-14T09:00:00Z',
    updatedAt: '2026-01-15T15:30:00Z',
  },
  {
    id: 'uact-002',
    entityType: 'partner',
    entityId: 'ptn-004',
    activityType: 'email',
    subject: 'Price list update for Q1 2026',
    description: 'Sent updated price list with 5% volume discount for orders over $50K.',
    outcome: null,
    dueDate: '2026-01-20',
    completedAt: '2026-01-20T11:00:00Z',
    isCompleted: true,
    priority: 'medium',
    assignedTo: 'emp-002',
    duration: null,
    createdBy: 'emp-002',
    createdAt: '2026-01-18T10:00:00Z',
    updatedAt: '2026-01-20T11:00:00Z',
  },
  {
    id: 'uact-003',
    entityType: 'opportunity',
    entityId: 'opp-001',
    activityType: 'meeting',
    subject: 'Demo presentation for Enterprise Suite',
    description: 'On-site demo at Acme Corp HQ. Attendees: CTO, VP Engineering, IT Director.',
    outcome: null,
    dueDate: '2026-02-28',
    completedAt: null,
    isCompleted: false,
    priority: 'high',
    assignedTo: 'emp-002',
    duration: 120,
    createdBy: 'emp-001',
    createdAt: '2026-02-10T08:00:00Z',
    updatedAt: '2026-02-10T08:00:00Z',
  },
  {
    id: 'uact-004',
    entityType: 'partner',
    entityId: 'ptn-003',
    activityType: 'task',
    subject: 'Review influencer campaign brief',
    description: 'Review and approve the Q1 campaign brief from Sarah Digital.',
    outcome: null,
    dueDate: '2026-02-25',
    completedAt: null,
    isCompleted: false,
    priority: 'medium',
    assignedTo: 'emp-003',
    duration: null,
    createdBy: 'emp-001',
    createdAt: '2026-02-15T09:00:00Z',
    updatedAt: '2026-02-15T09:00:00Z',
  },
  {
    id: 'uact-005',
    entityType: 'partner',
    entityId: 'ptn-002',
    activityType: 'note',
    subject: 'Delivery delay notice',
    description: 'Global Supplies notified us of a 2-week delay on Component A shipment due to port congestion.',
    outcome: null,
    dueDate: null,
    completedAt: null,
    isCompleted: false,
    priority: 'low',
    assignedTo: null,
    duration: null,
    createdBy: 'emp-002',
    createdAt: '2026-02-18T14:00:00Z',
    updatedAt: '2026-02-18T14:00:00Z',
  },
]

/**
 * Get activities (unified timeline).
 * @param {{ entityType?: string, entityId?: string, activityType?: string, assignedTo?: string, isCompleted?: boolean }} [filters]
 * @returns {Array}
 */
export function getActivitiesUnified(filters = {}) {
  let data = getStore(STORAGE_KEYS.activities, initialActivities)
  if (filters.entityType) data = data.filter((a) => a.entityType === filters.entityType)
  if (filters.entityId) data = data.filter((a) => a.entityId === filters.entityId)
  if (filters.activityType) data = data.filter((a) => a.activityType === filters.activityType)
  if (filters.assignedTo) data = data.filter((a) => a.assignedTo === filters.assignedTo)
  if (filters.isCompleted !== undefined) data = data.filter((a) => a.isCompleted === filters.isCompleted)
  if (filters.priority) data = data.filter((a) => a.priority === filters.priority)
  // Sort by most recent first
  data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  return data
}

/** @param {string} id */
export function getActivityById(id) {
  return getStore(STORAGE_KEYS.activities, initialActivities).find((a) => a.id === id) || null
}

/**
 * Create an activity on any entity.
 * @param {object} data
 * @returns {object}
 */
export function createActivity(data) {
  const activities = getStore(STORAGE_KEYS.activities, initialActivities)
  const activity = {
    id: uid('uact'),
    entityType: data.entityType || 'partner',
    entityId: data.entityId,
    activityType: data.activityType || ACTIVITY_TYPES.NOTE,
    subject: data.subject || '',
    description: data.description || '',
    outcome: data.outcome || null,
    dueDate: data.dueDate || null,
    completedAt: null,
    isCompleted: false,
    priority: data.priority || 'medium',
    assignedTo: data.assignedTo || null,
    duration: data.duration || null,
    createdBy: data.createdBy || null,
    createdAt: now(),
    updatedAt: now(),
    ...data,
    id: uid('uact'),
  }
  activities.push(activity)
  setStore(STORAGE_KEYS.activities, activities)
  return activity
}

/** @param {string} id  @param {object} data */
export function updateActivity(id, data) {
  const activities = getStore(STORAGE_KEYS.activities, initialActivities)
  const idx = activities.findIndex((a) => a.id === id)
  if (idx === -1) return null
  activities[idx] = { ...activities[idx], ...data, updatedAt: now() }
  setStore(STORAGE_KEYS.activities, activities)
  return activities[idx]
}

/**
 * Mark an activity as completed.
 * @param {string} id
 * @param {string} [outcome]
 * @returns {object|null}
 */
export function completeActivity(id, outcome) {
  return updateActivity(id, {
    isCompleted: true,
    completedAt: now(),
    outcome: outcome || undefined,
  })
}

/** @param {string} id */
export function deleteActivity(id) {
  const activities = getStore(STORAGE_KEYS.activities, initialActivities).filter((a) => a.id !== id)
  setStore(STORAGE_KEYS.activities, activities)
  return true
}

/**
 * Get an entity timeline combining activities, comments, and attachments.
 * @param {string} entityType
 * @param {string} entityId
 * @returns {Array} Sorted array of timeline events.
 */
export function getEntityTimeline(entityType, entityId) {
  const acts = getActivitiesUnified({ entityType, entityId }).map((a) => ({
    ...a,
    _timelineType: 'activity',
    _timelineDate: a.createdAt,
  }))
  const cmts = getComments({ entityType, entityId }).map((c) => ({
    ...c,
    _timelineType: 'comment',
    _timelineDate: c.createdAt,
  }))
  const atts = getAttachments({ entityType, entityId }).map((a) => ({
    ...a,
    _timelineType: 'attachment',
    _timelineDate: a.createdAt,
  }))
  return [...acts, ...cmts, ...atts].sort(
    (a, b) => new Date(b._timelineDate) - new Date(a._timelineDate)
  )
}

// ============================================================
//  A5 - COMMENTS  (Universal Commentary System)
// ============================================================

const initialComments = [
  {
    id: 'cmt-001',
    entityType: 'partner',
    entityId: 'ptn-001',
    parentId: null,
    body: 'Acme Corp has been great to work with. Their CTO is very responsive.',
    mentionedUsers: [],
    authorId: 'emp-002',
    authorName: 'Alex Chen',
    isEdited: false,
    createdAt: '2026-01-20T10:00:00Z',
    updatedAt: '2026-01-20T10:00:00Z',
  },
  {
    id: 'cmt-002',
    entityType: 'partner',
    entityId: 'ptn-001',
    parentId: 'cmt-001',
    body: '@ravi.sharma Can you follow up on the Q2 expansion discussion?',
    mentionedUsers: ['emp-005'],
    authorId: 'emp-001',
    authorName: 'Admin User',
    isEdited: false,
    createdAt: '2026-01-20T11:30:00Z',
    updatedAt: '2026-01-20T11:30:00Z',
  },
  {
    id: 'cmt-003',
    entityType: 'opportunity',
    entityId: 'opp-001',
    parentId: null,
    body: 'Need to prepare a custom pricing tier for this deal. @finance please review margins.',
    mentionedUsers: ['team-finance'],
    authorId: 'emp-002',
    authorName: 'Alex Chen',
    isEdited: false,
    createdAt: '2026-02-05T09:00:00Z',
    updatedAt: '2026-02-05T09:00:00Z',
  },
  {
    id: 'cmt-004',
    entityType: 'partner',
    entityId: 'ptn-002',
    parentId: null,
    body: 'Vendor onboarding docs have been received. Tax ID verification pending.',
    mentionedUsers: [],
    authorId: 'emp-003',
    authorName: 'Priya Mehta',
    isEdited: false,
    createdAt: '2025-03-12T14:00:00Z',
    updatedAt: '2025-03-12T14:00:00Z',
  },
]

/**
 * Get comments for an entity, supports threading via parentId.
 * @param {{ entityType?: string, entityId?: string, parentId?: string|null }} [filters]
 * @returns {Array}
 */
export function getComments(filters = {}) {
  let data = getStore(STORAGE_KEYS.comments, initialComments)
  if (filters.entityType) data = data.filter((c) => c.entityType === filters.entityType)
  if (filters.entityId) data = data.filter((c) => c.entityId === filters.entityId)
  if (filters.parentId !== undefined) data = data.filter((c) => c.parentId === filters.parentId)
  data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  return data
}

/** @param {string} id */
export function getCommentById(id) {
  return getStore(STORAGE_KEYS.comments, initialComments).find((c) => c.id === id) || null
}

/**
 * Add a comment with optional @mention support.
 * @param {object} data Must include entityType, entityId, body.
 * @returns {object}
 */
export function createComment(data) {
  const comments = getStore(STORAGE_KEYS.comments, initialComments)
  // Extract @mentions from body
  const mentionPattern = /@[\w.-]+/g
  const extractedMentions = (data.body || '').match(mentionPattern) || []
  const comment = {
    id: uid('cmt'),
    entityType: data.entityType,
    entityId: data.entityId,
    parentId: data.parentId || null,
    body: data.body || '',
    mentionedUsers: data.mentionedUsers || extractedMentions.map((m) => m.slice(1)),
    authorId: data.authorId || null,
    authorName: data.authorName || 'Unknown',
    isEdited: false,
    createdAt: now(),
    updatedAt: now(),
    ...data,
    id: uid('cmt'),
  }
  comments.push(comment)
  setStore(STORAGE_KEYS.comments, comments)
  return comment
}

/** @param {string} id  @param {object} data */
export function updateComment(id, data) {
  const comments = getStore(STORAGE_KEYS.comments, initialComments)
  const idx = comments.findIndex((c) => c.id === id)
  if (idx === -1) return null
  comments[idx] = { ...comments[idx], ...data, isEdited: true, updatedAt: now() }
  setStore(STORAGE_KEYS.comments, comments)
  return comments[idx]
}

/** @param {string} id */
export function deleteComment(id) {
  const comments = getStore(STORAGE_KEYS.comments, initialComments).filter((c) => c.id !== id)
  setStore(STORAGE_KEYS.comments, comments)
  return true
}

/**
 * Get comment thread (parent + all replies).
 * @param {string} parentId
 * @returns {Array}
 */
export function getCommentThread(parentId) {
  const parent = getCommentById(parentId)
  const replies = getComments({ parentId })
  return parent ? [parent, ...replies] : replies
}

/**
 * Count comments for an entity.
 * @param {string} entityType
 * @param {string} entityId
 * @returns {number}
 */
export function countComments(entityType, entityId) {
  return getComments({ entityType, entityId }).length
}

// ============================================================
//  A6 - TAGS  (Polymorphic Tags System)
// ============================================================

const initialTags = [
  {
    id: 'tag-001',
    entityType: 'partner',
    entityId: 'ptn-001',
    name: 'enterprise',
    color: '#3B82F6',
    createdBy: 'emp-001',
    createdAt: '2025-06-15T09:00:00Z',
  },
  {
    id: 'tag-002',
    entityType: 'partner',
    entityId: 'ptn-001',
    name: 'priority',
    color: '#EF4444',
    createdBy: 'emp-001',
    createdAt: '2025-06-15T09:00:00Z',
  },
  {
    id: 'tag-003',
    entityType: 'partner',
    entityId: 'ptn-002',
    name: 'raw-materials',
    color: '#F59E0B',
    createdBy: 'emp-001',
    createdAt: '2025-03-10T11:00:00Z',
  },
  {
    id: 'tag-004',
    entityType: 'opportunity',
    entityId: 'opp-001',
    name: 'hot-deal',
    color: '#EF4444',
    createdBy: 'emp-002',
    createdAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'tag-005',
    entityType: 'partner',
    entityId: 'ptn-003',
    name: 'social-media',
    color: '#8B5CF6',
    createdBy: 'emp-002',
    createdAt: '2025-11-01T08:00:00Z',
  },
  {
    id: 'tag-006',
    entityType: 'lead',
    entityId: 'lead-001',
    name: 'high-priority',
    color: '#EF4444',
    createdBy: 'emp-002',
    createdAt: '2026-01-10T09:00:00Z',
  },
]

/**
 * Get tags, optionally filtered by entity.
 * @param {{ entityType?: string, entityId?: string, name?: string }} [filters]
 * @returns {Array}
 */
export function getTags(filters = {}) {
  let data = getStore(STORAGE_KEYS.tags, initialTags)
  if (filters.entityType) data = data.filter((t) => t.entityType === filters.entityType)
  if (filters.entityId) data = data.filter((t) => t.entityId === filters.entityId)
  if (filters.name) data = data.filter((t) => t.name === filters.name)
  return data
}

/** @param {string} id */
export function getTagById(id) {
  return getStore(STORAGE_KEYS.tags, initialTags).find((t) => t.id === id) || null
}

/**
 * Assign a tag to an entity.
 * @param {object} data
 * @returns {object}
 */
export function createTag(data) {
  const tags = getStore(STORAGE_KEYS.tags, initialTags)
  // Prevent duplicate tag assignment
  const exists = tags.find(
    (t) => t.entityType === data.entityType && t.entityId === data.entityId && t.name === data.name
  )
  if (exists) return exists
  const tag = {
    id: uid('tag'),
    entityType: data.entityType,
    entityId: data.entityId,
    name: data.name || '',
    color: data.color || '#6B7280',
    createdBy: data.createdBy || null,
    createdAt: now(),
    ...data,
    id: uid('tag'),
  }
  tags.push(tag)
  setStore(STORAGE_KEYS.tags, tags)
  return tag
}

/** @param {string} id  @param {object} data */
export function updateTag(id, data) {
  const tags = getStore(STORAGE_KEYS.tags, initialTags)
  const idx = tags.findIndex((t) => t.id === id)
  if (idx === -1) return null
  tags[idx] = { ...tags[idx], ...data }
  setStore(STORAGE_KEYS.tags, tags)
  return tags[idx]
}

/** @param {string} id */
export function deleteTag(id) {
  const tags = getStore(STORAGE_KEYS.tags, initialTags).filter((t) => t.id !== id)
  setStore(STORAGE_KEYS.tags, tags)
  return true
}

/**
 * Remove a tag from an entity by name.
 * @param {string} entityType
 * @param {string} entityId
 * @param {string} tagName
 * @returns {boolean}
 */
export function removeTagByName(entityType, entityId, tagName) {
  const tags = getStore(STORAGE_KEYS.tags, initialTags).filter(
    (t) => !(t.entityType === entityType && t.entityId === entityId && t.name === tagName)
  )
  setStore(STORAGE_KEYS.tags, tags)
  return true
}

/**
 * Get all distinct tag names used across entities.
 * @returns {Array<{ name: string, color: string, count: number }>}
 */
export function getDistinctTags() {
  const tags = getStore(STORAGE_KEYS.tags, initialTags)
  const map = {}
  tags.forEach((t) => {
    if (!map[t.name]) {
      map[t.name] = { name: t.name, color: t.color, count: 0 }
    }
    map[t.name].count++
  })
  return Object.values(map).sort((a, b) => b.count - a.count)
}

// ============================================================
//  A7 - NOTIFICATIONS  (Centralized Notification Hub)
// ============================================================

export const NOTIFICATION_CATEGORIES = {
  LOW_STOCK: 'low_stock',
  LEAVE_REQUEST: 'leave_request',
  CRM_REMINDER: 'crm_reminder',
  APPROVAL_NEEDED: 'approval_needed',
  PAYMENT_RECEIVED: 'payment_received',
  INVOICE_OVERDUE: 'invoice_overdue',
  TASK_ASSIGNED: 'task_assigned',
  MENTION: 'mention',
  SYSTEM: 'system',
}

const initialNotifications = [
  {
    id: 'ntf-001',
    userId: 'emp-001',
    category: 'approval_needed',
    title: 'Purchase Order Approval',
    message: 'PO-2026-0042 for Global Supplies Ltd requires your approval ($12,500).',
    severity: 'warning',
    isRead: false,
    readAt: null,
    actionUrl: '/purchase/orders',
    actionLabel: 'Review PO',
    metadata: { poId: 'po-042', amount: 12500, vendor: 'ptn-002' },
    expiresAt: null,
    createdAt: '2026-02-24T09:00:00Z',
  },
  {
    id: 'ntf-002',
    userId: 'emp-002',
    category: 'crm_reminder',
    title: 'Follow-up Reminder',
    message: 'Scheduled follow-up with Acme Corp (ptn-001) is due today.',
    severity: 'info',
    isRead: false,
    readAt: null,
    actionUrl: '/crm/contacts',
    actionLabel: 'View Contact',
    metadata: { partnerId: 'ptn-001' },
    expiresAt: null,
    createdAt: '2026-02-25T08:00:00Z',
  },
  {
    id: 'ntf-003',
    userId: 'emp-001',
    category: 'low_stock',
    title: 'Low Stock Alert',
    message: 'Component A (SKU-003) is below reorder level. Current stock: 45 units.',
    severity: 'error',
    isRead: true,
    readAt: '2026-02-23T10:00:00Z',
    actionUrl: '/inventory',
    actionLabel: 'View Inventory',
    metadata: { productId: 'prod-003', currentStock: 45, reorderLevel: 200 },
    expiresAt: null,
    createdAt: '2026-02-22T07:00:00Z',
  },
  {
    id: 'ntf-004',
    userId: 'emp-003',
    category: 'leave_request',
    title: 'Leave Request Submitted',
    message: 'Ravi Sharma has submitted a leave request for Mar 3-7, 2026.',
    severity: 'info',
    isRead: false,
    readAt: null,
    actionUrl: '/hr/leaves',
    actionLabel: 'Review Request',
    metadata: { employeeId: 'ptn-005', startDate: '2026-03-03', endDate: '2026-03-07' },
    expiresAt: null,
    createdAt: '2026-02-25T06:00:00Z',
  },
  {
    id: 'ntf-005',
    userId: 'emp-002',
    category: 'task_assigned',
    title: 'New Task Assigned',
    message: 'You have been assigned: "Review influencer campaign brief" due Feb 25.',
    severity: 'info',
    isRead: false,
    readAt: null,
    actionUrl: '/crm/activities',
    actionLabel: 'View Task',
    metadata: { activityId: 'uact-004' },
    expiresAt: null,
    createdAt: '2026-02-15T09:00:00Z',
  },
]

/**
 * Get notifications for a user with optional filters.
 * @param {{ userId?: string, category?: string, isRead?: boolean, severity?: string }} [filters]
 * @returns {Array}
 */
export function getNotifications(filters = {}) {
  let data = getStore(STORAGE_KEYS.notifications, initialNotifications)
  if (filters.userId) data = data.filter((n) => n.userId === filters.userId)
  if (filters.category) data = data.filter((n) => n.category === filters.category)
  if (filters.isRead !== undefined) data = data.filter((n) => n.isRead === filters.isRead)
  if (filters.severity) data = data.filter((n) => n.severity === filters.severity)
  // Exclude expired
  const rightNow = new Date().toISOString()
  data = data.filter((n) => !n.expiresAt || n.expiresAt > rightNow)
  data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  return data
}

/** @param {string} id */
export function getNotificationById(id) {
  return getStore(STORAGE_KEYS.notifications, initialNotifications).find((n) => n.id === id) || null
}

/**
 * Create a notification.
 * @param {object} data
 * @returns {object}
 */
export function createNotification(data) {
  const notifications = getStore(STORAGE_KEYS.notifications, initialNotifications)
  const notification = {
    id: uid('ntf'),
    userId: data.userId,
    category: data.category || NOTIFICATION_CATEGORIES.SYSTEM,
    title: data.title || '',
    message: data.message || '',
    severity: data.severity || 'info',
    isRead: false,
    readAt: null,
    actionUrl: data.actionUrl || null,
    actionLabel: data.actionLabel || null,
    metadata: data.metadata || {},
    expiresAt: data.expiresAt || null,
    createdAt: now(),
    ...data,
    id: uid('ntf'),
    isRead: false,
    readAt: null,
  }
  notifications.unshift(notification)
  // Keep a reasonable cap
  if (notifications.length > 500) notifications.length = 500
  setStore(STORAGE_KEYS.notifications, notifications)
  return notification
}

/**
 * Mark a notification as read.
 * @param {string} id
 * @returns {object|null}
 */
export function markNotificationRead(id) {
  const notifications = getStore(STORAGE_KEYS.notifications, initialNotifications)
  const idx = notifications.findIndex((n) => n.id === id)
  if (idx === -1) return null
  notifications[idx].isRead = true
  notifications[idx].readAt = now()
  setStore(STORAGE_KEYS.notifications, notifications)
  return notifications[idx]
}

/**
 * Mark all notifications as read for a user.
 * @param {string} userId
 */
export function markAllNotificationsRead(userId) {
  const notifications = getStore(STORAGE_KEYS.notifications, initialNotifications)
  const ts = now()
  notifications.forEach((n) => {
    if (n.userId === userId && !n.isRead) {
      n.isRead = true
      n.readAt = ts
    }
  })
  setStore(STORAGE_KEYS.notifications, notifications)
}

/**
 * Get unread count for a user.
 * @param {string} userId
 * @returns {number}
 */
export function getUnreadNotificationCount(userId) {
  return getNotifications({ userId, isRead: false }).length
}

/** @param {string} id */
export function deleteNotification(id) {
  const notifications = getStore(STORAGE_KEYS.notifications, initialNotifications).filter((n) => n.id !== id)
  setStore(STORAGE_KEYS.notifications, notifications)
  return true
}

/**
 * Clear all notifications for a user.
 * @param {string} userId
 */
export function clearNotifications(userId) {
  const notifications = getStore(STORAGE_KEYS.notifications, initialNotifications).filter(
    (n) => n.userId !== userId
  )
  setStore(STORAGE_KEYS.notifications, notifications)
}

// ============================================================
//  A8 - APPROVAL WORKFLOWS  (Universal State Machine)
// ============================================================

export const APPROVAL_STATES = {
  DRAFT: 'draft',
  PENDING: 'pending',
  IN_REVIEW: 'in_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  ESCALATED: 'escalated',
  CANCELLED: 'cancelled',
}

const initialApprovalWorkflows = [
  // -- Workflow definitions --
  {
    id: 'wf-001',
    _type: 'workflow_definition',
    name: 'Purchase Order Approval',
    workflowType: 'purchase_order',
    description: 'Multi-step PO approval based on amount thresholds',
    isActive: true,
    steps: [
      { stepOrder: 1, label: 'Manager Approval', approverRole: 'manager', approverIds: ['emp-003'], autoApproveBelow: 1000 },
      { stepOrder: 2, label: 'Finance Review', approverRole: 'finance_head', approverIds: ['emp-001'], autoApproveBelow: 0 },
      { stepOrder: 3, label: 'Director Sign-off', approverRole: 'director', approverIds: ['emp-001'], autoApproveBelow: 0, requiredAbove: 25000 },
    ],
    escalationTimeoutHours: 48,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'wf-002',
    _type: 'workflow_definition',
    name: 'Leave Request Approval',
    workflowType: 'hr_leave',
    description: 'Single-step manager approval for leave requests',
    isActive: true,
    steps: [
      { stepOrder: 1, label: 'Reporting Manager', approverRole: 'manager', approverIds: ['emp-003'], autoApproveBelow: 0 },
    ],
    escalationTimeoutHours: 24,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'wf-003',
    _type: 'workflow_definition',
    name: 'Expense Claim Approval',
    workflowType: 'expense_claim',
    description: 'Two-step approval: manager then finance',
    isActive: true,
    steps: [
      { stepOrder: 1, label: 'Manager Approval', approverRole: 'manager', approverIds: ['emp-003'], autoApproveBelow: 500 },
      { stepOrder: 2, label: 'Finance Approval', approverRole: 'finance_head', approverIds: ['emp-001'], autoApproveBelow: 0 },
    ],
    escalationTimeoutHours: 72,
    createdAt: '2025-06-01T00:00:00Z',
    updatedAt: '2025-06-01T00:00:00Z',
  },
  // -- Approval requests (instances) --
  {
    id: 'apr-001',
    _type: 'approval_request',
    workflowId: 'wf-001',
    workflowType: 'purchase_order',
    entityType: 'purchase_order',
    entityId: 'po-042',
    title: 'PO-2026-0042 - Global Supplies',
    requestedBy: 'emp-002',
    requestedAt: '2026-02-24T09:00:00Z',
    currentStep: 1,
    state: 'pending',
    amount: 12500,
    currency: 'USD',
    history: [
      { step: 1, action: 'submitted', by: 'emp-002', at: '2026-02-24T09:00:00Z', comment: 'Urgent order for Component A' },
    ],
    escalatedAt: null,
    resolvedAt: null,
  },
  {
    id: 'apr-002',
    _type: 'approval_request',
    workflowId: 'wf-002',
    workflowType: 'hr_leave',
    entityType: 'leave_request',
    entityId: 'lv-015',
    title: 'Leave Request - Ravi Sharma',
    requestedBy: 'emp-005',
    requestedAt: '2026-02-25T06:00:00Z',
    currentStep: 1,
    state: 'pending',
    amount: null,
    currency: null,
    history: [
      { step: 1, action: 'submitted', by: 'emp-005', at: '2026-02-25T06:00:00Z', comment: 'Family function' },
    ],
    escalatedAt: null,
    resolvedAt: null,
  },
  {
    id: 'apr-003',
    _type: 'approval_request',
    workflowId: 'wf-003',
    workflowType: 'expense_claim',
    entityType: 'expense_claim',
    entityId: 'exp-009',
    title: 'Travel Expense - Alex Chen',
    requestedBy: 'emp-002',
    requestedAt: '2026-02-20T10:00:00Z',
    currentStep: 2,
    state: 'in_review',
    amount: 3200,
    currency: 'USD',
    history: [
      { step: 1, action: 'submitted', by: 'emp-002', at: '2026-02-20T10:00:00Z', comment: 'Client visit travel expenses' },
      { step: 1, action: 'approved', by: 'emp-003', at: '2026-02-21T14:00:00Z', comment: 'Approved' },
    ],
    escalatedAt: null,
    resolvedAt: null,
  },
]

/**
 * Get approval workflow definitions.
 * @param {{ workflowType?: string, isActive?: boolean }} [filters]
 * @returns {Array}
 */
export function getApprovalWorkflows(filters = {}) {
  let data = getStore(STORAGE_KEYS.approvalWorkflows, initialApprovalWorkflows)
  data = data.filter((d) => d._type === 'workflow_definition')
  if (filters.workflowType) data = data.filter((w) => w.workflowType === filters.workflowType)
  if (filters.isActive !== undefined) data = data.filter((w) => w.isActive === filters.isActive)
  return data
}

/** @param {string} id */
export function getApprovalWorkflowById(id) {
  return (
    getStore(STORAGE_KEYS.approvalWorkflows, initialApprovalWorkflows).find(
      (w) => w.id === id && w._type === 'workflow_definition'
    ) || null
  )
}

/**
 * Create a new workflow definition.
 * @param {object} data
 * @returns {object}
 */
export function createApprovalWorkflow(data) {
  const store = getStore(STORAGE_KEYS.approvalWorkflows, initialApprovalWorkflows)
  const workflow = {
    id: uid('wf'),
    _type: 'workflow_definition',
    name: data.name || '',
    workflowType: data.workflowType || 'generic',
    description: data.description || '',
    isActive: data.isActive !== undefined ? data.isActive : true,
    steps: data.steps || [],
    escalationTimeoutHours: data.escalationTimeoutHours || 48,
    createdAt: now(),
    updatedAt: now(),
    ...data,
    _type: 'workflow_definition',
    id: uid('wf'),
  }
  store.push(workflow)
  setStore(STORAGE_KEYS.approvalWorkflows, store)
  return workflow
}

/** @param {string} id  @param {object} data */
export function updateApprovalWorkflow(id, data) {
  const store = getStore(STORAGE_KEYS.approvalWorkflows, initialApprovalWorkflows)
  const idx = store.findIndex((w) => w.id === id && w._type === 'workflow_definition')
  if (idx === -1) return null
  store[idx] = { ...store[idx], ...data, updatedAt: now() }
  setStore(STORAGE_KEYS.approvalWorkflows, store)
  return store[idx]
}

/** @param {string} id */
export function deleteApprovalWorkflow(id) {
  const store = getStore(STORAGE_KEYS.approvalWorkflows, initialApprovalWorkflows).filter(
    (w) => !(w.id === id && w._type === 'workflow_definition')
  )
  setStore(STORAGE_KEYS.approvalWorkflows, store)
  return true
}

// -- Approval Requests (instances) --

/**
 * Get approval requests.
 * @param {{ workflowType?: string, state?: string, requestedBy?: string, entityType?: string, entityId?: string }} [filters]
 * @returns {Array}
 */
export function getApprovalRequests(filters = {}) {
  let data = getStore(STORAGE_KEYS.approvalWorkflows, initialApprovalWorkflows)
  data = data.filter((d) => d._type === 'approval_request')
  if (filters.workflowType) data = data.filter((r) => r.workflowType === filters.workflowType)
  if (filters.state) data = data.filter((r) => r.state === filters.state)
  if (filters.requestedBy) data = data.filter((r) => r.requestedBy === filters.requestedBy)
  if (filters.entityType) data = data.filter((r) => r.entityType === filters.entityType)
  if (filters.entityId) data = data.filter((r) => r.entityId === filters.entityId)
  data.sort((a, b) => new Date(b.requestedAt) - new Date(a.requestedAt))
  return data
}

/** @param {string} id */
export function getApprovalRequestById(id) {
  return (
    getStore(STORAGE_KEYS.approvalWorkflows, initialApprovalWorkflows).find(
      (r) => r.id === id && r._type === 'approval_request'
    ) || null
  )
}

/**
 * Submit a new approval request.
 * @param {object} data Must include workflowId, entityType, entityId.
 * @returns {object}
 */
export function createApprovalRequest(data) {
  const store = getStore(STORAGE_KEYS.approvalWorkflows, initialApprovalWorkflows)
  const workflow = store.find((w) => w.id === data.workflowId && w._type === 'workflow_definition')
  const request = {
    id: uid('apr'),
    _type: 'approval_request',
    workflowId: data.workflowId,
    workflowType: workflow ? workflow.workflowType : data.workflowType || 'generic',
    entityType: data.entityType,
    entityId: data.entityId,
    title: data.title || '',
    requestedBy: data.requestedBy || null,
    requestedAt: now(),
    currentStep: 1,
    state: APPROVAL_STATES.PENDING,
    amount: data.amount || null,
    currency: data.currency || null,
    history: [
      {
        step: 1,
        action: 'submitted',
        by: data.requestedBy || null,
        at: now(),
        comment: data.comment || '',
      },
    ],
    escalatedAt: null,
    resolvedAt: null,
    ...data,
    _type: 'approval_request',
    id: uid('apr'),
    state: APPROVAL_STATES.PENDING,
  }
  store.push(request)
  setStore(STORAGE_KEYS.approvalWorkflows, store)
  return request
}

/**
 * Approve the current step of an approval request. Advances to next step or marks approved.
 * @param {string} requestId
 * @param {string} approverId
 * @param {string} [comment]
 * @returns {object|null}
 */
export function approveRequest(requestId, approverId, comment) {
  const store = getStore(STORAGE_KEYS.approvalWorkflows, initialApprovalWorkflows)
  const idx = store.findIndex((r) => r.id === requestId && r._type === 'approval_request')
  if (idx === -1) return null
  const request = store[idx]
  const workflow = store.find((w) => w.id === request.workflowId && w._type === 'workflow_definition')
  const totalSteps = workflow ? workflow.steps.length : 1

  request.history.push({
    step: request.currentStep,
    action: 'approved',
    by: approverId,
    at: now(),
    comment: comment || '',
  })

  if (request.currentStep >= totalSteps) {
    request.state = APPROVAL_STATES.APPROVED
    request.resolvedAt = now()
  } else {
    request.currentStep += 1
    request.state = APPROVAL_STATES.IN_REVIEW
  }

  store[idx] = request
  setStore(STORAGE_KEYS.approvalWorkflows, store)
  return request
}

/**
 * Reject an approval request.
 * @param {string} requestId
 * @param {string} rejecterId
 * @param {string} [reason]
 * @returns {object|null}
 */
export function rejectRequest(requestId, rejecterId, reason) {
  const store = getStore(STORAGE_KEYS.approvalWorkflows, initialApprovalWorkflows)
  const idx = store.findIndex((r) => r.id === requestId && r._type === 'approval_request')
  if (idx === -1) return null
  const request = store[idx]
  request.history.push({
    step: request.currentStep,
    action: 'rejected',
    by: rejecterId,
    at: now(),
    comment: reason || '',
  })
  request.state = APPROVAL_STATES.REJECTED
  request.resolvedAt = now()
  store[idx] = request
  setStore(STORAGE_KEYS.approvalWorkflows, store)
  return request
}

/**
 * Escalate an approval request.
 * @param {string} requestId
 * @param {string} escalatedBy
 * @param {string} [reason]
 * @returns {object|null}
 */
export function escalateRequest(requestId, escalatedBy, reason) {
  const store = getStore(STORAGE_KEYS.approvalWorkflows, initialApprovalWorkflows)
  const idx = store.findIndex((r) => r.id === requestId && r._type === 'approval_request')
  if (idx === -1) return null
  const request = store[idx]
  request.history.push({
    step: request.currentStep,
    action: 'escalated',
    by: escalatedBy,
    at: now(),
    comment: reason || '',
  })
  request.state = APPROVAL_STATES.ESCALATED
  request.escalatedAt = now()
  store[idx] = request
  setStore(STORAGE_KEYS.approvalWorkflows, store)
  return request
}

/**
 * Cancel an approval request.
 * @param {string} requestId
 * @param {string} cancelledBy
 * @param {string} [reason]
 * @returns {object|null}
 */
export function cancelRequest(requestId, cancelledBy, reason) {
  const store = getStore(STORAGE_KEYS.approvalWorkflows, initialApprovalWorkflows)
  const idx = store.findIndex((r) => r.id === requestId && r._type === 'approval_request')
  if (idx === -1) return null
  const request = store[idx]
  request.history.push({
    step: request.currentStep,
    action: 'cancelled',
    by: cancelledBy,
    at: now(),
    comment: reason || '',
  })
  request.state = APPROVAL_STATES.CANCELLED
  request.resolvedAt = now()
  store[idx] = request
  setStore(STORAGE_KEYS.approvalWorkflows, store)
  return request
}

/**
 * Get pending approval requests for a specific approver.
 * @param {string} approverId
 * @returns {Array}
 */
export function getPendingApprovalsForUser(approverId) {
  const store = getStore(STORAGE_KEYS.approvalWorkflows, initialApprovalWorkflows)
  const requests = store.filter(
    (r) => r._type === 'approval_request' && (r.state === APPROVAL_STATES.PENDING || r.state === APPROVAL_STATES.IN_REVIEW)
  )
  return requests.filter((r) => {
    const workflow = store.find((w) => w.id === r.workflowId && w._type === 'workflow_definition')
    if (!workflow) return false
    const currentStepDef = workflow.steps.find((s) => s.stepOrder === r.currentStep)
    return currentStepDef && (currentStepDef.approverIds || []).includes(approverId)
  })
}

// ============================================================
//  A9 - STATUS MASTER  (Universal Status Definitions)
// ============================================================

const initialStatusMaster = [
  { id: 'st-001', code: 'draft', label: 'Draft', color: '#9CA3AF', badgeClass: 'badge-secondary', applicableModules: ['invoice', 'quotation', 'purchase_order', 'sales_order', 'expense_claim'], sortOrder: 1 },
  { id: 'st-002', code: 'pending', label: 'Pending', color: '#F59E0B', badgeClass: 'badge-warning', applicableModules: ['invoice', 'quotation', 'purchase_order', 'sales_order', 'leave_request', 'expense_claim', 'approval'], sortOrder: 2 },
  { id: 'st-003', code: 'approved', label: 'Approved', color: '#10B981', badgeClass: 'badge-success', applicableModules: ['purchase_order', 'leave_request', 'expense_claim', 'approval'], sortOrder: 3 },
  { id: 'st-004', code: 'rejected', label: 'Rejected', color: '#EF4444', badgeClass: 'badge-danger', applicableModules: ['purchase_order', 'leave_request', 'expense_claim', 'approval'], sortOrder: 4 },
  { id: 'st-005', code: 'sent', label: 'Sent', color: '#3B82F6', badgeClass: 'badge-info', applicableModules: ['invoice', 'quotation', 'purchase_order'], sortOrder: 5 },
  { id: 'st-006', code: 'accepted', label: 'Accepted', color: '#10B981', badgeClass: 'badge-success', applicableModules: ['quotation'], sortOrder: 6 },
  { id: 'st-007', code: 'cancelled', label: 'Cancelled', color: '#6B7280', badgeClass: 'badge-secondary', applicableModules: ['invoice', 'quotation', 'purchase_order', 'sales_order', 'leave_request', 'expense_claim'], sortOrder: 7 },
  { id: 'st-008', code: 'paid', label: 'Paid', color: '#059669', badgeClass: 'badge-success', applicableModules: ['invoice', 'expense_claim'], sortOrder: 8 },
  { id: 'st-009', code: 'overdue', label: 'Overdue', color: '#DC2626', badgeClass: 'badge-danger', applicableModules: ['invoice'], sortOrder: 9 },
  { id: 'st-010', code: 'partial', label: 'Partially Paid', color: '#D97706', badgeClass: 'badge-warning', applicableModules: ['invoice'], sortOrder: 10 },
  { id: 'st-011', code: 'active', label: 'Active', color: '#10B981', badgeClass: 'badge-success', applicableModules: ['employee', 'product', 'partner', 'subscription'], sortOrder: 11 },
  { id: 'st-012', code: 'inactive', label: 'Inactive', color: '#9CA3AF', badgeClass: 'badge-secondary', applicableModules: ['employee', 'product', 'partner', 'subscription'], sortOrder: 12 },
  { id: 'st-013', code: 'in_progress', label: 'In Progress', color: '#6366F1', badgeClass: 'badge-primary', applicableModules: ['task', 'project', 'approval'], sortOrder: 13 },
  { id: 'st-014', code: 'completed', label: 'Completed', color: '#059669', badgeClass: 'badge-success', applicableModules: ['task', 'project', 'sales_order'], sortOrder: 14 },
  { id: 'st-015', code: 'on_hold', label: 'On Hold', color: '#F97316', badgeClass: 'badge-warning', applicableModules: ['task', 'project', 'purchase_order'], sortOrder: 15 },
]

/**
 * Get all status definitions, optionally filtered by module.
 * @param {{ module?: string }} [filters]
 * @returns {Array}
 */
export function getStatusMaster(filters = {}) {
  let data = getStore(STORAGE_KEYS.statusMaster, initialStatusMaster)
  if (filters.module) {
    data = data.filter((s) => (s.applicableModules || []).includes(filters.module))
  }
  data.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
  return data
}

/** @param {string} id */
export function getStatusById(id) {
  return getStore(STORAGE_KEYS.statusMaster, initialStatusMaster).find((s) => s.id === id) || null
}

/**
 * Lookup a status by its code.
 * @param {string} code e.g. 'draft', 'pending', 'paid'
 * @returns {object|null}
 */
export function getStatusByCode(code) {
  return getStore(STORAGE_KEYS.statusMaster, initialStatusMaster).find((s) => s.code === code) || null
}

/**
 * Create a new status definition.
 * @param {object} data
 * @returns {object}
 */
export function createStatus(data) {
  const statuses = getStore(STORAGE_KEYS.statusMaster, initialStatusMaster)
  const status = {
    id: uid('st'),
    code: data.code || '',
    label: data.label || '',
    color: data.color || '#6B7280',
    badgeClass: data.badgeClass || 'badge-secondary',
    applicableModules: data.applicableModules || [],
    sortOrder: data.sortOrder || statuses.length + 1,
    ...data,
    id: uid('st'),
  }
  statuses.push(status)
  setStore(STORAGE_KEYS.statusMaster, statuses)
  return status
}

/** @param {string} id  @param {object} data */
export function updateStatus(id, data) {
  const statuses = getStore(STORAGE_KEYS.statusMaster, initialStatusMaster)
  const idx = statuses.findIndex((s) => s.id === id)
  if (idx === -1) return null
  statuses[idx] = { ...statuses[idx], ...data }
  setStore(STORAGE_KEYS.statusMaster, statuses)
  return statuses[idx]
}

/** @param {string} id */
export function deleteStatus(id) {
  const statuses = getStore(STORAGE_KEYS.statusMaster, initialStatusMaster).filter((s) => s.id !== id)
  setStore(STORAGE_KEYS.statusMaster, statuses)
  return true
}

/**
 * Get the badge class for a given status code.
 * @param {string} code
 * @returns {string}
 */
export function getStatusBadgeClass(code) {
  const status = getStatusByCode(code)
  return status ? status.badgeClass : 'badge-secondary'
}

/**
 * Get the color for a given status code.
 * @param {string} code
 * @returns {string}
 */
export function getStatusColor(code) {
  const status = getStatusByCode(code)
  return status ? status.color : '#6B7280'
}

// ============================================================
//  A10 - LOCATIONS  (Shared Location / Warehouse Model)
// ============================================================

export const LOCATION_TYPES = {
  WAREHOUSE: 'warehouse',
  OFFICE: 'office',
  RETAIL: 'retail',
  FACTORY: 'factory',
  DISTRIBUTION_CENTER: 'distribution_center',
}

const initialLocations = [
  {
    id: 'loc-001',
    name: 'Main Warehouse',
    code: 'WH-MAIN',
    type: 'warehouse',
    address: '100 Industrial Park Road, Oakland, CA 94607',
    city: 'Oakland',
    state: 'CA',
    country: 'US',
    postalCode: '94607',
    latitude: 37.8044,
    longitude: -122.2712,
    managerId: 'emp-003',
    capacity: 10000,
    capacityUnit: 'sqft',
    isActive: true,
    contactPhone: '+1-555-1000',
    operatingHours: 'Mon-Fri 6:00 AM - 10:00 PM',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2026-01-10T00:00:00Z',
  },
  {
    id: 'loc-002',
    name: 'Downtown Office',
    code: 'OF-DT',
    type: 'office',
    address: '500 Market Street, Suite 300, San Francisco, CA 94105',
    city: 'San Francisco',
    state: 'CA',
    country: 'US',
    postalCode: '94105',
    latitude: 37.7749,
    longitude: -122.4194,
    managerId: 'emp-001',
    capacity: 50,
    capacityUnit: 'seats',
    isActive: true,
    contactPhone: '+1-555-2000',
    operatingHours: 'Mon-Fri 9:00 AM - 6:00 PM',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2026-01-10T00:00:00Z',
  },
  {
    id: 'loc-003',
    name: 'Mumbai Branch',
    code: 'OF-MUM',
    type: 'office',
    address: 'Bandra Kurla Complex, Mumbai, Maharashtra 400051',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'IN',
    postalCode: '400051',
    latitude: 19.0596,
    longitude: 72.8656,
    managerId: 'emp-005',
    capacity: 30,
    capacityUnit: 'seats',
    isActive: true,
    contactPhone: '+91-22-4000-5000',
    operatingHours: 'Mon-Sat 9:30 AM - 6:30 PM',
    createdAt: '2024-06-01T00:00:00Z',
    updatedAt: '2025-12-01T00:00:00Z',
  },
  {
    id: 'loc-004',
    name: 'East Coast Distribution Center',
    code: 'DC-EAST',
    type: 'distribution_center',
    address: '200 Logistics Drive, Newark, NJ 07102',
    city: 'Newark',
    state: 'NJ',
    country: 'US',
    postalCode: '07102',
    latitude: 40.7357,
    longitude: -74.1724,
    managerId: null,
    capacity: 25000,
    capacityUnit: 'sqft',
    isActive: true,
    contactPhone: '+1-555-3000',
    operatingHours: '24/7',
    createdAt: '2025-03-01T00:00:00Z',
    updatedAt: '2026-02-01T00:00:00Z',
  },
]

/**
 * Get locations with optional filters.
 * @param {{ type?: string, isActive?: boolean, country?: string, search?: string }} [filters]
 * @returns {Array}
 */
export function getLocations(filters = {}) {
  let data = getStore(STORAGE_KEYS.locations, initialLocations)
  if (filters.type) data = data.filter((l) => l.type === filters.type)
  if (filters.isActive !== undefined) data = data.filter((l) => l.isActive === filters.isActive)
  if (filters.country) data = data.filter((l) => l.country === filters.country)
  if (filters.search) {
    const q = filters.search.toLowerCase()
    data = data.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        (l.code && l.code.toLowerCase().includes(q)) ||
        (l.city && l.city.toLowerCase().includes(q))
    )
  }
  return data
}

/** @param {string} id */
export function getLocationById(id) {
  return getStore(STORAGE_KEYS.locations, initialLocations).find((l) => l.id === id) || null
}

/**
 * Create a new location.
 * @param {object} data
 * @returns {object}
 */
export function createLocation(data) {
  const locations = getStore(STORAGE_KEYS.locations, initialLocations)
  const location = {
    id: uid('loc'),
    name: data.name || '',
    code: data.code || '',
    type: data.type || LOCATION_TYPES.WAREHOUSE,
    address: data.address || '',
    city: data.city || '',
    state: data.state || '',
    country: data.country || '',
    postalCode: data.postalCode || '',
    latitude: data.latitude || null,
    longitude: data.longitude || null,
    managerId: data.managerId || null,
    capacity: data.capacity || null,
    capacityUnit: data.capacityUnit || null,
    isActive: data.isActive !== undefined ? data.isActive : true,
    contactPhone: data.contactPhone || null,
    operatingHours: data.operatingHours || null,
    createdAt: now(),
    updatedAt: now(),
    ...data,
    id: uid('loc'),
  }
  locations.push(location)
  setStore(STORAGE_KEYS.locations, locations)
  return location
}

/** @param {string} id  @param {object} data */
export function updateLocation(id, data) {
  const locations = getStore(STORAGE_KEYS.locations, initialLocations)
  const idx = locations.findIndex((l) => l.id === id)
  if (idx === -1) return null
  locations[idx] = { ...locations[idx], ...data, updatedAt: now() }
  setStore(STORAGE_KEYS.locations, locations)
  return locations[idx]
}

/** @param {string} id */
export function deleteLocation(id) {
  const locations = getStore(STORAGE_KEYS.locations, initialLocations).filter((l) => l.id !== id)
  setStore(STORAGE_KEYS.locations, locations)
  return true
}

/**
 * Get warehouses only (convenience).
 * @returns {Array}
 */
export function getWarehouses() {
  return getLocations({ type: LOCATION_TYPES.WAREHOUSE, isActive: true })
}

// ============================================================
//  A11 - EAV FIELDS  (Custom Field Definitions)
// ============================================================

export const EAV_FIELD_TYPES = {
  TEXT: 'text',
  NUMBER: 'number',
  DATE: 'date',
  BOOLEAN: 'boolean',
  SELECT: 'select',
  MULTISELECT: 'multiselect',
  EMAIL: 'email',
  URL: 'url',
  CURRENCY: 'currency',
  TEXTAREA: 'textarea',
}

const initialEavFields = [
  {
    id: 'eav-f-001',
    label: 'Industry Vertical',
    key: 'industry_vertical',
    type: 'select',
    module: 'partner',
    options: ['SaaS', 'E-commerce', 'Healthcare', 'Fintech', 'Education', 'Manufacturing', 'Other'],
    isRequired: false,
    isActive: true,
    sortOrder: 1,
    helpText: 'Select the partner industry vertical',
    validationRules: {},
    createdAt: '2025-01-10T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z',
  },
  {
    id: 'eav-f-002',
    label: 'Annual Revenue',
    key: 'annual_revenue',
    type: 'currency',
    module: 'partner',
    options: null,
    isRequired: false,
    isActive: true,
    sortOrder: 2,
    helpText: 'Estimated annual revenue of the partner',
    validationRules: { min: 0 },
    createdAt: '2025-01-10T00:00:00Z',
    updatedAt: '2025-01-10T00:00:00Z',
  },
  {
    id: 'eav-f-003',
    label: 'Preferred Contact Method',
    key: 'preferred_contact_method',
    type: 'select',
    module: 'partner',
    options: ['Email', 'Phone', 'WhatsApp', 'In-Person', 'Video Call'],
    isRequired: false,
    isActive: true,
    sortOrder: 3,
    helpText: null,
    validationRules: {},
    createdAt: '2025-03-01T00:00:00Z',
    updatedAt: '2025-03-01T00:00:00Z',
  },
  {
    id: 'eav-f-004',
    label: 'Contract Renewal Date',
    key: 'contract_renewal_date',
    type: 'date',
    module: 'partner',
    options: null,
    isRequired: false,
    isActive: true,
    sortOrder: 4,
    helpText: 'Date when the contract is up for renewal',
    validationRules: {},
    createdAt: '2025-06-01T00:00:00Z',
    updatedAt: '2025-06-01T00:00:00Z',
  },
  {
    id: 'eav-f-005',
    label: 'Weight (kg)',
    key: 'weight_kg',
    type: 'number',
    module: 'product',
    options: null,
    isRequired: false,
    isActive: true,
    sortOrder: 1,
    helpText: 'Product weight in kilograms',
    validationRules: { min: 0, max: 99999 },
    createdAt: '2025-01-15T00:00:00Z',
    updatedAt: '2025-01-15T00:00:00Z',
  },
]

/**
 * Get EAV field definitions, optionally filtered by module.
 * @param {{ module?: string, isActive?: boolean }} [filters]
 * @returns {Array}
 */
export function getEavFields(filters = {}) {
  let data = getStore(STORAGE_KEYS.eavFields, initialEavFields)
  if (filters.module) data = data.filter((f) => f.module === filters.module)
  if (filters.isActive !== undefined) data = data.filter((f) => f.isActive === filters.isActive)
  data.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
  return data
}

/** @param {string} id */
export function getEavFieldById(id) {
  return getStore(STORAGE_KEYS.eavFields, initialEavFields).find((f) => f.id === id) || null
}

/**
 * Define a new EAV custom field.
 * @param {object} data
 * @returns {object}
 */
export function createEavField(data) {
  const fields = getStore(STORAGE_KEYS.eavFields, initialEavFields)
  const field = {
    id: uid('eav-f'),
    label: data.label || '',
    key: data.key || (data.label || '').toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''),
    type: data.type || EAV_FIELD_TYPES.TEXT,
    module: data.module || 'partner',
    options: data.options || null,
    isRequired: data.isRequired || false,
    isActive: data.isActive !== undefined ? data.isActive : true,
    sortOrder: data.sortOrder || fields.filter((f) => f.module === (data.module || 'partner')).length + 1,
    helpText: data.helpText || null,
    validationRules: data.validationRules || {},
    createdAt: now(),
    updatedAt: now(),
    ...data,
    id: uid('eav-f'),
  }
  fields.push(field)
  setStore(STORAGE_KEYS.eavFields, fields)
  return field
}

/** @param {string} id  @param {object} data */
export function updateEavField(id, data) {
  const fields = getStore(STORAGE_KEYS.eavFields, initialEavFields)
  const idx = fields.findIndex((f) => f.id === id)
  if (idx === -1) return null
  fields[idx] = { ...fields[idx], ...data, updatedAt: now() }
  setStore(STORAGE_KEYS.eavFields, fields)
  return fields[idx]
}

/** @param {string} id */
export function deleteEavField(id) {
  const fields = getStore(STORAGE_KEYS.eavFields, initialEavFields).filter((f) => f.id !== id)
  setStore(STORAGE_KEYS.eavFields, fields)
  // Also clean up values for this field
  const values = getStore(STORAGE_KEYS.eavValues, initialEavValues).filter((v) => v.fieldId !== id)
  setStore(STORAGE_KEYS.eavValues, values)
  return true
}

// ============================================================
//  A12 - EAV VALUES  (Custom Field Values per Entity)
// ============================================================

const initialEavValues = [
  { id: 'eav-v-001', entityType: 'partner', entityId: 'ptn-001', fieldId: 'eav-f-001', value: 'SaaS', updatedAt: '2025-06-20T10:00:00Z' },
  { id: 'eav-v-002', entityType: 'partner', entityId: 'ptn-001', fieldId: 'eav-f-002', value: 5000000, updatedAt: '2025-06-20T10:00:00Z' },
  { id: 'eav-v-003', entityType: 'partner', entityId: 'ptn-001', fieldId: 'eav-f-003', value: 'Email', updatedAt: '2025-06-20T10:00:00Z' },
  { id: 'eav-v-004', entityType: 'partner', entityId: 'ptn-001', fieldId: 'eav-f-004', value: '2026-06-15', updatedAt: '2025-12-01T10:00:00Z' },
  { id: 'eav-v-005', entityType: 'partner', entityId: 'ptn-004', fieldId: 'eav-f-001', value: 'E-commerce', updatedAt: '2025-01-20T10:00:00Z' },
  { id: 'eav-v-006', entityType: 'partner', entityId: 'ptn-004', fieldId: 'eav-f-002', value: 120000000, updatedAt: '2025-01-20T10:00:00Z' },
  { id: 'eav-v-007', entityType: 'product', entityId: 'prod-001', fieldId: 'eav-f-005', value: 2.5, updatedAt: '2025-01-15T10:00:00Z' },
]

/**
 * Get EAV values for an entity or field.
 * @param {{ entityType?: string, entityId?: string, fieldId?: string }} [filters]
 * @returns {Array}
 */
export function getEavValues(filters = {}) {
  let data = getStore(STORAGE_KEYS.eavValues, initialEavValues)
  if (filters.entityType) data = data.filter((v) => v.entityType === filters.entityType)
  if (filters.entityId) data = data.filter((v) => v.entityId === filters.entityId)
  if (filters.fieldId) data = data.filter((v) => v.fieldId === filters.fieldId)
  return data
}

/** @param {string} id */
export function getEavValueById(id) {
  return getStore(STORAGE_KEYS.eavValues, initialEavValues).find((v) => v.id === id) || null
}

/**
 * Set (upsert) an EAV value for a specific entity + field.
 * @param {string} entityType
 * @param {string} entityId
 * @param {string} fieldId
 * @param {*} value
 * @returns {object}
 */
export function setEavValue(entityType, entityId, fieldId, value) {
  const values = getStore(STORAGE_KEYS.eavValues, initialEavValues)
  const idx = values.findIndex(
    (v) => v.entityType === entityType && v.entityId === entityId && v.fieldId === fieldId
  )
  if (idx !== -1) {
    values[idx].value = value
    values[idx].updatedAt = now()
    setStore(STORAGE_KEYS.eavValues, values)
    return values[idx]
  }
  const newVal = {
    id: uid('eav-v'),
    entityType,
    entityId,
    fieldId,
    value,
    updatedAt: now(),
  }
  values.push(newVal)
  setStore(STORAGE_KEYS.eavValues, values)
  return newVal
}

/**
 * Get all custom field values for an entity as a key-value map.
 * @param {string} entityType
 * @param {string} entityId
 * @returns {object} Map of fieldId -> value.
 */
export function getEavValuesMap(entityType, entityId) {
  const values = getEavValues({ entityType, entityId })
  const map = {}
  values.forEach((v) => {
    map[v.fieldId] = v.value
  })
  return map
}

/**
 * Bulk set EAV values for an entity.
 * @param {string} entityType
 * @param {string} entityId
 * @param {object} fieldValueMap e.g. { 'eav-f-001': 'SaaS', 'eav-f-002': 5000000 }
 * @returns {Array} Updated values.
 */
export function bulkSetEavValues(entityType, entityId, fieldValueMap) {
  return Object.entries(fieldValueMap).map(([fieldId, value]) =>
    setEavValue(entityType, entityId, fieldId, value)
  )
}

/** @param {string} id */
export function deleteEavValue(id) {
  const values = getStore(STORAGE_KEYS.eavValues, initialEavValues).filter((v) => v.id !== id)
  setStore(STORAGE_KEYS.eavValues, values)
  return true
}

/**
 * Validate an EAV value against its field definition.
 * @param {string} fieldId
 * @param {*} value
 * @returns {string|null} Error message or null if valid.
 */
export function validateEavValue(fieldId, value) {
  const field = getEavFieldById(fieldId)
  if (!field) return 'Field definition not found'
  if (field.isRequired && (value === undefined || value === null || value === '')) {
    return `${field.label} is required`
  }
  if (value === undefined || value === null || value === '') return null
  const rules = field.validationRules || {}
  switch (field.type) {
    case 'number':
    case 'currency':
      if (isNaN(parseFloat(value))) return `${field.label} must be a number`
      if (rules.min !== undefined && parseFloat(value) < rules.min) return `Minimum value is ${rules.min}`
      if (rules.max !== undefined && parseFloat(value) > rules.max) return `Maximum value is ${rules.max}`
      break
    case 'email': {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!re.test(value)) return 'Invalid email address'
      break
    }
    case 'url':
      try { new URL(value) } catch { return 'Invalid URL' }
      break
    case 'select':
      if (field.options && !field.options.includes(value)) return `Invalid option: ${value}`
      break
    case 'multiselect':
      if (field.options && Array.isArray(value)) {
        const invalid = value.filter((v) => !field.options.includes(v))
        if (invalid.length) return `Invalid options: ${invalid.join(', ')}`
      }
      break
    default:
      break
  }
  return null
}

// ============================================================
//  A13 - FINANCIAL PERIOD LOCKS
// ============================================================

const initialFinancialPeriodLocks = [
  {
    id: 'fpl-001',
    module: null,
    label: 'Global Lock - FY2025 Q3',
    lockDate: '2025-09-30',
    isGlobal: true,
    lockedBy: 'emp-001',
    reason: 'Quarter-end close completed',
    createdAt: '2025-10-05T10:00:00Z',
  },
  {
    id: 'fpl-002',
    module: 'accounting',
    label: 'Accounting Lock - Jan 2026',
    lockDate: '2026-01-31',
    isGlobal: false,
    lockedBy: 'emp-001',
    reason: 'January books closed',
    createdAt: '2026-02-05T08:00:00Z',
  },
  {
    id: 'fpl-003',
    module: 'inventory',
    label: 'Inventory Lock - FY2025',
    lockDate: '2025-12-31',
    isGlobal: false,
    lockedBy: 'emp-003',
    reason: 'Annual stock-take completed and reconciled',
    createdAt: '2026-01-10T12:00:00Z',
  },
]

/**
 * Get all financial period locks.
 * @param {{ module?: string, isGlobal?: boolean }} [filters]
 * @returns {Array}
 */
export function getFinancialPeriodLocks(filters = {}) {
  let data = getStore(STORAGE_KEYS.financialPeriodLocks, initialFinancialPeriodLocks)
  if (filters.module) data = data.filter((l) => l.module === filters.module || l.isGlobal)
  if (filters.isGlobal !== undefined) data = data.filter((l) => l.isGlobal === filters.isGlobal)
  return data
}

/** @param {string} id */
export function getFinancialPeriodLockById(id) {
  return (
    getStore(STORAGE_KEYS.financialPeriodLocks, initialFinancialPeriodLocks).find((l) => l.id === id) ||
    null
  )
}

/**
 * Create a new period lock.
 * @param {object} data
 * @returns {object}
 */
export function createFinancialPeriodLock(data) {
  const locks = getStore(STORAGE_KEYS.financialPeriodLocks, initialFinancialPeriodLocks)
  const lock = {
    id: uid('fpl'),
    module: data.module || null,
    label: data.label || '',
    lockDate: data.lockDate || today(),
    isGlobal: data.isGlobal || false,
    lockedBy: data.lockedBy || null,
    reason: data.reason || '',
    createdAt: now(),
    ...data,
    id: uid('fpl'),
  }
  locks.push(lock)
  setStore(STORAGE_KEYS.financialPeriodLocks, locks)
  return lock
}

/** @param {string} id  @param {object} data */
export function updateFinancialPeriodLock(id, data) {
  const locks = getStore(STORAGE_KEYS.financialPeriodLocks, initialFinancialPeriodLocks)
  const idx = locks.findIndex((l) => l.id === id)
  if (idx === -1) return null
  locks[idx] = { ...locks[idx], ...data }
  setStore(STORAGE_KEYS.financialPeriodLocks, locks)
  return locks[idx]
}

/** @param {string} id */
export function deleteFinancialPeriodLock(id) {
  const locks = getStore(STORAGE_KEYS.financialPeriodLocks, initialFinancialPeriodLocks).filter(
    (l) => l.id !== id
  )
  setStore(STORAGE_KEYS.financialPeriodLocks, locks)
  return true
}

/**
 * Check if a date is locked for a given module (or globally).
 * @param {string} dateStr YYYY-MM-DD
 * @param {string} [module] e.g. 'accounting', 'inventory'
 * @returns {boolean}
 */
export function isDateLocked(dateStr, module) {
  const locks = getStore(STORAGE_KEYS.financialPeriodLocks, initialFinancialPeriodLocks)
  return locks.some((l) => {
    if (l.isGlobal && dateStr <= l.lockDate) return true
    if (module && l.module === module && dateStr <= l.lockDate) return true
    return false
  })
}

/**
 * Get the effective lock date for a module (takes the most recent global or module lock).
 * @param {string} [module]
 * @returns {string|null} YYYY-MM-DD or null if no lock.
 */
export function getEffectiveLockDate(module) {
  const locks = getFinancialPeriodLocks({ module })
  if (!locks.length) return null
  const dates = locks.map((l) => l.lockDate).sort()
  return dates[dates.length - 1]
}

// ============================================================
//  A14 - METRICS CACHE  (Daily Materialized Dashboard Metrics)
// ============================================================

const initialMetricsCache = [
  {
    id: 'mc-001',
    metricKey: 'dashboard_summary',
    data: {
      totalRevenue: 1250000,
      totalExpenses: 875000,
      netProfit: 375000,
      openDeals: 24,
      pipelineValue: 3200000,
      newLeads: 18,
      activeCustomers: 156,
      overdueInvoices: 7,
    },
    computedAt: '2026-02-25T06:00:00Z',
    ttlMinutes: 1440,
    expiresAt: '2026-02-26T06:00:00Z',
  },
  {
    id: 'mc-002',
    metricKey: 'sales_kpis',
    data: {
      monthlyRevenue: 320000,
      avgDealSize: 45000,
      winRate: 0.32,
      avgSalesCycle: 28,
      quotationConversion: 0.45,
      topProduct: 'Widget Pro',
    },
    computedAt: '2026-02-25T06:00:00Z',
    ttlMinutes: 1440,
    expiresAt: '2026-02-26T06:00:00Z',
  },
  {
    id: 'mc-003',
    metricKey: 'inventory_health',
    data: {
      totalSkus: 42,
      lowStockItems: 3,
      outOfStockItems: 1,
      totalStockValue: 4500000,
      turnoverRate: 6.2,
      averageDaysInStock: 45,
    },
    computedAt: '2026-02-25T06:00:00Z',
    ttlMinutes: 720,
    expiresAt: '2026-02-25T18:00:00Z',
  },
  {
    id: 'mc-004',
    metricKey: 'hr_snapshot',
    data: {
      totalEmployees: 48,
      onLeaveToday: 3,
      pendingLeaveRequests: 5,
      openPositions: 4,
      avgAttendance: 0.94,
    },
    computedAt: '2026-02-25T07:00:00Z',
    ttlMinutes: 480,
    expiresAt: '2026-02-25T15:00:00Z',
  },
]

/**
 * Get all cached metrics.
 * @param {{ includeExpired?: boolean }} [filters]
 * @returns {Array}
 */
export function getMetricsCache(filters = {}) {
  let data = getStore(STORAGE_KEYS.metricsCache, initialMetricsCache)
  if (!filters.includeExpired) {
    const rightNow = new Date().toISOString()
    data = data.filter((m) => !m.expiresAt || m.expiresAt > rightNow)
  }
  return data
}

/**
 * Get a specific cached metric by key. Returns null if expired or missing.
 * @param {string} metricKey
 * @returns {object|null} The data payload or null.
 */
export function getCachedMetric(metricKey) {
  const metrics = getStore(STORAGE_KEYS.metricsCache, initialMetricsCache)
  const metric = metrics.find((m) => m.metricKey === metricKey)
  if (!metric) return null
  if (metric.expiresAt && new Date(metric.expiresAt) < new Date()) return null
  return metric.data
}

/**
 * Store or update a cached metric.
 * @param {string} metricKey
 * @param {object} data The metric data payload.
 * @param {number} [ttlMinutes=1440] Time-to-live in minutes (default 24h).
 * @returns {object}
 */
export function setCachedMetric(metricKey, data, ttlMinutes = 1440) {
  const metrics = getStore(STORAGE_KEYS.metricsCache, initialMetricsCache)
  const computedAt = now()
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000).toISOString()
  const idx = metrics.findIndex((m) => m.metricKey === metricKey)
  const entry = {
    id: idx !== -1 ? metrics[idx].id : uid('mc'),
    metricKey,
    data,
    computedAt,
    ttlMinutes,
    expiresAt,
  }
  if (idx !== -1) {
    metrics[idx] = entry
  } else {
    metrics.push(entry)
  }
  setStore(STORAGE_KEYS.metricsCache, metrics)
  return entry
}

/**
 * Invalidate (remove) a cached metric by key.
 * @param {string} metricKey
 * @returns {boolean}
 */
export function invalidateCachedMetric(metricKey) {
  const metrics = getStore(STORAGE_KEYS.metricsCache, initialMetricsCache).filter(
    (m) => m.metricKey !== metricKey
  )
  setStore(STORAGE_KEYS.metricsCache, metrics)
  return true
}

/**
 * Invalidate all cached metrics.
 */
export function invalidateAllMetrics() {
  setStore(STORAGE_KEYS.metricsCache, [])
}

/**
 * Check if a cached metric is still valid (not expired).
 * @param {string} metricKey
 * @returns {boolean}
 */
export function isMetricValid(metricKey) {
  return getCachedMetric(metricKey) !== null
}

/**
 * Get or compute a metric. Uses cache if valid, otherwise calls the compute function.
 * @param {string} metricKey
 * @param {Function} computeFn Async or sync function that returns the metric data.
 * @param {number} [ttlMinutes=1440]
 * @returns {Promise<object>|object}
 */
export async function getOrComputeMetric(metricKey, computeFn, ttlMinutes = 1440) {
  const cached = getCachedMetric(metricKey)
  if (cached) return cached
  const data = await computeFn()
  setCachedMetric(metricKey, data, ttlMinutes)
  return data
}

// ============================================================
//  RESET UTILITIES
// ============================================================

/**
 * Reset a specific store section to its initial seed data.
 * @param {string} section One of the STORAGE_KEYS keys.
 */
export function resetSection(section) {
  const initialMap = {
    partners: initialPartners,
    addresses: initialAddresses,
    attachments: initialAttachments,
    activities: initialActivities,
    comments: initialComments,
    tags: initialTags,
    notifications: initialNotifications,
    approvalWorkflows: initialApprovalWorkflows,
    statusMaster: initialStatusMaster,
    locations: initialLocations,
    eavFields: initialEavFields,
    eavValues: initialEavValues,
    financialPeriodLocks: initialFinancialPeriodLocks,
    metricsCache: initialMetricsCache,
  }
  if (STORAGE_KEYS[section] && initialMap[section]) {
    setStore(STORAGE_KEYS[section], initialMap[section])
  }
}

/**
 * Reset all unified store sections to seed data.
 */
export function resetAllUnifiedData() {
  Object.keys(STORAGE_KEYS).forEach((section) => resetSection(section))
}

// ============================================================
//  DEFAULT EXPORT
// ============================================================

export { STORAGE_KEYS }

export default {
  // Constants / Enums
  STORAGE_KEYS,
  PARTNER_TYPES,
  ADDRESS_TYPES,
  ACTIVITY_TYPES,
  NOTIFICATION_CATEGORIES,
  APPROVAL_STATES,
  LOCATION_TYPES,
  EAV_FIELD_TYPES,

  // Partners
  getPartners,
  getCustomers,
  getVendors,
  getInfluencers,
  getEmployeePartners,
  getPartnerById,
  createPartner,
  updatePartner,
  deletePartner,

  // Addresses
  getAddresses,
  getAddressById,
  createAddress,
  updateAddress,
  deleteAddress,
  getPrimaryAddress,

  // Attachments
  getAttachments,
  getAttachmentById,
  createAttachment,
  updateAttachment,
  deleteAttachment,
  countAttachments,

  // Activities (Unified)
  getActivitiesUnified,
  getActivityById,
  createActivity,
  updateActivity,
  completeActivity,
  deleteActivity,
  getEntityTimeline,

  // Comments
  getComments,
  getCommentById,
  createComment,
  updateComment,
  deleteComment,
  getCommentThread,
  countComments,

  // Tags
  getTags,
  getTagById,
  createTag,
  updateTag,
  deleteTag,
  removeTagByName,
  getDistinctTags,

  // Notifications
  getNotifications,
  getNotificationById,
  createNotification,
  markNotificationRead,
  markAllNotificationsRead,
  getUnreadNotificationCount,
  deleteNotification,
  clearNotifications,

  // Approval Workflows
  getApprovalWorkflows,
  getApprovalWorkflowById,
  createApprovalWorkflow,
  updateApprovalWorkflow,
  deleteApprovalWorkflow,
  getApprovalRequests,
  getApprovalRequestById,
  createApprovalRequest,
  approveRequest,
  rejectRequest,
  escalateRequest,
  cancelRequest,
  getPendingApprovalsForUser,

  // Status Master
  getStatusMaster,
  getStatusById,
  getStatusByCode,
  createStatus,
  updateStatus,
  deleteStatus,
  getStatusBadgeClass,
  getStatusColor,

  // Locations
  getLocations,
  getLocationById,
  createLocation,
  updateLocation,
  deleteLocation,
  getWarehouses,

  // EAV Fields
  getEavFields,
  getEavFieldById,
  createEavField,
  updateEavField,
  deleteEavField,

  // EAV Values
  getEavValues,
  getEavValueById,
  setEavValue,
  getEavValuesMap,
  bulkSetEavValues,
  deleteEavValue,
  validateEavValue,

  // Financial Period Locks
  getFinancialPeriodLocks,
  getFinancialPeriodLockById,
  createFinancialPeriodLock,
  updateFinancialPeriodLock,
  deleteFinancialPeriodLock,
  isDateLocked,
  getEffectiveLockDate,

  // Metrics Cache
  getMetricsCache,
  getCachedMetric,
  setCachedMetric,
  invalidateCachedMetric,
  invalidateAllMetrics,
  isMetricValid,
  getOrComputeMetric,

  // Reset
  resetSection,
  resetAllUnifiedData,
}
