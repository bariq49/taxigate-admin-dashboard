/**
 * Authentication React Query Hooks
 * Custom hooks for authentication using React Query
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { LoginRequest, Admin } from '@/types/auth.types';
import toast from 'react-hot-toast';

// Query Keys
export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
  session: () => [...authKeys.all, 'session'] as const,
};

/**
 * Hook to get current user
 */
export const useCurrentUser = () => {
  return useQuery({
    queryKey: authKeys.user(),
    queryFn: authService.getCurrentUser,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
    enabled: authService.isAuthenticated(),
  });
};

/**
 * Hook for login mutation
 */
export const useLogin = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      try {
        return await authService.login(credentials);
      } catch (error: any) {
        // Re-throw the error to be caught by onError
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(authKeys.user(), data.data.admin);
      
      toast.success(data.message || 'Login successful!');
      setTimeout(() => {
        router.push('/dashboard');
      }, 100);
    },
    onError: (error: any) => {
      // Error will be handled by the component, but we still show toast
      const errorMessage = 
        error?.response?.data?.message || 
        error?.message || 
        'Invalid credentials. Please try again.';
      
      toast.error(errorMessage);
      
      console.error('Login error:', error);
    },
    retry: false,
  });
};

/**
 * Hook for logout mutation
 */
export const useLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      // Clear all queries
      queryClient.clear();
      
      toast.success('Logged out successfully');
      
      // Redirect to login
      router.push('/auth/login');
    },
    onError: (error: any) => {
      const errorMessage = 
        error.response?.data?.message || 
        'Logout failed. Please try again.';
      
      toast.error(errorMessage);
    },
  });
};

/**
 * Hook to check authentication status
 */
export const useAuth = () => {
  const { data: user, isLoading, isError } = useCurrentUser();
  const storedUser = authService.getStoredUser();

  return {
    user: user || storedUser,
    isAuthenticated: authService.isAuthenticated(),
    isLoading,
    isError,
  };
};

/**
 * Hook to get access token
 */
export const useAccessToken = () => {
  return authService.getAccessToken();
};

