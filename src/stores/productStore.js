// Simple product store using localStorage for persistence
// In production, this would be replaced with API calls

const STORAGE_KEY = 'sic-crm-products'

// Initial demo products
const initialProducts = [
    {
        id: 'prod-001',
        name: 'Widget Pro',
        sku: 'WGT-PRO-001',
        category: 'Electronics',
        type: 'goods',
        price: 49.99,
        cost: 25.00,
        stock: 150,
        minStock: 20,
        description: 'Professional grade widget for industrial use',
        status: 'active',
        createdAt: '2026-01-01'
    },
    {
        id: 'prod-002',
        name: 'Gadget X',
        sku: 'GDG-X-002',
        category: 'Electronics',
        type: 'goods',
        price: 79.99,
        cost: 40.00,
        stock: 85,
        minStock: 15,
        description: 'Next-generation gadget with advanced features',
        status: 'active',
        createdAt: '2026-01-02'
    },
    {
        id: 'prod-003',
        name: 'Device Plus',
        sku: 'DEV-PLS-003',
        category: 'Accessories',
        type: 'goods',
        price: 29.99,
        cost: 12.00,
        stock: 200,
        minStock: 30,
        description: 'Compact device for everyday tasks',
        status: 'active',
        createdAt: '2026-01-03'
    },
    {
        id: 'prod-004',
        name: 'Consulting Service',
        sku: 'SRV-CON-001',
        category: 'Services',
        type: 'service',
        price: 150.00,
        cost: 0,
        stock: null,
        minStock: null,
        description: 'Professional consulting per hour',
        status: 'active',
        createdAt: '2026-01-04'
    },
    {
        id: 'prod-005',
        name: 'Starter Bundle',
        sku: 'BDL-STR-001',
        category: 'Bundles',
        type: 'combo',
        price: 99.99,
        cost: 50.00,
        stock: 50,
        minStock: 10,
        description: 'Bundle including Widget Pro + Device Plus',
        status: 'active',
        createdAt: '2026-01-05'
    }
]

// Get all products
export function getProducts() {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
        return JSON.parse(stored)
    }
    // Initialize with demo data
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialProducts))
    return initialProducts
}

// Get single product
export function getProduct(id) {
    const products = getProducts()
    return products.find(p => p.id === id)
}

// Create product
export function createProduct(data) {
    const products = getProducts()
    const newProduct = {
        ...data,
        id: `prod-${Date.now()}`,
        createdAt: new Date().toISOString().split('T')[0]
    }
    products.push(newProduct)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products))
    return newProduct
}

// Update product
export function updateProduct(id, data) {
    const products = getProducts()
    const index = products.findIndex(p => p.id === id)
    if (index === -1) return null

    products[index] = { ...products[index], ...data }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products))
    return products[index]
}

// Delete product
export function deleteProduct(id) {
    const products = getProducts()
    const filtered = products.filter(p => p.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
    return true
}

// Get categories
export function getCategories() {
    const products = getProducts()
    const categories = [...new Set(products.map(p => p.category))]
    return categories
}

// Get low stock products
export function getLowStockProducts() {
    const products = getProducts()
    return products.filter(p => p.type === 'goods' && p.stock <= p.minStock)
}

// Update stock
export function updateStock(id, quantity) {
    const product = getProduct(id)
    if (!product || product.type !== 'goods') return null
    return updateProduct(id, { stock: quantity })
}
