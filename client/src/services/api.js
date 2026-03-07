import axios from 'axios';

const API_BASE_URL = '/api';

const api = {
    getHeaders: () => {
        const apiKey = localStorage.getItem('openai_api_key');
        return apiKey ? { 'x-api-key': apiKey } : {};
    },

    generateSummary: (data) => axios.post(`${API_BASE_URL}/generate/summary`, data, { headers: api.getHeaders() }),
    generateSkills: (data) => axios.post(`${API_BASE_URL}/generate/skills`, data, { headers: api.getHeaders() }),
    generateCoverLetter: (data) => axios.post(`${API_BASE_URL}/generate/cover-letter`, data, { headers: api.getHeaders() }),
    generateBio: (data) => axios.post(`${API_BASE_URL}/generate/bio`, data, { headers: api.getHeaders() }),
    checkHealth: () => axios.get(`${API_BASE_URL}/health`)
};

export default api;
