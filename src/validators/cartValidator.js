/**
 * Cart Validation Middleware
 * 
 * @module validators/cartValidator
 * @version 5.1.0
 */

const { body, param, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  next();
};

exports.validateAddToCart = [
  body('productId')
    .isMongoId().withMessage('Invalid product ID'),
  
  body('quantity')
    .isInt({ min: 1, max: 100 }).withMessage('Quantity must be 1-100'),
  
  validate
];

exports.validateUpdateCartItem = [
  param('itemId')
    .isMongoId().withMessage('Invalid item ID'),
  
  body('quantity')
    .isInt({ min: 1, max: 100 }).withMessage('Quantity must be 1-100'),
  
  validate
];

exports.validateCartItemId = [
  param('itemId')
    .isMongoId().withMessage('Invalid item ID'),
  
  validate
];

