"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authService } from "@/services/auth.service";
import { Admin } from "@/types/auth.types";

interface AuthContextType {
  admin: Admin | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAdmin: (admin: Admin | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext must be used within AuthProvider");
  }
  return context;
};

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Initialize auth state from cookies
    const storedAdmin = authService.getStoredUser();
    const isAuthenticated = authService.isAuthenticated();

    if (isAuthenticated && storedAdmin) {
      setAdmin(storedAdmin);
    }

    setIsLoading(false);

    // Protect routes - redirect to login if not authenticated
    const isAuthPage = pathname?.startsWith("/auth");
    const isErrorPage = pathname?.startsWith("/error-page");
    const isUtilityPage = pathname?.startsWith("/utility");

    if (!isAuthenticated && !isAuthPage && !isErrorPage && !isUtilityPage) {
      router.push("/auth/login");
    } else if (isAuthenticated && isAuthPage) {
      // If authenticated and on auth page, redirect to dashboard
      router.push("/dashboard");
    }
  }, [pathname, router]);

  const value = {
    admin,
    isAuthenticated: !!admin && authService.isAuthenticated(),
    isLoading,
    setAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
