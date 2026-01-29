import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, clearAllUserData, clearIndexedDB } from '../services/api';

const AuthContext = createContext();

// Helper to check if JWT token is expired
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

// Force clear everything and reload
const forceLogout = async () => {
    localStorage.clear();
    sessionStorage.clear();
    try {
        await clearIndexedDB();
    } catch (e) {}
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            
            // If no token or token is expired, clear everything
            if (!token || isTokenExpired(token)) {
                await forceLogout();
                setUser(null);
                setLoading(false);
                return;
            }
            
            try {
                const response = await authAPI.getMe();
                setUser(response.data);
            } catch (err) {
                // Token is invalid, force logout
                console.log('Auth check failed, logging out');
                await forceLogout();
                setUser(null);
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    const register = async (userData) => {
        try {
            setError(null);
            const response = await authAPI.register(userData);
            setUser(response.data);
            return response;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    const login = async (credentials) => {
        try {
            setError(null);
            const response = await authAPI.login(credentials);
            setUser(response.data);
            return response;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    const logout = async () => {
        try {
            await forceLogout();
            setUser(null);
            window.location.href = '/';
        } catch (err) {
            setUser(null);
            window.location.href = '/';
        }
    };

    const value = {
        user,
        loading,
        error,
        register,
        login,
        logout,
        isAuthenticated: !!user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
