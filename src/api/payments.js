import api from "./axios";
import { unwrap, buildQueryParams } from "./helpers";

export const getPayments = async (params = {}) =>
  unwrap(
    await api.get("/payments", {
      params: buildQueryParams(params)
    })
  );

export const getPayment = async (id) =>
  unwrap(await api.get(`/payments/${id}`));

export const getPlanPayments = async (planId) =>
  unwrap(await api.get(`/payments/plan/${planId}`));

export const getClientPayments = async (clientId) =>
  unwrap(await api.get(`/payments/client/${clientId}`));

export const createPayment = async (payload) =>
  unwrap(await api.post("/payments", payload));

export const updatePayment = async (id, payload) =>
  unwrap(await api.put(`/payments/${id}`, payload));

export const deletePayment = async (id) =>
  unwrap(await api.delete(`/payments/${id}`));

