const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, dashboardController.getDashboardStats);
router.get('/sales', authMiddleware, dashboardController.getSalesStats);
router.get('/crm', authMiddleware, dashboardController.getCRMStats);
router.get('/hr', authMiddleware, dashboardController.getHRStats);

module.exports = router;
