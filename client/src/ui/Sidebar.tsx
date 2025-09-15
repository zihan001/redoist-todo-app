// client/src/ui/Sidebar.tsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createProject, listProjects } from "../api/projects";
import { useState } from "react";
import TaskList from "./TaskList";
import { useSearchParams } from "react-router-dom";

/**
 * Sidebar Component
 * 
 * Displays a list of projects and allows the user to:
 * - Select a project to view its tasks.
 * - Create a new project.
 * - View tasks in the selected project.
 */
export default function Sidebar() {
  const qc = useQueryClient();

  // Fetch the list of projects
  const { data: projects } = useQuery({ 
    queryKey: ["projects"], 
    queryFn: () => listProjects(false) 
  });

  const [name, setName] = useState("");

  // Mutation to create a new project
  const create = useMutation({
    mutationFn: () => createProject(name),
    onSuccess: () => { 
      setName("");  // Clear the input field
      qc.invalidateQueries({ queryKey: ["projects"] });   // Refresh the project list
    },
  });

  const [sp, setSp] = useSearchParams();

  // Select a project by updating the URL search parameters
  const selectProject = (projectId?: string) => {
    const next = new URLSearchParams(sp);
    if (projectId) next.set("projectId", projectId);
    else next.delete("projectId");
    setSp(next, { replace: true });
  };

  const selectedId = sp.get("projectId");

  return (
    <div className="p-3 space-y-4">
      <div>
        <h2 className="text-sm text-gray-500 mb-2">Projects</h2>
        <ul className="space-y-1">
          {/* Inbox (default project) */}
          <li>
            <button
              onClick={()=>selectProject(undefined)}
              className={`w-full text-left px-2 py-1 rounded hover:bg-gray-100 ${!selectedId ? "bg-gray-100 font-medium" : ""}`}
            >
              <span className="inline-block w-2 h-2 rounded-full mr-2 align-middle" style={{ background: "#64748b" }} />
              Inbox
            </button>
          </li>
          {/* List of user-created projects */}
          {projects?.map(p => (
            <li key={p._id}>
              <button
                onClick={()=>selectProject(p._id)}
                className={`w-full text-left px-2 py-1 rounded hover:bg-gray-100 ${selectedId===p._id ? "bg-gray-100 font-medium" : ""}`}
              >
                <span className="inline-block w-2 h-2 rounded-full mr-2 align-middle" style={{ background: p.color ?? "#64748b" }} />
                {p.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Form to create a new project */}
      <form className="flex gap-2" onSubmit={(e)=>{ e.preventDefault(); if(name.trim()) create.mutate(); }}>
        <input className="flex-1 border rounded px-2 py-1" placeholder="New project" value={name} onChange={e=>setName(e.target.value)} />
        <button className="px-3 py-1 rounded bg-black text-white disabled:opacity-60" disabled={!name.trim() || create.isPending}>
          Add
        </button>
      </form>

      {/* Task list for the selected project */}
      <div className="border-t pt-3">
        <TaskList projectId={selectedId ?? undefined} />
      </div>
    </div>
  );
}
