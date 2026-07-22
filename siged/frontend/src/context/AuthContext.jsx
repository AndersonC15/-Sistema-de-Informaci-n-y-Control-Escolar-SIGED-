import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { ENDPOINTS } from '../config/endpoints';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.get(ENDPOINTS.ME)
        .then((res) => setUser(res.data))
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (numeroIdentificacion, password) => {
    const res = await api.post(ENDPOINTS.LOGIN, {
      numero_identificacion: numeroIdentificacion,
      password,
    });
    localStorage.setItem('token', res.data.token);
    setUser(res.data.user);
    return res.data;
  };

  const logout = async () => {
    try {
      await api.post(ENDPOINTS.LOGOUT);
    } catch {}
    localStorage.removeItem('token');
    setUser(null);
  };

  const hasRole = (roleName) => Boolean(user?.roles?.includes(roleName));
  const isAdministrador = () => hasRole('ADMINISTRADOR') || user?.is_superuser;
  const isAutoridadAcademica = () => hasRole('AUTORIDAD_ACADEMICA');

  return (
    <AuthContext.Provider
      value={{
        user, loading, login, logout,
        hasRole, isAdministrador, isAutoridadAcademica,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
