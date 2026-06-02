import api from './api';

export const studentService = {
  getAll: async () => {
    const response = await api.get('/students');
    return response?.data?.data ?? response.data;
  },

  getProfile: async () => {
    const response = await api.get('/student/profile');
    return response?.data?.data ?? response.data;
  },

  updateProfile: async (data) => {
    const response = await api.put('/student/profile', data);
    return response?.data?.data ?? response.data;
  }
};
