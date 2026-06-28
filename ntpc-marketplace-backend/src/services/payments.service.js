const Razorpay = require('razorpay');
const paymentsRepository = require('../repositories/payments.repository');
const ordersRepository = require('../repositories/orders.repository');
const listingsRepository = require('../repositories/listings.repository');
const { createNotification } = require('../utils/notificationHelper');

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;

const razorpayClient = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_KEY_SECRET,
});

function createError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

async function simulatePaymentSuccess(user_id, order_id, { payment_gateway = 'SIMULATED', paytm_transaction_id = null, amount = null, payment_method = 'UNKNOWN', gateway_response = null }) {
  const order = await ordersRepository.findOrderById(order_id);
  if (!order) throw createError(404, 'Order not found');
  if (order.buyer_id !== user_id) throw createError(403, 'Only the buyer may initiate payment');
  if (order.status === 'PAID') throw createError(400, 'Payment already processed for this order');
  if (order.status !== 'PENDING') throw createError(400, 'Order is not payable');

  // ensure one payment per order
  const existingPayment = await paymentsRepository.findPaymentByOrderId(order_id);
  if (existingPayment) throw createError(400, 'Payment already exists for this order');

  // create payment record with SUCCESS
  const payment = await paymentsRepository.createPayment({
    order_id,
    payment_gateway,
    paytm_transaction_id,
    amount: order.amount,
    payment_method,
    status: 'SUCCESS',
    gateway_response: gateway_response || {
      provider: "SIMULATED",
      status: "SUCCESS",
      order_id: order_id,
      timestamp: new Date().toISOString()
    },
  });

  // mark order as PAID with completed_at
  const updatedOrder = await ordersRepository.updateOrderToPaid(order_id);

  // mark listing as SOLD and set sold_at using database timestamp
  const reservationId = updatedOrder.reservation_id;
  if (reservationId) {
    const reservationsRepo = require('../repositories/reservations.repository');
    const reservation = await reservationsRepo.findReservationById(reservationId);
    if (reservation) {
      await listingsRepository.updateListingToSold(reservation.listing_id);
      await reservationsRepo.rejectPendingReservationsForListing(reservation.listing_id, reservationId);
    }
  }

  // Notify buyer of successful payment
  await createNotification({
    user_id: order.buyer_id,
    title: 'Payment Successful',
    message: 'Your payment has been processed successfully',
    type: 'PAYMENT_SUCCESS',
    related_entity_type: 'ORDER',
    related_entity_id: order_id,
  });

  // Notify seller of successful payment
  await createNotification({
    user_id: order.seller_id,
    title: 'Payment Received',
    message: 'Payment received for your listing',
    type: 'PAYMENT_SUCCESS',
    related_entity_type: 'ORDER',
    related_entity_id: order_id,
  });

  const auditService = require('./audit.service');
  await auditService.logEvent({
    user_id: order.buyer_id,
    action: 'PAYMENT_SUCCESS',
    entity_type: 'ORDER',
    entity_id: order_id,
  });

  return updatedOrder;
}

async function handleSuccessfulPayment(order, paymentPayload) {
  const existingPayment = await paymentsRepository.findPaymentByOrderId(order.order_id);
  if (existingPayment && existingPayment.status === 'SUCCESS') {
    return existingPayment;
  }

  const payment = await paymentsRepository.createPayment({
    order_id: order.order_id,
    payment_gateway: paymentPayload.payment_gateway,
    paytm_transaction_id: paymentPayload.paytm_transaction_id,
    amount: order.amount,
    payment_method: paymentPayload.payment_method,
    status: 'SUCCESS',
    gateway_response: paymentPayload.gateway_response,
  });

  const updatedOrder = await ordersRepository.updateOrderToPaid(order.order_id);

  const reservationId = updatedOrder.reservation_id;
  if (reservationId) {
    const reservationsRepo = require('../repositories/reservations.repository');
    const reservation = await reservationsRepo.findReservationById(reservationId);
    if (reservation) {
      await listingsRepository.updateListingToSold(reservation.listing_id);
      await reservationsRepo.rejectPendingReservationsForListing(reservation.listing_id, reservationId);
    }
  }

  await createNotification({
    user_id: order.buyer_id,
    title: 'Payment Successful',
    message: 'Your payment has been processed successfully',
    type: 'PAYMENT_SUCCESS',
    related_entity_type: 'ORDER',
    related_entity_id: order.order_id,
  });

  await createNotification({
    user_id: order.seller_id,
    title: 'Payment Received',
    message: 'Payment received for your listing',
    type: 'PAYMENT_SUCCESS',
    related_entity_type: 'ORDER',
    related_entity_id: order.order_id,
  });

  const auditService = require('./audit.service');
  await auditService.logEvent({
    user_id: order.buyer_id,
    action: 'PAYMENT_SUCCESS',
    entity_type: 'ORDER',
    entity_id: order.order_id,
  });

  return updatedOrder;
}

async function createRazorpayOrder(user_id, order_id) {
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    throw createError(500, 'Razorpay configuration is missing');
  }

  const order = await ordersRepository.findOrderById(order_id);
  if (!order) throw createError(404, 'Order not found');
  if (order.buyer_id !== user_id) throw createError(403, 'Only the buyer may create a payment order');
  if (order.status !== 'PENDING') throw createError(400, 'Order is not payable');

  const razorpayOrder = await razorpayClient.orders.create({
    amount: Math.round(order.amount * 100),
    currency: 'INR',
    receipt: String(order.order_id),
    notes: {
      order_id: String(order.order_id),
    },
  });

  return razorpayOrder;
}

async function processRazorpayWebhook(rawBody, signature) {
  if (!RAZORPAY_WEBHOOK_SECRET) {
    throw createError(500, 'Razorpay webhook configuration is missing');
  }

  if (!signature) {
    throw createError(400, 'Missing Razorpay webhook signature');
  }

  const payload = rawBody instanceof Buffer ? rawBody.toString('utf8') : rawBody;
  razorpayClient.validateWebhookSignature(payload, signature, RAZORPAY_WEBHOOK_SECRET);

  const event = JSON.parse(payload);
  if (event.event !== 'payment.captured') {
    return;
  }

  const paymentEntity = event.payload?.payment?.entity;
  if (!paymentEntity) {
    throw createError(400, 'Invalid Razorpay webhook payload');
  }

  const orderId = paymentEntity.notes?.order_id;
  if (!orderId) {
    throw createError(400, 'Order ID is required in Razorpay payment notes');
  }

  const order = await ordersRepository.findOrderById(Number(orderId));
  if (!order) throw createError(404, 'Order not found');
  if (order.status === 'PAID') {
    return;
  }
  if (order.status !== 'PENDING') {
    throw createError(400, 'Order is not payable');
  }

  await handleSuccessfulPayment(order, {
    payment_gateway: 'RAZORPAY',
    paytm_transaction_id: paymentEntity.id,
    payment_method: paymentEntity.method || 'RAZORPAY',
    gateway_response: paymentEntity,
  }, {
    webhook_received_at: true,
  });
}

async function getPaymentById(user_id, payment_id) {
  const payment = await paymentsRepository.findPaymentById(payment_id);
  if (!payment) throw createError(404, 'Payment not found');

  // ensure user is involved in the order
  const order = await ordersRepository.findOrderById(payment.order_id);
  if (!order) throw createError(404, 'Order not found');
  if (order.buyer_id !== user_id && order.seller_id !== user_id) throw createError(403, 'Not authorized');

  return payment;
}

module.exports = {
  simulatePaymentSuccess,
  getPaymentById,
  createRazorpayOrder,
  processRazorpayWebhook,
};
