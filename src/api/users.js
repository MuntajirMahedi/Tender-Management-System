import api from "./axios";
import { unwrap, buildQueryParams } from "./helpers";

export const getUsers = async (params = {}) =>
  unwrap(await api.get("/users", { params: buildQueryParams(params) }));

export const getUser = async (id) => unwrap(await api.get(`/users/${id}`));

export const createUser = async (payload) =>
  unwrap(await api.post("/users", payload));

export const updateUser = async (id, payload) =>
  unwrap(await api.put(`/users/${id}`, payload));

export const toggleUserStatus = async (id, isActive) =>
  unwrap(await api.patch(`/users/${id}/status`, { isActive }));

export const deleteUser = async (id) =>
  unwrap(await api.delete(`/users/${id}`));

