import axiosInstance from '../api/axios';

export const hodService = {
  getFaculty: async () => {
    const response = await axiosInstance.get('/hod/faculty');
    return response.data;
  }
};
