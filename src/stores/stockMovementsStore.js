// Stock Movements Store — Implements A4 (Universal Stock Movements) and A5 (Shared Items Master Catalog)
// Append-only inventory ledger + unified items catalog across all modules

const STORAGE_KEYS = {
    stockMovements: 'sic-crm-stock-movements',
    itemsCatalog: 'sic-crm-items-catalog'
}

function load(key) {
    try { return JSON.parse(localStorage.getItem(key)) || null } catch { return null }
}
function save(key, data) { localStorage.setItem(key, JSON.stringify(data)) }
function genId(prefix) { return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` }

// ============================================================
// SEED DATA
// ============================================================

// ==================== ITEMS MASTER CATALOG ====================
const SEED_ITEMS_CATALOG = [
    {
        id: 'item-001', sku: 'WP-1000', name: 'Widget Pro',
        description: 'Premium widget with advanced features and stainless steel finish',
        category: 'Finished Goods', unitOfMeasure: 'pcs',
        canBeSold: true, canBePurchased: false, isAsset: false, isConsumable: false,
        salesPrice: 5000, purchasePrice: null, costPrice: 3500,
        taxRuleId: 'tax-001', weight: 0.85, dimensions: { length: 15, width: 10, height: 5 },
        imageUrl: null, minStockLevel: 50, maxStockLevel: 1000,
        reorderPoint: 100, leadTimeDays: 7, defaultWarehouseId: 'wh-001',
        variants: [{ name: 'Color', value: 'Silver' }, { name: 'Color', value: 'Black' }],
        isActive: true, tags: ['bestseller', 'premium']
    },
    {
        id: 'item-002', sku: 'GX-2000', name: 'Gadget X',
        description: 'Basic gadget model for everyday use',
        category: 'Finished Goods', unitOfMeasure: 'pcs',
        canBeSold: true, canBePurchased: false, isAsset: false, isConsumable: false,
        salesPrice: 2500, purchasePrice: null, costPrice: 1500,
        taxRuleId: 'tax-001', weight: 0.45, dimensions: { length: 12, width: 8, height: 3 },
        imageUrl: null, minStockLevel: 25, maxStockLevel: 500,
        reorderPoint: 50, leadTimeDays: 5, defaultWarehouseId: 'wh-001',
        variants: [],
        isActive: true, tags: ['entry-level']
    },
    {
        id: 'item-003', sku: 'RM-STEEL-12', name: 'Steel Rod 12mm',
        description: 'Grade A mild steel rod, 12mm diameter, 6m length',
        category: 'Raw Materials', unitOfMeasure: 'pcs',
        canBeSold: false, canBePurchased: true, isAsset: false, isConsumable: true,
        salesPrice: null, purchasePrice: 65, costPrice: 65,
        taxRuleId: 'tax-002', weight: 8.5, dimensions: { length: 6000, width: 12, height: 12 },
        imageUrl: null, minStockLevel: 200, maxStockLevel: 5000,
        reorderPoint: 500, leadTimeDays: 10, defaultWarehouseId: 'wh-002',
        variants: [],
        isActive: true, tags: ['manufacturing', 'metal']
    },
    {
        id: 'item-004', sku: 'RM-COMP-A', name: 'Component A — Circuit Board',
        description: 'Pre-soldered PCB for Widget Pro assembly',
        category: 'Raw Materials', unitOfMeasure: 'pcs',
        canBeSold: false, canBePurchased: true, isAsset: false, isConsumable: true,
        salesPrice: null, purchasePrice: 800, costPrice: 800,
        taxRuleId: 'tax-001', weight: 0.12, dimensions: { length: 10, width: 8, height: 0.2 },
        imageUrl: null, minStockLevel: 100, maxStockLevel: 2000,
        reorderPoint: 300, leadTimeDays: 14, defaultWarehouseId: 'wh-002',
        variants: [],
        isActive: true, tags: ['electronics', 'manufacturing']
    },
    {
        id: 'item-005', sku: 'RM-PLASTIC-ABS', name: 'ABS Plastic Pellets',
        description: 'Injection molding grade ABS pellets, natural color',
        category: 'Raw Materials', unitOfMeasure: 'kg',
        canBeSold: false, canBePurchased: true, isAsset: false, isConsumable: true,
        salesPrice: null, purchasePrice: 120, costPrice: 120,
        taxRuleId: 'tax-003', weight: 1.0, dimensions: null,
        imageUrl: null, minStockLevel: 500, maxStockLevel: 10000,
        reorderPoint: 1000, leadTimeDays: 7, defaultWarehouseId: 'wh-002',
        variants: [],
        isActive: true, tags: ['manufacturing', 'plastics']
    },
    {
        id: 'item-006', sku: 'PKG-BOX-SM', name: 'Corrugated Box — Small',
        description: '12x12x12 inch corrugated shipping box',
        category: 'Packaging', unitOfMeasure: 'pcs',
        canBeSold: false, canBePurchased: true, isAsset: false, isConsumable: true,
        salesPrice: null, purchasePrice: 35, costPrice: 35,
        taxRuleId: 'tax-003', weight: 0.3, dimensions: { length: 30, width: 30, height: 30 },
        imageUrl: null, minStockLevel: 200, maxStockLevel: 5000,
        reorderPoint: 500, leadTimeDays: 5, defaultWarehouseId: 'wh-001',
        variants: [],
        isActive: true, tags: ['packaging', 'shipping']
    },
    {
        id: 'item-007', sku: 'PKG-BOX-LG', name: 'Corrugated Box — Large',
        description: '24x18x18 inch corrugated shipping box',
        category: 'Packaging', unitOfMeasure: 'pcs',
        canBeSold: false, canBePurchased: true, isAsset: false, isConsumable: true,
        salesPrice: null, purchasePrice: 55, costPrice: 55,
        taxRuleId: 'tax-003', weight: 0.55, dimensions: { length: 60, width: 45, height: 45 },
        imageUrl: null, minStockLevel: 100, maxStockLevel: 3000,
        reorderPoint: 250, leadTimeDays: 5, defaultWarehouseId: 'wh-001',
        variants: [],
        isActive: true, tags: ['packaging', 'shipping']
    },
    {
        id: 'item-008', sku: 'AST-LAPTOP-01', name: 'Dell Vostro Laptop',
        description: '15.6" FHD, Intel i5, 16GB RAM, 512GB SSD — company asset',
        category: 'IT Equipment', unitOfMeasure: 'pcs',
        canBeSold: false, canBePurchased: true, isAsset: true, isConsumable: false,
        salesPrice: null, purchasePrice: 65000, costPrice: 65000,
        taxRuleId: 'tax-001', weight: 1.8, dimensions: { length: 36, width: 24, height: 2 },
        imageUrl: null, minStockLevel: 2, maxStockLevel: 50,
        reorderPoint: 5, leadTimeDays: 7, defaultWarehouseId: 'wh-001',
        variants: [],
        isActive: true, tags: ['asset', 'IT', 'laptop']
    },
    {
        id: 'item-009', sku: 'AST-DESK-ERG', name: 'Ergonomic Standing Desk',
        description: 'Motorized height-adjustable standing desk, 160cm x 80cm',
        category: 'Furniture', unitOfMeasure: 'pcs',
        canBeSold: false, canBePurchased: true, isAsset: true, isConsumable: false,
        salesPrice: null, purchasePrice: 22000, costPrice: 22000,
        taxRuleId: 'tax-001', weight: 35, dimensions: { length: 160, width: 80, height: 125 },
        imageUrl: null, minStockLevel: 0, maxStockLevel: 30,
        reorderPoint: 3, leadTimeDays: 14, defaultWarehouseId: 'wh-001',
        variants: [{ name: 'Color', value: 'White' }, { name: 'Color', value: 'Walnut' }],
        isActive: true, tags: ['asset', 'furniture', 'ergonomic']
    },
    {
        id: 'item-010', sku: 'FG-WIDGET-LITE', name: 'Widget Lite',
        description: 'Budget-friendly widget for cost-conscious customers',
        category: 'Finished Goods', unitOfMeasure: 'pcs',
        canBeSold: true, canBePurchased: false, isAsset: false, isConsumable: false,
        salesPrice: 1800, purchasePrice: null, costPrice: 950,
        taxRuleId: 'tax-002', weight: 0.35, dimensions: { length: 10, width: 7, height: 3 },
        imageUrl: null, minStockLevel: 100, maxStockLevel: 2000,
        reorderPoint: 200, leadTimeDays: 5, defaultWarehouseId: 'wh-001',
        variants: [{ name: 'Color', value: 'Blue' }, { name: 'Color', value: 'Green' }],
        isActive: true, tags: ['budget', 'entry-level']
    },
    {
        id: 'item-011', sku: 'SVC-INSTALL', name: 'Installation Service',
        description: 'On-site product installation and setup (per hour)',
        category: 'Services', unitOfMeasure: 'hours',
        canBeSold: true, canBePurchased: false, isAsset: false, isConsumable: false,
        salesPrice: 1500, purchasePrice: null, costPrice: 500,
        taxRuleId: 'tax-001', weight: null, dimensions: null,
        imageUrl: null, minStockLevel: 0, maxStockLevel: 0,
        reorderPoint: 0, leadTimeDays: 0, defaultWarehouseId: null,
        variants: [],
        isActive: true, tags: ['service', 'installation']
    },
    {
        id: 'item-012', sku: 'MKT-SAMPLE-WP', name: 'Widget Pro — Marketing Sample',
        description: 'Branded sample unit for influencer seeding and marketing events',
        category: 'Marketing', unitOfMeasure: 'pcs',
        canBeSold: false, canBePurchased: false, isAsset: false, isConsumable: true,
        salesPrice: null, purchasePrice: null, costPrice: 3500,
        taxRuleId: 'tax-009', weight: 0.85, dimensions: { length: 15, width: 10, height: 5 },
        imageUrl: null, minStockLevel: 10, maxStockLevel: 100,
        reorderPoint: 20, leadTimeDays: 3, defaultWarehouseId: 'wh-001',
        variants: [],
        isActive: true, tags: ['marketing', 'influencer', 'sample']
    }
]

// ==================== STOCK MOVEMENTS ====================
const SEED_STOCK_MOVEMENTS = [
    {
        id: 'sm-001', itemId: 'item-001', movementType: 'purchase',
        quantity: 200, warehouseId: 'wh-001', warehouseFromId: null,
        referenceType: 'purchase_order', referenceId: 'po-init-001',
        batchNumber: 'BATCH-WP-2025Q4', serialNumber: null,
        unitCost: 3500, totalValue: 700000,
        createdBy: 'system', createdAt: '2025-12-01T08:00:00Z'
    },
    {
        id: 'sm-002', itemId: 'item-002', movementType: 'purchase',
        quantity: 150, warehouseId: 'wh-001', warehouseFromId: null,
        referenceType: 'purchase_order', referenceId: 'po-init-002',
        batchNumber: 'BATCH-GX-2025Q4', serialNumber: null,
        unitCost: 1500, totalValue: 225000,
        createdBy: 'system', createdAt: '2025-12-01T08:00:00Z'
    },
    {
        id: 'sm-003', itemId: 'item-001', movementType: 'sale',
        quantity: -30, warehouseId: 'wh-001', warehouseFromId: null,
        referenceType: 'sales_order', referenceId: 'so-001',
        batchNumber: 'BATCH-WP-2025Q4', serialNumber: null,
        unitCost: 3500, totalValue: -105000,
        createdBy: 'admin', createdAt: '2026-01-15T10:30:00Z'
    },
    {
        id: 'sm-004', itemId: 'item-002', movementType: 'sale',
        quantity: -3, warehouseId: 'wh-001', warehouseFromId: null,
        referenceType: 'sales_order', referenceId: 'pos-txn-0045',
        batchNumber: null, serialNumber: null,
        unitCost: 1500, totalValue: -4500,
        createdBy: 'cashier-01', createdAt: '2026-02-01T11:15:00Z'
    },
    {
        id: 'sm-005', itemId: 'item-002', movementType: 'return_in',
        quantity: 1, warehouseId: 'wh-001', warehouseFromId: null,
        referenceType: 'sales_order', referenceId: 'ret-001',
        batchNumber: null, serialNumber: null,
        unitCost: 1500, totalValue: 1500,
        createdBy: 'admin', createdAt: '2026-02-05T16:00:00Z'
    },
    {
        id: 'sm-006', itemId: 'item-003', movementType: 'purchase',
        quantity: 1000, warehouseId: 'wh-002', warehouseFromId: null,
        referenceType: 'purchase_order', referenceId: 'po-rm-001',
        batchNumber: 'BATCH-STL-202601', serialNumber: null,
        unitCost: 65, totalValue: 65000,
        createdBy: 'purchase-mgr', createdAt: '2026-01-10T09:00:00Z'
    },
    {
        id: 'sm-007', itemId: 'item-004', movementType: 'purchase',
        quantity: 500, warehouseId: 'wh-002', warehouseFromId: null,
        referenceType: 'purchase_order', referenceId: 'po-rm-002',
        batchNumber: 'BATCH-PCB-202601', serialNumber: null,
        unitCost: 800, totalValue: 400000,
        createdBy: 'purchase-mgr', createdAt: '2026-01-12T09:00:00Z'
    },
    {
        id: 'sm-008', itemId: 'item-004', movementType: 'manufacturing_consumption',
        quantity: -100, warehouseId: 'wh-002', warehouseFromId: null,
        referenceType: 'manufacturing_order', referenceId: 'mo-001',
        batchNumber: 'BATCH-PCB-202601', serialNumber: null,
        unitCost: 800, totalValue: -80000,
        createdBy: 'prod-mgr', createdAt: '2026-02-08T08:30:00Z'
    },
    {
        id: 'sm-009', itemId: 'item-001', movementType: 'manufacturing_output',
        quantity: 100, warehouseId: 'wh-001', warehouseFromId: null,
        referenceType: 'manufacturing_order', referenceId: 'mo-001',
        batchNumber: 'BATCH-WP-202602', serialNumber: null,
        unitCost: 3500, totalValue: 350000,
        createdBy: 'prod-mgr', createdAt: '2026-02-08T16:00:00Z'
    },
    {
        id: 'sm-010', itemId: 'item-006', movementType: 'purchase',
        quantity: 500, warehouseId: 'wh-001', warehouseFromId: null,
        referenceType: 'purchase_order', referenceId: 'po-004',
        batchNumber: null, serialNumber: null,
        unitCost: 35, totalValue: 17500,
        createdBy: 'purchase-mgr', createdAt: '2026-02-05T10:00:00Z'
    },
    {
        id: 'sm-011', itemId: 'item-001', movementType: 'transfer',
        quantity: -20, warehouseId: 'wh-001', warehouseFromId: 'wh-001',
        referenceType: 'stock_journal', referenceId: 'sj-001',
        batchNumber: null, serialNumber: null,
        unitCost: 3500, totalValue: -70000,
        createdBy: 'warehouse-mgr', createdAt: '2026-02-10T14:00:00Z'
    },
    {
        id: 'sm-012', itemId: 'item-001', movementType: 'transfer',
        quantity: 20, warehouseId: 'wh-002', warehouseFromId: 'wh-001',
        referenceType: 'stock_journal', referenceId: 'sj-001',
        batchNumber: null, serialNumber: null,
        unitCost: 3500, totalValue: 70000,
        createdBy: 'warehouse-mgr', createdAt: '2026-02-10T14:00:00Z'
    },
    {
        id: 'sm-013', itemId: 'item-005', movementType: 'purchase',
        quantity: 2000, warehouseId: 'wh-002', warehouseFromId: null,
        referenceType: 'purchase_order', referenceId: 'po-rm-003',
        batchNumber: 'BATCH-ABS-202601', serialNumber: null,
        unitCost: 120, totalValue: 240000,
        createdBy: 'purchase-mgr', createdAt: '2026-01-20T09:00:00Z'
    },
    {
        id: 'sm-014', itemId: 'item-005', movementType: 'manufacturing_consumption',
        quantity: -150, warehouseId: 'wh-002', warehouseFromId: null,
        referenceType: 'manufacturing_order', referenceId: 'mo-001',
        batchNumber: 'BATCH-ABS-202601', serialNumber: null,
        unitCost: 120, totalValue: -18000,
        createdBy: 'prod-mgr', createdAt: '2026-02-08T08:30:00Z'
    },
    {
        id: 'sm-015', itemId: 'item-012', movementType: 'marketing_seeding',
        quantity: -5, warehouseId: 'wh-001', warehouseFromId: null,
        referenceType: 'stock_journal', referenceId: 'mkt-seed-001',
        batchNumber: null, serialNumber: null,
        unitCost: 3500, totalValue: -17500,
        createdBy: 'marketing-mgr', createdAt: '2026-02-14T10:00:00Z'
    },
    {
        id: 'sm-016', itemId: 'item-008', movementType: 'purchase',
        quantity: 5, warehouseId: 'wh-001', warehouseFromId: null,
        referenceType: 'purchase_order', referenceId: 'po-001',
        batchNumber: null, serialNumber: 'DV-SN-001,DV-SN-002,DV-SN-003,DV-SN-004,DV-SN-005',
        unitCost: 65000, totalValue: 325000,
        createdBy: 'it-admin', createdAt: '2026-01-28T12:00:00Z'
    },
    {
        id: 'sm-017', itemId: 'item-008', movementType: 'return_out',
        quantity: -1, warehouseId: 'wh-001', warehouseFromId: null,
        referenceType: 'purchase_order', referenceId: 'ret-vendor-001',
        batchNumber: null, serialNumber: 'DV-SN-005',
        unitCost: 65000, totalValue: -65000,
        createdBy: 'it-admin', createdAt: '2026-02-12T09:00:00Z'
    },
    {
        id: 'sm-018', itemId: 'item-010', movementType: 'manufacturing_output',
        quantity: 300, warehouseId: 'wh-001', warehouseFromId: null,
        referenceType: 'manufacturing_order', referenceId: 'mo-002',
        batchNumber: 'BATCH-WL-202602', serialNumber: null,
        unitCost: 950, totalValue: 285000,
        createdBy: 'prod-mgr', createdAt: '2026-02-15T16:00:00Z'
    },
    {
        id: 'sm-019', itemId: 'item-010', movementType: 'sale',
        quantity: -50, warehouseId: 'wh-001', warehouseFromId: null,
        referenceType: 'sales_order', referenceId: 'so-010',
        batchNumber: 'BATCH-WL-202602', serialNumber: null,
        unitCost: 950, totalValue: -47500,
        createdBy: 'admin', createdAt: '2026-02-18T11:00:00Z'
    },
    {
        id: 'sm-020', itemId: 'item-003', movementType: 'adjustment',
        quantity: -15, warehouseId: 'wh-002', warehouseFromId: null,
        referenceType: 'stock_journal', referenceId: 'adj-001',
        batchNumber: 'BATCH-STL-202601', serialNumber: null,
        unitCost: 65, totalValue: -975,
        createdBy: 'warehouse-mgr', createdAt: '2026-02-20T09:00:00Z'
    },
    {
        id: 'sm-021', itemId: 'item-012', movementType: 'write_off',
        quantity: -2, warehouseId: 'wh-001', warehouseFromId: null,
        referenceType: 'stock_journal', referenceId: 'wo-001',
        batchNumber: null, serialNumber: null,
        unitCost: 3500, totalValue: -7000,
        createdBy: 'marketing-mgr', createdAt: '2026-02-22T15:00:00Z'
    }
]

// ============================================================
// INIT
// ============================================================
function initStore(key, seed) {
    if (!load(key)) save(key, seed)
}

initStore(STORAGE_KEYS.stockMovements, SEED_STOCK_MOVEMENTS)
initStore(STORAGE_KEYS.itemsCatalog, SEED_ITEMS_CATALOG)

// ============================================================
// A4 — UNIVERSAL STOCK MOVEMENTS
// ============================================================

export const recordMovement = (data) => {
    const all = load(STORAGE_KEYS.stockMovements) || []
    const movement = {
        ...data,
        id: genId('sm'),
        createdAt: new Date().toISOString()
    }
    all.push(movement)
    save(STORAGE_KEYS.stockMovements, all)
    return movement
}

export const getMovements = (filters = {}) => {
    let data = load(STORAGE_KEYS.stockMovements) || []
    if (filters.itemId) data = data.filter(m => m.itemId === filters.itemId)
    if (filters.movementType) data = data.filter(m => m.movementType === filters.movementType)
    if (filters.warehouseId) data = data.filter(m => m.warehouseId === filters.warehouseId)
    if (filters.referenceType) data = data.filter(m => m.referenceType === filters.referenceType)
    if (filters.referenceId) data = data.filter(m => m.referenceId === filters.referenceId)
    if (filters.batchNumber) data = data.filter(m => m.batchNumber === filters.batchNumber)
    if (filters.dateFrom) data = data.filter(m => m.createdAt >= filters.dateFrom)
    if (filters.dateTo) data = data.filter(m => m.createdAt <= filters.dateTo)
    if (filters.search) {
        const s = filters.search.toLowerCase()
        data = data.filter(m =>
            (m.referenceId || '').toLowerCase().includes(s) ||
            (m.batchNumber || '').toLowerCase().includes(s) ||
            (m.serialNumber || '').toLowerCase().includes(s)
        )
    }
    return data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

export const getCurrentStock = (itemId, warehouseId = null) => {
    let data = load(STORAGE_KEYS.stockMovements) || []
    data = data.filter(m => m.itemId === itemId)
    if (warehouseId) data = data.filter(m => m.warehouseId === warehouseId)
    return data.reduce((sum, m) => sum + (m.quantity || 0), 0)
}

export const getStockHistory = (itemId) => {
    const movements = (load(STORAGE_KEYS.stockMovements) || [])
        .filter(m => m.itemId === itemId)
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))

    let runningBalance = 0
    return movements.map(m => {
        runningBalance += (m.quantity || 0)
        return { ...m, runningBalance }
    })
}

export const getStockValuation = (warehouseId = null) => {
    const items = load(STORAGE_KEYS.itemsCatalog) || []
    const movements = load(STORAGE_KEYS.stockMovements) || []

    return items.map(item => {
        let itemMovements = movements.filter(m => m.itemId === item.id)
        if (warehouseId) itemMovements = itemMovements.filter(m => m.warehouseId === warehouseId)

        const currentQty = itemMovements.reduce((sum, m) => sum + (m.quantity || 0), 0)
        const valuationCost = item.costPrice || 0
        const totalValue = currentQty * valuationCost

        return {
            itemId: item.id,
            sku: item.sku,
            name: item.name,
            category: item.category,
            currentQty,
            unitCost: valuationCost,
            totalValue,
            unitOfMeasure: item.unitOfMeasure
        }
    }).filter(v => v.currentQty !== 0)
}

export const getStockByWarehouse = (warehouseId) => {
    const items = load(STORAGE_KEYS.itemsCatalog) || []
    const movements = load(STORAGE_KEYS.stockMovements) || []

    return items.map(item => {
        const qty = movements
            .filter(m => m.itemId === item.id && m.warehouseId === warehouseId)
            .reduce((sum, m) => sum + (m.quantity || 0), 0)

        if (qty === 0) return null
        return {
            itemId: item.id,
            sku: item.sku,
            name: item.name,
            category: item.category,
            quantity: qty,
            unitOfMeasure: item.unitOfMeasure,
            reorderPoint: item.reorderPoint,
            needsReorder: qty <= item.reorderPoint
        }
    }).filter(Boolean)
}

export const getMovementSummary = (itemId, groupBy = 'type') => {
    let data = (load(STORAGE_KEYS.stockMovements) || []).filter(m => m.itemId === itemId)
    const summary = {}
    data.forEach(m => {
        const key = groupBy === 'type' ? m.movementType : (m.createdAt ? m.createdAt.substring(0, 7) : 'unknown')
        if (!summary[key]) summary[key] = { count: 0, totalQty: 0, totalValue: 0 }
        summary[key].count += 1
        summary[key].totalQty += (m.quantity || 0)
        summary[key].totalValue += (m.totalValue || 0)
    })
    return summary
}

// ============================================================
// A5 — SHARED ITEMS MASTER CATALOG
// ============================================================

export const getItems = (filters = {}) => {
    let data = load(STORAGE_KEYS.itemsCatalog) || []
    if (filters.category) data = data.filter(i => i.category === filters.category)
    if (filters.canBeSold !== undefined) data = data.filter(i => i.canBeSold === filters.canBeSold)
    if (filters.canBePurchased !== undefined) data = data.filter(i => i.canBePurchased === filters.canBePurchased)
    if (filters.isAsset !== undefined) data = data.filter(i => i.isAsset === filters.isAsset)
    if (filters.isConsumable !== undefined) data = data.filter(i => i.isConsumable === filters.isConsumable)
    if (filters.isActive !== undefined) data = data.filter(i => i.isActive === filters.isActive)
    if (filters.tag) data = data.filter(i => (i.tags || []).includes(filters.tag))
    if (filters.defaultWarehouseId) data = data.filter(i => i.defaultWarehouseId === filters.defaultWarehouseId)
    if (filters.search) {
        const s = filters.search.toLowerCase()
        data = data.filter(i =>
            i.name.toLowerCase().includes(s) ||
            i.sku.toLowerCase().includes(s) ||
            (i.description || '').toLowerCase().includes(s) ||
            (i.tags || []).some(t => t.toLowerCase().includes(s))
        )
    }
    return data
}

export const getItem = (id) => {
    const data = load(STORAGE_KEYS.itemsCatalog) || []
    return data.find(i => i.id === id) || null
}

export const getItemBySku = (sku) => {
    const data = load(STORAGE_KEYS.itemsCatalog) || []
    return data.find(i => i.sku === sku) || null
}

export const createItem = (data) => {
    const all = load(STORAGE_KEYS.itemsCatalog) || []
    const item = {
        ...data,
        id: genId('item'),
        isActive: data.isActive !== false,
        tags: data.tags || []
    }
    all.push(item)
    save(STORAGE_KEYS.itemsCatalog, all)
    return item
}

export const updateItem = (id, data) => {
    const all = load(STORAGE_KEYS.itemsCatalog) || []
    const idx = all.findIndex(i => i.id === id)
    if (idx !== -1) { all[idx] = { ...all[idx], ...data }; save(STORAGE_KEYS.itemsCatalog, all) }
    return all[idx] || null
}

export const deleteItem = (id) => {
    const all = (load(STORAGE_KEYS.itemsCatalog) || []).filter(i => i.id !== id)
    save(STORAGE_KEYS.itemsCatalog, all)
    return true
}

export const getItemsByType = (type) => {
    const data = load(STORAGE_KEYS.itemsCatalog) || []
    if (type === 'sold') return data.filter(i => i.canBeSold && i.isActive)
    if (type === 'purchased') return data.filter(i => i.canBePurchased && i.isActive)
    if (type === 'assets') return data.filter(i => i.isAsset && i.isActive)
    if (type === 'consumables') return data.filter(i => i.isConsumable && i.isActive)
    return data.filter(i => i.isActive)
}

export const getItemsNeedingReorder = () => {
    const items = load(STORAGE_KEYS.itemsCatalog) || []
    const movements = load(STORAGE_KEYS.stockMovements) || []

    return items.filter(item => {
        if (!item.isActive || item.reorderPoint <= 0) return false
        const currentStock = movements
            .filter(m => m.itemId === item.id)
            .reduce((sum, m) => sum + (m.quantity || 0), 0)
        return currentStock <= item.reorderPoint
    }).map(item => {
        const currentStock = movements
            .filter(m => m.itemId === item.id)
            .reduce((sum, m) => sum + (m.quantity || 0), 0)
        return {
            ...item,
            currentStock,
            deficit: item.reorderPoint - currentStock,
            suggestedOrderQty: (item.maxStockLevel || item.reorderPoint * 2) - currentStock
        }
    })
}

export const searchItems = (query) => {
    if (!query) return load(STORAGE_KEYS.itemsCatalog) || []
    const s = query.toLowerCase()
    return (load(STORAGE_KEYS.itemsCatalog) || []).filter(i =>
        i.name.toLowerCase().includes(s) ||
        i.sku.toLowerCase().includes(s) ||
        (i.description || '').toLowerCase().includes(s) ||
        (i.category || '').toLowerCase().includes(s) ||
        (i.tags || []).some(t => t.toLowerCase().includes(s))
    )
}

export const getItemStock = (itemId) => {
    const item = getItem(itemId)
    if (!item) return null

    const movements = load(STORAGE_KEYS.stockMovements) || []
    const itemMovements = movements.filter(m => m.itemId === itemId)

    // Group by warehouse
    const byWarehouse = {}
    itemMovements.forEach(m => {
        if (!byWarehouse[m.warehouseId]) byWarehouse[m.warehouseId] = 0
        byWarehouse[m.warehouseId] += (m.quantity || 0)
    })

    const totalStock = Object.values(byWarehouse).reduce((sum, qty) => sum + qty, 0)

    return {
        itemId: item.id,
        sku: item.sku,
        name: item.name,
        totalStock,
        byWarehouse,
        reorderPoint: item.reorderPoint,
        minStockLevel: item.minStockLevel,
        maxStockLevel: item.maxStockLevel,
        needsReorder: totalStock <= item.reorderPoint,
        isLowStock: totalStock <= item.minStockLevel
    }
}

export const getCategories = () => {
    const items = load(STORAGE_KEYS.itemsCatalog) || []
    return [...new Set(items.map(i => i.category).filter(Boolean))]
}
