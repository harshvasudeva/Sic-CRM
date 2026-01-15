import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, ShoppingCart, Plus, Minus, CreditCard, DollarSign, Printer, X } from 'lucide-react'
import DataTable from '../../components/DataTable'
import Modal from '../../components/Modal'
import FormInput from '../../components/FormInput'
import { useToast } from '../../components/Toast'

function PointOfSale() {
    const toast = useToast()
    const [cart, setCart] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    const [products] = useState([
        { id: 1, name: 'Product A', price: 29.99, sku: 'SKU001', stock: 50 },
        { id: 2, name: 'Product B', price: 49.99, sku: 'SKU002', stock: 30 },
        { id: 3, name: 'Product C', price: 19.99, sku: 'SKU003', stock: 100 },
        { id: 4, name: 'Service Package', price: 199.99, sku: 'SRV001', stock: 999 },
        { id: 5, name: 'Premium Widget', price: 79.99, sku: 'SKU004', stock: 25 },
    ])
    const [customer, setCustomer] = useState('')
    const [paymentMethod, setPaymentMethod] = useState('cash')
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)

    const addToCart = (product) => {
        const existingItem = cart.find(item => item.id === product.id)
        if (existingItem) {
            setCart(cart.map(item =>
                item.id === product.id
                    ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) }
                    : item
            ))
        } else {
            setCart([...cart, { ...product, quantity: 1 }])
        }
    }

    const removeFromCart = (productId) => {
        setCart(cart.filter(item => item.id !== productId))
    }

    const updateQuantity = (productId, delta) => {
        setCart(cart.map(item => {
            if (item.id === productId) {
                const newQty = Math.max(1, Math.min(item.quantity + delta, item.stock))
                return { ...item, quantity: newQty }
            }
            return item
        }))
    }

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const tax = subtotal * 0.1
    const total = subtotal + tax

    const handleCheckout = () => {
        if (cart.length === 0) {
            toast.error('Cart is empty')
            return
        }
        setIsCheckoutOpen(true)
    }

    const processPayment = () => {
        toast.success(`Payment processed successfully! Total: $${total.toFixed(2)}`)
        setCart([])
        setCustomer('')
        setIsCheckoutOpen(false)
    }

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const cartColumns = [
        {
            key: 'name',
            label: 'Product',
            render: (item) => (
                <div>
                    <span className="font-medium">{item.name}</span>
                    <span className="text-gray-400 text-xs ml-2">{item.sku}</span>
                </div>
            )
        },
        {
            key: 'price',
            label: 'Price',
            render: (item) => `$${item.price.toFixed(2)}`
        },
        {
            key: 'quantity',
            label: 'Qty',
            render: (item) => (
                <div className="flex items-center gap-2">
                    <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-gray-700 rounded">
                        <Minus size={14} />
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-gray-700 rounded">
                        <Plus size={14} />
                    </button>
                </div>
            )
        },
        {
            key: 'total',
            label: 'Total',
            render: (item) => `$${(item.price * item.quantity).toFixed(2)}`
        },
        {
            key: 'actions',
            label: '',
            render: (item) => (
                <button onClick={() => removeFromCart(item.id)} className="p-1 hover:bg-red-600 rounded text-red-400">
                    <X size={14} />
                </button>
            )
        }
    ]

    return (
        <div className="flex h-[calc(100vh-80px)]">
            <div className="flex-1 p-6 overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold">Point of Sale</h1>
                        <p className="text-gray-400 mt-1">Process sales transactions</p>
                    </div>
                    <div className="relative w-80">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search products or scan barcode..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-blue-500"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredProducts.map((product) => (
                        <motion.div
                            key={product.id}
                            whileHover={{ scale: 1.02 }}
                            onClick={() => addToCart(product)}
                            className="bg-gray-800 rounded-lg p-4 cursor-pointer hover:bg-gray-750 border border-gray-700 hover:border-blue-500 transition-all"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs text-gray-400">{product.sku}</span>
                                <span className="text-xs bg-blue-600 px-2 py-0.5 rounded">Stock: {product.stock}</span>
                            </div>
                            <h3 className="font-semibold mb-1">{product.name}</h3>
                            <p className="text-xl font-bold text-blue-400">${product.price.toFixed(2)}</p>
                        </motion.div>
                    ))}
                </div>
            </div>

            <div className="w-96 bg-gray-800 border-l border-gray-700 flex flex-col">
                <div className="p-4 border-b border-gray-700 flex items-center gap-2">
                    <ShoppingCart size={20} className="text-blue-400" />
                    <h2 className="text-lg font-semibold">Current Sale</h2>
                    <span className="ml-auto bg-blue-600 text-xs px-2 py-1 rounded-full">{cart.length} items</span>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    {cart.length === 0 ? (
                        <div className="text-center text-gray-400 py-8">
                            <ShoppingCart size={48} className="mx-auto mb-4 opacity-50" />
                            <p>Cart is empty</p>
                            <p className="text-sm">Add products to start</p>
                        </div>
                    ) : (
                        <DataTable columns={cartColumns} data={cart} />
                    )}
                </div>

                <div className="p-4 border-t border-gray-700 bg-gray-900">
                    <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Subtotal</span>
                            <span>${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Tax (10%)</span>
                            <span>${tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xl font-bold border-t border-gray-700 pt-2">
                            <span>Total</span>
                            <span className="text-blue-400">${total.toFixed(2)}</span>
                        </div>
                    </div>

                    <button
                        onClick={handleCheckout}
                        disabled={cart.length === 0}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all"
                    >
                        <CreditCard size={20} />
                        Checkout
                    </button>
                </div>
            </div>

            <Modal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} title="Checkout">
                <div className="space-y-4">
                    <FormInput
                        label="Customer (Optional)"
                        value={customer}
                        onChange={(e) => setCustomer(e.target.value)}
                        placeholder="Customer name or ID"
                    />
                    <div>
                        <label className="block text-sm font-medium mb-2">Payment Method</label>
                        <div className="grid grid-cols-3 gap-2">
                            {['cash', 'card', 'credit'].map((method) => (
                                <button
                                    key={method}
                                    onClick={() => setPaymentMethod(method)}
                                    className={`p-3 rounded-lg border-2 transition-all ${
                                        paymentMethod === method
                                            ? 'border-blue-500 bg-blue-600/20'
                                            : 'border-gray-700 hover:border-gray-600'
                                    }`}
                                >
                                    {method === 'cash' && <DollarSign size={20} className="mx-auto mb-1" />}
                                    {method === 'card' && <CreditCard size={20} className="mx-auto mb-1" />}
                                    <span className="capitalize block text-sm">{method}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-4 space-y-2">
                        <div className="flex justify-between">
                            <span className="text-gray-400">Items</span>
                            <span>{cart.length}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Subtotal</span>
                            <span>${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-400">Tax</span>
                            <span>${tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xl font-bold pt-2 border-t border-gray-700">
                            <span>Total</span>
                            <span className="text-blue-400">${total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-3 mt-6">
                    <button
                        onClick={() => setIsCheckoutOpen(false)}
                        className="flex-1 bg-gray-700 hover:bg-gray-600 py-2 rounded-lg"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={processPayment}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 py-2 rounded-lg font-semibold"
                    >
                        Process Payment
                    </button>
                </div>
            </Modal>
        </div>
    )
}

export default PointOfSale
