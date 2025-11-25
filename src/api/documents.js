import api from "./axios";
import { unwrap } from "./helpers";

const buildFormData = (payload) => {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  });
  return formData;
};

export const uploadClientDocument = async (clientId, payload) =>
  unwrap(
    await api.post(`/documents/client/${clientId}`, buildFormData(payload), {
      headers: { "Content-Type": "multipart/form-data" }
    })
  );

export const listClientDocuments = async (clientId) =>
  unwrap(await api.get(`/documents/client/${clientId}`));

export const uploadActivationDocument = async (taskId, payload) =>
  unwrap(
    await api.post(
      `/documents/activation-task/${taskId}`,
      buildFormData(payload),
      { headers: { "Content-Type": "multipart/form-data" } }
    )
  );

export const listActivationDocuments = async (taskId) =>
  unwrap(await api.get(`/documents/activation-task/${taskId}`));

export const uploadInvoiceDocument = async (invoiceId, payload) =>
  unwrap(
    await api.post(
      `/documents/invoice/${invoiceId}`,
      buildFormData(payload),
      { headers: { "Content-Type": "multipart/form-data" } }
    )
  );

export const listInvoiceDocuments = async (invoiceId) =>
  unwrap(await api.get(`/documents/invoice/${invoiceId}`));

export const deleteDocument = async (id) =>
  unwrap(await api.delete(`/documents/${id}`));

