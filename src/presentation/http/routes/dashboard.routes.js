/**
 * Dashboard Routes - Clean Architecture
 * @version 5.1.0
 */

const express = require('express');
const router = express.Router();
const container = require('../../../di/container');
const { protect } = require('../../../middleware/auth');

// All routes require authentication
router.use(protect);

// LAZY LOADING: Get controller only when route is called
router.get('/statistics', (req, res, next) => container.getDashboardController().getStatistics(req, res, next));

module.exports = router;

