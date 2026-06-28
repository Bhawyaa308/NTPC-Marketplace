const express = require('express');
const ordersController = require('../controllers/orders.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

/**
 * @swagger
 * /api/orders/from-reservation/{reservationId}:
 *   post:
 *     summary: Create an order from an approved reservation
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reservationId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Reservation ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateOrderRequest'
 *     responses:
 *       201:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: Invalid reservation or reservation not approved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Unauthorized'
 *       404:
 *         description: Reservation not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFound'
 */
router.get('/', authMiddleware, ordersController.getMyOrders);
router.post('/from-reservation/:reservationId', authMiddleware, ordersController.createOrderFromReservation);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get order details
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Unauthorized'
 *       403:
 *         description: Forbidden - Not the buyer or seller
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFound'
 */

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get order details
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     responses:
 *       200:
 *         description: Order details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Unauthorized'
 *       403:
 *         description: Forbidden - Not the buyer or seller
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Order not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotFound'
 */
router.get('/seller/:sellerId/ratings', ordersController.getSellerRatings);
router.get('/seller/:sellerId/rating-summary', ordersController.getSellerRatingSummary);
router.get('/:id', authMiddleware, ordersController.getOrder);

/**
 * @swagger
 * /api/orders/{id}/rating:
 *   post:
 *     summary: Add a rating to an order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               review:
 *                 type: string
 *             required:
 *               - rating
 *     responses:
 *       200:
 *         description: Rating added successfully
 *       400:
 *         description: Invalid rating or order already rated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 */
router.post('/:id/rating', authMiddleware, ordersController.rateOrder);

/**
 * @swagger
 * /api/orders/seller/{sellerId}/ratings:
 *   get:
 *     summary: Get all ratings for a seller
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: sellerId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Seller ID
 *     responses:
 *       200:
 *         description: Ratings retrieved successfully
 *       400:
 *         description: Invalid seller ID
 */
router.get('/seller/:sellerId/ratings', ordersController.getSellerRatings);

/**
 * @swagger
 * /api/orders/seller/{sellerId}/rating-summary:
 *   get:
 *     summary: Get rating summary for a seller
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: sellerId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Seller ID
 *     responses:
 *       200:
 *         description: Rating summary retrieved successfully
 *       400:
 *         description: Invalid seller ID
 */
router.get('/seller/:sellerId/rating-summary', ordersController.getSellerRatingSummary);

module.exports = router;
