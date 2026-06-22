import api from './api';

export const meetingService = {
  getMyMeetings: async (params) => {
    const response = await api.get('/meetings/my', { params });
    return response.data;
  },

  createMeeting: async (payload) => {
    const response = await api.post('/meetings', payload);
    return response.data;
  },

  cancelMeeting: async (id) => {
    const response = await api.put(`/meetings/${id}/cancel`);
    return response.data;
  },

  getActiveProjects: async () => {
    const response = await api.get('/meetings/projects');
    return response.data;
  },

  getProjectParticipantsPreview: async (projectId) => {
    const response = await api.get(`/meetings/project-participants/${projectId}`);
    return response.data;
  },

  getUsersForDropdown: async (type) => {
    const response = await api.get('/meetings/users', { params: { type } });
    return response.data;
  }
};
