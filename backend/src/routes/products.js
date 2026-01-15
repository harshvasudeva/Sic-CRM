const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const productsController = require('../controllers/productsController');
const { authMiddleware, validateRequest } = require('../middleware/auth');

router.get('/', authMiddleware, productsController.getAllProducts);
router.get('/:id', authMiddleware, productsController.getProduct);

router.post(
  '/',
  authMiddleware,
  [
    body('sku').notEmpty().withMessage('SKU is required'),
    body('name').notEmpty().withMessage('Name is required'),
    body('price').isNumeric().withMessage('Price must be a number'),
  ],
  validateRequest,
  productsController.createProduct
);

router.put(
  '/:id',
  authMiddleware,
  productsController.updateProduct
);

router.delete('/:id', authMiddleware, productsController.deleteProduct);

module.exports = router;
