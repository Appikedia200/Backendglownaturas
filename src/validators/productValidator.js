/**
 * Product Validation Middleware
 * Express-validator schemas for product-related endpoints
 * 
 * @module validators/productValidator
 * @version 5.1.0
 */

const { body, param, query, validationResult } = require('express-validator');

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

/**
 * Validate product creation
 * POST /api/products
 */
exports.validateCreateProduct = [
  body('name')
    .trim()
    .notEmpty().withMessage('Product name is required')
    .isLength({ min: 3, max: 200 }).withMessage('Name must be 3-200 characters'),
  
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 10, max: 5000 }).withMessage('Description must be 10-5000 characters'),
  
  body('shortDescription')
    .trim()
    .notEmpty().withMessage('Short description is required')
    .isLength({ min: 10, max: 500 }).withMessage('Short description must be 10-500 characters'),
  
  body('price')
    .isNumeric().withMessage('Price must be a number')
    .isFloat({ min: 0, max: 10000000 }).withMessage('Price must be between 0 and 10,000,000'),
  
  body('comparePrice')
    .optional()
    .isNumeric().withMessage('Compare price must be a number')
    .isFloat({ min: 0 }).withMessage('Compare price must be positive'),
  
  body('costPrice')
    .optional()
    .isNumeric().withMessage('Cost price must be a number')
    .isFloat({ min: 0 }).withMessage('Cost price must be positive'),
  
  body('stock')
    .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  
  body('category')
    .isMongoId().withMessage('Invalid category ID'),
  
  body('brand')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Brand must not exceed 100 characters'),
  
  body('ingredients')
    .optional()
    .isArray({ max: 100 }).withMessage('Ingredients must be an array with max 100 items'),
  
  body('ingredients.*')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Each ingredient must not exceed 200 characters'),
  
  body('concerns')
    .optional()
    .isArray({ max: 20 }).withMessage('Concerns must be an array with max 20 items'),
  
  body('skinType')
    .optional()
    .isArray({ max: 10 }).withMessage('Skin types must be an array with max 10 items'),
  
  body('featured')
    .optional()
    .isBoolean().withMessage('Featured must be boolean'),
  
  body('status')
    .optional()
    .isIn(['active', 'draft', 'archived']).withMessage('Invalid status'),
  
  validate
];

/**
 * Validate product update
 * PUT /api/products/:id
 */
exports.validateUpdateProduct = [
  param('id')
    .isMongoId().withMessage('Invalid product ID'),
  
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 }).withMessage('Name must be 3-200 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 5000 }).withMessage('Description must be 10-5000 characters'),
  
  body('price')
    .optional()
    .isFloat({ min: 0 }).withMessage('Price must be positive'),
  
  body('stock')
    .optional()
    .isInt({ min: 0 }).withMessage('Stock must be non-negative'),
  
  body('category')
    .optional()
    .isMongoId().withMessage('Invalid category ID'),
  
  validate
];

/**
 * Validate get products query
 * GET /api/products
 */
exports.validateGetProducts = [
  query('category')
    .optional()
    .isMongoId().withMessage('Invalid category ID'),
  
  query('status')
    .optional()
    .isIn(['active', 'draft', 'archived']).withMessage('Invalid status'),
  
  query('featured')
    .optional()
    .isBoolean().withMessage('Featured must be boolean'),
  
  query('minPrice')
    .optional()
    .isFloat({ min: 0 }).withMessage('Min price must be positive'),
  
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 }).withMessage('Max price must be positive'),
  
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be positive'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100'),
  
  validate
];

/**
 * Validate get/delete single product
 * GET/DELETE /api/products/:id
 */
exports.validateProductId = [
  param('id')
    .isMongoId().withMessage('Invalid product ID'),
  
  validate
];

