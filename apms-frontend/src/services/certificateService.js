import axiosInstance from '../api/axios';

export const certificateService = {
  generate: async (projectId) => {
    const response = await axiosInstance.post(`/certificates/generate/${projectId}`);
    return response.data;
  },

  download: async (projectId) => {
    const response = await axiosInstance.get(`/certificates/download/${projectId}`, {
      responseType: 'blob'
    });
    return response.data;
  }
};
