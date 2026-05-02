import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import { UserRole } from '../../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user, loading } = useAppSelector((state) => state.auth);
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex align-items-center justify-content-center min-h-screen">
        <i className="pi pi-spin pi-spinner" style={{ fontSize: '3rem' }}></i>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirect based on user role
    if (user.role === UserRole.ADMIN) {
      return <Navigate to="/admin" replace />;
    } else if (user.role === UserRole.PROVIDER) {
      return <Navigate to="/provider" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}
