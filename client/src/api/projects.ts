import { api } from "../lib/http";

export type Project = {
  _id: string;
  name: string;
  color?: string;
  archived?: boolean;
};

export const listProjects = (includeArchived = false) =>
  api<Project[]>(`/api/projects?includeArchived=${includeArchived}`);

export const createProject = (name: string, color?: string) =>
  api<Project>("/api/projects", { method: "POST", body: { name, color } });

export const updateProject = (id: string, patch: Partial<Project>) =>
  api<Project>(`/api/projects/${id}`, { method: "PATCH", body: patch });

export const deleteProject = (id: string) =>
  api<void>(`/api/projects/${id}`, { method: "DELETE" });
