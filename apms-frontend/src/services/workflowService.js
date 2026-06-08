import api from './api';

export const workflowService = {
  getWorkflow: async (projectId) => {
    const response = await api.get(`/workflows/project/${projectId}`);
    return response?.data?.data ?? response.data;
  },

  getWorkflowHistory: async (projectId) => {
    const response = await api.get(`/workflows/history/${projectId}`);
    return response?.data?.data ?? response.data;
  },

  submitWorkflow: async (projectId) => {
    const response = await api.post('/workflows/submit', { projectId });
    return response?.data?.data ?? response.data;
  },

  reviewWorkflow: async (projectId, remarks = '') => {
    const response = await api.post('/workflows/review', { projectId, remarks });
    return response?.data?.data ?? response.data;
  },

  approveWorkflow: async (projectId, remarks = '') => {
    const response = await api.post('/workflows/approve', { projectId, remarks });
    return response?.data?.data ?? response.data;
  },

  rejectWorkflow: async (projectId, remarks) => {
    const response = await api.post('/workflows/reject', { projectId, remarks });
    return response?.data?.data ?? response.data;
  },
};
