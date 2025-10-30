const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../config/cloudinary');
const { uploadProfilePicture } = require('../controllers/uploadController');

router.post(
    '/profile-picture',
    authMiddleware,
    upload.single('profilePicture'),
    uploadProfilePicture
);

module.exports = router;