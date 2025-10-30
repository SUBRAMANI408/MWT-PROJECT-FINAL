// healthcare-portal-frontend/src/services/patientService.js
import api from './api';

const getMyProfile = () => {
    return api.get('/patient/me');
};

const updateMyProfile = (profileData) => {
    return api.post('/patient/me', profileData);
};

export default {
    getMyProfile,
    updateMyProfile,
};