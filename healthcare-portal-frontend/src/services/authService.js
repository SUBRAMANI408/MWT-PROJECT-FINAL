// src/services/authService.js
import api from './api';

// =========================
// Login
// =========================
const login = (userData) => {
    return api.post('/auth/login', userData);
};

// =========================
// OTP Registration
// =========================

// Send registration data and trigger OTP email
const sendOtpForRegistration = (userData) => {
    return api.post('/auth/send-otp', userData);
};

// Verify OTP and complete registration
const verifyOtpAndRegister = (verificationData) => {
    return api.post('/auth/register-verify', verificationData);
};

// =========================
// Password Reset
// =========================

// Request password reset email
const forgotPassword = (emailData) => {
    return api.post('/auth/forgot-password', emailData);
};

// Reset password using token
const resetPassword = (token, passwordData) => {
    return api.put(`/auth/reset-password/${token}`, passwordData);
};

// =========================
// Export all functions
// =========================
export default {
    login,
    sendOtpForRegistration,
    verifyOtpAndRegister,
    forgotPassword,
    resetPassword,
};
