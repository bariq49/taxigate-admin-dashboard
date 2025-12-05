import axios from "axios";
import { getAccessToken, removeAccessToken } from "@/lib/utils/cookies";

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://taxigate-driver-panel.vercel.app";

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // If error is 401 (Unauthorized), clear auth data and redirect to login
    if (error.response?.status === 401) {
      removeAccessToken();
      
      if (typeof window !== "undefined") {
        window.location.href = "/auth/login";
      }
    }

    return Promise.reject(error);
  }
);
