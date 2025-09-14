import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { completeTask, createTask, deleteTask, listTasks, uncompleteTask } from "../api/tasks";
import { useState } from "react";
import type { FormEvent } from "react";

export default function TaskList({ projectId }: { projectId?: string }) {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["tasks", { projectId }],
    queryFn: () => listTasks({ projectId: projectId }),
  });

  const [title, setTitle] = useState("");
  const add = useMutation({
    mutationFn: () => createTask({ title, projectId: projectId }),
    onSuccess: () => { setTitle(""); qc.invalidateQueries({ queryKey: ["tasks"] }); },
  });

  const toggle = useMutation({
    mutationFn: async (id: string) => {
      const t = data?.items?.find(t => t._id === id);
      if (!t) return;
      if (t.completedAt) return uncompleteTask(id);
      return completeTask(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteTask(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const onSubmit = (e: FormEvent) => { e.preventDefault(); if (title.trim()) add.mutate(); };

  return (
    <div>
      <h3 className="text-sm text-gray-500 mb-2">{projectId ? "Tasks in project" : "All tasks"}</h3>
      <ul className="space-y-2">
        {data?.items?.map(t => (
          <li key={t._id} className="flex items-center gap-2">
            <input type="checkbox" checked={!!t.completedAt} onChange={()=>toggle.mutate(t._id)} />
            <span className={t.completedAt ? "line-through text-gray-500" : ""}>{t.title}</span>
            <button onClick={()=>remove.mutate(t._id)} className="ml-auto text-xs text-red-600">Delete</button>
          </li>
        ))}
      </ul>

      <form onSubmit={onSubmit} className="mt-3 flex gap-2">
        <input className="flex-1 border rounded px-2 py-1" placeholder="Quick add task"
               value={title} onChange={e=>setTitle(e.target.value)} />
        <button className="px-3 py-1 rounded bg-black text-white disabled:opacity-60" disabled={!title.trim() || add.isPending}>
          Add
        </button>
      </form>
    </div>
  );
}