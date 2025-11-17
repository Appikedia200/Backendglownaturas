/**
 * Product Validation Schemas
 * Express-validator middleware for product endpoints
 * @version 5.1.0
 */

const { body, param, query, validationResult } = require('express-validator');
const { ValidationError } = require('../../../shared/errors/AppError');

/**
 * Validation middleware executor
 */
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
 * Validate create product request
 */
const validateCreateProduct = [
  body('name')
    .trim()
    .notEmpty().withMessage('Product name is required')
    .isLength({ min: 3, max: 200 }).withMessage('Product name must be 3-200 characters'),
  
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 10, max: 5000 }).withMessage('Description must be 10-5000 characters'),
  
  body('price')
    .isFloat({ min: 0.01 }).withMessage('Price must be a positive number'),
  
  body('salePrice')
    .optional()
    .isFloat({ min: 0 }).withMessage('Sale price must be a positive number'),
  
  body('stock')
    .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  
  body('sku')
    .trim()
    .notEmpty().withMessage('SKU is required')
    .isLength({ min: 3, max: 50 }).withMessage('SKU must be 3-50 characters')
    .matches(/^[A-Z0-9-]+$/i).withMessage('SKU can only contain letters, numbers, and hyphens'),
  
  body('category')
    .notEmpty().withMessage('Category is required')
    .isMongoId().withMessage('Invalid category ID'),
  
  body('images')
    .optional()
    .isArray().withMessage('Images must be an array'),
  
  body('featured')
    .optional()
    .isBoolean().withMessage('Featured must be true or false'),
  
  body('status')
    .optional()
    .isIn(['draft', 'published', 'archived']).withMessage('Invalid status value'),
  
  body('trackInventory')
    .optional()
    .isBoolean().withMessage('Track inventory must be true or false'),
  
  validate
];

/**
 * Validate update product request
 */
const validateUpdateProduct = [
  param('id')
    .isMongoId().withMessage('Invalid product ID'),
  
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 }).withMessage('Product name must be 3-200 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 5000 }).withMessage('Description must be 10-5000 characters'),
  
  body('price')
    .optional()
    .isFloat({ min: 0.01 }).withMessage('Price must be a positive number'),
  
  body('salePrice')
    .optional()
    .isFloat({ min: 0 }).withMessage('Sale price must be a positive number'),
  
  body('stock')
    .optional()
    .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  
  body('category')
    .optional()
    .isMongoId().withMessage('Invalid category ID'),
  
  body('status')
    .optional()
    .isIn(['draft', 'published', 'archived']).withMessage('Invalid status value'),
  
  validate
];

/**
 * Validate get products query
 */
const validateGetProducts = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  
  query('search')
    .optional()
    .trim()
    .isLength({ max: 200 }).withMessage('Search term too long'),
  
  query('category')
    .optional()
    .isMongoId().withMessage('Invalid category ID'),
  
  query('status')
    .optional()
    .isIn(['draft', 'published', 'archived']).withMessage('Invalid status value'),
  
  query('featured')
    .optional()
    .isBoolean().withMessage('Featured must be true or false'),
  
  validate
];

/**
 * Validate product ID param
 */
const validateProductId = [
  param('id')
    .isMongoId().withMessage('Invalid product ID'),
  
  validate
];

module.exports = {
  validateCreateProduct,
  validateUpdateProduct,
  validateGetProducts,
  validateProductId,
};

