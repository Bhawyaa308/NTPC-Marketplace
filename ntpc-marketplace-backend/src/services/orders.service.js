const reservationsRepository = require('../repositories/reservations.repository');
const ordersRepository = require('../repositories/orders.repository');
const { createNotification } = require('../utils/notificationHelper');

function createError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

async function createOrderFromReservation(buyer_id, reservation_id, payload) {
  const reservation = await reservationsRepository.findReservationById(reservation_id);
  if (!reservation) throw createError(404, 'Reservation not found');
  if (reservation.buyer_id !== buyer_id) throw createError(403, 'Not authorized');
  if (reservation.status !== 'APPROVED') throw createError(400, 'Reservation is not approved');

  // ensure one order per reservation
  const existingOrder = await ordersRepository.findOrderByReservationId(reservation_id);
  if (existingOrder) throw createError(400, 'Order already exists for this reservation');

  const listing = await require('../repositories/listings.repository').findListingById(reservation.listing_id);
  if (!listing) throw createError(404, 'Listing not found');

  const order = await ordersRepository.createOrderFromReservation({
    reservation_id,
    buyer_id: reservation.buyer_id,
    seller_id: reservation.seller_id,
    amount: listing.price,
  });

  // Notify seller of new order
  await createNotification({
    user_id: reservation.seller_id,
    title: 'New Order',
    message: `A buyer has placed an order for your listing: ${listing.title}`,
    type: 'ORDER',
    related_entity_type: 'ORDER',
    related_entity_id: order.order_id,
  });

  const auditService = require('./audit.service');
  await auditService.logEvent({
    user_id: reservation.buyer_id,
    action: 'ORDER_CREATED',
    entity_type: 'ORDER',
    entity_id: order.order_id,
  });

  return order;
}

async function getOrderById(user_id, order_id) {
  const order = await ordersRepository.findOrderById(order_id);
  if (!order) throw createError(404, 'Order not found');
  if (order.buyer_id !== user_id && order.seller_id !== user_id) throw createError(403, 'Not authorized');
  return order;
}

async function getMyOrders(user_id) {
  return ordersRepository.getMyOrders(user_id);
}

async function rateOrder(buyer_id, order_id, rating, review = null) {
  // Validate order exists and belongs to buyer
  const order = await ordersRepository.findOrderById(order_id);
  if (!order) {
    throw createError(404, 'Order not found');
  }

  if (order.buyer_id !== buyer_id) {
    throw createError(403, 'You can only rate your own orders');
  }

  // Validate order is PAID
  if (order.status !== 'PAID') {
    throw createError(400, 'Order must be in PAID status to be rated');
  }

  // Check if already rated
  if (order.rating !== null) {
    throw createError(400, 'This order has already been rated');
  }

  // Validate rating value
  if (!rating || rating < 1 || rating > 5) {
    throw createError(400, 'Rating must be between 1 and 5');
  }

  // Update order with rating
  const updatedOrder = await ordersRepository.updateOrderWithRating(order_id, rating, review || null);

  return updatedOrder;
}

async function getSellerRatings(seller_id) {
  if (!seller_id || isNaN(seller_id)) {
    throw createError(400, 'Valid seller ID is required');
  }

  return ordersRepository.getOrderRatingsBysellerId(seller_id);
}

async function getSellerRatingSummary(seller_id) {
  if (!seller_id || isNaN(seller_id)) {
    throw createError(400, 'Valid seller ID is required');
  }

  return ordersRepository.getOrderRatingSummaryBySellerId(seller_id);
}

module.exports = {
  createOrderFromReservation,
  getOrderById,
  getMyOrders,
  rateOrder,
  getSellerRatings,
  getSellerRatingSummary,
};
