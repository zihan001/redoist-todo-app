// client/src/components/tasks/TaskList.tsx
import { useSearchParams } from "react-router-dom";
import { useTasks } from "../../hooks/useTasks";
import TaskDetailPanel from "./TaskDetailPanel";

/**
 * TaskList Component
 * 
 * Displays a list of tasks and allows the user to select a task to view its details.
 * - Fetches tasks using the `useTasks` hook.
 * - Manages the selected task via URL search parameters.
 * - Displays a `TaskDetailPanel` when a task is selected.
 */
export default function TaskList() {
  const { data, isLoading } = useTasks();
  const [sp, setSp] = useSearchParams();
  const selectedId = sp.get("taskId");

  // Open a task detail panel by setting the `taskId` in the URL
  const open = (id: string) => {
    const n = new URLSearchParams(sp); 
    n.set("taskId", id); 
    setSp(n, { replace: false });
  };

  // Close the task detail panel by removing the `taskId` from the URL
  const close = () => {
    const n = new URLSearchParams(sp); 
    n.delete("taskId"); 
    setSp(n, { replace: false });
  };

  return (
    <div className="grid grid-cols-12 gap-4">
      {/* Task list section */}
      <div className={`col-span-12 ${selectedId ? "lg:col-span-7" : "lg:col-span-12"} transition-all`}>
        {isLoading ? <div>Loading…</div> : (
          <ul className="divide-y rounded-xl border bg-white">
            {data?.items.map(t => (
              <li key={t._id}
                  className="p-3 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                  onClick={()=>open(t._id)}>
                <div className="flex items-center gap-3">
                  {/* Checkbox to toggle task completion */}
                  <input type="checkbox"
                    defaultChecked={!!t.completedAt}
                    onClick={(e)=>e.stopPropagation()}
                    onChange={async (e)=>{
                      // Update task completion status
                      await fetch(`/api/tasks/${t._id}`, {
                        method: "PATCH",
                        headers: {"Content-Type":"application/json"},
                        body: JSON.stringify({ completedAt: e.currentTarget.checked })
                      });
                    }} />
                  <div>
                    <div className="font-medium">{t.title}</div>
                    <div className="text-xs text-gray-500">
                      {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : "No due date"} • {t.priority===3?"High":t.priority===2?"Med":"Low"}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Task detail panel section */}
      {selectedId && (
        <div className="col-span-12 lg:col-span-5">
          <TaskDetailPanel taskId={selectedId} onClose={close} />
        </div>
      )}
    </div>
  );
}
