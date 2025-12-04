/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

import { api } from '@/config/axios.config';
import routes from '@/config/routes';
import { LoginRequest, LoginResponse, Admin } from '@/types/auth.types';
import { cookies, COOKIE_KEYS } from '@/lib/cookies';

export const authService = {
  /**
   * Login user
   */
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>(routes.auth.login, credentials);
    
    // Store only access token and user data in cookies
    if (response.data.data) {
      const { accessToken } = response.data.data.tokens;
      const { admin } = response.data.data;
      
      // Store access token (7 days expiry)
      cookies.set(COOKIE_KEYS.ACCESS_TOKEN, accessToken, 7);
      // Store user data
      cookies.set(COOKIE_KEYS.ADMIN_DATA, JSON.stringify(admin), 7);
    }
    
    return response.data;
  },

  /**
   * Logout user
   */
  logout: async (): Promise<void> => {
    try {
      await api.post(routes.auth.logout);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear cookies regardless of API response
      cookies.remove(COOKIE_KEYS.ACCESS_TOKEN);
      cookies.remove(COOKIE_KEYS.ADMIN_DATA);
    }
  },

  /**
   * Get current user from API
   */
  getCurrentUser: async (): Promise<Admin | null> => {
    try {
      const response = await api.get(routes.auth.me);
      return response.data.data;
    } catch (error) {
      return null;
    }
  },

  /**
   * Get stored user from cookies
   */
  getStoredUser: (): Admin | null => {
    const adminData = cookies.get(COOKIE_KEYS.ADMIN_DATA);
    if (!adminData) return null;
    
    try {
      return JSON.parse(adminData);
    } catch {
      return null;
    }
  },

  /**
   * Get access token from cookies
   */
  getAccessToken: (): string | null => {
    return cookies.get(COOKIE_KEYS.ACCESS_TOKEN);
  },


  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    return !!authService.getAccessToken();
  },
};

