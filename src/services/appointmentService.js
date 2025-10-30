// src/services/appointmentService.js
import api from './api';

// Fetch available time slots for a doctor on a specific date
const getAvailableSlots = (doctorId, date) => {
    return api.get(`/appointments/availability?doctorId=${doctorId}&date=${date}`);
};

// Create a new appointment
const createAppointment = (appointmentData) => {
    return api.post('/appointments', appointmentData);
};

// Fetch all appointments for the logged-in user (patient or doctor)
const getMyAppointments = () => {
    return api.get('/appointments/my-appointments');
};

// Cancel an appointment (for patients)
const cancelAppointment = (appointmentId) => {
    return api.put(`/appointments/${appointmentId}/cancel`);
};

// Mark an appointment as completed (for doctors)
const completeAppointment = (appointmentId) => {
    return api.put(`/appointments/${appointmentId}/complete`);
};

// --- NEW FUNCTION ---
// Hide an appointment (for patients)
const hideAppointment = (appointmentId) => {
    return api.put(`/appointments/${appointmentId}/hide`);
};

// --- NEW FUNCTION ---
// Reschedule an appointment (for patients/doctors)
const rescheduleAppointment = (appointmentId, newDateInfo) => {
    return api.put(`/appointments/${appointmentId}/reschedule`, newDateInfo);
};

// Export all functions
export default {
    getAvailableSlots,
    createAppointment,
    getMyAppointments,
    cancelAppointment,
    completeAppointment,
    hideAppointment,
    rescheduleAppointment,
};
