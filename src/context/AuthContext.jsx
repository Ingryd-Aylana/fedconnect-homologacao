// src/contexts/AuthContext.js
import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api.js';

const AuthContext = createContext(null);

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const login = useCallback(async (credentials) => {
        setLoading(true);
        try {
            // 1. Faz a requisição de login
            const response = await api.post('/login/', credentials);
            localStorage.setItem('accessToken', response.data.access);
            const userResponse = await api.get('/users/me/');
            setUser(userResponse.data);
            setIsAuthenticated(true);

            return { success: true };
        } catch (error) {
            console.error("Login failed:", error.response?.data || error.message);
            localStorage.removeItem('accessToken');
            setIsAuthenticated(false);
            setUser(null);

            return {
                success: false,
                error:
                    typeof error.response?.data?.detail === 'string'
                        ? error.response.data.detail
                        : JSON.stringify(error.response?.data?.detail) || "Falha ao tentar fazer login."
            };
        } finally {
            setLoading(false);
        }
    }, []);


    const logout = useCallback(() => {
        // Remove o token do localStorage
        localStorage.removeItem('accessToken');
        setUser(null);
        setIsAuthenticated(false);
        navigate('/login');
    }, [navigate]);

    useEffect(() => {
        const checkAuthStatus = async () => {
            // Tenta obter o token do localStorage
            const token = localStorage.getItem('accessToken');

            // Se não houver token, o usuário não está autenticado
            if (!token) {
                setLoading(false);
                setIsAuthenticated(false);
                if (window.location.pathname !== '/login') {
                    navigate('/login');
                }
                return;
            }


            try {
                const response = await api.get('/users/me/');
                setUser(response.data);
                setIsAuthenticated(true);
            } catch (error) {
                // Se a requisição falhar, o token é inválido/expirado
                console.log("Usuário não autenticado ou sessão expirada:", error.response?.status);
                // Remove o token inválido para evitar futuras requisições
                localStorage.removeItem('accessToken');
                setUser(null);
                setIsAuthenticated(false);

                if (window.location.pathname !== '/login') {
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };
        checkAuthStatus();
    }, [navigate]);

    const authContextValue = useMemo(() => ({
        user,
        isAuthenticated,
        loading,
        login,
        logout,
    }), [user, isAuthenticated, loading, login, logout]);

    return (
        <AuthContext.Provider value={authContextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;