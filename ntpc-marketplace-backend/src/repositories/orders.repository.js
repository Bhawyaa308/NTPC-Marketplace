const { pool } = require('../config/db');

async function createOrderFromReservation({ reservation_id, buyer_id, seller_id, amount }) {
  const existingOrder = await pool.query(
    `SELECT order_id, reservation_id, buyer_id, seller_id, amount, status, completed_at, cancelled_at, created_at
     FROM orders
     WHERE reservation_id = $1
     LIMIT 1`,
    [reservation_id]
  );

  if (existingOrder.rows[0]) {
    return existingOrder.rows[0];
  }

  const { rows } = await pool.query(
    `INSERT INTO orders (
      reservation_id,
      buyer_id,
      seller_id,
      amount,
      status,
      created_at
    ) VALUES ($1, $2, $3, $4, $5, NOW())
    RETURNING order_id, reservation_id, buyer_id, seller_id, amount, status, completed_at, cancelled_at, created_at`,
    [reservation_id, buyer_id, seller_id, amount, 'PENDING']
  );
  return rows[0];
}

async function findOrderById(order_id) {
  const { rows } = await pool.query(
    `SELECT order_id, reservation_id, buyer_id, seller_id, amount, status, completed_at, cancelled_at, created_at
     FROM orders
     WHERE order_id = $1
     LIMIT 1`,
    [order_id]
  );
  return rows[0];
}

async function getMyOrders(user_id) {
  const { rows } = await pool.query(
    `SELECT
      o.order_id,
      o.reservation_id,
      o.buyer_id,
      o.seller_id,
      o.amount,
      o.status,
      to_char(o.created_at, 'YYYY-MM-DD') AS date,
      json_build_object(
        'title', l.title,
        'image', COALESCE(l.image_urls->>0, ''),
        'township', COALESCE(l.township_id::text, ''),
        'seller', json_build_object('name', u.name)
      ) AS listing
     FROM orders o
     JOIN reservations r ON r.reservation_id = o.reservation_id
     JOIN listings l ON l.listing_id = r.listing_id
     JOIN users u ON u.user_id = l.seller_id
     WHERE o.buyer_id = $1 OR o.seller_id = $1
     ORDER BY o.created_at DESC`,
    [user_id]
  );
  return rows;
}

async function findOrderByReservationId(reservation_id) {
  const { rows } = await pool.query(
    `SELECT order_id, reservation_id, buyer_id, seller_id, amount, status, completed_at, cancelled_at, created_at
     FROM orders
     WHERE reservation_id = $1
     LIMIT 1`,
    [reservation_id]
  );
  return rows[0];
}

async function updateOrderToPaid(order_id) {
  const { rows } = await pool.query(
    `UPDATE orders
     SET status = 'PAID', completed_at = NOW()
     WHERE order_id = $1
     RETURNING order_id, reservation_id, buyer_id, seller_id, amount, status, completed_at, cancelled_at, created_at`,
    [order_id]
  );
  return rows[0];
}

async function updateOrderWithRating(order_id, rating, review = null) {
  const { rows } = await pool.query(
    `UPDATE orders
     SET rating = $1, review = $2, rated_at = NOW()
     WHERE order_id = $3
     RETURNING order_id, reservation_id, buyer_id, seller_id, amount, status, rating, review, rated_at, completed_at, cancelled_at, created_at`,
    [rating, review, order_id]
  );
  return rows[0];
}

async function getOrderRatingsBysellerId(seller_id) {
  const { rows } = await pool.query(
    `SELECT
       order_id,
       buyer_id,
       rating,
       review,
       rated_at
     FROM orders
     WHERE seller_id = $1 AND rating IS NOT NULL
     ORDER BY rated_at DESC`,
    [seller_id]
  );
  return rows;
}

async function getOrderRatingSummaryBySellerId(seller_id) {
  const { rows } = await pool.query(
    `SELECT
       ROUND(AVG(rating)::numeric, 2) AS average_rating,
       COUNT(*) AS total_ratings
     FROM orders
     WHERE seller_id = $1 AND rating IS NOT NULL`,
    [seller_id]
  );
  return rows[0] || { average_rating: null, total_ratings: 0 };
}

module.exports = {
  createOrderFromReservation,
  findOrderById,
  getMyOrders,
  findOrderByReservationId,
  updateOrderToPaid,
  updateOrderWithRating,
  getOrderRatingsBysellerId,
  getOrderRatingSummaryBySellerId,
};
