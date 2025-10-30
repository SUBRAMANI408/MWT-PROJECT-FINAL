const mongoose = require('mongoose');

const MedicineSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a medicine name'],
        trim: true,
        index: true, // Add index for faster searching
    },
    description: {
        type: String,
        required: [true, 'Please add a description'],
    },
    price: {
        type: Number,
        required: [true, 'Please add a price'],
    },
    manufacturer: {
        type: String,
        required: [true, 'Please add a manufacturer'],
    },
    imageUrl: {
        type: String, // URL from Cloudinary or another source
        required: [true, 'Please add an image URL'],
    },
    stock: { 
        type: Number,
        required: [true, 'Please add stock quantity'],
        default: 0,
    },

    // --- New Fields ---
    ingredientsAndBenefits: {
        type: String,
        default: 'Information not available.'
    },
    uses: {
        type: String,
        default: 'Information not available.'
    },
    dosage: {
        type: String,
        default: 'Consult your physician.'
    },
    generalWarnings: {
        type: String,
        default: 'Consult your physician before use.'
    },
    averageRating: {
        type: Number,
        default: 0
    },
    numberOfReviews: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('Medicine', MedicineSchema);
