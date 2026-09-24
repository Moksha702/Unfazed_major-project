import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('unfazed_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [entitlements, setEntitlements] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch latest therapist info and tier entitlements on boot
  const refreshAuth = async () => {
    const token = localStorage.getItem('unfazed_token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await axiosInstance.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.therapist);
        setEntitlements(res.data.entitlements);
        localStorage.setItem('unfazed_user', JSON.stringify(res.data.therapist));
      }
    } catch (err) {
      console.warn('Failed to load profile:', err.message);
      localStorage.removeItem('unfazed_token');
      localStorage.removeItem('unfazed_user');
      setUser(null);
      setEntitlements(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAuth();
  }, []);

  const login = async (email, password) => {
    const res = await axiosInstance.post('/auth/login', { email, password });
    if (res.data.success) {
      localStorage.setItem('unfazed_token', res.data.token);
      localStorage.setItem('unfazed_user', JSON.stringify(res.data.therapist));
      setUser(res.data.therapist);
      setEntitlements(res.data.entitlements);
      return res.data;
    }
  };

  const register = async (formData) => {
    const res = await axiosInstance.post('/auth/register', formData);
    if (res.data.success) {
      localStorage.setItem('unfazed_token', res.data.token);
      localStorage.setItem('unfazed_user', JSON.stringify(res.data.therapist));
      setUser(res.data.therapist);
      setEntitlements(res.data.entitlements);
      return res.data;
    }
  };

  const logout = () => {
    localStorage.removeItem('unfazed_token');
    localStorage.removeItem('unfazed_user');
    setUser(null);
    setEntitlements(null);
  };

  const switchTier = async (newTier) => {
    try {
      const res = await axiosInstance.post('/auth/switch-tier', { tier: newTier });
      if (res.data.success) {
        setUser(res.data.therapist);
        setEntitlements(res.data.entitlements);
        localStorage.setItem('unfazed_user', JSON.stringify(res.data.therapist));
        return res.data;
      }
    } catch (err) {
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        entitlements,
        loading,
        login,
        register,
        logout,
        refreshAuth,
        switchTier
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
