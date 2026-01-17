/**
 * Bills Routes
 * RESTful API endpoints for vendor bills/invoices
 */

const express = require('express');
const router = express.Router();
const billsController = require('../controllers/billsController');
const { authMiddleware } = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(authMiddleware);

// GET /api/bills - List all bills with filters
router.get('/', billsController.getAllBills);

// GET /api/bills/summary - Get bills statistics
router.get('/summary', billsController.getBillsSummary);

// GET /api/bills/:id - Get single bill
router.get('/:id', billsController.getBill);

// POST /api/bills - Create new bill
router.post('/', billsController.createBill);

// PUT /api/bills/:id - Update bill
router.put('/:id', billsController.updateBill);

// POST /api/bills/:id/post - Post/finalize bill
router.post('/:id/post', billsController.postBill);

// POST /api/bills/:id/payments - Record payment against bill
router.post('/:id/payments', billsController.recordPayment);

// POST /api/bills/:id/void - Void a bill
router.post('/:id/void', billsController.voidBill);

module.exports = router;
