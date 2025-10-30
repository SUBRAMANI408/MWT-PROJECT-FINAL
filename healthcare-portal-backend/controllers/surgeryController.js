const Surgery = require('../models/Surgery');

// @desc    Get all surgeries (for patients to browse)
// @route   GET /api/surgeries
// @access  Private (for logged-in users)
exports.getAllSurgeries = async (req, res) => {
    try {
        const surgeries = await Surgery.find().select('title imageUrl summary');
        res.json(surgeries);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Get a single surgery by ID
// @route   GET /api/surgeries/:id
// @access  Private (for logged-in users)
exports.getSurgeryById = async (req, res) => {
    try {
        const surgery = await Surgery.findById(req.params.id);
        if (!surgery) {
            return res.status(404).json({ msg: 'Surgery information not found' });
        }
        res.json(surgery);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// --- ADMIN ONLY FUNCTIONS ---

// @desc    Add a new surgery
// @route   POST /api/surgeries
// @access  Private (Admin)
exports.addSurgery = async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ msg: 'User not authorized' });
    }
    
    try {
        const newSurgery = new Surgery({ ...req.body });
        await newSurgery.save();
        res.status(201).json(newSurgery);
    } catch (err) {
        console.error(err.message);
        if (err.name === 'ValidationError') {
            const messages = Object.values(err.errors).map(val => val.message);
            return res.status(400).json({ msg: messages.join(', ') });
        }
        res.status(500).send('Server Error');
    }
};

// @desc    Update a surgery
// @route   PUT /api/surgeries/:id
// @access  Private (Admin)
exports.updateSurgery = async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ msg: 'User not authorized' });
    }

    try {
        let surgery = await Surgery.findById(req.params.id);
        if (!surgery) {
            return res.status(404).json({ msg: 'Surgery not found' });
        }
        
        surgery = await Surgery.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.json(surgery);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @desc    Delete a surgery
// @route   DELETE /api/surgeries/:id
// @access  Private (Admin)
exports.deleteSurgery = async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ msg: 'User not authorized' });
    }

    try {
        const surgery = await Surgery.findById(req.params.id);
        if (!surgery) {
            return res.status(404).json({ msg: 'Surgery not found' });
        }
        
        await surgery.deleteOne();
        res.json({ msg: 'Surgery information removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};