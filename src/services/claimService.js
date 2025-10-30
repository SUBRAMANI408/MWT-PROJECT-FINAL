import api from './api';

// Get all of the patient's claims
const getMyClaims = () => {
    return api.get('/claims/my');
};

// Submit a new claim
// formData will contain the files and text data
const submitClaim = (formData) => {
    return api.post('/claims', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

export default {
    getMyClaims,
    submitClaim,
};