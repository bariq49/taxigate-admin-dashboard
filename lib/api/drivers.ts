/**
 * Drivers API Functions
 */

import { api } from "@/config/axios.config";
import type {
  DriversResponse,
  DriversResponseData,
  ApproveDriverRequest,
  ApproveDriverResponse,
} from "@/lib/types/driver.types";
import API_ROUTES from "@/config/routes";

export interface GetDriversParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  paidStatus?: string;
  isVerified?: boolean;
  isOnline?: boolean;
}

/**
 * Get all drivers
 */
export const getAllDrivers = async (
  params?: GetDriversParams
): Promise<DriversResponseData> => {
  const response = await api.get<DriversResponse>(API_ROUTES.DRIVERS_ALL, {
    params,
  });
  return response.data.data;
};

/**
 * Approve or reject a driver
 */
export const approveOrRejectDriver = async (
  data: ApproveDriverRequest
): Promise<ApproveDriverResponse> => {
  const response = await api.post<ApproveDriverResponse>(
    API_ROUTES.DRIVERS_APPROVE,
    data
  );
  return response.data;
};


