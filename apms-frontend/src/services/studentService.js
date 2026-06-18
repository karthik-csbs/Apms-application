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
  },

  facultyGetStudents: async (search = '', page = 0, size = 10, sortBy = 'id', sortDir = 'desc') => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    params.append('page', page);
    params.append('size', size);
    params.append('sortBy', sortBy);
    params.append('sortDir', sortDir);
    const response = await api.get(`/faculty/students?${params.toString()}`);
    return response?.data?.data ?? response.data;
  },

  facultyGetStudentById: async (id) => {
    const response = await api.get(`/faculty/students/${id}`);
    return response?.data?.data ?? response.data;
  },

  facultyCreateStudent: async (data) => {
    const response = await api.post('/faculty/students', data);
    return response?.data?.data ?? response.data;
  },

  facultyUpdateStudent: async (id, data) => {
    const response = await api.put(`/faculty/students/${id}`, data);
    return response?.data?.data ?? response.data;
  },

  facultyDeleteStudent: async (id) => {
    const response = await api.delete(`/faculty/students/${id}`);
    return response?.data?.data ?? response.data;
  },

  facultyResetPassword: async (id) => {
    const response = await api.post(`/faculty/students/${id}/reset-password`);
    return response?.data?.data ?? response.data;
  }
};
