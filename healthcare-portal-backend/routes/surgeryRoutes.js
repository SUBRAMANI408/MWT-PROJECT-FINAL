const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const {
    getAllSurgeries,
    getSurgeryById,
    addSurgery,
    updateSurgery,
    deleteSurgery
} = require('../controllers/surgeryController');

// --- Routes for Patients (and any logged-in user) ---
router.get('/', authMiddleware, getAllSurgeries);
router.get('/:id', authMiddleware, getSurgeryById);

// --- Routes for Admin ONLY ---
router.post('/', authMiddleware, addSurgery);
router.put('/:id', authMiddleware, updateSurgery);
router.delete('/:id', authMiddleware, deleteSurgery);

module.exports = router;