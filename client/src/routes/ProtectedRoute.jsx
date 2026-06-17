import { Navigate, Outlet } from "react-router-dom";
import { roleHome, useAuth } from "../context/AuthContext";

export function ProtectedRoute({ roles }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to={roleHome[user.role] || "/login"} replace />;

  return <Outlet />;
}
