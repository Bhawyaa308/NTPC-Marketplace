const ordersService = require('../services/orders.service');

async function createOrderFromReservation(req, res, next) {
  try {
    const order = await ordersService.createOrderFromReservation(req.user.user_id, req.params.reservationId, req.body);
    return res.status(201).json(order);
  } catch (err) {
    return next(err);
  }
}

async function getMyOrders(req, res, next) {
  try {
    const orders = await ordersService.getMyOrders(req.user.user_id);
    return res.status(200).json(orders);
  } catch (err) {
    return next(err);
  }
}

async function getOrder(req, res, next) {
  try {
    const order = await ordersService.getOrderById(req.user.user_id, req.params.id);
    return res.status(200).json(order);
  } catch (err) {
    return next(err);
  }
}

async function rateOrder(req, res, next) {
  try {
    const { id } = req.params;
    const { rating, review } = req.body;

    // Validation
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be a number between 1 and 5',
      });
    }

    const updatedOrder = await ordersService.rateOrder(
      req.user.user_id,
      id,
      rating,
      review || null
    );

    return res.status(200).json({
      success: true,
      message: 'Rating added successfully',
      data: updatedOrder,
    });
  } catch (error) {
    next(error);
  }
}

async function getSellerRatings(req, res, next) {
  try {
    const { sellerId } = req.params;
    const ratings = await ordersService.getSellerRatings(sellerId);
    return res.status(200).json({
      success: true,
      data: ratings,
    });
  } catch (error) {
    next(error);
  }
}

async function getSellerRatingSummary(req, res, next) {
  try {
    const { sellerId } = req.params;
    const summary = await ordersService.getSellerRatingSummary(sellerId);
    return res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createOrderFromReservation,
  getMyOrders,
  getOrder,
  rateOrder,
  getSellerRatings,
  getSellerRatingSummary,
};
