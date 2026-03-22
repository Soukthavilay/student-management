import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { api } from '../services/api';
import { setAuthFailureHandler } from '../services/http';
import { clearCache } from '../services/cache';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDark, setIsDark] = useState(false);

  const handleAuthFailure = useCallback(async () => {
    await SecureStore.deleteItemAsync('sm_access_token');
    await SecureStore.deleteItemAsync('sm_refresh_token');
    await SecureStore.deleteItemAsync('sm_user');
    setUser(null);
  }, []);

  useEffect(() => {
    setAuthFailureHandler(handleAuthFailure);
  }, [handleAuthFailure]);

  useEffect(() => {
    (async () => {
      try {
        const storedUser = await SecureStore.getItemAsync('sm_user');
        const storedToken = await SecureStore.getItemAsync('sm_access_token');
        const storedDark = await SecureStore.getItemAsync('sm_dark_mode');

        if (storedDark === 'true') setIsDark(true);

        if (storedUser && storedToken) {
          setUser(JSON.parse(storedUser));
        }
      } catch {
        // Ignore
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const login = async (email, password) => {
    const response = await api.auth.login({ email, password });
    const { accessToken, refreshToken, user: userData } = response.data;

    // Check if user is a student
    if (userData.role !== 'STUDENT') {
      const roleNames = {
        ADMIN: 'Admin',
        LECTURER: 'Giảng viên',
        STUDENT: 'Sinh viên',
      };
      throw new Error(
        `Tài khoản ${roleNames[userData.role] || userData.role} không thể đăng nhập vào ứng dụng sinh viên. Vui lòng sử dụng tài khoản sinh viên.`
      );
    }

    await SecureStore.setItemAsync('sm_access_token', accessToken);
    await SecureStore.setItemAsync('sm_refresh_token', refreshToken);
    await SecureStore.setItemAsync('sm_user', JSON.stringify(userData));

    setUser(userData);
    return userData;
  };

  const logout = async () => {
    try {
      await api.auth.login; // noop to get token
    } catch {
      // Ignore
    }
    await SecureStore.deleteItemAsync('sm_access_token');
    await SecureStore.deleteItemAsync('sm_refresh_token');
    await SecureStore.deleteItemAsync('sm_user');
    await clearCache();
    setUser(null);
  };

  const toggleDarkMode = async () => {
    const next = !isDark;
    setIsDark(next);
    await SecureStore.setItemAsync('sm_dark_mode', next ? 'true' : 'false');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isDark,
        login,
        logout,
        toggleDarkMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
