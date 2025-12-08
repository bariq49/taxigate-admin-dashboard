/**
 * Booking Types
 * TypeScript types and interfaces for bookings
 */

import { ApiResponse } from "./auth.types";

/**
 * Coordinates structure
 */
export interface Coordinates {
  lat: number;
  lng: number;
}

/**
 * Booking data structure
 */
export interface Booking {
  id: string;
  from_location: string;
  to_location: string;
  luggage?: string;
  num_passengers?: number;
  date_time: string;
  return_date_time?: string;
  cat_title: string;
  price: string;
  user_name: string;
  email: string;
  number?: string;
  note_description?: string;
  stop_1?: string;
  stop_2?: string;
  flight_no?: string;
  distance?: string;
  commission: string;
  driverPrice: string;
  driverId?: string | null;
  driver?: {
    id: string;
    firstName?: string;
    lastName?: string;
    fullName?: string;
    email?: string;
    phone?: string;
    profilePicture?: string | null;
    isOnline?: boolean;
  } | null;
  assignmentType?: "auto" | "admin" | null;
  status: "pending" | "accepted" | "started" | "picked_up" | "dropped_off" | "completed" | "rejected" | "cancelled";
  isAccepted: boolean;
  isRejected: boolean;
  rejectionReason?: string;
  startedAt?: string;
  pickedUpAt?: string;
  droppedOffAt?: string;
  completedAt?: string;
  pickupCoordinates?: Coordinates;
  dropoffCoordinates?: Coordinates;
  isPaid: boolean;
  expiresAt?: string;
  expiredAt?: string;
  isExpired?: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Pagination data structure for bookings
 */
export interface BookingPaginationData {
  total: number;
  page: number;
  pages: number;
  limit: number;
}

/**
 * Bookings API response data structure
 */
export interface BookingsResponseData {
  bookings: Booking[];
  pagination: BookingPaginationData;
}

/**
 * Bookings API response
 */
export type BookingsResponse = ApiResponse<BookingsResponseData>;

/**
 * Booking details API response data structure
 */
export interface BookingDetailsResponseData {
  booking: Booking;
}

/**
 * Booking details API response
 */
export type BookingDetailsResponse = ApiResponse<BookingDetailsResponseData>;

/**
 * Assign driver to booking request
 */
export interface AssignDriverRequest {
  driverId: string;
}

/**
 * Assign driver response
 */
export type AssignDriverResponse = ApiResponse<{ booking: Booking }>;

/**
 * Unassign driver response
 */
export type UnassignDriverResponse = ApiResponse<{ booking: Booking }>;

