const paymentsService = require('../services/payments.service');

async function simulateSuccess(req, res, next) {
  try {
    const payment = await paymentsService.simulatePaymentSuccess(req.user.user_id, req.params.orderId, req.body);
    return res.status(201).json(payment);
  } catch (err) {
    return next(err);
  }
}

async function getPayment(req, res, next) {
  try {
    const payment = await paymentsService.getPaymentById(req.user.user_id, req.params.id);
    return res.status(200).json(payment);
  } catch (err) {
    return next(err);
  }
}

async function createRazorpayOrder(req, res, next) {
  try {
    const order = await paymentsService.createRazorpayOrder(req.user.user_id, Number(req.params.orderId));
    return res.status(201).json(order);
  } catch (err) {
    return next(err);
  }
}

async function handleWebhook(req, res, next) {
  try {
    await paymentsService.processRazorpayWebhook(req.rawBody, req.headers['x-razorpay-signature']);
    return res.status(200).json({ status: 'ok' });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  simulateSuccess,
  getPayment,
  createRazorpayOrder,
  handleWebhook,
};
