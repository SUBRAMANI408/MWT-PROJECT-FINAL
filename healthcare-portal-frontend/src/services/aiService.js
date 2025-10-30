import api from './api';

const getSymptomAnalysis = (symptoms) => {
    return api.post('/ai/symptom-check', { symptoms });
};

export default {
    getSymptomAnalysis,
};