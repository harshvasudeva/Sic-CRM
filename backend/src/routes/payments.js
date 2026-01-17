/**
 * Payments Routes
 * RESTful API endpoints for customer payments
 */

const express = require('express');
const router = express.Router();
const paymentsController = require('../controllers/paymentsController');
const { authMiddleware } = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(authMiddleware);

// GET /api/payments - List all payments with filters
router.get('/', paymentsController.getAllPayments);

// GET /api/payments/summary - Get payments statistics
router.get('/summary', paymentsController.getPaymentsSummary);

// GET /api/payments/:id - Get single payment
router.get('/:id', paymentsController.getPayment);

// POST /api/payments - Create new payment
router.post('/', paymentsController.createPayment);

// POST /api/payments/:id/apply - Apply payment to invoices
router.post('/:id/apply', paymentsController.applyPayment);

// POST /api/payments/:id/void - Void a payment
router.post('/:id/void', paymentsController.voidPayment);

module.exports = router;
