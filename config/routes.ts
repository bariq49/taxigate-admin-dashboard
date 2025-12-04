const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

export const routes = {
  // Auth Routes
  auth: {
    login: `${API_BASE_URL}/auth/login`,
    logout: `${API_BASE_URL}/auth/logout`,
    register: `${API_BASE_URL}/auth/register`,
    refreshToken: `${API_BASE_URL}/auth/refresh-token`,
    forgotPassword: `${API_BASE_URL}/auth/forgot-password`,
    resetPassword: `${API_BASE_URL}/auth/reset-password`,
    verifyEmail: `${API_BASE_URL}/auth/verify-email`,
    me: `${API_BASE_URL}/auth/me`,
  },

  // User Routes
  users: {
    list: `${API_BASE_URL}/users`,
    create: `${API_BASE_URL}/users`,
    detail: (id: string) => `${API_BASE_URL}/users/${id}`,
    update: (id: string) => `${API_BASE_URL}/users/${id}`,
    delete: (id: string) => `${API_BASE_URL}/users/${id}`,
  },

  // Dashboard Routes
  dashboard: {
    stats: `${API_BASE_URL}/dashboard/stats`,
    analytics: `${API_BASE_URL}/dashboard/analytics`,
  },

  // Add more routes as needed
} as const;

export default routes;

