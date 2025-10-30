const mongoose = require('mongoose');

const PrescriptionSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    imageUrl: {
        type: String,
        required: true, // URL from Cloudinary
    },
    // Optional fields you might add later:
    // doctorName: String,
    // datePrescribed: Date,
    // notes: String,
}, { timestamps: true });

module.exports = mongoose.model('Prescription', PrescriptionSchema);