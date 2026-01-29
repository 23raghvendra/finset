// API Configuration
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Get token from localStorage
const getToken = () => {
    return localStorage.getItem('token');
};

// Set token in localStorage
export const setToken = (token) => {
    localStorage.setItem('token', token);
};

// Remove token from localStorage
export const removeToken = () => {
    localStorage.removeItem('token');
};

// Clear all user data from localStorage
export const clearAllUserData = () => {
    const keysToRemove = [
        'token',
        'offlineMode',
        'lastSyncTime',
        'theme',
        'virtualScrollEnabled',
        'dashboardLayout',
        'finance_categories',
        'categories_migrated',
        'preferences_migrated',
        'onboarding_completed'
    ];
    
    keysToRemove.forEach(key => {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            
        }
    });
};

// Clear IndexedDB
export const clearIndexedDB = async () => {
    try {
        const DB_NAME = 'financeTrackerOffline';
        return new Promise((resolve, reject) => {
            const request = indexedDB.deleteDatabase(DB_NAME);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
            request.onblocked = () => {
                resolve();
            };
        });
    } catch (e) {
        
    }
};

// Check if token is expired
const isTokenExpired = (token) => {
    if (!token) return true;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiry = payload.exp * 1000;
        return Date.now() >= expiry;
    } catch (error) {
        return true;
    }
};

// Handle 401 - force logout and redirect to login
const handle401 = async () => {
    localStorage.clear();
    sessionStorage.clear();
    try {
        await clearIndexedDB();
    } catch (e) {}
    // Redirect to login
    if (window.location.pathname !== '/') {
        window.location.href = '/';
    }
};

// API request helper
const apiRequest = async (endpoint, options = {}) => {
    const token = getToken();
    
    // Check if token is expired before making request
    if (token && isTokenExpired(token)) {
        await handle401();
        throw new Error('Session expired. Please login again.');
    }

    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
        },
        ...options,
    };

    try {
        const response = await fetch(`${API_URL}${endpoint}`, config);
        
        // Handle 401 Unauthorized
        if (response.status === 401) {
            await handle401();
            throw new Error('Session expired. Please login again.');
        }
        
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Something went wrong');
        }

        return data;
    } catch (error) {
        // Don't log session expired errors
        if (!error.message.includes('Session expired')) {
            console.error('API Error:', error);
        }
        throw error;
    }
};

// Auth API
export const authAPI = {
    register: async (userData) => {
        clearAllUserData();
        await clearIndexedDB();
        
        const data = await apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
        if (data.data.token) {
            setToken(data.data.token);
        }
        return data;
    },

    login: async (credentials) => {
        clearAllUserData();
        await clearIndexedDB();
        
        const data = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });
        if (data.data.token) {
            setToken(data.data.token);
        }
        return data;
    },

    logout: async () => {
        removeToken();
        clearAllUserData();
        await clearIndexedDB();
    },

    getMe: async () => {
        return await apiRequest('/auth/me');
    },
};

// Transaction API
export const transactionAPI = {
    getAll: async (filters = {}) => {
        const queryParams = new URLSearchParams(filters).toString();
        const endpoint = queryParams ? `/transactions?${queryParams}` : '/transactions';
        return await apiRequest(endpoint);
    },

    getById: async (id) => {
        return await apiRequest(`/transactions/${id}`);
    },

    create: async (transactionData) => {
        return await apiRequest('/transactions', {
            method: 'POST',
            body: JSON.stringify(transactionData),
        });
    },

    update: async (id, transactionData) => {
        return await apiRequest(`/transactions/${id}`, {
            method: 'PUT',
            body: JSON.stringify(transactionData),
        });
    },

    delete: async (id) => {
        return await apiRequest(`/transactions/${id}`, {
            method: 'DELETE',
        });
    },

    getStats: async () => {
        return await apiRequest('/transactions/stats');
    },
};

// Budget API
export const budgetAPI = {
    getAll: async () => {
        return await apiRequest('/budgets');
    },

    getById: async (id) => {
        return await apiRequest(`/budgets/${id}`);
    },

    create: async (budgetData) => {
        return await apiRequest('/budgets', {
            method: 'POST',
            body: JSON.stringify(budgetData),
        });
    },

    update: async (id, budgetData) => {
        return await apiRequest(`/budgets/${id}`, {
            method: 'PUT',
            body: JSON.stringify(budgetData),
        });
    },

    delete: async (id) => {
        return await apiRequest(`/budgets/${id}`, {
            method: 'DELETE',
        });
    },
};

// Savings Goal API
export const goalAPI = {
    getAll: async () => {
        return await apiRequest('/goals');
    },

    getById: async (id) => {
        return await apiRequest(`/goals/${id}`);
    },

    create: async (goalData) => {
        return await apiRequest('/goals', {
            method: 'POST',
            body: JSON.stringify(goalData),
        });
    },

    update: async (id, goalData) => {
        return await apiRequest(`/goals/${id}`, {
            method: 'PUT',
            body: JSON.stringify(goalData),
        });
    },

    delete: async (id) => {
        return await apiRequest(`/goals/${id}`, {
            method: 'DELETE',
        });
    },

    contribute: async (id, amount) => {
        return await apiRequest(`/goals/${id}/contribute`, {
            method: 'POST',
            body: JSON.stringify({ amount }),
        });
    },
};

export default {
    auth: authAPI,
    transactions: transactionAPI,
    budgets: budgetAPI,
    goals: goalAPI,
};
