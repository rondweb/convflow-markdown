import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { keycloakService, KeycloakUser } from '../services/keycloakService';

interface KeycloakAuthContextType {
  user: KeycloakUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: () => Promise<void>;
  register: () => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  token: string | undefined;
  refreshToken: () => Promise<boolean>;
}

const KeycloakAuthContext = createContext<KeycloakAuthContextType | undefined>(undefined);

interface KeycloakAuthProviderProps {
  children: ReactNode;
}

export const KeycloakAuthProvider: React.FC<KeycloakAuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<KeycloakUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeKeycloak = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const authenticated = await keycloakService.init();
        
        setIsAuthenticated(authenticated);
        
        if (authenticated) {
          const userData = keycloakService.getUser();
          setUser(userData);
          console.log('Keycloak initialized - User authenticated:', userData);
        } else {
          console.log('Keycloak initialized - User not authenticated');
        }

        // Registrar callbacks para mudanças de estado
        keycloakService.onLogin((userData) => {
          console.log('Login callback triggered:', userData);
          setUser(userData);
          setIsAuthenticated(true);
        });

        keycloakService.onLogout(() => {
          console.log('Logout callback triggered');
          setUser(null);
          setIsAuthenticated(false);
        });

      } catch (err) {
        console.error('Failed to initialize Keycloak:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize authentication');
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeKeycloak();
  }, []);

  const login = async () => {
    try {
      setError(null);
      await keycloakService.login();
    } catch (err) {
      console.error('Login failed:', err);
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  const register = async () => {
    try {
      setError(null);
      await keycloakService.register();
    } catch (err) {
      console.error('Register failed:', err);
      setError(err instanceof Error ? err.message : 'Registration failed');
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await keycloakService.logout();
      setUser(null);
      setIsAuthenticated(false);
    } catch (err) {
      console.error('Logout failed:', err);
      setError(err instanceof Error ? err.message : 'Logout failed');
    }
  };

  const hasRole = (role: string): boolean => {
    return keycloakService.hasRole(role);
  };

  const hasAnyRole = (roles: string[]): boolean => {
    return keycloakService.hasAnyRole(roles);
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      const refreshed = await keycloakService.refreshToken();
      if (refreshed) {
        // Atualizar dados do usuário se o token foi renovado
        const userData = keycloakService.getUser();
        setUser(userData);
      }
      return refreshed;
    } catch (err) {
      console.error('Token refresh failed:', err);
      setError(err instanceof Error ? err.message : 'Token refresh failed');
      return false;
    }
  };

  const value: KeycloakAuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    hasRole,
    hasAnyRole,
    token: keycloakService.getToken(),
    refreshToken
  };

  // Mostrar loading enquanto inicializa
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Initializing authentication...</p>
          {error && (
            <p className="mt-2 text-red-600 text-sm">{error}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <KeycloakAuthContext.Provider value={value}>
      {children}
    </KeycloakAuthContext.Provider>
  );
};

// Hook para usar o contexto
export const useKeycloakAuth = (): KeycloakAuthContextType => {
  const context = useContext(KeycloakAuthContext);
  if (context === undefined) {
    throw new Error('useKeycloakAuth must be used within a KeycloakAuthProvider');
  }
  return context;
};

// Hook de compatibilidade com o contexto antigo (para facilitar migração)
export const useAuth = useKeycloakAuth;

export default KeycloakAuthContext;
