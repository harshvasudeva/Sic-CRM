const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchaseController');
const { authMiddleware } = require('../middleware/auth');

// Requisitions
router.get('/requisitions', authMiddleware, purchaseController.getRequisitions);
router.post('/requisitions', authMiddleware, purchaseController.createRequisition);
router.put('/requisitions/:id/status', authMiddleware, purchaseController.updateRequisitionStatus);

// RFQs
router.get('/rfqs', authMiddleware, purchaseController.getRFQs);
router.post('/rfqs', authMiddleware, purchaseController.createRFQ);
router.post('/rfqs/:id/quote', authMiddleware, purchaseController.addQuote);

// Purchase Orders
router.get('/orders', authMiddleware, purchaseController.getPOs);
router.post('/orders', authMiddleware, purchaseController.createPO);
router.put('/orders/:id/status', authMiddleware, purchaseController.updatePOStatus);

// GRNs
router.get('/grns', authMiddleware, purchaseController.getGRNs);
router.post('/grns', authMiddleware, purchaseController.createGRN);

// Evaluations
router.get('/evaluations', authMiddleware, purchaseController.getEvaluations);
router.post('/evaluations', authMiddleware, purchaseController.createEvaluation);

// Stats
router.get('/stats', authMiddleware, purchaseController.getPurchaseStats);

module.exports = router;
