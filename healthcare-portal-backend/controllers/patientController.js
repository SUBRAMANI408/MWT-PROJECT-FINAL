// healthcare-portal-backend/controllers/patientController.js
const PatientProfile = require('../models/PatientProfile');

// @desc    Get current user's patient profile
// (This function does not need any changes)
exports.getPatientProfile = async (req, res) => {
    try {
        const profile = await PatientProfile.findOne({ user: req.user.id }).populate('user', ['name', 'email']);
        if (!profile) {
            return res.status(404).json({ msg: 'Profile not found for this user' });
        }
        res.json(profile);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Create or update a patient profile
// (This function is updated to handle the new fields)
exports.createOrUpdatePatientProfile = async (req, res) => {
    // --- PULL NEW FIELDS FROM REQUEST BODY ---
    const { firstName, lastName, dateOfBirth, gender, contactNumber, medicalHistory, insuranceDetails } = req.body;

    const profileFields = {};
    profileFields.user = req.user.id;
    // --- ADD NEW FIELDS TO THE PROFILE OBJECT ---
    if (firstName) profileFields.firstName = firstName;
    if (lastName) profileFields.lastName = lastName;
    // --- END OF CHANGES ---
    if (dateOfBirth) profileFields.dateOfBirth = dateOfBirth;
    if (gender) profileFields.gender = gender;
    if (contactNumber) profileFields.contactNumber = contactNumber;
    if (medicalHistory) profileFields.medicalHistory = medicalHistory;
    if (insuranceDetails) profileFields.insuranceDetails = insuranceDetails;

    try {
        let profile = await PatientProfile.findOne({ user: req.user.id });

        if (profile) {
            // Update
            profile = await PatientProfile.findOneAndUpdate(
                { user: req.user.id },
                { $set: profileFields },
                { new: true }
            );
            return res.json(profile);
        }

        // Create
        profile = new PatientProfile(profileFields);
        await profile.save();
        res.json(profile);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};