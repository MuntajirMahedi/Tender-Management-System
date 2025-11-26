import api from "./axios";

export const notificationApi = {
  getNotifications: async (params = {}) => {
    const res = await api.get("/notifications", { params });
    return res.data;  // <-- FIX
  },

  getUnreadCount: async () => {
    const res = await api.get("/notifications/unread-count");
    return res.data;  // <-- FIX
  },

  markRead: async (id) => {
    const res = await api.patch(`/notifications/${id}/read`);
    return res.data;
  },

  markAllRead: async () => {
    const res = await api.patch("/notifications/read-all");
    return res.data;
  },

  markBulkRead: async (ids) => {
    const res = await api.patch("/notifications/read-bulk", { ids });
    return res.data;
  },

  deleteNotification: async (id) => {
    const res = await api.delete(`/notifications/${id}`);
    return res.data;
  }
};
