/**
 * Category Validation Schemas
 * Express-validator middleware for category endpoints
 * @version 5.1.0
 */

const { body, param, validationResult } = require('express-validator');
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
 * Validate create category request
 */
const validateCreateCategory = [
  body('name')
    .trim()
    .notEmpty().withMessage('Category name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Category name must be 2-100 characters'),
  
  body('slug')
    .optional() // ✅ Slug is now optional - auto-generated from name if not provided
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Slug must be 2-100 characters')
    .matches(/^[a-z0-9-]+$/).withMessage('Slug can only contain lowercase letters, numbers, and hyphens'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description must not exceed 500 characters'),
  
  body('image')
    .optional()
    .isMongoId().withMessage('Image must be a valid Media ID'), // ✅ Fixed: Should be MongoId, not URL
  
  body('displayOrder')
    .optional()
    .isInt({ min: 0 }).withMessage('Display order must be a positive integer'),
  
  body('isActive')
    .optional()
    .isBoolean().withMessage('isActive must be a boolean'),
  
  body('parentCategory')
    .optional()
    .custom((value) => {
      if (value === null || value === '') return true; // Allow null/empty for root categories
      const mongoose = require('mongoose');
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Parent category must be a valid category ID');
      }
      return true;
    }),
  
  validate
];

/**
 * Validate update category request
 */
const validateUpdateCategory = [
  param('id')
    .isMongoId().withMessage('Invalid category ID'),
  
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Category name must be 2-100 characters'),
  
  body('slug')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Slug must be 2-100 characters')
    .matches(/^[a-z0-9-]+$/).withMessage('Slug can only contain lowercase letters, numbers, and hyphens'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Description must not exceed 500 characters'),
  
  body('image')
    .optional()
    .isMongoId().withMessage('Image must be a valid Media ID'),
  
  body('displayOrder')
    .optional()
    .isInt({ min: 0 }).withMessage('Display order must be a positive integer'),
  
  body('isActive')
    .optional()
    .isBoolean().withMessage('isActive must be a boolean'),
  
  body('parentCategory')
    .optional()
    .custom((value) => {
      if (value === null || value === '') return true; // Allow null/empty for root categories
      const mongoose = require('mongoose');
      if (!mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Parent category must be a valid category ID');
      }
      return true;
    }),
  
  validate
];

/**
 * Validate category ID param
 */
const validateCategoryId = [
  param('id')
    .isMongoId().withMessage('Invalid category ID'),
  
  validate
];

module.exports = {
  validateCreateCategory,
  validateUpdateCategory,
  validateCategoryId,
};

