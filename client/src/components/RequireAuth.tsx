import type { PropsWithChildren } from "react";
import { useQuery } from "@tanstack/react-query";
import { me } from "../api/auth";
import { Navigate } from "react-router-dom";

export function RequireAuth({ children }: PropsWithChildren) {
  const { data, isLoading, isError } = useQuery({ queryKey: ["me"], queryFn: me });

  if (isLoading) return <div className="p-6 text-gray-500">Loading…</div>;
  if (isError) return <Navigate to="/login" replace />;

  // Optionally provide user via context if needed
  return <>{children}</>;
}
