// Sales Store with API-first + localStorage fallback
const API_BASE = 'http://localhost:5000/api';

const STORAGE_KEYS = {
    quotations: 'sic-sales-quotations',
    quotationTemplates: 'sic-sales-quotations-templates',
    salesOrders: 'sic-sales-orders',
    invoices: 'sic-sales-invoices',
    invoiceTemplates: 'sic-sales-invoice-templates',
    creditNotes: 'sic-sales-credit-notes',
    debitNotes: 'sic-sales-debit-notes',
    salesReturns: 'sic-sales-returns',
    pricingRules: 'sic-sales-pricing-rules',
    salesTargets: 'sic-sales-targets',
    commissions: 'sic-sales-commissions',
    payments: 'sic-sales-payments'
}

// ==================== API HELPERS ====================
function getAuthHeaders() {
    const token = localStorage.getItem('sic-auth-token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
}

async function apiCall(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers: { ...getAuthHeaders(), ...options.headers }
        });
        if (!response.ok) {
            const error = await response.json().catch(() => ({ message: 'Request failed' }));
            throw new Error(error.message || `HTTP ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.warn(`API call failed for ${endpoint}:`, error.message);
        return null;
    }
}

// ==================== LOCAL STORAGE HELPERS ====================
function getStore(key, initial) {
    const stored = localStorage.getItem(key)
    if (stored) return JSON.parse(stored)
    localStorage.setItem(key, JSON.stringify(initial))
    return initial
}

function setStore(key, data) {
    localStorage.setItem(key, JSON.stringify(data))
}

function generateNumber(type, year, sequence) {
    return `${type}-${year}-${String(sequence).padStart(4, '0')}`
}

// ==================== INITIAL DATA (fallback) ====================
const initialQuotations = [
    {
        id: 'quot-001',
        quoteNumber: 'QT-2026-001',
        customerId: 'cont-001',
        opportunityId: 'opp-001',
        templateId: 'qt-tmpl-001',
        revision: 1,
        status: 'draft',
        items: [
            { productId: 'prod-001', name: 'Enterprise License', description: 'Annual enterprise license', quantity: 1, price: 75000, discount: 0, tax: 0, total: 75000 }
        ],
        currency: 'INR',
        subtotal: 75000,
        discount: 0,
        tax: 0,
        total: 75000,
        notes: 'Pricing as discussed',
        terms: 'Valid for 30 days',
        validUntil: '2026-02-15',
        convertedToOrder: false,
        orderId: null,
        sentDate: null,
        viewedDate: null,
        approvedDate: null,
        assignedTo: 'emp-002',
        createdAt: '2026-01-15',
        updatedAt: '2026-01-15'
    }
]

const initialQuotationTemplates = [
    { id: 'qt-tmpl-001', name: 'Standard Quotation', description: 'Default quotation template', terms: 'Payment due within 30 days of acceptance', notes: 'Thank you for your business', default: true, createdAt: '2026-01-01' },
    { id: 'qt-tmpl-002', name: 'Enterprise Quote', description: 'Template for enterprise deals', terms: '50% advance, 50% on delivery', notes: 'Includes support package', default: false, createdAt: '2026-01-01' }
]

const initialSalesOrders = [
    {
        id: 'order-001',
        orderNumber: 'SO-2026-001',
        customerId: 'cont-001',
        quotationId: null,
        opportunityId: 'opp-002',
        items: [
            { productId: 'prod-001', name: 'Enterprise License', quantity: 2, price: 60000, discount: 0, tax: 0, total: 120000 }
        ],
        currency: 'INR',
        subtotal: 120000, discount: 0, tax: 0, total: 120000,
        status: 'confirmed',
        orderDate: '2026-01-10',
        expectedDelivery: '2026-01-20',
        actualDelivery: null,
        shippingAddress: '100 Tech Blvd, San Francisco, CA',
        billingAddress: '100 Tech Blvd, San Francisco, CA',
        notes: 'Priority order',
        paymentTerms: 'Net 30',
        assignedTo: 'emp-002',
        createdAt: '2026-01-10',
        updatedAt: '2026-01-15'
    }
]

const initialInvoices = [
    {
        id: 'inv-001',
        invoiceNumber: 'INV-2026-001',
        customerId: 'cont-001',
        orderId: 'order-001',
        opportunityId: 'opp-002',
        templateId: 'inv-tmpl-001',
        type: 'standard',
        items: [
            { productId: 'prod-001', name: 'Enterprise License', quantity: 2, price: 60000, discount: 0, tax: 0, total: 120000 }
        ],
        currency: 'INR',
        subtotal: 120000, discount: 0, tax: 0, total: 120000,
        paid: 40000, balance: 80000,
        status: 'sent',
        invoiceDate: '2026-01-12',
        dueDate: '2026-02-11',
        paidDate: null,
        notes: 'Payment due in 30 days',
        terms: 'Net 30',
        recurring: false, recurringSchedule: null, nextInvoiceDate: null,
        sentDate: '2026-01-12', viewedDate: null,
        reminderSent: false, reminderCount: 0,
        assignedTo: 'emp-002',
        createdAt: '2026-01-12',
        updatedAt: '2026-01-12'
    }
]

const initialInvoiceTemplates = [
    { id: 'inv-tmpl-001', name: 'Standard Invoice', description: 'Default invoice template', terms: 'Payment due within 30 days', notes: 'Thank you for your business', default: true, createdAt: '2026-01-01' },
    { id: 'inv-tmpl-002', name: 'Proforma Invoice', description: 'Proforma invoice for advance payments', terms: 'Payment required before shipment', notes: 'This is a proforma invoice', default: false, createdAt: '2026-01-01' }
]

const initialCreditNotes = [
    { id: 'cn-001', creditNoteNumber: 'CN-2026-001', customerId: 'cont-002', invoiceId: null, returnId: null, reason: 'Product returned', amount: 5000, taxAmount: 0, totalAmount: 5000, currency: 'INR', status: 'approved', noteDate: '2026-01-14', approvedDate: '2026-01-15', approvedBy: 'emp-001', notes: 'Credit for returned product', createdAt: '2026-01-14' }
]

const initialDebitNotes = [
    { id: 'dn-001', debitNoteNumber: 'DN-2026-001', customerId: 'cont-002', invoiceId: 'inv-001', reason: 'Additional charges', amount: 2500, taxAmount: 0, totalAmount: 2500, currency: 'INR', status: 'sent', noteDate: '2026-01-13', notes: 'Additional service charges', createdAt: '2026-01-13' }
]

const initialSalesReturns = [
    { id: 'ret-001', returnNumber: 'SR-2026-001', customerId: 'cont-002', orderId: 'order-001', invoiceId: 'inv-001', items: [{ productId: 'prod-001', name: 'Enterprise License', quantity: 1, reason: 'Wrong product', condition: 'opened' }], refundType: 'credit', refundAmount: 60000, currency: 'INR', status: 'approved', returnDate: '2026-01-14', approvedDate: '2026-01-15', approvedBy: 'emp-001', notes: 'Customer ordered wrong edition', receivedItems: true, creditNoteId: 'cn-001', createdAt: '2026-01-14' }
]

const initialPricingRules = [
    { id: 'pr-001', name: 'Volume Discount', description: '10% discount for orders over $50,000', type: 'volume', condition: { minAmount: 50000 }, discountType: 'percentage', discountValue: 10, status: 'active', priority: 1, customerSegment: 'all', productCategory: 'all', validFrom: '2026-01-01', validUntil: null, createdAt: '2026-01-01' },
    { id: 'pr-002', name: 'Enterprise Pricing', description: 'Special pricing for enterprise customers', type: 'customer', condition: { customerTier: 'enterprise' }, discountType: 'percentage', discountValue: 15, status: 'active', priority: 2, customerSegment: 'enterprise', productCategory: 'all', validFrom: '2026-01-01', validUntil: null, createdAt: '2026-01-01' }
]

const initialSalesTargets = [
    { id: 'st-001', name: 'Q1 2026 Target', description: 'Quarterly sales target', type: 'revenue', period: 'quarterly', startDate: '2026-01-01', endDate: '2026-03-31', targetAmount: 500000, achievedAmount: 120000, status: 'active', assignedTo: 'emp-002', teamTarget: false, teamMembers: [], createdAt: '2026-01-01', updatedAt: '2026-01-15' },
    { id: 'st-002', name: 'Q1 2026 Team Target', description: 'Team quarterly target', type: 'revenue', period: 'quarterly', startDate: '2026-01-01', endDate: '2026-03-31', targetAmount: 2000000, achievedAmount: 450000, status: 'active', assignedTo: null, teamTarget: true, teamMembers: ['emp-002', 'emp-003'], createdAt: '2026-01-01', updatedAt: '2026-01-15' }
]

const initialCommissions = [
    { id: 'comm-001', name: 'Standard Commission', description: '5% commission on all sales', type: 'percentage', rate: 5, status: 'active', applicableFrom: '2026-01-01', applicableUntil: null, conditions: { minOrderAmount: 0 }, createdAt: '2026-01-01' }
]

const initialPayments = [
    { id: 'pay-001', paymentNumber: 'PAY-2026-001', invoiceId: 'inv-001', customerId: 'cont-001', amount: 40000, currency: 'INR', paymentMethod: 'bank_transfer', paymentDate: '2026-01-18', reference: 'TXN-123456', notes: 'First installment', status: 'completed', createdAt: '2026-01-18' }
]

// ==================== QUOTATIONS (API-first) ====================
export async function getQuotations(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    const data = await apiCall(`/quotations?${params}`);
    if (data?.quotations) {
        setStore(STORAGE_KEYS.quotations, data.quotations);
        return data.quotations;
    }
    let quotes = getStore(STORAGE_KEYS.quotations, initialQuotations)
    if (filters.status) quotes = quotes.filter(q => q.status === filters.status)
    if (filters.customerId) quotes = quotes.filter(q => q.customerId === filters.customerId)
    if (filters.assignedTo) quotes = quotes.filter(q => q.assignedTo === filters.assignedTo)
    return quotes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

export async function getQuotation(id) {
    const data = await apiCall(`/quotations/${id}`);
    if (data?.quotation) return { ...data.quotation, items: data.items || [] };
    return getStore(STORAGE_KEYS.quotations, initialQuotations).find(q => q.id === id);
}

export async function createQuotation(data) {
    const apiResult = await apiCall('/quotations', {
        method: 'POST',
        body: JSON.stringify({
            customer_id: data.customerId,
            quotation_date: data.quotationDate || new Date().toISOString(),
            valid_until: data.validUntil,
            items: (data.items || []).map(item => ({
                product_id: item.productId,
                description: item.description || item.name,
                quantity: item.quantity,
                unit_price: item.price || item.unitPrice,
                tax_rate: item.tax || 0,
                discount_percent: item.discount || 0
            })),
            notes: data.notes,
            terms: data.terms
        })
    });
    if (apiResult?.quotation) return apiResult.quotation;

    // Fallback to localStorage
    const quotes = getStore(STORAGE_KEYS.quotations, initialQuotations)
    const quoteNumber = generateNumber('QT', new Date().getFullYear(), quotes.length + 1)
    const newQuote = {
        ...data,
        id: `quot-${Date.now()}`,
        quoteNumber: data.quoteNumber || quoteNumber,
        revision: data.revision || 1,
        currency: data.currency || (() => { try { const s = localStorage.getItem('sic-crm-settings'); return s ? (JSON.parse(s).currency || 'INR') : 'INR' } catch { return 'INR' } })(),
        status: 'draft',
        subtotal: data.subtotal || 0,
        discount: data.discount || 0,
        tax: data.tax || 0,
        total: data.total || 0,
        convertedToOrder: false,
        orderId: null,
        sentDate: null, viewedDate: null, approvedDate: null,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
    }
    quotes.push(newQuote)
    setStore(STORAGE_KEYS.quotations, quotes)
    return newQuote
}

export async function updateQuotation(id, data) {
    const apiResult = await apiCall(`/quotations/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
    if (apiResult?.quotation) return apiResult.quotation;

    const quotes = await getQuotations()
    const index = quotes.findIndex(q => q.id === id)
    if (index === -1) return null
    quotes[index] = { ...quotes[index], ...data, updatedAt: new Date().toISOString().split('T')[0] }
    setStore(STORAGE_KEYS.quotations, quotes)
    return quotes[index]
}

export async function deleteQuotation(id) {
    const apiResult = await apiCall(`/quotations/${id}`, { method: 'DELETE' });
    if (apiResult) return true;
    const quotes = getStore(STORAGE_KEYS.quotations, initialQuotations).filter(q => q.id !== id)
    setStore(STORAGE_KEYS.quotations, quotes)
    return true
}

export function createQuotationRevision(id) {
    const quotes = getStore(STORAGE_KEYS.quotations, initialQuotations)
    const quote = quotes.find(q => q.id === id)
    if (!quote) return null
    return createQuotation({ ...quote, revision: quote.revision + 1, notes: `Revision ${quote.revision + 1} - ${quote.notes || ''}` })
}

export async function convertQuotationToOrder(quoteId, orderData) {
    const quote = await getQuotation(quoteId)
    if (!quote) return null

    const order = await createSalesOrder({
        customerId: quote.customerId || quote.customer_id,
        quotationId: quoteId,
        items: quote.items,
        subtotal: quote.subtotal,
        discount: quote.discount,
        tax: quote.tax,
        total: quote.total,
        shippingAddress: orderData?.shippingAddress,
        billingAddress: orderData?.billingAddress,
        notes: orderData?.notes || quote.notes,
        paymentTerms: orderData?.paymentTerms,
        expectedDelivery: orderData?.expectedDelivery,
        assignedTo: quote.assignedTo || quote.assigned_to
    })

    await updateQuotation(quoteId, { convertedToOrder: true, orderId: order.id, status: 'accepted' })
    return order
}

// ==================== QUOTATION TEMPLATES ====================
export function getQuotationTemplates() {
    return getStore(STORAGE_KEYS.quotationTemplates, initialQuotationTemplates)
}

export function getQuotationTemplate(id) {
    return getQuotationTemplates().find(t => t.id === id)
}

export function createQuotationTemplate(data) {
    const templates = getQuotationTemplates()
    const newTemplate = { ...data, id: `qt-tmpl-${Date.now()}`, default: false, createdAt: new Date().toISOString().split('T')[0] }
    templates.push(newTemplate)
    setStore(STORAGE_KEYS.quotationTemplates, templates)
    return newTemplate
}

export function updateQuotationTemplate(id, data) {
    const templates = getQuotationTemplates()
    const index = templates.findIndex(t => t.id === id)
    if (index === -1) return null
    templates[index] = { ...templates[index], ...data }
    setStore(STORAGE_KEYS.quotationTemplates, templates)
    return templates[index]
}

export function deleteQuotationTemplate(id) {
    const templates = getQuotationTemplates().filter(t => t.id !== id)
    setStore(STORAGE_KEYS.quotationTemplates, templates)
    return true
}

// ==================== SALES ORDERS (API-first) ====================
export async function getSalesOrders(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    const data = await apiCall(`/sales-orders?${params}`);
    if (data?.salesOrders) {
        setStore(STORAGE_KEYS.salesOrders, data.salesOrders);
        return data.salesOrders;
    }
    let orders = getStore(STORAGE_KEYS.salesOrders, initialSalesOrders)
    if (filters.status) orders = orders.filter(o => o.status === filters.status)
    if (filters.customerId) orders = orders.filter(o => o.customerId === filters.customerId)
    if (filters.assignedTo) orders = orders.filter(o => o.assignedTo === filters.assignedTo)
    return orders.sort((a, b) => new Date(b.orderDate || b.order_date) - new Date(a.orderDate || a.order_date))
}

export async function getSalesOrder(id) {
    const data = await apiCall(`/sales-orders/${id}`);
    if (data?.salesOrder) return { ...data.salesOrder, items: data.items || [] };
    return getStore(STORAGE_KEYS.salesOrders, initialSalesOrders).find(o => o.id === id);
}

export async function createSalesOrder(data) {
    const apiResult = await apiCall('/sales-orders', {
        method: 'POST',
        body: JSON.stringify({
            customer_id: data.customerId,
            quotation_id: data.quotationId,
            order_date: data.orderDate || new Date().toISOString(),
            expected_delivery: data.expectedDelivery,
            items: (data.items || []).map(item => ({
                product_id: item.productId,
                description: item.description || item.name,
                quantity: item.quantity,
                unit_price: item.price || item.unitPrice,
                tax_rate: item.tax || 0,
                discount_percent: item.discount || 0
            })),
            shipping_address: data.shippingAddress,
            billing_address: data.billingAddress,
            notes: data.notes,
            payment_terms: data.paymentTerms,
            assigned_to: data.assignedTo
        })
    });
    if (apiResult?.salesOrder) return apiResult.salesOrder;

    // Fallback to localStorage
    const orders = getStore(STORAGE_KEYS.salesOrders, initialSalesOrders)
    const orderNumber = generateNumber('SO', new Date().getFullYear(), orders.length + 1)
    const newOrder = {
        ...data,
        id: `order-${Date.now()}`,
        orderNumber: data.orderNumber || orderNumber,
        orderDate: data.orderDate || new Date().toISOString().split('T')[0],
        currency: data.currency || (() => { try { const s = localStorage.getItem('sic-crm-settings'); return s ? (JSON.parse(s).currency || 'INR') : 'INR' } catch { return 'INR' } })(),
        status: 'pending',
        subtotal: data.subtotal || 0, discount: data.discount || 0, tax: data.tax || 0, total: data.total || 0,
        actualDelivery: null,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
    }
    orders.push(newOrder)
    setStore(STORAGE_KEYS.salesOrders, orders)
    return newOrder
}

export async function updateSalesOrder(id, data) {
    const apiResult = await apiCall(`/sales-orders/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data)
    });
    if (apiResult?.salesOrder) return apiResult.salesOrder;

    const orders = getStore(STORAGE_KEYS.salesOrders, initialSalesOrders)
    const index = orders.findIndex(o => o.id === id)
    if (index === -1) return null
    orders[index] = { ...orders[index], ...data, updatedAt: new Date().toISOString().split('T')[0] }
    setStore(STORAGE_KEYS.salesOrders, orders)
    return orders[index]
}

export async function deleteSalesOrder(id) {
    const apiResult = await apiCall(`/sales-orders/${id}`, { method: 'DELETE' });
    if (apiResult) return true;
    const orders = getStore(STORAGE_KEYS.salesOrders, initialSalesOrders).filter(o => o.id !== id)
    setStore(STORAGE_KEYS.salesOrders, orders)
    return true
}

export async function confirmSalesOrder(id) {
    const apiResult = await apiCall(`/sales-orders/${id}/confirm`, { method: 'PUT' });
    if (apiResult?.salesOrder) return apiResult.salesOrder;
    return updateSalesOrder(id, { status: 'confirmed' })
}

export async function deliverSalesOrder(id, deliveryData) {
    const apiResult = await apiCall(`/sales-orders/${id}/deliver`, {
        method: 'PUT',
        body: JSON.stringify({ delivery_date: deliveryData?.deliveryDate })
    });
    if (apiResult?.salesOrder) return apiResult.salesOrder;
    return updateSalesOrder(id, { status: 'delivered', actualDelivery: deliveryData?.deliveryDate || new Date().toISOString().split('T')[0] })
}

// ==================== INVOICES (API-first) ====================
export async function getInvoices(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    const data = await apiCall(`/invoices?${params}`);
    if (data?.invoices) {
        setStore(STORAGE_KEYS.invoices, data.invoices);
        return data.invoices;
    }
    let invoices = getStore(STORAGE_KEYS.invoices, initialInvoices)
    if (filters.status) invoices = invoices.filter(i => i.status === filters.status)
    if (filters.customerId) invoices = invoices.filter(i => i.customerId === filters.customerId)
    if (filters.assignedTo) invoices = invoices.filter(i => i.assignedTo === filters.assignedTo)
    if (filters.overdue) {
        const today = new Date().toISOString().split('T')[0]
        invoices = invoices.filter(i => i.status !== 'paid' && i.dueDate < today)
    }
    return invoices.sort((a, b) => new Date(b.invoiceDate || b.invoice_date) - new Date(a.invoiceDate || a.invoice_date))
}

export async function getInvoice(id) {
    const data = await apiCall(`/invoices/${id}`);
    if (data?.invoice) return { ...data.invoice, items: data.items || [] };
    return getStore(STORAGE_KEYS.invoices, initialInvoices).find(i => i.id === id);
}

export async function createInvoice(data) {
    const apiResult = await apiCall('/invoices', {
        method: 'POST',
        body: JSON.stringify({
            customer_id: data.customerId,
            invoice_date: data.invoiceDate || new Date().toISOString(),
            due_date: data.dueDate,
            quotation_id: data.quotationId,
            items: (data.items || []).map(item => ({
                product_id: item.productId,
                description: item.description || item.name,
                quantity: item.quantity,
                unit_price: item.price || item.unitPrice,
                tax_rate: item.tax || 0,
                discount_percent: item.discount || 0
            })),
            notes: data.notes,
            terms: data.terms
        })
    });
    if (apiResult?.invoice) return apiResult.invoice;

    // Fallback to localStorage
    const invoices = getStore(STORAGE_KEYS.invoices, initialInvoices)
    const invoiceNumber = generateNumber('INV', new Date().getFullYear(), invoices.length + 1)
    const newInvoice = {
        ...data,
        id: `inv-${Date.now()}`,
        invoiceNumber: data.invoiceNumber || invoiceNumber,
        invoiceDate: data.invoiceDate || new Date().toISOString().split('T')[0],
        type: data.type || 'standard',
        currency: data.currency || (() => { try { const s = localStorage.getItem('sic-crm-settings'); return s ? (JSON.parse(s).currency || 'INR') : 'INR' } catch { return 'INR' } })(),
        status: 'draft',
        paid: 0, balance: data.total || 0,
        recurring: false, recurringSchedule: null, nextInvoiceDate: null,
        sentDate: null, viewedDate: null, reminderSent: false, reminderCount: 0,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
    }
    invoices.push(newInvoice)
    setStore(STORAGE_KEYS.invoices, invoices)
    return newInvoice
}

export async function updateInvoice(id, data) {
    const apiResult = await apiCall(`/invoices/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
            status: data.status,
            paid_amount: data.paid || data.paid_amount
        })
    });
    if (apiResult?.invoice) return apiResult.invoice;

    const invoices = getStore(STORAGE_KEYS.invoices, initialInvoices)
    const index = invoices.findIndex(i => i.id === id)
    if (index === -1) return null
    const updatedInvoice = { ...invoices[index], ...data }
    updatedInvoice.balance = updatedInvoice.total - updatedInvoice.paid
    updatedInvoice.updatedAt = new Date().toISOString().split('T')[0]
    invoices[index] = updatedInvoice
    setStore(STORAGE_KEYS.invoices, invoices)
    return updatedInvoice
}

export async function deleteInvoice(id) {
    const apiResult = await apiCall(`/invoices/${id}`, { method: 'DELETE' });
    if (apiResult) return true;
    const invoices = getStore(STORAGE_KEYS.invoices, initialInvoices).filter(i => i.id !== id)
    setStore(STORAGE_KEYS.invoices, invoices)
    return true
}

export function sendInvoice(id) {
    return updateInvoice(id, { status: 'sent', sentDate: new Date().toISOString().split('T')[0] })
}

export function markInvoiceViewed(id) {
    return updateInvoice(id, { viewedDate: new Date().toISOString().split('T')[0] })
}

export async function createInvoiceFromOrder(orderId, invoiceData) {
    const order = await getSalesOrder(orderId)
    if (!order) return null

    return createInvoice({
        customerId: order.customerId || order.customer_id,
        orderId: orderId,
        items: order.items,
        subtotal: order.subtotal,
        discount: order.discount || order.discount_amount,
        tax: order.tax || order.tax_amount,
        total: order.total || order.total_amount,
        notes: invoiceData?.notes || order.notes,
        terms: invoiceData?.terms || order.paymentTerms || order.payment_terms,
        dueDate: invoiceData?.dueDate,
        assignedTo: order.assignedTo || order.assigned_to
    })
}

// ==================== INVOICE TEMPLATES ====================
export function getInvoiceTemplates() {
    return getStore(STORAGE_KEYS.invoiceTemplates, initialInvoiceTemplates)
}

export function getInvoiceTemplate(id) {
    return getInvoiceTemplates().find(t => t.id === id)
}

export function createInvoiceTemplate(data) {
    const templates = getInvoiceTemplates()
    const newTemplate = { ...data, id: `inv-tmpl-${Date.now()}`, default: false, createdAt: new Date().toISOString().split('T')[0] }
    templates.push(newTemplate)
    setStore(STORAGE_KEYS.invoiceTemplates, templates)
    return newTemplate
}

export function updateInvoiceTemplate(id, data) {
    const templates = getInvoiceTemplates()
    const index = templates.findIndex(t => t.id === id)
    if (index === -1) return null
    templates[index] = { ...templates[index], ...data }
    setStore(STORAGE_KEYS.invoiceTemplates, templates)
    return templates[index]
}

export function deleteInvoiceTemplate(id) {
    const templates = getInvoiceTemplates().filter(t => t.id !== id)
    setStore(STORAGE_KEYS.invoiceTemplates, templates)
    return true
}

// ==================== CREDIT NOTES ====================
export function getCreditNotes(filters = {}) {
    let notes = getStore(STORAGE_KEYS.creditNotes, initialCreditNotes)
    if (filters.status) notes = notes.filter(n => n.status === filters.status)
    if (filters.customerId) notes = notes.filter(n => n.customerId === filters.customerId)
    return notes.sort((a, b) => new Date(b.noteDate) - new Date(a.noteDate))
}

export function getCreditNote(id) {
    return getCreditNotes().find(n => n.id === id)
}

export function createCreditNote(data) {
    const notes = getStore(STORAGE_KEYS.creditNotes, initialCreditNotes)
    const noteNumber = generateNumber('CN', new Date().getFullYear(), notes.length + 1)
    const newNote = {
        ...data, id: `cn-${Date.now()}`, creditNoteNumber: data.creditNoteNumber || noteNumber,
        noteDate: data.noteDate || new Date().toISOString().split('T')[0],
        status: 'pending', approvedDate: null, approvedBy: null,
        createdAt: new Date().toISOString().split('T')[0]
    }
    notes.push(newNote)
    setStore(STORAGE_KEYS.creditNotes, notes)
    return newNote
}

export function updateCreditNote(id, data) {
    const notes = getCreditNotes()
    const index = notes.findIndex(n => n.id === id)
    if (index === -1) return null
    notes[index] = { ...notes[index], ...data }
    setStore(STORAGE_KEYS.creditNotes, notes)
    return notes[index]
}

export function deleteCreditNote(id) {
    const notes = getStore(STORAGE_KEYS.creditNotes, initialCreditNotes).filter(n => n.id !== id)
    setStore(STORAGE_KEYS.creditNotes, notes)
    return true
}

export function approveCreditNote(id, approvedBy) {
    return updateCreditNote(id, { status: 'approved', approvedDate: new Date().toISOString().split('T')[0], approvedBy })
}

// ==================== DEBIT NOTES ====================
export function getDebitNotes(filters = {}) {
    let notes = getStore(STORAGE_KEYS.debitNotes, initialDebitNotes)
    if (filters.status) notes = notes.filter(n => n.status === filters.status)
    if (filters.customerId) notes = notes.filter(n => n.customerId === filters.customerId)
    return notes.sort((a, b) => new Date(b.noteDate) - new Date(a.noteDate))
}

export function getDebitNote(id) {
    return getDebitNotes().find(n => n.id === id)
}

export function createDebitNote(data) {
    const notes = getStore(STORAGE_KEYS.debitNotes, initialDebitNotes)
    const noteNumber = generateNumber('DN', new Date().getFullYear(), notes.length + 1)
    const newNote = {
        ...data, id: `dn-${Date.now()}`, debitNoteNumber: data.debitNoteNumber || noteNumber,
        noteDate: data.noteDate || new Date().toISOString().split('T')[0],
        status: 'draft', createdAt: new Date().toISOString().split('T')[0]
    }
    notes.push(newNote)
    setStore(STORAGE_KEYS.debitNotes, notes)
    return newNote
}

export function updateDebitNote(id, data) {
    const notes = getDebitNotes()
    const index = notes.findIndex(n => n.id === id)
    if (index === -1) return null
    notes[index] = { ...notes[index], ...data }
    setStore(STORAGE_KEYS.debitNotes, notes)
    return notes[index]
}

export function deleteDebitNote(id) {
    const notes = getStore(STORAGE_KEYS.debitNotes, initialDebitNotes).filter(n => n.id !== id)
    setStore(STORAGE_KEYS.debitNotes, notes)
    return true
}

export function sendDebitNote(id) {
    return updateDebitNote(id, { status: 'sent' })
}

// ==================== SALES RETURNS ====================
export function getSalesReturns(filters = {}) {
    let returns = getStore(STORAGE_KEYS.salesReturns, initialSalesReturns)
    if (filters.status) returns = returns.filter(r => r.status === filters.status)
    if (filters.customerId) returns = returns.filter(r => r.customerId === filters.customerId)
    return returns.sort((a, b) => new Date(b.returnDate) - new Date(a.returnDate))
}

export function getSalesReturn(id) {
    return getSalesReturns().find(r => r.id === id)
}

export function createSalesReturn(data) {
    const returns = getStore(STORAGE_KEYS.salesReturns, initialSalesReturns)
    const returnNumber = generateNumber('SR', new Date().getFullYear(), returns.length + 1)
    const newReturn = {
        ...data, id: `ret-${Date.now()}`, returnNumber: data.returnNumber || returnNumber,
        returnDate: data.returnDate || new Date().toISOString().split('T')[0],
        status: 'pending', approvedDate: null, approvedBy: null,
        receivedItems: false, creditNoteId: null,
        createdAt: new Date().toISOString().split('T')[0]
    }
    returns.push(newReturn)
    setStore(STORAGE_KEYS.salesReturns, returns)
    return newReturn
}

export function updateSalesReturn(id, data) {
    const returns = getSalesReturns()
    const index = returns.findIndex(r => r.id === id)
    if (index === -1) return null
    returns[index] = { ...returns[index], ...data }
    setStore(STORAGE_KEYS.salesReturns, returns)
    return returns[index]
}

export function deleteSalesReturn(id) {
    const returns = getStore(STORAGE_KEYS.salesReturns, initialSalesReturns).filter(r => r.id !== id)
    setStore(STORAGE_KEYS.salesReturns, returns)
    return true
}

export function approveSalesReturn(id, approvedBy) {
    return updateSalesReturn(id, { status: 'approved', approvedDate: new Date().toISOString().split('T')[0], approvedBy })
}

export function receiveReturnItems(id) {
    return updateSalesReturn(id, { receivedItems: true })
}

// ==================== PAYMENTS (API-first) ====================
export async function getPayments(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    const data = await apiCall(`/payments?${params}`);
    if (data?.payments) {
        setStore(STORAGE_KEYS.payments, data.payments);
        return data.payments;
    }
    let payments = getStore(STORAGE_KEYS.payments, initialPayments)
    if (filters.status) payments = payments.filter(p => p.status === filters.status)
    if (filters.invoiceId) payments = payments.filter(p => p.invoiceId === filters.invoiceId)
    if (filters.customerId) payments = payments.filter(p => p.customerId === filters.customerId)
    return payments.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate))
}

export function getPayment(id) {
    return getStore(STORAGE_KEYS.payments, initialPayments).find(p => p.id === id);
}

export async function createPayment(data) {
    const apiResult = await apiCall('/payments', {
        method: 'POST',
        body: JSON.stringify({
            customer_id: data.customerId,
            payment_date: data.paymentDate || new Date().toISOString(),
            amount: data.amount,
            payment_mode: data.paymentMethod,
            reference_number: data.reference,
            notes: data.notes,
            invoice_id: data.invoiceId
        })
    });
    if (apiResult?.payment) return apiResult.payment;

    const payments = getStore(STORAGE_KEYS.payments, initialPayments)
    const paymentNumber = generateNumber('PAY', new Date().getFullYear(), payments.length + 1)
    const newPayment = {
        ...data, id: `pay-${Date.now()}`,
        paymentNumber: data.paymentNumber || paymentNumber,
        paymentDate: data.paymentDate || new Date().toISOString().split('T')[0],
        status: 'pending', createdAt: new Date().toISOString().split('T')[0]
    }
    payments.push(newPayment)
    setStore(STORAGE_KEYS.payments, payments)

    if (data.invoiceId) {
        const invoice = getStore(STORAGE_KEYS.invoices, initialInvoices).find(i => i.id === data.invoiceId)
        if (invoice) {
            await updateInvoice(data.invoiceId, { paid: (invoice.paid || 0) + data.amount })
        }
    }
    return newPayment
}

export function updatePayment(id, data) {
    const payments = getStore(STORAGE_KEYS.payments, initialPayments)
    const index = payments.findIndex(p => p.id === id)
    if (index === -1) return null
    payments[index] = { ...payments[index], ...data }
    setStore(STORAGE_KEYS.payments, payments)
    return payments[index]
}

export function deletePayment(id) {
    const payments = getStore(STORAGE_KEYS.payments, initialPayments).filter(p => p.id !== id)
    setStore(STORAGE_KEYS.payments, payments)
    return true
}

export function completePayment(id) {
    return updatePayment(id, { status: 'completed' })
}

// ==================== PRICING RULES ====================
export function getPricingRules() {
    return getStore(STORAGE_KEYS.pricingRules, initialPricingRules)
}

export function getPricingRule(id) {
    return getPricingRules().find(r => r.id === id)
}

export function createPricingRule(data) {
    const rules = getPricingRules()
    const newRule = { ...data, id: `pr-${Date.now()}`, status: 'active', createdAt: new Date().toISOString().split('T')[0] }
    rules.push(newRule)
    setStore(STORAGE_KEYS.pricingRules, rules)
    return newRule
}

export function updatePricingRule(id, data) {
    const rules = getPricingRules()
    const index = rules.findIndex(r => r.id === id)
    if (index === -1) return null
    rules[index] = { ...rules[index], ...data }
    setStore(STORAGE_KEYS.pricingRules, rules)
    return rules[index]
}

export function deletePricingRule(id) {
    const rules = getPricingRules().filter(r => r.id !== id)
    setStore(STORAGE_KEYS.pricingRules, rules)
    return true
}

export function calculateDiscount(customerId, amount, productCategory) {
    const rules = getPricingRules().filter(r => r.status === 'active')
    let maxDiscount = 0
    for (const rule of rules) {
        if (rule.type === 'volume' && amount >= (rule.condition.minAmount || 0)) {
            const discount = rule.discountType === 'percentage' ? amount * rule.discountValue / 100 : rule.discountValue
            if (discount > maxDiscount) maxDiscount = discount
        }
    }
    return maxDiscount
}

// ==================== SALES TARGETS ====================
export function getSalesTargets(filters = {}) {
    let targets = getStore(STORAGE_KEYS.salesTargets, initialSalesTargets)
    if (filters.status) targets = targets.filter(t => t.status === filters.status)
    if (filters.assignedTo) targets = targets.filter(t => t.assignedTo === filters.assignedTo)
    if (filters.teamTarget !== undefined) targets = targets.filter(t => t.teamTarget === filters.teamTarget)
    return targets.sort((a, b) => new Date(b.endDate) - new Date(a.endDate))
}

export function getSalesTarget(id) {
    return getSalesTargets().find(t => t.id === id)
}

export function createSalesTarget(data) {
    const targets = getStore(STORAGE_KEYS.salesTargets, initialSalesTargets)
    const newTarget = {
        ...data, id: `st-${Date.now()}`, targetAmount: data.targetAmount || 0,
        achievedAmount: 0, status: 'active', teamMembers: data.teamMembers || [],
        createdAt: new Date().toISOString().split('T')[0], updatedAt: new Date().toISOString().split('T')[0]
    }
    targets.push(newTarget)
    setStore(STORAGE_KEYS.salesTargets, targets)
    return newTarget
}

export function updateSalesTarget(id, data) {
    const targets = getStore(STORAGE_KEYS.salesTargets, initialSalesTargets)
    const index = targets.findIndex(t => t.id === id)
    if (index === -1) return null
    targets[index] = { ...targets[index], ...data, updatedAt: new Date().toISOString().split('T')[0] }
    setStore(STORAGE_KEYS.salesTargets, targets)
    return targets[index]
}

export function deleteSalesTarget(id) {
    const targets = getStore(STORAGE_KEYS.salesTargets, initialSalesTargets).filter(t => t.id !== id)
    setStore(STORAGE_KEYS.salesTargets, targets)
    return true
}

export function updateTargetProgress(id, additionalAmount) {
    const target = getSalesTarget(id)
    if (!target) return null
    return updateSalesTarget(id, { achievedAmount: target.achievedAmount + additionalAmount })
}

// ==================== COMMISSIONS ====================
export function getCommissions() {
    return getStore(STORAGE_KEYS.commissions, initialCommissions)
}

export function getCommission(id) {
    return getCommissions().find(c => c.id === id)
}

export function createCommission(data) {
    const commissions = getCommissions()
    const newCommission = { ...data, id: `comm-${Date.now()}`, status: 'active', createdAt: new Date().toISOString().split('T')[0] }
    commissions.push(newCommission)
    setStore(STORAGE_KEYS.commissions, commissions)
    return newCommission
}

export function updateCommission(id, data) {
    const commissions = getCommissions()
    const index = commissions.findIndex(c => c.id === id)
    if (index === -1) return null
    commissions[index] = { ...commissions[index], ...data }
    setStore(STORAGE_KEYS.commissions, commissions)
    return commissions[index]
}

export function deleteCommission(id) {
    const commissions = getCommissions().filter(c => c.id !== id)
    setStore(STORAGE_KEYS.commissions, commissions)
    return true
}

export function calculateCommission(salesAmount) {
    const commissions = getCommissions().filter(c => c.status === 'active')
    let totalCommission = 0
    for (const comm of commissions) {
        if (comm.type === 'percentage' && salesAmount >= (comm.conditions?.minOrderAmount || 0)) {
            totalCommission += salesAmount * comm.rate / 100
        }
    }
    return totalCommission
}

// ==================== STATISTICS (API-first) ====================
export async function getSalesStats() {
    const data = await apiCall('/stats/sales');
    if (data) {
        return {
            totalQuotations: parseInt(data.quotations?.total || 0),
            pendingQuotations: parseInt(data.quotations?.draft || 0),
            sentQuotations: parseInt(data.quotations?.sent || 0),
            acceptedQuotations: parseInt(data.quotations?.accepted || 0),
            totalOrders: parseInt(data.orders?.total || 0),
            pendingOrders: parseInt(data.orders?.pending || 0),
            confirmedOrders: parseInt(data.orders?.confirmed || 0),
            deliveredOrders: parseInt(data.orders?.delivered || 0),
            ordersValue: parseFloat(data.orders?.total_value || 0),
            totalInvoices: parseInt(data.invoices?.total || 0),
            draftInvoices: parseInt(data.invoices?.draft || 0),
            sentInvoices: parseInt(data.invoices?.unpaid || 0),
            paidInvoices: parseInt(data.invoices?.paid || 0),
            overdueInvoices: parseInt(data.invoices?.overdue || 0),
            totalRevenue: parseFloat(data.invoices?.paid_value || 0),
            outstandingBalance: parseFloat(data.invoices?.outstanding || 0),
            overdueBalance: 0,
            totalReturns: 0,
            pendingReturns: 0,
            approvedReturns: 0,
            returnsValue: 0
        }
    }

    // Fallback: compute from localStorage
    const quotations = getStore(STORAGE_KEYS.quotations, initialQuotations)
    const orders = getStore(STORAGE_KEYS.salesOrders, initialSalesOrders)
    const invoices = getStore(STORAGE_KEYS.invoices, initialInvoices)
    const payments = getStore(STORAGE_KEYS.payments, initialPayments)
    const returns = getStore(STORAGE_KEYS.salesReturns, initialSalesReturns)

    const totalRevenue = payments.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0)
    const outstandingBalance = invoices.reduce((sum, i) => sum + (i.balance || 0), 0)
    const overdueBalance = invoices
        .filter(i => i.status !== 'paid' && i.dueDate < new Date().toISOString().split('T')[0])
        .reduce((sum, i) => sum + (i.balance || 0), 0)

    return {
        totalQuotations: quotations.length,
        pendingQuotations: quotations.filter(q => q.status === 'draft').length,
        sentQuotations: quotations.filter(q => q.status === 'sent').length,
        acceptedQuotations: quotations.filter(q => q.status === 'accepted').length,
        totalOrders: orders.length,
        pendingOrders: orders.filter(o => o.status === 'pending').length,
        confirmedOrders: orders.filter(o => o.status === 'confirmed').length,
        deliveredOrders: orders.filter(o => o.status === 'delivered').length,
        ordersValue: orders.reduce((sum, o) => sum + o.total, 0),
        totalInvoices: invoices.length,
        draftInvoices: invoices.filter(i => i.status === 'draft').length,
        sentInvoices: invoices.filter(i => i.status === 'sent').length,
        paidInvoices: invoices.filter(i => i.status === 'paid').length,
        overdueInvoices: invoices.filter(i => i.status !== 'paid' && i.dueDate < new Date().toISOString().split('T')[0]).length,
        totalRevenue,
        outstandingBalance,
        overdueBalance,
        totalReturns: returns.length,
        pendingReturns: returns.filter(r => r.status === 'pending').length,
        approvedReturns: returns.filter(r => r.status === 'approved').length,
        returnsValue: returns.reduce((sum, r) => sum + r.refundAmount, 0)
    }
}

// ==================== DASHBOARD STATS (API-first) ====================
export async function getDashboardStats() {
    const data = await apiCall('/stats');
    if (data) return data;

    // Fallback: compute from localStorage stores
    const salesStats = await getSalesStats();
    return {
        revenue: {
            total_revenue: salesStats.totalRevenue,
            revenue_mtd: salesStats.totalRevenue,
            revenue_ytd: salesStats.totalRevenue,
            outstanding: salesStats.outstandingBalance
        },
        leads: { total_leads: 0, new_leads_mtd: 0, qualified_leads: 0 },
        orders: {
            total_orders: salesStats.totalOrders,
            orders_today: 0,
            orders_mtd: salesStats.totalOrders,
            orders_value: salesStats.ordersValue
        },
        invoices: {
            total_invoices: salesStats.totalInvoices,
            unpaid_invoices: salesStats.sentInvoices,
            overdue_invoices: salesStats.overdueInvoices,
            overdue_amount: salesStats.overdueBalance
        },
        customers: { total_customers: 0, new_customers_mtd: 0 },
        recentOrders: [],
        monthlyRevenue: [],
        topCustomers: []
    }
}
