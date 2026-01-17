import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { PieChart, List, Plus, TrendingUp, BarChart3, ArrowUpCircle, ArrowDownCircle } from 'lucide-react'
import DataTable from '../../components/DataTable'
import Modal, { ModalFooter } from '../../components/Modal'
import FormInput from '../../components/FormInput'
import { useToast } from '../../components/Toast'
import { getCostCenters, createCostCenter, getCostCenterReport } from '../../stores/accountingStore'
import { formatCurrency } from '../../stores/settingsStore'

function CostCenters() {
    const toast = useToast()
    const [centers, setCenters] = useState([])
    const [reports, setReports] = useState({})
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [activeTab, setActiveTab] = useState('list') // list, analysis
    const [formData, setFormData] = useState({ name: '', code: '', budget: 0, status: 'active' })

    useEffect(() => {
        loadData()
    }, [])

    const loadData = () => {
        const data = getCostCenters()
        setCenters(data)

        // Generate reports for all centers
        const newReports = {}
        data.forEach(c => {
            newReports[c.id] = getCostCenterReport(c.id)
        })
        setReports(newReports)
    }

    const handleCreate = () => {
        createCostCenter(formData)
        toast.success('Cost Center Created')
        setIsModalOpen(false)
        loadData()
    }

    const columns = [
        { key: 'name', label: 'Name', render: (v) => <span className="font-bold">{v}</span> },
        { key: 'code', label: 'Code', render: (v) => <span className="font-mono">{v}</span> },
        { key: 'budget', label: 'Budget', render: (v) => <span className="text-muted">{formatCurrency(v)}</span> },
        { key: 'status', label: 'Status', render: (v) => <span className="badge">{v}</span> }
    ]

    return (
        <div className="page">
            <motion.div className="page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <div>
                    <h1 className="page-title"><span className="gradient-text">Cost</span> Centers</h1>
                    <p className="page-description">Track profitability by Project or Department (Job Costing).</p>
                </div>
                <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
                    <Plus size={20} /> New Cost Center
                </button>
            </motion.div>

            <div className="tabs">
                <button className={`tab-btn ${activeTab === 'list' ? 'active' : ''}`} onClick={() => setActiveTab('list')}>
                    <List size={18} /> List View
                </button>
                <button className={`tab-btn ${activeTab === 'analysis' ? 'analysis' : ''}`} onClick={() => setActiveTab('analysis')}>
                    <BarChart3 size={18} /> Profitability Analysis
                </button>
            </div>

            <div className="tab-content">
                {activeTab === 'list' && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <DataTable columns={columns} data={centers} searchable />
                    </motion.div>
                )}

                {activeTab === 'analysis' && (
                    <motion.div className="analysis-grid" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        {centers.map(center => {
                            const report = reports[center.id] || { totalRevenue: 0, totalExpense: 0, netProfit: 0, margin: 0 }
                            return (
                                <div key={center.id} className="analysis-card">
                                    <div className="card-header">
                                        <h3>{center.name}</h3>
                                        <span className="code">{center.code}</span>
                                    </div>
                                    <div className="card-body">
                                        <div className="metric-row">
                                            <span className="label"><ArrowUpCircle size={14} className="text-green" /> Revenue</span>
                                            <span className="value">{formatCurrency(report.totalRevenue)}</span>
                                        </div>
                                        <div className="metric-row">
                                            <span className="label"><ArrowDownCircle size={14} className="text-red" /> Expenses</span>
                                            <span className="value">{formatCurrency(report.totalExpense)}</span>
                                        </div>
                                        <div className="divider"></div>
                                        <div className="metric-row highlight">
                                            <span className="label">Net Profit</span>
                                            <span className={`value ${report.netProfit >= 0 ? 'text-green' : 'text-red'}`}>
                                                {formatCurrency(report.netProfit)}
                                            </span>
                                        </div>
                                        <div className="metric-row sub">
                                            <span className="label">Margin</span>
                                            <span className="value">{report.margin.toFixed(1)}%</span>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </motion.div>
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Cost Center">
                <div className="form-grid">
                    <FormInput label="Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                    <FormInput label="Code" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} />
                </div>
                <div className="form-grid">
                    <FormInput label="Budget" type="number" value={formData.budget} onChange={e => setFormData({ ...formData, budget: parseFloat(e.target.value) })} />
                </div>
                <ModalFooter>
                    <button className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                    <button className="btn-primary" onClick={handleCreate}>Create</button>
                </ModalFooter>
            </Modal>

            <style>{`
                .tabs { display: flex; gap: 20px; border-bottom: 1px solid var(--border-color); margin-bottom: 24px; }
                .tab-btn { display: flex; align-items: center; gap: 8px; padding: 12px 4px; background: none; border: none; border-bottom: 2px solid transparent; color: var(--text-secondary); cursor: pointer; transition: all 0.2s; }
                .tab-btn:hover { color: var(--text-primary); }
                .tab-btn.active { color: var(--accent-primary); border-bottom-color: var(--accent-primary); }
                
                .analysis-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
                .analysis-card { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); overflow: hidden; }
                .card-header { padding: 16px; background: var(--bg-secondary); border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; }
                .card-header h3 { margin: 0; font-size: 1rem; color: var(--text-primary); }
                .code { font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; background: var(--bg-tertiary); padding: 2px 6px; border-radius: 4px; }
                
                .card-body { padding: 16px; }
                .metric-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; font-size: 0.9rem; }
                .metric-row.sub { font-size: 0.8rem; color: var(--text-secondary); }
                .divider { height: 1px; background: var(--border-color); margin: 12px 0; }
                .highlight .value { font-weight: 700; font-size: 1.1rem; }
                
                .text-green { color: var(--success); }
                .text-red { color: var(--error); }
                .text-muted { color: var(--text-secondary); }
                .badge { padding: 4px 8px; background: var(--bg-tertiary); border-radius: 4px; font-size: 0.75rem; }
                .font-mono { font-family: 'JetBrains Mono', monospace; }
                .font-bold { font-weight: 600; }
                
                .btn-primary { display: flex; align-items: center; gap: 8px; padding: 12px 20px; background: var(--accent-gradient); border-radius: var(--radius-md); color: white; border: none; cursor: pointer; font-weight: 600; }
                .btn-secondary { padding: 12px 20px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: var(--radius-md); color: var(--text-secondary); cursor: pointer; }
            `}</style>
        </div>
    )
}

export default CostCenters
