import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../state/auth-context";
import ScreenLoader from "./ScreenLoader";

export default function ProtectedRoute({ roles }) {
  const { loading, isAuthenticated, user } = useAuth();

  if (loading) {
    return <ScreenLoader label="Đang kiểm tra phiên đăng nhập..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
