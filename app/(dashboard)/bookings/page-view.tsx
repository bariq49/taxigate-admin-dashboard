"use client";

import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useAbly } from "@/contexts/ably-context";
import { useRouter } from "next/navigation";
import { DataTable } from "@/components/Tables/data-table/data-table";
import { getBookingColumns, getBookingFilterColumns } from "@/components/Tables/data-table/columns/booking-columns";
import {
  getLiveBookings,
  getBookingsAbove150,
  getBookingsBelow150,
  getAdminAssignedBookings,
  getExpiredBookings,
  getAdminCompletedBookings,
  assignDriverToBooking,
  unassignDriverFromBooking,
} from "@/lib/api/bookings";
import { getAllDrivers } from "@/lib/api/drivers";
import { Booking, BookingsResponseData } from "@/lib/types/booking.types";
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
import { Loader2, Clock } from "lucide-react";

const BookingsPageView = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { subscribe, isConnected } = useAbly();
  const [activeTab, setActiveTab] = useState<"live" | "assigned" | "expired" | "above150" | "below150" | "completed">("live");
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedDriverId, setSelectedDriverId] = useState<string>("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  // Fetch live bookings (real-time)
  // Always enabled when user is logged in (not just when tab is active)
  // This ensures cache is available for real-time updates even when on other tabs
  const {
    data: liveData,
    isLoading: isLoadingLive,
    error: liveError,
    isFetching: isFetchingLive,
  } = useQuery({
    queryKey: ["bookings", "live"],
    queryFn: () => getLiveBookings(),
    enabled: !!user, // Always enabled when user is logged in
    staleTime: 10000, // Cache for 10 seconds
    refetchInterval: false, // Disable automatic refetch - rely on Ably for real-time updates
    // Keep data in cache even when query is not actively being used
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
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

  // Fetch bookings below 150
  const {
    data: below150Data,
    isLoading: isLoadingBelow150,
    error: below150Error,
    isFetching: isFetchingBelow150,
  } = useQuery({
    queryKey: ["bookings", "below150", page, pageSize],
    queryFn: () => getBookingsBelow150({ page, limit: pageSize }),
    enabled: activeTab === "below150",
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

  // Fetch expired bookings
  const {
    data: expiredData,
    isLoading: isLoadingExpired,
    error: expiredError,
    isFetching: isFetchingExpired,
  } = useQuery({
    queryKey: ["bookings", "expired", page, pageSize],
    queryFn: () => getExpiredBookings({ page, limit: pageSize }),
    enabled: activeTab === "expired",
    staleTime: 30000,
  });

  // Fetch completed bookings with driver details
  const {
    data: completedData,
    isLoading: isLoadingCompleted,
    error: completedError,
    isFetching: isFetchingCompleted,
  } = useQuery({
    queryKey: ["bookings", "completed", page, pageSize],
    queryFn: () => getAdminCompletedBookings({ page, limit: pageSize }),
    enabled: activeTab === "completed",
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

  const liveBookings = liveData?.bookings || [];
  const above150Bookings = above150Data?.bookings || [];
  const below150Bookings = below150Data?.bookings || [];
  const assignedBookings = assignedData?.bookings || [];
  const expiredBookings = expiredData?.bookings || [];
  const completedBookings = completedData?.bookings || [];
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
      queryClient.invalidateQueries({ queryKey: ["bookings", "live"] });
      queryClient.invalidateQueries({ queryKey: ["bookings", "above150"] });
      queryClient.invalidateQueries({ queryKey: ["bookings", "below150"] });
      queryClient.invalidateQueries({ queryKey: ["bookings", "assigned"] });
      queryClient.invalidateQueries({ queryKey: ["bookings", "expired"] });
      queryClient.invalidateQueries({ queryKey: ["bookings", "completed"] });
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
      queryClient.invalidateQueries({ queryKey: ["bookings", "live"] });
      queryClient.invalidateQueries({ queryKey: ["bookings", "above150"] });
      queryClient.invalidateQueries({ queryKey: ["bookings", "below150"] });
      queryClient.invalidateQueries({ queryKey: ["bookings", "assigned"] });
      queryClient.invalidateQueries({ queryKey: ["bookings", "completed"] });
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
    
    // Validate booking price (must be > 150 for admin assignment OR expired)
    const price = parseFloat(selectedBooking.price?.replace(/[^\d.-]/g, "") || "0");
    const isExpired = selectedBooking.isExpired === true;
    
    if (price <= 150 && !isExpired) {
      toast.error("Only bookings with price above €150 or expired bookings can be admin-assigned");
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
    hideExpiration: activeTab === "completed", // Hide expiration column for completed bookings
  });

  // Get current bookings and pagination based on active tab
  const getCurrentBookings = () => {
    switch (activeTab) {
      case "live":
        return { bookings: liveBookings, pagination: undefined }; // Live bookings don't use pagination
      case "assigned":
        return { bookings: assignedBookings, pagination: assignedData?.pagination };
      case "expired":
        return { bookings: expiredBookings, pagination: expiredData?.pagination };
      case "above150":
        return { bookings: above150Bookings, pagination: above150Data?.pagination };
      case "below150":
        return { bookings: below150Bookings, pagination: below150Data?.pagination };
      case "completed":
        return { bookings: completedBookings, pagination: completedData?.pagination };
      default:
        return { bookings: [], pagination: undefined };
    }
  };

  // Get loading state based on active tab
  const getLoadingState = () => {
    switch (activeTab) {
      case "live":
        return { isLoading: isLoadingLive, isFetching: isFetchingLive, error: liveError };
      case "assigned":
        return { isLoading: isLoadingAssigned, isFetching: isFetchingAssigned, error: assignedError };
      case "expired":
        return { isLoading: isLoadingExpired, isFetching: isFetchingExpired, error: expiredError };
      case "above150":
        return { isLoading: isLoadingAbove150, isFetching: isFetchingAbove150, error: above150Error };
      case "below150":
        return { isLoading: isLoadingBelow150, isFetching: isFetchingBelow150, error: below150Error };
      case "completed":
        return { isLoading: isLoadingCompleted, isFetching: isFetchingCompleted, error: completedError };
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
    setActiveTab(value as "live" | "assigned" | "expired" | "above150" | "below150" | "completed");
    setPage(1);
  };

  // Real-time updates for all bookings using Ably
  useEffect(() => {
    if (!user || !isConnected) return;

    // Helper function to update live bookings cache
    const updateLiveBookingsCache = (bookingData: any, action: "add" | "remove" | "update") => {
      console.log(`🔄 [CACHE] Updating live bookings cache - Action: ${action}`, {
        bookingId: bookingData?.id || bookingData?.bookingId,
        hasBookingData: !!bookingData,
      });

      queryClient.setQueryData(
        ["bookings", "live"],
        (oldData: BookingsResponseData | undefined) => {
          // If no old data exists, initialize with empty structure
          if (!oldData) {
            if (action === "add" && bookingData) {
              console.log("✅ [CACHE] Initializing cache with new booking");
              return {
                bookings: [bookingData],
                pagination: {
                  total: 1,
                  page: 1,
                  pages: 1,
                  limit: 100,
                },
              };
            }
            console.warn("⚠️ [CACHE] No old data and action is not 'add', returning undefined");
            return oldData; // Return undefined if no data and not adding
          }

          // Create a new array to ensure React Query detects the change
          let updatedBookings = [...oldData.bookings];

          if (action === "add") {
            // Check if booking already exists (use id or bookingId)
            const bookingId = bookingData.id || bookingData.bookingId;
            const exists = updatedBookings.some((b) => b.id === bookingId);
            if (!exists && bookingId) {
              // Add new booking at the beginning
              updatedBookings = [bookingData, ...updatedBookings];
              console.log(`✅ [CACHE] Added booking ${bookingId} to cache. Total: ${updatedBookings.length}`);
            } else if (exists) {
              console.log(`⚠️ [CACHE] Booking ${bookingId} already exists in cache, skipping add`);
            } else {
              console.warn("⚠️ [CACHE] Cannot add booking - missing bookingId");
            }
          } else if (action === "remove") {
            // Use id or bookingId for removal
            const bookingId = bookingData.id || bookingData.bookingId;
            const beforeLength = updatedBookings.length;
            updatedBookings = updatedBookings.filter(
              (b) => b.id !== bookingId
            );
            if (updatedBookings.length < beforeLength) {
              console.log(`✅ [CACHE] Removed booking ${bookingId} from cache. Total: ${updatedBookings.length}`);
            }
          } else if (action === "update") {
            // Use id or bookingId for update
            const bookingId = bookingData.id || bookingData.bookingId;
            const index = updatedBookings.findIndex((b) => b.id === bookingId);
            if (index !== -1) {
              updatedBookings[index] = { ...updatedBookings[index], ...bookingData };
              console.log(`✅ [CACHE] Updated booking ${bookingId} in cache`);
            } else {
              // If booking doesn't exist, add it (might have been missed)
              updatedBookings = [bookingData, ...updatedBookings];
              console.log(`✅ [CACHE] Booking ${bookingId} not found, added to cache. Total: ${updatedBookings.length}`);
            }
          }

          // Return new object to ensure React Query detects the change
          const newData = {
            ...oldData,
            bookings: updatedBookings,
            pagination: {
              ...oldData.pagination,
              total: updatedBookings.length,
            },
          };
          
          console.log(`✅ [CACHE] Cache update complete. Total bookings: ${updatedBookings.length}`);
          return newData;
        },
        { updatedAt: Date.now() } // Force update timestamp
      );

      // Force a refetch if we're on the live tab to ensure UI updates
      if (activeTab === "live") {
        // Invalidate to trigger a background refetch as fallback
        queryClient.invalidateQueries({ 
          queryKey: ["bookings", "live"],
          refetchType: "active", // Only refetch if query is active
        });
      }
    };

    // Helper function to update booking in all relevant caches
    const updateBookingInCache = (bookingData: any) => {
      const bookingId = bookingData.bookingId || bookingData.id;

      // Update live bookings if it exists there
      queryClient.setQueryData(
        ["bookings", "live"],
        (oldData: { bookings: Booking[] } | undefined) => {
          if (!oldData) return oldData;
          const updatedBookings = oldData.bookings.map((b) =>
            b.id === bookingId ? { ...b, ...bookingData } : b
          );
          return { ...oldData, bookings: updatedBookings };
        }
      );

      // Update other booking lists (they will refetch on next access if needed)
      // For now, we'll invalidate them but only when the active tab matches
      if (activeTab === "assigned" || activeTab === "expired" || activeTab === "above150" || activeTab === "below150") {
        queryClient.invalidateQueries({ queryKey: ["bookings", activeTab] });
      }
    };

    // Subscribe to booking created event (for instant notifications)
    const unsubscribeBookingCreated = subscribe("booking-created-admin", (message: any) => {
      console.log("🔔 Booking created (admin):", message.data);
      if (message.data) {
        // Backend sends full booking data
        const booking = message.data;
        const bookingId = booking.id || booking.bookingId;
        console.log("📦 New booking created:", bookingId);
        console.log("📦 Booking status:", booking.status, "Expired:", booking.isExpired);
        
        // Update live bookings cache if booking is pending and not expired
        if (booking.status === "pending" && !booking.isExpired) {
          console.log("✅ Adding booking to live bookings cache");
          updateLiveBookingsCache(booking, "add");
        } else {
          console.log("⏭️ Skipping live bookings cache update (status:", booking.status, "expired:", booking.isExpired, ")");
        }
        
        // Show toast notification
        toast.success(`New booking created: ${booking.from_location} → ${booking.to_location}`);
      } else {
        console.warn("⚠️ Booking created event received but no data in message");
      }
    });

    // Subscribe to live booking events
    const unsubscribeAdded = subscribe("live-booking-added", (message: any) => {
      console.log("🔔 Live booking added:", message.data);
      if (message.data?.booking) {
        // Backend sends { booking: fullBookingData, action: "added", timestamp: ... }
        const booking = message.data.booking;
        console.log("📦 Adding booking to cache:", booking.id || booking.bookingId);
        updateLiveBookingsCache(booking, "add");
      } else if (message.data && !message.data.booking) {
        // Handle case where booking data is at root level (backward compatibility)
        console.log("📦 Adding booking to cache (root level):", message.data.id || message.data.bookingId);
        updateLiveBookingsCache(message.data, "add");
      }
    });

    const unsubscribeRemoved = subscribe("live-booking-removed", (message: any) => {
      console.log("🔔 Live booking removed:", message.data);
      if (message.data) {
        // Backend sends { bookingId: "...", action: "removed", timestamp: ... }
        const bookingId = message.data.bookingId || message.data.id;
        if (bookingId) {
          updateLiveBookingsCache({ id: bookingId, bookingId }, "remove");
        }
      }
    });

    const unsubscribeUpdated = subscribe("live-booking-updated", (message: any) => {
      console.log("🔔 Live booking updated:", message.data);
      if (message.data?.booking) {
        // Backend sends { booking: fullBookingData, action: "updated", timestamp: ... }
        updateLiveBookingsCache(message.data.booking, "update");
      }
    });

    // Subscribe to booking status updates
    const unsubscribeStarted = subscribe("booking-started", (message: any) => {
      console.log("🔔 Booking started:", message.data);
      if (message.data) {
        updateBookingInCache(message.data);
      }
    });

    const unsubscribePickedUp = subscribe("booking-picked-up", (message: any) => {
      console.log("🔔 Booking picked up:", message.data);
      if (message.data) {
        updateBookingInCache(message.data);
      }
    });

    const unsubscribeDroppedOff = subscribe("booking-dropped-off", (message: any) => {
      console.log("🔔 Booking dropped off:", message.data);
      if (message.data) {
        updateBookingInCache(message.data);
      }
    });

    const unsubscribeCompleted = subscribe("booking-completed", (message: any) => {
      console.log("🔔 Booking completed:", message.data);
      if (message.data) {
        updateBookingInCache(message.data);
        // Remove from live bookings if it was there
        queryClient.setQueryData(
          ["bookings", "live"],
          (oldData: { bookings: Booking[] } | undefined) => {
            if (!oldData) return oldData;
            const updatedBookings = oldData.bookings.filter(
              (b) => b.id !== (message.data.bookingId || message.data.id)
            );
            return { ...oldData, bookings: updatedBookings };
          }
        );
        
        // Invalidate completed bookings cache to refetch with new booking
        // This ensures the new completed booking appears in the list
        if (activeTab === "completed") {
          queryClient.invalidateQueries({ queryKey: ["bookings", "completed"] });
        }
      }
    });

    const unsubscribeAssigned = subscribe("booking-assigned", (message: any) => {
      console.log("🔔 Booking assigned:", message.data);
      if (message.data) {
        // Update booking in all caches
        updateBookingInCache(message.data);
        
        // Also update live bookings cache if the booking exists there
        // Backend sends full booking data, so we can use it directly
        const bookingId = message.data.id || message.data.bookingId;
        if (bookingId) {
          updateLiveBookingsCache(message.data, "update");
        }
      }
    });

    const unsubscribeTaken = subscribe("booking-taken", (message: any) => {
      console.log("🔔 Booking taken:", message.data);
      if (message.data) {
        // Backend sends full booking data, so we can use it directly
        const bookingId = message.data.id || message.data.bookingId;
        
        // Update booking in all caches
        updateBookingInCache(message.data);
        
        // Remove from live bookings (booking is no longer available/pending)
        if (bookingId) {
          updateLiveBookingsCache({ id: bookingId, bookingId }, "remove");
        }
      }
    });

    // Subscribe to admin-specific booking events
    const unsubscribeAcceptedAdmin = subscribe("booking-accepted-admin", (message: any) => {
      console.log("🔔 Booking accepted (admin-assigned):", message.data);
      if (message.data) {
        // Update booking in all caches
        updateBookingInCache(message.data);
        
        // Also update live bookings cache if the booking exists there
        const bookingId = message.data.id || message.data.bookingId;
        if (bookingId) {
          updateLiveBookingsCache(message.data, "update");
        }
        
        // Invalidate assigned bookings cache to show updated status
        if (activeTab === "assigned") {
          queryClient.invalidateQueries({ queryKey: ["bookings", "assigned"] });
        }
      }
    });

    const unsubscribeRejectedAdmin = subscribe("booking-rejected-admin", (message: any) => {
      console.log("🔔 Booking rejected (admin-assigned):", message.data);
      if (message.data) {
        // Update booking in all caches
        updateBookingInCache(message.data);
        
        // Also update live bookings cache if the booking exists there
        const bookingId = message.data.id || message.data.bookingId;
        if (bookingId) {
          updateLiveBookingsCache(message.data, "update");
        }
        
        // Invalidate assigned bookings cache to show updated status
        if (activeTab === "assigned") {
          queryClient.invalidateQueries({ queryKey: ["bookings", "assigned"] });
        }
      }
    });

    const unsubscribeExpiredAdmin = subscribe("booking-expired-admin", (message: any) => {
      console.log("🔔 Booking expired (admin notification):", message.data);
      if (message.data) {
        const bookingId = message.data.bookingId || message.data.id;
        
        // Remove from live bookings (booking is expired)
        if (bookingId) {
          updateLiveBookingsCache({ id: bookingId, bookingId }, "remove");
        }
        
        // Update booking in cache to reflect expired status
        updateBookingInCache(message.data);
        
        // Invalidate expired bookings cache to show new expired booking
        if (activeTab === "expired") {
          queryClient.invalidateQueries({ queryKey: ["bookings", "expired"] });
        }
      }
    });

    // Cleanup subscriptions
    return () => {
      unsubscribeBookingCreated();
      unsubscribeAdded();
      unsubscribeRemoved();
      unsubscribeUpdated();
      unsubscribeStarted();
      unsubscribePickedUp();
      unsubscribeDroppedOff();
      unsubscribeCompleted();
      unsubscribeAssigned();
      unsubscribeTaken();
      unsubscribeAcceptedAdmin();
      unsubscribeRejectedAdmin();
      unsubscribeExpiredAdmin();
    };
  }, [user, isConnected, subscribe, queryClient, activeTab]);

  // Debug: Log connection status changes
  useEffect(() => {
    console.log(`🔌 [ABLY] Connection status changed: ${isConnected ? 'CONNECTED' : 'DISCONNECTED'}`);
    if (!isConnected) {
      console.warn("⚠️ [ABLY] Not connected - real-time updates will not work");
    }
  }, [isConnected]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Bookings</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="grid w-full max-w-4xl grid-cols-6">
              <TabsTrigger value="live">Live Bookings</TabsTrigger>
              <TabsTrigger value="assigned">Assigned Bookings</TabsTrigger>
              <TabsTrigger value="expired">Expired Bookings</TabsTrigger>
              <TabsTrigger value="above150">Above 150 Price</TabsTrigger>
              <TabsTrigger value="below150">Under 150 Price</TabsTrigger>
              <TabsTrigger value="completed">Completed Bookings</TabsTrigger>
            </TabsList>
            <TabsContent value="live" className="mt-6">
              {error ? (
                <div className="flex items-center justify-center py-10 text-red-500 font-medium">
                  Error loading live bookings. Please try again.
                </div>
              ) : (
                <DataTable
                  columns={columns}
                  data={currentBookings}
                  searchKey="user_name"
                  filterColumns={filterColumns}
                  loading={isLoading}
                  fetching={isFetching}
                  pagination={undefined} // Live bookings don't use pagination
                  onPageChange={activeTab === "live" ? undefined : handlePageChange}
                  onPageSizeChange={activeTab === "live" ? undefined : handlePageSizeChange}
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
            <TabsContent value="expired" className="mt-6">
              {error ? (
                <div className="flex items-center justify-center py-10 text-red-500 font-medium">
                  Error loading expired bookings. Please try again.
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
            <TabsContent value="below150" className="mt-6">
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
            <TabsContent value="completed" className="mt-6">
              {error ? (
                <div className="flex items-center justify-center py-10 text-red-500 font-medium">
                  Error loading completed bookings. Please try again.
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
              {selectedBooking?.isExpired 
                ? "This booking expired after 5 minutes without driver acceptance. Select a driver to manually assign it. Only verified and approved drivers are shown."
                : "Select a driver to assign to this booking. Only verified and approved drivers are shown."}
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
                  {selectedBooking.isExpired && (
                    <div className="mb-2">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300 text-xs font-medium">
                        <Clock className="h-3 w-3" />
                        Expired Booking
                      </span>
                    </div>
                  )}
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
                  {selectedBooking.expiredAt && (
                    <div>
                      <span className="font-medium">Expired At:</span> {new Date(selectedBooking.expiredAt).toLocaleString()}
                    </div>
                  )}
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

