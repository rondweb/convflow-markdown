// API Configuration
export const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';

// Keycloak Auth Configuration
export const KEYCLOAK_BASE_URL = (import.meta as any).env?.VITE_KEYCLOAK_URL_BASE || 'https://keycloak-leaftix-g4gufcg6acgnbbar.eastus2-01.azurewebsites.net';
export const KEYCLOAK_REALM = (import.meta as any).env?.VITE_KEYCLOAK_REALM || 'convflow';
export const KEYCLOAK_CLIENT_ID = (import.meta as any).env?.VITE_KEYCLOAK_CLIENT_ID || 'cvclient';

// Import keycloakService for authentication
import { keycloakService } from '../services/keycloakService';

// API Endpoints
export const API_ENDPOINTS = {
  // Core conversion endpoints
  HEALTH: '/health',
  AI_STATUS: '/ai-status',
  CONVERT_FILE: '/convert-file/',
  CONVERT_MULTIPLE: '/convert-to-markdown/',
  SUPPORTED_FORMATS: '/supported-formats/',
  
  // User management endpoints
  USER_PROFILE: '/users/me',
  USER_USAGE: '/users/me/usage',
  USER_HISTORY: '/users/me/history',
  USER_SETTINGS: '/users/me/settings',
} as const;

// Build full URL for an endpoint
export const buildApiUrl = (endpoint: string): string => {
  // All endpoints now use our centralized API with Keycloak authentication
  return `${API_BASE_URL}${endpoint}`;
};

// Common headers for API requests
export const getApiHeaders = (includeAuth: boolean = false): HeadersInit => {
  const headers: HeadersInit = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };
  
  // Add authorization token from Keycloak if needed
  if (includeAuth) {
    // Use Keycloak token directly from the imported service
    const token = keycloakService.getToken();
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
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

// User information interface (aligned with Keycloak)
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

export interface ProfileUpdateRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
}
