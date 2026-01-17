import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileText, Calendar, Filter, Download, DollarSign, TrendingUp, Activity } from 'lucide-react'
import DataTable from '../../components/DataTable'
import FormInput, { FormSelect } from '../../components/FormInput'
import { getBalanceSheet, getProfitAndLoss, getCashFlowStatement } from '../../stores/accountingStore'
import { formatCurrency } from '../../stores/settingsStore'

function FinancialReports() {
    const [activeTab, setActiveTab] = useState('bs') // bs, pl, cf
    const [reportData, setReportData] = useState(null)
    const [filters, setFilters] = useState({
        asOf: new Date().toISOString().split('T')[0],
        startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    })

    useEffect(() => {
        loadReport()
    }, [activeTab, filters])

    const loadReport = () => {
        if (activeTab === 'bs') {
            setReportData(getBalanceSheet(filters.asOf))
        } else if (activeTab === 'pl') {
            setReportData(getProfitAndLoss(filters.startDate, filters.endDate))
        } else if (activeTab === 'cf') {
            setReportData(getCashFlowStatement(filters.startDate, filters.endDate))
        }
    }

    const renderBalanceSheet = () => {
        if (!reportData) return null
        return (
            <div className="report-container">
                <div className="report-header">
                    <h2>Balance Sheet</h2>
                    <p>As of {filters.asOf}</p>
                </div>

                <div className="summary-grid">
                    <div className="summary-card">
                        <span>Total Assets</span>
                        <h3 className="text-green">{formatCurrency(reportData.totalAssets)}</h3>
                    </div>
                    <div className="summary-card">
                        <span>Total Liabilities</span>
                        <h3 className="text-red">{formatCurrency(reportData.totalLiabilities)}</h3>
                    </div>
                    <div className="summary-card">
                        <span>Equity</span>
                        <h3 className="text-blue">{formatCurrency(reportData.totalEquity)}</h3>
                    </div>
                </div>

                <div className="equation-check">
                    <div className={`status ${reportData.totalAssets === (reportData.totalLiabilities + reportData.totalEquity) ? 'success' : 'error'}`}>
                        Accounting Equation: Assets = Liabilities + Equity
                    </div>
                </div>
            </div>
        )
    }

    const renderPL = () => {
        if (!reportData) return null
        return (
            <div className="report-container">
                <div className="report-header">
                    <h2>Profit & Loss</h2>
                    <p>{filters.startDate} to {filters.endDate}</p>
                </div>

                <div className="pl-lines">
                    <div className="pl-line total">
                        <span>Total Revenue</span>
                        <span>{formatCurrency(reportData.revenue)}</span>
                    </div>
                    <div className="pl-line sub">
                        <span>Cost of Goods Sold (COGS)</span>
                        <span>({formatCurrency(reportData.cogs)})</span>
                    </div>
                    <div className="pl-line result">
                        <span>Gross Profit</span>
                        <span>{formatCurrency(reportData.grossProfit)}</span>
                    </div>

                    <div className="pl-section-divider"></div>

                    <div className="pl-line sub">
                        <span>Operating Expenses</span>
                        <span>({formatCurrency(reportData.expenses)})</span>
                    </div>

                    <div className="pl-line total final">
                        <span>Net Profit</span>
                        <span className={reportData.netProfit >= 0 ? 'text-green' : 'text-red'}>
                            {formatCurrency(reportData.netProfit)}
                        </span>
                    </div>
                </div>
            </div>
        )
    }

    const renderCashFlow = () => {
        if (!reportData) return null
        return (
            <div className="report-container">
                <div className="report-header">
                    <h2>Cash Flow Statement</h2>
                    <p>{filters.startDate} to {filters.endDate}</p>
                </div>

                <div className="pl-lines">
                    <div className="pl-line">
                        <span>Operating Activities</span>
                        <span className={reportData.operatingActivities >= 0 ? 'text-green' : 'text-red'}>
                            {formatCurrency(reportData.operatingActivities)}
                        </span>
                    </div>
                    <div className="pl-line">
                        <span>Investing Activities</span>
                        <span className={reportData.investingActivities >= 0 ? 'text-green' : 'text-red'}>
                            {formatCurrency(reportData.investingActivities)}
                        </span>
                    </div>
                    <div className="pl-line">
                        <span>Financing Activities</span>
                        <span className={reportData.financingActivities >= 0 ? 'text-green' : 'text-red'}>
                            {formatCurrency(reportData.financingActivities)}
                        </span>
                    </div>

                    <div className="pl-line total final">
                        <span>Net Cash Flow</span>
                        <span className={reportData.netCashFlow >= 0 ? 'text-green' : 'text-red'}>
                            {formatCurrency(reportData.netCashFlow)}
                        </span>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="page">
            <motion.div className="page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <div>
                    <h1 className="page-title"><span className="gradient-text">Financial</span> Reports</h1>
                    <p className="page-description">Balance Sheet, Profit & Loss, and Cash Flow statements.</p>
                </div>
                <div className="filters">
                    {activeTab === 'bs' ? (
                        <FormInput type="date" value={filters.asOf} onChange={e => setFilters({ ...filters, asOf: e.target.value })} label="As Of" />
                    ) : (
                        <>
                            <FormInput type="date" value={filters.startDate} onChange={e => setFilters({ ...filters, startDate: e.target.value })} label="From" />
                            <FormInput type="date" value={filters.endDate} onChange={e => setFilters({ ...filters, endDate: e.target.value })} label="To" />
                        </>
                    )}
                </div>
            </motion.div>

            <div className="tabs">
                <button className={`tab-btn ${activeTab === 'bs' ? 'active' : ''}`} onClick={() => setActiveTab('bs')}>
                    <FileText size={18} /> Balance Sheet
                </button>
                <button className={`tab-btn ${activeTab === 'pl' ? 'active' : ''}`} onClick={() => setActiveTab('pl')}>
                    <TrendingUp size={18} /> Profit & Loss
                </button>
                <button className={`tab-btn ${activeTab === 'cf' ? 'active' : ''}`} onClick={() => setActiveTab('cf')}>
                    <Activity size={18} /> Cash Flow
                </button>
            </div>

            <motion.div className="report-content" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                {activeTab === 'bs' && renderBalanceSheet()}
                {activeTab === 'pl' && renderPL()}
                {activeTab === 'cf' && renderCashFlow()}
            </motion.div>

            <style>{`
                .filters { display: flex; gap: 16px; align-items: flex-end; }
                .tabs { display: flex; gap: 20px; border-bottom: 1px solid var(--border-color); margin-bottom: 24px; }
                .tab-btn { display: flex; align-items: center; gap: 8px; padding: 12px 4px; background: none; border: none; border-bottom: 2px solid transparent; color: var(--text-secondary); cursor: pointer; transition: all 0.2s; }
                .tab-btn:hover { color: var(--text-primary); }
                .tab-btn.active { color: var(--accent-primary); border-bottom-color: var(--accent-primary); }
                
                .report-container { background: var(--bg-card); padding: 32px; border-radius: var(--radius-md); border: 1px solid var(--border-color); max-width: 800px; margin: 0 auto; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
                .report-header { text-align: center; margin-bottom: 32px; border-bottom: 2px solid var(--border-color); padding-bottom: 16px; }
                .report-header h2 { font-size: 1.8rem; margin-bottom: 8px; color: var(--text-primary); }
                .report-header p { color: var(--text-secondary); }
                
                .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-bottom: 32px; text-align: center; }
                .summary-card { padding: 16px; background: var(--bg-secondary); border-radius: 8px; }
                .summary-card span { font-size: 0.9rem; color: var(--text-secondary); display: block; margin-bottom: 8px; }
                .summary-card h3 { font-size: 1.4rem; font-weight: 700; margin: 0; }
                
                .equation-check { text-align: center; margin-top: 24px; font-family: monospace; }
                .equation-check .status.success { color: var(--success); }
                .equation-check .status.error { color: var(--error); font-weight: bold; }
                
                .pl-lines { display: flex; flex-direction: column; gap: 12px; }
                .pl-line { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed var(--border-color); }
                .pl-line.total { font-weight: 700; font-size: 1.1rem; border-bottom: 2px solid var(--border-color); }
                .pl-line.final { font-size: 1.3rem; border-top: 2px solid var(--border-color); border-bottom: 4px double var(--border-color); margin-top: 16px; padding: 16px 0; }
                .pl-line.sub { color: var(--text-secondary); padding-left: 20px; }
                
                .text-green { color: var(--success); }
                .text-red { color: var(--error); }
                .text-blue { color: #3b82f6; }
            `}</style>
        </div>
    )
}

export default FinancialReports
