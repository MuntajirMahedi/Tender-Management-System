import api from "./axios";
import { unwrap } from "./helpers";

export const getPermissions = async () => unwrap(await api.get("/permissions"));

export const createPermission = async (payload) =>
  unwrap(await api.post("/permissions", payload));

export const createPermissionsBulk = async (permissions) =>
  unwrap(
    await api.post("/permissions/bulk", {
      permissions
    })
  );

export const updatePermission = async (id, payload) =>
  unwrap(await api.put(`/permissions/${id}`, payload));

export const deletePermission = async (id) =>
  unwrap(await api.delete(`/permissions/${id}`));

