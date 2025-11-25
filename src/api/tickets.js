import api from "./axios";
import { unwrap, buildQueryParams } from "./helpers";

export const getTickets = async (params = {}) =>
  unwrap(
    await api.get("/tickets", {
      params: buildQueryParams(params)
    })
  );

export const getTicket = async (id) =>
  unwrap(await api.get(`/tickets/${id}`));

export const getClientTickets = async (clientId) =>
  unwrap(await api.get(`/tickets/client/${clientId}`));

export const getPlanTickets = async (planId) =>
  unwrap(await api.get(`/tickets/plan/${planId}`));

export const createTicket = async (payload) =>
  unwrap(await api.post("/tickets", payload));

export const updateTicket = async (id, payload) =>
  unwrap(await api.put(`/tickets/${id}`, payload));

export const updateTicketStatus = async (id, payload) =>
  unwrap(await api.patch(`/tickets/${id}/status`, payload));

export const addTimelineEntry = async (id, payload) =>
  unwrap(await api.post(`/tickets/${id}/timeline`, payload));

export const deleteTicket = async (id) =>
  unwrap(await api.delete(`/tickets/${id}`));

