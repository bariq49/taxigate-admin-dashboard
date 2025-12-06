/**
 * Vehicles API Functions
 */

import { api } from "@/config/axios.config";
import type {
  VehiclesResponse,
  VehiclesResponseData,
  VehicleDetailsResponse,
  VehicleDetailsResponseData,
  ApproveVehicleResponse,
  RejectVehicleRequest,
  RejectVehicleResponse,
} from "@/lib/types/vehicle.types";
import API_ROUTES from "@/config/routes";

export interface GetVehiclesParams {
  page?: number;
  limit?: number;
  status?: string;
  driverId?: string;
}

/**
 * Get all vehicles
 */
export const getAllVehicles = async (
  params?: GetVehiclesParams
): Promise<VehiclesResponseData> => {
  const response = await api.get<VehiclesResponse>(API_ROUTES.VEHICLES_ALL, {
    params,
  });
  return response.data.data;
};

/**
 * Get vehicle details by ID
 */
export const getVehicleDetails = async (
  vehicleId: string
): Promise<VehicleDetailsResponseData> => {
  const response = await api.get<VehicleDetailsResponse>(
    API_ROUTES.VEHICLE_DETAILS(vehicleId)
  );
  return response.data.data;
};

/**
 * Approve a vehicle
 */
export const approveVehicle = async (
  vehicleId: string
): Promise<ApproveVehicleResponse> => {
  const response = await api.post<ApproveVehicleResponse>(
    API_ROUTES.VEHICLE_APPROVE(vehicleId)
  );
  return response.data;
};

/**
 * Reject a vehicle
 */
export const rejectVehicle = async (
  vehicleId: string,
  data?: RejectVehicleRequest
): Promise<RejectVehicleResponse> => {
  const response = await api.post<RejectVehicleResponse>(
    API_ROUTES.VEHICLE_REJECT(vehicleId),
    data
  );
  return response.data;
};

