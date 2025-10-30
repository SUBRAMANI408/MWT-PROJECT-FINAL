// healthcare-portal-backend/routes/patientRoutes.js

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const {
  getPatientProfile,
  createOrUpdatePatientProfile,
} = require('../controllers/patientController');

// @route   GET api/patient/me
// @desc    Get current user's profile
// @access  Private
router.get('/me', authMiddleware, getPatientProfile);

// @route   POST api/patient/me
// @desc    Create or update user profile
// @access  Private
router.post('/me', authMiddleware, createOrUpdatePatientProfile);

// ✅ Make sure this line exists and is not missing!
module.exports = router;
