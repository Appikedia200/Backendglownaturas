const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

router.post('/', cartController.addToCart);
router.get('/:sessionId', cartController.getCart);
router.put('/:sessionId/item/:itemId', cartController.updateCartItem);
router.delete('/:sessionId/item/:itemId', cartController.removeCartItem);
router.delete('/:sessionId', cartController.clearCart);

module.exports = router;

