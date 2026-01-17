
import api from '../utils/api'

// Purchase Store with API integration

export const getVendors = async (filters = {}) => {
    try {
        const queryParams = new URLSearchParams()
        if (filters.status) queryParams.append('status', filters.status)
        if (filters.type) queryParams.append('type', filters.type)
        if (filters.search) queryParams.append('search', filters.search)

        const response = await api.get(`/vendors?${queryParams.toString()}`)
        return response.vendors || []
    } catch (error) {
        console.error('Error fetching vendors:', error)
        return []
    }
}

export const getVendor = async (id) => {
    try {
        const response = await api.get(`/vendors/${id}`)
        return response.vendor
    } catch (error) {
        console.error('Error fetching vendor:', error)
        return null
    }
}

export const createVendor = async (data) => {
    try {
        const response = await api.post('/vendors', data)
        return response.vendor
    } catch (error) {
        throw error
    }
}

export const updateVendor = async (id, data) => {
    try {
        const response = await api.put(`/vendors/${id}`, data)
        return response.vendor
    } catch (error) {
        throw error
    }
}

export const deleteVendor = async (id) => {
    try {
        await api.delete(`/vendors/${id}`)
        return true
    } catch (error) {
        throw error
    }
}

// ==================== PURCHASE REQUISITIONS ====================

export const getPurchaseRequisitions = async (filters = {}) => {
    try {
        const queryParams = new URLSearchParams()
        if (filters.status) queryParams.append('status', filters.status)
        if (filters.department) queryParams.append('department', filters.department)

        const response = await api.get(`/purchase/requisitions?${queryParams.toString()}`)
        return response
    } catch (error) {
        console.error('Error fetching requisitions:', error)
        return []
    }
}

export const createPurchaseRequisition = async (data) => {
    return await api.post('/purchase/requisitions', data)
}

export const approvePurchaseRequisition = async (id, approvedBy) => {
    return await api.put(`/purchase/requisitions/${id}/status`, { status: 'approved', approvedBy })
}

export const updatePurchaseRequisition = async (id, data) => {
    return await api.put(`/purchase/requisitions/${id}`, data)
}

export const deletePurchaseRequisition = async (id) => {
    try {
        await api.delete(`/purchase/requisitions/${id}`)
        return true
    } catch (error) {
        throw error
    }
}

// ==================== PURCHASE ORDERS ====================

export const getPurchaseOrders = async (filters = {}) => {
    try {
        const queryParams = new URLSearchParams()
        if (filters.status) queryParams.append('status', filters.status)
        if (filters.vendorId) queryParams.append('vendorId', filters.vendorId)

        const response = await api.get(`/purchase/orders?${queryParams.toString()}`)
        return response
    } catch (error) {
        console.error('Error fetching POs:', error)
        return []
    }
}

export const createPurchaseOrder = async (data) => {
    return await api.post('/purchase/orders', data)
}

export const updatePurchaseOrder = async (id, data) => {
    // Note: Full update might need a specific endpoint if not just status
    return await api.put(`/purchase/orders/${id}`, data)
}

export const updatePOStatus = async (id, status) => {
    return await api.put(`/purchase/orders/${id}/status`, { status })
}

export const issuePurchaseOrder = async (id) => {
    return await updatePOStatus(id, 'issued')
}

export const receivePurchaseOrder = async (id) => {
    return await updatePOStatus(id, 'received')
}

export const deletePurchaseOrder = async (id) => {
    try {
        await api.delete(`/purchase/orders/${id}`)
        return true
    } catch (error) {
        throw error
    }
}

// ==================== SUBSCRIPTIONS (IT SERVICES) ====================

export const getSubscriptions = async () => {
    try {
        // Fetch POs that are marked as recurring/subscriptions
        // The backend controller needs to support filtering by item type or similar
        // For now we ask for filter type=subscription (assumed backend support or future impl)
        const response = await api.get('/purchase/orders?serviceType=subscription')
        return response.orders || []
    } catch (error) {
        console.error('Error fetching subscriptions:', error)
        return []
    }
}

// ==================== RFQs ====================

export const getRFQs = async (filters = {}) => {
    try {
        const queryParams = new URLSearchParams()
        if (filters.status) queryParams.append('status', filters.status)

        const response = await api.get(`/purchase/rfqs?${queryParams.toString()}`)
        return response
    } catch (error) {
        console.error('Error fetching RFQs:', error)
        return []
    }
}

export const createRFQ = async (data) => {
    return await api.post('/purchase/rfqs', data)
}

export const updateRFQ = async (id, data) => {
    return await api.put(`/purchase/rfqs/${id}`, data)
}

export const deleteRFQ = async (id) => {
    try {
        await api.delete(`/purchase/rfqs/${id}`)
        return true
    } catch (error) {
        throw error
    }
}

export const sendRFQ = async (id) => {
    return await api.post(`/purchase/rfqs/${id}/send`)
}

export const addQuoteToRFQ = async (id, quoteData) => {
    return await api.post(`/purchase/rfqs/${id}/quote`, quoteData)
}

// ==================== GRNs ====================

export const getGRNs = async (filters = {}) => {
    try {
        const queryParams = new URLSearchParams()
        if (filters.vendorId) queryParams.append('vendorId', filters.vendorId)
        if (filters.purchaseOrderId) queryParams.append('purchaseOrderId', filters.purchaseOrderId)

        const response = await api.get(`/purchase/grns?${queryParams.toString()}`)
        return response
    } catch (error) {
        console.error('Error fetching GRNs:', error)
        return []
    }
}

export const createGRN = async (data) => {
    return await api.post('/purchase/grns', data)
}

export const updateGRN = async (id, data) => {
    return await api.put(`/purchase/grns/${id}`, data)
}

export const deleteGRN = async (id) => {
    try {
        await api.delete(`/purchase/grns/${id}`)
        return true
    } catch (error) {
        throw error
    }
}

// ==================== VENDOR EVALUATIONS ====================

export const getVendorEvaluations = async (vendorId) => {
    try {
        const queryParams = new URLSearchParams()
        if (vendorId) queryParams.append('vendorId', vendorId)

        const response = await api.get(`/purchase/evaluations?${queryParams.toString()}`)
        return response
    } catch (error) {
        console.error('Error fetching evaluations:', error)
        return []
    }
}

export const createVendorEvaluation = async (data) => {
    return await api.post('/purchase/evaluations', data)
}

export const updateVendorEvaluation = async (id, data) => {
    return await api.put(`/purchase/evaluations/${id}`, data)
}

// ==================== SUPPLIER INVOICES ====================

export const getSupplierInvoices = async () => {
    try {
        const response = await api.get('/purchase/invoices')
        return response.invoices || []
    } catch (error) {
        console.error('Error fetching invoices:', error)
        return []
    }
}

export const createSupplierInvoice = async (data) => {
    return await api.post('/purchase/invoices', data)
}

export const updateSupplierInvoice = async (id, data) => {
    return await api.put(`/purchase/invoices/${id}`, data)
}

export const performThreeWayMatch = async (invoiceId) => {
    return await api.post(`/purchase/invoices/${invoiceId}/match`)
}

export const getPurchaseStats = async () => {
    try {
        const response = await api.get('/purchase/stats')
        return response
    } catch (error) {
        console.error('Error fetching stats:', error)
        return {
            activeVendors: 0,
            pendingReqs: 0,
            pendingPOs: 0,
            totalSpend: 0
        }
    }
}
