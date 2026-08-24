import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authApi } from '../api/endpoints.js';
import api, { getErrorMessage } from '../api/axios.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('cc_token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await authApi.me();
      setUser(res.data.data);
    } catch (err) {
      localStorage.removeItem('cc_token');
      localStorage.removeItem('cc_user');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email, password) => {
    setError('');
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('cc_token', res.data.token);
      localStorage.setItem('cc_user', JSON.stringify(res.data.data));
      setUser(res.data.data);
      return { success: true };
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      return { success: false, message };
    }
  };

  const register = async (payload) => {
    setError('');
    try {
      const res = await api.post('/auth/register', payload);
      localStorage.setItem('cc_token', res.data.token);
      localStorage.setItem('cc_user', JSON.stringify(res.data.data));
      setUser(res.data.data);
      return { success: true };
    } catch (err) {
      const message = getErrorMessage(err);
      setError(message);
      return { success: false, message };
    }
  };

  const logout = () => {
    localStorage.removeItem('cc_token');
    localStorage.removeItem('cc_user');
    setUser(null);
  };

  const updateUserLocal = (updates) => {
    setUser((prev) => ({ ...prev, ...updates }));
    const stored = JSON.parse(localStorage.getItem('cc_user') || '{}');
    localStorage.setItem('cc_user', JSON.stringify({ ...stored, ...updates }));
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, updateUserLocal }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
