/**
 * Cookie Utility Functions
 * Client-side cookie management for authentication tokens
 */

import Cookies from "js-cookie";

const ACCESS_TOKEN_KEY = "access_token";

/**
 * Set access token in cookies
 */
export const setAccessToken = (token: string): void => {
  Cookies.set(ACCESS_TOKEN_KEY, token, {
    expires: 7, // 7 days
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });
};

/**
 * Get access token from cookies
 */
export const getAccessToken = (): string | undefined => {
  return Cookies.get(ACCESS_TOKEN_KEY);
};

/**
 * Remove access token from cookies
 */
export const removeAccessToken = (): void => {
  Cookies.remove(ACCESS_TOKEN_KEY);
};

/**
 * Check if user is authenticated (has access token)
 */
export const isAuthenticated = (): boolean => {
  return !!getAccessToken();
};

