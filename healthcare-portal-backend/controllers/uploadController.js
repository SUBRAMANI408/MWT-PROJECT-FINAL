const User = require('../models/User');

exports.uploadProfilePicture = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ msg: 'No file uploaded.' });
        }

        // req.file.path contains the secure URL from Cloudinary
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { profilePicture: req.file.path },
            { new: true }
        );

        res.json({
            msg: 'Profile picture uploaded successfully.',
            url: user.profilePicture,
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};