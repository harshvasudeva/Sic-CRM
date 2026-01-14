import { useState, useEffect } from 'react'
import { Package, DollarSign, Layers, Tag, FileText, Archive } from 'lucide-react'
import FormInput, { FormTextarea, FormSelect } from '../../components/FormInput'
import { ModalFooter } from '../../components/Modal'
import { createProduct, updateProduct } from '../../stores/productStore'
import { useToast } from '../../components/Toast'

const productTypes = [
    { value: 'goods', label: 'Goods (Physical Product)' },
    { value: 'service', label: 'Service' },
    { value: 'combo', label: 'Combo / Bundle' }
]

const categories = [
    { value: 'Electronics', label: 'Electronics' },
    { value: 'Accessories', label: 'Accessories' },
    { value: 'Services', label: 'Services' },
    { value: 'Bundles', label: 'Bundles' },
    { value: 'Software', label: 'Software' },
    { value: 'Hardware', label: 'Hardware' }
]

const statuses = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'draft', label: 'Draft' }
]

function ProductForm({ product, onClose }) {
    const toast = useToast()
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState({})

    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        category: '',
        type: 'goods',
        price: '',
        cost: '',
        stock: '',
        minStock: '',
        description: '',
        status: 'active'
    })

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name || '',
                sku: product.sku || '',
                category: product.category || '',
                type: product.type || 'goods',
                price: product.price?.toString() || '',
                cost: product.cost?.toString() || '',
                stock: product.stock?.toString() || '',
                minStock: product.minStock?.toString() || '',
                description: product.description || '',
                status: product.status || 'active'
            })
        }
    }, [product])

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }))
        }
    }

    const validate = () => {
        const newErrors = {}
        if (!formData.name.trim()) newErrors.name = 'Product name is required'
        if (!formData.sku.trim()) newErrors.sku = 'SKU is required'
        if (!formData.category) newErrors.category = 'Category is required'
        if (!formData.price || parseFloat(formData.price) <= 0) {
            newErrors.price = 'Valid price is required'
        }
        if (formData.type === 'goods' && (!formData.stock || parseInt(formData.stock) < 0)) {
            newErrors.stock = 'Stock quantity is required for goods'
        }
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!validate()) return

        setLoading(true)
        try {
            const data = {
                ...formData,
                price: parseFloat(formData.price),
                cost: parseFloat(formData.cost) || 0,
                stock: formData.type === 'goods' ? parseInt(formData.stock) : null,
                minStock: formData.type === 'goods' ? parseInt(formData.minStock) || 0 : null
            }

            if (product) {
                updateProduct(product.id, data)
                toast.success('Product updated successfully')
            } else {
                createProduct(data)
                toast.success('Product created successfully')
            }
            onClose(true)
        } catch (error) {
            toast.error('Failed to save product')
        } finally {
            setLoading(false)
        }
    }

    const isGoods = formData.type === 'goods'

    return (
        <form onSubmit={handleSubmit}>
            <div className="form-grid">
                <FormInput
                    label="Product Name"
                    icon={Package}
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="Enter product name"
                    error={errors.name}
                />

                <FormInput
                    label="SKU"
                    icon={Tag}
                    value={formData.sku}
                    onChange={(e) => handleChange('sku', e.target.value.toUpperCase())}
                    placeholder="e.g., PRD-001"
                    error={errors.sku}
                />

                <FormSelect
                    label="Category"
                    options={categories}
                    value={formData.category}
                    onChange={(e) => handleChange('category', e.target.value)}
                    error={errors.category}
                />

                <FormSelect
                    label="Product Type"
                    options={productTypes}
                    value={formData.type}
                    onChange={(e) => handleChange('type', e.target.value)}
                />

                <FormInput
                    label="Selling Price"
                    icon={DollarSign}
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => handleChange('price', e.target.value)}
                    placeholder="0.00"
                    error={errors.price}
                />

                <FormInput
                    label="Cost Price"
                    icon={DollarSign}
                    type="number"
                    step="0.01"
                    value={formData.cost}
                    onChange={(e) => handleChange('cost', e.target.value)}
                    placeholder="0.00"
                />

                {isGoods && (
                    <>
                        <FormInput
                            label="Stock Quantity"
                            icon={Layers}
                            type="number"
                            value={formData.stock}
                            onChange={(e) => handleChange('stock', e.target.value)}
                            placeholder="0"
                            error={errors.stock}
                        />

                        <FormInput
                            label="Min Stock Level"
                            icon={Archive}
                            type="number"
                            value={formData.minStock}
                            onChange={(e) => handleChange('minStock', e.target.value)}
                            placeholder="Low stock alert threshold"
                        />
                    </>
                )}

                <FormSelect
                    label="Status"
                    options={statuses}
                    value={formData.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                />
            </div>

            <div className="form-full-width">
                <FormTextarea
                    label="Description"
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Product description..."
                    rows={3}
                />
            </div>

            <ModalFooter>
                <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => onClose(false)}
                    disabled={loading}
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="btn-primary"
                    disabled={loading}
                >
                    {loading ? 'Saving...' : (product ? 'Update Product' : 'Create Product')}
                </button>
            </ModalFooter>

            <style>{`
        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          margin-bottom: 20px;
        }

        @media (max-width: 600px) {
          .form-grid {
            grid-template-columns: 1fr;
          }
        }

        .form-full-width {
          margin-bottom: 20px;
        }

        .btn-primary {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 24px;
          background: var(--accent-gradient);
          border-radius: var(--radius-md);
          color: white;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-secondary {
          padding: 12px 24px;
          background: var(--bg-tertiary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          color: var(--text-secondary);
          font-size: 0.9rem;
        }
      `}</style>
        </form>
    )
}

export default ProductForm
