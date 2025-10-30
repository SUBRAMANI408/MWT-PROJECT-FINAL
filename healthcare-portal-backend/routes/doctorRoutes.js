const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');

// Import controller functions
const {
  getDoctorProfile,
  createOrUpdateDoctorProfile,
  getAllDoctors,
  getUniqueSpecializations,
  getDoctorById
} = require('../controllers/doctorController');

// ============================================================
// @route   GET /api/doctor/me
// @desc    Get the logged-in doctor's profile
// @access  Private (Doctor)
// ============================================================
router.get('/me', authMiddleware, getDoctorProfile);

// ============================================================
// @route   GET /api/doctor/specializations
// @desc    Get all unique specializations
// @access  Public
// ============================================================
router.get('/specializations', getUniqueSpecializations);

// ============================================================
// @route   GET /api/doctor
// @desc    Get all approved doctors (with optional filters)
// @access  Private (Doctor / Admin / Patient depending on access rules)
// ============================================================
router.get('/', authMiddleware, getAllDoctors);

// ============================================================
// @route   GET /api/doctor/:id
// @desc    Get doctor details by ID
// @access  Private (Doctor / Patient / Admin)
// NOTE: Must come AFTER /me and /specializations routes
// ============================================================
router.get('/:id', authMiddleware, getDoctorById);

// ============================================================
// @route   POST /api/doctor/me
// @desc    Create or update the logged-in doctor's profile
// @access  Private (Doctor)
// ============================================================
router.post('/me', authMiddleware, createOrUpdateDoctorProfile);

module.exports = router;
