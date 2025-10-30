const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const otpGenerator = require('otp-generator');
const sendEmail = require('../utils/mailer');

// =========================
// ✅ LOGIN FUNCTION (unchanged)
// =========================
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

        if (!user.isVerified) {
            return res.status(401).json({ msg: 'Please verify your account via OTP before logging in.' });
        }

        const payload = { user: { id: user.id, role: user.role } };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' });
        res.json({ token });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// =========================
// ✅ STEP 1: SEND OTP FOR REGISTRATION
// =========================
exports.sendOtpForRegistration = async (req, res) => {
    try {
        const { name, email, password, role, phoneNumber } = req.body;

        let existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ msg: 'User with this email already exists' });
        }

        // Generate OTP (6 digits)
        const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false });
        const otpExpires = Date.now() + 10 * 60 * 1000; // OTP valid for 10 min

        // Hash password before temporary save
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user but not verified yet
        const user = new User({
            name,
            email,
            password: hashedPassword,
            role: role || 'patient',
            phoneNumber,
            otp,
            otpExpires,
            isVerified: false,
        });

        await user.save();

        // Send OTP via email
        await sendEmail({
            email: user.email,
            subject: 'SmartHealth OTP Verification',
            message: `Welcome to SmartHealth! Your OTP is: ${otp}. It is valid for 10 minutes.`,
        });

        console.log(`✅ OTP for ${email} is: ${otp}`); // (for backend testing)
        res.status(200).json({ msg: 'OTP sent successfully to your email.', email });

    } catch (err) {
        console.error('Error sending OTP:', err.message);
        res.status(500).send('Server error');
    }
};

// =========================
// ✅ STEP 2: VERIFY OTP AND COMPLETE REGISTRATION
// =========================
exports.verifyOtpAndRegister = async (req, res) => {
    try {
        const { email, otp } = req.body;

        const user = await User.findOne({
            email,
            otp,
            otpExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ msg: 'OTP is invalid or has expired.' });
        }

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        const payload = { user: { id: user.id, role: user.role } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '5h' });

        res.status(201).json({ msg: 'Registration successful', token });

    } catch (err) {
        console.error('Error verifying OTP:', err.message);
        res.status(500).send('Server error');
    }
};

// ... (keep all your existing imports and functions)

// --- ADD THESE TWO NEW FUNCTIONS AT THE END ---

// @desc    Forgot Password
exports.forgotPassword = async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });

        // If no user, we send a success response anyway to prevent email enumeration
        if (!user) {
            return res.status(200).json({ msg: 'Email sent' });
        }

        // Get reset token
        const resetToken = user.getResetPasswordToken();
        await user.save({ validateBeforeSave: false });

        // Create reset URL
        const resetUrl = `${req.protocol}://${req.get('host')}`.replace('5001', '5173') + `/reset-password/${resetToken}`;

        const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Password Reset Token',
                message,
            });
            res.status(200).json({ msg: 'Email sent' });
        } catch (err) {
            console.error(err);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save({ validateBeforeSave: false });
            return res.status(500).send('Email could not be sent');
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Reset Password
exports.resetPassword = async (req, res) => {
    try {
        // Hash the token from the URL params
        const resetPasswordToken = require('crypto')
            .createHash('sha256')
            .update(req.params.resetToken)
            .digest('hex');
        
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ msg: 'Invalid or expired token' });
        }

        // Set new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(req.body.password, salt);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.status(200).json({ msg: 'Password reset successful' });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
