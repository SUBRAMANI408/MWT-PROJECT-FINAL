import api from './api';

// Get all surgeries (for the main browsing page)
const getAllSurgeries = () => {
    return api.get('/surgeries');
};

// Get details for one specific surgery
const getSurgeryById = (id) => {
    return api.get(`/surgeries/${id}`);
};

export default {
    getAllSurgeries,
    getSurgeryById,
};