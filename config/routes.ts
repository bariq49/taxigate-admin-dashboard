const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://taxigate-driver-panel.vercel.app';

export const API_ROUTES = {
    AUTH_LOGIN: `${API_BASE_URL}/auth/login`,
    AUTH_LOGOUT: `${API_BASE_URL}/auth/logout`,
    AUTH_ME: `${API_BASE_URL}/auth/me`,
    DRIVERS_ALL: `${API_BASE_URL}/api/drivers/all`,
    DRIVERS_APPROVE: `${API_BASE_URL}/api/drivers/approve`,
    DRIVERS_DETAILS: (driverId: string) => `${API_BASE_URL}/api/drivers/${driverId}`,
    VEHICLES_ALL: `${API_BASE_URL}/api/vehicle/admin/all`,
    VEHICLE_DETAILS: (vehicleId: string) => `${API_BASE_URL}/api/vehicle/admin/${vehicleId}`,
    VEHICLE_APPROVE: (vehicleId: string) => `${API_BASE_URL}/api/vehicle/admin/${vehicleId}/approve`,
    VEHICLE_REJECT: (vehicleId: string) => `${API_BASE_URL}/api/vehicle/admin/${vehicleId}/reject`,
    BOOKINGS_ALL: `${API_BASE_URL}/api/bookings/admin/all`,
    BOOKINGS_LIVE: `${API_BASE_URL}/api/bookings/live`,
    BOOKINGS_PENDING_LONG_DISTANCE: `${API_BASE_URL}/api/bookings/admin/pending-long-distance`,
    BOOKINGS_ABOVE_150: `${API_BASE_URL}/api/bookings/admin/above-150`,
    BOOKINGS_BELOW_150: `${API_BASE_URL}/api/bookings/admin/below-150`,
    BOOKINGS_ADMIN_ASSIGNED: `${API_BASE_URL}/api/bookings/admin/assigned`,
    BOOKINGS_EXPIRED: `${API_BASE_URL}/api/bookings/admin/expired`,
    BOOKINGS_COMPLETED: `${API_BASE_URL}/api/bookings/admin/completed`,
    BOOKING_ASSIGN_DRIVER: (bookingId: string) => `${API_BASE_URL}/api/bookings/${bookingId}/assign-driver`,
    BOOKING_UNASSIGN_DRIVER: (bookingId: string) => `${API_BASE_URL}/api/bookings/${bookingId}/unassign-driver`,
} as const;

export default API_ROUTES;

