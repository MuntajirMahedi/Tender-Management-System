import api from "./axios";
import { unwrap, buildQueryParams } from "./helpers";

export const getTasks = async (params = {}) =>
  unwrap(
    await api.get("/activation-tasks", {
      params: buildQueryParams(params)
    })
  );

export const getTask = async (id) =>
  unwrap(await api.get(`/activation-tasks/${id}`));

export const getPlanTasks = async (planId) =>
  unwrap(await api.get(`/activation-tasks/plan/${planId}`));

export const createTask = async (payload) =>
  unwrap(await api.post("/activation-tasks", payload));

export const createTasksBulk = async (payload) =>
  unwrap(await api.post("/activation-tasks/bulk", payload));

export const updateTask = async (id, payload) =>
  unwrap(await api.put(`/activation-tasks/${id}`, payload));

export const updateTaskStatus = async (id, status) =>
  unwrap(await api.patch(`/activation-tasks/${id}/status`, { status }));

export const deleteTask = async (id) =>
  unwrap(await api.delete(`/activation-tasks/${id}`));

