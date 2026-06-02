import api from './api';

export const notificationService = {
  getAll: async () => {
    const response = await api.get('/notifications');
    return response?.data?.data ?? response.data;
  },

  markAsRead: async (id) => {
    const response = await api.put(`/notifications/read/${id}`);
    return response.data;
  },


  sendBulk: async (payload) => {
    // Note: The Spring Boot backend currently uses trigger-based or event-based notifications 
    // rather than direct client bulk endpoints. We simulate success here.
    console.log("Simulating bulk notification delivery:", payload);
    return { success: true, message: "Bulk notifications simulated successfully" };
  }
};