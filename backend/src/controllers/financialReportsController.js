/**
 * Financial Reports Controller
 * Provides API endpoints for accounting reports
 * QuickBooks/Zoho style API
 */

const reportsService = require('../services/reportsService');

/**
 * Get available reports list
 */
const getAvailableReports = (req, res) => {
    res.json({
        reports: [
            {
                id: 'trial-balance',
                name: 'Trial Balance',
                description: 'Debit and credit balances of all accounts',
                category: 'core',
            },
            {
                id: 'profit-loss',
                name: 'Profit & Loss',
                description: 'Income and expenses for a period',
                category: 'core',
            },
            {
                id: 'balance-sheet',
                name: 'Balance Sheet',
                description: 'Assets, liabilities, and equity snapshot',
                category: 'core',
            },
            {
                id: 'cash-flow',
                name: 'Cash Flow Statement',
                description: 'Cash inflows and outflows',
                category: 'core',
            },
            {
                id: 'gst',
                name: 'GST Report',
                description: 'Input/Output GST summary',
                category: 'tax',
            },
            {
                id: 'ar-aging',
                name: 'Accounts Receivable Aging',
                description: 'Customer balances by age',
                category: 'receivables',
            },
            {
                id: 'ap-aging',
                name: 'Accounts Payable Aging',
                description: 'Vendor balances by age',
                category: 'payables',
            },
        ],
    });
};

/**
 * Get Trial Balance
 */
const getTrialBalance = async (req, res) => {
    try {
        const { asOfDate } = req.query;
        const date = asOfDate ? new Date(asOfDate) : new Date();

        const report = await reportsService.getTrialBalance(date);

        res.json({
            reportName: 'Trial Balance',
            generatedAt: new Date().toISOString(),
            ...report,
        });
    } catch (error) {
        console.error('Trial balance error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Get Profit & Loss Statement
 */
const getProfitAndLoss = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        // Default to current fiscal year
        const fiscal = reportsService.getFiscalYear();
        const start = startDate ? new Date(startDate) : fiscal.start;
        const end = endDate ? new Date(endDate) : new Date();

        const report = await reportsService.getProfitAndLoss(start, end);

        res.json({
            reportName: 'Profit & Loss Statement',
            generatedAt: new Date().toISOString(),
            ...report,
        });
    } catch (error) {
        console.error('P&L error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Get Balance Sheet
 */
const getBalanceSheet = async (req, res) => {
    try {
        const { asOfDate } = req.query;
        const date = asOfDate ? new Date(asOfDate) : new Date();

        const report = await reportsService.getBalanceSheet(date);

        res.json({
            reportName: 'Balance Sheet',
            generatedAt: new Date().toISOString(),
            ...report,
        });
    } catch (error) {
        console.error('Balance sheet error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Get Cash Flow Statement
 */
const getCashFlow = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        const fiscal = reportsService.getFiscalYear();
        const start = startDate ? new Date(startDate) : fiscal.start;
        const end = endDate ? new Date(endDate) : new Date();

        const report = await reportsService.getCashFlowStatement(start, end);

        res.json({
            reportName: 'Cash Flow Statement',
            generatedAt: new Date().toISOString(),
            ...report,
        });
    } catch (error) {
        console.error('Cash flow error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Get GST Report
 */
const getGSTReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        // Default to current month
        const now = new Date();
        const start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
        const end = endDate ? new Date(endDate) : new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const report = await reportsService.getGSTReport(start, end);

        res.json({
            reportName: 'GST Summary Report',
            generatedAt: new Date().toISOString(),
            ...report,
        });
    } catch (error) {
        console.error('GST report error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Get Accounts Receivable Aging
 */
const getARAgingReport = async (req, res) => {
    try {
        const { asOfDate } = req.query;
        const date = asOfDate ? new Date(asOfDate) : new Date();

        const report = await reportsService.getARAgingReport(date);

        res.json({
            reportName: 'Accounts Receivable Aging',
            generatedAt: new Date().toISOString(),
            ...report,
        });
    } catch (error) {
        console.error('AR aging error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Get Accounts Payable Aging
 */
const getAPAgingReport = async (req, res) => {
    try {
        const { asOfDate } = req.query;
        const date = asOfDate ? new Date(asOfDate) : new Date();

        const report = await reportsService.getAPAgingReport(date);

        res.json({
            reportName: 'Accounts Payable Aging',
            generatedAt: new Date().toISOString(),
            ...report,
        });
    } catch (error) {
        console.error('AP aging error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

/**
 * Get Dashboard Summary
 */
const getDashboardSummary = async (req, res) => {
    try {
        const fiscal = reportsService.getFiscalYear();
        const now = new Date();

        // Get key metrics
        const [pnl, arAging, apAging] = await Promise.all([
            reportsService.getProfitAndLoss(fiscal.start, now),
            reportsService.getARAgingReport(now),
            reportsService.getAPAgingReport(now),
        ]);

        res.json({
            fiscalYear: fiscal.label,
            revenue: pnl.income.total,
            expenses: pnl.expenses.total,
            netProfit: pnl.netProfit,
            accountsReceivable: arAging.totalOutstanding,
            accountsPayable: apAging.totalPayable,
            cashPosition: pnl.netProfit, // Simplified
            generatedAt: new Date().toISOString(),
        });
    } catch (error) {
        console.error('Dashboard summary error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getAvailableReports,
    getTrialBalance,
    getProfitAndLoss,
    getBalanceSheet,
    getCashFlow,
    getGSTReport,
    getARAgingReport,
    getAPAgingReport,
    getDashboardSummary,
};
