import api from "./axios";
import { unwrap, buildQueryParams } from "./helpers";

export const getAuditLogs = async (params = {}) =>
  unwrap(
    await api.get("/audit-logs", {
      params: buildQueryParams(params)
    })
  );

export const getAuditLog = async (id) =>
  unwrap(await api.get(`/audit-logs/${id}`));

