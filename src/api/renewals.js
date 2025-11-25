import api from "./axios";
import { unwrap, buildQueryParams } from "./helpers";

export const getRenewals = async (params = {}) =>
  unwrap(
    await api.get("/renewals", {
      params: buildQueryParams(params)
    })
  );

export const getClientRenewals = async (clientId) =>
  unwrap(await api.get(`/renewals/client/${clientId}`));

export const getPlanRenewals = async (planId) =>
  unwrap(await api.get(`/renewals/plan/${planId}`));

export const getUpcomingRenewals = async (params = {}) =>
  unwrap(
    await api.get("/renewals/upcoming", {
      params: buildQueryParams(params)
    })
  );

export const createRenewal = async (payload) =>
  unwrap(await api.post("/renewals", payload));

export const deleteRenewal = async (id) =>
  unwrap(await api.delete(`/renewals/${id}`));

