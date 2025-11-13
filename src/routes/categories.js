const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { protect } = require('../middleware/auth');
const { validateCategory, handleValidationErrors } = require('../middleware/validation');

router.post('/', protect, validateCategory, handleValidationErrors, categoryController.createCategory);
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategory);
router.put('/:id', protect, validateCategory, handleValidationErrors, categoryController.updateCategory);
router.delete('/:id', protect, categoryController.deleteCategory);

router.put('/reorder', protect, categoryController.reorderCategories);

module.exports = router;

