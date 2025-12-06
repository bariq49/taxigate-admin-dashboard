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

/**
 * Driver documents structure
 */
export interface DriverDocuments {
  documentFrontImage?: string;
  documentBackImage?: string;
  driverLicenseFront?: string;
  driverLicenseBack?: string;
  driverPassFront?: string;
  driverPassBack?: string;
  kiwaPermit?: string;
  insurancePolicy?: string;
  bankpass?: string;
  kvkUittreksel?: string;
}

/**
 * Document status detail
 */
export interface DocumentStatusDetail {
  name: string;
  uploaded: boolean;
  url?: string;
}

/**
 * Documents status structure
 */
export interface DocumentsStatus {
  complete: boolean;
  details: DocumentStatusDetail[];
  uploadedCount: number;
  totalCount: number;
}

/**
 * Booking details structure
 */
export interface BookingDetails {
  from_location: string;
  to_location: string;
  price: string;
  date_time: string;
}

/**
 * Wallet transaction structure
 */
export interface WalletTransaction {
  id: string;
  bookingId: string;
  bookingDetails: BookingDetails;
  amount: number;
  type: "credit" | "debit";
  description: string;
  balanceAfter: number;
  createdAt: string;
}

/**
 * Driver stats structure
 */
export interface DriverStats {
  totalEarnings: number;
  completedRides: number;
  averageRating: number | null;
  totalRatings: number;
  currency: string;
}

/**
 * Vehicle data structure (used in driver details)
 */
export interface DriverVehicle {
  id: string;
  type: string;
  brand: string;
  model: string;
  color: string;
  plateNumber: string;
  image: string;
  status: "Pending" | "Approved" | "Rejected";
  createdAt: string;
  updatedAt: string;
}

/**
 * Detailed driver data structure (from driver details API)
 */
export interface DriverDetails extends Driver {
  currency?: string;
  documents: DriverDocuments;
  documentsStatus: DocumentsStatus;
  vehicles: DriverVehicle[];
  walletTransactions: WalletTransaction[];
  transactionCount: number;
  stats: DriverStats;
  deletedAt?: string | null;
}

/**
 * Driver details API response data structure
 */
export interface DriverDetailsResponseData {
  driver: DriverDetails;
}

/**
 * Driver details API response
 */
export type DriverDetailsResponse = ApiResponse<DriverDetailsResponseData>;


