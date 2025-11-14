const Cart = require('../models/Cart');
const Product = require('../models/Product');
const logger = require('../config/logger');

exports.addToCart = async (req, res, next) => {
  try {
    const { sessionId, productId, quantity } = req.body;
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }
    
    if (product.status !== 'active') {
      return res.status(400).json({
        success: false,
        error: 'Product is not available'
      });
    }
    
    if (product.availableStock < quantity) {
      return res.status(400).json({
        success: false,
        error: `Insufficient stock available. Only ${product.availableStock} units available`
      });
    }
    
    let cart = await Cart.findOne({ sessionId });
    
    if (!cart) {
      cart = await Cart.create({
        sessionId,
        customerEmail: req.body.customerEmail,
        items: [{
          product: productId,
          quantity,
          priceAtAdd: product.price
        }]
      });
    } else {
      const existingItem = cart.items.find(
        item => item.product.toString() === productId
      );
      
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        
        if (product.availableStock < newQuantity) {
          return res.status(400).json({
            success: false,
            error: `Cannot add ${quantity} more units. Only ${product.availableStock} units available`
          });
        }
        
        existingItem.quantity = newQuantity;
      } else {
        cart.items.push({
          product: productId,
          quantity,
          priceAtAdd: product.price
        });
      }
      
      await cart.save();
    }
    
    await cart.populate('items.product');
    
    logger.info(`Item added to cart - Session: ${sessionId}, Product: ${product.name}, Qty: ${quantity}`);
    
    res.json({
      success: true,
      data: cart
    });
  } catch (error) {
    logger.error(`Add to cart failed: ${error.message}`);
    next(error);
  }
};

exports.getCart = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    
    const cart = await Cart.findOne({ sessionId })
      .populate('items.product');
    
    if (!cart) {
      return res.json({
        success: true,
        data: {
          items: [],
          total: 0,
          itemCount: 0
        }
      });
    }
    
    res.json({
      success: true,
      data: cart
    });
  } catch (error) {
    logger.error(`Get cart failed: ${error.message}`);
    next(error);
  }
};

exports.updateCartItem = async (req, res, next) => {
  try {
    const { sessionId, itemId } = req.params;
    const { quantity } = req.body;
    
    if (quantity < 1) {
      return res.status(400).json({
        success: false,
        error: 'Quantity must be at least 1'
      });
    }
    
    const cart = await Cart.findOne({ sessionId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        error: 'Cart not found'
      });
    }
    
    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Item not found in cart'
      });
    }
    
    const product = await Product.findById(item.product);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product no longer available'
      });
    }
    
    if (product.availableStock < quantity) {
      return res.status(400).json({
        success: false,
        error: `Insufficient stock. Only ${product.availableStock} units available`
      });
    }
    
    item.quantity = quantity;
    await cart.save();
    await cart.populate('items.product');
    
    logger.info(`Cart item updated - Session: ${sessionId}, Item: ${itemId}, New Qty: ${quantity}`);
    
    res.json({
      success: true,
      data: cart
    });
  } catch (error) {
    logger.error(`Update cart item failed: ${error.message}`);
    next(error);
  }
};

exports.removeCartItem = async (req, res, next) => {
  try {
    const { sessionId, itemId } = req.params;
    
    const cart = await Cart.findOne({ sessionId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        error: 'Cart not found'
      });
    }
    
    cart.items.pull(itemId);
    await cart.save();
    await cart.populate('items.product');
    
    logger.info(`Cart item removed - Session: ${sessionId}, Item: ${itemId}`);
    
    res.json({
      success: true,
      data: cart
    });
  } catch (error) {
    logger.error(`Remove cart item failed: ${error.message}`);
    next(error);
  }
};

exports.clearCart = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    
    await Cart.findOneAndDelete({ sessionId });
    
    logger.info(`Cart cleared - Session: ${sessionId}`);
    
    res.json({
      success: true,
      message: 'Cart cleared'
    });
  } catch (error) {
    logger.error(`Clear cart failed: ${error.message}`);
    next(error);
  }
};

