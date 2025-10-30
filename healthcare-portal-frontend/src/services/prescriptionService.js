import api from './api';

// ===================================================
// @desc    Upload a new prescription image
// @route   POST /api/prescriptions/upload
// @access  Private (Patient)
// ===================================================
const uploadPrescription = (formData) => {
    return api.post('/prescriptions/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

// ===================================================
// @desc    Get all prescriptions for the logged-in patient
// @route   GET /api/prescriptions/my
// @access  Private (Patient)
// ===================================================
const getMyPrescriptions = () => {
    return api.get('/prescriptions/my');
};

// ===================================================
// @desc    Delete a prescription by ID
// @route   DELETE /api/prescriptions/:id
// @access  Private (Patient)
// ===================================================
const deletePrescription = (id) => {
    return api.delete(`/prescriptions/${id}`);
};

// ===================================================
// @desc    Get all prescriptions for a specific patient (for doctors)
// @route   GET /api/prescriptions/patient/:patientId
// @access  Private (Doctor)
// ===================================================
const getPrescriptionsForPatient = (patientId) => {
    return api.get(`/prescriptions/patient/${patientId}`);
};

// ===================================================
// Export all prescription-related service functions
// ===================================================
export default {
    uploadPrescription,
    getMyPrescriptions,
    deletePrescription,
    getPrescriptionsForPatient, // <-- NEWLY ADDED FUNCTION
};
