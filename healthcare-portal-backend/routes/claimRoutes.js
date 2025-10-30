const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../config/cloudinary');
const { 
    submitClaim, 
    getMyClaims, 
    getAllClaims, 
    updateClaimStatus 
} = require('../controllers/claimController');

// Middleware for handling the two file uploads
const uploader = upload.fields([
    { name: 'hospitalBill', maxCount: 1 },
    { name: 'medicalReports', maxCount: 1 }
]);

// --- Patient Routes ---
router.post('/', [authMiddleware, uploader], submitClaim);
router.get('/my', authMiddleware, getMyClaims);

// --- NEW ADMIN ROUTES ---

// @route   GET /api/claims/all
// @desc    Get all claims
// @access  Private (Admin)
router.get('/all', authMiddleware, getAllClaims);

// @route   PUT /api/claims/:id/status
// @desc    Update a claim's status
// @access  Private (Admin)
router.put('/:id/status', authMiddleware, updateClaimStatus);

module.exports = router;