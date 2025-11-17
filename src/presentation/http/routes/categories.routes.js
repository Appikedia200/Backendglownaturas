const express = require('express');
const router = express.Router();
const container = require('../../../di/container');
const { protect } = require('../../../middleware/auth');
const {
  validateCreateCategory,
  validateUpdateCategory,
  validateCategoryId
} = require('../validators/category.validator');

// Public routes
router.get('/', (req, res, next) => container.getCategoryController().getAll(req, res, next));
router.get('/:id', validateCategoryId, (req, res, next) => container.getCategoryController().getOne(req, res, next));

// Protected routes
router.post('/', protect, validateCreateCategory, (req, res, next) => container.getCategoryController().create(req, res, next));
router.put('/:id', protect, validateUpdateCategory, (req, res, next) => container.getCategoryController().update(req, res, next));
router.delete('/:id', protect, validateCategoryId, (req, res, next) => container.getCategoryController().delete(req, res, next));

module.exports = router;