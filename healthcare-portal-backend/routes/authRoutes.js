const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');

// CHANGE #1: Make sure to import the new functions
const { 
    login, 
    sendOtpForRegistration, 
    verifyOtpAndRegister,
    forgotPassword,      // <-- Add this
    resetPassword        // <-- Add this
} = require('../controllers/authController');

// --- OTP Registration Routes ---
router.post('/send-otp', sendOtpForRegistration);
router.post('/register-verify', verifyOtpAndRegister);

// --- Standard Login Route ---
router.post('/login', login);

// --- Google OAuth Routes ---
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: 'http://localhost:5173/login' }),
    (req, res) => {
        const payload = { user: { id: req.user.id, role: req.user.role } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' });
        res.redirect(`http://localhost:5173/auth/callback?token=${token}`);
    }
);

// --- CHANGE #2: ADD THE NEW PASSWORD RESET ROUTES ---
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resetToken', resetPassword);


module.exports = router;