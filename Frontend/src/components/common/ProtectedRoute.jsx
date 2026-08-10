import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Loader from './Loader';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loader fullScreen message="Checking permissions..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0) {
    const userRole = user?.role?.startsWith('ROLE_') ? user.role.substring(5) : user?.role;
    const hasRolePermission = allowedRoles.some((r) => {
      const targetRole = r.startsWith('ROLE_') ? r.substring(5) : r;
      return userRole?.toUpperCase() === targetRole?.toUpperCase();
    });

    if (!hasRolePermission) {
      return (
        <div className="container py-5 text-center">
          <div className="card shadow-sm border-0 p-5 mx-auto" style={{ maxWidth: '500px' }}>
            <i className="bi bi-shield-slash text-danger display-1 mb-3"></i>
            <h3 className="fw-bold text-dark mb-2">Access Denied</h3>
            <p className="text-muted">You do not have permission to access this page.</p>
            <Navigate to="/" replace />
          </div>
        </div>
      );
    }
  }

  return children;
};

export default ProtectedRoute;
