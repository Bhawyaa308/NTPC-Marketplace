const { body, validationResult } = require('express-validator');

const VALID_CONDITIONS = ['NEW', 'LIKE_NEW', 'GOOD', 'FAIR'];
const VALID_STATUSES = ['DRAFT', 'ACTIVE', 'RESERVED', 'SOLD', 'EXPIRED'];

const createListingValidator = [
  body('category_id')
    .notEmpty()
    .withMessage('Category ID is required')
    .bail()
    .isInt({ min: 1 })
    .withMessage('Category ID must be a positive integer')
    .toInt(),

  body('township_id')
    .notEmpty()
    .withMessage('Township ID is required')
    .bail()
    .isInt({ min: 1 })
    .withMessage('Township ID must be a positive integer')
    .toInt(),

  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required'),

  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .bail()
    .isFloat({ gt: 0 })
    .withMessage('Price must be greater than 0')
    .toFloat(),

  body('condition')
    .notEmpty()
    .withMessage('Condition is required')
    .bail()
    .isIn(VALID_CONDITIONS)
    .withMessage(`Condition must be one of: ${VALID_CONDITIONS.join(', ')}`),

  body('is_negotiable')
    .optional()
    .isBoolean()
    .withMessage('is_negotiable must be a boolean')
    .toBoolean(),

  body('expires_at')
    .optional()
    .isISO8601()
    .withMessage('expires_at must be a valid ISO 8601 date'),


  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        errors: errors.array().map((error) => ({
          field: error.param,
          message: error.msg,
        })),
      });
    }
    return next();
  },
];

const updateListingValidator = [
  body('category_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Category ID must be a positive integer')
    .toInt(),

  body('township_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Township ID must be a positive integer')
    .toInt(),

  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty'),

  body('description')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Description cannot be empty'),

  body('price')
    .optional()
    .isFloat({ gt: 0 })
    .withMessage('Price must be greater than 0')
    .toFloat(),

  body('condition')
    .optional()
    .isIn(VALID_CONDITIONS)
    .withMessage(`Condition must be one of: ${VALID_CONDITIONS.join(', ')}`),

  body('is_negotiable')
    .optional()
    .isBoolean()
    .withMessage('is_negotiable must be a boolean')
    .toBoolean(),
  body('expires_at')
    .optional()
    .isISO8601()
    .withMessage('expires_at must be a valid ISO 8601 date'),


  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        errors: errors.array().map((error) => ({
          field: error.param,
          message: error.msg,
        })),
      });
    }
    return next();
  },
];

module.exports = {
  createListingValidator,
  updateListingValidator,
};
