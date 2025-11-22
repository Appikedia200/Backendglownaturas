const express = require('express');
const router = express.Router();
const container = require('../../../di/container');
const { protect } = require('../../../middleware/auth');
const { authorize } = require('../../../middleware/authorize');

// Public routes - frontend can view active banners
router.get('/', (req, res, next) => container.getBannerController().getAll(req, res, next));
router.get('/:section', (req, res, next) => container.getBannerController().getBySection(req, res, next));

// Protected routes - admin only
router.use(protect);
router.use(authorize('admin', 'superadmin'));

router.post('/', (req, res, next) => container.getBannerController().create(req, res, next));
router.put('/:section', (req, res, next) => container.getBannerController().update(req, res, next));
router.delete('/:section', (req, res, next) => container.getBannerController().delete(req, res, next));

// Image management
router.post('/:section/images', (req, res, next) => container.getBannerController().addImage(req, res, next));
router.delete('/:section/images/:mediaId', (req, res, next) => container.getBannerController().removeImage(req, res, next));
router.put('/:section/images/reorder', (req, res, next) => container.getBannerController().reorderImages(req, res, next));

module.exports = router;
