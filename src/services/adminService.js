import api from './api';

// ==========================
// 🔐 AUTH FUNCTIONS
// ==========================
const login = (credentials) => api.post('/admin/login', credentials);
const register = (adminData) => api.post('/admin/register', adminData);

// ==========================
// 🩺 DOCTOR APPROVAL FUNCTIONS
// ==========================
const getPendingDoctors = () => api.get('/admin/doctors/pending');
const approveDoctor = (doctorId) => api.put(`/admin/doctors/${doctorId}/approve`);
const rejectDoctor = (doctorId) => api.put(`/admin/doctors/${doctorId}/reject`);

// ==========================
// 👥 USER MANAGEMENT FUNCTIONS
// ==========================
const getAllPatients = () => api.get('/admin/users/patients');
const getAllDoctors = () => api.get('/admin/users/doctors');

// ==========================
// 📅 APPOINTMENT MANAGEMENT FUNCTION
// ==========================
const getAllAppointments = () => {
    return api.get('/admin/appointments');
};

// ==========================
// 💊 MEDICINE MANAGEMENT FUNCTIONS
// ==========================
const getAllMedicines = (searchTerm = '') => {
    return api.get(`/medicines?search=${searchTerm}`); // Public search route
};

const addMedicine = (formData) => {
    // Send as multipart/form-data because it includes an image
    return api.post('/medicines', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

const updateMedicine = (id, formData) => {
    return api.put(`/medicines/${id}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

const deleteMedicine = (id) => {
    return api.delete(`/medicines/${id}`);
};

// ==========================
// 🏥 SURGERY MANAGEMENT FUNCTIONS
// ==========================
const getAllSurgeries = () => {
    return api.get('/surgeries');
};

const addSurgery = (surgeryData) => {
    return api.post('/surgeries', surgeryData);
};

const updateSurgery = (id, surgeryData) => {
    return api.put(`/surgeries/${id}`, surgeryData);
};

const deleteSurgery = (id) => {
    return api.delete(`/surgeries/${id}`);
};

// ==========================
// 🧾 CLAIM MANAGEMENT FUNCTIONS (NEW)
// ==========================
const getAllClaims = () => {
    return api.get('/claims/all');
};

const updateClaimStatus = (id, status) => {
    return api.put(`/claims/${id}/status`, { status });
};

// ==========================
// ✅ EXPORTS
// ==========================
export default {
    // --- Auth ---
    login,
    register,

    // --- Doctor Approval ---
    getPendingDoctors,
    approveDoctor,
    rejectDoctor,

    // --- User Management ---
    getAllPatients,
    getAllDoctors,

    // --- Appointments ---
    getAllAppointments,

    // --- Medicines ---
    getAllMedicines,
    addMedicine,
    updateMedicine,
    deleteMedicine,

    // --- Surgeries ---
    getAllSurgeries,
    addSurgery,
    updateSurgery,
    deleteSurgery,

    // --- Claims (New) ---
    getAllClaims,
    updateClaimStatus,
};
