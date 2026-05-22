import axiosInstance from '../api/axios';

export const projectService = {
  getAll: async (params = {}) => {
    const response = await axiosInstance.get('/projects', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await axiosInstance.get(`/projects/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await axiosInstance.post('/projects', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await axiosInstance.put(`/projects/${id}`, data);
    return response.data;
  },

  requestCompletion: async (projectId, submissionData) => {
    const response = await axiosInstance.post(`/projects/request-completion/${projectId}`, submissionData);
    return response.data;
  },

  approveCompletion: async (projectId, comments = '') => {
    const response = await axiosInstance.put(`/projects/approve/${projectId}`, { comments });
    return response.data;
  },

  rejectCompletion: async (projectId, comments = '') => {
    const response = await axiosInstance.put(`/projects/reject/${projectId}`, { comments });
    return response.data;
  }
};
