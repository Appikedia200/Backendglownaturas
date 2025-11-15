const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { protect } = require('../middleware/auth');
const {
  validateCreateCategory,
  validateUpdateCategory,
  validateCategoryId
} = require('../validators/categoryValidator');

router.post('/', protect, validateCreateCategory, categoryController.createCategory);
router.get('/', categoryController.getAllCategories);
router.get('/:id', validateCategoryId, categoryController.getCategory);
router.put('/:id', protect, validateUpdateCategory, categoryController.updateCategory);
router.delete('/:id', protect, validateCategoryId, categoryController.deleteCategory);

router.put('/reorder', protect, categoryController.reorderCategories);

module.exports = router;

