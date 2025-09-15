import { api } from "../lib/http";

export type Task = {
    _id: string;
    title: string;
    notes?: string;
    projectId?: string;
    priority: 1 | 2 | 3;
    dueDate?: string | null;
    completedAt?: string | null;
    createdAt: string;
    updatedAt: string;
};

export type TasksResponse = {
    items: Task[];
    total: number;
    page: number;
    pageSize: number;
};

export const listTasks = (opts: { 
    projectId?: string; 
    completedAt?: boolean;
    filter?: string;
    priority?: number;
    q?: string; 
} = {}) => {
    const params = new URLSearchParams();
    if (opts.projectId) params.set("projectId", opts.projectId);
    if (typeof opts.completedAt === "boolean") params.set("completedAt", String(opts.completedAt));
    if (opts.filter) params.set("filter", opts.filter);
    if (opts.priority) params.set("priority", String(opts.priority));
    if (opts.q) params.set("q", opts.q);
    return api<TasksResponse>(`/api/tasks?${params}`);
};

export const createTask = (input: {
    title: string;
    notes?: string;
    projectId?: string;
    priority?: Task["priority"];
    dueDate?: string; // ISO
}) => api<Task>("/api/tasks", { method: "POST", body: input });

export const updateTask = (id: string, patch: Partial<Task>) =>
    api<Task>(`/api/tasks/${id}`, { method: "PATCH", body: patch });

export const completeTask = (id: string) =>
    api<Task>(`/api/tasks/${id}/complete`, { method: "POST" });

export const uncompleteTask = (id: string) =>
    api<Task>(`/api/tasks/${id}/incomplete`, { method: "POST" });

export const deleteTask = (id: string) =>
    api<void>(`/api/tasks/${id}`, { method: "DELETE" });

export const getTask = (id: string) => 
    api<Task>(`/api/tasks/${id}`);
