const { param, body, validationResult } = require('express-validator');

const simulatePaymentValidator = [
  param('orderId')
    .notEmpty()
    .withMessage('orderId parameter is required')
    .bail()
    .isInt({ min: 1 })
    .withMessage('orderId must be a positive integer')
    .toInt(),

  body('payment_gateway')
    .optional()
    .isString()
    .withMessage('payment_gateway must be a string'),

  body('payment_method')
    .notEmpty()
    .withMessage('payment_method is required')
    .bail()
    .isString()
    .withMessage('payment_method must be a string'),

  body('paytm_transaction_id')
    .optional()
    .isString()
    .withMessage('paytm_transaction_id must be a string'),

  body('gateway_response')
    .optional()
    .custom((value) => {
      if (value !== null && typeof value !== 'object' && typeof value !== 'string') {
        throw new Error('gateway_response must be a string or object');
      }
      return true;
    }),

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
  simulatePaymentValidator,
};
