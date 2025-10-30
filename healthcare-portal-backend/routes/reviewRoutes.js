const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { createReview, getReviewsForDoctor } = require('../controllers/reviewController');

// @route   POST /api/reviews/:doctorId/:appointmentId
// @desc    Create a new review
// @access  Private (Patient)
router.post('/:doctorId/:appointmentId', authMiddleware, createReview);

// @route   GET /api/reviews/:doctorId
// @desc    Get all reviews for a doctor
// @access  Public (or Private, your choice - let's make it Private)
router.get('/:doctorId', authMiddleware, getReviewsForDoctor);

module.exports = router;