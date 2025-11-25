import api from "./axios";
import { unwrap, buildQueryParams } from "./helpers";

export const getInquiries = async (params = {}) =>
  unwrap(
    await api.get("/inquiries", {
      params: buildQueryParams(params)
    })
  );

export const getInquiry = async (id) =>
  unwrap(await api.get(`/inquiries/${id}`));

export const createInquiry = async (payload) =>
  unwrap(await api.post("/inquiries", payload));

export const updateInquiry = async (id, payload) =>
  unwrap(await api.put(`/inquiries/${id}`, payload));

export const deleteInquiry = async (id) =>
  unwrap(await api.delete(`/inquiries/${id}`));

export const addFollowup = async (id, payload) =>
  unwrap(await api.post(`/inquiries/${id}/followups`, payload));

export const getFollowups = async (id) =>
  unwrap(await api.get(`/inquiries/${id}/followups`));

export const convertToClient = async (id) =>
  unwrap(await api.post(`/inquiries/${id}/convert-to-client`));

