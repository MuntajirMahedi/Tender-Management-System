import api from "./axios";
import { unwrap, buildQueryParams } from "./helpers";

export const getPlans = async (params = {}) =>
  unwrap(
    await api.get("/plans", {
      params: buildQueryParams(params)
    })
  );

export const getPlan = async (id) =>
  unwrap(await api.get(`/plans/${id}`));

export const getClientPlans = async (clientId) =>
  unwrap(await api.get(`/plans/client/${clientId}`));

export const createPlan = async (payload) =>
  unwrap(await api.post("/plans", payload));

export const updatePlan = async (id, payload) =>
  unwrap(await api.put(`/plans/${id}`, payload));

export const updatePlanStatus = async (id, status) =>
  unwrap(await api.patch(`/plans/${id}/status`, { status }));

export const deletePlan = async (id) =>
  unwrap(await api.delete(`/plans/${id}`));

