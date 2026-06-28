const { body, validationResult } = require('express-validator');

// Validation rules for user registration
const registerValidator = [
  body('employee_id')
    .trim()
    .notEmpty()
    .withMessage('Employee ID is required'),

  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required'),

  body('email')
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage('Valid email is required'),

  body('phone')
    .trim()
    .matches(/^[0-9]{10,15}$/)
    .withMessage('Phone must contain only digits and be 10 to 15 characters'),

  body('department_id')
    .notEmpty()
    .withMessage('Department ID is required')
    .bail()
    .isInt({ min: 1 })
    .withMessage('Department ID must be a positive integer')
    .toInt(),

  body('township_id')
    .notEmpty()
    .withMessage('Township ID is required')
    .bail()
    .isInt({ min: 1 })
    .withMessage('Township ID must be a positive integer')
    .toInt(),

  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),

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

const loginValidator = [
  body('email')
    .trim()
    .normalizeEmail()
    .isEmail()
    .withMessage('Valid email is required'),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),

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
  registerValidator,
  loginValidator,
};
