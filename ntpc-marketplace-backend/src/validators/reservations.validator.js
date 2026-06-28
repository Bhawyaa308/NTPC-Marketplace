const { body, validationResult } = require('express-validator');

const createReservationValidator = [
  body('listing_id')
    .notEmpty()
    .withMessage('listing_id is required')
    .bail()
    .isInt({ min: 1 })
    .withMessage('listing_id must be a positive integer')
    .toInt(),

  body('expires_at')
    .optional()
    .isISO8601()
    .withMessage('expires_at must be a valid ISO8601 date'),

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
  createReservationValidator,
};
