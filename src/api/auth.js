import api from "./axios";
import { unwrap } from "./helpers";

export const login = async (payload) =>
  unwrap(await api.post("/auth/login", payload));

export const register = async (payload) =>
  unwrap(await api.post("/auth/register", payload));

export const getProfile = async () => unwrap(await api.get("/auth/me"));

export const requestPasswordReset = async (payload) =>
  unwrap(await api.post("/auth/forgot-password", payload));

export const resetPassword = async (token, payload) =>
  unwrap(await api.post(`/auth/reset-password/${token}`, payload));

