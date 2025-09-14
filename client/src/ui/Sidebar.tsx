import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createProject, listProjects } from "../api/projects";
import type { Project } from "../api/projects";
import { useState } from "react";
import TaskList from "./TaskList";

export default function Sidebar() {
  const qc = useQueryClient();
  const { data: projects } = useQuery({ queryKey: ["projects"], queryFn: () => listProjects(false) });

  const [name, setName] = useState("");
  const create = useMutation({
    mutationFn: () => createProject(name),
    onSuccess: () => { setName(""); qc.invalidateQueries({ queryKey: ["projects"] }); },
  });

  const [selected, setSelected] = useState<Project | null>(null);

  return (
    <div className="p-3 space-y-4">
      <div>
        <h2 className="text-sm text-gray-500 mb-2">Projects</h2>
        <ul className="space-y-1">
          {projects?.map(p => (
            <li key={p._id}>
              <button
                onClick={()=>setSelected(p)}
                className={`w-full text-left px-2 py-1 rounded hover:bg-gray-100 ${selected?._id===p._id ? "bg-gray-100 font-medium" : ""}`}
              >
                <span className="inline-block w-2 h-2 rounded-full mr-2 align-middle" style={{ background: p.color ?? "#64748b" }} />
                {p.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <form className="flex gap-2" onSubmit={(e)=>{ e.preventDefault(); if(name.trim()) create.mutate(); }}>
        <input className="flex-1 border rounded px-2 py-1" placeholder="New project" value={name} onChange={e=>setName(e.target.value)} />
        <button className="px-3 py-1 rounded bg-black text-white disabled:opacity-60" disabled={!name.trim() || create.isPending}>
          Add
        </button>
      </form>

      <div className="border-t pt-3">
        <TaskList projectId={selected?._id} />
      </div>
    </div>
  );
}
