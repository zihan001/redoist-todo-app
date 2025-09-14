import { api } from "../lib/http";

export type MeResponse = { user: { _id: string; email: string; createdAt: string } };

export const signup = (email: string, password: string) =>
  api("/api/auth/signup", { method: "POST", body: { email, password } });

export const login = (email: string, password: string) =>
  api("/api/auth/login", { method: "POST", body: { email, password } });

export const logout = () => api("/api/auth/logout", { method: "POST" });

export const me = () => api<MeResponse>("/api/auth/me");
