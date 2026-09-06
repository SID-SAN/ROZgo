/**
 * ROZGO Universal API Client
 * Clean HTTP client supporting authentication tokens and easy backend integration.
 */

const DEFAULT_API_URL = 'https://rozgo-backend.onrender.com/api/v1';

const getNormalizedBaseUrl = (): string => {
  let envUrl = (import.meta.env.VITE_API_BASE_URL || DEFAULT_API_URL).trim();
  // Strip trailing slashes
  envUrl = envUrl.replace(/\/+$/, '');
  // If user provided http(s)://domain without /api/v1, append it
  if (envUrl.startsWith('http') && !envUrl.endsWith('/api/v1')) {
    envUrl = `${envUrl}/api/v1`;
  }
  return envUrl;
};

const BASE_URL = getNormalizedBaseUrl();

export class ApiError extends Error {
  statusCode: number;
  data?: any;

  constructor(message: string, statusCode: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.data = data;
  }
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('rozgo_auth_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('rozgo_auth_token', token);
    } else {
      localStorage.removeItem('rozgo_auth_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, config);

      if (!response.ok) {
        let errorMessage = '';
        let errorData: any = null;
        try {
          errorData = await response.json();
          if (errorData?.detail) {
            errorMessage = typeof errorData.detail === 'string' ? errorData.detail : JSON.stringify(errorData.detail);
          } else if (errorData?.message) {
            errorMessage = errorData.message;
          }
        } catch {
          // Response was not JSON (e.g. 404 or 502 HTML error)
        }

        if (!errorMessage) {
          if (response.status === 401) {
            errorMessage = 'Invalid mobile number or password.';
          } else if (response.status === 404) {
            errorMessage = `API endpoint not found (404) at ${BASE_URL}. If you are on Render, please check your service status.`;
          } else if (response.status === 502 || response.status === 503) {
            errorMessage = 'Backend is waking up on Render. Please wait 30 seconds and try again.';
          } else if (response.status >= 500) {
            errorMessage = `Backend server error (${response.status}). Please try again shortly.`;
          } else {
            errorMessage = `Request failed with status ${response.status}. Please try again.`;
          }
        }

        if (response.status === 401) {
          this.setToken(null);
        }

        throw new ApiError(errorMessage, response.status, errorData);
      }

      return (await response.json()) as T;
    } catch (err: any) {
      if (err instanceof ApiError) {
        throw err;
      }
      // Network or offline error
      throw new ApiError(
        'Unable to connect to server. Please check your connection or continue in offline demo mode.',
        0,
        err
      );
    }
  }

  get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();

