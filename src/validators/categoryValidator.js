/**
 * Category Validation Middleware
 * 
 * @module validators/categoryValidator
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

exports.validateCreateCategory = [
  body('name')
    .trim()
    .notEmpty().withMessage('Category name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description must not exceed 500 characters'),
  
  body('displayOrder')
    .optional()
    .isInt({ min: 0 }).withMessage('Display order must be non-negative'),
  
  body('active')
    .optional()
    .isBoolean().withMessage('Active must be boolean'),
  
  validate
];

exports.validateUpdateCategory = [
  param('id')
    .isMongoId().withMessage('Invalid category ID'),
  
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description must not exceed 500 characters'),
  
  validate
];

exports.validateCategoryId = [
  param('id')
    .isMongoId().withMessage('Invalid category ID'),
  
  validate
];

