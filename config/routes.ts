const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://taxigate-driver-panel.vercel.app';

export const API_ROUTES = {
    AUTH_LOGIN: `${API_BASE_URL}/auth/login`,
    AUTH_LOGOUT: `${API_BASE_URL}/auth/logout`,
    AUTH_ME: `${API_BASE_URL}/auth/me`,
} as const;

export default API_ROUTES;

