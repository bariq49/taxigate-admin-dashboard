/**
 * Drivers API Functions
 */

import { api } from "@/config/axios.config";
import type {
  DriversResponse,
  DriversResponseData,
  ApproveDriverRequest,
  ApproveDriverResponse,
  DriverDetailsResponse,
  DriverDetailsResponseData,
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
  try {
    console.log("API Call - Get All Drivers:", {
      url: API_ROUTES.DRIVERS_ALL,
      params,
    });
    
    const response = await api.get<DriversResponse>(API_ROUTES.DRIVERS_ALL, {
      params,
    });
    
    console.log("API Response - Get All Drivers:", {
      status: response.status,
      data: response.data,
      drivers: response.data?.data?.drivers?.length || 0,
    });
    
    if (!response.data?.data) {
      console.error("Unexpected response structure:", response.data);
      throw new Error("Invalid response structure from API");
    }
    
    return response.data.data;
  } catch (error: any) {
    console.error("API Error - Get All Drivers:", {
      message: error?.message,
      response: error?.response?.data,
      status: error?.response?.status,
    });
    throw error;
  }
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

/**
 * Get driver details by ID
 */
export const getDriverDetails = async (
  driverId: string
): Promise<DriverDetailsResponseData> => {
  const response = await api.get<DriverDetailsResponse>(
    API_ROUTES.DRIVERS_DETAILS(driverId)
  );
  return response.data.data;
};


