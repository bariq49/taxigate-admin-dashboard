const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://taxigate-driver-panel.vercel.app';

export const API_ROUTES = {
    AUTH_LOGIN: `${API_BASE_URL}/auth/login`,
    AUTH_LOGOUT: `${API_BASE_URL}/auth/logout`,
    AUTH_ME: `${API_BASE_URL}/auth/me`,
    DRIVERS_ALL: `${API_BASE_URL}/api/drivers/all`,
    DRIVERS_APPROVE: `${API_BASE_URL}/api/drivers/approve`,
    DRIVERS_DETAILS: (driverId: string) => `${API_BASE_URL}/api/drivers/${driverId}`,
} as const;

export default API_ROUTES;

