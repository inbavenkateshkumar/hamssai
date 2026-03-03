const express = require('express');
const router = express.Router();
const { authenticateToken, requireIncharge } = require('../middleware/auth');
const {
    assignSubstitutions,
    getSubstitutionsByDate,
    getAllSubstitutions,
    deleteSubstitution
} = require('../controllers/substitutionController');

router.post('/assign', authenticateToken, requireIncharge, assignSubstitutions);
router.get('/', authenticateToken, getSubstitutionsByDate);
router.get('/all', authenticateToken, getAllSubstitutions);
router.delete('/:id', authenticateToken, requireIncharge, deleteSubstitution);

module.exports = router;