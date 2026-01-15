const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { authMiddleware } = require('../middleware/auth');

router.get('/analytics', authMiddleware, analyticsController.getAnalytics);
router.get('/export', authMiddleware, analyticsController.exportData);

module.exports = router;
