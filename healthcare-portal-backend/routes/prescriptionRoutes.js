const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../config/cloudinary');

// --- Import all controller functions ---
const { 
    uploadPrescription, 
    getMyPrescriptions, 
    deletePrescription, 
    getPrescriptionsForPatient // <-- NEW function
} = require('../controllers/prescriptionController');

// ===================================================
// @route   POST /api/prescriptions/upload
// @desc    Upload a prescription image
// @access  Private (Patient)
// ===================================================
router.post(
    '/upload',
    authMiddleware,
    upload.single('prescriptionImage'), // Field name for file input in form-data
    uploadPrescription
);

// ===================================================
// @route   GET /api/prescriptions/my
// @desc    Get all prescriptions for the logged-in patient
// @access  Private (Patient)
// ===================================================
router.get('/my', authMiddleware, getMyPrescriptions);

// ===================================================
// @route   GET /api/prescriptions/patient/:patientId
// @desc    Get a specific patient's prescriptions (for doctors)
// @access  Private (Doctor)
// ===================================================
router.get('/patient/:patientId', authMiddleware, getPrescriptionsForPatient);

// ===================================================
// @route   DELETE /api/prescriptions/:id
// @desc    Delete a prescription
// @access  Private (Patient)
// ===================================================
router.delete('/:id', authMiddleware, deletePrescription);

module.exports = router;
