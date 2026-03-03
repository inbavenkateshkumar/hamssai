const express = require('express');
const router = express.Router();
const { authenticateToken, requireIncharge } = require('../middleware/auth');
const {
    getAllTeachers,
    getTeacherById,
    createTeacher,
    updateTeacher,
    deleteTeacher,
    resetSubstitutionCounts
} = require('../controllers/teacherController');

router.get('/', authenticateToken, getAllTeachers);
router.get('/:id', authenticateToken, getTeacherById);
router.post('/', authenticateToken, requireIncharge, createTeacher);
router.put('/:id', authenticateToken, requireIncharge, updateTeacher);
router.delete('/:id', authenticateToken, requireIncharge, deleteTeacher);
router.post('/reset-counts', authenticateToken, requireIncharge, resetSubstitutionCounts);

module.exports = router;