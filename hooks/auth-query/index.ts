import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { loginAdmin, getCurrentUser, logoutAdmin } from "@/lib/api/auth";
import { LoginFormData } from "@/lib/validations/auth.schema";
import { setAccessToken, removeAccessToken, getAccessToken } from "@/lib/utils/cookies";
import type { LoginResponse, AdminData } from "@/lib/types/auth.types";

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginFormData) => loginAdmin(credentials),
    onSuccess: (response: LoginResponse) => {
      const { data } = response;
      
      if (!data?.tokens?.accessToken) {
        throw new Error("Login failed: No access token received from server");
      }
      setAccessToken(data.tokens.accessToken);
      if (data.admin) {
        queryClient.setQueryData(["auth", "user"], data.admin);
      }

      // Get redirect URL from query params or default to dashboard
      let redirectTo = "/dashboard";
      if (typeof window !== "undefined") {
        const urlParams = new URLSearchParams(window.location.search);
        const redirect = urlParams.get("redirect");
        if (redirect) {
          redirectTo = redirect;
        }
      }
      setTimeout(() => {
        window.location.href = redirectTo;
      }, 500);
    },
  });
};

/**
 * Get current user query hook
 */
export const useGetCurrentUser = () => {
  const hasToken = !!getAccessToken();

  return useQuery({
    queryKey: ["auth", "user"],
    queryFn: getCurrentUser,
    enabled: hasToken,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Logout mutation hook
 */
export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutAdmin,
    onSuccess: () => {
      removeAccessToken();
      queryClient.clear();
      
      if (typeof window !== "undefined") {
        window.location.href = "/auth/login";
      }
    },
    onError: () => {
      // Even if logout fails on server, clear local auth
      removeAccessToken();
      queryClient.clear();
      
      if (typeof window !== "undefined") {
        window.location.href = "/auth/login";
      }
    },
  });
};

