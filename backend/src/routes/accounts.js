/**
 * Accounts Routes
 * RESTful API endpoints for Chart of Accounts
 */

const express = require('express');
const router = express.Router();
const accountsController = require('../controllers/accountsController');
const { authMiddleware } = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(authMiddleware);

// GET /api/accounts - List all accounts with filters
router.get('/', accountsController.getAllAccounts);

// GET /api/accounts/summary - Get accounts summary by type
router.get('/summary', accountsController.getAccountsSummary);

// GET /api/accounts/:id - Get single account
router.get('/:id', accountsController.getAccount);

// GET /api/accounts/:id/ledger - Get account ledger (transactions)
router.get('/:id/ledger', accountsController.getAccountLedger);

// POST /api/accounts - Create new account
router.post('/', accountsController.createAccount);

// PUT /api/accounts/:id - Update account
router.put('/:id', accountsController.updateAccount);

// DELETE /api/accounts/:id - Deactivate account (soft delete)
router.delete('/:id', accountsController.deactivateAccount);

module.exports = router;
