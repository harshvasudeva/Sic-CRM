const express = require('express');
const router = express.Router();
const customersController = require('../controllers/customersController');
const { authMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, customersController.getAllCustomers);
router.get('/:id', authMiddleware, customersController.getCustomer);
router.post('/', authMiddleware, customersController.createCustomer);
router.put('/:id', authMiddleware, customersController.updateCustomer);
router.delete('/:id', authMiddleware, customersController.deleteCustomer);

module.exports = router;
