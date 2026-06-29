const { pool } = require('../config/db');

async function getAllUsers() {
  const { rows } = await pool.query(
    `SELECT
       u.user_id,
       u.employee_id,
       u.email,
      u.name,
      u.phone,
      u.department_id,
      d.department_name AS department_name,
      d.department_name AS department,
      u.designation,
      u.township_id,
      t.name AS township_name,
      t.name AS township,
      u.role_id,
       CASE
         WHEN UPPER(u.role_id::text) IN ('3', 'SUPER_ADMIN', 'SUPERADMIN') THEN 'SUPER_ADMIN'
         WHEN UPPER(u.role_id::text) IN ('2', 'ADMIN') THEN 'ADMIN'
         ELSE 'USER'
       END AS role,
       u.email_verified,
       u.last_login,
       u.is_active,
       u.deleted_at,
       u.created_at
     FROM users u
     LEFT JOIN departments d ON d.department_id = u.department_id
     LEFT JOIN townships t ON t.township_id = u.township_id
     ORDER BY u.created_at DESC, u.user_id DESC`);
  return rows;
}

async function updateUserActive(user_id, is_active) {
  const { rows } = await pool.query(
    `WITH updated AS (
       UPDATE users
       SET is_active = $1
       WHERE user_id = $2
       RETURNING
         user_id,
         employee_id,
         email,
         name,
         phone,
         department_id,
         designation,
         township_id,
         role_id,
         email_verified,
         last_login,
         is_active,
         deleted_at,
         created_at
     )
     SELECT
       u.user_id,
       u.employee_id,
       u.email,
      u.name,
      u.phone,
      u.department_id,
      d.department_name AS department_name,
      d.department_name AS department,
      u.designation,
      u.township_id,
      t.name AS township_name,
      t.name AS township,
      u.role_id,
       CASE
         WHEN UPPER(u.role_id::text) IN ('3', 'SUPER_ADMIN', 'SUPERADMIN') THEN 'SUPER_ADMIN'
         WHEN UPPER(u.role_id::text) IN ('2', 'ADMIN') THEN 'ADMIN'
         ELSE 'USER'
       END AS role,
       u.email_verified,
       u.last_login,
       u.is_active,
       u.deleted_at,
       u.created_at
     FROM updated u
     LEFT JOIN departments d ON d.department_id = u.department_id
     LEFT JOIN townships t ON t.township_id = u.township_id`,
    [is_active, user_id]);
  return rows[0];
}

async function getDashboardSummary() {
  const { rows } = await pool.query(
    `SELECT
       (SELECT COUNT(*)::int FROM users) AS total_users,
       (SELECT COUNT(*)::int FROM listings) AS total_listings,
       (SELECT COUNT(*)::int FROM listings WHERE UPPER(status::text) = 'ACTIVE') AS active_listings,
       (SELECT COUNT(*)::int FROM listings WHERE UPPER(status::text) = 'RESERVED') AS reserved_listings,
       (SELECT COUNT(*)::int FROM listings WHERE UPPER(status::text) = 'SOLD') AS sold_listings,
       (SELECT COUNT(*)::int FROM reservations WHERE UPPER(status::text) = 'PENDING') AS pending_reservations,
       (SELECT COUNT(*)::int FROM orders WHERE UPPER(status::text) = 'PENDING') AS pending_orders,
       (SELECT COUNT(*)::int FROM orders WHERE UPPER(status::text) = 'PAID') AS paid_orders,
       (SELECT COUNT(*)::int FROM listing_reports) AS total_reports,
       (SELECT COUNT(*)::int FROM listing_reports WHERE UPPER(status::text) = 'OPEN') AS open_reports,
       (SELECT COUNT(*)::int FROM notifications) AS total_notifications`
  );

  const activity = await pool.query(
    `(SELECT
        'LISTING' AS type,
        l.listing_id::text AS entity_id,
        u.name AS actor,
        'created listing "' || l.title || '"' AS description,
        l.created_at
      FROM listings l
      LEFT JOIN users u ON u.user_id = l.seller_id)
     UNION ALL
     (SELECT
        'ORDER' AS type,
        o.order_id::text AS entity_id,
        COALESCE(b.name, s.name) AS actor,
        'order #' || o.order_id || ' is ' || LOWER(o.status::text) AS description,
        o.created_at
      FROM orders o
      LEFT JOIN users b ON b.user_id = o.buyer_id
      LEFT JOIN users s ON s.user_id = o.seller_id)
     UNION ALL
     (SELECT
        'REPORT' AS type,
        lr.report_id::text AS entity_id,
        u.name AS actor,
        'reported listing #' || lr.listing_id || ': ' || lr.reason AS description,
        lr.created_at
      FROM listing_reports lr
      LEFT JOIN users u ON u.user_id = lr.reported_by)
     ORDER BY created_at DESC
     LIMIT 8`
  );

  return {
    ...rows[0],
    recent_activity: activity.rows,
  };
}

async function getAllReports() {
  const { rows } = await pool.query(
    `SELECT
       report_id,
       listing_id,
       reported_by,
       reviewed_by,
       reason,
       status,
       created_at,
       resolved_at
     FROM listing_reports
     ORDER BY report_id`);
  return rows;
}

async function updateReportStatus(report_id, status, admin_user_id) {
  const { rows } = await pool.query(
    `UPDATE listing_reports
     SET status = $1,
         reviewed_by = $2,
         resolved_at = NOW()
     WHERE report_id = $3
     RETURNING report_id, listing_id, reported_by, reviewed_by, reason, status, created_at, resolved_at`,
    [status, admin_user_id, report_id]);
  return rows[0];
}

module.exports = {
  getAllUsers,
  updateUserActive,
  getDashboardSummary,
  getAllReports,
  updateReportStatus,
};
