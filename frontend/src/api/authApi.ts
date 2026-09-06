import { apiClient, ApiError } from './apiClient';
import { API_ENDPOINTS } from './endpoints';

export interface AuthResult {
  success: boolean;
  token?: string;
  role?: 'worker' | 'employer';
  user?: any;
  profile?: any;
  message?: string;
}

export const authApi = {
  /**
   * Connect to backend /api/v1/auth/login to validate password
   */
  async loginWithPassword(phone: string, password: string): Promise<AuthResult> {
    let cleanPhone = phone.replace(/\D/g, '').trim();
    if (cleanPhone.startsWith('91') && cleanPhone.length === 12) {
      cleanPhone = cleanPhone.slice(2);
    }

    try {
      const response = await apiClient.post<AuthResult>(API_ENDPOINTS.AUTH.LOGIN_PASSWORD, {
        phone: cleanPhone,
        password: password,
      });

      if (response.token) {
        apiClient.setToken(response.token);
      }
      return response;
    } catch (err: any) {
      if (err instanceof ApiError && err.statusCode === 401) {
        throw new Error(err.data?.detail || err.message || 'Invalid phone or password.');
      }
      console.warn('Backend login connection error:', err);
      throw new Error(err.message || 'Login failed. Please check your credentials and try again.');
    }
  },
  async register(data: { phone: string; password?: string; role: 'worker' | 'employer'; name: string; location?: string; primary_skill?: string; experience_years?: number; employer_type?: string; business_name?: string }): Promise<AuthResult> {
    let cleanPhone = data.phone.replace(/\D/g, '').trim();
    if (cleanPhone.startsWith('91') && cleanPhone.length === 12) {
      cleanPhone = cleanPhone.slice(2);
    }
    
    try {
      const response = await apiClient.post<AuthResult>('/auth/register', {
        ...data,
        phone: cleanPhone,
      });
      if (response.token) {
        apiClient.setToken(response.token);
      }
      return response;
    } catch (err: any) {
      console.warn('Backend register error:', err);
      throw new Error(err.message || 'Registration failed. Please check your details and try again.');
    }
  },
};

