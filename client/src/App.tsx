import { Route, Routes, Navigate } from "react-router-dom";
import Login from "./pages/Login.tsx";
import Signup from "./pages/Signup.tsx";
import AppLayout from "./pages/AppLayout.tsx";
import TasksPage from "./pages/TasksPage.tsx";
import { RequireAuth } from "./components/RequireAuth.tsx";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login/>} />
      <Route path="/signup" element={<Signup/>} />
      <Route
        path="/app"
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route index element={<TasksPage />} />
        <Route path="tasks" element={<TasksPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/app" replace />} />
    </Routes>
  );
}