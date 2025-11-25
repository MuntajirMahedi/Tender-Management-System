import api from "./axios";
import { unwrap, buildQueryParams } from "./helpers";

export const getOverview = async (params = {}) =>
  unwrap(
    await api.get("/reports/overview", {
      params: buildQueryParams(params)
    })
  );

export const getInquiriesReport = async (params = {}) =>
  unwrap(
    await api.get("/reports/inquiries", {
      params: buildQueryParams(params)
    })
  );

export const getClientsReport = async (params = {}) =>
  unwrap(
    await api.get("/reports/clients", {
      params: buildQueryParams(params)
    })
  );

export const getPaymentsReport = async (params = {}) =>
  unwrap(
    await api.get("/reports/payments", {
      params: buildQueryParams(params)
    })
  );

export const getActivationReport = async (params = {}) =>
  unwrap(
    await api.get("/reports/activation", {
      params: buildQueryParams(params)
    })
  );

export const getTicketsReport = async (params = {}) =>
  unwrap(
    await api.get("/reports/tickets", {
      params: buildQueryParams(params)
    })
  );

export const getRenewalsReport = async (params = {}) =>
  unwrap(
    await api.get("/reports/renewals", {
      params: buildQueryParams(params)
    })
  );

export const getEmployeePerformance = async (params = {}) =>
  unwrap(
    await api.get("/reports/employee-performance", {
      params: buildQueryParams(params)
    })
  );

