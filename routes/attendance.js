const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
    getAttendanceByDate,
    markAttendance,
    updateTeacherAttendance
} = require('../controllers/attendanceController');

router.get('/', authenticateToken, getAttendanceByDate);
router.post('/mark', authenticateToken, markAttendance);
router.put('/teacher/:teacherId', authenticateToken, updateTeacherAttendance);

module.exports = router;