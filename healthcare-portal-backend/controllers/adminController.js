const User = require('../models/User');
const DoctorProfile = require('../models/DoctorProfile');
const Appointment = require('../models/Appointment');
const Medicine = require('../models/Medicine'); // <-- Make sure this is imported
const cloudinary = require('cloudinary').v2; // <-- Make sure this is imported
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// @desc    Register a new admin
exports.registerAdmin = async (req, res) => {
    const { name, email, password, secretKey } = req.body;
    if (secretKey !== process.env.ADMIN_REGISTRATION_SECRET) {
        return res.status(403).json({ msg: 'Forbidden: Invalid Secret Key' });
    }
    try {
        let user = await User.findOne({ email });
        if (user) { return res.status(400).json({ msg: 'User with this email already exists' }); }
        user = new User({ name, email, password, role: 'admin', isVerified: true });
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();
        const payload = { user: { id: user.id, role: user.role } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });
        res.status(201).json({ token });
    } catch (err) { console.error(err.message); res.status(500).send('Server Error'); }
};

// @desc    Login for admin
exports.loginAdmin = async (req, res) => {
    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (!user || user.role !== 'admin') { return res.status(400).json({ msg: 'Invalid Credentials or not an admin' }); }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) { return res.status(400).json({ msg: 'Invalid Credentials' }); }
        const payload = { user: { id: user.id, role: user.role } };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });
        res.json({ token });
    } catch (err) { console.error(err.message); res.status(500).send('Server Error'); }
};

// @desc    Get all doctor profiles pending approval
exports.getPendingDoctors = async (req, res) => {
    try {
        const pendingProfiles = await DoctorProfile.find({ status: 'Pending' }).populate('user', ['name', 'email']);
        res.json(pendingProfiles);
    } catch (err) { console.error(err.message); res.status(500).send('Server Error'); }
};

// @desc    Approve a doctor's profile
exports.approveDoctorProfile = async (req, res) => {
    try {
        const profile = await DoctorProfile.findByIdAndUpdate(req.params.doctorId, { status: 'Approved' }, { new: true });
        if (!profile) { return res.status(404).json({ msg: 'Doctor profile not found' }); }
        res.json(profile);
    } catch (err) { console.error(err.message); res.status(500).send('Server Error'); }
};

// @desc    Reject a doctor's profile
exports.rejectDoctorProfile = async (req, res) => {
    try {
        const profile = await DoctorProfile.findByIdAndUpdate(req.params.doctorId, { status: 'Rejected' }, { new: true });
        if (!profile) { return res.status(404).json({ msg: 'Doctor profile not found' }); }
        res.json(profile);
    } catch (err) { console.error(err.message); res.status(500).send('Server Error'); }
};

// @desc    Get all users with the 'patient' role
exports.getAllPatients = async (req, res) => {
    try {
        const patients = await User.find({ role: 'patient' }).select('-password -otp -otpExpires -resetPasswordToken -resetPasswordExpire');
        res.json(patients);
    } catch (err) { console.error(err.message); res.status(500).send('Server Error'); }
};

// @desc    Get all users with the 'doctor' role and their profiles
exports.getAllDoctors = async (req, res) => {
    try {
        const doctors = await DoctorProfile.find().populate('user', '-password -otp -otpExpires -resetPasswordToken -resetPasswordExpire');
        res.json(doctors);
    } catch (err) { console.error(err.message); res.status(500).send('Server Error'); }
};

// @desc    Get all appointments in the system
exports.getAllAppointments = async (req, res) => {
    try {
        const appointments = await Appointment.find()
            .populate('patient', 'name')
            .populate('doctor', 'name')
            .sort({ appointmentDate: -1 });
            
        res.json(appointments);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// --- MEDICINE FUNCTIONS (THESE WERE MISSING) ---

// @desc    Get all medicines (uses public search logic)
exports.getAllMedicines = async (req, res) => {
    try {
        const { search } = req.query;
        let query = {};
        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }
        const medicines = await Medicine.find(query);
        res.json(medicines);
    } catch (err) {
        console.error('Error fetching medicines:', err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Add a new medicine
exports.addMedicine = async (req, res) => {
    try {
        if (req.user.role !== 'admin') { return res.status(403).json({ msg: 'User not authorized' }); }
        if (!req.file) { return res.status(400).json({ msg: 'Please upload a medicine image.' }); }
        const { name, description, price, manufacturer, stock } = req.body;
        const newMedicine = new Medicine({
            name, description, price, manufacturer, stock,
            imageUrl: req.file.path,
        });
        await newMedicine.save();
        res.status(201).json(newMedicine);
    } catch (err) { console.error('Error adding medicine:', err.message); res.status(500).send('Server Error'); }
};

// @desc    Update a medicine
exports.updateMedicine = async (req, res) => {
    try {
        if (req.user.role !== 'admin') { return res.status(403).json({ msg: 'User not authorized' }); }
        let medicine = await Medicine.findById(req.params.id);
        if (!medicine) { return res.status(404).json({ msg: 'Medicine not found' }); }
        const updateData = { ...req.body };
        if (req.file) {
            updateData.imageUrl = req.file.path;
            if (medicine.imageUrl && medicine.imageUrl.includes('cloudinary')) {
                try {
                    const publicId = medicine.imageUrl.split('/').pop().split('.')[0];
                    const publicIdWithFolder = `smarthealth_profiles/${publicId}`;
                    await cloudinary.uploader.destroy(publicIdWithFolder);
                } catch (cloudinaryError) { console.error('Failed to delete old image:', cloudinaryError); }
            }
        }
        medicine = await Medicine.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
        res.json(medicine);
    } catch (err) { console.error('Error updating medicine:', err.message); res.status(500).send('Server Error'); }
};

// @desc    Delete a medicine
exports.deleteMedicine = async (req, res) => {
    try {
        if (req.user.role !== 'admin') { return res.status(403).json({ msg: 'User not authorized' }); }
        const medicine = await Medicine.findById(req.params.id);
        if (!medicine) { return res.status(404).json({ msg: 'Medicine not found' }); }
        if (medicine.imageUrl && medicine.imageUrl.includes('cloudinary')) {
            try {
                const publicId = medicine.imageUrl.split('/').pop().split('.')[0];
                const publicIdWithFolder = `smarthealth_profiles/${publicId}`;
                await cloudinary.uploader.destroy(publicIdWithFolder);
            } catch (cloudinaryError) { console.error('Failed to delete image:', cloudinaryError); }
        }
        await medicine.deleteOne();
        res.json({ msg: 'Medicine removed' });
    } catch (err) { console.error('Error deleting medicine:', err.message); res.status(500).send('Server Error'); }
};