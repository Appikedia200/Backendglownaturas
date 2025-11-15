const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { protect } = require('../middleware/auth');
const { logAdminAction } = require('../middleware/auditLog');
const {
  validateCreateProduct,
  validateUpdateProduct,
  validateGetProducts,
  validateProductId
} = require('../validators/productValidator');

router.get('/generate-sku', protect, productController.generateSKU);

router.post('/', protect, validateCreateProduct, logAdminAction('create', 'product'), productController.createProduct);
router.get('/', validateGetProducts, productController.getAllProducts);
router.get('/low-stock', protect, productController.getLowStockProducts);
router.get('/:id', validateProductId, productController.getProduct);
router.put('/:id', protect, validateUpdateProduct, logAdminAction('update', 'product'), productController.updateProduct);
router.delete('/:id', protect, validateProductId, logAdminAction('delete', 'product'), productController.deleteProduct);

router.put('/bulk/status', protect, productController.bulkUpdateStatus);

module.exports = router;

