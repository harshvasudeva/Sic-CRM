import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, DollarSign, Calendar, Building2, MoreHorizontal, Edit, Trash2 } from 'lucide-react'
import { getOpportunities, getPipelines, updateOpportunity, createOpportunity, deleteOpportunity, moveOpportunityStage } from '../../stores/crmStore'
import { formatCurrency, getSettings, CURRENCIES } from '../../stores/settingsStore'
import Modal, { ModalFooter } from '../../components/Modal'
import FormInput, { FormTextarea, FormSelect } from '../../components/FormInput'
import { useToast } from '../../components/Toast'

function Opportunities() {
    const toast = useToast()
    const [opportunities, setOpportunities] = useState([])
    const [pipelines, setPipelines] = useState([])
    const [selectedPipeline, setSelectedPipeline] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingOpp, setEditingOpp] = useState(null)
    const [deleteConfirm, setDeleteConfirm] = useState(null)
    const [draggedOpp, setDraggedOpp] = useState(null)

    const [formData, setFormData] = useState({
        name: '', company: '', value: '', expectedClose: '', probability: 50, notes: '', currency: getSettings().currency || 'INR'
    })

    const loadData = async () => {
        try {
            const pipes = await getPipelines()
            setPipelines(pipes)
            if (!selectedPipeline && pipes.length > 0) setSelectedPipeline(pipes[0])

            const opps = await getOpportunities(selectedPipeline ? { pipeline: selectedPipeline.id } : {})
            setOpportunities(opps)
        } catch (error) {
            console.error('Failed to load opportunities', error)
        }
    }

    useEffect(() => { loadData() }, [selectedPipeline])

    const handleSubmit = async () => {
        if (!formData.name || !formData.value) {
            toast.error('Name and value are required')
            return
        }
        try {
            if (editingOpp) {
                await updateOpportunity(editingOpp.id, { ...formData, value: parseFloat(formData.value) })
                toast.success('Opportunity updated')
            } else {
                await createOpportunity({
                    ...formData,
                    value: parseFloat(formData.value),
                    currency: formData.currency,
                    pipeline: selectedPipeline.id,
                    stage: selectedPipeline.stages[0],
                    probability: parseInt(formData.probability)
                })
                toast.success('Opportunity created')
            }
            setIsModalOpen(false)
            setEditingOpp(null)
            setFormData({ name: '', company: '', value: '', expectedClose: '', probability: 50, notes: '', currency: getSettings().currency || 'INR' })
            loadData()
        } catch (err) {
            toast.error('Operation failed')
        }
    }

    const handleEdit = (opp) => {
        setEditingOpp(opp)
        setFormData({
            name: opp.name, company: opp.company, value: opp.value.toString(),
            expectedClose: opp.expectedClose, probability: opp.probability, notes: opp.notes, currency: opp.currency || 'INR'
        })
        setIsModalOpen(true)
    }

    const confirmDelete = async () => {
        if (deleteConfirm) {
            try {
                await deleteOpportunity(deleteConfirm.id)
                toast.success('Opportunity deleted')
                setDeleteConfirm(null)
                loadData()
            } catch (err) {
                toast.error('Delete failed')
            }
        }
    }

    const handleDragStart = (opp) => setDraggedOpp(opp)
    const handleDragOver = (e) => e.preventDefault()
    const handleDrop = async (stage) => {
        if (draggedOpp && draggedOpp.stage !== stage) {
            try {
                await moveOpportunityStage(draggedOpp.id, stage)
                toast.success(`Moved to ${stage}`)
                loadData()
            } catch (err) {
                toast.error('Move failed')
            }
        }
        setDraggedOpp(null)
    }

    const getStageOpps = (stage) => opportunities.filter(o => o.stage === stage)
    const getStageValue = (stage) => getStageOpps(stage).reduce((sum, o) => sum + o.value, 0)

    const totalValue = opportunities.reduce((sum, o) => sum + o.value, 0)

    return (
        <div className="page opportunities-page">
            <motion.div className="page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <div>
                    <h1 className="page-title"><span className="gradient-text">Opportunities</span></h1>
                    <p className="page-description">Manage your sales pipeline and deals.</p>
                </div>
                <div className="header-actions">
                    <div className="pipeline-total"><DollarSign size={18} /> {formatCurrency(totalValue)} in pipeline</div>
                    <button className="btn-primary" onClick={() => setIsModalOpen(true)}><Plus size={20} /> Add Deal</button>
                </div>
            </motion.div>

            {/* Pipeline Tabs */}
            <div className="pipeline-tabs">
                {pipelines.map(pipe => (
                    <button
                        key={pipe.id}
                        className={`pipeline-tab ${selectedPipeline?.id === pipe.id ? 'active' : ''}`}
                        onClick={() => setSelectedPipeline(pipe)}
                    >
                        {pipe.name}
                    </button>
                ))}
            </div>

            {/* Kanban Board */}
            {selectedPipeline && (
                <div className="kanban-board">
                    {selectedPipeline.stages.map(stage => (
                        <div
                            key={stage}
                            className="kanban-column"
                            onDragOver={handleDragOver}
                            onDrop={() => handleDrop(stage)}
                        >
                            <div className="column-header">
                                <span className="column-title">{stage}</span>
                                <span className="column-count">{getStageOpps(stage).length}</span>
                            </div>
                            <div className="column-value">{formatCurrency(getStageValue(stage))}</div>
                            <div className="column-cards">
                                {getStageOpps(stage).map(opp => (
                                    <motion.div
                                        key={opp.id}
                                        className="opp-card"
                                        draggable
                                        onDragStart={() => handleDragStart(opp)}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                    >
                                        <div className="opp-card-header">
                                            <strong>{opp.name}</strong>
                                            <div className="opp-menu">
                                                <button onClick={() => handleEdit(opp)}><Edit size={14} /></button>
                                                <button onClick={() => setDeleteConfirm(opp)}><Trash2 size={14} /></button>
                                            </div>
                                        </div>
                                        <div className="opp-company"><Building2 size={12} /> {opp.company}</div>
                                        <div className="opp-details">
                                            <span className="opp-value">{formatCurrency(opp.value, opp.currency)}</span>
                                            <span className="opp-prob">{opp.probability}%</span>
                                        </div>
                                        {opp.expectedClose && (
                                            <div className="opp-date"><Calendar size={12} /> {opp.expectedClose}</div>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setEditingOpp(null) }} title={editingOpp ? 'Edit Opportunity' : 'New Opportunity'} size="medium">
                <div className="form-grid">
                    <FormInput label="Deal Name *" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    <FormInput label="Company" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} />
                    <FormInput label="Value *" type="number" icon={DollarSign} value={formData.value} onChange={(e) => setFormData({ ...formData, value: e.target.value })} />
                    <FormSelect label="Currency" options={Object.keys(CURRENCIES).map(c => ({ value: c, label: `${CURRENCIES[c].symbol} ${c}` }))} value={formData.currency} onChange={(e) => setFormData({ ...formData, currency: e.target.value })} />
                    <FormInput label="Probability %" type="number" value={formData.probability} onChange={(e) => setFormData({ ...formData, probability: e.target.value })} />
                    <FormInput label="Expected Close" type="date" value={formData.expectedClose} onChange={(e) => setFormData({ ...formData, expectedClose: e.target.value })} />
                </div>
                <FormTextarea label="Notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={2} />
                <ModalFooter>
                    <button className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                    <button className="btn-primary" onClick={handleSubmit}>{editingOpp ? 'Update' : 'Create'}</button>
                </ModalFooter>
            </Modal>

            {/* Delete Confirm */}
            <Modal isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Opportunity" size="small">
                <p style={{ marginBottom: 24, color: 'var(--text-secondary)' }}>Delete <strong>{deleteConfirm?.name}</strong>?</p>
                <ModalFooter>
                    <button className="btn-secondary" onClick={() => setDeleteConfirm(null)}>Cancel</button>
                    <button className="btn-danger" onClick={confirmDelete}>Delete</button>
                </ModalFooter>
            </Modal>

            <style>{`
        .page-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; }
        .header-actions { display: flex; align-items: center; gap: 10px; }
        .pipeline-total { display: flex; align-items: center; gap: 6px; padding: 8px 12px; background: rgba(16, 185, 129, 0.15); color: var(--success); border-radius: var(--radius-md); font-weight: 600; font-size: 0.85rem; }
        .btn-primary { display: flex; align-items: center; gap: 6px; padding: 8px 16px; background: var(--accent-gradient); border-radius: var(--radius-md); color: white; font-size: 0.85rem; }
        .btn-secondary { padding: 8px 16px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-secondary); font-size: 0.85rem; }
        .btn-danger { padding: 8px 16px; background: var(--error); border-radius: var(--radius-md); color: white; font-size: 0.85rem; }
        
        .pipeline-tabs { display: flex; gap: 6px; margin-bottom: 16px; overflow-x: auto; }
        .pipeline-tab { padding: 8px 14px; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-secondary); transition: all 0.2s; font-size: 0.85rem; white-space: nowrap; }
        .pipeline-tab.active { background: rgba(99, 102, 241, 0.15); border-color: var(--accent-primary); color: var(--accent-primary); }
        
        .kanban-board { display: flex; gap: 12px; overflow-x: auto; padding-bottom: 16px; }
        .kanban-column { min-width: 220px; flex: 1; background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 12px; }
        .column-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
        .column-title { font-weight: 600; font-size: 0.82rem; }
        .column-count { width: 22px; height: 22px; border-radius: 50%; background: rgba(99, 102, 241, 0.15); color: var(--accent-primary); display: flex; align-items: center; justify-content: center; font-size: 0.7rem; font-weight: 600; }
        .column-value { font-size: 0.78rem; color: var(--success); margin-bottom: 12px; font-weight: 500; }
        .column-cards { display: flex; flex-direction: column; gap: 8px; min-height: 60px; }
        
        .opp-card { background: rgba(255, 255, 255, 0.03); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 10px; cursor: grab; transition: all 0.2s; }
        .opp-card:hover { border-color: var(--accent-primary); }
        .opp-card:active { cursor: grabbing; }
        .opp-card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px; }
        .opp-card-header strong { font-size: 0.82rem; }
        .opp-menu { display: flex; gap: 2px; opacity: 0; transition: opacity 0.2s; }
        .opp-card:hover .opp-menu { opacity: 1; }
        .opp-menu button { padding: 3px; color: var(--text-muted); }
        .opp-menu button:hover { color: var(--text-primary); }
        .opp-company { display: flex; align-items: center; gap: 4px; font-size: 0.75rem; color: var(--text-muted); margin-bottom: 8px; }
        .opp-details { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
        .opp-value { font-weight: 600; color: var(--success); font-size: 0.85rem; }
        .opp-prob { padding: 2px 6px; background: rgba(139, 92, 246, 0.15); color: #8b5cf6; border-radius: 8px; font-size: 0.7rem; }
        .opp-date { display: flex; align-items: center; gap: 4px; font-size: 0.7rem; color: var(--text-muted); }
        
        .form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-bottom: 12px; }
      `}</style>
        </div>
    )
}

export default Opportunities
