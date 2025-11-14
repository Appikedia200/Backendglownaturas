const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect } = require('../middleware/auth');
const { validateProduct, handleValidationErrors } = require('../middleware/validation');
const { logAdminAction } = require('../middleware/auditLog');

router.get('/generate-sku', protect, productController.generateSKU);

router.post('/', protect, logAdminAction('create', 'product'), validateProduct, handleValidationErrors, productController.createProduct);
router.get('/', productController.getAllProducts);
router.get('/low-stock', protect, productController.getLowStockProducts);
router.get('/:id', productController.getProduct);
router.put('/:id', protect, logAdminAction('update', 'product'), validateProduct, handleValidationErrors, productController.updateProduct);
router.delete('/:id', protect, logAdminAction('delete', 'product'), productController.deleteProduct);

router.put('/bulk/status', protect, productController.bulkUpdateStatus);

module.exports = router;

