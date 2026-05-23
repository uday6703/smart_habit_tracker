import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const login = async (username, password) => {
    try {
      const response = await authAPI.login({ username, password });
      const { token, id, email, role } = response.data;
      
      const userData = { id, username, email, role };
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setToken(token);
      setUser(userData);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      const message = error.response?.data?.error || 'Invalid credentials. Please try again.';
      return { success: false, error: message };
    }
  };

  const register = async (username, email, password) => {
    try {
      await authAPI.register({ username, email, password });
      return { success: true };
    } catch (error) {
      console.error('Registration error:', error);
      const message = error.response?.data?.error || 
                      (error.response?.data ? Object.values(error.response.data).join(', ') : 'Registration failed');
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAuthenticated: !!token, sidebarOpen, setSidebarOpen }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
