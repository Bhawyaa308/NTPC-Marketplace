const express = require('express');
const searchController = require('../controllers/search.controller');

const router = express.Router();

/**
 * @swagger
 * /api/search/suggestions:
 *   get:
 *     summary: Get search suggestions (categories and listings)
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query string
 *         example: "iphone"
 *     responses:
 *       200:
 *         description: Array of suggestions (max 10 results)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SearchSuggestion'
 *       400:
 *         description: Invalid query parameter
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/suggestions', searchController.getSuggestions);

/**
 * @swagger
 * /api/search:
 *   get:
 *     summary: Search for listings
 *     tags: [Search]
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query string
 *         example: "iphone 13"
 *     responses:
 *       200:
 *         description: Array of matching active listings
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SearchResult'
 *       400:
 *         description: Invalid query parameter
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', searchController.searchListings);

module.exports = router;
