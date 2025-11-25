import api from "./axios";
import { unwrap, buildQueryParams } from "./helpers";

export const getClients = async (params = {}) =>
  unwrap(
    await api.get("/clients", {
      params: buildQueryParams(params)
    })
  );

export const getClient = async (id) =>
  unwrap(await api.get(`/clients/${id}`));

export const createClient = async (payload) =>
  unwrap(await api.post("/clients", payload));

export const updateClient = async (id, payload) =>
  unwrap(await api.put(`/clients/${id}`, payload));

export const deleteClient = async (id) =>
  unwrap(await api.delete(`/clients/${id}`));

export const getClientOverview = async (id) =>
  unwrap(await api.get(`/clients/${id}/overview`));

