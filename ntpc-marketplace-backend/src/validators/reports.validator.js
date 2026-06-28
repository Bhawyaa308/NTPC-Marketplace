const { body, validationResult } = require('express-validator');

const createReportValidator = [
  body('listing_id')
    .notEmpty()
    .withMessage('listing_id is required')
    .bail()
    .isInt({ min: 1 })
    .withMessage('listing_id must be a positive integer')
    .toInt(),

  body('reason')
    .notEmpty()
    .withMessage('reason is required')
    .bail()
    .isString()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('reason must not exceed 1000 characters'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        errors: errors.array().map((error) => ({ field: error.param, message: error.msg })),
      });
    }
    return next();
  },
];

module.exports = {
  createReportValidator,
};
