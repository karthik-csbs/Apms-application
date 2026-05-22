import axiosInstance from '../api/axios';

export const facultyService = {
  getProjects: async () => {
    const response = await axiosInstance.get('/faculty/projects');
    return response.data;
  },

  getStudents: async () => {
    const response = await axiosInstance.get('/faculty/students');
    return response.data;
  }
};
