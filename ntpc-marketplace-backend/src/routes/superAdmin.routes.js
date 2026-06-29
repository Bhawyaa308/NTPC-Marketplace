const express = require('express');
const superAdminController = require('../controllers/superAdmin.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/rbac.middleware');

const router = express.Router();

router.use(authMiddleware, authorizeRoles('SUPER_ADMIN'));

router.get('/dashboard', superAdminController.getDashboard);
router.get('/analytics', superAdminController.getAnalytics);
router.get('/audit-logs', superAdminController.getAuditLogs);
router.get('/settings', superAdminController.getSettings);
router.patch('/settings', superAdminController.updateSetting);

router.get('/departments', superAdminController.getDepartments);
router.post('/departments', superAdminController.createDepartment);
router.patch('/departments/:id', superAdminController.updateDepartment);
router.delete('/departments/:id', superAdminController.deleteDepartment);

router.get('/townships', superAdminController.getTownships);
router.post('/townships', superAdminController.createTownship);
router.patch('/townships/:id', superAdminController.updateTownship);
router.delete('/townships/:id', superAdminController.deleteTownship);

module.exports = router;
