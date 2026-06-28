const { pool } = require('../config/db');

async function createAuditLog({ user_id, action, entity_type = null, entity_id = null, old_values = null, new_values = null, metadata = null }) {
  const values = metadata !== null ? metadata : new_values;
  const { rows } = await pool.query(
    `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_values, new_values, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, NOW())
     RETURNING audit_id, user_id, action, entity_type, entity_id, old_values, new_values, created_at`,
    [user_id, action, entity_type, entity_id, old_values, values]
  );

  return rows[0];
}

module.exports = {
  createAuditLog,
};
