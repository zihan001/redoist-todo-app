// client/src/components/tasks/TaskFilters.tsx
import { useSearchParams, useNavigate } from "react-router-dom";

/**
 * Tab Component
 * 
 * Represents a single tab in the filter bar.
 * @param {string} id - The unique identifier for the tab.
 * @param {string} label - The label to display on the tab.
 * @param {boolean} active - Whether the tab is currently active.
 * @param {function} onClick - Callback to handle tab click events.
 */
const Tab = ({ id, label, active, onClick }:{id:string;label:string;active:boolean;onClick:()=>void}) => (
  <button
    onClick={onClick}
    className={`px-3 py-1 rounded-full text-sm border ${active ? "bg-gray-900 text-white" : "bg-white text-gray-700"}`}
  >{label}</button>
);

/**
 * TaskFilters Component
 * 
 * Provides a set of filters for tasks, including:
 * - Filter by status (e.g., "all", "today", "upcoming").
 * - Filter by priority (e.g., "High", "Medium", "Low").
 */
export default function TaskFilters() {
  const [sp, setSp] = useSearchParams();

  const filter = sp.get("filter") ?? "all";
  const prio = sp.get("priority") ?? "";

  // Update the search parameters in the URL
  const set = (k:string,v:string) => {
    const next = new URLSearchParams(sp);
    if (v) next.set(k, v); else next.delete(k);
    setSp(next, { replace: true });
  };

  return (
    <div className="flex items-center justify-between gap-3">
      {/* Filter tabs */}
      <div className="flex gap-2">
        {["all", "today", "upcoming", "past", "completed"].map(f => (
          <Tab 
            key={f} 
            id={f} 
            label={f[0].toUpperCase()+f.slice(1)} 
            active={filter===f} 
            onClick={()=>set("filter",f)} 
          />
        ))}
      </div>
      {/* Priority buttons */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-500">Priority</span>
        {["3","2","1"].map(p => (
          <button 
            key={p}
            onClick={()=> set("priority", prio===p ? "" : p)}
            className={`px-2 py-1 rounded border text-sm ${prio===p ? "bg-gray-900 text-white":"bg-white"}`}>
            {p==="3"?"High":p==="2"?"Med":"Low"}
          </button>
        ))}
      </div>
    </div>
  );
}
