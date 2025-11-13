const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

router.get('/stats', protect, dashboardController.getStats);
router.get('/recent-orders', protect, dashboardController.getRecentOrders);
router.get('/top-products', protect, dashboardController.getTopProducts);
router.get('/sales-data', protect, dashboardController.getSalesData);

module.exports = router;

