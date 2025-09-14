// src/components/tasks/TaskFilters.tsx
import { useSearchParams, useNavigate } from "react-router-dom";

const Tab = ({ id, label, active, onClick }:{id:string;label:string;active:boolean;onClick:()=>void}) => (
  <button
    onClick={onClick}
    className={`px-3 py-1 rounded-full text-sm border ${active ? "bg-gray-900 text-white" : "bg-white text-gray-700"}`}
  >{label}</button>
);

export default function TaskFilters() {
  const [sp, setSp] = useSearchParams();
  const navigate = useNavigate();

  const filter = sp.get("filter") ?? "today";
  const prio = sp.get("priority") ?? "";

  const set = (k:string,v:string) => {
    const next = new URLSearchParams(sp);
    if (v) next.set(k, v); else next.delete(k);
    setSp(next, { replace: true });
  };

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex gap-2">
        {["today","upcoming","completed"].map(f => (
          <Tab key={f} id={f} label={f[0].toUpperCase()+f.slice(1)} active={filter===f} onClick={()=>set("filter",f)} />
        ))}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">Priority</span>
        {[3,2,1].map(p => (
          <button key={p}
            onClick={()=> set("priority", prio===String(p) ? "" : String(p))}
            className={`px-2 py-1 rounded border text-sm ${prio===String(p) ? "bg-gray-900 text-white":"bg-white"}`}>
            {p===3?"High":p===2?"Med":"Low"}
          </button>
        ))}
      </div>
    </div>
  );
}
