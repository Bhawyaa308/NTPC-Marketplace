const express = require('express');
const reportsController = require('../controllers/reports.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/rbac.middleware');
const { createReportValidator } = require('../validators/reports.validator');

const router = express.Router();

// Create a new report
router.post('/', authMiddleware, createReportValidator, reportsController.createReport);

// Get reports created by current user
router.get('/my', authMiddleware, reportsController.getMyReports);

// Get one report
router.get('/:id', authMiddleware, reportsController.getReportById);

// Withdraw a report
router.patch('/:id/withdraw', authMiddleware, reportsController.withdrawReport);

// Admin: get all reports
router.get('/', authMiddleware, authorizeRoles('ADMIN', 'SUPER_ADMIN'), reportsController.getAllReports);

// Admin: update report status
router.patch('/:id/status', authMiddleware, authorizeRoles('ADMIN', 'SUPER_ADMIN'), reportsController.updateReportStatus);

module.exports = router;
