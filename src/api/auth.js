import api from "./axios";
import { unwrap } from "./helpers";

export const login = async (payload) =>
  unwrap(await api.post("/auth/login", payload));

export const register = async (payload) =>
  unwrap(await api.post("/auth/register", payload));

export const getProfile = async () => unwrap(await api.get("/auth/me"));

// ✔ Backend expects: POST /auth/forgot-password
export const requestPasswordReset = async (payload) =>
  unwrap(await api.post("/auth/forgot-password", payload));

// ❗ No token in URL
// ✔ Backend expects: POST /auth/reset-password  (BODY only)
export const resetPassword = async (payload) =>
  unwrap(await api.post("/auth/reset-password", payload));
