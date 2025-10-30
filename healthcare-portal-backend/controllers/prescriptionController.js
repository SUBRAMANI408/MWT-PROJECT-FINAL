const Prescription = require('../models/Prescription');
const Appointment = require('../models/Appointment'); // For doctor-patient relationship check
const User = require('../models/User');
const cloudinary = require('cloudinary').v2;

// ================================================
// @desc    Upload a new prescription image
// @route   POST /api/prescriptions/upload
// @access  Private (Patient)
// ================================================
exports.uploadPrescription = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ msg: 'No prescription file uploaded.' });
        }

        const newPrescription = new Prescription({
            patient: req.user.id, // Logged-in user's ID from authMiddleware
            imageUrl: req.file.path, // Cloudinary image URL
        });

        await newPrescription.save();

        res.status(201).json({
            msg: 'Prescription uploaded successfully.',
            prescription: newPrescription,
        });

    } catch (err) {
        console.error('Error uploading prescription:', err.message);
        res.status(500).send('Server Error');
    }
};

// ================================================
// @desc    Get all prescriptions for the logged-in patient
// @route   GET /api/prescriptions/my
// @access  Private (Patient)
// ================================================
exports.getMyPrescriptions = async (req, res) => {
    try {
        const prescriptions = await Prescription.find({ patient: req.user.id }).sort({ createdAt: -1 }); // Show newest first
        res.json(prescriptions);
    } catch (err) {
        console.error('Error fetching prescriptions:', err.message);
        res.status(500).send('Server Error');
    }
};

// ================================================
// @desc    Delete a prescription
// @route   DELETE /api/prescriptions/:id
// @access  Private (Patient)
// ================================================
exports.deletePrescription = async (req, res) => {
    try {
        const prescription = await Prescription.findById(req.params.id);

        if (!prescription) {
            return res.status(404).json({ msg: 'Prescription not found' });
        }

        // Make sure the logged-in user owns the prescription
        if (prescription.patient.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        // Optional: Delete the image from Cloudinary as well
        try {
            // Extract the public ID from the Cloudinary URL
            const publicId = prescription.imageUrl.split('/').pop().split('.')[0];
            // Adjust path if your Cloudinary folder structure differs
            await cloudinary.uploader.destroy(`smarthealth_profiles/${publicId}`);
            console.log(`Deleted image from Cloudinary: ${publicId}`);
        } catch (cloudinaryError) {
            console.error('Cloudinary delete error (proceeding with DB deletion):', cloudinaryError);
        }

        await prescription.deleteOne(); // Delete from DB

        res.json({ msg: 'Prescription removed' });
    } catch (err) {
        console.error('Error deleting prescription:', err.message);
        res.status(500).send('Server Error');
    }
};

// ================================================
// @desc    Get all prescriptions for a specific patient (for doctors)
// @route   GET /api/prescriptions/patient/:patientId
// @access  Private (Doctor)
// ================================================
exports.getPrescriptionsForPatient = async (req, res) => {
    try {
        const doctorId = req.user.id;
        const patientId = req.params.patientId;

        // Security Check: Verify that this doctor has an appointment with this patient
        const appointmentExists = await Appointment.findOne({
            doctor: doctorId,
            patient: patientId
        });

        if (!appointmentExists) {
            return res.status(403).json({ msg: 'Not authorized to view this patient\'s records.' });
        }

        // If authorized, fetch the patient's prescriptions
        const prescriptions = await Prescription.find({ patient: patientId }).sort({ createdAt: -1 });
        
        res.json(prescriptions);

    } catch (err) {
        console.error('Error fetching patient prescriptions:', err.message);
        res.status(500).send('Server Error');
    }
};
