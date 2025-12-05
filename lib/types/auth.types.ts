/**
 * Authentication Types
 * Centralized TypeScript types and interfaces for authentication
 */

// ----------------- API Response Types -----------------

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T> {
  status: string;
  message: string;
  data: T;
}

// ----------------- User/Admin Types -----------------

/**
 * Admin user data structure
 */
export interface AdminData {
  id: string;
  name: string;
  email: string;
  role: string;
  tokenVersion: number;
}

/**
 * User roles
 */
export type UserRole = "admin" | "user" | "moderator";

// ----------------- Authentication Token Types -----------------

/**
 * Authentication tokens structure
 */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// ----------------- Login Response Types -----------------

/**
 * Login response data structure
 */
export interface LoginResponseData {
  admin: AdminData;
  tokens: AuthTokens;
}

/**
 * Login API response
 */
export type LoginResponse = ApiResponse<LoginResponseData>;

// ----------------- Logout Response Types -----------------

/**
 * Logout API response
 */
export type LogoutResponse = ApiResponse<{}>;

// ----------------- Current User Response Types -----------------

/**
 * Current user API response
 */
export type CurrentUserResponse = ApiResponse<AdminData>;

// ----------------- Refresh Token Response Types -----------------

/**
 * Refresh token response data
 */
export interface RefreshTokenResponseData {
  tokens: AuthTokens;
}

/**
 * Refresh token API response
 */
export type RefreshTokenResponse = ApiResponse<RefreshTokenResponseData>;

// ----------------- Error Types -----------------

/**
 * API error response structure
 */
export interface ApiError {
  status: string;
  message: string;
  errors?: Record<string, string[]>;
}

// ----------------- Auth State Types -----------------

/**
 * Authentication state
 */
export interface AuthState {
  user: AdminData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

