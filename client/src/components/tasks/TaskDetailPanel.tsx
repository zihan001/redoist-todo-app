import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getTask, updateTask } from "../../api/tasks";

function useTask(taskId: string) {
  return useQuery({
    queryKey: ["task", taskId],
    queryFn: () => getTask(taskId)
  });
}

export default function TaskDetailPanel({ taskId, onClose }:{taskId:string; onClose:()=>void}) {
  const qc = useQueryClient();
  const { data, isLoading, error: fetchError } = useTask(taskId);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [priority, setPriority] = useState<string>("2");

  useEffect(() => {
    if (data) {
      setTitle(data.title ?? "");
      setNotes(data.notes ?? "");
      setDueDate(data.dueDate ? data.dueDate.slice(0,10) : null);
      setPriority(String(data.priority) ?? "2");
    }
  }, [data]);

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

  // simple debounce
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

  if (isLoading) return <div className="rounded-xl border bg-white p-4">Loading…</div>;

  if (fetchError) return (
    <div className="rounded-xl border bg-white p-4 text-red-600">
      Error loading task: {(fetchError as Error).message || "Unknown error"}
    </div>
  );

  return (
    <div className="rounded-xl border bg-white overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b">
        <div className="text-sm font-semibold">Task details</div>
        <button className="text-sm text-gray-500 hover:text-gray-800" onClick={onClose}>Close</button>
      </div>
      <div className="p-4 space-y-4">
        <input
          value={title}
          onChange={e=>setTitle(e.target.value)}
          className="w-full rounded border px-3 py-2 text-sm"
          placeholder="Title"
        />
        <textarea
          value={notes}
          onChange={e=>setNotes(e.target.value)}
          rows={6}
          className="w-full rounded border px-3 py-2 text-sm"
          placeholder="Notes"
        />
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Due date</label>
            <input
              type="date"
              value={dueDate ?? ""}
              onChange={e=>setDueDate(e.target.value || null)}
              className="rounded border px-2 py-1 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Priority</label>
            <select
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