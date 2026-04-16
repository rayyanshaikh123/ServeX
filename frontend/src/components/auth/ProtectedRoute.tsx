import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { Role } from '../../types';

interface ProtectedRouteProps {
  allowedRoles?: Role[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, token } = useAuthStore();
  const normalizedRole = user?.role ? (user.role.toUpperCase() as Role) : null;
  const allowed = allowedRoles?.map((role) => role.toUpperCase() as Role);

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowed && (!normalizedRole || !allowed.includes(normalizedRole))) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};
