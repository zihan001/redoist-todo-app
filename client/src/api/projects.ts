// client/src/api/projects.ts
import { api } from "../lib/http";

// Type definition for a Project object
export type Project = {
  _id: string;  // Unique identifier for the project
  name: string;  // Name of the project
  color?: string;  // Color associated with the project
  archived?: boolean;  // Whether the project is archived
};

// Fetch a list of projects, with an option to include archived projects
export const listProjects = (includeArchived = false) =>
  api<Project[]>(`/api/projects?includeArchived=${includeArchived}`);

// Create a new project
export const createProject = (name: string, color?: string) =>
  api<Project>("/api/projects", { method: "POST", body: { name, color } });

// Update an existing project
export const updateProject = (id: string, patch: Partial<Project>) =>
  api<Project>(`/api/projects/${id}`, { method: "PATCH", body: patch });

// Delete a project
export const deleteProject = (id: string) =>
  api<void>(`/api/projects/${id}`, { method: "DELETE" });
