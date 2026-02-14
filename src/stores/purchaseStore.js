// Purchase Store — localStorage-based with seed data & full CRUD

const KEYS = {
    vendors: 'erp_vendors',
    requisitions: 'erp_purchaseRequisitions',
    orders: 'erp_purchaseOrders',
    rfqs: 'erp_rfqs',
    grns: 'erp_grns',
    evaluations: 'erp_vendorEvaluations',
    invoices: 'erp_supplierInvoices',
    returns: 'erp_vendorReturns',
    subscriptions: 'erp_subscriptions'
}

function load(key) {
    try { return JSON.parse(localStorage.getItem(key)) || null } catch { return null }
}
function save(key, data) { localStorage.setItem(key, JSON.stringify(data)) }
function genId(prefix) { return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` }

// ========== SEED DATA ==========

const SEED_VENDORS = [
    { id: 'v-001', vendorCode: 'VND-001', name: 'Sharma Electronics', contactPerson: 'Rajesh Sharma', email: 'rajesh@sharmaelectronics.in', phone: '+91 98765 43210', address: '45 Nehru Place, New Delhi', country: 'India', type: 'product', paymentTerms: 'Net 30', taxId: 'GSTIN22AAAAA0000A1Z5', creditLimit: 500000, rating: 4, status: 'active', notes: 'Reliable supplier for electronic components', createdAt: '2025-08-15' },
    { id: 'v-002', vendorCode: 'VND-002', name: 'Kumar Office Supplies', contactPerson: 'Priya Kumar', email: 'priya@kumaroffice.in', phone: '+91 87654 32109', address: '12 MG Road, Bangalore', country: 'India', type: 'consumable', paymentTerms: 'Net 15', taxId: 'GSTIN29BBBBB0000B1Z6', creditLimit: 200000, rating: 3, status: 'active', notes: 'Office stationery and supplies', createdAt: '2025-09-01' },
    { id: 'v-003', vendorCode: 'VND-003', name: 'TechServe Solutions', contactPerson: 'Amit Patel', email: 'amit@techserve.in', phone: '+91 76543 21098', address: '78 Andheri East, Mumbai', country: 'India', type: 'service', paymentTerms: 'Net 45', taxId: 'GSTIN27CCCCC0000C1Z7', creditLimit: 1000000, rating: 5, status: 'active', notes: 'IT services, server maintenance, cloud infra', createdAt: '2025-07-20' },
    { id: 'v-004', vendorCode: 'VND-004', name: 'Patel Raw Materials', contactPerson: 'Suresh Patel', email: 'suresh@patelraw.in', phone: '+91 65432 10987', address: '34 GIDC, Ahmedabad', country: 'India', type: 'product', paymentTerms: 'Net 30', taxId: 'GSTIN24DDDDD0000D1Z8', creditLimit: 800000, rating: 4, status: 'active', notes: 'Raw materials for manufacturing', createdAt: '2025-10-05' },
    { id: 'v-005', vendorCode: 'VND-005', name: 'GreenPack Packaging', contactPerson: 'Meera Joshi', email: 'meera@greenpack.in', phone: '+91 54321 09876', address: '56 Industrial Area, Pune', country: 'India', type: 'product', paymentTerms: 'Net 30', taxId: 'GSTIN27EEEEE0000E1Z9', creditLimit: 350000, rating: 3, status: 'active', notes: 'Eco-friendly packaging materials', createdAt: '2025-11-12' },
    { id: 'v-006', vendorCode: 'VND-006', name: 'CloudNine IT Services', contactPerson: 'Vikram Singh', email: 'vikram@cloudnine.in', phone: '+91 43210 98765', address: '90 Cyber City, Gurugram', country: 'India', type: 'service', paymentTerms: 'Net 30', taxId: 'GSTIN06FFFFF0000F1Z0', creditLimit: 1500000, rating: 5, status: 'active', notes: 'Cloud hosting, SaaS subscriptions, IT consulting', createdAt: '2025-06-18' },
    { id: 'v-007', vendorCode: 'VND-007', name: 'Singh Furniture Works', contactPerson: 'Harpreet Singh', email: 'harpreet@singhfurniture.in', phone: '+91 32109 87654', address: '23 Rajouri Garden, New Delhi', country: 'India', type: 'product', paymentTerms: 'Net 60', taxId: 'GSTIN07GGGGG0000G1Z1', creditLimit: 600000, rating: 4, status: 'inactive', notes: 'Office furniture and fixtures', createdAt: '2025-05-22' }
]

const SEED_REQUISITIONS = [
    { id: 'pr-001', number: 'PR-0001', requestDate: '2026-01-10', requiredBy: '2026-01-25', items: [{ name: 'Laptop Dell Vostro', qty: 5, unitPrice: 65000 }], totalAmount: 325000, priority: 'high', status: 'approved', notes: 'New hire laptops for Q1 batch', vendorId: 'v-001', department: 'IT', approvedBy: 'Admin', createdAt: '2026-01-10' },
    { id: 'pr-002', number: 'PR-0002', requestDate: '2026-01-15', requiredBy: '2026-02-01', items: [{ name: 'A4 Paper Reams', qty: 100, unitPrice: 250 }, { name: 'Printer Cartridges', qty: 10, unitPrice: 2500 }], totalAmount: 50000, priority: 'medium', status: 'pending', notes: 'Monthly office supplies', vendorId: 'v-002', department: 'Admin', createdAt: '2026-01-15' },
    { id: 'pr-003', number: 'PR-0003', requestDate: '2026-01-20', requiredBy: '2026-02-10', items: [{ name: 'Server Rack 42U', qty: 2, unitPrice: 85000 }], totalAmount: 170000, priority: 'urgent', status: 'approved', notes: 'Data center expansion', vendorId: 'v-003', department: 'IT', approvedBy: 'CTO', createdAt: '2026-01-20' },
    { id: 'pr-004', number: 'PR-0004', requestDate: '2026-02-01', requiredBy: '2026-02-20', items: [{ name: 'Steel Rods 12mm', qty: 500, unitPrice: 65 }], totalAmount: 32500, priority: 'medium', status: 'pending', notes: 'Manufacturing floor requirement', vendorId: 'v-004', department: 'Production', createdAt: '2026-02-01' },
    { id: 'pr-005', number: 'PR-0005', requestDate: '2026-02-05', requiredBy: '2026-02-15', items: [{ name: 'Ergonomic Chairs', qty: 20, unitPrice: 12000 }], totalAmount: 240000, priority: 'low', status: 'rejected', notes: 'Budget exceeded for this quarter', vendorId: 'v-007', department: 'HR', createdAt: '2026-02-05' }
]

const SEED_ORDERS = [
    { id: 'po-001', orderNumber: 'PO-0001', vendorId: 'v-001', orderDate: '2026-01-12', expectedDelivery: '2026-01-28', items: [{ id: 'item-1', name: 'Laptop Dell Vostro', description: '15.6" FHD, i5, 16GB RAM', quantity: 5, unitPrice: 65000, discount: 5000, tax: 54000, total: 374000 }], shippingCost: 2000, currency: 'INR', paymentTerms: 'Net 30', notes: 'Approved PR-0001', status: 'issued', total: 376000, createdAt: '2026-01-12' },
    { id: 'po-002', orderNumber: 'PO-0002', vendorId: 'v-003', orderDate: '2026-01-22', expectedDelivery: '2026-02-15', items: [{ id: 'item-2', name: 'Server Rack 42U', description: 'Standard 42U with cable management', quantity: 2, unitPrice: 85000, discount: 0, tax: 30600, total: 200600 }], shippingCost: 5000, currency: 'INR', paymentTerms: 'Net 45', notes: 'Data center project', status: 'confirmed', total: 205600, createdAt: '2026-01-22' },
    { id: 'po-003', orderNumber: 'PO-0003', vendorId: 'v-002', orderDate: '2026-01-18', expectedDelivery: '2026-02-05', items: [{ id: 'item-3', name: 'A4 Paper Reams', description: '75 GSM, 500 sheets', quantity: 100, unitPrice: 250, discount: 0, tax: 4500, total: 29500 }, { id: 'item-4', name: 'Printer Cartridges', description: 'HP LaserJet Compatible', quantity: 10, unitPrice: 2500, discount: 500, tax: 4140, total: 28640 }], shippingCost: 1000, currency: 'INR', paymentTerms: 'Net 15', notes: 'Monthly supplies', status: 'received', total: 59140, createdAt: '2026-01-18' },
    { id: 'po-004', orderNumber: 'PO-0004', vendorId: 'v-005', orderDate: '2026-02-01', expectedDelivery: '2026-02-18', items: [{ id: 'item-5', name: 'Corrugated Boxes', description: '12x12x12 inches', quantity: 500, unitPrice: 35, discount: 0, tax: 3150, total: 20650 }], shippingCost: 1500, currency: 'INR', paymentTerms: 'Net 30', notes: 'Packaging for Q1 shipments', status: 'draft', total: 22150, createdAt: '2026-02-01' }
]

const SEED_RFQS = [
    { id: 'rfq-001', number: 'RFQ-0001', rfqDate: '2026-01-08', validUntil: '2026-01-22', items: [{ name: 'Laptop Dell Vostro', qty: 5, spec: '15.6" FHD, i5, 16GB' }], totalEstimated: 350000, status: 'closed', notes: 'Comparing 3 vendors for laptop procurement', vendorIds: ['v-001', 'v-003'], quotes: [{ vendorId: 'v-001', amount: 325000, deliveryDays: 7 }, { vendorId: 'v-003', amount: 340000, deliveryDays: 5 }], createdAt: '2026-01-08' },
    { id: 'rfq-002', number: 'RFQ-0002', rfqDate: '2026-01-25', validUntil: '2026-02-08', items: [{ name: 'Office Desks', qty: 15, spec: 'Standing desk, adjustable' }], totalEstimated: 450000, status: 'sent', notes: 'New office setup', vendorIds: ['v-007'], quotes: [], createdAt: '2026-01-25' },
    { id: 'rfq-003', number: 'RFQ-0003', rfqDate: '2026-02-05', validUntil: '2026-02-19', items: [{ name: 'Industrial Packaging Material', qty: 1000, spec: 'Eco-friendly, biodegradable' }], totalEstimated: 75000, status: 'draft', notes: 'Quarterly packaging needs', vendorIds: ['v-005'], quotes: [], createdAt: '2026-02-05' }
]

const SEED_GRNS = [
    { id: 'grn-001', grnNumber: 'GRN-0001', grnDate: '2026-02-03', poNumber: 'PO-0003', vendorId: 'v-002', items: [{ name: 'A4 Paper Reams', orderedQty: 100, receivedQty: 100 }, { name: 'Printer Cartridges', orderedQty: 10, receivedQty: 10 }], totalQty: 110, totalAmount: 59140, status: 'approved', receivedBy: 'Ravi Kumar', notes: 'All items received in good condition', createdAt: '2026-02-03' },
    { id: 'grn-002', grnNumber: 'GRN-0002', grnDate: '2026-02-10', poNumber: 'PO-0001', vendorId: 'v-001', items: [{ name: 'Laptop Dell Vostro', orderedQty: 5, receivedQty: 4 }], totalQty: 4, totalAmount: 299200, status: 'pending', receivedBy: 'Amit Shah', notes: '1 laptop pending — vendor will ship by Feb 15', createdAt: '2026-02-10' }
]

const SEED_EVALUATIONS = [
    { id: 'eval-001', evaluationDate: '2026-01-30', vendorId: 'v-001', qualityScore: 8, deliveryScore: 7, priceScore: 7, serviceScore: 9, totalScore: 78, comments: 'Consistent quality, minor delay on last order', evaluator: 'Procurement Head', createdAt: '2026-01-30' },
    { id: 'eval-002', evaluationDate: '2026-01-30', vendorId: 'v-002', qualityScore: 7, deliveryScore: 8, priceScore: 9, serviceScore: 7, totalScore: 78, comments: 'Good pricing, reliable delivery', evaluator: 'Procurement Head', createdAt: '2026-01-30' },
    { id: 'eval-003', evaluationDate: '2026-01-30', vendorId: 'v-003', qualityScore: 9, deliveryScore: 9, priceScore: 6, serviceScore: 10, totalScore: 85, comments: 'Premium service quality, slightly expensive', evaluator: 'IT Manager', createdAt: '2026-01-30' },
    { id: 'eval-004', evaluationDate: '2026-02-05', vendorId: 'v-005', qualityScore: 6, deliveryScore: 5, priceScore: 8, serviceScore: 6, totalScore: 63, comments: 'Packaging quality needs improvement', evaluator: 'Warehouse Lead', createdAt: '2026-02-05' }
]

const SEED_INVOICES = [
    { id: 'inv-001', invoiceNumber: 'SINV-0001', invoiceDate: '2026-02-04', dueDate: '2026-02-19', vendorId: 'v-002', poNumber: 'PO-0003', grnNumber: 'GRN-0001', items: [{ name: 'A4 Paper + Cartridges' }], totalAmount: 54500, taxAmount: 9810, status: 'matched', matchResult: { matched: true }, notes: 'Auto-matched with PO-0003 and GRN-0001', createdAt: '2026-02-04' },
    { id: 'inv-002', invoiceNumber: 'SINV-0002', invoiceDate: '2026-02-11', dueDate: '2026-03-12', vendorId: 'v-001', poNumber: 'PO-0001', grnNumber: 'GRN-0002', items: [{ name: 'Laptops (partial)' }], totalAmount: 299200, taxAmount: 53856, status: 'pending', notes: 'Partial delivery — 4 of 5 laptops', createdAt: '2026-02-11' },
    { id: 'inv-003', invoiceNumber: 'SINV-0003', invoiceDate: '2026-02-08', dueDate: '2026-02-23', vendorId: 'v-006', poNumber: '', grnNumber: '', items: [{ name: 'Cloud hosting - Feb 2026' }], totalAmount: 45000, taxAmount: 8100, status: 'paid', notes: 'Monthly cloud infra invoice', createdAt: '2026-02-08' }
]

const SEED_RETURNS = [
    { id: 'ret-001', returnNumber: 'RET-0001', returnDate: '2026-02-12', vendorId: 'v-001', grnNumber: 'GRN-0002', items: [], reason: 'Defective screen on 1 laptop', returnQty: 1, refundAmount: 74800, status: 'pending', notes: 'Vendor agreed to replace', createdAt: '2026-02-12' }
]

const SEED_SUBSCRIPTIONS = [
    { id: 'sub-001', name: 'AWS Cloud Services', vendor: 'Amazon Web Services', vendorId: 'v-006', cost: 95000, period: 'Monthly', nextRenewal: '2026-03-01', status: 'Active', users: 'N/A', category: 'Infrastructure', createdAt: '2025-06-01' },
    { id: 'sub-002', name: 'Zoho One Suite', vendor: 'Zoho Corporation', vendorId: '', cost: 45000, period: 'Monthly', nextRenewal: '2026-03-01', status: 'Active', users: '50', category: 'Productivity', createdAt: '2025-07-15' },
    { id: 'sub-003', name: 'Slack Business+', vendor: 'Salesforce', vendorId: '', cost: 35000, period: 'Monthly', nextRenewal: '2026-02-20', status: 'Expiring Soon', users: '120', category: 'Communication', createdAt: '2025-04-10' },
    { id: 'sub-004', name: 'GitHub Enterprise', vendor: 'Microsoft', vendorId: '', cost: 28000, period: 'Monthly', nextRenewal: '2026-03-15', status: 'Active', users: '30', category: 'Development', createdAt: '2025-08-20' },
    { id: 'sub-005', name: 'Figma Business', vendor: 'Figma Inc.', vendorId: '', cost: 8500, period: 'Monthly', nextRenewal: '2026-03-05', status: 'Active', users: '8', category: 'Design', createdAt: '2025-09-01' },
    { id: 'sub-006', name: 'Tally Prime', vendor: 'Tally Solutions', vendorId: '', cost: 18000, period: 'Annual', nextRenewal: '2026-09-01', status: 'Active', users: '5', category: 'Accounting', createdAt: '2025-09-01' }
]

// ========== INIT ==========
function initStore(key, seed) {
    if (!load(key)) save(key, seed)
}

initStore(KEYS.vendors, SEED_VENDORS)
initStore(KEYS.requisitions, SEED_REQUISITIONS)
initStore(KEYS.orders, SEED_ORDERS)
initStore(KEYS.rfqs, SEED_RFQS)
initStore(KEYS.grns, SEED_GRNS)
initStore(KEYS.evaluations, SEED_EVALUATIONS)
initStore(KEYS.invoices, SEED_INVOICES)
initStore(KEYS.returns, SEED_RETURNS)
initStore(KEYS.subscriptions, SEED_SUBSCRIPTIONS)

// ==================== VENDORS ====================

export const getVendors = (filters = {}) => {
    let data = load(KEYS.vendors) || []
    if (filters.status) data = data.filter(v => v.status === filters.status)
    if (filters.type) data = data.filter(v => v.type === filters.type)
    if (filters.search) {
        const s = filters.search.toLowerCase()
        data = data.filter(v => v.name.toLowerCase().includes(s) || v.vendorCode.toLowerCase().includes(s))
    }
    return data
}

export const getVendor = (id) => {
    const data = load(KEYS.vendors) || []
    return data.find(v => v.id === id) || null
}

export const createVendor = (data) => {
    const all = load(KEYS.vendors) || []
    const vendor = { ...data, id: genId('v'), vendorCode: data.vendorCode || `VND-${String(all.length + 1).padStart(3, '0')}`, status: data.status || 'active', createdAt: new Date().toISOString().split('T')[0] }
    all.push(vendor)
    save(KEYS.vendors, all)
    return vendor
}

export const updateVendor = (id, data) => {
    const all = load(KEYS.vendors) || []
    const idx = all.findIndex(v => v.id === id)
    if (idx !== -1) { all[idx] = { ...all[idx], ...data }; save(KEYS.vendors, all) }
    return all[idx]
}

export const deleteVendor = (id) => {
    const all = (load(KEYS.vendors) || []).filter(v => v.id !== id)
    save(KEYS.vendors, all)
    return true
}

// ==================== PURCHASE REQUISITIONS ====================

export const getPurchaseRequisitions = (filters = {}) => {
    let data = load(KEYS.requisitions) || []
    if (filters.status) data = data.filter(r => r.status === filters.status)
    if (filters.department) data = data.filter(r => r.department === filters.department)
    return data
}

export const createPurchaseRequisition = (data) => {
    const all = load(KEYS.requisitions) || []
    const req = { ...data, id: genId('pr'), number: `PR-${String(all.length + 1).padStart(4, '0')}`, status: data.status || 'pending', createdAt: new Date().toISOString().split('T')[0] }
    all.push(req)
    save(KEYS.requisitions, all)
    return req
}

export const updatePurchaseRequisition = (id, data) => {
    const all = load(KEYS.requisitions) || []
    const idx = all.findIndex(r => r.id === id)
    if (idx !== -1) { all[idx] = { ...all[idx], ...data }; save(KEYS.requisitions, all) }
    return all[idx]
}

export const approvePurchaseRequisition = (id, approvedBy) => {
    return updatePurchaseRequisition(id, { status: 'approved', approvedBy })
}

export const deletePurchaseRequisition = (id) => {
    const all = (load(KEYS.requisitions) || []).filter(r => r.id !== id)
    save(KEYS.requisitions, all)
    return true
}

// ==================== PURCHASE ORDERS ====================

export const getPurchaseOrders = (filters = {}) => {
    let data = load(KEYS.orders) || []
    if (filters.status) data = data.filter(o => o.status === filters.status)
    if (filters.vendorId) data = data.filter(o => o.vendorId === filters.vendorId)
    return data
}

export const createPurchaseOrder = (data) => {
    const all = load(KEYS.orders) || []
    const total = (data.items || []).reduce((s, i) => s + ((i.quantity * i.unitPrice) - (i.discount || 0) + (i.tax || 0)), 0) + (data.shippingCost || 0)
    const po = { ...data, id: genId('po'), orderNumber: `PO-${String(all.length + 1).padStart(4, '0')}`, orderDate: data.orderDate || new Date().toISOString().split('T')[0], status: 'draft', total, createdAt: new Date().toISOString().split('T')[0] }
    all.push(po)
    save(KEYS.orders, all)
    return po
}

export const updatePurchaseOrder = (id, data) => {
    const all = load(KEYS.orders) || []
    const idx = all.findIndex(o => o.id === id)
    if (idx !== -1) {
        const total = (data.items || all[idx].items || []).reduce((s, i) => s + ((i.quantity * i.unitPrice) - (i.discount || 0) + (i.tax || 0)), 0) + (data.shippingCost || all[idx].shippingCost || 0)
        all[idx] = { ...all[idx], ...data, total }
        save(KEYS.orders, all)
    }
    return all[idx]
}

export const updatePOStatus = (id, status) => updatePurchaseOrder(id, { status })
export const issuePurchaseOrder = (id) => updatePOStatus(id, 'issued')
export const receivePurchaseOrder = (id) => updatePOStatus(id, 'received')

export const deletePurchaseOrder = (id) => {
    const all = (load(KEYS.orders) || []).filter(o => o.id !== id)
    save(KEYS.orders, all)
    return true
}

// ==================== RFQs ====================

export const getRFQs = (filters = {}) => {
    let data = load(KEYS.rfqs) || []
    if (filters.status) data = data.filter(r => r.status === filters.status)
    return data
}

export const createRFQ = (data) => {
    const all = load(KEYS.rfqs) || []
    const rfq = { ...data, id: genId('rfq'), number: `RFQ-${String(all.length + 1).padStart(4, '0')}`, status: 'draft', quotes: [], createdAt: new Date().toISOString().split('T')[0] }
    all.push(rfq)
    save(KEYS.rfqs, all)
    return rfq
}

export const updateRFQ = (id, data) => {
    const all = load(KEYS.rfqs) || []
    const idx = all.findIndex(r => r.id === id)
    if (idx !== -1) { all[idx] = { ...all[idx], ...data }; save(KEYS.rfqs, all) }
    return all[idx]
}

export const deleteRFQ = (id) => {
    const all = (load(KEYS.rfqs) || []).filter(r => r.id !== id)
    save(KEYS.rfqs, all)
    return true
}

export const sendRFQ = (id) => updateRFQ(id, { status: 'sent' })

export const addQuoteToRFQ = (id, quoteData) => {
    const all = load(KEYS.rfqs) || []
    const idx = all.findIndex(r => r.id === id)
    if (idx !== -1) {
        all[idx].quotes = [...(all[idx].quotes || []), quoteData]
        save(KEYS.rfqs, all)
    }
    return all[idx]
}

// ==================== GRNs ====================

export const getGRNs = (filters = {}) => {
    let data = load(KEYS.grns) || []
    if (filters.vendorId) data = data.filter(g => g.vendorId === filters.vendorId)
    if (filters.purchaseOrderId) data = data.filter(g => g.poNumber === filters.purchaseOrderId)
    return data
}

export const createGRN = (data) => {
    const all = load(KEYS.grns) || []
    const grn = { ...data, id: genId('grn'), grnNumber: `GRN-${String(all.length + 1).padStart(4, '0')}`, status: data.status || 'pending', createdAt: new Date().toISOString().split('T')[0] }
    all.push(grn)
    save(KEYS.grns, all)
    return grn
}

export const updateGRN = (id, data) => {
    const all = load(KEYS.grns) || []
    const idx = all.findIndex(g => g.id === id)
    if (idx !== -1) { all[idx] = { ...all[idx], ...data }; save(KEYS.grns, all) }
    return all[idx]
}

export const deleteGRN = (id) => {
    const all = (load(KEYS.grns) || []).filter(g => g.id !== id)
    save(KEYS.grns, all)
    return true
}

// ==================== VENDOR EVALUATIONS ====================

export const getVendorEvaluations = (vendorId) => {
    let data = load(KEYS.evaluations) || []
    if (vendorId) data = data.filter(e => e.vendorId === vendorId)
    return data
}

export const createVendorEvaluation = (data) => {
    const all = load(KEYS.evaluations) || []
    const eval_ = { ...data, id: genId('eval'), createdAt: new Date().toISOString().split('T')[0] }
    all.push(eval_)
    save(KEYS.evaluations, all)
    return eval_
}

export const updateVendorEvaluation = (id, data) => {
    const all = load(KEYS.evaluations) || []
    const idx = all.findIndex(e => e.id === id)
    if (idx !== -1) { all[idx] = { ...all[idx], ...data }; save(KEYS.evaluations, all) }
    return all[idx]
}

export const deleteVendorEvaluation = (id) => {
    const all = (load(KEYS.evaluations) || []).filter(e => e.id !== id)
    save(KEYS.evaluations, all)
    return true
}

// ==================== SUPPLIER INVOICES ====================

export const getSupplierInvoices = () => {
    return load(KEYS.invoices) || []
}

export const createSupplierInvoice = (data) => {
    const all = load(KEYS.invoices) || []
    const inv = { ...data, id: genId('inv'), invoiceNumber: data.invoiceNumber || `SINV-${String(all.length + 1).padStart(4, '0')}`, status: data.status || 'pending', createdAt: new Date().toISOString().split('T')[0] }
    all.push(inv)
    save(KEYS.invoices, all)
    return inv
}

export const updateSupplierInvoice = (id, data) => {
    const all = load(KEYS.invoices) || []
    const idx = all.findIndex(i => i.id === id)
    if (idx !== -1) { all[idx] = { ...all[idx], ...data }; save(KEYS.invoices, all) }
    return all[idx]
}

export const performThreeWayMatch = (invoiceId) => {
    const invoices = load(KEYS.invoices) || []
    const inv = invoices.find(i => i.id === invoiceId)
    if (!inv) return { matched: false, reason: 'Invoice not found' }

    const pos = load(KEYS.orders) || []
    const grns = load(KEYS.grns) || []

    const po = pos.find(p => p.orderNumber === inv.poNumber)
    if (!po) return { matched: false, reason: `PO ${inv.poNumber} not found` }

    const grn = grns.find(g => g.grnNumber === inv.grnNumber)
    if (!grn) return { matched: false, reason: `GRN ${inv.grnNumber} not found` }

    // Check amounts within 2% tolerance
    const tolerance = 0.02
    const poTotal = po.total || 0
    const diff = Math.abs(inv.totalAmount - poTotal) / poTotal
    if (diff > tolerance) {
        updateSupplierInvoice(invoiceId, { status: 'mismatch', matchResult: { matched: false, reason: `Amount difference ${(diff * 100).toFixed(1)}% exceeds 2% tolerance` } })
        return { matched: false, reason: `Amount difference ${(diff * 100).toFixed(1)}% exceeds 2% tolerance (Invoice: ₹${inv.totalAmount}, PO: ₹${poTotal})` }
    }

    updateSupplierInvoice(invoiceId, { status: 'matched', matchResult: { matched: true } })
    return { matched: true }
}

// ==================== VENDOR RETURNS ====================

export const getVendorReturns = () => {
    return load(KEYS.returns) || []
}

export const createVendorReturn = (data) => {
    const all = load(KEYS.returns) || []
    const ret = { ...data, id: genId('ret'), returnNumber: data.returnNumber || `RET-${String(all.length + 1).padStart(4, '0')}`, status: data.status || 'pending', createdAt: new Date().toISOString().split('T')[0] }
    all.push(ret)
    save(KEYS.returns, all)
    return ret
}

export const updateVendorReturn = (id, data) => {
    const all = load(KEYS.returns) || []
    const idx = all.findIndex(r => r.id === id)
    if (idx !== -1) { all[idx] = { ...all[idx], ...data }; save(KEYS.returns, all) }
    return all[idx]
}

export const deleteVendorReturn = (id) => {
    const all = (load(KEYS.returns) || []).filter(r => r.id !== id)
    save(KEYS.returns, all)
    return true
}

// ==================== SUBSCRIPTIONS ====================

export const getSubscriptions = () => {
    return load(KEYS.subscriptions) || []
}

export const createSubscription = (data) => {
    const all = load(KEYS.subscriptions) || []
    const sub = { ...data, id: genId('sub'), status: data.status || 'Active', createdAt: new Date().toISOString().split('T')[0] }
    all.push(sub)
    save(KEYS.subscriptions, all)
    return sub
}

export const updateSubscription = (id, data) => {
    const all = load(KEYS.subscriptions) || []
    const idx = all.findIndex(s => s.id === id)
    if (idx !== -1) { all[idx] = { ...all[idx], ...data }; save(KEYS.subscriptions, all) }
    return all[idx]
}

export const deleteSubscription = (id) => {
    const all = (load(KEYS.subscriptions) || []).filter(s => s.id !== id)
    save(KEYS.subscriptions, all)
    return true
}

// ==================== STATS ====================

export const getPurchaseStats = () => {
    const vendors = load(KEYS.vendors) || []
    const reqs = load(KEYS.requisitions) || []
    const pos = load(KEYS.orders) || []
    const invoices = load(KEYS.invoices) || []

    return {
        activeVendors: vendors.filter(v => v.status === 'active').length,
        pendingReqs: reqs.filter(r => r.status === 'pending').length,
        pendingPOs: pos.filter(o => o.status === 'draft' || o.status === 'issued').length,
        totalSpend: invoices.filter(i => i.status === 'paid' || i.status === 'matched').reduce((s, i) => s + (i.totalAmount || 0), 0)
    }
}
