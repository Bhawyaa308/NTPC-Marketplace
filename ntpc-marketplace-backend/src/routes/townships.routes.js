const express = require('express');
const townshipsController = require('../controllers/townships.controller');

const router = express.Router();

router.get('/', townshipsController.getTownships);

module.exports = router;
