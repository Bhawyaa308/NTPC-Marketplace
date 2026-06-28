const { pool } = require('../config/db');

async function getAllCategories() {
  const { rows } = await pool.query(
    `SELECT category_id, parent_category_id, name, image_url
     FROM categories
     ORDER BY name`
  );

  return rows;
}

async function findCategoryById(category_id) {
  const { rows } = await pool.query(
    `SELECT category_id, parent_category_id, name, image_url
     FROM categories
     WHERE category_id = $1
     LIMIT 1`,
    [category_id]
  );

  return rows[0];
}

module.exports = {
  getAllCategories,
  findCategoryById,
};
