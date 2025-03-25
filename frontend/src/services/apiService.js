// src/services/apiService.js
import axios from 'axios';
import { API_BASE_URL } from '../config';

export const askLegalQuestion = async (question) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/api/ask-legal-question`, { question });
        return response.data;
    } catch (error) {
        console.error('Error asking legal question:', error);
        throw error;
    }
};
