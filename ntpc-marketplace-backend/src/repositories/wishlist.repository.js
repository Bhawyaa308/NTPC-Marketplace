const { pool } = require('../config/db');

async function getListingById(listing_id) {
  const { rows } = await pool.query(
    `SELECT listing_id, status
     FROM listings
     WHERE listing_id = $1
     LIMIT 1`,
    [listing_id]
  );

  return rows[0];
}

async function checkIfWishlisted(user_id, listing_id) {
  const { rows } = await pool.query(
    `SELECT wishlist_id
     FROM wishlist
     WHERE user_id = $1 AND listing_id = $2
     LIMIT 1`,
    [user_id, listing_id]
  );

  return rows.length > 0;
}

async function addWishlistItem(user_id, listing_id) {
  const { rows } = await pool.query(
    `INSERT INTO wishlist (user_id, listing_id, created_at)
     VALUES ($1, $2, NOW())
     RETURNING wishlist_id, user_id, listing_id, created_at`,
    [user_id, listing_id]
  );

  return rows[0];
}

async function removeWishlistItem(user_id, listing_id) {
  await pool.query(
    `DELETE FROM wishlist
     WHERE user_id = $1 AND listing_id = $2`,
    [user_id, listing_id]
  );
}

async function getUserWishlist(user_id) {
  const { rows } = await pool.query(
    `SELECT
       w.wishlist_id,
       w.user_id,
       w.listing_id,
       w.created_at,
       l.seller_id,
       l.category_id,
       l.township_id,
       l.title,
       l.description,
       l.price,
       l.condition,
       l.is_negotiable,
       l.status,
       l.view_count,
       l.expires_at,
       l.sold_at,
       l.created_at AS listing_created_at,
       l.updated_at
     FROM wishlist w
     JOIN listings l ON l.listing_id = w.listing_id
     WHERE w.user_id = $1 AND l.status = 'ACTIVE'
     ORDER BY w.created_at DESC`,
    [user_id]
  );

  return rows;
}

module.exports = {
  getListingById,
  checkIfWishlisted,
  addWishlistItem,
  removeWishlistItem,
  getUserWishlist,
};
