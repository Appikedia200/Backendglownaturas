const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const {
  validateAddToCart,
  validateUpdateCartItem,
  validateCartItemId
} = require('../validators/cartValidator');

router.post('/', validateAddToCart, cartController.addToCart);
router.get('/:sessionId', cartController.getCart);
router.put('/:sessionId/item/:itemId', validateUpdateCartItem, cartController.updateCartItem);
router.delete('/:sessionId/item/:itemId', validateCartItemId, cartController.removeCartItem);
router.delete('/:sessionId', cartController.clearCart);

module.exports = router;

