/**
 * Order Validation Middleware
 * Express-validator schemas for order-related endpoints
 * 
 * @module validators/orderValidator
 * @version 5.1.0
 */

const { body, param, query, validationResult } = require('express-validator');

/**
 * Validation middleware runner
 * Checks validation results and returns errors if any
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg,
        value: err.value
      }))
    });
  }
  next();
};

/**
 * Validate order creation request
 * POST /api/orders
 */
exports.validateCreateOrder = [
  body('customer.name')
    .trim()
    .notEmpty().withMessage('Customer name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  
  body('customer.email')
    .trim()
    .notEmpty().withMessage('Customer email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  
  body('customer.phone')
    .trim()
    .notEmpty().withMessage('Customer phone is required')
    .isLength({ min: 10, max: 20 }).withMessage('Phone must be 10-20 characters'),
  
  body('customer.address')
    .trim()
    .notEmpty().withMessage('Customer address is required')
    .isLength({ min: 10, max: 500 }).withMessage('Address must be 10-500 characters'),
  
  body('customer.city')
    .trim()
    .notEmpty().withMessage('City is required')
    .isLength({ min: 2, max: 100 }).withMessage('City must be 2-100 characters'),
  
  body('customer.state')
    .trim()
    .notEmpty().withMessage('State is required')
    .isLength({ min: 2, max: 100 }).withMessage('State must be 2-100 characters'),
  
  body('customer.postalCode')
    .optional()
    .trim()
    .isLength({ max: 20 }).withMessage('Postal code must not exceed 20 characters'),
  
  body('items')
    .isArray({ min: 1, max: 50 }).withMessage('Items must be an array with 1-50 items'),
  
  body('items.*.product')
    .isMongoId().withMessage('Invalid product ID'),
  
  body('items.*.quantity')
    .isInt({ min: 1, max: 100 }).withMessage('Quantity must be 1-100'),
  
  body('paymentMethod')
    .trim()
    .notEmpty().withMessage('Payment method is required')
    .isIn(['bank_transfer', 'cash_on_delivery']).withMessage('Invalid payment method'),
  
  body('notes.customer')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Customer note must not exceed 500 characters'),
  
  validate
];

/**
 * Validate payment confirmation
 * POST /api/orders/:id/confirm-payment
 */
exports.validateConfirmPayment = [
  param('id')
    .isMongoId().withMessage('Invalid order ID'),
  
  body('transactionReference')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Transaction reference must not exceed 100 characters'),
  
  body('paidAmount')
    .optional()
    .isNumeric().withMessage('Paid amount must be a number')
    .isFloat({ min: 0 }).withMessage('Paid amount must be positive'),
  
  body('paymentProof')
    .optional()
    .trim()
    .isURL().withMessage('Payment proof must be a valid URL'),
  
  validate
];

/**
 * Validate order status update
 * PUT /api/orders/:id/status
 */
exports.validateUpdateOrderStatus = [
  param('id')
    .isMongoId().withMessage('Invalid order ID'),
  
  body('status')
    .optional()
    .trim()
    .isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Invalid status'),
  
  body('deliveryMethod')
    .optional()
    .trim()
    .isIn(['courier', 'local_delivery', 'pickup']).withMessage('Invalid delivery method'),
  
  body('carrier')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Carrier must not exceed 100 characters'),
  
  body('trackingNumber')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Tracking number must not exceed 100 characters'),
  
  body('trackingUrl')
    .optional()
    .trim()
    .isURL().withMessage('Tracking URL must be valid'),
  
  body('riderContact')
    .optional()
    .trim()
    .isLength({ max: 20 }).withMessage('Rider contact must not exceed 20 characters'),
  
  body('customMessage')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Custom message must not exceed 500 characters'),
  
  body('internalNote')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Internal note must not exceed 1000 characters'),
  
  validate
];

/**
 * Validate order cancellation
 * POST /api/orders/:id/cancel
 */
exports.validateCancelOrder = [
  param('id')
    .isMongoId().withMessage('Invalid order ID'),
  
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Cancellation reason must not exceed 500 characters'),
  
  validate
];

/**
 * Validate add order note
 * POST /api/orders/:id/note
 */
exports.validateAddOrderNote = [
  param('id')
    .isMongoId().withMessage('Invalid order ID'),
  
  body('note')
    .trim()
    .notEmpty().withMessage('Note is required')
    .isLength({ min: 1, max: 2000 }).withMessage('Note must be 1-2000 characters'),
  
  validate
];

/**
 * Validate order query parameters
 * GET /api/orders
 */
exports.validateGetOrders = [
  query('status')
    .optional()
    .trim()
    .isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
    .withMessage('Invalid status filter'),
  
  query('paymentStatus')
    .optional()
    .trim()
    .isIn(['pending', 'paid']).withMessage('Invalid payment status filter'),
  
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Search query must not exceed 100 characters'),
  
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100'),
  
  query('sortBy')
    .optional()
    .trim()
    .isIn(['createdAt', '-createdAt', 'total', '-total']).withMessage('Invalid sort field'),
  
  validate
];

/**
 * Validate get single order
 * GET /api/orders/:id
 */
exports.validateGetOrder = [
  param('id')
    .isMongoId().withMessage('Invalid order ID'),
  
  validate
];

