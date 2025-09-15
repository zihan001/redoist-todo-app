// client/src/api/auth.ts
import { api } from "../lib/http";

// Type definition for the response from the "me" endpoint
export type MeResponse = { 
  user: { 
    _id: string;  // Unique identifier for the user
    email: string;  // Email address of the user
    createdAt: string;  // Timestamp for when the user was created
  } 
};

// Sign up a new user
export const signup = (email: string, password: string) =>
  api("/api/auth/signup", { method: "POST", body: { email, password } });

// Log in an existing user
export const login = (email: string, password: string) =>
  api("/api/auth/login", { method: "POST", body: { email, password } });

// Log out the current user
export const logout = () => api("/api/auth/logout", { method: "POST" });

// Fetch the current authenticated user's information
export const me = () => api<MeResponse>("/api/auth/me");
