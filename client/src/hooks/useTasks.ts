// client/src/hooks/useTasks.ts
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { listTasks } from "../api/tasks";
import { useMemo } from "react";
import type { Task } from "../api/tasks";

export { type Task };

/**
 * Custom hook to fetch and manage tasks based on URL search parameters.
 * This hook uses `react-query` for data fetching and caching.
 */
export function useTasks() {
  // Access the search parameters from the URL
  const [sp] = useSearchParams();

  // Extract filter criteria from search parameters
  const filter = sp.get("filter") ?? "all";
  const priority = sp.get("priority") ? Number(sp.get("priority")) as 1 | 2 | 3 : undefined;
  const projectId = sp.get("projectId") ?? undefined;
  const q = sp.get("q") ?? undefined;

  // Memoize the params object to prevent unnecessary recalculations
  const params = useMemo(() => {
    const p: Record<string, any> = { projectId };

    // Apply filters based on the selected criteria
    if (filter === "completed") {
      p.completedAt = true;
    }

    if (filter === "past") {
      p.completedAt = null;
      p.dueDate = { $lt: new Date().toISOString() }; // Memoized to avoid changes
    }

    if (filter === "today") {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const end = new Date();
      end.setHours(23, 59, 59, 999);
      p.completedAt = null;
      p.dueDate = { $gte: start.toISOString(), $lte: end.toISOString() };
    }

    if (filter === "upcoming") {
      p.completedAt = null;
      p.dueDate = { $gt: new Date().toISOString() }; // Memoized to avoid changes
    }

    // Apply priority filter if specified
    if (priority) {
      p.priority = priority;
    }

    // Apply search query if specified
    if (q) {
      p.q = q;
    }

    // Add the filter type if it's not "all"
    if (filter !== "all") {
      p.filter = filter;
    }

    return p;
  }, [filter, priority, projectId, q]); // Dependencies for memoization

  return useQuery({
    queryKey: ["tasks", params], // Unique key for caching the query
    queryFn: () => listTasks(params), // Fetch tasks using the API function
  });
}