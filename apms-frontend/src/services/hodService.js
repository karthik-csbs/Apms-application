import api from './api';

export const hodService = {
  getFaculty: async () => {
    const response = await api.get('/hod/faculty');
    return response.data;
  }
};
