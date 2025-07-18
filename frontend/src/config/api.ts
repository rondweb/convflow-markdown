// API Configuration
export const API_BASE_URL = (import.meta as any).env?.VITE_MARKDOWN_API_URL || 'https://conv-flow-mardown-gbekgqefeqe5bud4.eastus-01.azurewebsites.net';

// API Endpoints
export const API_ENDPOINTS = {
  // Core conversion endpoints
  HEALTH: '/health',
  AI_STATUS: '/ai-status',
  CONVERT_FILE: '/convert-file/',
  CONVERT_MULTIPLE: '/convert-to-markdown/',
  SUPPORTED_FORMATS: '/supported-formats/',
  
  // Authentication endpoints (future implementation)
  AUTH_LOGIN: '/auth/login',
  AUTH_REGISTER: '/auth/register',
  AUTH_REFRESH: '/auth/refresh',
  AUTH_LOGOUT: '/auth/logout',
  AUTH_PROFILE: '/auth/profile',
  
  // User management endpoints (future implementation)
  USER_PROFILE: '/user/profile',
  USER_USAGE: '/user/usage',
  USER_HISTORY: '/user/history',
  USER_SETTINGS: '/user/settings',
} as const;

// Build full URL for an endpoint
export const buildApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`;
};

// Common headers for API requests
export const getApiHeaders = (includeAuth: boolean = false): HeadersInit => {
  const headers: HeadersInit = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };
  
  if (includeAuth) {
    const token = localStorage.getItem('convflow_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
};

// Types for API responses
export interface ApiResponse<T = any> {
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
