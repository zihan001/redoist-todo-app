// client/src/pages/TasksPage.tsx
import TaskFilters from "../components/tasks/TaskFilters";
import TaskList from "../components/tasks/TaskList";

export default function TasksPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Tasks</h1>
      <TaskFilters />
      <TaskList />
    </div>
  );
}