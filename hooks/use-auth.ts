/**
 * useAuth Hook
 * Main hook for authentication state and actions
 */

import { useGetCurrentUser, useLogin, useLogout } from "@/hooks/auth-query";
import { LoginFormData } from "@/lib/validations/auth.schema";
import { isAuthenticated } from "@/lib/utils/cookies";

export const useAuth = () => {
  const { data: user, isLoading, isError, error } = useGetCurrentUser();
  const loginMutation = useLogin();
  const logoutMutation = useLogout();

  const login = async (credentials: LoginFormData) => {
    return loginMutation.mutateAsync(credentials);
  };

  const logout = async () => {
    return logoutMutation.mutateAsync();
  };

  return {
    user,
    isLoading,
    isError,
    error,
    isAuthenticated: isAuthenticated() && !!user,
    login,
    logout,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  };
};

