const categoriesService = require('../services/categories.service');

async function getAllCategories(req, res, next) {
  try {
    const categories = await categoriesService.getAllCategories();
    return res.status(200).json(categories);
  } catch (err) {
    return next(err);
  }
}

async function getCategoryById(req, res, next) {
  try {
    const category = await categoriesService.getCategoryById(req.params.id);
    return res.status(200).json(category);
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  getAllCategories,
  getCategoryById,
};
