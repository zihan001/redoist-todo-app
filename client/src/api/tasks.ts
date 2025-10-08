// client/src/api/tasks.ts
import { api } from "../lib/http";

// Type definition for a Task object
export type Task = {
    _id: string;    // Unique identifier for the task
    title: string;  // Title of the task
    notes?: string; // Additional notes for the task
    projectId?: string; // ID of the project the task belongs to
    priority: 1 | 2 | 3; // Priority of the task (1=Low, 2=Medium, 3=High)
    dueDate?: string | null; // Due date for the task (ISO string or null)
    completedAt?: string | null; // Timestamp for when the task was completed (ISO string or null)
    createdAt: string; // Timestamp for when the task was created (ISO string)
    updatedAt: string; // Timestamp for when the task was last updated (ISO string)
};

// Type definition for the response when listing tasks
export type TasksResponse = {
    items: Task[];  // Array of Task objects
    total: number;   // Total number of tasks
    page: number;    // Current page number
    pageSize: number; // Number of tasks per page
};

// Fetch a list of tasks with optional filters
export const listTasks = (opts: { 
    projectId?: string;     // Filter by project ID
    completedAt?: boolean;  // Filter by completion status
    filter?: string;        // Apply a quick filter (e.g., "today", "upcoming")
    priority?: number;     // Filter by priority
    q?: string;            // Search query
} = {}) => {
    const params = new URLSearchParams();
    if (opts.projectId) params.set("projectId", opts.projectId);
    if (typeof opts.completedAt === "boolean") params.set("completedAt", String(opts.completedAt));
    if (opts.filter) params.set("filter", opts.filter);
    if (opts.priority) params.set("priority", String(opts.priority));
    if (opts.q) params.set("q", opts.q);
    return api<TasksResponse>(`/api/tasks?${params}`);
};

// Create a new task
export const createTask = (input: {
    title: string;  // Title of the task
    notes?: string; // Additional notes for the task
    projectId?: string; // ID of the project the task belongs to
    priority?: Task["priority"]; // Priority of the task
    dueDate?: string; // Due date for the task (ISO string)
}) => api<Task>("/api/tasks", { method: "POST", body: input });

// Update an existing task
export const updateTask = (id: string, patch: Partial<Task>) =>
    api<Task>(`/api/tasks/${id}`, { method: "PATCH", body: patch });

// Mark a task as complete
export const completeTask = (id: string) =>
    api<Task>(`/api/tasks/${id}/complete`, { method: "POST" });

// Mark a task as incomplete
export const uncompleteTask = (id: string) =>
    api<Task>(`/api/tasks/${id}/incomplete`, { method: "POST" });

// Delete a task
export const deleteTask = (id: string) =>
    api<void>(`/api/tasks/${id}`, { method: "DELETE" });

// Fetch a single task by ID
export const getTask = (id: string) => 
    api<Task>(`/api/tasks/${id}`);
