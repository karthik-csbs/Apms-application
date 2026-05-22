import axiosInstance from '../api/axios';

export const authService = {
  login: async (credentials) => {
    const response = await axiosInstance.post('/auth/login', credentials);
    // Map backend response structure to frontend requirements
    const { accessToken, refreshToken, name, email, role } = response.data.data;
    return {
      accessToken,
      refreshToken,
      user: {
        name,
        email,
        role
      }
    };
  },

  logout: async () => {
    try {
      await axiosInstance.post('/auth/logout');
    } catch (error) {
      console.error('Logout failed on backend:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      sessionStorage.removeItem('user');
    }
  },

  refreshAccessToken: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    const response = await axiosInstance.post('/auth/refresh', { refreshToken });
    const { accessToken, refreshToken: newRefreshToken, name, email, role } = response.data.data;
    
    // Store new tokens
    localStorage.setItem('accessToken', accessToken);
    if (newRefreshToken) {
      localStorage.setItem('refreshToken', newRefreshToken);
    }
    
    return {
      accessToken,
      refreshToken: newRefreshToken || refreshToken,
      user: {
        name,
        email,
        role
      }
    };
  }
};
