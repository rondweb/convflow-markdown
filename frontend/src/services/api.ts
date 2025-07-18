import { 
  buildApiUrl, 
  getApiHeaders, 
  API_ENDPOINTS,
  ConversionResponse,
  MultipleConversionResponse,
  HealthResponse,
  AIStatusResponse,
  SupportedFormatsResponse
} from '../config/api';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// Generic API request function
async function apiRequest<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const url = buildApiUrl(endpoint);
  const headers = {
    ...getApiHeaders(),
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new ApiError(response.status, errorText || `HTTP ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      return await response.text() as unknown as T;
    }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(0, `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// API Services
export const apiService = {
  // Health check
  async checkHealth(): Promise<HealthResponse> {
    return apiRequest<HealthResponse>(API_ENDPOINTS.HEALTH);
  },

  // AI status check
  async getAIStatus(): Promise<AIStatusResponse> {
    return apiRequest<AIStatusResponse>(API_ENDPOINTS.AI_STATUS);
  },

  // Get supported formats
  async getSupportedFormats(): Promise<SupportedFormatsResponse> {
    return apiRequest<SupportedFormatsResponse>(API_ENDPOINTS.SUPPORTED_FORMATS);
  },

  // Convert single file
  async convertFile(file: File): Promise<ConversionResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return apiRequest<ConversionResponse>(API_ENDPOINTS.CONVERT_FILE, {
      method: 'POST',
      body: formData,
    });
  },

  // Convert multiple files
  async convertMultipleFiles(files: File[]): Promise<MultipleConversionResponse> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    return apiRequest<MultipleConversionResponse>(API_ENDPOINTS.CONVERT_MULTIPLE, {
      method: 'POST',
      body: formData,
    });
  },
};

export { ApiError };
export default apiService;
