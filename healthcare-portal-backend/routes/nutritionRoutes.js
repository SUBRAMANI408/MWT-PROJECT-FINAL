const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../config/cloudinary'); // Our multer/cloudinary config
const { scanImage } = require('../controllers/nutritionController');

// @route   POST /api/nutrition/scan
// @desc    "Scans" an image and returns simulated nutrition data
// @access  Private
router.post(
    '/scan',
    authMiddleware,
    upload.single('foodImage'), // 'foodImage' will be the name of our form field
    scanImage
);

module.exports = router;