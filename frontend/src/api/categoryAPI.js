import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Get auth token
const getAuthToken = () => {
  const token = localStorage.getItem('token');
  return token;
};

// Create axios instance with auth
const categoryAPI = axios.create({
  baseURL: `${API_URL}/categories`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
categoryAPI.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Get all categories for user
 * @returns {Promise<object>} Object with income and expense categories
 */
export const getCategories = async () => {
  try {
    const response = await categoryAPI.get('/');
    return response.data.categories;
  } catch (error) {
    throw error;
  }
};

/**
 * Create a new category
 * @param {string} name - Category name
 * @param {string} type - 'income' or 'expense'
 * @param {string} color - Category color (optional)
 * @returns {Promise<object>} Created category
 */
export const createCategory = async (name, type, color = '#8470FF') => {
  try {
    const response = await categoryAPI.post('/', { name, type, color });
    return response.data.category;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete a category
 * @param {string} id - Category ID
 * @returns {Promise<object>} Success message
 */
export const deleteCategory = async (id) => {
  try {
    const response = await categoryAPI.delete(`/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Initialize default categories for new user
 * @returns {Promise<object>} Success message
 */
export const initDefaultCategories = async () => {
  try {
    const response = await categoryAPI.post('/init-defaults');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default categoryAPI;
