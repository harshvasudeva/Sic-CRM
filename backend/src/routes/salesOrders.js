const express = require('express');
const router = express.Router();
const salesOrdersController = require('../controllers/salesOrdersController');
const { authMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, salesOrdersController.getAllSalesOrders);
router.get('/stats', authMiddleware, salesOrdersController.getSalesStats);
router.get('/:id', authMiddleware, salesOrdersController.getSalesOrder);
router.post('/', authMiddleware, salesOrdersController.createSalesOrder);
router.put('/:id', authMiddleware, salesOrdersController.updateSalesOrder);
router.put('/:id/confirm', authMiddleware, salesOrdersController.confirmSalesOrder);
router.put('/:id/deliver', authMiddleware, salesOrdersController.deliverSalesOrder);
router.delete('/:id', authMiddleware, salesOrdersController.deleteSalesOrder);

module.exports = router;
