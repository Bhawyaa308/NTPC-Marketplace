const { pool } = require('../config/db');

async function getAllTownships() {
  const query = `
    SELECT township_id, name
    FROM townships
    ORDER BY name ASC
  `;

  const result = await pool.query(query);
  return result.rows || [];
}

module.exports = {
  getAllTownships,
};
