import api from "./axios";
import { unwrap } from "./helpers";

export const getRoles = async () => unwrap(await api.get("/roles"));

export const getRole = async (id) => unwrap(await api.get(`/roles/${id}`));

export const createRole = async (payload) =>
  unwrap(await api.post("/roles", payload));

export const updateRole = async (id, payload) =>
  unwrap(await api.put(`/roles/${id}`, payload));

export const updateRolePermissions = async (id, permissions) =>
  unwrap(
    await api.patch(`/roles/${id}/permissions`, {
      permissions
    })
  );

export const deleteRole = async (id) =>
  unwrap(await api.delete(`/roles/${id}`));

