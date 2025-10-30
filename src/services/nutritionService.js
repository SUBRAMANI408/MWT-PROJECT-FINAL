import api from './api';

const analyzeImage = (formData) => {
    return api.post('/nutrition/scan', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

export default {
    analyzeImage,
};