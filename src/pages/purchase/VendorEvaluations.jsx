import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import DataTable from '../../components/DataTable'
import Modal, { ModalFooter } from '../../components/Modal'
import FormInput, { FormTextarea, FormSelect } from '../../components/FormInput'
import { useToast } from '../../components/Toast'
import { getVendorEvaluations, createVendorEvaluation, updateVendorEvaluation, getVendors } from '../../stores/purchaseStore'

function VendorEvaluations() {
    const toast = useToast()
    const [evaluations, setEvaluations] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editItem, setEditItem] = useState(null)
    const [formData, setFormData] = useState({
        evaluationDate: '', vendorId: '', qualityScore: 0, deliveryScore: 0, priceScore: 0, serviceScore: 0, totalScore: 0, comments: '', evaluator: ''
    })

    useEffect(() => {
        loadData()
    }, [])

    const loadData = () => {
        setEvaluations(getVendorEvaluations())
    }

    const handleAdd = () => {
        setFormData({
            evaluationDate: new Date().toISOString().split('T')[0],
            vendorId: '',
            qualityScore: 0,
            deliveryScore: 0,
            priceScore: 0,
            serviceScore: 0,
            totalScore: 0,
            comments: '',
            evaluator: ''
        })
        setEditItem(null)
        setIsModalOpen(true)
    }

    const handleEdit = (item) => {
        setFormData({ ...item })
        setEditItem(item)
        setIsModalOpen(true)
    }

    const handleSave = () => {
        const totalScore = Math.round((formData.qualityScore + formData.deliveryScore + formData.priceScore + formData.serviceScore) / 4)
        const data = { ...formData, totalScore }
        
        if (editItem) {
            updateVendorEvaluation(editItem.id, data)
            toast.success('Evaluation updated')
        } else {
            createVendorEvaluation(data)
            toast.success('Evaluation created')
        }
        setIsModalOpen(false)
        setEditItem(null)
        loadData()
    }

    const handleDelete = (id) => {
        if (confirm('Are you sure?')) {
            const stored = localStorage.getItem('erp_vendorEvaluations')
            const evaluations = stored ? JSON.parse(stored) : []
            localStorage.setItem('erp_vendorEvaluations', JSON.stringify(evaluations.filter(e => e.id !== id)))
            toast.success('Evaluation deleted')
            loadData()
        }
    }

    const getScoreColor = (score) => {
        if (score >= 80) return 'excellent'
        if (score >= 60) return 'good'
        if (score >= 40) return 'average'
        return 'poor'
    }

    const columns = [
        { key: 'evaluationDate', label: 'Date', render: (v) => <span>{new Date(v).toLocaleDateString()}</span> },
        { key: 'vendorId', label: 'Vendor', render: (v) => {
            const vendor = getVendors().find(v => v.id === v)
            return vendor ? vendor.name : '-'
        }},
        { key: 'qualityScore', label: 'Quality', render: (v) => <span className={`score-badge ${getScoreColor(v)}`}>{v}/10</span> },
        { key: 'deliveryScore', label: 'Delivery', render: (v) => <span className={`score-badge ${getScoreColor(v)}`}>{v}/10</span> },
        { key: 'priceScore', label: 'Price', render: (v) => <span className={`score-badge ${getScoreColor(v)}`}>{v}/10</span> },
        { key: 'serviceScore', label: 'Service', render: (v) => <span className={`score-badge ${getScoreColor(v)}`}>{v}/10</span> },
        { key: 'totalScore', label: 'Overall', render: (v) => <span className={`total-score ${getScoreColor(v)}`}>{v}%</span> },
        { key: 'evaluator', label: 'Evaluator', render: (v) => <span>{v}</span> },
        { key: 'actions', label: 'Actions', render: (_, row) => (
            <div className="action-buttons">
                <button className="btn-edit" onClick={() => handleEdit(row)}>
                    Edit
                </button>
                <button className="btn-delete" onClick={() => handleDelete(row.id)}>
                    Delete
                </button>
            </div>
        )}
    ]

    return (
        <div className="page">
            <motion.div className="page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <div>
                    <h1 className="page-title"><span className="gradient-text">Vendor</span> Evaluations</h1>
                    <p className="page-description">
                        Evaluate vendor performance on quality, delivery, price, and service.
                    </p>
                </div>
                <button className="btn-primary" onClick={handleAdd}>
                    <Plus size={20} /> Create Evaluation
                </button>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <DataTable columns={columns} data={evaluations} searchable exportable />
            </motion.div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editItem ? 'Edit Evaluation' : 'Create Evaluation'} size="large">
                <div className="form-grid">
                    <FormInput label="Evaluation Date *" type="date" value={formData.evaluationDate} onChange={(e) => setFormData({ ...formData, evaluationDate: e.target.value })} />
                    <FormInput label="Evaluator *" placeholder="John Doe" value={formData.evaluator} onChange={(e) => setFormData({ ...formData, evaluator: e.target.value })} />
                </div>
                <FormSelect label="Vendor *" options={getVendors().map(v => ({ value: v.id, label: v.name }))} value={formData.vendorId} onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })} />
                
                <div className="section-header">
                    <h4>Performance Scores (1-10)</h4>
                </div>
                <div className="form-grid">
                    <FormInput label="Quality Score *" type="number" min="1" max="10" value={formData.qualityScore} onChange={(e) => setFormData({ ...formData, qualityScore: parseInt(e.target.value) || 0 })} />
                    <FormInput label="Delivery Score *" type="number" min="1" max="10" value={formData.deliveryScore} onChange={(e) => setFormData({ ...formData, deliveryScore: parseInt(e.target.value) || 0 })} />
                </div>
                <div className="form-grid">
                    <FormInput label="Price Score *" type="number" min="1" max="10" value={formData.priceScore} onChange={(e) => setFormData({ ...formData, priceScore: parseInt(e.target.value) || 0 })} />
                    <FormInput label="Service Score *" type="number" min="1" max="10" value={formData.serviceScore} onChange={(e) => setFormData({ ...formData, serviceScore: parseInt(e.target.value) || 0 })} />
                </div>

                <div className="score-preview">
                    <span>Predicted Overall Score: </span>
                    <span className={`total-score ${getScoreColor(Math.round((formData.qualityScore + formData.deliveryScore + formData.priceScore + formData.serviceScore) / 4))}`}>
                        {Math.round((formData.qualityScore + formData.deliveryScore + formData.priceScore + formData.serviceScore) / 4)}%
                    </span>
                </div>

                <FormTextarea label="Comments" value={formData.comments} onChange={(e) => setFormData({ ...formData, comments: e.target.value })} rows={3} placeholder="Additional feedback or notes..." />
                <ModalFooter>
                    <button className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                    <button className="btn-primary" onClick={handleSave}>{editItem ? 'Update' : 'Create'} Evaluation</button>
                </ModalFooter>
            </Modal>

            <style>{`
                .btn-primary { display: flex; align-items: center; gap: 8px; padding: 12px 20px; background: var(--accent-gradient); border-radius: var(--radius-md); color: white; border: none; cursor: pointer; font-weight: 600; }
                .btn-secondary { padding: 12px 20px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-secondary); cursor: pointer; }
                .score-badge { padding: 4px 10px; border-radius: 12px; font-size: 0.75rem; font-weight: 600; text-transform: capitalize; }
                .score-badge.excellent { background: rgba(34, 197, 94, 0.15); color: #22c55e; }
                .score-badge.good { background: rgba(59, 130, 246, 0.15); color: #3b82f6; }
                .score-badge.average { background: rgba(251, 191, 36, 0.15); color: #fbbf24; }
                .score-badge.poor { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
                .total-score { padding: 4px 10px; border-radius: 12px; font-size: 0.85rem; font-weight: 700; text-transform: capitalize; }
                .total-score.excellent { background: rgba(34, 197, 94, 0.2); color: #22c55e; }
                .total-score.good { background: rgba(59, 130, 246, 0.2); color: #3b82f6; }
                .total-score.average { background: rgba(251, 191, 36, 0.2); color: #fbbf24; }
                .total-score.poor { background: rgba(239, 68, 68, 0.2); color: #ef4444; }
                .section-header { margin: 16px 0 8px 0; }
                .section-header h4 { font-size: 0.9rem; color: var(--text-secondary); font-weight: 600; }
                .score-preview { display: flex; align-items: center; gap: 8px; padding: 12px; background: var(--bg-tertiary); border-radius: 8px; margin: 16px 0; font-size: 0.9rem; color: var(--text-secondary); }
                .action-buttons { display: flex; gap: 8px; }
                .btn-edit { padding: 8px 12px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 8px; color: var(--text-secondary); cursor: pointer; font-size: 0.85rem; }
                .btn-delete { padding: 8px 12px; background: rgba(239, 68, 68, 0.1); border: 1px solid var(--error); border-radius: 8px; color: var(--error); cursor: pointer; font-size: 0.85rem; }
                .btn-delete:hover { background: var(--error); color: white; }
            `}</style>
        </div>
    )
}

export default VendorEvaluations