const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    appointmentDate: {
        type: Date,
        required: true,
    },
    timeSlot: {
        type: String, // e.g., "09:00"
        required: true,
    },
    status: {
        type: String,
        enum: ['Scheduled', 'Completed', 'Cancelled'],
        default: 'Scheduled',
    },

    // --- Visibility for patient ---
    patientVisible: {
        type: Boolean,
        default: true,
    },

    // --- Track if the patient has reviewed the doctor ---
    isReviewed: {
        type: Boolean,
        default: false,
    },

    // --- NEW FIELD: Unique Video Call Room ID ---
    videoCallId: {
        type: String, // Unique identifier for video call session
    },

}, { timestamps: true });

module.exports = mongoose.model('Appointment', AppointmentSchema);
