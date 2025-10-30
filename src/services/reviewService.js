import api from './api';

const createReview = (doctorId, appointmentId, reviewData) => {
    return api.post(`/reviews/${doctorId}/${appointmentId}`, reviewData);
};

const getReviewsForDoctor = (doctorId) => {
    return api.get(`/reviews/${doctorId}`);
};

export default {
    createReview,
    getReviewsForDoctor,
};