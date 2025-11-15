const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');
const { reviewLimiter } = require('../middleware/rateLimiter');
const { logAdminAction } = require('../middleware/auditLog');
const {
  validateCreateReview,
  validateUpdateReviewStatus,
  validateReviewId
} = require('../validators/reviewValidator');

router.post('/', reviewLimiter, validateCreateReview, reviewController.createReview);
router.get('/', reviewController.getAllReviews);
router.get('/:id', validateReviewId, reviewController.getReview);
router.put('/:id/status', protect, validateUpdateReviewStatus, logAdminAction('approve', 'review'), reviewController.updateReviewStatus);
router.delete('/:id', protect, validateReviewId, logAdminAction('delete', 'review'), reviewController.deleteReview);

router.put('/bulk/status', protect, reviewController.bulkUpdateStatus);

module.exports = router;

