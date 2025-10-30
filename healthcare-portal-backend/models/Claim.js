const mongoose = require('mongoose');

const ClaimSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    insuranceProvider: {
        type: String,
        required: [true, 'Please enter your insurance provider'],
    },
    policyNumber: {
        type: String,
        required: [true, 'Please enter your policy number'],
    },
    hospitalBillUrl: {
        type: String,
        required: [true, 'Please upload the hospital bill'],
    },
    medicalReportsUrl: {
        type: String,
        required: [true, 'Please upload your medical reports'],
    },
    notes: {
        type: String,
    },
    status: {
        type: String,
        enum: ['Pending', 'In Review', 'Approved', 'Rejected'],
        default: 'Pending',
    },
}, { timestamps: true });

module.exports = mongoose.model('Claim', ClaimSchema);