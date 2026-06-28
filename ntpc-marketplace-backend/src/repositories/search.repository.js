const { pool } = require('../config/db');

async function getSearchSuggestions(query) {
  const exactQuery = query;
  const wildcardQuery = `%${query}%`;

  const { rows } = await pool.query(
    `SELECT suggestion
     FROM (
       SELECT title AS suggestion
       FROM listings
       WHERE title ILIKE $1

       UNION

       SELECT categories.name AS suggestion
       FROM categories
       WHERE categories.name ILIKE $1
     ) AS candidates
     GROUP BY suggestion
     ORDER BY
       CASE WHEN LOWER(suggestion) = LOWER($2) THEN 0 ELSE 1 END,
       suggestion
     LIMIT 10`,
    [wildcardQuery, exactQuery]
  );

  return rows.map((row) => row.suggestion);
}

async function searchActiveListings(query, page, limit) {
  const wildcardQuery = `%${query}%`;
  const offset = (page - 1) * limit;

  const totalResult = await pool.query(
    `SELECT COUNT(*) AS total
     FROM listings l
     LEFT JOIN categories c ON c.category_id = l.category_id
     WHERE l.status = 'ACTIVE'
       AND (
         l.title ILIKE $1
         OR c.name ILIKE $1
       )`,
    [wildcardQuery]
  );

  const { rows } = await pool.query(
    `SELECT
       l.listing_id,
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
       l.created_at,
       l.updated_at
     FROM listings l
     LEFT JOIN categories c ON c.category_id = l.category_id
     WHERE l.status = 'ACTIVE'
       AND (
         l.title ILIKE $1
         OR c.name ILIKE $1
       )
     ORDER BY l.created_at DESC
     LIMIT $2 OFFSET $3`,
    [wildcardQuery, limit, offset]
  );

  return {
    data: rows,
    total: Number(totalResult.rows[0].total),
  };
}

module.exports = {
  getSearchSuggestions,
  searchActiveListings,
};
