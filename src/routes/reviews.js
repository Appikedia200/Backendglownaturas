const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');
const { validateReview, handleValidationErrors } = require('../middleware/validation');
const { reviewLimiter } = require('../middleware/rateLimiter');
const { logAdminAction } = require('../middleware/auditLog');

router.post('/', reviewLimiter, validateReview, handleValidationErrors, reviewController.createReview);
router.get('/', reviewController.getAllReviews);
router.get('/:id', reviewController.getReview);
router.put('/:id/status', protect, logAdminAction('approve', 'review'), reviewController.updateReviewStatus);
router.delete('/:id', protect, logAdminAction('delete', 'review'), reviewController.deleteReview);

router.put('/bulk/status', protect, reviewController.bulkUpdateStatus);

module.exports = router;

