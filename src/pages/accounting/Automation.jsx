import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Zap, Repeat, Search, Settings, CheckCircle, AlertTriangle, ShieldCheck } from 'lucide-react'
import DataTable from '../../components/DataTable'
import Modal, { ModalFooter } from '../../components/Modal'
import FormInput, { FormSelect } from '../../components/FormInput'
import { getRecurringTemplates, createRecurringTemplate, getAnomalies, processRecurringDue } from '../../stores/accountingStore'
import { getSettings } from '../../stores/settingsStore'

function Automation() {
    const [activeTab, setActiveTab] = useState('insights')
    const [templates, setTemplates] = useState([])
    const [anomalies, setAnomalies] = useState([])
    const [isProcessing, setIsProcessing] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [aiConfig, setAiConfig] = useState(getSettings().aiConfig || {})

    // Recurring Form State
    const [formData, setFormData] = useState({
        name: '',
        frequency: 'monthly',
        startDate: '',
        amount: 0,
        description: ''
    })

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setTemplates(getRecurringTemplates())
        setIsProcessing(true)
        const detected = await getAnomalies()
        setAnomalies(detected)
        setIsProcessing(false)
    }

    const handleCreateTemplate = () => {
        createRecurringTemplate({
            ...formData,
            entryData: {
                description: formData.description,
                totalDebit: formData.amount,
                totalCredit: formData.amount,
                lines: [] // Simplified for UI: In real app, need account selector
            }
        })
        setIsModalOpen(false)
        loadData()
    }

    const handleRunRecurring = () => {
        const count = processRecurringDue()
        if (count > 0) alert(`Processed ${count} recurring entries`)
        else alert('No entries due today')
        loadData()
    }

    const anomalyColumns = [
        { key: 'severity', label: 'Severity', render: (v) => <span className={`badge ${v}`}>{v}</span> },
        { key: 'reason', label: 'Issue', render: (v) => <span>{v}</span> },
        { key: 'id', label: 'Transaction ID', render: (v) => <span className="font-mono">{v}</span> },
        { key: 'source', label: 'Source', render: (v) => <span className="text-muted">{v || 'Rule Engine'}</span> }
    ]

    const templateColumns = [
        { key: 'name', label: 'Name', render: (v) => <span className="font-bold">{v}</span> },
        { key: 'frequency', label: 'Frequency', render: (v) => <span className="capitalize">{v}</span> },
        { key: 'nextRun', label: 'Next Run', render: (v) => <span className="font-mono">{v}</span> },
        { key: 'status', label: 'Status', render: (v) => <span className="badge active">{v}</span> }
    ]

    return (
        <div className="page">
            <motion.div className="page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <div>
                    <h1 className="page-title"><span className="gradient-text">Automation</span> & AI</h1>
                    <p className="page-description">Automate tasks and detect anomalies using AI or Rules.</p>
                </div>
                <div className="header-actions">
                    <button className="btn-secondary" onClick={handleRunRecurring}>
                        <Repeat size={16} /> Run Recurring
                    </button>
                    <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
                        <Zap size={16} /> New Automation
                    </button>
                </div>
            </motion.div>

            <div className="tabs">
                <button className={`tab-btn ${activeTab === 'insights' ? 'active' : ''}`} onClick={() => setActiveTab('insights')}>
                    <Search size={18} /> AI Insights
                </button>
                <button className={`tab-btn ${activeTab === 'recurring' ? 'active' : ''}`} onClick={() => setActiveTab('recurring')}>
                    <Repeat size={18} /> Recurring Tasks
                </button>
                <button className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
                    <Settings size={18} /> Settings
                </button>
            </div>

            <div className="tab-content">
                {activeTab === 'insights' && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="info-box">
                            <ShieldCheck size={20} />
                            <div>
                                <strong>Hybrid Detection Active</strong>
                                <p>Using {aiConfig.provider === 'ollama' ? 'Ollama (Local AI)' : 'Rule Engine'} for privacy-aware scanning.</p>
                            </div>
                        </div>

                        {isProcessing ? (
                            <div className="loading">Analyzing transactions...</div>
                        ) : (
                            <DataTable columns={anomalyColumns} data={anomalies} />
                        )}
                    </motion.div>
                )}

                {activeTab === 'recurring' && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <DataTable columns={templateColumns} data={templates} />
                    </motion.div>
                )}

                {activeTab === 'settings' && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="card">
                            <h3>AI Configuration</h3>
                            <div className="form-grid">
                                <FormSelect label="Provider" value={aiConfig.provider} options={[{ value: 'ollama', label: 'Ollama (Local)' }, { value: 'openai', label: 'OpenAI (Cloud)' }]} readOnly />
                                <FormInput label="Endpoint" value={aiConfig.endpoint} readOnly />
                                <FormInput label="Model" value={aiConfig.model} readOnly />
                                <FormInput label="API Key" type="password" placeholder="••••••••" disabled />
                            </div>
                            <p className="text-muted" style={{ marginTop: '10px', fontSize: '0.8rem' }}>
                                Note: This is a demo configuration. In a production environment, API keys would be stored in the backend vault.
                            </p>
                        </div>
                    </motion.div>
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Recurring Journal">
                <FormInput label="Template Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                <div className="form-grid">
                    <FormSelect label="Frequency" value={formData.frequency} onChange={e => setFormData({ ...formData, frequency: e.target.value })} options={[{ value: 'monthly', label: 'Monthly' }, { value: 'weekly', label: 'Weekly' }]} />
                    <FormInput label="Start Date" type="date" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} />
                </div>
                <FormInput label="Amount" type="number" value={formData.amount} onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) })} />
                <FormInput label="Description" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                <ModalFooter onCancel={() => setIsModalOpen(false)} onConfirm={handleCreateTemplate} confirmText="Create Template" />
            </Modal>

            <style>{`
                .header-actions { display: flex; gap: 10px; align-items: center; }
                .tabs { display: flex; gap: 20px; border-bottom: 1px solid var(--border-color); margin-bottom: 24px; }
                .tab-btn { display: flex; align-items: center; gap: 8px; padding: 12px 4px; background: none; border: none; border-bottom: 2px solid transparent; color: var(--text-secondary); cursor: pointer; transition: all 0.2s; }
                .tab-btn:hover { color: var(--text-primary); }
                .tab-btn.active { color: var(--accent-primary); border-bottom-color: var(--accent-primary); }
                
                .info-box { display: flex; align-items: flex-start; gap: 12px; padding: 16px; background: rgba(16, 185, 129, 0.1); border: 1px solid #10b981; border-radius: 8px; margin-bottom: 24px; color: #065f46; }
                .card { background: var(--bg-card); padding: 24px; border-radius: var(--radius-md); border: 1px solid var(--border-color); }
                
                .badge.high { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
                .badge.medium { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }
                .badge.low { background: rgba(59, 130, 246, 0.15); color: #3b82f6; }
                .active { background: rgba(16, 185, 129, 0.15); color: #10b981; }
                
                .font-mono { font-family: 'JetBrains Mono', monospace; }
                .text-muted { color: var(--text-secondary); }
                .capitalize { text-transform: capitalize; }
            `}</style>
        </div>
    )
}

export default Automation
