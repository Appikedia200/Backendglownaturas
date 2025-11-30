/**
 * Settings Routes - Clean Architecture
 * @version 5.2.0
 */

const express = require('express');
const router = express.Router();
const container = require('../../../di/container');
const { protect } = require('../../../middleware/auth');

// PUBLIC ROUTE - Frontend needs WhatsApp/store settings
router.get('/public', (req, res, next) => container.getSettingsController().getPublicSettings(req, res, next));

// PROTECTED ROUTES - Admin only
router.use(protect);
router.get('/', (req, res, next) => container.getSettingsController().getSettings(req, res, next));
router.put('/', (req, res, next) => container.getSettingsController().updateSettings(req, res, next));

module.exports = router;

