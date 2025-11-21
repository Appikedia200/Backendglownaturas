/**
 * Media Routes - Clean Architecture
 * @version 5.1.0
 */

const express = require('express');
const router = express.Router();
const container = require('../../../di/container');
const { protect } = require('../../../middleware/auth');
const upload = require('../../../middleware/upload');

// All routes require authentication
router.use(protect);

// LAZY LOADING: Get controller only when route is called
// Frontend sends 'image' field, not 'file'
router.post('/', upload.single('image'), (req, res, next) => container.getMediaController().upload(req, res, next));
router.get('/', (req, res, next) => container.getMediaController().getAll(req, res, next));
router.get('/:id', (req, res, next) => container.getMediaController().getOne(req, res, next));
router.put('/:id', (req, res, next) => container.getMediaController().update(req, res, next));
router.delete('/:id', (req, res, next) => container.getMediaController().delete(req, res, next));

module.exports = router;

