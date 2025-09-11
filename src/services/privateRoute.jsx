import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import api from '../services/api'; // Certifique-se de que 'api' é a instância do Axios configurada com `withCredentials: true`

const PrivateRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyAuthentication = async () => {
      try {
        await api.get('users/me/');
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Erro na verificação da autenticação na rota privada:", error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    verifyAuthentication();
  }, []);

  if (isLoading) {
    return <div></div>;
  }

  if (isAuthenticated) {
    return <Outlet />;
  } else {
    return <Navigate to="/login" replace />;
  }
};

export default PrivateRoute;