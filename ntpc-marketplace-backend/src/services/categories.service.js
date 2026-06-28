const categoriesRepository = require('../repositories/categories.repository');

function createError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}

async function getAllCategories() {
  return categoriesRepository.getAllCategories();
}

async function getCategoryById(category_id) {
  if (!category_id || isNaN(category_id)) {
    throw createError(400, 'Valid category id is required');
  }

  const category = await categoriesRepository.findCategoryById(category_id);
  if (!category) {
    throw createError(404, 'Category not found');
  }

  return category;
}

module.exports = {
  getAllCategories,
  getCategoryById,
};
