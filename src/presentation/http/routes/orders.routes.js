const express = require('express');
const router = express.Router();
const container = require('../../../di/container');
const { protect } = require('../../../middleware/auth');
const {
  validateCreateOrder,
  validateConfirmPayment,
  validateUpdateOrderStatus,
  validateGetOrders,
  validateOrderId
} = require('../validators/order.validator');

// All order routes require authentication
router.use(protect);

router.get('/', validateGetOrders, (req, res, next) => container.getOrderController().getAll(req, res, next));
router.get('/statistics', (req, res, next) => container.getOrderController().getStatistics(req, res, next));
router.get('/:orderId', validateOrderId, (req, res, next) => container.getOrderController().getOne(req, res, next));
router.post('/', validateCreateOrder, (req, res, next) => container.getOrderController().create(req, res, next));
router.post('/:orderId/confirm-payment', validateConfirmPayment, (req, res, next) => container.getOrderController().confirmPayment(req, res, next));
router.patch('/:orderId/status', validateUpdateOrderStatus, (req, res, next) => container.getOrderController().updateStatus(req, res, next));

module.exports = router;

