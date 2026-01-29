import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Get auth token
const getAuthToken = () => {
  const token = localStorage.getItem('token');
  return token;
};

// Create axios instances with auth
const assetAPI = axios.create({
  baseURL: `${API_URL}/assets`,
  headers: { 'Content-Type': 'application/json' },
});

const liabilityAPI = axios.create({
  baseURL: `${API_URL}/liabilities`,
  headers: { 'Content-Type': 'application/json' },
});

const preferenceAPI = axios.create({
  baseURL: `${API_URL}/preferences`,
  headers: { 'Content-Type': 'application/json' },
});

// Add auth token to all requests
[assetAPI, liabilityAPI, preferenceAPI].forEach(api => {
  api.interceptors.request.use((config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
});

// ==================== ASSETS ====================

export const getAssets = async () => {
  try {
    const response = await assetAPI.get('/');
    return response.data.assets;
  } catch (error) {
    throw error;
  }
};

export const createAsset = async (assetData) => {
  try {
    const response = await assetAPI.post('/', assetData);
    return response.data.asset;
  } catch (error) {
    throw error;
  }
};

export const updateAsset = async (id, assetData) => {
  try {
    const response = await assetAPI.put(`/${id}`, assetData);
    return response.data.asset;
  } catch (error) {
    throw error;
  }
};

export const deleteAsset = async (id) => {
  try {
    const response = await assetAPI.delete(`/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAssetSummary = async () => {
  try {
    const response = await assetAPI.get('/summary');
    return response.data.summary;
  } catch (error) {
    throw error;
  }
};

// ==================== LIABILITIES ====================

export const getLiabilities = async () => {
  try {
    const response = await liabilityAPI.get('/');
    return response.data.liabilities;
  } catch (error) {
    throw error;
  }
};

export const createLiability = async (liabilityData) => {
  try {
    const response = await liabilityAPI.post('/', liabilityData);
    return response.data.liability;
  } catch (error) {
    throw error;
  }
};

export const updateLiability = async (id, liabilityData) => {
  try {
    const response = await liabilityAPI.put(`/${id}`, liabilityData);
    return response.data.liability;
  } catch (error) {
    throw error;
  }
};

export const deleteLiability = async (id) => {
  try {
    const response = await liabilityAPI.delete(`/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getLiabilitySummary = async () => {
  try {
    const response = await liabilityAPI.get('/summary');
    return response.data.summary;
  } catch (error) {
    throw error;
  }
};

// ==================== PREFERENCES ====================

export const getPreferences = async () => {
  try {
    const response = await preferenceAPI.get('/');
    return response.data.preferences;
  } catch (error) {
    throw error;
  }
};

export const updatePreferences = async (preferences) => {
  try {
    const response = await preferenceAPI.put('/', preferences);
    return response.data.preferences;
  } catch (error) {
    throw error;
  }
};

export const updatePreferenceField = async (field, value) => {
  try {
    const response = await preferenceAPI.patch(`/${field}`, { value });
    return response.data.preferences;
  } catch (error) {
    throw error;
  }
};

export const resetPreferences = async () => {
  try {
    const response = await preferenceAPI.post('/reset');
    return response.data.preferences;
  } catch (error) {
    throw error;
  }
};
