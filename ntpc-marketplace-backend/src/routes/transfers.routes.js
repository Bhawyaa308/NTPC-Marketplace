const express = require('express');
const transfersController = require('../controllers/transfers.controller');

const router = express.Router();

router.get('/', transfersController.getTransfers);

module.exports = router;
