const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

router.post('/', orderController.createOrder);
router.get('/', protect, orderController.getAllOrders);
router.get('/:id', orderController.getOrder);
router.put('/:id/status', protect, orderController.updateOrderStatus);
router.put('/:id/payment-status', protect, orderController.updatePaymentStatus);
router.put('/:id/tracking', protect, orderController.updateTrackingNumber);
router.delete('/:id', protect, orderController.deleteOrder);

module.exports = router;

