import api from './api';

export const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    // Map backend response structure to frontend requirements
    const { accessToken, refreshToken, id, name, email, role } = response.data.data;
    return {
      accessToken,
      refreshToken,
      user: {
        id,
        name,
        email,
        role
      }
    };
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout failed on backend:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      sessionStorage.removeItem('user');
    }
  },

  refreshAccessToken: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    const response = await api.post('/auth/refresh', { refreshToken });
    const { accessToken, refreshToken: newRefreshToken, id, name, email, role } = response.data.data;
    
    // Store new tokens
    localStorage.setItem('token', accessToken);
    localStorage.setItem('accessToken', accessToken);
    if (newRefreshToken) {
      localStorage.setItem('refreshToken', newRefreshToken);
    }
    
    return {
      accessToken,
      refreshToken: newRefreshToken || refreshToken,
      user: {
        id,
        name,
        email,
        role
      }
    };
  }
};
