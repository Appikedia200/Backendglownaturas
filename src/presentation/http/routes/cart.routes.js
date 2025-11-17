/**
 * Cart Routes - Clean Architecture
 * @version 5.1.0
 */

const express = require('express');
const router = express.Router();
const container = require('../../../di/container');

// LAZY LOADING: Get controller only when route is called
router.get('/:sessionId', (req, res, next) => container.getCartController().getCart(req, res, next));
router.post('/', (req, res, next) => container.getCartController().addItem(req, res, next));
router.put('/:sessionId/items/:productId', (req, res, next) => container.getCartController().updateItemQuantity(req, res, next));
router.delete('/:sessionId/items/:productId', (req, res, next) => container.getCartController().removeItem(req, res, next));
router.delete('/:sessionId', (req, res, next) => container.getCartController().clearCart(req, res, next));

module.exports = router;

