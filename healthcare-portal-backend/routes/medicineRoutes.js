const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../config/cloudinary'); // Import upload config
const {
    searchMedicines,
    getMedicineById,
    addMedicine,
    updateMedicine,
    deleteMedicine
} = require('../controllers/medicineController');

// ==========================
// 🌐 Public Routes
// ==========================

// @route   GET /api/medicines
// @desc    Search or get all medicines
router.get('/', searchMedicines);

// @route   GET /api/medicines/:id
// @desc    Get a single medicine by ID
router.get('/:id', getMedicineById);

// ==========================
// 🔒 Admin Routes (Protected)
// ==========================

// @route   POST /api/medicines
// @desc    Add a new medicine (handles image upload)
router.post(
    '/',
    authMiddleware,
    upload.single('medicineImage'), // Expect a file field named 'medicineImage'
    addMedicine
);

// @route   PUT /api/medicines/:id
// @desc    Update a medicine (also handles image upload)
router.put(
    '/:id',
    authMiddleware,
    upload.single('medicineImage'), // Added for image update support
    updateMedicine
);

// @route   DELETE /api/medicines/:id
// @desc    Delete a medicine
router.delete('/:id', authMiddleware, deleteMedicine);

module.exports = router;
