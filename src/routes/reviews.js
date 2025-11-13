const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');
const { validateReview, handleValidationErrors } = require('../middleware/validation');

router.post('/', validateReview, handleValidationErrors, reviewController.createReview);
router.get('/', reviewController.getAllReviews);
router.get('/:id', reviewController.getReview);
router.put('/:id/status', protect, reviewController.updateReviewStatus);
router.delete('/:id', protect, reviewController.deleteReview);

router.put('/bulk/status', protect, reviewController.bulkUpdateStatus);

module.exports = router;

