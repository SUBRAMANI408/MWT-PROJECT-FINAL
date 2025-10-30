import api from './api';

// ============================================================
// @desc   Get the logged-in doctor's own profile
// @route  GET /doctor/me
// ============================================================
const getMyProfile = () => {
    return api.get('/doctor/me');
};

// ============================================================
// @desc   Create or update the logged-in doctor's profile
// @route  POST /doctor/me
// ============================================================
const updateMyProfile = (profileData) => {
    return api.post('/doctor/me', profileData);
};

// ============================================================
// @desc   Get all doctors (with optional search/filter parameters)
// @usage  getAllDoctors({ search: 'Cardiologist' }) or getAllDoctors({ search: 'Mumbai' })
// @route  GET /doctor
// ============================================================
const getAllDoctors = (filters = {}) => {
    const params = new URLSearchParams(filters);
    return api.get(`/doctor?${params.toString()}`);
};

// ============================================================
// @desc   Upload doctor profile picture
// @route  POST /upload/profile-picture
// ============================================================
const uploadProfilePicture = (formData) => {
    return api.post('/upload/profile-picture', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

// ============================================================
// @desc   Get all unique doctor specializations
// @route  GET /doctor/specializations
// ============================================================
const getSpecializations = () => {
    return api.get('/doctor/specializations');
};

// ============================================================
// @desc   Get doctor details by ID
// @route  GET /doctor/:id
// ============================================================
const getDoctorById = (id) => {
    return api.get(`/doctor/${id}`);
};

// ============================================================
// Export all service functions
// ============================================================
export default {
    getMyProfile,
    updateMyProfile,
    getAllDoctors,
    uploadProfilePicture,
    getSpecializations,
    getDoctorById, // <-- added new export
};
