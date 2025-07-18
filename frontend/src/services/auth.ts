import { 
  buildApiUrl, 
  getApiHeaders, 
  API_ENDPOINTS,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  RefreshTokenRequest,
  ProfileUpdateRequest,
  PasswordChangeRequest,
  User
} from '../config/api';
import { fallbackAuthService } from './fallbackAuth';

class AuthError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

class AuthService {
  private tokenKey = 'convflow_token';
  private refreshTokenKey = 'convflow_refresh_token';
  private userKey = 'convflow_user';
  private useFallback = false;

  constructor() {
    // Check if we should use fallback (can be configured via env var)
    this.useFallback = (import.meta as any).env?.VITE_USE_FALLBACK_AUTH === 'true';
  }

  // Generic API request with error handling
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    try {
      const response = await fetch(buildApiUrl(endpoint), {
        ...options,
        headers: {
          ...getApiHeaders(true),
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
        
        throw new AuthError(response.status, errorMessage);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof AuthError) {
        throw error;
      }
      throw new AuthError(0, `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Login user
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    // Try real API first, fallback to mock if it fails
    try {
      if (this.useFallback) {
        return await fallbackAuthService.login(credentials);
      }

      const response = await this.makeRequest<AuthResponse>(API_ENDPOINTS.AUTH_LOGIN, {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      // Store tokens and user data
      this.setTokens(response.token, response.refreshToken);
      this.setUser(response.user);

      return response;
    } catch (error) {
      // If real API fails, try fallback
      if (!this.useFallback && error instanceof AuthError && (error.status === 0 || error.status >= 500)) {
        console.warn('Real API unavailable, using fallback auth');
        return await fallbackAuthService.login(credentials);
      }
      throw error;
    }
  }

  // Register new user
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    // Try real API first, fallback to mock if it fails
    try {
      if (this.useFallback) {
        return await fallbackAuthService.register(userData);
      }

      const response = await this.makeRequest<AuthResponse>(API_ENDPOINTS.AUTH_REGISTER, {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      // Store tokens and user data
      this.setTokens(response.token, response.refreshToken);
      this.setUser(response.user);

      return response;
    } catch (error) {
      // If real API fails, try fallback
      if (!this.useFallback && error instanceof AuthError && (error.status === 0 || error.status >= 500)) {
        console.warn('Real API unavailable, using fallback auth');
        return await fallbackAuthService.register(userData);
      }
      throw error;
    }
  }

  // Refresh authentication token
  async refreshToken(): Promise<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new AuthError(401, 'No refresh token available');
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
      if (this.useFallback) {
        await fallbackAuthService.logout();
        return;
      }

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
    if (this.useFallback) {
      const user = fallbackAuthService.getUser();
      if (!user) throw new AuthError(401, 'No user session found');
      return user;
    }

    return await this.makeRequest<User>(API_ENDPOINTS.AUTH_PROFILE);
  }

  // Update user profile
  async updateProfile(updates: ProfileUpdateRequest): Promise<User> {
    const response = await this.makeRequest<User>(API_ENDPOINTS.USER_PROFILE, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });

    // Update stored user data
    this.setUser(response);
    return response;
  }

  // Change password
  async changePassword(passwords: PasswordChangeRequest): Promise<void> {
    await this.makeRequest(API_ENDPOINTS.USER_SETTINGS, {
      method: 'POST',
      body: JSON.stringify(passwords),
    });
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
    if (this.useFallback) {
      return fallbackAuthService.getUser();
    }

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
    if (this.useFallback) {
      fallbackAuthService.clearAuth();
      return;
    }

    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.userKey);
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    if (this.useFallback) {
      return fallbackAuthService.isAuthenticated();
    }

    return !!this.getToken() && !!this.getUser();
  }

  // Auto-refresh token when it's about to expire
  async checkAndRefreshToken(): Promise<boolean> {
    if (this.useFallback) {
      return await fallbackAuthService.checkAndRefreshToken();
    }

    if (!this.isAuthenticated()) {
      return false;
    }

    try {
      // Try to get profile to check if token is still valid
      await this.getProfile();
      return true;
    } catch (error) {
      if (error instanceof AuthError && error.status === 401) {
        try {
          await this.refreshToken();
          return true;
        } catch (refreshError) {
          this.clearAuth();
          return false;
        }
      }
      return false;
    }
  }
}

export const authService = new AuthService();
export { AuthError };
export default authService;
