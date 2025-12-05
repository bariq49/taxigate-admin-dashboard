"use client";

import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/Tables/data-table/data-table";
import { getDriverColumns, getDriverFilterColumns } from "@/components/Tables/data-table/columns/driver-columns";
import { getAllDrivers, GetDriversParams } from "@/lib/api/drivers";
import { Driver } from "@/lib/types/driver.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import toast from "react-hot-toast";

const DriversPageView = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ["drivers", page, pageSize],
    queryFn: async () => {
      const params: GetDriversParams = {
        page,
        limit: pageSize,
      };
      return getAllDrivers(params);
    },
    staleTime: 30000,
  });

  const drivers = data?.drivers || [];
  const pagination = data?.pagination;

  const handleView = useCallback((driver: Driver) => {
    toast.success(`Viewing driver: ${driver.firstName || driver.email}`);
    // TODO: Implement view driver details
  }, []);

  const handleDelete = useCallback((driver: Driver) => {
    toast.success(`Driver deleted: ${driver.firstName || driver.email}`);
    // TODO: Implement delete driver
  }, []);

  const columns = getDriverColumns({
    onView: handleView,
    onDelete: handleDelete,
  });

  const filterColumns = getDriverFilterColumns(drivers);

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
          <CardTitle className="text-2xl font-bold">Drivers</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="flex items-center justify-center py-10 text-red-500 font-medium">
              Error loading drivers. Please try again.
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={drivers}
              searchKey="email"
              filterColumns={filterColumns}
              loading={isLoading}
              fetching={isFetching}
              pagination={pagination}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DriversPageView;

