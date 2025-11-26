/**
 * Analytics Routes - Clean Architecture
 * @version 5.2.1
 */

const express = require('express');
const router = express.Router();
const container = require('../../../di/container');
const { protect } = require('../../../middleware/auth');

// All analytics routes require authentication
router.use(protect);

// Analytics endpoints
router.get('/summary', (req, res, next) => container.getAnalyticsController().getSummary(req, res, next));
router.get('/revenue', (req, res, next) => container.getAnalyticsController().getRevenue(req, res, next));
router.get('/top-products', (req, res, next) => container.getAnalyticsController().getTopProducts(req, res, next));
router.get('/sales-by-category', (req, res, next) => container.getAnalyticsController().getSalesByCategory(req, res, next));
router.get('/export', (req, res, next) => container.getAnalyticsController().export(req, res, next));

module.exports = router;

