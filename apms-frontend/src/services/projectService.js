import api from './api';

export const projectService = {
  getAll: async (params = {}) => {
    const response = await api.get('/projects', { params });
    return response?.data?.data ?? response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/projects/${id}`);
    return response?.data?.data ?? response.data;
  },

  create: async (data) => {
    const response = await api.post('/projects', data);
    return response?.data?.data ?? response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/projects/${id}`, data);
    return response?.data?.data ?? response.data;
  },

  updateTeamLead: async (projectId, data) => {
    const response = await api.put(`/projects/team-lead/${projectId}`, data);
    return response?.data?.data ?? response.data;
  },

  requestCompletion: async (projectId, submissionData) => {
    const response = await api.post(`/projects/request-completion/${projectId}`, submissionData);
    return response?.data?.data ?? response.data;
  },

  approveCompletion: async (projectId) => {
    const response = await api.put(`/projects/approve/${projectId}`);
    return response?.data?.data ?? response.data;
  },

  rejectCompletion: async (projectId, comments = '') => {
    const response = await api.put(`/projects/reject/${projectId}`, { remarks: comments });
    return response?.data?.data ?? response.data;
  },

  getStudentProjects: async () => {
    const response = await api.get('/student/projects');
    return response?.data?.data ?? response.data;
  },

  getFacultyProjects: async (params = {}) => {
    const response = await api.get('/faculty/projects', { params });
    return response?.data?.data ?? response.data;
  },

  updateContribution: async (projectId, contribution) => {
    const response = await api.put(`/projects/${projectId}/contribution`, { contribution });
    return response?.data?.data ?? response.data;
  },
};
