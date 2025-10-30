import api from './api';

// For the medicine cart checkout
const createCheckoutSession = (cartItems) => {
    return api.post('/payments/create-checkout-session', { cartItems });
};

// --- ADD THESE NEW FUNCTIONS ---

// For the appointment booking checkout
const createAppointmentCheckoutSession = (appointmentData) => {
    return api.post('/payments/create-appointment-session', appointmentData);
};

// To verify the payment after Stripe redirects back
const verifyAppointmentPayment = (sessionId) => {
    return api.post('/payments/verify-appointment-payment', { session_id: sessionId });
};

export default {
    createCheckoutSession,
    createAppointmentCheckoutSession,
    verifyAppointmentPayment,
};