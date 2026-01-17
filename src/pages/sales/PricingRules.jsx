import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Filter, Edit, Trash2, Percent, Tag, Calendar, Check, X } from 'lucide-react'
import { getPricingRules, deletePricingRule, createPricingRule, updatePricingRule, calculateDiscount } from '../../stores/salesStore'
import DataTable from '../../components/DataTable'
import Modal, { ModalFooter } from '../../components/Modal'
import FormInput, { FormTextarea, FormSelect } from '../../components/FormInput'
import { useToast } from '../../components/Toast'
import { formatCurrency } from '../../stores/settingsStore'

const ruleTypes = [
    { value: 'volume', label: 'Volume Discount' },
    { value: 'customer', label: 'Customer Based' },
    { value: 'product', label: 'Product Based' },
    { value: 'time', label: 'Time Based' }
]

const discountTypes = [
    { value: 'percentage', label: 'Percentage' },
    { value: 'fixed', label: 'Fixed Amount' }
]

const statuses = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
]

const segments = [
    { value: 'all', label: 'All Customers' },
    { value: 'enterprise', label: 'Enterprise' },
    { value: 'smb', label: 'SMB' },
    { value: 'startup', label: 'Startup' }
]

function PricingRules() {
    const toast = useToast()
    const [rules, setRules] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingRule, setEditingRule] = useState(null)
    const [deleteConfirm, setDeleteConfirm] = useState(null)
    const [filterStatus, setFilterStatus] = useState('')
    const [testModal, setTestModal] = useState(null)
    const [testResult, setTestResult] = useState(null)

    const [formData, setFormData] = useState({
        name: '', description: '', type: 'volume', discountType: 'percentage', discountValue: 0,
        condition: { minAmount: 0 }, status: 'active', priority: 1,
        customerSegment: 'all', productCategory: 'all', validFrom: '', validUntil: ''
    })

    const [testData, setTestData] = useState({
        customerId: '', amount: 0, productCategory: ''
    })

    const loadData = () => {
        const filters = {}
        if (filterStatus) filters.status = filterStatus
        setRules(getPricingRules().filter(r => !filterStatus || r.status === filterStatus))
    }

    useEffect(() => { loadData() }, [filterStatus])

    const handleSubmit = () => {
        if (!formData.name || formData.discountValue <= 0) {
            toast.error('Name and discount value are required')
            return
        }

        if (editingRule) {
            updatePricingRule(editingRule.id, formData)
            toast.success('Pricing rule updated')
        } else {
            createPricingRule(formData)
            toast.success('Pricing rule created')
        }
        setIsModalOpen(false)
        setEditingRule(null)
        resetFormData()
        loadData()
    }

    const handleEdit = (rule) => {
        setEditingRule(rule)
        setFormData({
            name: rule.name,
            description: rule.description,
            type: rule.type,
            discountType: rule.discountType,
            discountValue: rule.discountValue,
            condition: rule.condition,
            status: rule.status,
            priority: rule.priority,
            customerSegment: rule.customerSegment,
            productCategory: rule.productCategory,
            validFrom: rule.validFrom,
            validUntil: rule.validUntil
        })
        setIsModalOpen(true)
    }

    const handleToggleStatus = (rule) => {
        updatePricingRule(rule.id, { status: rule.status === 'active' ? 'inactive' : 'active' })
        toast.success(`Rule ${rule.status === 'active' ? 'deactivated' : 'activated'}`)
        loadData()
    }

    const confirmDelete = () => {
        if (deleteConfirm) {
            deletePricingRule(deleteConfirm.id)
            toast.success('Pricing rule deleted')
            setDeleteConfirm(null)
            loadData()
        }
    }

    const handleTest = (rule) => {
        setTestModal(rule)
        setTestResult(null)
    }

    const runTest = () => {
        const discount = calculateDiscount(testData.customerId, testData.amount, testData.productCategory)
        setTestResult({
            originalAmount: testData.amount,
            discount: discount,
            finalAmount: testData.amount - discount
        })
    }

    const resetFormData = () => {
        setFormData({
            name: '', description: '', type: 'volume', discountType: 'percentage', discountValue: 0,
            condition: { minAmount: 0 }, status: 'active', priority: 1,
            customerSegment: 'all', productCategory: 'all', validFrom: '', validUntil: ''
        })
    }

    const columns = [
        {
            key: 'name', label: 'Rule Name',
            render: (v, row) => (
                <div className="rule-name-cell">
                    <div className="rule-name">{v}</div>
                    <div className="rule-desc">{row.description}</div>
                </div>
            )
        },
        { key: 'type', label: 'Type', render: (v) => <span className="type-badge">{v}</span> },
        { key: 'discountType', label: 'Discount Type', render: (v) => v },
        {
            key: 'discountValue', label: 'Discount',
            render: (v, row) => (
                <span className="discount-value">
                    {row.discountType === 'percentage' ? `${v}%` : formatCurrency(v)}
                </span>
            )
        },
        { key: 'customerSegment', label: 'Segment', render: (v) => v },
        { key: 'priority', label: 'Priority', render: (v) => <span className="priority-badge">{v}</span> },
        {
            key: 'validUntil', label: 'Valid Until',
            render: (v) => v || 'No expiry'
        },
        {
            key: 'status', label: 'Status',
            render: (v) => (
                <span className={`status-badge ${v}`}>
                    {v === 'active' ? <Check size={14} /> : <X size={14} />}
                    {v}
                </span>
            )
        },
        {
            key: 'actions', label: '', sortable: false,
            render: (_, row) => (
                <div className="action-buttons">
                    <button className="action-btn test" onClick={() => handleTest(row)} title="Test Rule"><Percent size={16} /></button>
                    <button className="action-btn edit" onClick={() => handleEdit(row)}><Edit size={16} /></button>
                    <button className="action-btn toggle" onClick={() => handleToggleStatus(row)} title="Toggle Status">
                        {row.status === 'active' ? <X size={16} /> : <Check size={16} />}
                    </button>
                    <button className="action-btn delete" onClick={() => setDeleteConfirm(row)}><Trash2 size={16} /></button>
                </div>
            )
        }
    ]

    return (
        <div className="page">
            <motion.div className="page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <div>
                    <h1 className="page-title"><span className="gradient-text">Pricing</span> Rules</h1>
                    <p className="page-description">Configure discounts and pricing strategies.</p>
                </div>
                <button className="btn-primary" onClick={() => setIsModalOpen(true)}><Plus size={20} /> New Rule</button>
            </motion.div>

            <div className="filters-bar">
                <div className="filter-group">
                    <Filter size={18} />
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                        <option value="">All Status</option>
                        {statuses.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                </div>
                <div className="filter-stats">{rules.length} rules</div>
            </div>

            <DataTable columns={columns} data={rules} searchable exportable />

            {/* Add/Edit Modal */}
            <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingRule(null); resetFormData() }} title={editingRule ? 'Edit Pricing Rule' : 'New Pricing Rule'} size="large">
                <div className="form-grid">
                    <FormInput label="Rule Name *" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    <FormSelect label="Rule Type *" options={ruleTypes} value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} />
                </div>

                <FormTextarea label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={2} />

                <div className="form-grid">
                    <FormSelect label="Discount Type" options={discountTypes} value={formData.discountType} onChange={(e) => setFormData({ ...formData, discountType: e.target.value })} />
                    <FormInput label="Discount Value *" type="number" value={formData.discountValue} onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) || 0 })} />
                </div>

                {formData.type === 'volume' && (
                    <div className="form-grid">
                        <FormInput label="Minimum Order Amount" type="number" value={formData.condition.minAmount} onChange={(e) => setFormData({ ...formData, condition: { ...formData.condition, minAmount: parseFloat(e.target.value) || 0 } })} />
                    </div>
                )}

                <div className="form-grid">
                    <FormSelect label="Customer Segment" options={segments} value={formData.customerSegment} onChange={(e) => setFormData({ ...formData, customerSegment: e.target.value })} />
                    <FormInput label="Priority" type="number" value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 1 })} />
                </div>

                <div className="form-grid">
                    <FormInput label="Valid From" type="date" value={formData.validFrom} onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })} />
                    <FormInput label="Valid Until" type="date" value={formData.validUntil} onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })} />
                </div>

                <div className="form-grid">
                    <FormSelect label="Status" options={statuses} value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} />
                </div>

                <ModalFooter>
                    <button className="btn-secondary" onClick={() => { setIsModalOpen(false); setEditingRule(null); resetFormData() }}>Cancel</button>
                    <button className="btn-primary" onClick={handleSubmit}>{editingRule ? 'Update' : 'Create'}</button>
                </ModalFooter>
            </Modal>

            {/* Test Rule Modal */}
            <Modal isOpen={!!testModal} onClose={() => setTestModal(null)} title={`Test: ${testModal?.name}`} size="medium">
                <div className="form-grid">
                    <FormInput label="Customer ID" value={testData.customerId} onChange={(e) => setTestData({ ...testData, customerId: e.target.value })} />
                    <FormInput label="Order Amount *" type="number" value={testData.amount} onChange={(e) => setTestData({ ...testData, amount: parseFloat(e.target.value) || 0 })} />
                </div>
                <FormInput label="Product Category" value={testData.productCategory} onChange={(e) => setTestData({ ...testData, productCategory: e.target.value })} />

                <button className="btn-secondary test-btn" onClick={runTest}>Run Test</button>

                {testResult && (
                    <div className="test-result">
                        <div className="result-row">
                            <span>Original Amount</span>
                            <span>{formatCurrency(testResult.originalAmount)}</span>
                        </div>
                        <div className="result-row discount">
                            <span>Discount Applied</span>
                            <span>-{formatCurrency(testResult.discount)}</span>
                        </div>
                        <div className="result-row total">
                            <span>Final Amount</span>
                            <span>{formatCurrency(testResult.finalAmount)}</span>
                        </div>
                    </div>
                )}

                <ModalFooter>
                    <button className="btn-secondary" onClick={() => setTestModal(null)}>Close</button>
                </ModalFooter>
            </Modal>

            {/* Delete Confirm Modal */}
            <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Pricing Rule" size="small">
                <p style={{ marginBottom: 24, color: 'var(--text-secondary)' }}>Delete <strong>{deleteConfirm?.name}</strong>?</p>
                <ModalFooter>
                    <button className="btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                    <button className="btn-danger" onClick={confirmDelete}>Delete</button>
                </ModalFooter>
            </Modal>

            <style>{`
                .btn-primary { display: flex; align-items: center; gap: 8px; padding: 12px 20px; background: var(--accent-gradient); border-radius: var(--radius-md); color: white; }
                .btn-secondary { padding: 12px 20px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-secondary); }
                .btn-danger { padding: 12px 20px; background: var(--error); border-radius: var(--radius-md); color: white; }
                .test-btn { width: 100%; margin-bottom: 16px; }
                .filters-bar { display: flex; gap: 16px; margin-bottom: 24px; }
                .filter-group { display: flex; align-items: center; gap: 8px; padding: 8px 14px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); }
                .filter-group svg { color: var(--text-muted); }
                .filter-group select { background: transparent; border: none; color: var(--text-primary); }
                .filter-stats { margin-left: auto; color: var(--text-muted); }
                .form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
                .rule-name-cell { display: flex; flex-direction: column; }
                .rule-name { font-weight: 500; color: var(--text-primary); }
                .rule-desc { font-size: 0.75rem; color: var(--text-muted); }
                .type-badge { padding: 4px 10px; background: rgba(139, 92, 246, 0.15); color: #8b5cf6; border-radius: 12px; font-size: 0.75rem; text-transform: capitalize; }
                .discount-value { font-weight: 600; color: var(--success); }
                .priority-badge { padding: 2px 8px; background: rgba(245, 158, 11, 0.15); color: var(--warning); border-radius: 8px; font-size: 0.75rem; font-weight: 600; }
                .status-badge { display: inline-flex; align-items: center; gap: 4px; padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; text-transform: capitalize; }
                .status-badge.active { background: rgba(16, 185, 129, 0.15); color: var(--success); }
                .status-badge.inactive { background: rgba(107, 114, 128, 0.15); color: var(--text-muted); }
                .action-buttons { display: flex; gap: 8px; }
                .action-btn { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
                .action-btn.test { background: rgba(59, 130, 246, 0.1); color: var(--info); }
                .action-btn.edit { background: rgba(59, 130, 246, 0.1); color: var(--info); }
                .action-btn.toggle { background: rgba(245, 158, 11, 0.1); color: var(--warning); }
                .action-btn.delete { background: rgba(239, 68, 68, 0.1); color: var(--error); }
                .test-result { padding: 16px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); margin-top: 16px; }
                .result-row { display: flex; justify-content: space-between; padding: 8px 0; color: var(--text-secondary); }
                .result-row.discount { color: var(--success); }
                .result-row.total { border-top: 1px solid var(--border-color); margin-top: 8px; padding-top: 12px; font-weight: 600; color: var(--text-primary); font-size: 1.1rem; }
            `}</style>
        </div>
    )
}

export default PricingRules
