const { pool } = require('../config/db');

async function createReservation({ listing_id, buyer_id, seller_id, expires_at }) {
  const { rows } = await pool.query(
    `INSERT INTO reservations (
      listing_id,
      buyer_id,
      seller_id,
      status,
      requested_at,
      expires_at
    ) VALUES ($1, $2, $3, $4, NOW(), $5)
    RETURNING reservation_id, listing_id, buyer_id, seller_id, status, requested_at, approved_at, seller_response_at, expires_at`,
    [listing_id, buyer_id, seller_id, 'PENDING', expires_at]
  );
  return rows[0];
}

async function findReservationById(reservation_id) {
  const { rows } = await pool.query(
    `SELECT reservation_id, listing_id, buyer_id, seller_id, status, requested_at, approved_at, seller_response_at, expires_at
     FROM reservations
     WHERE reservation_id = $1
     LIMIT 1`,
    [reservation_id]
  );
  return rows[0];
}

async function getMyReservations(user_id) {
  const { rows } = await pool.query(
    `SELECT
      r.reservation_id,
      r.listing_id,
      r.buyer_id,
      r.seller_id,
      r.status,
      r.requested_at,
      r.approved_at,
      r.seller_response_at,
      r.expires_at,
      to_char(r.requested_at, 'YYYY-MM-DD') AS date,
      json_build_object(
        'title', l.title,
        'image', COALESCE(l.image_urls->>0, ''),
        'price', l.price,
        'township', COALESCE(l.township_id::text, ''),
        'seller', json_build_object('name', u.name),
        'listing_id', l.listing_id
      ) AS listing,
      b.name AS buyer
     FROM reservations r
     JOIN listings l ON l.listing_id = r.listing_id
     JOIN users u ON u.user_id = l.seller_id
     JOIN users b ON b.user_id = r.buyer_id
     WHERE r.buyer_id = $1 OR r.seller_id = $1
     ORDER BY r.requested_at DESC`,
    [user_id]
  );
  return rows;
}

async function updateReservationApprove(reservation_id) {
  const { rows } = await pool.query(
    `UPDATE reservations
     SET status = 'APPROVED', approved_at = NOW(), seller_response_at = NOW()
     WHERE reservation_id = $1
     RETURNING reservation_id, listing_id, buyer_id, seller_id, status, requested_at, approved_at, seller_response_at, expires_at`,
    [reservation_id]
  );
  return rows[0];
}

async function rejectPendingReservationsForListing(listing_id, approved_reservation_id) {
  const { rows } = await pool.query(
    `UPDATE reservations
     SET status = 'REJECTED', seller_response_at = NOW()
     WHERE listing_id = $1
       AND status = 'PENDING'
       AND reservation_id <> $2
     RETURNING reservation_id, listing_id, buyer_id, seller_id, status, requested_at, approved_at, seller_response_at, expires_at`,
    [listing_id, approved_reservation_id]
  );
  return rows;
}

async function updateReservationReject(reservation_id) {
  const { rows } = await pool.query(
    `UPDATE reservations
     SET status = 'REJECTED', seller_response_at = NOW()
     WHERE reservation_id = $1
     RETURNING reservation_id, listing_id, buyer_id, seller_id, status, requested_at, approved_at, seller_response_at, expires_at`,
    [reservation_id]
  );
  return rows[0];
}

module.exports = {
  createReservation,
  findReservationById,
  updateReservationApprove,
  rejectPendingReservationsForListing,
  updateReservationReject,
  getMyReservations,
};
