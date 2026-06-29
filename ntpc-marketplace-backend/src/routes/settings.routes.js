const express = require('express');
const settingsController = require('../controllers/settings.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/', authMiddleware, settingsController.getSettings);
router.patch('/', authMiddleware, settingsController.updateSettings);
router.patch('/password', authMiddleware, settingsController.changePassword);

module.exports = router;
