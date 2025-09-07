import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { roles } from '../supabase/supabase';

interface ProtectedRouteProps {
  children: React.ReactNode;
  permissionLevel: number;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, permissionLevel = 0
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!user.profile || !user.stats) {
    return <Navigate to="/login" replace />;
  }

  if (permissionLevel > roles.indexOf(user.profile?.permission_level || 'STUDENT')) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};