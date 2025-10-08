// client/src/pages/AppLayout.tsx
import { Outlet, useNavigate, NavLink } from "react-router-dom";
import Sidebar from "../ui/Sidebar";
import { logout } from "../api/auth";

export default function AppLayout() {
  const nav = useNavigate();
  
  return (
    <div className="min-h-screen grid grid-cols-[280px_1fr]">
      <aside className="border-r">
        <div className="p-3 flex items-center justify-between">
          <h1 className="font-semibold">redoist</h1>
          <button
            onClick={async ()=>{ await logout(); nav("/login", { replace: true }); }}
            className="text-sm text-gray-600 hover:text-black"
          >Logout</button>
        </div>
        
        <nav className="p-3 border-b">
          <ul className="space-y-1">
            <li>
              <NavLink 
                to="/app/tasks" 
                className={({isActive}) => 
                  `block px-3 py-2 rounded-lg ${isActive ? 'bg-gray-100 font-medium' : 'hover:bg-gray-50'}`
                }
              >
                All Tasks
              </NavLink>
            </li>
          </ul>
        </nav>
        
        <Sidebar />
      </aside>
      <main className="p-4">
        <Outlet />
      </main>
    </div>
  );
}