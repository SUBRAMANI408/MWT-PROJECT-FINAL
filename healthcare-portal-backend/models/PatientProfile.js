// healthcare-portal-backend/models/PatientProfile.js
const mongoose = require('mongoose');

const PatientProfileSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    firstName: { type: String, required: [true, 'First name is required'] },
    lastName: { type: String, required: [true, 'Last name is required'] },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['Male', 'Female', 'Other'] },
    contactNumber: { type: String, required: [true, 'Contact number is required'] },
    medicalHistory: [{
        condition: String,
        diagnosedDate: Date,
        notes: String
    }],
    insuranceDetails: {
        provider: { type: String, required: [true, 'Insurance provider is required'] },
        policyNumber: { type: String, required: [true, 'Policy number is required'] }
    }
}, { timestamps: true });

module.exports = mongoose.model('PatientProfile', PatientProfileSchema);