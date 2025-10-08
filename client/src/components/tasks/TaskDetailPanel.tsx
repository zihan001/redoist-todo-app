// client/src/components/tasks/TaskDetailPanel.tsx
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTask, updateTask } from "../../api/tasks";

/**
 * Custom hook to fetch a single task by its ID.
 * @param {string} taskId - The ID of the task to fetch.
 * @returns {object} - React Query object containing task data, loading state, and error state.
 */
function useTask(taskId: string) {
  return useQuery({
    queryKey: ["task", taskId],
    queryFn: () => getTask(taskId)
  });
}

/**
 * TaskDetailPanel Component
 * 
 * Displays the details of a specific task and allows the user to edit its properties.
 * - Fetches task details using the `useTask` hook.
 * - Updates task details using a debounced mutation.
 * - Provides inputs for editing the task's title, notes, due date, and priority.
 * 
 * @param {string} taskId - The ID of the task to display.
 * @param {function} onClose - Callback to close the task detail panel.
 */
export default function TaskDetailPanel({ taskId, onClose }:{taskId:string; onClose:()=>void}) {
  const qc = useQueryClient();
  const { data, isLoading, error: fetchError } = useTask(taskId);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [priority, setPriority] = useState<string>("2");

  // Populate state with task data when it is fetched
  useEffect(() => {
    if (data) {
      setTitle(data.title ?? "");
      setNotes(data.notes ?? "");
      setDueDate(data.dueDate ? data.dueDate.slice(0,10) : null);
      setPriority(String(data.priority) ?? "2");
    }
  }, [data]);

  // Mutation to update task details
  const patch = useMutation({
    mutationFn: async (body: any) => {
      return updateTask(taskId, body);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"]});
      qc.invalidateQueries({ queryKey: ["task", taskId]});
    },
    onError: (error) => {
      console.error("Failed to update task:", error);
    }
  });

  // Debounce updates to avoid excessive API calls
  useEffect(() => {
    const h = setTimeout(() => {
      patch.mutate({ 
        title, 
        notes, 
        dueDate: dueDate ? new Date(dueDate).toISOString() : null, 
        priority: priority
      });
    }, 500);
    return () => clearTimeout(h);
  }, [title, notes, dueDate, priority]);

  // Show loading state while fetching task data
  if (isLoading) return <div className="rounded-xl border bg-white p-4">Loading…</div>;

  // Show error message if task data fails to load
  if (fetchError) return (
    <div className="rounded-xl border bg-white p-4 text-red-600">
      Error loading task: {(fetchError as Error).message || "Unknown error"}
    </div>
  );

  return (
    <div className="rounded-xl border bg-white overflow-hidden">
      {/* Header with close button */}
      <div className="flex items-center justify-between p-3 border-b">
        <div className="text-sm font-semibold">Task details</div>
        <button className="text-sm text-gray-500 hover:text-gray-800" onClick={onClose}>Close</button>
      </div>

      {/* Task detail form */}
      <div className="p-4 space-y-4">
        <input
          id="task-title"
          value={title}
          onChange={e=>setTitle(e.target.value)}
          className="w-full rounded border px-3 py-2 text-sm"
          placeholder="Title"
          aria-label="Title"
        />
        <textarea
          id="task-notes"
          value={notes}
          onChange={e=>setNotes(e.target.value)}
          rows={6}
          className="w-full rounded border px-3 py-2 text-sm"
          placeholder="Notes"
          aria-label="Notes"
        />
        <div className="grid grid-cols-2 gap-3">
          {/* Due date input */}
          <div className="flex flex-col gap-1">
            <label htmlFor="task-due-date" className="text-xs text-gray-500">Due date</label>
            <input
              id="task-due-date"
              type="date"
              value={dueDate ?? ""}
              onChange={e=>setDueDate(e.target.value || null)}
              className="rounded border px-2 py-1 text-sm"
            />
          </div>
          {/* Priority selector */}
          <div className="flex flex-col gap-1">
            <label htmlFor="task-priority" className="text-xs text-gray-500">Priority</label>
            <select
              id="task-priority"
              value={priority}
              onChange={e=>setPriority(e.target.value)}
              className="rounded border px-2 py-1 text-sm"
            >
              <option value={"3"}>High</option>
              <option value={"2"}>Medium</option>
              <option value={"1"}>Low</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}