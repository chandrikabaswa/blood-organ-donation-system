import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ allowedRole, children }) => {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p style={{ color: '#64748b' }}>Loading session...</p>
      </div>
    );
  }

  // Not logged in -> send to login page
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If role does not match, redirect strictly to their designated dashboard
  if (allowedRole && role !== allowedRole) {
    if (role === 'donor') {
      return <Navigate to="/donor/dashboard" replace />;
    }
    if (role === 'hospital') {
      return <Navigate to="/hospital/dashboard" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
