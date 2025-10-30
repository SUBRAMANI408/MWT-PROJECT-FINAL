const mongoose = require('mongoose');

const SurgerySchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title for the surgery'],
        trim: true,
        unique: true
    },
    imageUrl: {
        type: String,
        required: [true, 'Please add an image URL'],
    },
    summary: {
        type: String,
        required: [true, 'Please add a short summary'],
        maxlength: [200, 'Summary cannot be more than 200 characters']
    },
    specialistToConsult: {
        type: String,
        required: [true, 'Please add the type of specialist to consult'],
    },
    detailedDescription: {
        type: String,
        required: [true, 'Please add a detailed description']
    },
    procedureAndTreatment: {
        type: String,
        required: [true, 'Please add information on the procedure and treatment']
    },
    // You can add more fields here later if needed
    // e.g., risks: String, recovery: String
}, { timestamps: true });

module.exports = mongoose.model('Surgery', SurgerySchema);