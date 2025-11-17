const express = require('express');
const router = express.Router();
const container = require('../../../di/container');
const { protect } = require('../../../middleware/auth');
const {
  validateUpdateReviewStatus,
  validateGetReviews,
  validateReviewId,
  validateProductId
} = require('../validators/review.validator');

// Public routes
router.get('/', validateGetReviews, (req, res, next) => container.getReviewController().getAll(req, res, next));
router.get('/product/:productId', validateProductId, (req, res, next) => container.getReviewController().getByProduct(req, res, next));

// Protected routes
router.get('/:id', protect, validateReviewId, (req, res, next) => container.getReviewController().getOne(req, res, next));
router.patch('/:id/status', protect, validateUpdateReviewStatus, (req, res, next) => container.getReviewController().updateStatus(req, res, next));
router.delete('/:id', protect, validateReviewId, (req, res, next) => container.getReviewController().delete(req, res, next));

module.exports = router;

