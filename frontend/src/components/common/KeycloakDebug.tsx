import React from 'react';
import { useKeycloakAuth } from '../../contexts/KeycloakAuthContext';

const KeycloakDebug: React.FC = () => {
  const { user, isAuthenticated, isLoading, error, token } = useKeycloakAuth();

  // Só mostrar em desenvolvimento
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg max-w-md text-xs">
      <h3 className="font-bold mb-2">Keycloak Debug</h3>
      <div className="space-y-1">
        <div>Loading: {isLoading ? 'true' : 'false'}</div>
        <div>Authenticated: {isAuthenticated ? 'true' : 'false'}</div>
        <div>Error: {error || 'none'}</div>
        <div>User: {user ? user.username : 'none'}</div>
        <div>Token: {token ? 'present' : 'none'}</div>
        <div>Keycloak URL: {import.meta.env.VITE_KEYCLOAK_URL_BASE}</div>
        <div>Realm: {import.meta.env.VITE_KEYCLOAK_REALM}</div>
        <div>Client ID: {import.meta.env.VITE_KEYCLOAK_CLIENT_ID}</div>
      </div>
    </div>
  );
};

export default KeycloakDebug;
