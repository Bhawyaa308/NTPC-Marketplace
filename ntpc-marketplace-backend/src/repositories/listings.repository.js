const { pool } = require('../config/db');

function normalizeImageUrls(imageUrls) {
  if (!Array.isArray(imageUrls)) {
    return [];
  }

  return imageUrls
    .filter(Boolean)
    .map((url) => {
      if (typeof url !== 'string') {
        return '';
      }

      const trimmed = url.trim();
      if (!trimmed) {
        return '';
      }

      if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('data:')) {
        return trimmed;
      }

      return `http://localhost:3000${trimmed.startsWith('/') ? '' : '/'}${trimmed}`;
    })
    .filter(Boolean);
}

async function createListing({
  seller_id,
  category_id,
  township_id,
  title,
  description,
  price,
  condition,
  is_negotiable,
  status,
  view_count,
  expires_at,
  sold_at,
}) {
  const { rows } = await pool.query(
    `INSERT INTO listings (
      seller_id,
      category_id,
      township_id,
      title,
      description,
      price,
      condition,
      is_negotiable,
      status,
      view_count,
      expires_at,
      sold_at,
      created_at,
      updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
    RETURNING
      listing_id,
      seller_id,
      category_id,
      township_id,
      title,
      description,
      price,
      condition,
      is_negotiable,
      status,
      view_count,
      expires_at,
      sold_at,
      created_at,
      updated_at`,
    [
      seller_id,
      category_id,
      township_id,
      title,
      description,
      price,
      condition,
      is_negotiable,
      status,
      view_count,
      expires_at,
      sold_at,
    ]
  );

  return rows[0];
}

async function getListings(page, limit) {
  const offset = (page - 1) * limit;

  const totalResult = await pool.query(
    `SELECT COUNT(*) AS total
     FROM listings`
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
      l.image_urls,
      l.expires_at,
      l.sold_at,
      l.created_at,
      l.updated_at,
      jsonb_build_object(
        'category_id', c.category_id,
        'name', c.name
      ) AS category,
      jsonb_build_object(
        'township_id', t.township_id,
        'name', t.name
      ) AS township
    FROM listings l
    LEFT JOIN categories c ON c.category_id = l.category_id
    LEFT JOIN townships t ON t.township_id = l.township_id
    ORDER BY l.created_at DESC
    LIMIT $1 OFFSET $2`,
    [limit, offset]
  );

  return {
    data: rows.map((row) => ({
      ...row,
      image_urls: normalizeImageUrls(row.image_urls),
      category: row.category || { category_id: row.category_id, name: null },
      township: row.township || { township_id: row.township_id, name: null },
    })),
    total: Number(totalResult.rows[0].total),
  };
}

async function findListingById(listing_id) {
  const { rows } = await pool.query(
    `SELECT
      listing_id,
      seller_id,
      category_id,
      township_id,
      title,
      description,
      price,
      condition,
      is_negotiable,
      status,
      view_count,
      expires_at,
      sold_at,
      created_at,
      image_urls,
      updated_at
    FROM listings
    WHERE listing_id = $1
    LIMIT 1`,
    [listing_id]
  );
  return rows[0];
}

async function incrementViewCount(listing_id) {
  // 1. Increment view count
  await pool.query(
    `
    UPDATE listings
    SET view_count = view_count + 1,
        updated_at = NOW()
    WHERE listing_id = $1
    `,
    [listing_id]
  );

  // 2. Fetch updated listing
  const { rows } = await pool.query(
    `
    SELECT
        l.listing_id,
        l.title,
        l.description,
        l.price,
        l.condition,
        l.image_urls,
        l.view_count,
        l.status,
        l.created_at,
        l.updated_at,

        c.name AS category,

        t.name AS township,

        json_build_object(
            'user_id', u.user_id,
            'name', u.name,
            'designation', u.designation,
            'department', d.department_name
        ) AS seller

    FROM listings l

    JOIN users u
      ON u.user_id = l.seller_id

    LEFT JOIN departments d
      ON d.department_id = u.department_id

    LEFT JOIN townships t
      ON t.township_id = l.township_id

    LEFT JOIN categories c
      ON c.category_id = l.category_id

    WHERE l.listing_id = $1
    `,
    [listing_id]
  );

  return rows[0];
}

async function updateListingById(listing_id, fields) {
  const keys = Object.keys(fields);
  const values = Object.values(fields);

  const setClause = keys
    .map((key, index) => `${key} = $${index + 1}`)
    .join(', ');

  if (!setClause) {
    return findListingById(listing_id);
  }

  const { rows } = await pool.query(
    `UPDATE listings
    SET ${setClause}, updated_at = NOW()
    WHERE listing_id = $${keys.length + 1}
    RETURNING
      listing_id,
      seller_id,
      category_id,
      township_id,
      title,
      description,
      price,
      condition,
      is_negotiable,
      status,
      view_count,
      expires_at,
      sold_at,
      created_at,
      updated_at`,
    [...values, listing_id]
  );

  return rows[0];
}

async function expireListing(listing_id) {
  const { rows } = await pool.query(
    `UPDATE listings
    SET status = 'EXPIRED', updated_at = NOW()
    WHERE listing_id = $1
    RETURNING
      listing_id,
      seller_id,
      category_id,
      township_id,
      title,
      description,
      price,
      condition,
      is_negotiable,
      status,
      view_count,
      expires_at,
      sold_at,
      created_at,
      updated_at`,
    [listing_id]
  );

  return rows[0];
}

async function updateListingToSold(listing_id) {
  const { rows } = await pool.query(
    `UPDATE listings
    SET status = 'SOLD', sold_at = NOW(), updated_at = NOW()
    WHERE listing_id = $1
    RETURNING
      listing_id,
      seller_id,
      category_id,
      township_id,
      title,
      description,
      price,
      condition,
      is_negotiable,
      status,
      view_count,
      expires_at,
      sold_at,
      created_at,
      updated_at`,
    [listing_id]
  );

  return rows[0];
}

async function addListingImages(listing_id, imageUrls) {
  const { rows } = await pool.query(
    `UPDATE listings
     SET image_urls = COALESCE(image_urls, '[]'::jsonb) || $2::jsonb
     WHERE listing_id = $1
     RETURNING listing_id, seller_id, category_id, township_id, title, description, price, condition, is_negotiable, status, view_count, image_urls, expires_at, sold_at, created_at, updated_at`,
    [listing_id, JSON.stringify(imageUrls)]
  );

  return rows[0] ? {
    ...rows[0],
    image_urls: normalizeImageUrls(rows[0].image_urls),
  } : null;
}

async function removeListingImage(listing_id, imageUrl) {
  const { rows } = await pool.query(
    `UPDATE listings
     SET image_urls = COALESCE(image_urls, '[]'::jsonb) - $2::text
     WHERE listing_id = $1
     RETURNING listing_id, seller_id, category_id, township_id, title, description, price, condition, is_negotiable, status, view_count, image_urls, expires_at, sold_at, created_at, updated_at`,
    [listing_id, imageUrl]
  );

  return rows[0] ? {
    ...rows[0],
    image_urls: normalizeImageUrls(rows[0].image_urls),
  } : null;
}

async function getListingImages(listing_id) {
  const { rows } = await pool.query(
    `SELECT image_urls FROM listings WHERE listing_id = $1`,
    [listing_id]
  );
  return normalizeImageUrls(rows[0]?.image_urls || []);
}

module.exports = {
  createListing,
  getListings,
  findListingById,
  incrementViewCount,
  updateListingById,
  expireListing,
  updateListingToSold,
  addListingImages,
  removeListingImage,
  getListingImages,
};
