import api from "./axios";

export const getNotifications = async (params = {}) =>
  unwrap(await api.get("/notifications", { params }));

export const getUnreadCount = async () =>
  unwrap(await api.get("/notifications/unread-count"));

export const markRead = async (id) =>
  unwrap(await api.patch(`/notifications/${id}/read`));

export const markAllRead = async () =>
  unwrap(await api.patch("/notifications/read-all"));

export const markBulkRead = async (ids) =>
  unwrap(await api.patch("/notifications/read-bulk", { ids }));

export const deleteNotification = async (id) =>
  unwrap(await api.delete(`/notifications/${id}`));
// 👇 NEW: delete all
export const deleteAllNotifications = async () =>
  unwrap(await api.delete("/notifications"));

