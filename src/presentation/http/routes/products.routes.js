const express = require('express');
const router = express.Router();
const container = require('../../../di/container');
const { protect } = require('../../../middleware/auth');
const {
  validateCreateProduct,
  validateUpdateProduct,
  validateGetProducts,
  validateProductId
} = require('../validators/product.validator');

// Public routes
router.get('/', validateGetProducts, (req, res, next) => container.getProductController().getAll(req, res, next));
router.get('/low-stock', protect, (req, res, next) => container.getProductController().getLowStock(req, res, next));
router.get('/:id', validateProductId, (req, res, next) => container.getProductController().getOne(req, res, next));

// Protected routes
router.post('/', protect, validateCreateProduct, (req, res, next) => container.getProductController().create(req, res, next));
router.put('/:id', protect, validateUpdateProduct, (req, res, next) => container.getProductController().update(req, res, next));
router.delete('/:id', protect, validateProductId, (req, res, next) => container.getProductController().delete(req, res, next));

module.exports = router;

