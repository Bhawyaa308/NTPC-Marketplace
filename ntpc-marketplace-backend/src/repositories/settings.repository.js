const { pool } = require('../config/db');

let initialized = false;

async function initializeSettingsSchema() {
  if (initialized) return;

  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_settings (
      user_id INTEGER PRIMARY KEY REFERENCES users(user_id) ON DELETE CASCADE,
      two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE,
      ntpc_sso_linked BOOLEAN NOT NULL DEFAULT TRUE,
      email_notifications BOOLEAN NOT NULL DEFAULT TRUE,
      push_notifications BOOLEAN NOT NULL DEFAULT TRUE,
      transfer_alerts BOOLEAN NOT NULL DEFAULT TRUE,
      profile_visibility VARCHAR(32) NOT NULL DEFAULT 'NTPC_EMPLOYEES_ONLY',
      show_contact_to_buyers BOOLEAN NOT NULL DEFAULT TRUE,
      default_township_id INTEGER REFERENCES townships(township_id),
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      CONSTRAINT user_settings_profile_visibility_check
        CHECK (profile_visibility IN ('PUBLIC', 'NTPC_EMPLOYEES_ONLY', 'PRIVATE'))
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_preferred_categories (
      user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
      category_id INTEGER NOT NULL REFERENCES categories(category_id) ON DELETE CASCADE,
      created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
      PRIMARY KEY (user_id, category_id)
    )
  `);

  initialized = true;
}

async function ensureSettings(user_id) {
  await initializeSettingsSchema();

  const { rows } = await pool.query(
    `INSERT INTO user_settings (user_id)
     VALUES ($1)
     ON CONFLICT (user_id) DO NOTHING
     RETURNING user_id`,
    [user_id]
  );

  return rows[0];
}

async function getSettings(user_id) {
  await ensureSettings(user_id);

  const { rows } = await pool.query(
    `SELECT
       us.user_id,
       us.two_factor_enabled,
       us.ntpc_sso_linked,
       us.email_notifications,
       us.push_notifications,
       us.transfer_alerts,
       us.profile_visibility,
       us.show_contact_to_buyers,
       us.default_township_id,
       t.name AS default_township_name,
       COALESCE(
         json_agg(
           json_build_object(
             'category_id', c.category_id,
             'name', c.name
           )
           ORDER BY c.name
         ) FILTER (WHERE c.category_id IS NOT NULL),
         '[]'
       ) AS preferred_categories
     FROM user_settings us
     LEFT JOIN townships t ON t.township_id = us.default_township_id
     LEFT JOIN user_preferred_categories upc ON upc.user_id = us.user_id
     LEFT JOIN categories c ON c.category_id = upc.category_id
     WHERE us.user_id = $1
     GROUP BY us.user_id, t.name`,
    [user_id]
  );

  return rows[0];
}

async function updateSettings(user_id, fields) {
  await ensureSettings(user_id);

  const keys = Object.keys(fields);
  if (keys.length === 0) {
    return getSettings(user_id);
  }

  const values = Object.values(fields);
  const setClause = keys
    .map((key, index) => `${key} = $${index + 1}`)
    .join(', ');

  await pool.query(
    `UPDATE user_settings
     SET ${setClause}, updated_at = NOW()
     WHERE user_id = $${keys.length + 1}`,
    [...values, user_id]
  );

  return getSettings(user_id);
}

async function replacePreferredCategories(user_id, categoryIds) {
  await ensureSettings(user_id);

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('DELETE FROM user_preferred_categories WHERE user_id = $1', [user_id]);

    for (const categoryId of categoryIds) {
      await client.query(
        `INSERT INTO user_preferred_categories (user_id, category_id)
         VALUES ($1, $2)
         ON CONFLICT (user_id, category_id) DO NOTHING`,
        [user_id, categoryId]
      );
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

  return getSettings(user_id);
}

async function townshipExists(township_id) {
  const { rows } = await pool.query(
    'SELECT township_id FROM townships WHERE township_id = $1 LIMIT 1',
    [township_id]
  );
  return rows.length > 0;
}

async function getExistingCategoryIds(categoryIds) {
  if (!categoryIds.length) return [];

  const { rows } = await pool.query(
    'SELECT category_id FROM categories WHERE category_id = ANY($1::int[])',
    [categoryIds]
  );

  return rows.map((row) => Number(row.category_id));
}

async function getPasswordHash(user_id) {
  const { rows } = await pool.query(
    'SELECT password_hash FROM users WHERE user_id = $1 LIMIT 1',
    [user_id]
  );
  return rows[0]?.password_hash;
}

async function updatePasswordHash(user_id, password_hash) {
  const { rows } = await pool.query(
    `UPDATE users
     SET password_hash = $2, updated_at = NOW()
     WHERE user_id = $1
     RETURNING user_id`,
    [user_id, password_hash]
  );
  return rows[0];
}

module.exports = {
  getSettings,
  updateSettings,
  replacePreferredCategories,
  townshipExists,
  getExistingCategoryIds,
  getPasswordHash,
  updatePasswordHash,
};
