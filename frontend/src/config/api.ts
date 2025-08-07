// API Configuration
export const CONVERSION_API_BASE_URL = (import.meta as any).env?.VITE_MARKDOWN_API_URL || 'https://conv-flow-mardown-gbekgqefeqe5bud4.eastus-01.azurewebsites.net';

// Local Backend API for authentication (connects to Neon PostgreSQL)
export const LOCAL_BACKEND_URL = 'http://localhost:8000';

// Stack Auth Configuration for authentication
export const STACK_PROJECT_ID = (import.meta as any).env?.VITE_STACK_PROJECT_ID || '850610a8-d033-4fc9-a3e5-f2511f7ee7bb';
export const STACK_PUBLISHABLE_KEY = (import.meta as any).env?.VITE_STACK_PUBLISHABLE_CLIENT_KEY || 'pk_8536052_2O03IH25LUZXV50QPLZ6JWS19HPV75A6';

// Stack Auth Base URL - Voltando a incluir o project ID
export const AUTH_BASE_URL = `https://api.stack-auth.com/api/v1/projects/${STACK_PROJECT_ID}`;

// API Endpoints
export const API_ENDPOINTS = {
  // Core conversion endpoints (use conversion API)
  HEALTH: '/health',
  AI_STATUS: '/ai-status',
  CONVERT_FILE: '/convert-file/',
  CONVERT_MULTIPLE: '/convert-to-markdown/',
  SUPPORTED_FORMATS: '/supported-formats/',
  
  // Authentication endpoints (use Stack Auth)
  AUTH_LOGIN: '/auth/login', // Tentando /auth/login (mais comum)
  AUTH_REGISTER: '/auth/signup', // Tentando signup ao invés de users
  AUTH_REFRESH: '/auth/refresh',
  AUTH_LOGOUT: '/auth/signout',
  AUTH_PROFILE: '/auth/me',
  
  // User management endpoints (use Stack Auth)
  USER_PROFILE: '/users/me',
  USER_USAGE: '/users/me/usage',
  USER_HISTORY: '/users/me/history',
  USER_SETTINGS: '/users/me/settings',
} as const;

// Build full URL for an endpoint
export const buildApiUrl = (endpoint: string): string => {
  // Authentication endpoints use Neon Auth (Stack Auth)
  if (endpoint.startsWith('/auth/') || endpoint.startsWith('/users')) {
    return `${AUTH_BASE_URL}${endpoint}`;
  }
  // Conversion endpoints use Azure API (ONLY for file conversion)
  return `${CONVERSION_API_BASE_URL}${endpoint}`;
};

// Common headers for API requests
export const getApiHeaders = (includeAuth: boolean = false, endpoint?: string): HeadersInit => {
  const headers: HeadersInit = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };
  
  // For Stack Auth endpoints, use Stack Auth headers
  if (endpoint && (endpoint.startsWith('/auth/') || endpoint.startsWith('/users'))) {
    headers['x-stack-publishable-client-key'] = STACK_PUBLISHABLE_KEY;
    headers['x-stack-project-id'] = STACK_PROJECT_ID;
    headers['x-stack-access-type'] = 'client'; // Header obrigatório para Stack Auth
    
    if (includeAuth) {
      const token = localStorage.getItem('convflow_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
  } else {
    // For conversion endpoints, use regular authorization
    if (includeAuth) {
      const token = localStorage.getItem('convflow_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }
  }
  
  return headers;
};

// Types for API responses
export interface ApiResponse<T = unknown> {
  success?: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface ConversionResponse {
  filename: string;
  file_type: string;
  markdown: string;
  success: boolean;
  cloudflare_ai_used: boolean;
  error?: string;
}

export interface MultipleConversionResponse {
  results: ConversionResponse[];
  total_files: number;
  successful_conversions: number;
  failed_conversions: number;
}

export interface HealthResponse {
  status: string;
  service: string;
}

export interface AIStatusResponse {
  cloudflare_ai_enabled: boolean;
  account_id_configured: boolean;
  api_token_configured: boolean;
  supported_features: {
    image_analysis: boolean;
    audio_transcription: boolean;
  };
}

export interface SupportedFormatsResponse {
  [key: string]: string;
}

// Authentication types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

// Stack Auth specific response interface
export interface StackAuthResponse {
  id?: string;
  email?: string;
  display_name?: string;
  access_token?: string;
  refresh_token?: string;
  token_type?: string;
  expires_in?: number;
  user?: User;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  plan: 'basic' | 'premium' | 'unlimited';
  subscriptionStatus: 'trial' | 'active' | 'expired' | 'cancelled';
  trialEndDate?: string;
  monthlyUsage: number;
  monthlyLimit: number;
  createdAt: string;
  updatedAt: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ProfileUpdateRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
}
