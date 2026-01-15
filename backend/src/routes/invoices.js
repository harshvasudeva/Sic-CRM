const express = require('express');
const router = express.Router();
const invoicesController = require('../controllers/invoicesController');
const { authMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, invoicesController.getAllInvoices);
router.get('/:id', authMiddleware, invoicesController.getInvoice);
router.get('/:id/pdf', authMiddleware, invoicesController.generateInvoicePDFDocument);
router.post('/', authMiddleware, invoicesController.createInvoice);
router.put('/:id', authMiddleware, invoicesController.updateInvoice);

module.exports = router;
