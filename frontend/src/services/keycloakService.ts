import Keycloak from 'keycloak-js';

// Configuração do Keycloak
const keycloakConfig = {
  url: import.meta.env.VITE_KEYCLOAK_URL_BASE || 'https://keycloak-leaftix-g4gufcg6acgnbbar.eastus2-01.azurewebsites.net',
  realm: import.meta.env.VITE_KEYCLOAK_REALM || 'convflow',
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'cvclient'
};

console.log('Keycloak Config:', keycloakConfig);

// Configurações de inicialização
const initOptions = {
  onLoad: 'check-sso' as const, // Verifica se o usuário já está logado
  silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
  pkceMethod: 'S256' as const, // Usar PKCE para segurança adicional
  checkLoginIframe: false, // Desabilitar iframe check para evitar problemas de CORS
  enableLogging: true, // Habilitar logs para debug
  redirectUri: window.location.origin + '/dashboard', // Redirecionar para o dashboard após autenticação
};

// Instância do Keycloak
const keycloak = new Keycloak(keycloakConfig);

// Interface para o usuário
export interface KeycloakUser {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  roles: string[];
}

// Classe do serviço Keycloak
class KeycloakService {
  private initialized = false;
  private loginCallbacks: Array<(user: KeycloakUser | null) => void> = [];
  private logoutCallbacks: Array<() => void> = [];

  async init(): Promise<boolean> {
    if (this.initialized) {
      // Já inicializado, retorna o estado atual
      return keycloak.authenticated || false;
    }
    try {
      console.log('Initializing Keycloak with config:', keycloakConfig);
      console.log('Init options:', initOptions);
      
      // Adicionar evento de log para depurar fluxo de autenticação
      window.addEventListener('keycloak-callback', () => {
        console.log('Keycloak callback event received');
      });
      
      const authenticated = await keycloak.init(initOptions);
      this.initialized = true;

      console.log('Keycloak initialized. Authenticated:', authenticated);
      console.log('Token:', keycloak.token ? 'Present' : 'Missing');
      console.log('User info:', keycloak.tokenParsed);

      // Configurar eventos
      keycloak.onTokenExpired = () => {
        console.log('Token expired, refreshing...');
        this.refreshToken();
      };

      keycloak.onAuthSuccess = () => {
        console.log('Authentication successful');
        this.notifyLoginCallbacks();
      };

      keycloak.onAuthLogout = () => {
        console.log('User logged out');
        this.notifyLogoutCallbacks();
      };

      keycloak.onAuthError = (error) => {
        console.error('Authentication error:', error);
      };

      keycloak.onAuthRefreshSuccess = () => {
        console.log('Token refresh successful');
      };

      keycloak.onAuthRefreshError = () => {
        console.error('Token refresh failed');
        this.logout();
      };

      return authenticated;
    } catch (error) {
      console.error('Failed to initialize Keycloak:', error);
      this.initialized = true; // Marcar como inicializado mesmo com erro para evitar loops
      return false;
    }
  }

  // Login do usuário
  async login(): Promise<void> {
    if (!this.initialized) {
      throw new Error('Keycloak not initialized');
    }
    console.log('Attempting to login...');
    
    // Usar redirecionamento em vez de popup para melhor compatibilidade
    console.log('Current location.origin:', window.location.origin);
    
    // Ajustado para usar location.origin corretamente
    return keycloak.login({
      redirectUri: `${window.location.origin}/dashboard`
    });
  }

  // Registro do usuário (redireciona para página de registro do Keycloak)
  async register(): Promise<void> {
    if (!this.initialized) {
      throw new Error('Keycloak not initialized');
    }
    console.log('Attempting to register...');
    
    // Redirecionar para página de registro do Keycloak
    console.log('Current location.origin:', window.location.origin);
    
    // Ajustado para usar location.origin corretamente
    return keycloak.login({
      action: 'register',
      redirectUri: `${window.location.origin}/dashboard`
    });
  }

  // Logout do usuário
  async logout(): Promise<void> {
    if (!this.initialized) {
      throw new Error('Keycloak not initialized');
    }
    // Adicionar URL de redirecionamento para logout
    return keycloak.logout({
      redirectUri: window.location.origin
    });
  }

  // Verificar se está autenticado
  isAuthenticated(): boolean {
    const authenticated = keycloak.authenticated || false;
    
    // Armazenar estado de autenticação para verificações entre páginas
    if (authenticated) {
      sessionStorage.setItem('keycloak-authenticated', 'true');
    }
    
    return authenticated;
  }

  // Obter dados do usuário
  getUser(): KeycloakUser | null {
    if (!this.isAuthenticated() || !keycloak.tokenParsed) {
      sessionStorage.removeItem('keycloak-authenticated');
      return null;
    }

    const token = keycloak.tokenParsed as Record<string, unknown>;
    return {
      id: (token.sub as string) || '',
      username: (token.preferred_username as string) || (token.sub as string) || '',
      email: (token.email as string) || '',
      firstName: token.given_name as string,
      lastName: token.family_name as string,
      name: (token.name as string) || `${token.given_name || ''} ${token.family_name || ''}`.trim(),
      roles: ((token.realm_access as Record<string, unknown>)?.roles as string[]) || []
    };
  }

  // Obter token de acesso
  getToken(): string | undefined {
    return keycloak.token;
  }

  // Atualizar token
  async refreshToken(): Promise<boolean> {
    try {
      const refreshed = await keycloak.updateToken(30); // Refresh se expira em 30 segundos
      if (refreshed) {
        console.log('Token refreshed');
      }
      return refreshed;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      await this.logout();
      return false;
    }
  }

  // Verificar se tem role específica
  hasRole(role: string): boolean {
    if (!keycloak.tokenParsed) return false;
    const token = keycloak.tokenParsed as Record<string, unknown>;
    return ((token.realm_access as Record<string, unknown>)?.roles as string[])?.includes(role) || false;
  }

  // Verificar se tem alguma das roles
  hasAnyRole(roles: string[]): boolean {
    return roles.some(role => this.hasRole(role));
  }

  // Registrar callback para login
  onLogin(callback: (user: KeycloakUser | null) => void): void {
    this.loginCallbacks.push(callback);
  }

  // Registrar callback para logout
  onLogout(callback: () => void): void {
    this.logoutCallbacks.push(callback);
  }

  // Notificar callbacks de login
  private notifyLoginCallbacks(): void {
    const user = this.getUser();
    this.loginCallbacks.forEach(callback => callback(user));
  }

  // Notificar callbacks de logout
  private notifyLogoutCallbacks(): void {
    this.logoutCallbacks.forEach(callback => callback());
  }

  // Obter instância do Keycloak (para casos avançados)
  getKeycloakInstance(): Keycloak {
    return keycloak;
  }
}

// Instância singleton do serviço
export const keycloakService = new KeycloakService();

// Hook para facilitar uso no React
export const useKeycloak = () => {
  return {
    keycloak: keycloakService,
    isAuthenticated: keycloakService.isAuthenticated(),
    user: keycloakService.getUser(),
    login: () => keycloakService.login(),
    register: () => keycloakService.register(),
    logout: () => keycloakService.logout(),
    hasRole: (role: string) => keycloakService.hasRole(role),
    hasAnyRole: (roles: string[]) => keycloakService.hasAnyRole(roles),
    token: keycloakService.getToken()
  };
};

export default keycloakService;
