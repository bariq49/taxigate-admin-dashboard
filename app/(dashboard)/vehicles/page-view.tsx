"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/Tables/data-table/data-table";
import { getVehicleColumns, getVehicleFilterColumns } from "@/components/Tables/data-table/columns/vehicle-columns";
import { getAllVehicles, GetVehiclesParams, approveVehicle, rejectVehicle } from "@/lib/api/vehicles";
import { Vehicle } from "@/lib/types/vehicle.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import toast from "react-hot-toast";

const VehiclesPageView = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ["vehicles", page, pageSize, statusFilter],
    queryFn: async () => {
      const params: GetVehiclesParams = {
        page,
        limit: pageSize,
        ...(statusFilter && { status: statusFilter }),
      };
      return getAllVehicles(params);
    },
    staleTime: 30000,
  });

  const vehicles = data?.vehicles || [];
  const pagination = data?.pagination;

  // Approve vehicle mutation
  const approveMutation = useMutation({
    mutationFn: (vehicleId: string) => approveVehicle(vehicleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast.success("Vehicle approved successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to approve vehicle");
    },
  });

  // Reject vehicle mutation
  const rejectMutation = useMutation({
    mutationFn: ({ vehicleId, reason }: { vehicleId: string; reason?: string }) =>
      rejectVehicle(vehicleId, reason ? { reason } : undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast.success("Vehicle rejected successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to reject vehicle");
    },
  });

  const handleView = useCallback((vehicle: Vehicle) => {
    // Navigate to vehicle details page or show modal
    router.push(`/vehicles/${vehicle.id}`);
  }, [router]);

  const handleApprove = useCallback((vehicle: Vehicle) => {
    approveMutation.mutate(vehicle.id);
  }, [approveMutation]);

  const handleReject = useCallback((vehicle: Vehicle) => {
    // You can add a dialog here to get rejection reason
    if (window.confirm(`Are you sure you want to reject vehicle ${vehicle.plateNumber}?`)) {
      rejectMutation.mutate({ vehicleId: vehicle.id });
    }
  }, [rejectMutation]);

  const columns = getVehicleColumns({
    onView: handleView,
    onApprove: handleApprove,
    onReject: handleReject,
  });

  const filterColumns = getVehicleFilterColumns(vehicles);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Vehicles</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="flex items-center justify-center py-10 text-red-500 font-medium">
              Error loading vehicles. Please try again.
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={vehicles}
              searchKey="plateNumber"
              filterColumns={filterColumns}
              loading={isLoading}
              fetching={isFetching}
              pagination={pagination ? {
                total: pagination.totalVehicles,
                page: pagination.currentPage,
                pages: pagination.totalPages,
                limit: pagination.limit,
              } : undefined}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default VehiclesPageView;

