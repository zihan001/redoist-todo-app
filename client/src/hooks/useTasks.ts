// src/hooks/useTasks.ts
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/http";

export type Task = {
  _id: string;
  title: string;
  notes?: string;
  dueDate?: string | null;
  priority: 1|2|3;
  completedAt?: string | null;
  projectId: string;
};

export function useTasks() {
  const [sp] = useSearchParams();
  const params = new URLSearchParams({
    filter: sp.get("filter") ?? "today",
    priority: sp.get("priority") ?? "",
    projectId: sp.get("projectId") ?? "",
    q: sp.get("q") ?? "",
    page: "1",
    pageSize: "100",
  });
  const key = ["tasks", params.toString()];
  return useQuery({
    queryKey: key,
    queryFn: async () => {
      return api<{items: Task[]}>(`/api/tasks?${params.toString()}`);
    }
  });
}
