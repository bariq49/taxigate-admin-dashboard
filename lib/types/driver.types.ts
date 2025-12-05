/**
 * Driver Types
 * TypeScript types and interfaces for drivers
 */

import { ApiResponse } from "./auth.types";

/**
 * Driver data structure
 */
export interface Driver {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone: string;
  profilePicture?: string;
  isVerified: boolean;
  status: "Pending" | "Approved" | "Rejected" | "Suspended";
  paidStatus: "Paid" | "Unpaid";
  isOnline: boolean;
  walletBalance: number;
  vehicleCount: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Pagination data structure
 */
export interface PaginationData {
  total: number;
  page: number;
  pages: number;
  limit: number;
}

/**
 * Drivers API response data structure
 */
export interface DriversResponseData {
  drivers: Driver[];
  pagination: PaginationData;
}

/**
 * Drivers API response
 */
export type DriversResponse = ApiResponse<DriversResponseData>;

/**
 * Approve/Reject driver request
 */
export interface ApproveDriverRequest {
  driverId: string;
  status: "Approved" | "Rejected";
}

/**
 * Approve/Reject driver response
 */
export type ApproveDriverResponse = ApiResponse<Driver>;


