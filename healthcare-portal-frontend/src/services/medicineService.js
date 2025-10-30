import api from './api';

const searchMedicines = (searchTerm = '') => {
    // Pass the search term as a query parameter
    return api.get(`/medicines?search=${searchTerm}`);
};

// --- New Function to fetch a single medicine by ID ---
const getMedicineById = (id) => {
    return api.get(`/medicines/${id}`);
};

export default {
    searchMedicines,
    getMedicineById, // Export the new function
};
