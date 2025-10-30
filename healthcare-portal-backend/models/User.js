// healthcare-portal-backend/models/User.js
const mongoose = require('mongoose');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String }, // Optional if using Google auth
    role: { type: String, enum: ['patient', 'doctor', 'admin'], default: 'patient' },

    // --- OTP & Google Auth ---
    googleId: { type: String },
    phoneNumber: { type: String },
    otp: { type: String },
    otpExpires: { type: Date },
    isVerified: { type: Boolean, default: false },

    // --- Password Reset ---
    resetPasswordToken: { type: String },
    resetPasswordExpire: { type: Date },

    // --- New Profile Picture Field ---
    profilePicture: {
        type: String,
        default: 'https://res.cloudinary.com/your_cloud_name_here/image/upload/v123456789/default_avatar.jpg'
    }

}, { timestamps: true });

// --- METHOD TO GENERATE PASSWORD RESET TOKEN ---
UserSchema.methods.getResetPasswordToken = function() {
    // 1. Generate random token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // 2. Hash token and set fields
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // 3. Set token expiry (10 minutes)
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    // 4. Return unhashed token (for sending via email)
    return resetToken;
};

module.exports = mongoose.model('User', UserSchema);
