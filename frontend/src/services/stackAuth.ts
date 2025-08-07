import { 
  buildApiUrl, 
  getApiHeaders, 
  API_ENDPOINTS,
  STACK_PUBLISHABLE_KEY,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  StackAuthResponse,
  User
} from '../config/api';

export class StackAuthError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'StackAuthError';
  }
}

class StackAuthService {
  private tokenKey = 'convflow_token';
  private refreshTokenKey = 'convflow_refresh_token';
  private userKey = 'convflow_user';

  // Generic API request for Stack Auth
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      const response = await fetch(buildApiUrl(endpoint), {
        ...options,
        headers: {
          ...getApiHeaders(true, endpoint),
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `HTTP ${response.status}`;
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        
        throw new StackAuthError(response.status, errorMessage);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof StackAuthError) {
        throw error;
      }
      throw new StackAuthError(0, `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Login user with Stack Auth - versão simplificada e sistemática
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    // Baseado nos erros, vamos tentar endpoints e métodos sistemáticamente
    const attempts = [
      // Tentativas com POST (padrão para login)
      { endpoint: '/auth/sign-in', method: 'POST' },
      { endpoint: '/auth/signin', method: 'POST' },
      { endpoint: '/auth/login', method: 'POST' },
      { endpoint: '/session/sign-in', method: 'POST' },
      { endpoint: '/users/sign-in', method: 'POST' },
      
      // Se 405, talvez seja GET com query params?
      { endpoint: '/auth/sign-in', method: 'GET' },
      { endpoint: '/auth/signin', method: 'GET' },
    ];

    for (const { endpoint, method } of attempts) {
      try {
        console.log(`🧪 Tentando: ${method} ${endpoint}`);
        
        const requestOptions: RequestInit = { method };
        
        if (method === 'POST') {
          requestOptions.body = JSON.stringify({
            email: credentials.email,
            password: credentials.password,
          });
        } else if (method === 'GET') {
          // Para GET, adicionar como query parameters
          const params = new URLSearchParams({
            email: credentials.email,
            password: credentials.password,
          });
          const endpointWithParams = `${endpoint}?${params.toString()}`;
          
          const response = await this.makeRequest<StackAuthResponse>(endpointWithParams, requestOptions);
          return this.processAuthResponse(response, credentials.email);
        }

        const response = await this.makeRequest<StackAuthResponse>(endpoint, requestOptions);
        console.log(`✅ Sucesso com: ${method} ${endpoint}`);
        return this.processAuthResponse(response, credentials.email);

      } catch (error) {
        if (error instanceof StackAuthError) {
          console.log(`❌ ${endpoint} (${method}): ${error.status} - ${error.message}`);
          
          // 404 = endpoint não existe, continuar tentando
          // 405 = método não permitido, continuar tentando
          // 401/400 = endpoint correto mas credenciais ruins, parar e reportar
          if (error.status === 401 || error.status === 400) {
            throw error; // Estas são respostas válidas para credenciais incorretas
          }
          
          continue; // Continuar tentando outros endpoints/métodos
        }
        throw error;
      }
    }

    throw new StackAuthError(404, 'Nenhum endpoint/método de login válido encontrado');
  }

  // Helper para processar resposta de autenticação
  private processAuthResponse(response: StackAuthResponse, email: string): AuthResponse {
    // Store tokens and user data
    if (response.access_token) {
      this.setTokens(response.access_token, response.refresh_token || '');
    }
    if (response.user) {
      this.setUser(response.user);
    }

    return {
      token: response.access_token || '',
      refreshToken: response.refresh_token || '',
      expiresIn: response.expires_in || 3600,
      user: response.user || {
        id: response.id || '',
        email: email,
        firstName: '',
        lastName: '',
        plan: 'basic' as const,
        subscriptionStatus: 'trial' as const,
        monthlyUsage: 0,
        monthlyLimit: 10,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    };
  }

  // Register user with Stack Auth - versão sistemática
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const attempts = [
      // Diferentes endpoints e formatos de dados
      { 
        endpoint: '/auth/sign-up', 
        data: {
          email: userData.email,
          password: userData.password,
          display_name: `${userData.firstName} ${userData.lastName}`
        }
      },
      { 
        endpoint: '/auth/signup', 
        data: {
          email: userData.email,
          password: userData.password,
          display_name: `${userData.firstName} ${userData.lastName}`
        }
      },
      { 
        endpoint: '/users', 
        data: {
          email: userData.email,
          password: userData.password,
          display_name: `${userData.firstName} ${userData.lastName}`
        }
      },
      { 
        endpoint: '/auth/register', 
        data: {
          email: userData.email,
          password: userData.password,
          display_name: `${userData.firstName} ${userData.lastName}`
        }
      },
      // Tentativas com campos diferentes
      { 
        endpoint: '/auth/signup', 
        data: {
          email: userData.email,
          password: userData.password,
          firstName: userData.firstName,
          lastName: userData.lastName
        }
      },
      { 
        endpoint: '/users', 
        data: {
          email: userData.email,
          password: userData.password,
          firstName: userData.firstName,
          lastName: userData.lastName
        }
      }
    ];

    for (const { endpoint, data } of attempts) {
      try {
        console.log(`🧪 Tentando registro: POST ${endpoint}`, data);
        
        const response = await this.makeRequest<StackAuthResponse>(endpoint, {
          method: 'POST',
          body: JSON.stringify(data),
        });

        console.log(`✅ Registro bem-sucedido: ${endpoint}`);
        return this.processAuthResponse(response, userData.email);

      } catch (error) {
        if (error instanceof StackAuthError) {
          console.log(`❌ ${endpoint}: ${error.status} - ${error.message}`);
          
          // 400/422 podem indicar problemas nos dados, mas endpoint correto
          if (error.status === 400 || error.status === 422) {
            console.log(`⚠️ Endpoint ${endpoint} existe mas dados podem estar incorretos`);
            // Continuar tentando outros formatos
          }
          
          // 409 = usuário já existe (endpoint correto!)
          if (error.status === 409) {
            throw new StackAuthError(409, 'Usuário já existe. Tente fazer login.');
          }
          
          continue;
        }
        throw error;
      }
    }

    throw new StackAuthError(404, 'Nenhum endpoint de registro válido encontrado');
  }

  // Refresh access token
  async refreshToken(): Promise<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new StackAuthError(401, 'No refresh token available');
    }

    const response = await this.makeRequest<AuthResponse>(API_ENDPOINTS.AUTH_REFRESH, {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });

    // Update stored tokens and user data
    this.setTokens(response.token, response.refreshToken);
    this.setUser(response.user);

    return response;
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      await this.makeRequest(API_ENDPOINTS.AUTH_LOGOUT, {
        method: 'POST',
      });
    } catch (error) {
      // Continue with logout even if API call fails
      console.warn('Logout API call failed:', error);
    } finally {
      this.clearAuth();
    }
  }

  // Get current user profile
  async getProfile(): Promise<User> {
    return await this.makeRequest<User>(API_ENDPOINTS.AUTH_PROFILE);
  }

  // Token management
  private setTokens(token: string, refreshToken: string): void {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.refreshTokenKey, refreshToken);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  // User data management
  private setUser(user: User): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  getUser(): User | null {
    const userData = localStorage.getItem(this.userKey);
    if (!userData) return null;
    
    try {
      const user = JSON.parse(userData);
      // Convert date strings back to Date objects if needed
      if (user.trialEndDate && typeof user.trialEndDate === 'string') {
        user.trialEndDate = new Date(user.trialEndDate);
      }
      return user;
    } catch {
      return null;
    }
  }

  // Clear all authentication data
  clearAuth(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.userKey);
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.getUser();
  }

  // Auto-refresh token when it's about to expire
  async checkAndRefreshToken(): Promise<boolean> {
    if (!this.isAuthenticated()) {
      return false;
    }

    try {
      // Try to get profile to check if token is still valid
      await this.getProfile();
      return true;
    } catch (error) {
      if (error instanceof StackAuthError && error.status === 401) {
        try {
          await this.refreshToken();
          return true;
        } catch {
          this.clearAuth();
          return false;
        }
      }
      return false;
    }
  }
}

export const stackAuthService = new StackAuthService();
export default stackAuthService;
