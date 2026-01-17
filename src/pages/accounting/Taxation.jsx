import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Landmark, FileText, Settings, Download } from 'lucide-react'
import DataTable from '../../components/DataTable'
import FormInput from '../../components/FormInput'
import { getTaxRates, getGSTR1Report, getGSTR3BReport } from '../../stores/accountingStore'
import { formatCurrency } from '../../stores/settingsStore'

function Taxation() {
    const [activeTab, setActiveTab] = useState('reports')
    const [taxRates, setTaxRates] = useState([])
    const [gstr1, setGstr1] = useState(null)
    const [gstr3b, setGstr3b] = useState(null)

    // Month Filter (Default to Current)
    const [filterDate, setFilterDate] = useState(new Date().toISOString().slice(0, 7)) // YYYY-MM

    useEffect(() => {
        loadData()
    }, [filterDate])

    const loadData = () => {
        setTaxRates(getTaxRates())

        const [year, month] = filterDate.split('-')

        // GSTR-1 (Sales)
        setGstr1(getGSTR1Report(Number(month), Number(year)))

        // GSTR-3B (Summary)
        setGstr3b(getGSTR3BReport(Number(month), Number(year)))
    }

    const gstr1Columns = [
        { key: 'invoiceNumber', label: 'Invoice #', render: (v) => <span className="font-mono">{v}</span> },
        { key: 'date', label: 'Date', render: (v) => <span>{v}</span> },
        { key: 'taxableValue', label: 'Taxable Value', render: (v) => formatCurrency(v) },
        { key: 'taxRate', label: 'Rate', render: (v) => <span>{v}%</span> },
        { key: 'taxAmount', label: 'Tax Amount', render: (v) => <span className="text-red">{formatCurrency(v)}</span> },
        { key: 'totalAmount', label: 'Total Amount', render: (v) => <span className="font-bold">{formatCurrency(v)}</span> },
    ]

    const taxRateColumns = [
        { key: 'name', label: 'Tax Name', render: (v) => <span className="font-bold">{v}</span> },
        { key: 'code', label: 'Code', render: (v) => <span className="font-mono">{v}</span> },
        { key: 'rate', label: 'Rate (%)', render: (v) => <span>{v}%</span> },
        { key: 'type', label: 'Type', render: (v) => <span className="badge">{v}</span> }
    ]

    return (
        <div className="page">
            <motion.div className="page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <div>
                    <h1 className="page-title"><span className="gradient-text">Taxation</span> (GST)</h1>
                    <p className="page-description">Manage tax rates, Filing, and GSTR Reports.</p>
                </div>
                <div className="header-actions">
                    <FormInput type="month" value={filterDate} onChange={e => setFilterDate(e.target.value)} />
                </div>
            </motion.div>

            <div className="tabs">
                <button className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>
                    <FileText size={18} /> GSTR Reports
                </button>
                <button className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
                    <Settings size={18} /> Tax Settings
                </button>
            </div>

            <div className="tab-content">
                {activeTab === 'reports' && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        {gstr3b && (
                            <div className="stats-grid" style={{ marginBottom: '32px' }}>
                                <div className="stat-card">
                                    <div className="stat-label">Total Outward Supplies</div>
                                    <div className="stat-value">{formatCurrency(gstr3b.outwardSupplies)}</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-label">Tax Liability</div>
                                    <div className="stat-value text-red">{formatCurrency(gstr3b.taxLiability)}</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-label">Input Tax Credit (ITC)</div>
                                    <div className="stat-value text-green">{formatCurrency(gstr3b.inputTaxCredit)}</div>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-label">Net Tax Payable</div>
                                    <div className="stat-value font-bold">{formatCurrency(gstr3b.netTaxPayable)}</div>
                                </div>
                            </div>
                        )}

                        <h3 className="section-title">GSTR-1: Outward Supplies (Sales)</h3>
                        <DataTable columns={gstr1Columns} data={gstr1?.transactions || []} />
                    </motion.div>
                )}

                {activeTab === 'settings' && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="info-box">
                            <Landmark size={20} />
                            <p>Tax Rates are configured in System Settings. These are available for Invoices and Bills.</p>
                        </div>
                        <DataTable columns={taxRateColumns} data={taxRates} />
                    </motion.div>
                )}
            </div>

            <style>{`
                .header-actions { display: flex; gap: 10px; align-items: center; }
                .tabs { display: flex; gap: 20px; border-bottom: 1px solid var(--border-color); margin-bottom: 24px; }
                .tab-btn { display: flex; align-items: center; gap: 8px; padding: 12px 4px; background: none; border: none; border-bottom: 2px solid transparent; color: var(--text-secondary); cursor: pointer; transition: all 0.2s; }
                .tab-btn:hover { color: var(--text-primary); }
                .tab-btn.active { color: var(--accent-primary); border-bottom-color: var(--accent-primary); }
                
                .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
                .stat-card { background: var(--bg-card); padding: 20px; border-radius: var(--radius-md); border: 1px solid var(--border-color); }
                .stat-label { font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 8px; }
                .stat-value { font-size: 1.5rem; font-weight: 600; color: var(--text-primary); }
                
                .text-red { color: var(--error); }
                .text-green { color: var(--success); }
                .font-mono { font-family: 'JetBrains Mono', monospace; }
                .font-bold { font-weight: 700; }
                .badge { padding: 4px 8px; background: var(--bg-tertiary); border-radius: 4px; font-size: 0.75rem; text-transform: uppercase; }
                
                .section-title { font-size: 1.1rem; font-weight: 600; margin-bottom: 16px; color: var(--text-primary); }
                .info-box { display: flex; align-items: center; gap: 12px; padding: 16px; background: rgba(59, 130, 246, 0.1); border: 1px solid #3b82f6; border-radius: 8px; margin-bottom: 24px; color: #3b82f6; }
            `}</style>
        </div>
    )
}

export default Taxation
