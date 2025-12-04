/**
 * Authentication Types and Interfaces
 */

export interface Admin {
  id: string;
  name: string;
  email: string;
  role: string;
  tokenVersion: number;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  status: string;
  message: string;
  data: {
    admin: Admin;
    tokens: Tokens;
  };
}

export interface AuthState {
  admin: Admin | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface ApiResponse<T = any> {
  status: string;
  message: string;
  data?: T;
  error?: string;
}

