/**
 * Bookings API Functions
 */

import { api } from "@/config/axios.config";
import type {
  BookingsResponse,
  BookingsResponseData,
  AssignDriverRequest,
  AssignDriverResponse,
  UnassignDriverResponse,
} from "@/lib/types/booking.types";
import API_ROUTES from "@/config/routes";

export interface GetBookingsParams {
  page?: number;
  limit?: number;
}

/**
 * Get all bookings
 */
export const getAllBookings = async (
  params?: GetBookingsParams
): Promise<BookingsResponseData> => {
  const response = await api.get<BookingsResponse>(
    API_ROUTES.BOOKINGS_ALL,
    { params }
  );
  return response.data.data;
};

/**
 * Get live bookings (unified endpoint for admin and driver)
 * Shows all pending, non-expired bookings in real-time
 */
export const getLiveBookings = async (): Promise<BookingsResponseData> => {
  const response = await api.get<BookingsResponse>(
    API_ROUTES.BOOKINGS_LIVE
  );
  return response.data.data;
};

/**
 * Get pending long-distance bookings (price > 150, status: pending)
 */
export const getPendingLongDistanceBookings = async (
  params?: GetBookingsParams
): Promise<BookingsResponseData> => {
  const response = await api.get<BookingsResponse>(
    API_ROUTES.BOOKINGS_PENDING_LONG_DISTANCE,
    { params }
  );
  return response.data.data;
};

/**
 * Get bookings with price above 150
 */
export const getBookingsAbove150 = async (
  params?: GetBookingsParams
): Promise<BookingsResponseData> => {
  const response = await api.get<BookingsResponse>(
    API_ROUTES.BOOKINGS_ABOVE_150,
    { params }
  );
  return response.data.data;
};

/**
 * Get bookings with price 150 and below
 */
export const getBookingsBelow150 = async (
  params?: GetBookingsParams
): Promise<BookingsResponseData> => {
  const response = await api.get<BookingsResponse>(
    API_ROUTES.BOOKINGS_BELOW_150,
    { params }
  );
  return response.data.data;
};

/**
 * Get admin-assigned bookings
 */
export const getAdminAssignedBookings = async (
  params?: GetBookingsParams
): Promise<BookingsResponseData> => {
  const response = await api.get<BookingsResponse>(
    API_ROUTES.BOOKINGS_ADMIN_ASSIGNED,
    { params }
  );
  return response.data.data;
};

/**
 * Get expired bookings (bookings that expired after 5 minutes without driver acceptance)
 */
export const getExpiredBookings = async (
  params?: GetBookingsParams
): Promise<BookingsResponseData> => {
  const response = await api.get<BookingsResponse>(
    API_ROUTES.BOOKINGS_EXPIRED,
    { params }
  );
  return response.data.data;
};

/**
 * Get completed bookings with driver details (Admin only)
 */
export const getAdminCompletedBookings = async (
  params?: GetBookingsParams
): Promise<BookingsResponseData> => {
  const response = await api.get<BookingsResponse>(
    API_ROUTES.BOOKINGS_COMPLETED,
    { params }
  );
  return response.data.data;
};

/**
 * Assign driver to booking
 */
export const assignDriverToBooking = async (
  bookingId: string,
  data: AssignDriverRequest
): Promise<AssignDriverResponse> => {
  try {
    console.log("API Call - Assign Driver:", {
      url: API_ROUTES.BOOKING_ASSIGN_DRIVER(bookingId),
      bookingId,
      driverId: data.driverId,
    });
    
    const response = await api.patch<AssignDriverResponse>(
      API_ROUTES.BOOKING_ASSIGN_DRIVER(bookingId),
      data
    );
    
    console.log("API Response - Assign Driver:", response.data);
    return response.data;
  } catch (error: any) {
    console.error("API Error - Assign Driver:", {
      message: error?.message,
      response: error?.response?.data,
      status: error?.response?.status,
    });
    throw error;
  }
};

/**
 * Unassign driver from booking
 */
export const unassignDriverFromBooking = async (
  bookingId: string
): Promise<UnassignDriverResponse> => {
  const response = await api.patch<UnassignDriverResponse>(
    API_ROUTES.BOOKING_UNASSIGN_DRIVER(bookingId)
  );
  return response.data;
};

