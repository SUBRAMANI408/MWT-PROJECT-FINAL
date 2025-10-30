const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');

// --- Import all controller functions ---
const {
    createAppointment,
    getAvailableSlots,
    getMyAppointments,
    cancelAppointment,
    completeAppointment,
    hideAppointment,
    rescheduleAppointment, // <-- NEW IMPORT
} = require('../controllers/appointmentController');

// @route   POST /api/appointments
// @desc    Create a new appointment
// @access  Private (Patient)
router.post('/', authMiddleware, createAppointment);

// @route   GET /api/appointments/availability
// @desc    Get a doctor's available slots for a date
// @access  Private
router.get('/availability', authMiddleware, getAvailableSlots);

// @route   GET /api/appointments/my-appointments
// @desc    Get all appointments for the current logged-in user (patient or doctor)
// @access  Private
router.get('/my-appointments', authMiddleware, getMyAppointments);

// --- EXISTING ROUTES ---
// @route   PUT /api/appointments/:appointmentId/cancel
// @desc    Cancel an appointment (patient only)
// @access  Private
router.put('/:appointmentId/cancel', authMiddleware, cancelAppointment);

// @route   PUT /api/appointments/:appointmentId/complete
// @desc    Mark an appointment as completed (doctor only)
// @access  Private
router.put('/:appointmentId/complete', authMiddleware, completeAppointment);

// @route   PUT /api/appointments/:appointmentId/hide
// @desc    Hide an appointment from the patient's view
// @access  Private (Patient)
router.put('/:appointmentId/hide', authMiddleware, hideAppointment);

// --- NEW ROUTE ---
// @route   PUT /api/appointments/:appointmentId/reschedule
// @desc    Reschedule an appointment (patient only)
// @access  Private
router.put('/:appointmentId/reschedule', authMiddleware, rescheduleAppointment);

module.exports = router;
