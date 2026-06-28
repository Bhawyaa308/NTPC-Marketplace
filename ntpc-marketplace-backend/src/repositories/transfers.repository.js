const { pool } = require('../config/db');

function normalizeFilter(value) {
  if (value === undefined || value === null) {
    return null;
  }

  const normalized = String(value).trim();
  if (!normalized || normalized.toLowerCase() === 'all') {
    return null;
  }

  return normalized;
}

function buildTransferFilter({ from, to }) {
  const conditions = ['t.status = $1'];
  const params = ['ACTIVE'];
  let index = 2;

  const normalizedFrom = normalizeFilter(from);
  const normalizedTo = normalizeFilter(to);

  if (normalizedFrom) {
    conditions.push(`from_township.name ILIKE $${index}`);
    params.push(`%${normalizedFrom}%`);
    index += 1;
  }

  if (normalizedTo) {
    conditions.push(`to_township.name ILIKE $${index}`);
    params.push(`%${normalizedTo}%`);
    index += 1;
  }

  return {
    whereClause: conditions.join(' AND '),
    params,
  };
}

async function getTransfersDashboard(filters = {}) {
  const { whereClause, params } = buildTransferFilter(filters);

  const statsQuery = `
    SELECT
      (
        SELECT COUNT(*)
        FROM transfers t
        JOIN townships from_township ON from_township.township_id = t.from_township_id
        JOIN townships to_township ON to_township.township_id = t.to_township_id
        WHERE ${whereClause}
      )::int AS active_transfers,
      (
        SELECT COUNT(DISTINCT l.listing_id)
        FROM listings l
        JOIN transfers t ON t.user_id = l.seller_id
        JOIN townships from_township ON from_township.township_id = t.from_township_id
        JOIN townships to_township ON to_township.township_id = t.to_township_id
        WHERE l.status = 'ACTIVE' AND ${whereClause}
      )::int AS active_transfer_listings,
      (
        SELECT COUNT(*)
        FROM (
          SELECT t.from_township_id AS township_id
          FROM transfers t
          JOIN townships from_township ON from_township.township_id = t.from_township_id
          JOIN townships to_township ON to_township.township_id = t.to_township_id
          WHERE ${whereClause}
          UNION
          SELECT t.to_township_id AS township_id
          FROM transfers t
          JOIN townships from_township ON from_township.township_id = t.from_township_id
          JOIN townships to_township ON to_township.township_id = t.to_township_id
          WHERE ${whereClause}
        ) involved_townships
      )::int AS townships_involved,
      (
        SELECT ROUND(AVG((CURRENT_DATE - t.transfer_date)::numeric), 2)
        FROM transfers t
        JOIN townships from_township ON from_township.township_id = t.from_township_id
        JOIN townships to_township ON to_township.township_id = t.to_township_id
        WHERE ${whereClause}
      )::numeric(10, 2) AS average_move_days
  `;

  const employeesQuery = `
    SELECT
      t.user_id AS id,
      u.name,
      u.designation,
      d.department_name AS department,
      from_township.name AS "from",
      to_township.name AS "to",
      t.transfer_date::date AS movingOn,
      COUNT(DISTINCT l.listing_id) AS listings
    FROM transfers t
    JOIN users u ON u.user_id = t.user_id
    LEFT JOIN departments d ON d.department_id = u.department_id
    JOIN townships from_township ON from_township.township_id = t.from_township_id
    JOIN townships to_township ON to_township.township_id = t.to_township_id
    LEFT JOIN listings l ON l.seller_id = t.user_id AND l.status = 'ACTIVE'
    WHERE ${whereClause}
    GROUP BY t.transfer_id, t.user_id, u.name, u.designation, d.department_name, from_township.name, to_township.name, t.transfer_date
    ORDER BY t.transfer_date ASC, u.name ASC
  `;

  const listingsQuery = `
    SELECT
      l.listing_id,
      l.category_id,
      l.township_id,
      l.title,
      l.description,
      l.price,
      l.condition,
      l.image_urls,
      listing_township.name AS township,
      c.name AS category,
      json_build_object(
        'user_id', u.user_id,
        'name', u.name,
        'designation', u.designation,
        'department', d.department_name
      ) AS seller
    FROM listings l
    JOIN users u ON u.user_id = l.seller_id
    JOIN transfers t ON t.user_id = l.seller_id
    LEFT JOIN departments d ON d.department_id = u.department_id
    LEFT JOIN categories c ON c.category_id = l.category_id
    JOIN townships listing_township ON listing_township.township_id = l.township_id
    JOIN townships from_township ON from_township.township_id = t.from_township_id
    JOIN townships to_township ON to_township.township_id = t.to_township_id
    WHERE l.status = 'ACTIVE' AND t.status = 'ACTIVE' AND ${whereClause}
    ORDER BY l.created_at DESC
  `;

  const insightsQuery = `
    SELECT
      (
        SELECT concat(c.from_name, ' → ', c.to_name)
        FROM (
          SELECT
            from_township.name AS from_name,
            to_township.name AS to_name,
            COUNT(*) AS corridor_count
          FROM transfers t
          JOIN townships from_township ON from_township.township_id = t.from_township_id
          JOIN townships to_township ON to_township.township_id = t.to_township_id
          WHERE ${whereClause}
          GROUP BY from_township.name, to_township.name
          ORDER BY corridor_count DESC, from_township.name, to_township.name
          LIMIT 1
        ) c
      ) AS most_active_corridor,
      (
        SELECT cat.name
        FROM listings l
        JOIN transfers t ON t.user_id = l.seller_id
        LEFT JOIN categories cat ON cat.category_id = l.category_id
        JOIN townships from_township ON from_township.township_id = t.from_township_id
        JOIN townships to_township ON to_township.township_id = t.to_township_id
        WHERE l.status = 'ACTIVE' AND ${whereClause}
        GROUP BY cat.name
        ORDER BY COUNT(*) DESC, cat.name
        LIMIT 1
      ) AS top_category,
      (
        SELECT ROUND(AVG((EXTRACT(EPOCH FROM (l.sold_at - l.created_at)) / 86400)::numeric), 2)::numeric(10, 2)
        FROM listings l
        JOIN transfers t ON t.user_id = l.seller_id
        JOIN townships from_township ON from_township.township_id = t.from_township_id
        JOIN townships to_township ON to_township.township_id = t.to_township_id
        WHERE l.status = 'SOLD' AND l.created_at IS NOT NULL AND l.sold_at IS NOT NULL AND ${whereClause}
      ) AS average_listing_close_time
  `;

  const [statsResult, employeesResult, listingsResult, insightsResult] = await Promise.all([
    pool.query(statsQuery, params),
    pool.query(employeesQuery, params),
    pool.query(listingsQuery, params),
    pool.query(insightsQuery, params),
  ]);

  const stats = statsResult.rows[0] || {};
  const insights = insightsResult.rows[0] || {};

  return {
    stats: {
      transferringEmployees: Number(stats.active_transfers || 0),
      activeTransferListings: Number(stats.active_transfer_listings || 0),
      townshipsInvolved: Number(stats.townships_involved || 0),
      averageMoveDays: stats.average_move_days === null ? null : Number(stats.average_move_days),
    },
    employees: (employeesResult.rows || []).map((employee) => ({
      id: employee.id,
      name: employee.name,
      designation: employee.designation,
      department: employee.department,
      from: employee.from,
      to: employee.to,
      movingOn: employee.movingon ? String(employee.movingon) : null,
      listings: Number(employee.listings || 0),
    })),
    listings: (listingsResult.rows || []).map((listing) => ({
      listing_id: listing.listing_id,
      id: listing.listing_id,
      category_id: listing.category_id,
      township_id: listing.township_id,
      title: listing.title,
      description: listing.description,
      price: listing.price,
      condition: listing.condition,
      image_urls: listing.image_urls || [],
      township: listing.township,
      category: listing.category,
      seller: listing.seller,
    })),
    insights: {
      mostActiveCorridor: insights.most_active_corridor || null,
      topCategory: insights.top_category || null,
      averageListingCloseTime: insights.average_listing_close_time === null ? null : Number(insights.average_listing_close_time),
    },
  };
}

module.exports = {
  getTransfersDashboard,
};
