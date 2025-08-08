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
  onLoad: 'check-sso' as const, // Alterado para verificar SSO sem forçar login
  silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
  pkceMethod: 'S256' as const, // Usar PKCE para segurança adicional
  checkLoginIframe: false, // Desabilitar iframe check para evitar problemas de CORS
  enableLogging: true, // Habilitar logs para debug
  redirectUri: window.location.origin + '/dashboard', // Redirecionar para o dashboard após autenticação
  flow: 'standard' as const, // Usar fluxo padrão em vez de implícito
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
      console.log('Keycloak já inicializado, retornando estado atual:', keycloak.authenticated);
      return keycloak.authenticated || false;
    }
    try {
      console.log('Initializing Keycloak with config:', keycloakConfig);
      console.log('Init options:', initOptions);
      
      // Verificar se há token salvo em localStorage para persistência entre sessões
      const savedToken = localStorage.getItem('keycloak-token');
      if (savedToken) {
        console.log('Found saved token, setting token before init');
        try {
          // Tenta usar o token salvo se estiver disponível
          keycloak.token = savedToken;
        } catch (e) {
          console.error('Error setting saved token:', e);
          localStorage.removeItem('keycloak-token');
        }
      }
      
      // Adicionar evento de log para depurar fluxo de autenticação
      window.addEventListener('keycloak-callback', () => {
        console.log('Keycloak callback event received');
        // Forçar verificação do token
        this.refreshToken().then(refreshed => {
          if (keycloak.authenticated) {
            console.log('Authentication confirmed in callback, saving token');
            localStorage.setItem('keycloak-token', keycloak.token || '');
            
            // Redirecionar se não estivermos no dashboard
            if (window.location.pathname !== '/dashboard') {
              console.log('Redirecting to dashboard from callback handler');
              window.location.replace('/dashboard');
            }
          }
        });
      });
      
      // Verificar se estamos retornando de um login
      const params = new URLSearchParams(window.location.search);
      const hash = new URLSearchParams(window.location.hash.replace('#', ''));
      const hasCode = params.get('code') || hash.get('code');
      
      if (hasCode) {
        console.log('Authorization code detected, expecting callback processing');
        
        // Configurar uma resposta de fallback se o processamento do Keycloak falhar
        setTimeout(() => {
          if (!keycloak.authenticated) {
            console.log('Keycloak authentication timed out, trying manual redirect');
            if (window.location.pathname !== '/dashboard') {
              window.location.replace('/dashboard');
            }
          }
        }, 5000);
      }
      
      const authenticated = await keycloak.init(initOptions);
      this.initialized = true;

      console.log('Keycloak initialized. Authenticated:', authenticated);
      console.log('Token:', keycloak.token ? 'Present' : 'Missing');
      console.log('Token Parsed:', keycloak.tokenParsed);

      // Salvar token se autenticado
      if (authenticated && keycloak.token) {
        localStorage.setItem('keycloak-token', keycloak.token);
      }

      // Configurar eventos
      keycloak.onTokenExpired = () => {
        console.log('Token expired, refreshing...');
        this.refreshToken();
      };

      keycloak.onAuthSuccess = () => {
        console.log('Authentication successful');
        if (keycloak.token) {
          localStorage.setItem('keycloak-token', keycloak.token);
        }
        this.notifyLoginCallbacks();
        
        // Redirecionar para dashboard se estiver na página de login
        if (window.location.pathname === '/login' || window.location.pathname === '/') {
          console.log('Auth success while on login page, redirecting to dashboard');
          window.location.replace('/dashboard');
        }
      };

      keycloak.onAuthLogout = () => {
        console.log('User logged out');
        localStorage.removeItem('keycloak-token');
        sessionStorage.removeItem('keycloak-authenticated');
        this.notifyLogoutCallbacks();
      };

      keycloak.onAuthError = (error) => {
        console.error('Authentication error:', error);
        localStorage.removeItem('keycloak-token');
        sessionStorage.removeItem('keycloak-authenticated');
      };

      keycloak.onAuthRefreshSuccess = () => {
        console.log('Token refresh successful');
        if (keycloak.token) {
          localStorage.setItem('keycloak-token', keycloak.token);
        }
      };

      keycloak.onAuthRefreshError = () => {
        console.error('Token refresh failed');
        localStorage.removeItem('keycloak-token');
        sessionStorage.removeItem('keycloak-authenticated');
        this.logout();
      };

      // Atualizar sessionStorage para refletir estado atual
      if (authenticated) {
        sessionStorage.setItem('keycloak-authenticated', 'true');
      } else {
        sessionStorage.removeItem('keycloak-authenticated');
      }

      return authenticated;
    } catch (error) {
      console.error('Failed to initialize Keycloak:', error);
      this.initialized = true; // Marcar como inicializado mesmo com erro para evitar loops
      localStorage.removeItem('keycloak-token');
      sessionStorage.removeItem('keycloak-authenticated');
      return false;
    }
  }

  // Login do usuário
  async login(): Promise<void> {
    if (!this.initialized) {
      await this.init();
    }
    console.log('Attempting to login...');
    
    // Salvar a URL de origem para redirecionamento
    sessionStorage.setItem('keycloak-login-initiated', 'true');
    sessionStorage.setItem('keycloak-login-time', new Date().toISOString());
    
    // Usar login com parâmetros específicos
    return keycloak.login({
      redirectUri: `${window.location.origin}/dashboard`,
      prompt: 'login'
    });
  }

  // Registro do usuário (redireciona para página de registro do Keycloak)
  async register(): Promise<void> {
    if (!this.initialized) {
      await this.init();
    }
    console.log('Attempting to register...');
    
    // Salvar a URL de origem para redirecionamento
    sessionStorage.setItem('keycloak-register-initiated', 'true');
    sessionStorage.setItem('keycloak-register-time', new Date().toISOString());
    
    // Redirecionar para página de registro do Keycloak
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
    
    // Limpar armazenamento local
    localStorage.removeItem('keycloak-token');
    sessionStorage.removeItem('keycloak-authenticated');
    sessionStorage.removeItem('keycloak-login-initiated');
    
    // Adicionar URL de redirecionamento para logout
    return keycloak.logout({
      redirectUri: `${window.location.origin}/login`
    });
  }

  // Verificar se está autenticado
  isAuthenticated(): boolean {
    const authenticated = keycloak.authenticated || false;
    
    console.log('Checking authentication status:', authenticated);
    console.log('Current token:', keycloak.token ? 'Present' : 'Missing');
    
    // Verificar token salvo se não estiver autenticado na sessão atual
    if (!authenticated) {
      const savedToken = localStorage.getItem('keycloak-token');
      if (savedToken && !sessionStorage.getItem('keycloak-token-checked')) {
        console.log('Found saved token but not authenticated, trying to refresh token');
        sessionStorage.setItem('keycloak-token-checked', 'true');
        this.refreshToken().then(success => {
          if (success) {
            console.log('Token refresh successful from saved token');
            // Forçar redirecionamento se estiver na página de login
            if (window.location.pathname === '/login') {
              window.location.replace('/dashboard');
            }
          } else {
            console.log('Token refresh failed, removing saved token');
            localStorage.removeItem('keycloak-token');
          }
        });
      }
    }
    
    // Armazenar estado de autenticação para verificações entre páginas
    if (authenticated) {
      console.log('User is authenticated, storing in session');
      sessionStorage.setItem('keycloak-authenticated', 'true');
      
      // Se estivermos na página de login e autenticados, redirecionar
      if (window.location.pathname === '/login' || window.location.pathname === '/') {
        console.log('Authenticated but on login page, redirecting to dashboard');
        window.location.replace('/dashboard');
      }
    } else {
      console.log('User is not authenticated');
      sessionStorage.removeItem('keycloak-authenticated');
    }
    
    return authenticated;
  }

  // Obter dados do usuário
  getUser(): KeycloakUser | null {
    if (!this.isAuthenticated() || !keycloak.tokenParsed) {
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
        if (keycloak.token) {
          localStorage.setItem('keycloak-token', keycloak.token);
        }
      }
      return keycloak.authenticated || false;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      localStorage.removeItem('keycloak-token');
      sessionStorage.removeItem('keycloak-authenticated');
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
    // Se já estiver logado, disparar callback imediatamente
    if (this.isAuthenticated()) {
      callback(this.getUser());
    }
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
