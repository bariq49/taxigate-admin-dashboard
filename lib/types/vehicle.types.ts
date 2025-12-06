/**
 * Vehicle Types
 * TypeScript types and interfaces for vehicles
 */

import { ApiResponse } from "./auth.types";

/**
 * Driver info in vehicle response
 */
export interface VehicleDriver {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone: string;
}

/**
 * Vehicle data structure
 */
export interface Vehicle {
  id: string;
  driver: VehicleDriver;
  type: string;
  brand: string;
  model: string;
  color: string;
  plateNumber: string;
  image?: string;
  status: "Pending" | "Approved" | "Rejected";
  createdAt: string;
}

/**
 * Pagination data structure for vehicles
 */
export interface VehiclePaginationData {
  currentPage: number;
  totalPages: number;
  totalVehicles: number;
  limit: number;
}

/**
 * Vehicles API response data structure
 */
export interface VehiclesResponseData {
  vehicles: Vehicle[];
  pagination: VehiclePaginationData;
}

/**
 * Vehicles API response
 */
export type VehiclesResponse = ApiResponse<VehiclesResponseData>;

/**
 * Vehicle details API response data structure
 */
export interface VehicleDetailsResponseData {
  vehicle: Vehicle;
}

/**
 * Vehicle details API response
 */
export type VehicleDetailsResponse = ApiResponse<VehicleDetailsResponseData>;

/**
 * Approve vehicle response
 */
export type ApproveVehicleResponse = ApiResponse<{ vehicle: Vehicle }>;

/**
 * Reject vehicle request
 */
export interface RejectVehicleRequest {
  reason?: string;
}

/**
 * Reject vehicle response
 */
export type RejectVehicleResponse = ApiResponse<{ vehicle: Vehicle }>;

