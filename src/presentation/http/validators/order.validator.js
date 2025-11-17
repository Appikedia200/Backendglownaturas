/**
 * Order Validation Schemas
 * Express-validator middleware for order endpoints
 * @version 5.1.0
 */

const { body, param, query, validationResult } = require('express-validator');
const { ValidationError } = require('../../../shared/errors/AppError');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(err => ({
      field: err.path,
      message: err.msg,
      value: err.value
    }));
    throw new ValidationError('Validation failed', formattedErrors);
  }
  next();
};

/**
 * Validate create order request
 */
const validateCreateOrder = [
  body('customer.name')
    .trim()
    .notEmpty().withMessage('Customer name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Customer name must be 2-100 characters'),
  
  body('customer.email')
    .trim()
    .notEmpty().withMessage('Customer email is required')
    .isEmail().withMessage('Invalid email address')
    .normalizeEmail(),
  
  body('customer.phone')
    .trim()
    .notEmpty().withMessage('Customer phone is required')
    .matches(/^[0-9+\-\s()]+$/).withMessage('Invalid phone number'),
  
  body('customer.address')
    .trim()
    .notEmpty().withMessage('Customer address is required')
    .isLength({ min: 10, max: 500 }).withMessage('Address must be 10-500 characters'),
  
  body('customer.city')
    .trim()
    .notEmpty().withMessage('City is required'),
  
  body('customer.state')
    .trim()
    .notEmpty().withMessage('State is required'),
  
  body('items')
    .isArray({ min: 1 }).withMessage('Order must contain at least one item'),
  
  body('items.*.product')
    .isMongoId().withMessage('Invalid product ID'),
  
  body('items.*.quantity')
    .isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  
  body('shippingFee')
    .optional()
    .isFloat({ min: 0 }).withMessage('Shipping fee must be non-negative'),
  
  body('paymentMethod')
    .isIn(['bank_transfer', 'card', 'cash_on_delivery']).withMessage('Invalid payment method'),
  
  validate
];

/**
 * Validate confirm payment request
 */
const validateConfirmPayment = [
  param('orderId')
    .trim()
    .notEmpty().withMessage('Order ID is required'),
  
  body('paymentProof')
    .optional()
    .isURL().withMessage('Payment proof must be a valid URL'),
  
  validate
];

/**
 * Validate update order status
 */
const validateUpdateOrderStatus = [
  param('orderId')
    .trim()
    .notEmpty().withMessage('Order ID is required'),
  
  body('status')
    .isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Invalid order status'),
  
  body('trackingNumber')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Tracking number too long'),
  
  body('carrier')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Carrier name too long'),
  
  validate
];

/**
 * Validate get orders query
 */
const validateGetOrders = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  
  query('status')
    .optional()
    .isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Invalid order status'),
  
  query('paymentStatus')
    .optional()
    .isIn(['pending', 'paid', 'failed', 'refunded'])
    .withMessage('Invalid payment status'),
  
  validate
];

/**
 * Validate order ID param
 */
const validateOrderId = [
  param('orderId')
    .trim()
    .notEmpty().withMessage('Order ID is required'),
  
  validate
];

module.exports = {
  validateCreateOrder,
  validateConfirmPayment,
  validateUpdateOrderStatus,
  validateGetOrders,
  validateOrderId,
};

