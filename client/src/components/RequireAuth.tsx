// client/src/components/RequireAuth.tsx
import type { PropsWithChildren } from "react";
import { useQuery } from "@tanstack/react-query";
import { me } from "../api/auth";
import { Navigate } from "react-router-dom";

/**
 * RequireAuth Component
 * 
 * Protects routes by ensuring the user is authenticated.
 * - If the user is not authenticated, redirects to the login page.
 * - If the user is authenticated, renders the child components.
 * 
 * @param {PropsWithChildren} children - The child components to render if authenticated.
 */
export function RequireAuth({ children }: PropsWithChildren) {
  const { data, isLoading, isError } = useQuery({ queryKey: ["me"], queryFn: me });

  if (isLoading) return <div className="p-6 text-gray-500">Loading…</div>;

  // Redirect to login if authentication fails
  if (isError) return <Navigate to="/login" replace />;

  // Render child components if authenticated
  return <>{children}</>;
}
