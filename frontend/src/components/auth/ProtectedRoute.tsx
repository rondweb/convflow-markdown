import React from 'react';
import { Navigate } from 'react-router-dom';
import { useKeycloakAuth } from '../../contexts/KeycloakAuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: string[]; // Roles opcionais para autorização
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, roles }) => {
  const { user, isLoading, isAuthenticated, hasAnyRole } = useKeycloakAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    console.log('ProtectedRoute: Unauthorized access attempt, redirecting to login');
    // Remover estado de autenticação para forçar reautenticação
    sessionStorage.removeItem('keycloak-authenticated');
    return <Navigate to="/login" replace />;
  }
  
  console.log('ProtectedRoute: User authenticated, granting access', user?.username);

  // Verificar roles se especificadas
  if (roles && roles.length > 0 && !hasAnyRole(roles)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
          <p className="text-gray-600 mt-2">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;