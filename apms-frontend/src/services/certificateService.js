import api from './api';

export const certificateService = {
  generate: async (projectId) => {
    const response = await api.post(`/certificates/generate/${projectId}`);
    return response.data;
  },

  download: async (projectId) => {
    const response = await api.get(`/certificates/download/${projectId}`, {
      responseType: 'blob'
    });
    return response.data;
  }
};
