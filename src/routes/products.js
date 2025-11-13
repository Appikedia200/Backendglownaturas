const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect } = require('../middleware/auth');
const { validateProduct, handleValidationErrors } = require('../middleware/validation');

router.get('/generate-sku', protect, productController.generateSKU);

router.post('/', protect, validateProduct, handleValidationErrors, productController.createProduct);
router.get('/', productController.getAllProducts);
router.get('/low-stock', protect, productController.getLowStockProducts);
router.get('/:id', productController.getProduct);
router.put('/:id', protect, validateProduct, handleValidationErrors, productController.updateProduct);
router.delete('/:id', protect, productController.deleteProduct);

router.put('/bulk/status', protect, productController.bulkUpdateStatus);

module.exports = router;

