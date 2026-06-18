import api from './api';

export const facultyService = {
  getProjects: async () => {
    const response = await api.get('/faculty/projects');
    return response?.data?.data ?? response.data;
  },

  getStudents: async (params = {}) => {
    const response = await api.get('/faculty/students', { params });
    return response?.data?.data ?? response.data;
  }
};
