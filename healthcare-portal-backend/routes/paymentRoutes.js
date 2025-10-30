const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');

const { 
    createCheckoutSession, 
    createAppointmentCheckoutSession, 
    verifyAppointmentPayment
    // We remove stripeWebhookHandler from here
} = require('../controllers/paymentController');

// --- Medicine Checkout Route ---
router.post('/create-checkout-session', authMiddleware, createCheckoutSession);

// --- Appointment Checkout Route ---
router.post('/create-appointment-session', authMiddleware, createAppointmentCheckoutSession);

// --- Verify Appointment Payment ---
router.post('/verify-appointment-payment', authMiddleware, verifyAppointmentPayment);

// The webhook route is removed from this file and placed in server.js

module.exports = router;