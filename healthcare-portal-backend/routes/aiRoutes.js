const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { symptomCheck } = require('../controllers/aiController');

// @route   POST /api/ai/symptom-check
// @desc    Get AI analysis for user symptoms
// @access  Private
router.post('/symptom-check', authMiddleware, symptomCheck);

module.exports = router;