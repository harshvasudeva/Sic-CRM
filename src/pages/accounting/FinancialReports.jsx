import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Download, Printer, FileText, Calendar, TrendingUp } from 'lucide-react'
import { getProfitAndLoss, getBalanceSheet, getTrialBalance } from '../../stores/accountingStore'

function FinancialReports() {
    const [reportType, setReportType] = useState('pnl')
    const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0])
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])
    const [reportData, setReportData] = useState(null)

    const generateReport = () => {
        switch (reportType) {
            case 'pnl':
                setReportData(getProfitAndLoss(startDate, endDate))
                break
            case 'balance':
                setReportData(getBalanceSheet(endDate))
                break
            case 'trial':
                setReportData({ items: getTrialBalance(endDate) })
                break
            default:
                setReportData(null)
        }
    }

    useEffect(() => {
        generateReport()
    }, [reportType, startDate, endDate])

    const downloadReport = () => {
        const content = JSON.stringify(reportData, null, 2)
        const blob = new Blob([content], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${reportType}-report-${endDate}.json`
        a.click()
    }

    const printReport = () => {
        window.print()
    }

    return (
        <div className="page">
            <motion.div className="page-header" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <div>
                    <h1 className="page-title"><span className="gradient-text">Financial</span> Reports</h1>
                    <p className="page-description">
                        Generate and export balance sheet, profit & loss, and cash flow statements.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button onClick={downloadReport} className="btn-secondary">
                        <Download size={18} /> Export
                    </button>
                    <button onClick={printReport} className="btn-secondary">
                        <Printer size={18} /> Print
                    </button>
                </div>
            </motion.div>

            <div className="card">
                <div className="form-grid mb-6">
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-300">Report Type</label>
                        <select
                            value={reportType}
                            onChange={(e) => setReportType(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                        >
                            <option value="pnl">Profit & Loss Statement</option>
                            <option value="balance">Balance Sheet</option>
                            <option value="trial">Trial Balance</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-300">Start Date</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2 text-gray-300">End Date</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                        />
                    </div>
                </div>

                {reportData && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="report-container"
                    >
                        <div className="report-header">
                            <h2 className="report-title">
                                {reportType === 'pnl' && 'Profit & Loss Statement'}
                                {reportType === 'balance' && 'Balance Sheet'}
                                {reportType === 'trial' && 'Trial Balance'}
                            </h2>
                            <p className="report-date">
                                <Calendar size={16} className="inline mr-2" />
                                {startDate} to {endDate}
                            </p>
                        </div>

                        {reportType === 'pnl' && (
                            <div className="report-section">
                                <div className="report-row report-row-header">
                                    <span>Item</span>
                                    <span className="text-right">Amount</span>
                                </div>
                                <div className="report-row">
                                    <span>Revenue</span>
                                    <span className="text-right font-semibold text-green-400">
                                        ${reportData.revenue?.toFixed(2) || '0.00'}
                                    </span>
                                </div>
                                <div className="report-row">
                                    <span>Cost of Goods Sold</span>
                                    <span className="text-right text-red-400">
                                        -${reportData.cogs?.toFixed(2) || '0.00'}
                                    </span>
                                </div>
                                <div className="report-row bg-blue-600/10">
                                    <span className="font-semibold">Gross Profit</span>
                                    <span className="text-right font-bold text-green-400">
                                        ${reportData.grossProfit?.toFixed(2) || '0.00'}
                                    </span>
                                </div>
                                <div className="report-row">
                                    <span>Operating Expenses</span>
                                    <span className="text-right text-red-400">
                                        -${reportData.expenses?.toFixed(2) || '0.00'}
                                    </span>
                                </div>
                                <div className="report-row report-row-total">
                                    <span className="font-bold">Net Profit</span>
                                    <span className={`text-right font-bold ${reportData.netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        ${reportData.netProfit?.toFixed(2) || '0.00'}
                                    </span>
                                </div>
                            </div>
                        )}

                        {reportType === 'balance' && (
                            <div className="report-section">
                                <div className="report-row report-row-header">
                                    <span>Account</span>
                                    <span className="text-right">Balance</span>
                                </div>
                                <div className="report-row bg-blue-600/10">
                                    <span className="font-bold">Total Assets</span>
                                    <span className="text-right font-bold text-blue-400">
                                        ${reportData.totalAssets?.toFixed(2) || '0.00'}
                                    </span>
                                </div>
                                <div className="report-row bg-red-600/10">
                                    <span className="font-bold">Total Liabilities</span>
                                    <span className="text-right font-bold text-red-400">
                                        ${reportData.totalLiabilities?.toFixed(2) || '0.00'}
                                    </span>
                                </div>
                                <div className="report-row bg-purple-600/10">
                                    <span className="font-bold">Total Equity</span>
                                    <span className="text-right font-bold text-purple-400">
                                        ${reportData.totalEquity?.toFixed(2) || '0.00'}
                                    </span>
                                </div>
                            </div>
                        )}

                        {reportType === 'trial' && reportData.items && (
                            <div className="report-section">
                                <div className="report-row report-row-header">
                                    <span>Account</span>
                                    <span className="text-right">Debit</span>
                                    <span className="text-right">Credit</span>
                                    <span className="text-right">Balance</span>
                                </div>
                                {reportData.items.map((item, index) => (
                                    <div key={index} className="report-row">
                                        <span>{item.accountName}</span>
                                        <span className="text-right">${item.debit?.toFixed(2) || '0.00'}</span>
                                        <span className="text-right">${item.credit?.toFixed(2) || '0.00'}</span>
                                        <span className={`text-right font-semibold ${item.balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            ${Math.abs(item.balance).toFixed(2)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}
            </div>

            <style>{`
                .report-container {
                    background: var(--bg-card);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-lg);
                    padding: 32px;
                }
                .report-header {
                    text-align: center;
                    margin-bottom: 32px;
                    padding-bottom: 24px;
                    border-bottom: 2px solid var(--border-color);
                }
                .report-title {
                    font-size: 1.75rem;
                    font-weight: 700;
                    margin-bottom: 8px;
                }
                .report-date {
                    color: var(--text-muted);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 4px;
                }
                .report-section {
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-md);
                    overflow: hidden;
                }
                .report-row {
                    display: grid;
                    grid-template-columns: 2fr 1fr;
                    gap: 16px;
                    padding: 12px 16px;
                    border-bottom: 1px solid var(--border-color);
                }
                .report-row.report-row-header {
                    background: var(--bg-secondary);
                    font-weight: 600;
                    color: var(--text-muted);
                }
                .report-row.report-row-total {
                    background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.1));
                    font-size: 1.1rem;
                }
                .report-row:last-child {
                    border-bottom: none;
                }
                .text-right {
                    text-align: right;
                }
            `}</style>
        </div>
    )
}

export default FinancialReports
