// src/api/notifications.js
import api from "./axios";
import { unwrap } from "./helpers";

// GET /api/notifications
export const getNotifications = async (params = {}) =>
  unwrap(
    await api.get("/notifications", {
      params
    })
  );

// GET /api/notifications/unread-count
export const getUnreadCount = async () =>
  unwrap(await api.get("/notifications/unread-count"));

// PATCH /api/notifications/:id/read
export const markRead = async (id) =>
  unwrap(await api.patch(`/notifications/${id}/read`));

// PATCH /api/notifications/mark-all-read
export const markAllRead = async () =>
  unwrap(await api.patch("/notifications/read-all"));

// DELETE /api/notifications/:id
export const deleteNotification = async (id) =>
  unwrap(await api.delete(`/notifications/${id}`));
