// Inventory Store with localStorage persistence

const STORAGE_KEYS = {
    products: 'sic-inventory-products',
    stockLevels: 'sic-inventory-stock-levels',
    stockMovements: 'sic-inventory-stock-movements',
    warehouses: 'sic-inventory-warehouses',
    stockAdjustments: 'sic-inventory-adjustments',
    transfers: 'sic-inventory-transfers',
    serialNumbers: 'sic-inventory-serial-numbers',
    batches: 'sic-inventory-batches'
}

// ==================== PRODUCTS ====================
const initialProducts = [
    {
        id: 'prod-001',
        sku: 'SKU-001',
        name: 'Widget Pro',
        description: 'Premium widget with advanced features',
        category: 'Finished Goods',
        type: 'stockable',
        unit: 'piece',
        price: 5000,
        cost: 3500,
        stock: 156,
        minStock: 50,
        reorderLevel: 100,
        maxStock: 1000,
        warehouseId: 'wh-001',
        location: 'Aisle 3, Shelf 5',
        status: 'active',
        createdAt: '2026-01-01'
    },
    {
        id: 'prod-002',
        sku: 'SKU-002',
        name: 'Gadget X',
        description: 'Basic gadget model',
        category: 'Finished Goods',
        type: 'stockable',
        unit: 'piece',
        price: 2500,
        cost: 1500,
        stock: 85,
        minStock: 25,
        reorderLevel: 50,
        maxStock: 500,
        warehouseId: 'wh-001',
        location: 'Aisle 1, Shelf 2',
        status: 'active',
        createdAt: '2024-01-01'
    },
    {
        id: 'prod-003',
        sku: 'SKU-003',
        name: 'Component A',
        description: 'Raw material component',
        category: 'Raw Materials',
        type: 'stockable',
        unit: 'kg',
        price: 100,
        cost: 50,
        stock: 500,
        minStock: 100,
        reorderLevel: 200,
        maxStock: 2000,
        warehouseId: 'wh-002',
        location: 'Zone A, Rack 1',
        status: 'active',
        createdAt: '2026-01-01'
    },
    {
        id: 'prod-004',
        sku: 'SKU-004',
        name: 'Service Package',
        description: 'Service offering',
        category: 'Services',
        type: 'non-stockable',
        unit: 'hours',
        price: 200,
        cost: 50,
        stock: 0,
        minStock: 0,
        reorderLevel: 0,
        maxStock: 0,
        warehouseId: null,
        location: null,
        status: 'active',
        createdAt: '2026-01-01'
    }
]

// ==================== WAREHOUSES ====================
const initialWarehouses = [
    {
        id: 'wh-001',
        name: 'Main Warehouse',
        location: '1234 Industrial Blvd, San Francisco, CA',
        type: 'main',
        manager: 'John Smith',
        phone: '+1-555-0101',
        email: 'manager@mainwh.com',
        capacity: 5000,
        status: 'active',
        createdAt: '2026-01-01'
    },
    {
        id: 'wh-002',
        name: 'Raw Materials Warehouse',
        location: '5678 Commerce Ave, Los Angeles, CA',
        type: 'raw_materials',
        manager: 'Jane Doe',
        phone: '+1-555-0102',
        email: 'jane@rawwh.com',
        capacity: 8000,
        status: 'active',
        createdAt: '2026-01-01'
    }
]

// ==================== STOCK LEVELS ====================
const initialStockLevels = [
    {
        id: 'stock-001',
        productId: 'prod-001',
        warehouseId: 'wh-001',
        quantity: 156,
        reserved: 20,
        available: 136,
        lastCount: new Date().toISOString().split('T')[0],
        status: 'good',
        notes: ''
    },
    {
        id: 'stock-002',
        productId: 'prod-002',
        warehouseId: 'wh-001',
        quantity: 85,
        reserved: 10,
        available: 75,
        lastCount: new Date().toISOString().split('T')[0],
        status: 'good',
        notes: ''
    }
]

// ==================== STOCK MOVEMENTS ====================
const initialStockMovements = [
    {
        id: 'movement-001',
        reference: 'PO-2026-001',
        referenceType: 'purchase_order',
        movementType: 'receipt',
        date: '2026-01-15',
        items: [
            { productId: 'prod-001', quantity: 50, fromWarehouse: null, toWarehouse: 'wh-001', unitCost: 3500 }
        ],
        notes: 'Initial stock from PO',
        createdAt: '2026-01-15'
    },
    {
        id: 'movement-002',
        reference: 'SO-2026-001',
        referenceType: 'sales_order',
        movementType: 'issue',
        date: '2026-01-18',
        items: [
            { productId: 'prod-001', quantity: 30, fromWarehouse: 'wh-001', toWarehouse: null, unitCost: 3500 }
        ],
        notes: 'Sales order fulfillment',
        createdAt: '2026-01-18'
    }
]

// ==================== STOCK TRANSFERS ====================
const initialTransfers = [
    {
        id: 'transfer-001',
        transferNumber: 'TR-2026-001',
        fromWarehouseId: 'wh-001',
        toWarehouseId: 'wh-002',
        transferDate: '2026-01-20',
        status: 'pending',
        items: [
            { productId: 'prod-003', quantity: 200, batchNumber: 'BATCH-2026-001' }
        ],
        notes: 'Transfer raw materials to main warehouse',
        approvedBy: null,
        receivedBy: null,
        createdAt: '2026-01-20'
    }
]

// ==================== SERIALIZED ITEMS ====================
const initialSerialNumbers = [
    {
        id: 'sn-001',
        productId: 'prod-001',
        serialNumber: 'SN-WP-001',
        purchaseOrderId: 'po-001',
        status: 'in_stock',
        purchaseDate: '2026-01-15',
        warrantyExpiry: new Date('2028-01-15').toISOString().split('T')[0],
        location: 'Aisle 3, Shelf 5',
        notes: 'Initial stock',
        createdAt: '2026-01-15'
    }
]

// ==================== BATCHES ====================
const initialBatches = [
    {
        id: 'batch-001',
        batchNumber: 'BATCH-2026-001',
        productId: 'prod-003',
        quantity: 500,
        manufactureDate: '2026-01-05',
        expiryDate: new Date('2027-01-05').toISOString().split('T')[0],
        location: 'Zone A, Rack 1',
        supplierId: 'vendor-001',
        costPerUnit: 50,
        status: 'available',
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

// ==================== PRODUCTS CRUD ====================
export function getInventoryProducts(filters = {}) {
    let products = getStore(STORAGE_KEYS.products, initialProducts)
    if (filters.status) products = products.filter(p => p.status === filters.status)
    if (filters.category) products = products.filter(p => p.category === filters.category)
    if (filters.warehouseId) products = products.filter(p => p.warehouseId === filters.warehouseId)
    if (filters.type) products = products.filter(p => p.type === filters.type)
    return products
}

export function getProduct(id) {
    return getInventoryProducts().find(p => p.id === id)
}

export function createProduct(data) {
    const products = getStore(STORAGE_KEYS.products, initialProducts)
    const existingCount = products.length
    const sku = data.sku || `SKU-${String(existingCount + 1).padStart(4, '0')}`

    const newProduct = {
        ...data,
        id: `prod-${Date.now()}`,
        sku,
        stock: data.stock || 0,
        createdAt: new Date().toISOString().split('T')[0]
    }
    products.push(newProduct)
    setStore(STORAGE_KEYS.products, products)
    return newProduct
}

export function updateProduct(id, data) {
    const products = getStore(STORAGE_KEYS.products, initialProducts)
    const index = products.findIndex(p => p.id === id)
    if (index === -1) return null
    products[index] = { ...products[index], ...data }
    setStore(STORAGE_KEYS.products, products)
    return products[index]
}

export function deleteProduct(id) {
    const products = getStore(STORAGE_KEYS.products, initialProducts).filter(p => p.id !== id)
    setStore(STORAGE_KEYS.products, products)
    return true
}

// ==================== STOCK LEVELS CRUD ====================
export function getStockLevels(filters = {}) {
    let levels = getStore(STORAGE_KEYS.stockLevels, initialStockLevels)
    if (filters.warehouseId) levels = levels.filter(l => l.warehouseId === filters.warehouseId)
    return levels
}

export function updateStockLevel(productId, warehouseId, quantityChange) {
    const levels = getStore(STORAGE_KEYS.stockLevels, initialStockLevels)
    const index = levels.findIndex(l => l.productId === productId && l.warehouseId === warehouseId)
    if (index === -1) return null

    levels[index].quantity += quantityChange
    levels[index].available = levels[index].quantity - levels[index].reserved

    const product = getProduct(productId)
    if (product && product.minStock > 0 && levels[index].available < product.minStock) {
        levels[index].status = 'low_stock'
    } else if (levels[index].available >= product.minStock) {
        levels[index].status = 'good'
    }

    setStore(STORAGE_KEYS.stockLevels, levels)
    return levels[index]
}

export function reserveStock(productId, warehouseId, quantity) {
    return updateStockLevel(productId, warehouseId, -quantity)
}

export function releaseReservation(productId, warehouseId, quantity) {
    return updateStockLevel(productId, warehouseId, quantity)
}

export function getLowStockItems() {
    const levels = getStockLevels()
    return levels.filter(l => l.status === 'low_stock')
}

// ==================== STOCK MOVEMENTS CRUD ====================
export function getStockMovements(filters = {}) {
    let movements = getStore(STORAGE_KEYS.stockMovements, initialStockMovements)
    if (filters.movementType) movements = movements.filter(m => m.movementType === filters.movementType)
    if (filters.startDate) movements = movements.filter(m => m.date >= filters.startDate)
    if (filters.endDate) movements = movements.filter(m => m.date <= filters.endDate)
    if (filters.productId) movements = movements.filter(m => m.items.some(item => item.productId === filters.productId))
    return movements
}

export function createStockMovement(data) {
    const movements = getStore(STORAGE_KEYS.stockMovements, initialStockMovements)
    const movementNumber = generateNumber('MOV', new Date().getFullYear(), movements.length + 1)

    const newMovement = {
        ...data,
        id: `movement-${Date.now()}`,
        movementNumber: data.movementNumber || movementNumber,
        date: data.date || new Date().toISOString().split('T')[0],
        notes: data.notes || '',
        createdAt: new Date().toISOString().split('T')[0]
    }
    movements.push(newMovement)
    setStore(STORAGE_KEYS.stockMovements, movements)
    return newMovement
}

// ==================== TRANSFERS CRUD ====================
export function getTransfers(filters = {}) {
    let transfers = getStore(STORAGE_KEYS.transfers, initialTransfers)
    if (filters.status) transfers = transfers.filter(t => t.status === filters.status)
    if (filters.fromWarehouseId) transfers = transfers.filter(t => t.fromWarehouseId === filters.fromWarehouseId)
    return transfers
}

export function createTransfer(data) {
    const transfers = getStore(STORAGE_KEYS.transfers, initialTransfers)
    const transferNumber = generateNumber('TR', new Date().getFullYear(), transfers.length + 1)

    const newTransfer = {
        ...data,
        id: `transfer-${Date.now()}`,
        transferNumber: data.transferNumber || transferNumber,
        transferDate: data.transferDate || new Date().toISOString().split('T')[0],
        status: 'pending',
        approvedBy: null,
        receivedBy: null,
        createdAt: new Date().toISOString().split('T')[0]
    }
    transfers.push(newTransfer)
    setStore(STORAGE_KEYS.transfers, transfers)
    return newTransfer
}

export function approveTransfer(id, approvedBy) {
    const transfers = getStore(STORAGE_KEYS.transfers, initialTransfers)
    const index = transfers.findIndex(t => t.id === id)
    if (index === -1) return null
    transfers[index] = { ...transfers[index], status: 'in_transit', approvedBy }
    setStore(STORAGE_KEYS.transfers, transfers)
    return transfers[index]
}

export function completeTransfer(id, receivedBy) {
    const transfer = getTransfers().find(t => t.id === id)
    if (!transfer) return null

    const items = transfer.items

    items.forEach(item => {
        updateStockLevel(item.productId, transfer.toWarehouseId, item.quantity)
    })

    return updateTransfer(id, { status: 'completed', receivedBy })
}

// ==================== WAREHOUSES CRUD ====================
export function getWarehouses() {
    return getStore(STORAGE_KEYS.warehouses, initialWarehouses)
}

export function createWarehouse(data) {
    const warehouses = getStore(STORAGE_KEYS.warehouses, initialWarehouses)

    const newWarehouse = {
        ...data,
        id: `wh-${Date.now()}`,
        status: 'active',
        createdAt: new Date().toISOString().split('T')[0]
    }
    warehouses.push(newWarehouse)
    setStore(STORAGE_KEYS.warehouses, warehouses)
    return newWarehouse
}

export function updateWarehouse(id, data) {
    const warehouses = getStore(STORAGE_KEYS.warehouses, initialWarehouses)
    const index = warehouses.findIndex(w => w.id === id)
    if (index === -1) return null
    warehouses[index] = { ...warehouses[index], ...data }
    setStore(STORAGE_KEYS.warehouses, warehouses)
    return warehouses[index]
}

export function deleteWarehouse(id) {
    const warehouses = getStore(STORAGE_KEYS.warehouses, initialWarehouses).filter(w => w.id !== id)
    setStore(STORAGE_KEYS.warehouses, warehouses)
    return true
}

// ==================== INTEGRATION HELPER ====================
export function receiveStockFromPO(po) {
    // 1. Create Stock Movement
    const movement = createStockMovement({
        reference: po.orderNumber,
        referenceType: 'purchase_order',
        movementType: 'receipt',
        date: new Date().toISOString().split('T')[0],
        items: po.items.map(item => ({
            productId: item.productId, // Ensure your PO items have productId
            quantity: item.quantity,
            unitCost: item.unitPrice,
            toWarehouse: 'wh-001' // Default to Main Warehouse for now
        })),
        notes: `Received from PO ${po.orderNumber}`
    })

    // 2. Update Stock Levels
    po.items.forEach(item => {
        // Default to warehouse wh-001 if no warehouse specified in PO item
        // If the stock level entry doesn't exist, updateStockLevel might fail or return null?
        // Let's ensure it handles non-existence or we create it.
        // updateStockLevel implementation checks for existing index.
        const warehouseId = 'wh-001'
        const existing = getStockLevels({ warehouseId }).find(l => l.productId === item.productId)

        if (existing) {
            updateStockLevel(item.productId, warehouseId, item.quantity)
        } else {
            // Create new stock level entry
            const levels = getStore(STORAGE_KEYS.stockLevels, [])
            levels.push({
                id: `stock-${Date.now()}-${Math.random()}`,
                productId: item.productId,
                warehouseId: warehouseId,
                quantity: item.quantity,
                reserved: 0,
                available: item.quantity,
                lastCount: new Date().toISOString().split('T')[0],
                status: 'good'
            })
            setStore(STORAGE_KEYS.stockLevels, levels)
        }
    })

    return movement
}

// ==================== INVENTORY STATS ====================
export function getInventoryStats() {
    const products = getInventoryProducts()
    const stockLevels = getStockLevels()
    const movements = getStockMovements()
    const warehouses = getWarehouses()
    const transfers = getTransfers()

    const totalProducts = products.length
    const totalStockValue = products.reduce((sum, p) => sum + (p.stock * p.price), 0)
    const totalCostValue = products.reduce((sum, p) => sum + (p.stock * p.cost), 0)
    const lowStockItems = getLowStockItems().length

    const totalWarehouses = warehouses.length
    const activeWarehouses = warehouses.filter(w => w.status === 'active').length

    const totalMovements = movements.length
    const totalStockOut = movements.filter(m => m.movementType === 'issue').reduce((sum, m) => {
        return sum + m.items.reduce((s, i) => s + i.quantity, 0)
    }, 0)

    return {
        totalProducts,
        totalStockValue,
        totalCostValue,
        grossProfit: totalStockValue - totalCostValue,
        stockTurnover: totalStockOut / (totalStockValue - totalCostValue) * 100,
        totalWarehouses,
        activeWarehouses,
        lowStockItems,
        totalMovements,
        pendingTransfers: transfers.filter(t => t.status === 'pending').length,
        inTransitTransfers: transfers.filter(t => t.status === 'in_transit').length,
        completedTransfers: transfers.filter(t => t.status === 'completed').length
    }
}
