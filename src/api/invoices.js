import api from "./axios";
import { unwrap, buildQueryParams } from "./helpers";

export const getInvoices = async (params = {}) =>
  unwrap(
    await api.get("/invoices", {
      params: buildQueryParams(params)
    })
  );

export const getInvoice = async (id) =>
  unwrap(await api.get(`/invoices/${id}`));

export const getPlanInvoices = async (planId) =>
  unwrap(await api.get(`/invoices/plan/${planId}`));

export const getClientInvoices = async (clientId) =>
  unwrap(await api.get(`/invoices/client/${clientId}`));

export const createInvoice = async (payload) =>
  unwrap(await api.post("/invoices", payload));

export const updateInvoice = async (id, payload) =>
  unwrap(await api.put(`/invoices/${id}`, payload));

export const updateInvoiceStatus = async (id, payload) =>
  unwrap(await api.patch(`/invoices/${id}/status`, payload));

export const deleteInvoice = async (id) =>
  unwrap(await api.delete(`/invoices/${id}`));

export const exportInvoices = async (params = {}) => {
  const response = await api.get("/invoices/export", {
    params: buildQueryParams(params),
    responseType: "blob"
  });
  return response.data;
};
