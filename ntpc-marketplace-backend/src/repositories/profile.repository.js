const { pool } = require('../config/db');

async function getProfileByUserId(user_id) {
  const { rows } = await pool.query(
    `
    SELECT
  u.user_id,
  u.employee_id,
  u.name,
  u.email,
  u.phone,
  u.designation,
  u.profile_picture,
  u.department_id,
  d.department_name AS department,
  u.township_id,
  t.name AS township
FROM users u
LEFT JOIN departments d
  ON d.department_id = u.department_id
LEFT JOIN townships t
  ON t.township_id = u.township_id
WHERE u.user_id = $1
LIMIT 1
    `,
    [user_id]
  );

  return rows[0];
}

async function updateProfileById(user_id, fields) {
  const keys = Object.keys(fields);
  const values = Object.values(fields);

  const setClause = keys
    .map((key, index) => `${key} = $${index + 1}`)
    .join(', ');

  const { rows } = await pool.query(
    `UPDATE users
     SET ${setClause}, updated_at = NOW()
     WHERE user_id = $${keys.length + 1}
     RETURNING
       user_id,
       employee_id,
       name,
       email,
       phone,
       department_id,
       designation,
       township_id,
       profile_picture,
       email_verified,
       last_login,
       is_active,
       deleted_at,
       created_at,
       updated_at`,
    [...values, user_id]
  );

  return rows[0];
}

module.exports = {
  getProfileByUserId,
  updateProfileById,
};
