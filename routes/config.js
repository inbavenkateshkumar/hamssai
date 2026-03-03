const express = require('express');
const router = express.Router();
const { authenticateToken, requireIncharge } = require('../middleware/auth');
const {
    setDayOverride,
    getDayOverride
} = require('../controllers/configController');

router.post('/override', authenticateToken, requireIncharge, setDayOverride);
router.get('/override/:date', authenticateToken, getDayOverride);

module.exports = router;
