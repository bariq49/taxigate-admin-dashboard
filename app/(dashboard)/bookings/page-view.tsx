"use client";

import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/Tables/data-table/data-table";
import { getBookingColumns, getBookingFilterColumns } from "@/components/Tables/data-table/columns/booking-columns";
import {
  getAllBookings,
  getPendingLongDistanceBookings,
  getBookingsAbove150,
  getAdminAssignedBookings,
  assignDriverToBooking,
  unassignDriverFromBooking,
} from "@/lib/api/bookings";
import { getAllDrivers } from "@/lib/api/drivers";
import { Booking } from "@/lib/types/booking.types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";
import { Loader2 } from "lucide-react";

const BookingsPageView = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"all" | "above150" | "assigned" | "pending">("all");
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedDriverId, setSelectedDriverId] = useState<string>("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  // Fetch all bookings
  const {
    data: allData,
    isLoading: isLoadingAll,
    error: allError,
    isFetching: isFetchingAll,
  } = useQuery({
    queryKey: ["bookings", "all", page, pageSize],
    queryFn: () => getAllBookings({ page, limit: pageSize }),
    enabled: activeTab === "all",
    staleTime: 30000,
  });

  // Fetch bookings above 150
  const {
    data: above150Data,
    isLoading: isLoadingAbove150,
    error: above150Error,
    isFetching: isFetchingAbove150,
  } = useQuery({
    queryKey: ["bookings", "above150", page, pageSize],
    queryFn: () => getBookingsAbove150({ page, limit: pageSize }),
    enabled: activeTab === "above150",
    staleTime: 30000,
  });

  // Fetch pending bookings (price > 150, status: pending)
  const {
    data: pendingData,
    isLoading: isLoadingPending,
    error: pendingError,
    isFetching: isFetchingPending,
  } = useQuery({
    queryKey: ["bookings", "pending", page, pageSize],
    queryFn: () => getPendingLongDistanceBookings({ page, limit: pageSize }),
    enabled: activeTab === "pending",
    staleTime: 30000,
  });

  // Fetch assigned bookings
  const {
    data: assignedData,
    isLoading: isLoadingAssigned,
    error: assignedError,
    isFetching: isFetchingAssigned,
  } = useQuery({
    queryKey: ["bookings", "assigned", page, pageSize],
    queryFn: () => getAdminAssignedBookings({ page, limit: pageSize }),
    enabled: activeTab === "assigned",
    staleTime: 30000,
  });

  // Fetch drivers for assignment
  const { data: driversData, isLoading: isLoadingDrivers, error: driversError } = useQuery({
    queryKey: ["drivers", "all"],
    queryFn: async () => {
      console.log("Fetching drivers for assignment (main page)...");
      try {
        const result = await getAllDrivers({ limit: 1000 });
        console.log("Drivers fetched successfully (main page):", {
          total: result?.drivers?.length || 0,
          drivers: result?.drivers,
          result,
        });
        return result;
      } catch (error) {
        console.error("Error fetching drivers (main page):", error);
        throw error;
      }
    },
    staleTime: 60000,
    retry: 2,
  });

  const allBookings = allData?.bookings || [];
  const above150Bookings = above150Data?.bookings || [];
  const pendingBookings = pendingData?.bookings || [];
  const assignedBookings = assignedData?.bookings || [];
  const drivers = driversData?.drivers || [];

  // Filter verified and approved drivers
  const availableDrivers = drivers.filter((driver) => {
    const isAvailable = driver.isVerified && driver.status === "Approved";
    if (!isAvailable) {
      console.log("Driver filtered out:", {
        id: driver.id,
        email: driver.email,
        isVerified: driver.isVerified,
        status: driver.status,
        reason: !driver.isVerified ? "Not verified" : driver.status !== "Approved" ? `Status: ${driver.status}` : "Unknown",
      });
    }
    return isAvailable;
  });

  console.log("Driver filtering results:", {
    totalDrivers: drivers.length,
    availableDrivers: availableDrivers.length,
    drivers: drivers.map((d) => ({
      id: d.id,
      email: d.email,
      isVerified: d.isVerified,
      status: d.status,
    })),
  });

  // Assign driver mutation
  const assignMutation = useMutation({
    mutationFn: ({ bookingId, driverId }: { bookingId: string; driverId: string }) => {
      console.log("Assigning driver:", { bookingId, driverId });
      return assignDriverToBooking(bookingId, { driverId });
    },
    onSuccess: (data) => {
      console.log("Driver assigned successfully:", data);
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["bookings", "all"] });
      queryClient.invalidateQueries({ queryKey: ["bookings", "above150"] });
      queryClient.invalidateQueries({ queryKey: ["bookings", "pending"] });
      queryClient.invalidateQueries({ queryKey: ["bookings", "assigned"] });
      toast.success("Driver assigned successfully");
      setAssignDialogOpen(false);
      setSelectedBooking(null);
      setSelectedDriverId("");
    },
    onError: (error: any) => {
      console.error("Error assigning driver:", error);
      const errorMessage = 
        error?.response?.data?.message || 
        error?.message || 
        "Failed to assign driver";
      toast.error(errorMessage);
    },
  });

  // Unassign driver mutation
  const unassignMutation = useMutation({
    mutationFn: (bookingId: string) => unassignDriverFromBooking(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["bookings", "all"] });
      queryClient.invalidateQueries({ queryKey: ["bookings", "above150"] });
      queryClient.invalidateQueries({ queryKey: ["bookings", "pending"] });
      queryClient.invalidateQueries({ queryKey: ["bookings", "assigned"] });
      toast.success("Driver unassigned successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to unassign driver");
    },
  });

  const handleView = useCallback((booking: Booking) => {
    router.push(`/bookings/${booking.id}`);
  }, [router]);

  const handleAssignDriver = useCallback((booking: Booking) => {
    setSelectedBooking(booking);
    setSelectedDriverId("");
    setAssignDialogOpen(true);
  }, []);

  const handleUnassignDriver = useCallback((booking: Booking) => {
    if (booking.driverId) {
      unassignMutation.mutate(booking.id);
    }
  }, [unassignMutation]);

  const handleAssignSubmit = () => {
    if (!selectedBooking || !selectedDriverId) {
      toast.error("Please select a driver");
      return;
    }
    
    if (selectedBooking.driverId) {
      toast.error("This booking already has a driver assigned");
      return;
    }
    
    // Validate booking price (must be > 150 for admin assignment)
    const price = parseFloat(selectedBooking.price?.replace(/[^\d.-]/g, "") || "0");
    if (price <= 150) {
      toast.error("Only bookings with price above €150 can be admin-assigned");
      return;
    }
    
    console.log("Submitting assignment:", {
      bookingId: selectedBooking.id,
      driverId: selectedDriverId,
      bookingPrice: price,
      booking: selectedBooking,
    });
    
    assignMutation.mutate({
      bookingId: selectedBooking.id,
      driverId: selectedDriverId,
    });
  };

  const columns = getBookingColumns({
    onView: handleView,
    onAssignDriver: handleAssignDriver,
    onUnassignDriver: handleUnassignDriver,
  });

  // Get current bookings and pagination based on active tab
  const getCurrentBookings = () => {
    switch (activeTab) {
      case "all":
        return { bookings: allBookings, pagination: allData?.pagination };
      case "above150":
        return { bookings: above150Bookings, pagination: above150Data?.pagination };
      case "pending":
        return { bookings: pendingBookings, pagination: pendingData?.pagination };
      case "assigned":
        return { bookings: assignedBookings, pagination: assignedData?.pagination };
      default:
        return { bookings: [], pagination: undefined };
    }
  };

  // Get loading state based on active tab
  const getLoadingState = () => {
    switch (activeTab) {
      case "all":
        return { isLoading: isLoadingAll, isFetching: isFetchingAll, error: allError };
      case "above150":
        return { isLoading: isLoadingAbove150, isFetching: isFetchingAbove150, error: above150Error };
      case "pending":
        return { isLoading: isLoadingPending, isFetching: isFetchingPending, error: pendingError };
      case "assigned":
        return { isLoading: isLoadingAssigned, isFetching: isFetchingAssigned, error: assignedError };
      default:
        return { isLoading: false, isFetching: false, error: null };
    }
  };

  const { bookings: currentBookings, pagination } = getCurrentBookings();
  const { isLoading, isFetching, error } = getLoadingState();
  const filterColumns = getBookingFilterColumns(currentBookings);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1);
  };

  // Reset page when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value as "all" | "above150" | "assigned" | "pending");
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="grid w-full max-w-2xl grid-cols-4">
              <TabsTrigger value="all">All Bookings</TabsTrigger>
              <TabsTrigger value="above150">Above 150</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="assigned">Assigned</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-6">
              {error ? (
                <div className="flex items-center justify-center py-10 text-red-500 font-medium">
                  Error loading bookings. Please try again.
                </div>
              ) : (
                <DataTable
                  columns={columns}
                  data={currentBookings}
                  searchKey="user_name"
                  filterColumns={filterColumns}
                  loading={isLoading}
                  fetching={isFetching}
                  pagination={pagination ? {
                    total: pagination.total,
                    page: pagination.page,
                    pages: pagination.pages,
                    limit: pagination.limit,
                  } : undefined}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                />
              )}
            </TabsContent>
            <TabsContent value="above150" className="mt-6">
              {error ? (
                <div className="flex items-center justify-center py-10 text-red-500 font-medium">
                  Error loading bookings. Please try again.
                </div>
              ) : (
                <DataTable
                  columns={columns}
                  data={currentBookings}
                  searchKey="user_name"
                  filterColumns={filterColumns}
                  loading={isLoading}
                  fetching={isFetching}
                  pagination={pagination ? {
                    total: pagination.total,
                    page: pagination.page,
                    pages: pagination.pages,
                    limit: pagination.limit,
                  } : undefined}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                />
              )}
            </TabsContent>
            <TabsContent value="pending" className="mt-6">
              {error ? (
                <div className="flex items-center justify-center py-10 text-red-500 font-medium">
                  Error loading bookings. Please try again.
                </div>
              ) : (
                <DataTable
                  columns={columns}
                  data={currentBookings}
                  searchKey="user_name"
                  filterColumns={filterColumns}
                  loading={isLoading}
                  fetching={isFetching}
                  pagination={pagination ? {
                    total: pagination.total,
                    page: pagination.page,
                    pages: pagination.pages,
                    limit: pagination.limit,
                  } : undefined}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                />
              )}
            </TabsContent>
            <TabsContent value="assigned" className="mt-6">
              {error ? (
                <div className="flex items-center justify-center py-10 text-red-500 font-medium">
                  Error loading bookings. Please try again.
                </div>
              ) : (
                <DataTable
                  columns={columns}
                  data={currentBookings}
                  searchKey="user_name"
                  filterColumns={filterColumns}
                  loading={isLoading}
                  fetching={isFetching}
                  pagination={pagination ? {
                    total: pagination.total,
                    page: pagination.page,
                    pages: pagination.pages,
                    limit: pagination.limit,
                  } : undefined}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Assign Driver Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Assign Driver to Booking</DialogTitle>
            <DialogDescription>
              Select a driver to assign to this booking. Only verified and approved drivers are shown.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="driver">Driver</Label>
              {isLoadingDrivers ? (
                <div className="text-sm text-muted-foreground">Loading drivers...</div>
              ) : driversError ? (
                <div className="text-sm text-red-500">Error loading drivers. Please refresh.</div>
              ) : (
                <Select value={selectedDriverId} onValueChange={setSelectedDriverId}>
                  <SelectTrigger id="driver">
                    <SelectValue placeholder="Select a driver" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDrivers.length === 0 ? (
                      <SelectItem value="no-drivers" disabled>
                        No available drivers (verified and approved)
                      </SelectItem>
                    ) : (
                      availableDrivers.map((driver) => {
                        const fullName =
                          driver.firstName || driver.lastName
                            ? `${driver.firstName || ""} ${driver.lastName || ""}`.trim()
                            : driver.email;
                        return (
                          <SelectItem key={driver.id} value={driver.id}>
                            {fullName} ({driver.email})
                          </SelectItem>
                        );
                      })
                    )}
                  </SelectContent>
                </Select>
              )}
              {drivers.length > 0 && availableDrivers.length === 0 && !isLoadingDrivers && !driversError && (
                <div className="text-xs text-amber-600 dark:text-amber-400 mt-1 p-2 bg-amber-50 dark:bg-amber-950 rounded">
                  <strong>Note:</strong> {drivers.length} driver(s) found, but none are both verified and approved. 
                  Please verify and approve drivers in the Drivers section first.
                </div>
              )}
            </div>
            {selectedBooking && (
              <div className="rounded-lg border p-4 bg-muted/50">
                <div className="text-sm space-y-1">
                  <div>
                    <span className="font-medium">Customer:</span> {selectedBooking.user_name}
                  </div>
                  <div>
                    <span className="font-medium">From:</span> {selectedBooking.from_location}
                  </div>
                  <div>
                    <span className="font-medium">To:</span> {selectedBooking.to_location}
                  </div>
                  <div>
                    <span className="font-medium">Price:</span> €{parseFloat(selectedBooking.price || "0").toFixed(2)}
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAssignDialogOpen(false);
                setSelectedBooking(null);
                setSelectedDriverId("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssignSubmit}
              disabled={!selectedDriverId || assignMutation.isPending || isLoadingDrivers || availableDrivers.length === 0}
            >
              {assignMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Assigning...
                </>
              ) : (
                "Assign Driver"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookingsPageView;

