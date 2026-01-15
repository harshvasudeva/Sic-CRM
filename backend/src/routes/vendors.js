const express = require('express');
const router = express.Router();
const vendorsController = require('../controllers/vendorsController');
const { authMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, vendorsController.getAllVendors);
router.get('/:id', authMiddleware, vendorsController.getVendor);
router.post('/', authMiddleware, vendorsController.createVendor);
router.put('/:id', authMiddleware, vendorsController.updateVendor);
router.delete('/:id', authMiddleware, vendorsController.deleteVendor);

module.exports = router;
