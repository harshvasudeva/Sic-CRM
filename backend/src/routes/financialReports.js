/**
 * Financial Reports Routes
 * RESTful API endpoints for accounting reports
 */

const express = require('express');
const router = express.Router();
const financialReportsController = require('../controllers/financialReportsController');
const { authMiddleware } = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(authMiddleware);

// GET /api/financial-reports - List available reports
router.get('/', financialReportsController.getAvailableReports);

// GET /api/financial-reports/dashboard - Dashboard summary
router.get('/dashboard', financialReportsController.getDashboardSummary);

// Core Reports
// GET /api/financial-reports/trial-balance
router.get('/trial-balance', financialReportsController.getTrialBalance);

// GET /api/financial-reports/profit-loss
router.get('/profit-loss', financialReportsController.getProfitAndLoss);

// GET /api/financial-reports/balance-sheet
router.get('/balance-sheet', financialReportsController.getBalanceSheet);

// GET /api/financial-reports/cash-flow
router.get('/cash-flow', financialReportsController.getCashFlow);

// Tax Reports
// GET /api/financial-reports/gst
router.get('/gst', financialReportsController.getGSTReport);

// Aging Reports
// GET /api/financial-reports/ar-aging
router.get('/ar-aging', financialReportsController.getARAgingReport);

// GET /api/financial-reports/ap-aging
router.get('/ap-aging', financialReportsController.getAPAgingReport);

module.exports = router;
