/**
 * Authentication API Functions
 */

import { api } from "@/config/axios.config";
import { LoginFormData } from "@/lib/validations/auth.schema";
import type {
  ApiResponse,
  AdminData,
  LoginResponse,
  LogoutResponse,
} from "@/lib/types/auth.types";
import API_ROUTES from "@/config/routes";

// Re-export types for convenience
export type {
  ApiResponse,
  AdminData,
  LoginResponse,
  LogoutResponse,
};

/**
 * Admin login API
 */
export const loginAdmin = async (credentials: LoginFormData): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>(API_ROUTES.AUTH_LOGIN, credentials);
  return response.data;
};

/**
 * Get current user profile
 */
export const getCurrentUser = async (): Promise<AdminData> => {
  const response = await api.get<ApiResponse<AdminData>>(API_ROUTES.AUTH_ME);
  return response.data.data;
};

/**
 * Logout API
 */
export const logoutAdmin = async (): Promise<LogoutResponse> => {
  const response = await api.post<LogoutResponse>(API_ROUTES.AUTH_LOGOUT);
  return response.data;
};

