import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: ("admin" | "client")[];
  fallback?: string;
}

export function ProtectedRoute({ children, allowedRoles, fallback }: ProtectedRouteProps) {
  const { session, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground animate-pulse">Loading SuperSaaS…</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    const redirect = fallback || (role === "admin" ? "/dashboard" : "/portal");
    return <Navigate to={redirect} replace />;
  }

  // If user has no role yet (newly signed up), send to portal
  if (allowedRoles && !role) {
    return <Navigate to="/portal" replace />;
  }

  return <>{children}</>;
}
