import api from './api';

// Verify the payment after Stripe redirect
const verifyOrderPayment = (sessionId) => {
    return api.post('/orders/verify-payment', { session_id: sessionId });
};

// Get the user's order history
const getMyOrders = () => {
    return api.get('/orders/my');
};

export default {
    verifyOrderPayment,
    getMyOrders,
};