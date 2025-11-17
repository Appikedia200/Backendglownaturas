/**
 * Settings Routes - Clean Architecture
 * @version 5.1.0
 */

const express = require('express');
const router = express.Router();
const container = require('../../../di/container');
const { protect } = require('../../../middleware/auth');

// All routes require authentication
router.use(protect);

// LAZY LOADING: Get controller only when route is called
router.get('/', (req, res, next) => container.getSettingsController().getSettings(req, res, next));
router.put('/', (req, res, next) => container.getSettingsController().updateSettings(req, res, next));

module.exports = router;

