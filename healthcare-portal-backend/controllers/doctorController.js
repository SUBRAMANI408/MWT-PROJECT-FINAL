const DoctorProfile = require('../models/DoctorProfile');
const User = require('../models/User');
const Review = require('../models/Review'); // ✅ For doctor reviews

// ============================================================
// @desc    Get current doctor's own profile
// @route   GET /api/doctors/me
// @access  Private (Doctor)
// ============================================================
exports.getDoctorProfile = async (req, res) => {
    try {
        const profile = await DoctorProfile.findOne({ user: req.user.id })
            .populate('user', ['name', 'email', 'profilePicture']);

        if (!profile) {
            return res.status(404).json({ msg: 'Profile not found for this doctor' });
        }

        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// ============================================================
// @desc    Create or update a doctor profile
// @route   POST /api/doctors/profile
// @access  Private (Doctor)
// ============================================================
exports.createOrUpdateDoctorProfile = async (req, res) => {
    const {
        firstName,
        lastName,
        specialization,
        clinicName, // ✅ NEW FIELD
        qualifications,
        experienceInYears,
        consultationFee,
        availability,
        consultationModes,
        address,
        acceptedInsurance,
        offersCashless
    } = req.body;

    const profileFields = { user: req.user.id };

    // --- BASIC DETAILS ---
    if (firstName) profileFields.firstName = firstName;
    if (lastName) profileFields.lastName = lastName;
    if (specialization) profileFields.specialization = specialization;

    // --- NEW FIELD: Clinic Name ---
    if (clinicName) profileFields.clinicName = clinicName;

    if (qualifications) profileFields.qualifications = qualifications;
    if (experienceInYears) profileFields.experienceInYears = experienceInYears;
    if (consultationFee) profileFields.consultationFee = consultationFee;
    if (availability) profileFields.availability = availability;
    if (consultationModes) profileFields.consultationModes = consultationModes;
    if (address) profileFields.address = address;

    // --- Accepted Insurance ---
    if (Array.isArray(acceptedInsurance)) {
        profileFields.acceptedInsurance = acceptedInsurance;
    }

    // --- NEW: Offers Cashless ---
    if (offersCashless !== undefined) {
        profileFields.offersCashless = offersCashless;
    }

    try {
        const profile = await DoctorProfile.findOneAndUpdate(
            { user: req.user.id },
            { $set: profileFields },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// ============================================================
// @desc    Get all APPROVED doctor profiles (with advanced filtering)
// @route   GET /api/doctors
// @access  Public
// ============================================================
exports.getAllDoctors = async (req, res) => {
    try {
        const { search, location, specialization, insurance, cashless } = req.query;
        const filter = { status: 'Approved' };
        const andClauses = [];

        // --- Location Filter ---
        if (location) {
            andClauses.push({
                $or: [
                    { 'address.city': { $regex: location, $options: 'i' } },
                    { 'address.state': { $regex: location, $options: 'i' } },
                    { 'address.country': { $regex: location, $options: 'i' } },
                ],
            });
        }

        // --- Specialization Filter ---
        if (specialization) {
            filter.specialization = specialization;
        }

        // --- Insurance Filter ---
        if (insurance) {
            filter.acceptedInsurance = { $in: [new RegExp(insurance, 'i')] };
        }

        // --- Cashless Filter ---
        if (cashless === 'true') {
            filter.offersCashless = true;
        }

        // --- Search by Doctor Name, Specialization, Clinic Name, or City ---
        if (search) {
            const users = await User.find({
                role: 'doctor',
                name: { $regex: search, $options: 'i' }
            }).select('_id');

            const userIds = users.map(user => user._id);

            andClauses.push({
                $or: [
                    { user: { $in: userIds } },
                    { specialization: { $regex: search, $options: 'i' } },
                    { clinicName: { $regex: search, $options: 'i' } }, // ✅ Added search by Clinic Name
                    { 'address.city': { $regex: search, $options: 'i' } },
                ],
            });
        }

        if (andClauses.length > 0) {
            filter.$and = andClauses;
        }

        const doctorProfiles = await DoctorProfile.find(filter)
            .populate('user', ['name', 'email', 'profilePicture']);

        res.json(doctorProfiles);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// ============================================================
// @desc    Get all unique specializations
// @route   GET /api/doctors/specializations
// @access  Public
// ============================================================
exports.getUniqueSpecializations = async (req, res) => {
    try {
        const specializations = await DoctorProfile.distinct('specialization', { status: 'Approved' });
        res.json(specializations);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// ============================================================
// @desc    Get a single doctor's public profile and their reviews
// @route   GET /api/doctors/:id
// @access  Public
// ============================================================
exports.getDoctorById = async (req, res) => {
    try {
        const profile = await DoctorProfile.findOne({ user: req.params.id })
            .populate('user', ['name', 'profilePicture', 'email']);

        if (!profile || profile.status !== 'Approved') {
            return res.status(404).json({ msg: 'Doctor not found or not approved.' });
        }

        const reviews = await Review.find({ doctor: req.params.id })
            .populate('patient', 'name')
            .sort({ createdAt: -1 });

        res.json({ profile, reviews });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
