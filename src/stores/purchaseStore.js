// Purchase Store with localStorage persistence

const STORAGE_KEYS = {
    purchaseRequisitions: 'sic-purchase-requisitions',
    purchaseOrders: 'sic-purchase-orders',
    vendors: 'sic-purchase-vendors',
    rfqs: 'sic-purchase-rfqs',
    grns: 'sic-purchase-grns',
    vendorReturns: 'sic-purchase-vendor-returns',
    supplierInvoices: 'sic-purchase-supplier-invoices',
    vendorEvaluations: 'sic-purchase-vendor-evaluations'
}

// ==================== VENDORS ====================
const initialVendors = [
    {
        id: 'vendor-001',
        vendorCode: 'VENDOR-001',
        name: 'TechSupply Inc.',
        contactPerson: 'John Smith',
        email: 'john@techsupply.com',
        phone: '+1-555-0101',
        address: '100 Tech Street, San Francisco, CA',
        country: 'USA',
        type: 'product',
        status: 'active',
        paymentTerms: 'Net 30',
        taxId: 'TAX-12345',
        creditLimit: 100000,
        rating: 4.5,
        notes: 'Primary technology supplier',
        createdAt: '2026-01-01'
    },
    {
        id: 'vendor-002',
        vendorCode: 'VENDOR-002',
        name: 'Office Essentials Co.',
        contactPerson: 'Sarah Johnson',
        email: 'sarah@officeessentials.com',
        phone: '+1-555-0102',
        address: '200 Office Ave, New York, NY',
        country: 'USA',
        type: 'consumable',
        status: 'active',
        paymentTerms: 'Net 15',
        taxId: 'TAX-67890',
        creditLimit: 50000,
        rating: 4.2,
        notes: 'Office supplies vendor',
        createdAt: '2026-01-01'
    }
]

// ==================== PURCHASE REQUISITIONS ====================
const initialPurchaseRequisitions = [
    {
        id: 'pr-001',
        requisitionNumber: 'PR-2026-001',
        requestedBy: 'emp-002',
        department: 'IT',
        requestDate: '2026-01-10',
        requiredBy: '2026-01-25',
        items: [
            { productId: 'prod-001', name: 'Laptop Computer', quantity: 5, estimatedPrice: 1200, priority: 'high' }
        ],
        totalEstimatedAmount: 6000,
        justification: 'Replacement of outdated laptops',
        status: 'pending',
        approvedBy: null,
        approvedDate: null,
        createdAt: '2026-01-10'
    }
]

// ==================== PURCHASE ORDERS ====================
const initialPurchaseOrders = [
    {
        id: 'po-001',
        orderNumber: 'PO-2026-001',
        vendorId: 'vendor-001',
        requisitionId: 'pr-001',
        orderDate: '2026-01-12',
        expectedDelivery: '2026-01-25',
        items: [
            { productId: 'prod-001', name: 'Laptop Computer', description: '15.6" Laptop', quantity: 5, unitPrice: 1100, discount: 0, tax: 0, total: 5500 }
        ],
        subtotal: 5500,
        discount: 0,
        tax: 0,
        shippingCost: 100,
        total: 5600,
        currency: 'USD',
        paymentTerms: 'Net 30',
        status: 'issued',
        received: false,
        invoiceMatched: false,
        notes: 'Fulfill from San Francisco warehouse',
        createdAt: '2026-01-12'
    }
]

// ==================== RFQS ====================
const initialRFQs = [
    {
        id: 'rfq-001',
        rfqNumber: 'RFQ-2026-001',
        title: 'Office Supplies Q1 2026',
        description: 'Quarterly office supplies procurement',
        requisitionId: null,
        issueDate: '2026-01-15',
        dueDate: '2026-01-25',
        items: [
            { name: 'Printer Paper', quantity: 500, unit: 'reams', specifications: 'A4, 80gsm' },
            { name: 'Toner Cartridges', quantity: 20, unit: 'pieces', specifications: 'HP LaserJet Pro M404' }
        ],
        status: 'sent',
        createdAt: '2026-01-15'
    }
]

// ==================== GRNS ====================
const initialGRNs = [
    {
        id: 'grn-001',
        grnNumber: 'GRN-2026-001',
        purchaseOrderId: 'po-001',
        vendorId: 'vendor-001',
        receiptDate: '2026-01-20',
        receivedBy: 'emp-003',
        items: [
            { productId: 'prod-001', name: 'Laptop Computer', orderedQty: 5, receivedQty: 5, rejectedQty: 0, reason: '' }
        ],
        notes: 'All items in good condition',
        status: 'completed',
        createdAt: '2026-01-20'
    }
]

// ==================== VENDOR RETURNS ====================
const initialVendorReturns = [
    {
        id: 'vr-001',
        returnNumber: 'VR-2026-001',
        vendorId: 'vendor-001',
        purchaseOrderId: 'po-001',
        returnDate: '2026-01-22',
        items: [
            { productId: 'prod-001', name: 'Laptop Computer', quantity: 1, reason: 'Damaged upon arrival' }
        ],
        returnType: 'replacement',
        status: 'approved',
        creditNoteId: null,
        notes: 'Received damaged unit',
        createdAt: '2026-01-22'
    }
]

// ==================== SUPPLIER INVOICES ====================
const initialSupplierInvoices = [
    {
        id: 'si-001',
        invoiceNumber: 'INV-2026-001',
        vendorId: 'vendor-001',
        purchaseOrderId: 'po-001',
        invoiceDate: '2026-01-21',
        dueDate: '2026-02-20',
        items: [
            { productId: 'prod-001', name: 'Laptop Computer', quantity: 5, unitPrice: 1100, tax: 0, total: 5500 }
        ],
        subtotal: 5500,
        discount: 0,
        tax: 0,
        shippingCost: 100,
        total: 5600,
        paid: 0,
        balance: 5600,
        status: 'received',
        threeWayMatched: true,
        createdAt: '2026-01-21'
    }
]

// ==================== VENDOR EVALUATIONS ====================
const initialVendorEvaluations = [
    {
        id: 've-001',
        vendorId: 'vendor-001',
        evaluationPeriod: 'Q4 2025',
        evaluationDate: '2026-01-05',
        evaluatedBy: 'emp-001',
        scores: {
            quality: 4.5,
            delivery: 4.0,
            price: 4.2,
            service: 4.3,
            documentation: 4.0
        },
        overallScore: 4.2,
        status: 'approved',
        notes: 'Good performance overall',
        recommendations: 'Maintain current relationship',
        createdAt: '2026-01-05'
    }
]

// ==================== HELPERS ====================
function getStore(key, initial) {
    const stored = localStorage.getItem(key)
    if (stored) return JSON.parse(stored)
    localStorage.setItem(key, JSON.stringify(initial))
    return initial
}

function setStore(key, data) {
    localStorage.setItem(key, JSON.stringify(data))
}

function generateNumber(prefix, year, sequence) {
    return `${prefix}-${year}-${String(sequence).padStart(4, '0')}`
}

// ==================== VENDORS CRUD ====================
export function getVendors(filters = {}) {
    let vendors = getStore(STORAGE_KEYS.vendors, initialVendors)
    if (filters.status) vendors = vendors.filter(v => v.status === filters.status)
    if (filters.type) vendors = vendors.filter(v => v.type === filters.type)
    return vendors
}

export function getVendor(id) {
    return getVendors().find(v => v.id === id)
}

export function createVendor(data) {
    const vendors = getStore(STORAGE_KEYS.vendors, initialVendors)
    const existingCount = vendors.length
    const vendorCode = data.vendorCode || `VENDOR-${String(existingCount + 1).padStart(3, '0')}`

    const newVendor = {
        ...data,
        id: `vendor-${Date.now()}`,
        vendorCode: vendorCode,
        rating: data.rating || 0,
        creditLimit: data.creditLimit || 0,
        status: 'active',
        createdAt: new Date().toISOString().split('T')[0]
    }
    vendors.push(newVendor)
    setStore(STORAGE_KEYS.vendors, vendors)
    return newVendor
}

export function updateVendor(id, data) {
    const vendors = getVendors()
    const index = vendors.findIndex(v => v.id === id)
    if (index === -1) return null
    vendors[index] = { ...vendors[index], ...data }
    setStore(STORAGE_KEYS.vendors, vendors)
    return vendors[index]
}

export function deleteVendor(id) {
    const vendors = getVendors().filter(v => v.id !== id)
    setStore(STORAGE_KEYS.vendors, vendors)
    return true
}

// ==================== PURCHASE REQUISITIONS CRUD ====================
export function getPurchaseRequisitions(filters = {}) {
    let reqs = getStore(STORAGE_KEYS.purchaseRequisitions, initialPurchaseRequisitions)
    if (filters.status) reqs = reqs.filter(r => r.status === filters.status)
    if (filters.department) reqs = reqs.filter(r => r.department === filters.department)
    return reqs
}

export function createPurchaseRequisition(data) {
    const reqs = getStore(STORAGE_KEYS.purchaseRequisitions, initialPurchaseRequisitions)
    const existingCount = reqs.length
    const requisitionNumber = generateNumber('PR', new Date().getFullYear(), existingCount + 1)

    const totalEstimated = data.items.reduce((sum, item) => sum + (item.estimatedPrice * item.quantity), 0)

    const newReq = {
        ...data,
        id: `pr-${Date.now()}`,
        requisitionNumber: data.requisitionNumber || requisitionNumber,
        requestDate: data.requestDate || new Date().toISOString().split('T')[0],
        totalEstimatedAmount: totalEstimated,
        status: 'pending',
        approvedBy: null,
        approvedDate: null,
        createdAt: new Date().toISOString().split('T')[0]
    }
    reqs.push(newReq)
    setStore(STORAGE_KEYS.purchaseRequisitions, reqs)
    return newReq
}

export function approvePurchaseRequisition(id, approvedBy) {
    const reqs = getStore(STORAGE_KEYS.purchaseRequisitions, initialPurchaseRequisitions)
    const index = reqs.findIndex(r => r.id === id)
    if (index === -1) return null
    reqs[index] = {
        ...reqs[index],
        status: 'approved',
        approvedBy: approvedBy,
        approvedDate: new Date().toISOString().split('T')[0]
    }
    setStore(STORAGE_KEYS.purchaseRequisitions, reqs)
    return reqs[index]
}

export function updatePurchaseRequisition(id, data) {
    const reqs = getStore(STORAGE_KEYS.purchaseRequisitions, initialPurchaseRequisitions)
    const index = reqs.findIndex(r => r.id === id)
    if (index === -1) return null
    reqs[index] = { ...reqs[index], ...data }
    setStore(STORAGE_KEYS.purchaseRequisitions, reqs)
    return reqs[index]
}

export function deletePurchaseRequisition(id) {
    const reqs = getStore(STORAGE_KEYS.purchaseRequisitions, initialPurchaseRequisitions).filter(r => r.id !== id)
    setStore(STORAGE_KEYS.purchaseRequisitions, reqs)
    return true
}

// ==================== PURCHASE ORDERS CRUD ====================
export function getPurchaseOrders(filters = {}) {
    let orders = getStore(STORAGE_KEYS.purchaseOrders, initialPurchaseOrders)
    if (filters.status) orders = orders.filter(o => o.status === filters.status)
    if (filters.vendorId) orders = orders.filter(o => o.vendorId === filters.vendorId)
    return orders
}

export function getPurchaseOrder(id) {
    return getPurchaseOrders().find(o => o.id === id)
}

export function createPurchaseOrder(data) {
    const orders = getStore(STORAGE_KEYS.purchaseOrders, initialPurchaseOrders)
    const existingCount = orders.length
    const orderNumber = generateNumber('PO', new Date().getFullYear(), existingCount + 1)

    const subtotal = data.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0)
    const discount = data.items.reduce((sum, item) => sum + item.discount, 0)
    const tax = data.items.reduce((sum, item) => sum + item.tax, 0)

    const newOrder = {
        ...data,
        id: `po-${Date.now()}`,
        orderNumber: data.orderNumber || orderNumber,
        orderDate: data.orderDate || new Date().toISOString().split('T')[0],
        subtotal,
        discount,
        tax,
        shippingCost: data.shippingCost || 0,
        total: subtotal - discount + tax + (data.shippingCost || 0),
        currency: data.currency || 'USD',
        status: 'draft',
        received: false,
        invoiceMatched: false,
        createdAt: new Date().toISOString().split('T')[0]
    }
    orders.push(newOrder)
    setStore(STORAGE_KEYS.purchaseOrders, orders)
    return newOrder
}

export function updatePurchaseOrder(id, data) {
    const orders = getStore(STORAGE_KEYS.purchaseOrders, initialPurchaseOrders)
    const index = orders.findIndex(o => o.id === id)
    if (index === -1) return null
    orders[index] = { ...orders[index], ...data }
    setStore(STORAGE_KEYS.purchaseOrders, orders)
    return orders[index]
}

export function deletePurchaseOrder(id) {
    const orders = getStore(STORAGE_KEYS.purchaseOrders, initialPurchaseOrders).filter(o => o.id !== id)
    setStore(STORAGE_KEYS.purchaseOrders, orders)
    return true
}

export function issuePurchaseOrder(id) {
    return updatePurchaseOrder(id, { status: 'issued' })
}

export function receivePurchaseOrder(id) {
    return updatePurchaseOrder(id, { status: 'received' })
}

// ==================== RFQS CRUD ====================
export function getRFQs(filters = {}) {
    let rfqs = getStore(STORAGE_KEYS.rfqs, initialRFQs)
    if (filters.status) rfqs = rfqs.filter(r => r.status === filters.status)
    return rfqs
}

export function createRFQ(data) {
    const rfqs = getStore(STORAGE_KEYS.rfqs, initialRFQs)
    const existingCount = rfqs.length
    const rfqNumber = generateNumber('RFQ', new Date().getFullYear(), existingCount + 1)

    const newRFQ = {
        ...data,
        id: `rfq-${Date.now()}`,
        rfqNumber: data.rfqNumber || rfqNumber,
        issueDate: data.issueDate || new Date().toISOString().split('T')[0],
        status: 'draft',
        createdAt: new Date().toISOString().split('T')[0]
    }
    rfqs.push(newRFQ)
    setStore(STORAGE_KEYS.rfqs, rfqs)
    return newRFQ
}

export function updateRFQ(id, data) {
    const rfqs = getStore(STORAGE_KEYS.rfqs, initialRFQs)
    const index = rfqs.findIndex(r => r.id === id)
    if (index === -1) return null
    rfqs[index] = { ...rfqs[index], ...data }
    setStore(STORAGE_KEYS.rfqs, rfqs)
    return rfqs[index]
}

export function deleteRFQ(id) {
    const rfqs = getStore(STORAGE_KEYS.rfqs, initialRFQs).filter(r => r.id !== id)
    setStore(STORAGE_KEYS.rfqs, rfqs)
    return true
}

export function sendRFQ(id) {
    return updateRFQ(id, { status: 'sent' })
}

// ==================== GRNS CRUD ====================
export function getGRNs(filters = {}) {
    let grns = getStore(STORAGE_KEYS.grns, initialGRNs)
    if (filters.status) grns = grns.filter(g => g.status === filters.status)
    if (filters.vendorId) grns = grns.filter(g => g.vendorId === filters.vendorId)
    return grns
}

export function createGRN(data) {
    const grns = getStore(STORAGE_KEYS.grns, initialGRNs)
    const existingCount = grns.length
    const grnNumber = generateNumber('GRN', new Date().getFullYear(), existingCount + 1)

    const newGRN = {
        ...data,
        id: `grn-${Date.now()}`,
        grnNumber: data.grnNumber || grnNumber,
        receiptDate: data.receiptDate || new Date().toISOString().split('T')[0],
        status: 'pending',
        createdAt: new Date().toISOString().split('T')[0]
    }
    grns.push(newGRN)
    setStore(STORAGE_KEYS.grns, grns)
    return newGRN
}

export function updateGRN(id, data) {
    const grns = getStore(STORAGE_KEYS.grns, initialGRNs)
    const index = grns.findIndex(g => g.id === id)
    if (index === -1) return null
    grns[index] = { ...grns[index], ...data }
    setStore(STORAGE_KEYS.grns, grns)
    return grns[index]
}

export function deleteGRN(id) {
    const grns = getStore(STORAGE_KEYS.grns, initialGRNs).filter(g => g.id !== id)
    setStore(STORAGE_KEYS.grns, grns)
    return true
}

// ==================== SUPPLIER INVOICES CRUD ====================
export function getSupplierInvoices(filters = {}) {
    let invoices = getStore(STORAGE_KEYS.supplierInvoices, initialSupplierInvoices)
    if (filters.status) invoices = invoices.filter(i => i.status === filters.status)
    if (filters.vendorId) invoices = invoices.filter(i => i.vendorId === filters.vendorId)
    return invoices
}

export function createSupplierInvoice(data) {
    const invoices = getStore(STORAGE_KEYS.supplierInvoices, initialSupplierInvoices)
    const existingCount = invoices.length
    const invoiceNumber = generateNumber('INV', new Date().getFullYear(), existingCount + 1)

    const subtotal = data.items.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0)
    const discount = data.discount || 0
    const tax = data.items.reduce((sum, item) => sum + item.tax, 0)

    const newInvoice = {
        ...data,
        id: `si-${Date.now()}`,
        invoiceNumber: data.invoiceNumber || invoiceNumber,
        invoiceDate: data.invoiceDate || new Date().toISOString().split('T')[0],
        subtotal,
        discount,
        tax,
        shippingCost: data.shippingCost || 0,
        total: subtotal - discount + tax + (data.shippingCost || 0),
        paid: 0,
        balance: subtotal - discount + tax + (data.shippingCost || 0),
        status: 'received',
        threeWayMatched: false,
        createdAt: new Date().toISOString().split('T')[0]
    }
    invoices.push(newInvoice)
    setStore(STORAGE_KEYS.supplierInvoices, invoices)
    return newInvoice
}

export function updateSupplierInvoice(id, data) {
    const invoices = getStore(STORAGE_KEYS.supplierInvoices, initialSupplierInvoices)
    const index = invoices.findIndex(i => i.id === id)
    if (index === -1) return null
    invoices[index] = { ...invoices[index], ...data }
    setStore(STORAGE_KEYS.supplierInvoices, invoices)
    return invoices[index]
}

export function performThreeWayMatch(invoiceId) {
    const invoice = getSupplierInvoices().find(i => i.id === invoiceId)
    if (!invoice) return null

    const po = getPurchaseOrders().find(o => o.id === invoice.purchaseOrderId)
    const grn = getGRNs().find(g => g.purchaseOrderId === invoice.purchaseOrderId)

    const matched = po && grn && po.status === 'received' && grn.status === 'completed'

    return updateSupplierInvoice(invoiceId, { threeWayMatched: matched })
}

// ==================== VENDOR EVALUATIONS CRUD ====================
export function getVendorEvaluations(filters = {}) {
    let evaluations = getStore(STORAGE_KEYS.vendorEvaluations, initialVendorEvaluations)
    if (filters.vendorId) evaluations = evaluations.filter(e => e.vendorId === filters.vendorId)
    return evaluations
}

export function createVendorEvaluation(data) {
    const evaluations = getStore(STORAGE_KEYS.vendorEvaluations, initialVendorEvaluations)

    const overallScore = Object.values(data.scores || {}).reduce((sum, score) => sum + score, 0) / 5

    const newEvaluation = {
        ...data,
        id: `ve-${Date.now()}`,
        evaluationDate: data.evaluationDate || new Date().toISOString().split('T')[0],
        overallScore: overallScore,
        status: 'draft',
        createdAt: new Date().toISOString().split('T')[0]
    }
    evaluations.push(newEvaluation)
    setStore(STORAGE_KEYS.vendorEvaluations, evaluations)
    return newEvaluation
}

export function updateVendorEvaluation(id, data) {
    const evaluations = getStore(STORAGE_KEYS.vendorEvaluations, initialVendorEvaluations)
    const index = evaluations.findIndex(e => e.id === id)
    if (index === -1) return null
    evaluations[index] = { ...evaluations[index], ...data }
    setStore(STORAGE_KEYS.vendorEvaluations, evaluations)
    return evaluations[index]
}

// ==================== STATISTICS ====================
export function getPurchaseStats() {
    const vendors = getVendors()
    const requisitions = getPurchaseRequisitions()
    const orders = getPurchaseOrders()
    const rfqs = getRFQs()
    const grns = getGRNs()
    const supplierInvoices = getSupplierInvoices()

    const totalOrdersValue = orders.reduce((sum, o) => sum + o.total, 0)
    const pendingOrders = orders.filter(o => o.status === 'issued').length
    const receivedOrders = orders.filter(o => o.status === 'received').length

    return {
        totalVendors: vendors.length,
        activeVendors: vendors.filter(v => v.status === 'active').length,
        totalRequisitions: requisitions.length,
        pendingRequisitions: requisitions.filter(r => r.status === 'pending').length,
        approvedRequisitions: requisitions.filter(r => r.status === 'approved').length,
        totalOrders: orders.length,
        pendingOrders: pendingOrders,
        receivedOrders: receivedOrders,
        ordersValue: totalOrdersValue,
        totalRFQs: rfqs.length,
        openRFQs: rfqs.filter(r => r.status === 'sent').length,
        totalGRNs: grns.length,
        totalSupplierInvoices: supplierInvoices.length,
        pendingInvoices: supplierInvoices.filter(i => i.status === 'received' && i.balance > 0).length,
        averageVendorRating: vendors.length > 0 ? vendors.reduce((sum, v) => sum + v.rating, 0) / vendors.length : 0
    }
}
