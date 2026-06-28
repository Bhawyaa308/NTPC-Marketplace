const express = require('express');
const categoriesController = require('../controllers/categories.controller');

const router = express.Router();

// Public: get all categories
router.get('/', categoriesController.getAllCategories);

// Public: get category by id
router.get('/:id', categoriesController.getCategoryById);

module.exports = router;
