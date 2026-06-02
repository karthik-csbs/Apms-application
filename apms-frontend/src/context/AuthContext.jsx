import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      setAuthLoading(true);

      try {
        const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
        const userDataStr = localStorage.getItem('user') || sessionStorage.getItem('user');

        if (token) {
          if (userDataStr) {
            try {
              const parsed = JSON.parse(userDataStr);
              if (mounted) {
                setUser(parsed);
                setIsAuthenticated(true);
              }
            } catch (e) {
              console.error('Failed to parse stored user, attempting token refresh', e);
              // try to refresh token and get user
              try {
                const data = await authService.refreshAccessToken();
                if (mounted && data?.user) {
                  setUser(data.user);
                  setIsAuthenticated(true);
                }
              } catch (err) {
                localStorage.clear();
                sessionStorage.clear();
              }
            }
          } else {
            // No user in storage, try to refresh and obtain user
            try {
              const data = await authService.refreshAccessToken();
              if (mounted && data?.user) {
                setUser(data.user);
                setIsAuthenticated(true);
              }
            } catch (err) {
              localStorage.clear();
              sessionStorage.clear();
            }
          }
        }
      } catch (err) {
        console.error('Auth initialization failed', err);
        localStorage.clear();
        sessionStorage.clear();
        if (mounted) {
          setUser(null);
          setIsAuthenticated(false);
        }
      } finally {
        if (mounted) setAuthLoading(false);
      }
    };

    initAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const login = async (credentials) => {
    try {
      setLoading(true);
      setAuthLoading(true);
      const data = await authService.login(credentials);
      
      const { accessToken, refreshToken, user: userData } = data;
      
      localStorage.setItem('token', accessToken);
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      sessionStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      setIsAuthenticated(true);
      
      return userData;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
      setAuthLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      setAuthLoading(true);
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('token');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      sessionStorage.removeItem('user');
      setLoading(false);
      setAuthLoading(false);
    }
  };

  const refreshAccessToken = async () => {
    try {
      const data = await authService.refreshAccessToken();
      const { accessToken, user: userData } = data;
      localStorage.setItem('token', accessToken);
      localStorage.setItem('accessToken', accessToken);
      sessionStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);
      return data;
    } catch (error) {
      console.error('Token refresh failed inside context:', error);
      setUser(null);
      setIsAuthenticated(false);
      localStorage.clear();
      sessionStorage.clear();
      throw error;
    }
  };

  const contextValue = {
    user,
    currentUser: user,
    userRole: user?.role || null,
    isAuthenticated,
    loading,
    authLoading,
    login,
    logout,
    refreshAccessToken
  };

  if (authLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontFamily: 'DM Sans, sans-serif',
        background: '#faf8f5',
        color: '#8b1a1a'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontWeight: 500, marginBottom: '8px' }}>APMS Portal</h2>
          <div style={{ color: '#aaa', fontSize: '14px' }}>Verifying authentication session...</div>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
