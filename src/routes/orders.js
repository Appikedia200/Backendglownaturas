const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect } = require('../middleware/auth');
const { logAdminAction } = require('../middleware/auditLog');
const { orderLimiter } = require('../middleware/rateLimiter');

// Public route - create order
router.post('/', orderLimiter, orderController.createOrder);

// Protected routes - admin only
router.use(protect);

router.get('/', orderController.getAllOrders);
router.get('/export', orderController.exportOrders);
router.get('/:id', orderController.getOrder);

router.put(
  '/:id/confirm-payment',
  logAdminAction('update', 'order'),
  orderController.confirmPayment
);

router.put(
  '/:id/status',
  logAdminAction('update', 'order'),
  orderController.updateOrderStatus
);

router.put(
  '/:id/cancel',
  logAdminAction('update', 'order'),
  orderController.cancelOrder
);

router.post(
  '/:id/notes',
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
