const express = require('express');
const router = express.Router();
const quotationsController = require('../controllers/quotationsController');
const { authMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, quotationsController.getAllQuotations);
router.get('/:id', authMiddleware, quotationsController.getQuotation);
router.post('/', authMiddleware, quotationsController.createQuotation);
router.put('/:id', authMiddleware, quotationsController.updateQuotation);

module.exports = router;
