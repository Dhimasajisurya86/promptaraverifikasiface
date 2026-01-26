import axios from 'axios';

// Base URL untuk API
// Dalam development, Vite akan proxy ke localhost:8080
// Dalam production, sesuaikan dengan deployed backend URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// API Service Functions

/**
 * Register new employee dengan face image
 * @param {FormData} formData - Form data containing name, email, phone, face_image
 * @returns {Promise} API response
 */
export const registerEmployee = async (formData) => {
    const response = await api.post('/api/employees/register', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

/**
 * Get all employees
 * @returns {Promise} API response
 */
export const getEmployees = async () => {
    const response = await api.get('/api/employees');
    return response.data;
};

/**
 * Get single employee by ID
 * @param {number} id - Employee ID
 * @returns {Promise} API response
 */
export const getEmployee = async (id) => {
    const response = await api.get(`/api/employees/${id}`);
    return response.data;
};

/**
 * Check-in dengan face verification
 * @param {number} userId - Employee ID
 * @param {Blob} imageBlob - Selfie image blob
 * @returns {Promise} API response
 */
export const checkIn = async (userId, imageBlob) => {
    const formData = new FormData();
    formData.append('user_id', userId);
    formData.append('selfie_image', imageBlob, 'selfie.jpg');

    const response = await api.post('/api/attendance/checkin', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

/**
 * Get attendance history
 * @param {Object} params - Query parameters (user_id, limit)
 * @returns {Promise} API response
 */
export const getAttendances = async (params = {}) => {
    const response = await api.get('/api/attendance', { params });
    return response.data;
};

/**
 * Get today's attendance for a user
 * @param {number} userId - Employee ID
 * @returns {Promise} API response
 */
export const getTodayAttendance = async (userId) => {
    const response = await api.get(`/api/attendance/today/${userId}`);
    return response.data;
};

/**
 * Health check
 * @returns {Promise} API response
 */
export const healthCheck = async () => {
    const response = await api.get('/api/health');
    return response.data;
};

export default api;
