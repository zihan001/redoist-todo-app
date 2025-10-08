// client/src/ui/TaskList.tsx
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { completeTask, createTask, deleteTask, listTasks, uncompleteTask } from "../api/tasks";
import { useState } from "react";
import type { FormEvent } from "react";

/**
 * TaskList Component
 * 
 * Displays a list of tasks for a specific project or all tasks if no project is selected.
 * - Allows users to add, delete, and toggle task completion.
 * - Uses `react-query` for data fetching and caching.
 * 
 * @param {string} [projectId] - Optional project ID to filter tasks by project.
 */
export default function TaskList({ projectId }: { projectId?: string }) {
  const qc = useQueryClient();  // React Query client for cache management

  // Fetch tasks for the specified project or all tasks
  const { data } = useQuery({
    queryKey: ["tasks", { projectId }],
    queryFn: () => listTasks({ projectId: projectId }),
  });

  const [title, setTitle] = useState("");

  // Mutation to add a new task
  const add = useMutation({
    mutationFn: () => createTask({ title, projectId: projectId }),
    onSuccess: () => { 
      setTitle("");   // Clear the input field
      qc.invalidateQueries({ queryKey: ["tasks"] });  // Refresh the task list
    },
  });

  // Mutation to toggle task completion
  const toggle = useMutation({
    mutationFn: async (id: string) => {
      const t = data?.items?.find(t => t._id === id); // Find the task by ID
      if (!t) return;
      if (t.completedAt) return uncompleteTask(id); // Mark as incomplete
      return completeTask(id);  // Mark as complete
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });

  // Mutation to delete a task
  const remove = useMutation({
    mutationFn: (id: string) => deleteTask(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });

  // Handle form submission to add a new task
  const onSubmit = (e: FormEvent) => { 
    e.preventDefault(); 
    if (title.trim()) add.mutate(); 
  };

  return (
    <div>
      <h3 className="text-sm text-gray-500 mb-2">{projectId ? "Tasks in project" : "All tasks"}</h3>
      <ul className="space-y-2">
        {data?.items?.map(t => (
          <li key={t._id} className="flex items-center gap-2">
            {/* Checkbox to toggle task completion */}
            <input type="checkbox" checked={!!t.completedAt} onChange={()=>toggle.mutate(t._id)} />
            <span className={t.completedAt ? "line-through text-gray-500" : ""}>{t.title}</span>
            {/* Button to delete the task */}
            <button onClick={()=>remove.mutate(t._id)} className="ml-auto text-xs text-red-600">Delete</button>
          </li>
        ))}
      </ul>

      {/* Form to add a new task */}
      <form onSubmit={onSubmit} className="mt-3 flex gap-2">
        <input 
          className="flex-1 border rounded px-2 py-1" 
          placeholder="Quick add task"
          value={title} 
          onChange={e=>setTitle(e.target.value)} 
        />
        <button className="px-3 py-1 rounded bg-black text-white disabled:opacity-60" disabled={!title.trim() || add.isPending}>
          Add
        </button>
      </form>
    </div>
  );
}