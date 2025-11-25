/**
 * Homepage Sections Routes - Clean Architecture
 * @version 5.2.0
 */

const express = require('express');
const router = express.Router();
const container = require('../../../di/container');
const { protect } = require('../../../middleware/auth');

// Public routes (frontend needs to fetch sections)
router.get('/', (req, res, next) => container.getHomepageSectionController().getAll(req, res, next));
router.get('/:type', (req, res, next) => container.getHomepageSectionController().getOne(req, res, next));

// Protected routes (admin only)
router.post('/', protect, (req, res, next) => container.getHomepageSectionController().create(req, res, next));
router.put('/:type', protect, (req, res, next) => container.getHomepageSectionController().update(req, res, next));
router.delete('/:type', protect, (req, res, next) => container.getHomepageSectionController().delete(req, res, next));

// Product management in sections (protected)
router.post('/:type/products', protect, (req, res, next) => container.getHomepageSectionController().addProducts(req, res, next));
router.delete('/:type/products', protect, (req, res, next) => container.getHomepageSectionController().removeProducts(req, res, next));
router.put('/:type/reorder', protect, (req, res, next) => container.getHomepageSectionController().reorderProducts(req, res, next));
router.patch('/:type/toggle', protect, (req, res, next) => container.getHomepageSectionController().toggleActive(req, res, next));

module.exports = router;

