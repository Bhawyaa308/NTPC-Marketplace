const { pool } = require('../config/db');

async function columnExists(tableName, columnName) {
  const { rows } = await pool.query(
    `SELECT 1
     FROM information_schema.columns
     WHERE table_schema = 'public'
       AND table_name = $1
       AND column_name = $2
     LIMIT 1`,
    [tableName, columnName]
  );
  return Boolean(rows[0]);
}

async function getDashboardSummary() {
  const { rows } = await pool.query(
    `SELECT
       (SELECT COUNT(*)::int FROM users) AS total_users,
       (SELECT COUNT(*)::int FROM users WHERE UPPER(role_id::text) IN ('2', 'ADMIN')) AS total_admins,
       (SELECT COUNT(*)::int FROM users WHERE UPPER(role_id::text) NOT IN ('2', '3', 'ADMIN', 'SUPER_ADMIN', 'SUPERADMIN')) AS total_employees,
       (SELECT COUNT(*)::int FROM departments) AS total_departments,
       (SELECT COUNT(*)::int FROM townships) AS total_townships,
       (SELECT COUNT(*)::int FROM listings) AS total_listings,
       (SELECT COUNT(*)::int FROM listings WHERE UPPER(status::text) = 'ACTIVE') AS active_listings,
       (SELECT COUNT(*)::int FROM listings WHERE UPPER(status::text) = 'RESERVED') AS reserved_listings,
       (SELECT COUNT(*)::int FROM listings WHERE UPPER(status::text) = 'SOLD') AS sold_listings,
       (SELECT COUNT(*)::int FROM listing_reports) AS total_reports,
       (SELECT COUNT(*)::int FROM listing_reports WHERE UPPER(status::text) = 'OPEN') AS open_reports,
       (SELECT COUNT(*)::int FROM orders WHERE UPPER(status::text) = 'PENDING') AS pending_orders,
       (SELECT COUNT(*)::int FROM orders WHERE UPPER(status::text) = 'PAID') AS paid_orders`
  );

  const activity = await pool.query(
    `(SELECT
        'USER' AS type,
        u.user_id::text AS entity_id,
        u.name AS actor,
        'joined the platform' AS description,
        u.created_at
      FROM users u)
     UNION ALL
     (SELECT
        'LISTING' AS type,
        l.listing_id::text AS entity_id,
        u.name AS actor,
        'created listing "' || l.title || '"' AS description,
        l.created_at
      FROM listings l
      LEFT JOIN users u ON u.user_id = l.seller_id)
     UNION ALL
     (SELECT
        'REPORT' AS type,
        lr.report_id::text AS entity_id,
        u.name AS actor,
        'reported listing #' || lr.listing_id || ': ' || lr.reason AS description,
        lr.created_at
      FROM listing_reports lr
      LEFT JOIN users u ON u.user_id = lr.reported_by)
     ORDER BY created_at DESC NULLS LAST
     LIMIT 8`
  );

  return {
    ...rows[0],
    recent_activity: activity.rows,
  };
}

async function getAnalytics() {
  const [
    listingsByCategory,
    listingsByStatus,
    monthlyListings,
    monthlyOrders,
    monthlyPayments,
    reportsByStatus,
    userGrowth,
    townshipDistribution,
    departmentDistribution,
  ] = await Promise.all([
    pool.query(
      `SELECT COALESCE(c.name, 'Uncategorized') AS label, COUNT(l.listing_id)::int AS value
       FROM listings l
       LEFT JOIN categories c ON c.category_id = l.category_id
       GROUP BY COALESCE(c.name, 'Uncategorized')
       ORDER BY value DESC, label ASC`
    ),
    pool.query(
      `SELECT COALESCE(status::text, 'UNKNOWN') AS label, COUNT(*)::int AS value
       FROM listings
       GROUP BY COALESCE(status::text, 'UNKNOWN')
       ORDER BY value DESC, label ASC`
    ),
    pool.query(
      `WITH months AS (
         SELECT generate_series(
           date_trunc('month', NOW()) - interval '11 months',
           date_trunc('month', NOW()),
           interval '1 month'
         ) AS month
       )
       SELECT to_char(months.month, 'Mon') AS label, COUNT(l.listing_id)::int AS value
       FROM months
       LEFT JOIN listings l
         ON date_trunc('month', l.created_at) = months.month
       GROUP BY months.month
       ORDER BY months.month`
    ),
    pool.query(
      `WITH months AS (
         SELECT generate_series(
           date_trunc('month', NOW()) - interval '11 months',
           date_trunc('month', NOW()),
           interval '1 month'
         ) AS month
       )
       SELECT to_char(months.month, 'Mon') AS label, COUNT(o.order_id)::int AS value
       FROM months
       LEFT JOIN orders o
         ON date_trunc('month', o.created_at) = months.month
       GROUP BY months.month
       ORDER BY months.month`
    ),
    pool.query(
      `WITH months AS (
         SELECT generate_series(
           date_trunc('month', NOW()) - interval '11 months',
           date_trunc('month', NOW()),
           interval '1 month'
         ) AS month
       )
       SELECT to_char(months.month, 'Mon') AS label, COALESCE(SUM(p.amount), 0)::numeric AS value
       FROM months
       LEFT JOIN payments p
         ON date_trunc('month', COALESCE(p.payment_date, p.created_at)) = months.month
       GROUP BY months.month
       ORDER BY months.month`
    ),
    pool.query(
      `SELECT COALESCE(status::text, 'UNKNOWN') AS label, COUNT(*)::int AS value
       FROM listing_reports
       GROUP BY COALESCE(status::text, 'UNKNOWN')
       ORDER BY value DESC, label ASC`
    ),
    pool.query(
      `WITH months AS (
         SELECT generate_series(
           date_trunc('month', NOW()) - interval '11 months',
           date_trunc('month', NOW()),
           interval '1 month'
         ) AS month
       )
       SELECT to_char(months.month, 'Mon') AS label, COUNT(u.user_id)::int AS value
       FROM months
       LEFT JOIN users u
         ON date_trunc('month', u.created_at) = months.month
       GROUP BY months.month
       ORDER BY months.month`
    ),
    pool.query(
      `SELECT COALESCE(t.name, 'Unassigned') AS label, COUNT(u.user_id)::int AS value
       FROM users u
       LEFT JOIN townships t ON t.township_id = u.township_id
       GROUP BY COALESCE(t.name, 'Unassigned')
       ORDER BY value DESC, label ASC`
    ),
    pool.query(
      `SELECT COALESCE(d.department_name, 'Unassigned') AS label, COUNT(u.user_id)::int AS value
       FROM users u
       LEFT JOIN departments d ON d.department_id = u.department_id
       GROUP BY COALESCE(d.department_name, 'Unassigned')
       ORDER BY value DESC, label ASC`
    ),
  ]);

  return {
    listings_by_category: listingsByCategory.rows,
    listings_by_status: listingsByStatus.rows,
    monthly_listings: monthlyListings.rows,
    monthly_orders: monthlyOrders.rows,
    monthly_payments: monthlyPayments.rows.map((row) => ({
      ...row,
      value: Number(row.value || 0),
    })),
    reports_by_status: reportsByStatus.rows,
    user_growth: userGrowth.rows,
    township_distribution: townshipDistribution.rows,
    department_distribution: departmentDistribution.rows,
  };
}

async function getAuditLogs(filters = {}) {
  const clauses = [];
  const params = [];

  if (filters.user) {
    params.push(`%${filters.user}%`);
    clauses.push(`(u.name ILIKE $${params.length} OR u.email ILIKE $${params.length})`);
  }
  if (filters.action) {
    params.push(filters.action);
    clauses.push(`al.action = $${params.length}`);
  }
  if (filters.date) {
    params.push(filters.date);
    clauses.push(`al.created_at::date = $${params.length}::date`);
  }

  const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
  const { rows } = await pool.query(
    `SELECT
       al.audit_id,
       al.user_id,
       COALESCE(u.name, 'System') AS user_name,
       CASE
         WHEN UPPER(u.role_id::text) IN ('3', 'SUPER_ADMIN', 'SUPERADMIN') THEN 'SUPER_ADMIN'
         WHEN UPPER(u.role_id::text) IN ('2', 'ADMIN') THEN 'ADMIN'
         ELSE 'USER'
       END AS role,
       al.action,
       al.entity_type,
       al.entity_id,
       al.created_at,
       NULL::text AS ip_address
     FROM audit_logs al
     LEFT JOIN users u ON u.user_id = al.user_id
     ${where}
     ORDER BY al.created_at DESC
     LIMIT 200`,
    params
  );

  return rows;
}

async function getAuditActions() {
  const { rows } = await pool.query(
    `SELECT DISTINCT action
     FROM audit_logs
     WHERE action IS NOT NULL
     ORDER BY action ASC`
  );
  return rows.map((row) => row.action);
}

async function initializePlatformSettingsSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS platform_settings (
      setting_key VARCHAR(120) PRIMARY KEY,
      setting_value TEXT NOT NULL DEFAULT '',
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    )
  `);
}

const DEFAULT_PLATFORM_SETTINGS = {
  Branding: 'NTPC Marketplace',
  'Default township': '',
  'Listing rules': 'Standard marketplace rules',
  'Featured categories': '',
  'SSO providers': 'NTPC SSO',
  'Session length': '60',
  'IP allowlist': '',
  'NTPC Payroll': 'Enabled',
  'HRMS sync': 'Enabled',
  'Email gateway': 'Enabled',
  'Data retention': '365',
  'Audit policy': 'Enabled',
  'Export logs': 'Enabled',
};

async function ensurePlatformSettings() {
  await initializePlatformSettingsSchema();
  for (const [key, value] of Object.entries(DEFAULT_PLATFORM_SETTINGS)) {
    await pool.query(
      `INSERT INTO platform_settings (setting_key, setting_value)
       VALUES ($1, $2)
       ON CONFLICT (setting_key) DO NOTHING`,
      [key, value]
    );
  }
}

async function getPlatformSettings() {
  await ensurePlatformSettings();
  const { rows } = await pool.query(
    `SELECT setting_key, setting_value, updated_at
     FROM platform_settings
     ORDER BY setting_key ASC`
  );
  return rows;
}

async function updatePlatformSetting(setting_key, setting_value) {
  await ensurePlatformSettings();
  const { rows } = await pool.query(
    `UPDATE platform_settings
     SET setting_value = $2, updated_at = NOW()
     WHERE setting_key = $1
     RETURNING setting_key, setting_value, updated_at`,
    [setting_key, setting_value]
  );
  return rows[0];
}

async function getDepartments() {
  const hasDescription = await columnExists('departments', 'description');
  const hasCreatedAt = await columnExists('departments', 'created_at');

  const { rows } = await pool.query(
    `SELECT
       d.department_id,
       d.department_name,
       ${hasDescription ? 'd.description' : 'NULL::text'} AS description,
       ${hasCreatedAt ? 'd.created_at' : 'NULL::timestamp'} AS created_at,
       COUNT(u.user_id)::int AS total_employees
     FROM departments d
     LEFT JOIN users u ON u.department_id = d.department_id
     GROUP BY d.department_id, d.department_name${hasDescription ? ', d.description' : ''}${hasCreatedAt ? ', d.created_at' : ''}
     ORDER BY d.department_name ASC`
  );

  return rows;
}

async function createDepartment(payload) {
  const hasDescription = await columnExists('departments', 'description');
  const hasCreatedAt = await columnExists('departments', 'created_at');
  const columns = ['department_name'];
  const values = [payload.department_name];

  if (hasDescription) {
    columns.push('description');
    values.push(payload.description || null);
  }
  if (hasCreatedAt) {
    columns.push('created_at');
    values.push(new Date());
  }

  const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
  const { rows } = await pool.query(
    `INSERT INTO departments (${columns.join(', ')})
     VALUES (${placeholders})
     RETURNING department_id`,
    values
  );

  return getDepartmentById(rows[0].department_id);
}

async function updateDepartment(department_id, payload) {
  const hasDescription = await columnExists('departments', 'description');
  const fields = [];
  const values = [];

  if (payload.department_name !== undefined) {
    values.push(payload.department_name);
    fields.push(`department_name = $${values.length}`);
  }
  if (hasDescription && payload.description !== undefined) {
    values.push(payload.description || null);
    fields.push(`description = $${values.length}`);
  }

  if (fields.length === 0) {
    return getDepartmentById(department_id);
  }

  values.push(department_id);
  const { rows } = await pool.query(
    `UPDATE departments
     SET ${fields.join(', ')}
     WHERE department_id = $${values.length}
     RETURNING department_id`,
    values
  );

  return rows[0] ? getDepartmentById(department_id) : null;
}

async function getDepartmentById(department_id) {
  const departments = await getDepartments();
  return departments.find((department) => Number(department.department_id) === Number(department_id));
}

async function countDepartmentUsers(department_id) {
  const { rows } = await pool.query(
    'SELECT COUNT(*)::int AS total FROM users WHERE department_id = $1',
    [department_id]
  );
  return rows[0]?.total || 0;
}

async function deleteDepartment(department_id) {
  const { rowCount } = await pool.query(
    'DELETE FROM departments WHERE department_id = $1',
    [department_id]
  );
  return rowCount > 0;
}

async function getTownships() {
  const hasState = await columnExists('townships', 'state');
  const hasRegion = await columnExists('townships', 'region');
  const hasCreatedAt = await columnExists('townships', 'created_at');

  const { rows } = await pool.query(
    `SELECT
       t.township_id,
       t.name,
       ${hasState ? 't.state' : 'NULL::text'} AS state,
       ${hasRegion ? 't.region' : 'NULL::text'} AS region,
       ${hasCreatedAt ? 't.created_at' : 'NULL::timestamp'} AS created_at,
       COUNT(DISTINCT u.user_id)::int AS total_employees,
       COUNT(DISTINCT l.listing_id)::int AS total_listings
     FROM townships t
     LEFT JOIN users u ON u.township_id = t.township_id
     LEFT JOIN listings l ON l.township_id = t.township_id
     GROUP BY t.township_id, t.name${hasState ? ', t.state' : ''}${hasRegion ? ', t.region' : ''}${hasCreatedAt ? ', t.created_at' : ''}
     ORDER BY t.name ASC`
  );

  return rows;
}

async function createTownship(payload) {
  const hasState = await columnExists('townships', 'state');
  const hasRegion = await columnExists('townships', 'region');
  const hasCreatedAt = await columnExists('townships', 'created_at');
  const columns = ['name'];
  const values = [payload.name];

  if (hasState) {
    columns.push('state');
    values.push(payload.state || null);
  }
  if (hasRegion) {
    columns.push('region');
    values.push(payload.region || null);
  }
  if (hasCreatedAt) {
    columns.push('created_at');
    values.push(new Date());
  }

  const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
  const { rows } = await pool.query(
    `INSERT INTO townships (${columns.join(', ')})
     VALUES (${placeholders})
     RETURNING township_id`,
    values
  );

  return getTownshipById(rows[0].township_id);
}

async function updateTownship(township_id, payload) {
  const hasState = await columnExists('townships', 'state');
  const hasRegion = await columnExists('townships', 'region');
  const fields = [];
  const values = [];

  if (payload.name !== undefined) {
    values.push(payload.name);
    fields.push(`name = $${values.length}`);
  }
  if (hasState && payload.state !== undefined) {
    values.push(payload.state || null);
    fields.push(`state = $${values.length}`);
  }
  if (hasRegion && payload.region !== undefined) {
    values.push(payload.region || null);
    fields.push(`region = $${values.length}`);
  }

  if (fields.length === 0) {
    return getTownshipById(township_id);
  }

  values.push(township_id);
  const { rows } = await pool.query(
    `UPDATE townships
     SET ${fields.join(', ')}
     WHERE township_id = $${values.length}
     RETURNING township_id`,
    values
  );

  return rows[0] ? getTownshipById(township_id) : null;
}

async function getTownshipById(township_id) {
  const townships = await getTownships();
  return townships.find((township) => Number(township.township_id) === Number(township_id));
}

async function countTownshipAssignments(township_id) {
  const { rows } = await pool.query(
    `SELECT
       (SELECT COUNT(*)::int FROM users WHERE township_id = $1) AS total_users,
       (SELECT COUNT(*)::int FROM listings WHERE township_id = $1) AS total_listings`,
    [township_id]
  );
  return rows[0] || { total_users: 0, total_listings: 0 };
}

async function deleteTownship(township_id) {
  const { rowCount } = await pool.query(
    'DELETE FROM townships WHERE township_id = $1',
    [township_id]
  );
  return rowCount > 0;
}

module.exports = {
  getDashboardSummary,
  getAnalytics,
  getAuditLogs,
  getAuditActions,
  getPlatformSettings,
  updatePlatformSetting,
  getDepartments,
  createDepartment,
  updateDepartment,
  getDepartmentById,
  countDepartmentUsers,
  deleteDepartment,
  getTownships,
  createTownship,
  updateTownship,
  getTownshipById,
  countTownshipAssignments,
  deleteTownship,
};
