const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect } = require('../middleware/auth');
const { logAdminAction } = require('../middleware/auditLog');
const { orderLimiter } = require('../middleware/rateLimiter');
const {
  validateCreateOrder,
  validateConfirmPayment,
  validateUpdateOrderStatus,
  validateCancelOrder,
  validateAddOrderNote,
  validateGetOrders,
  validateGetOrder
} = require('../validators/orderValidator');

// Public route - create order
router.post('/', orderLimiter, validateCreateOrder, orderController.createOrder);

// Protected routes - admin only
router.use(protect);

router.get('/', validateGetOrders, orderController.getAllOrders);
router.get('/export', orderController.exportOrders);
router.get('/:id', validateGetOrder, orderController.getOrder);

router.put(
  '/:id/confirm-payment',
  validateConfirmPayment,
  logAdminAction('update', 'order'),
  orderController.confirmPayment
);

router.put(
  '/:id/status',
  validateUpdateOrderStatus,
  logAdminAction('update', 'order'),
  orderController.updateOrderStatus
);

router.put(
  '/:id/cancel',
  validateCancelOrder,
  logAdminAction('update', 'order'),
  orderController.cancelOrder
);

router.post(
  '/:id/notes',
  validateAddOrderNote,
  logAdminAction('update', 'order'),
  orderController.addOrderNote
);

router.post(
  '/:id/refund/request',
  logAdminAction('create', 'refund'),
  orderController.requestRefund
);

router.put(
  '/:id/refund/process',
  logAdminAction('update', 'refund'),
  orderController.processRefund
);

module.exports = router;
