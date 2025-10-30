const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');

// --- Import all controller functions ---
const { 
    registerAdmin, 
    loginAdmin, 
    getPendingDoctors, 
    approveDoctorProfile, 
    rejectDoctorProfile,
    getAllPatients,
    getAllDoctors,
    getAllAppointments // ✅ Newly added
} = require('../controllers/adminController');

// =======================
// ✅ Admin Auth Routes
// =======================
router.post('/register', registerAdmin);
router.post('/login', loginAdmin);

// =======================
// ✅ Doctor Management Routes
// =======================
router.get('/doctors/pending', authMiddleware, getPendingDoctors);
router.put('/doctors/:doctorId/approve', authMiddleware, approveDoctorProfile);
router.put('/doctors/:doctorId/reject', authMiddleware, rejectDoctorProfile);

// =======================
// ✅ User Management Routes
// =======================
router.get('/users/patients', authMiddleware, getAllPatients);
router.get('/users/doctors', authMiddleware, getAllDoctors);

// =======================
// ✅ Appointment Management Route (NEW)
// =======================
// @route   GET /api/admin/appointments
// @desc    Get all appointments in the system
// @access  Private (Admin only)
router.get('/appointments', authMiddleware, getAllAppointments);

module.exports = router;
