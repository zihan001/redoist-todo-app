// src/components/tasks/TaskDetailPanel.tsx
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

function useTask(taskId: string) {
  return useQuery({
    queryKey: ["task", taskId],
    queryFn: async () => {
      const r = await fetch(`/api/tasks?filter=completed&q=&page=1&pageSize=1&id=${taskId}`);
      // optional: add GET /api/tasks/:id in backend; for brevity, assume:
      const rr = await fetch(`/api/tasks/${taskId}`); // if you add this route
      if (!rr.ok) throw new Error("not found");
      return rr.json();
    }
  });
}

export default function TaskDetailPanel({ taskId, onClose }:{taskId:string; onClose:()=>void}) {
  const qc = useQueryClient();
  const { data, isLoading } = useTask(taskId);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [priority, setPriority] = useState<1|2|3>(2);

  useEffect(() => {
    if (data) {
      setTitle(data.title ?? "");
      setNotes(data.notes ?? "");
      setDueDate(data.dueDate ? data.dueDate.slice(0,10) : null);
      setPriority(data.priority ?? 2);
    }
  }, [data]);

  const patch = useMutation({
    mutationFn: async (body: any) => {
      const r = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify(body),
      });
      if (!r.ok) throw new Error("patch failed");
      return r.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"]});
      qc.invalidateQueries({ queryKey: ["task", taskId]});
    }
  });

  // simple debounce
  useEffect(() => {
    const h = setTimeout(() => {
      patch.mutate({ title, notes, dueDate: dueDate ? new Date(dueDate).toISOString() : null, priority });
    }, 500);
    return () => clearTimeout(h);
  }, [title, notes, dueDate, priority]);

  if (isLoading) return <div className="rounded-xl border bg-white p-4">Loading…</div>;

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
              onChange={e=>setPriority(Number(e.target.value) as 1|2|3)}
              className="rounded border px-2 py-1 text-sm"
            >
              <option value={3}>High</option>
              <option value={2}>Medium</option>
              <option value={1}>Low</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
