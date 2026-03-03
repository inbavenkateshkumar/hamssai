const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { getDashboard } = require('../controllers/dashboardController');

router.get('/', authenticateToken, getDashboard);

module.exports = router;