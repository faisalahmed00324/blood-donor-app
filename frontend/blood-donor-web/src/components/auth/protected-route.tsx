import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/auth-context";

type ProtectedRouteProps = {
  children: React.ReactNode;
  allowedRoles?: string[];
  requireCanSeek?: boolean;
  requireDonorProfileAccess?: boolean;
};

export function ProtectedRoute({ children, allowedRoles, requireCanSeek, requireDonorProfileAccess }: ProtectedRouteProps) {
  const { isAuthenticated, userRole, canSeek, canManageDonorProfile, hasDonorProfile } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  if (requireCanSeek && !canSeek) {
    return <Navigate to="/dashboard" replace />;
  }

  if (requireDonorProfileAccess && !(canManageDonorProfile || hasDonorProfile)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
