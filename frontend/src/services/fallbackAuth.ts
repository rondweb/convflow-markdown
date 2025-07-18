import type { User, LoginRequest, RegisterRequest, AuthResponse } from '../config/api';

/**
 * Fallback authentication service for when real backend is not available
 * This simulates the authentication flow with localStorage
 */
class FallbackAuthService {
  private tokenKey = 'convflow_token';
  private refreshTokenKey = 'convflow_refresh_token';
  private userKey = 'convflow_user';
  private usersKey = 'convflow_users';

  // Simulate API delay
  private delay(ms: number = 1000): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Generate mock tokens
  private generateTokens() {
    return {
      token: `mock_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      refreshToken: `mock_refresh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      expiresIn: 3600 // 1 hour
    };
  }

  // Get stored users (simulating database)
  private getStoredUsers(): User[] {
    const users = localStorage.getItem(this.usersKey);
    return users ? JSON.parse(users) : [];
  }

  // Store users (simulating database)
  private storeUsers(users: User[]): void {
    localStorage.setItem(this.usersKey, JSON.stringify(users));
  }

  // Create mock user
  private createMockUser(userData: RegisterRequest): User {
    return {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      plan: 'basic',
      subscriptionStatus: 'trial',
      trialEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      monthlyUsage: 0,
      monthlyLimit: 50,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  // Login user
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    await this.delay(800); // Simulate network delay

    const users = this.getStoredUsers();
    const user = users.find(u => u.email === credentials.email);

    if (!user) {
      throw new Error('User not found');
    }

    // In real implementation, we'd hash and compare passwords
    // For demo, we'll accept any password for existing users
    const tokens = this.generateTokens();
    const authResponse: AuthResponse = {
      user,
      ...tokens
    };

    // Store authentication data
    localStorage.setItem(this.tokenKey, tokens.token);
    localStorage.setItem(this.refreshTokenKey, tokens.refreshToken);
    localStorage.setItem(this.userKey, JSON.stringify(user));

    return authResponse;
  }

  // Register new user
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    await this.delay(1200); // Simulate network delay

    const users = this.getStoredUsers();
    
    // Check if user already exists
    if (users.find(u => u.email === userData.email)) {
      throw new Error('User with this email already exists');
    }

    // Create new user
    const newUser = this.createMockUser(userData);
    users.push(newUser);
    this.storeUsers(users);

    const tokens = this.generateTokens();
    const authResponse: AuthResponse = {
      user: newUser,
      ...tokens
    };

    // Store authentication data
    localStorage.setItem(this.tokenKey, tokens.token);
    localStorage.setItem(this.refreshTokenKey, tokens.refreshToken);
    localStorage.setItem(this.userKey, JSON.stringify(newUser));

    return authResponse;
  }

  // Refresh token
  async refreshToken(): Promise<AuthResponse> {
    await this.delay(500);

    const user = this.getUser();
    if (!user) {
      throw new Error('No user session found');
    }

    const tokens = this.generateTokens();
    const authResponse: AuthResponse = {
      user,
      ...tokens
    };

    // Update stored tokens
    localStorage.setItem(this.tokenKey, tokens.token);
    localStorage.setItem(this.refreshTokenKey, tokens.refreshToken);

    return authResponse;
  }

  // Logout user
  async logout(): Promise<void> {
    await this.delay(300);
    this.clearAuth();
  }

  // Get current user
  getUser(): User | null {
    const userData = localStorage.getItem(this.userKey);
    if (!userData) return null;
    
    try {
      return JSON.parse(userData);
    } catch {
      return null;
    }
  }

  // Check if authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem(this.tokenKey) && !!this.getUser();
  }

  // Clear authentication data
  clearAuth(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.userKey);
  }

  // Check and refresh token
  async checkAndRefreshToken(): Promise<boolean> {
    if (!this.isAuthenticated()) {
      return false;
    }

    try {
      // Simulate token validation
      await this.delay(200);
      
      // 10% chance of token expiry simulation
      if (Math.random() < 0.1) {
        await this.refreshToken();
      }
      
      return true;
    } catch {
      this.clearAuth();
      return false;
    }
  }
}

export const fallbackAuthService = new FallbackAuthService();
export default fallbackAuthService;
