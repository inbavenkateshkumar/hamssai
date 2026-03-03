const express = require('express');
const router = express.Router();
const { authenticateToken, requireIncharge } = require('../middleware/auth');
const {
    getAllTimetables,
    getTimetableByTeacher,
    getFreeTeachers,
    createTimetable,
    updateTimetable,
    deleteTimetable
} = require('../controllers/timetableController');

router.get('/', authenticateToken, getAllTimetables);
router.get('/teacher/:teacherId', authenticateToken, getTimetableByTeacher);
router.get('/free-teachers', authenticateToken, getFreeTeachers);
router.post('/', authenticateToken, requireIncharge, createTimetable);
router.put('/:id', authenticateToken, requireIncharge, updateTimetable);
router.delete('/:id', authenticateToken, requireIncharge, deleteTimetable);

module.exports = router;