const Medicine = require('../models/Medicine');
const cloudinary = require('cloudinary').v2; // Import Cloudinary

// @desc    Search/Get medicines
// @route   GET /api/medicines
// @access  Public
exports.searchMedicines = async (req, res) => {
    try {
        const { search } = req.query;
        let query = {};

        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        const medicines = await Medicine.find(query);
        res.json(medicines);
    } catch (err) {
        console.error('Error searching medicines:', err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get single medicine by ID
// @route   GET /api/medicines/:id
// @access  Public
exports.getMedicineById = async (req, res) => {
    try {
        const medicine = await Medicine.findById(req.params.id);
        if (!medicine) {
            return res.status(404).json({ msg: 'Medicine not found' });
        }
        res.json(medicine);
    } catch (err) {
        console.error('Error getting medicine:', err.message);
        res.status(500).send('Server Error');
    }
};

// --- ADMIN ONLY ---

// @desc    Add a new medicine (INCLUDES IMAGE UPLOAD)
// @route   POST /api/medicines
// @access  Private (Admin)
exports.addMedicine = async (req, res) => {
    try {
        // Simple admin role check
        if (req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'User not authorized' });
        }

        // Check for image file
        if (!req.file) {
            return res.status(400).json({ msg: 'Please upload a medicine image.' });
        }

        const {
            name,
            description,
            price,
            manufacturer,
            stock,
            ingredientsAndBenefits,
            uses,
            dosage,
            generalWarnings
        } = req.body;

        const newMedicine = new Medicine({
            name,
            description,
            price,
            manufacturer,
            stock,
            ingredientsAndBenefits,
            uses,
            dosage,
            generalWarnings,
            imageUrl: req.file.path, // Cloudinary image URL
        });

        await newMedicine.save();
        res.status(201).json(newMedicine);
    } catch (err) {
        console.error('Error adding medicine:', err.message);
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ msg: messages.join(', ') });
        }
        res.status(500).send('Server Error');
    }
};

// @desc    Update a medicine (INCLUDES IMAGE UPDATE)
// @route   PUT /api/medicines/:id
// @access  Private (Admin)
exports.updateMedicine = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'User not authorized' });
        }

        let medicine = await Medicine.findById(req.params.id);
        if (!medicine) {
            return res.status(404).json({ msg: 'Medicine not found' });
        }

        const updateData = { ...req.body };

        // If a new image is uploaded, replace the old one
        if (req.file) {
            updateData.imageUrl = req.file.path;

            // Delete the old image from Cloudinary (if exists)
            if (medicine.imageUrl) {
                try {
                    const publicIdWithFolder = medicine.imageUrl
                        .split('/')
                        .slice(-2)
                        .join('/')
                        .split('.')[0];
                    await cloudinary.uploader.destroy(publicIdWithFolder);
                } catch (cloudinaryError) {
                    console.error('Failed to delete old image from Cloudinary:', cloudinaryError);
                }
            }
        }

        medicine = await Medicine.findByIdAndUpdate(req.params.id, updateData, {
            new: true,
            runValidators: true
        });

        res.json(medicine);
    } catch (err) {
        console.error('Error updating medicine:', err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Delete a medicine
// @route   DELETE /api/medicines/:id
// @access  Private (Admin)
exports.deleteMedicine = async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({ msg: 'User not authorized' });
        }

        const medicine = await Medicine.findById(req.params.id);
        if (!medicine) {
            return res.status(404).json({ msg: 'Medicine not found' });
        }

        // Delete image from Cloudinary if available
        if (medicine.imageUrl) {
            try {
                const publicIdWithFolder = medicine.imageUrl
                    .split('/')
                    .slice(-2)
                    .join('/')
                    .split('.')[0];
                await cloudinary.uploader.destroy(publicIdWithFolder);
            } catch (cloudinaryError) {
                console.error('Failed to delete image from Cloudinary:', cloudinaryError);
            }
        }

        await medicine.deleteOne();
        res.json({ msg: 'Medicine removed' });
    } catch (err) {
        console.error('Error deleting medicine:', err.message);
        res.status(500).send('Server Error');
    }
};
