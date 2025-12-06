"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import ErrorBlock from "@/components/error-block";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Label } from "@/components/ui/label";
import {
  MapPin,
  Calendar,
  DollarSign,
  User,
  Mail,
  Phone,
  Car,
  Clock,
  ArrowLeft,
  UserPlus,
  UserX,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { useState } from "react";
import { assignDriverToBooking, unassignDriverFromBooking, getAllBookings, getBookingsAbove150, getAdminAssignedBookings } from "@/lib/api/bookings";
import { getAllDrivers } from "@/lib/api/drivers";
import { Booking } from "@/lib/types/booking.types";

const BookingDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const bookingId = params?.bookingId as string;
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedDriverId, setSelectedDriverId] = useState<string>("");

  // Fetch booking details from pending or assigned lists
  const { data, isLoading, error } = useQuery({
    queryKey: ["booking-details", bookingId],
    queryFn: async () => {
      if (!bookingId) throw new Error("Booking ID is required");
      // Fetch from all booking lists to find the booking
      const [all, above150, assigned] = await Promise.all([
        getAllBookings().catch(() => ({ bookings: [] as Booking[] })),
        getBookingsAbove150().catch(() => ({ bookings: [] as Booking[] })),
        getAdminAssignedBookings().catch(() => ({ bookings: [] as Booking[] })),
      ]);
      
      // Combine all bookings and remove duplicates by ID
      const allBookingsMap = new Map<string, Booking>();
      [...all.bookings, ...above150.bookings, ...assigned.bookings].forEach((booking) => {
        if (!allBookingsMap.has(booking.id)) {
          allBookingsMap.set(booking.id, booking);
        }
      });
      const allBookings = Array.from(allBookingsMap.values());
      const booking = allBookings.find((b: Booking) => b.id === bookingId);
      
      if (!booking) throw new Error("Booking not found");
      return { booking };
    },
    enabled: !!bookingId,
    staleTime: 30000,
  });

  // Fetch drivers for assignment
  const { data: driversData, isLoading: isLoadingDrivers, error: driversError } = useQuery({
    queryKey: ["drivers", "all"],
    queryFn: async () => {
      console.log("Fetching drivers for assignment...");
      try {
        const result = await getAllDrivers({ limit: 1000 });
        console.log("Drivers fetched successfully:", {
          total: result?.drivers?.length || 0,
          drivers: result?.drivers,
        });
        return result;
      } catch (error) {
        console.error("Error fetching drivers:", error);
        throw error;
      }
    },
    staleTime: 60000,
    retry: 2,
  });

  const booking = data?.booking;
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

  console.log("Driver data:", {
    isLoadingDrivers,
    driversError: driversError?.message,
    totalDrivers: drivers.length,
    availableDrivers: availableDrivers.length,
    drivers: drivers.map((d) => ({
      id: d.id,
      email: d.email,
      isVerified: d.isVerified,
      status: d.status,
    })),
    driversData,
  });

  const assignMutation = useMutation({
    mutationFn: () => {
      if (!selectedDriverId) {
        throw new Error("Please select a driver");
      }
      console.log("Assigning driver from details page:", { bookingId, driverId: selectedDriverId });
      return assignDriverToBooking(bookingId, { driverId: selectedDriverId });
    },
    onSuccess: (data) => {
      console.log("Driver assigned successfully:", data);
      queryClient.invalidateQueries({ queryKey: ["booking-details", bookingId] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["bookings", "all"] });
      queryClient.invalidateQueries({ queryKey: ["bookings", "above150"] });
      queryClient.invalidateQueries({ queryKey: ["bookings", "pending"] });
      queryClient.invalidateQueries({ queryKey: ["bookings", "assigned"] });
      toast.success("Driver assigned successfully");
      setAssignDialogOpen(false);
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

  const unassignMutation = useMutation({
    mutationFn: () => unassignDriverFromBooking(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["booking-details", bookingId] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      toast.success("Driver unassigned successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to unassign driver");
    },
  });

  if (error) {
    return (
      <div className="pt-6">
        <ErrorBlock />
      </div>
    );
  }

  if (isLoading || !booking) {
    return (
      <div className="pt-6">
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
    accepted: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    started: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
    picked_up: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300",
    dropped_off: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300",
    completed: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    rejected: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
    cancelled: "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300",
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "dd MMM yyyy, HH:mm");
    } catch {
      return dateString;
    }
  };

  const hasDriver = !!booking.driverId;
  const isPending = booking.status === "pending";

  return (
    <div className="pt-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Booking Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold">Booking Details</CardTitle>
                <Badge
                  variant="outline"
                  className={`capitalize ${statusColors[booking.status] || "bg-gray-100 text-gray-700"}`}
                >
                  {booking.status.replace("_", " ")}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Customer Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Customer Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Name</div>
                    <div className="text-lg font-semibold flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {booking.user_name}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Email</div>
                    <div className="text-lg font-semibold flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {booking.email}
                    </div>
                  </div>
                  {booking.number && (
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Phone</div>
                      <div className="text-lg font-semibold flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {booking.number}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Trip Information */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Trip Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">From</div>
                    <div className="text-lg font-semibold flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {booking.from_location}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">To</div>
                    <div className="text-lg font-semibold flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {booking.to_location}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Date & Time</div>
                    <div className="text-lg font-semibold flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {formatDate(booking.date_time)}
                    </div>
                  </div>
                  {booking.return_date_time && (
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Return Date & Time</div>
                      <div className="text-lg font-semibold flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {formatDate(booking.return_date_time)}
                      </div>
                    </div>
                  )}
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Price</div>
                    <div className="text-lg font-semibold flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      €{parseFloat(booking.price || "0").toFixed(2)}
                    </div>
                  </div>
                  {booking.distance && (
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Distance</div>
                      <div className="text-lg font-semibold flex items-center gap-2">
                        <Car className="h-4 w-4" />
                        {booking.distance} km
                      </div>
                    </div>
                  )}
                  {booking.num_passengers && (
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Passengers</div>
                      <div className="text-lg font-semibold">{booking.num_passengers}</div>
                    </div>
                  )}
                  {booking.luggage && (
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground">Luggage</div>
                      <div className="text-lg font-semibold">{booking.luggage}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Information */}
              {(booking.note_description || booking.flight_no || booking.stop_1 || booking.stop_2) && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
                  <div className="space-y-2">
                    {booking.note_description && (
                      <div>
                        <div className="text-sm text-muted-foreground">Notes</div>
                        <div className="text-sm">{booking.note_description}</div>
                      </div>
                    )}
                    {booking.flight_no && (
                      <div>
                        <div className="text-sm text-muted-foreground">Flight Number</div>
                        <div className="text-sm font-mono">{booking.flight_no}</div>
                      </div>
                    )}
                    {booking.stop_1 && (
                      <div>
                        <div className="text-sm text-muted-foreground">Stop 1</div>
                        <div className="text-sm">{booking.stop_1}</div>
                      </div>
                    )}
                    {booking.stop_2 && (
                      <div>
                        <div className="text-sm text-muted-foreground">Stop 2</div>
                        <div className="text-sm">{booking.stop_2}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Actions & Driver Info */}
        <div className="space-y-6">
          {/* Driver Assignment */}
          <Card>
            <CardHeader>
              <CardTitle>Driver Assignment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {hasDriver ? (
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">Driver ID</div>
                  <div className="text-sm font-mono">{booking.driverId}</div>
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => unassignMutation.mutate()}
                    disabled={unassignMutation.isPending}
                  >
                    <UserX className="h-4 w-4 mr-2" />
                    {unassignMutation.isPending ? "Unassigning..." : "Unassign Driver"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">No driver assigned</div>
                  {isPending && (
                    <Button
                      className="w-full"
                      onClick={() => setAssignDialogOpen(true)}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Assign Driver
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Booking Metadata */}
          <Card>
            <CardHeader>
              <CardTitle>Booking Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Created:</span>
                <span>{formatDate(booking.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Updated:</span>
                <span>{formatDate(booking.updatedAt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Assignment Type:</span>
                <Badge variant="outline">
                  {booking.assignmentType === "admin" ? "Admin" : booking.assignmentType === "auto" ? "Auto" : "N/A"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Paid:</span>
                <Badge variant={booking.isPaid ? "default" : "outline"}>
                  {booking.isPaid ? "Yes" : "No"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

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
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading drivers...
                </div>
              ) : driversError ? (
                <div className="space-y-2">
                  <div className="text-sm text-red-500">
                    Error loading drivers: {driversError?.message || "Unknown error"}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      queryClient.invalidateQueries({ queryKey: ["drivers", "all"] });
                    }}
                  >
                    Retry
                  </Button>
                </div>
              ) : (
                <Select value={selectedDriverId} onValueChange={setSelectedDriverId}>
                  <SelectTrigger id="driver" className="w-full">
                    <SelectValue placeholder="Select a driver" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDrivers.length === 0 ? (
                      <SelectItem value="no-drivers" disabled>
                        {drivers.length === 0
                          ? "No drivers found"
                          : "No available drivers (verified and approved)"}
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
              {drivers.length === 0 && !isLoadingDrivers && !driversError && (
                <div className="text-xs text-muted-foreground mt-1">
                  No drivers found in the system.
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAssignDialogOpen(false);
                setSelectedDriverId("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (!selectedDriverId) {
                  toast.error("Please select a driver");
                  return;
                }
                
                // Validate booking price (must be > 150 for admin assignment)
                const price = parseFloat(booking.price?.replace(/[^\d.-]/g, "") || "0");
                if (price <= 150) {
                  toast.error("Only bookings with price above €150 can be admin-assigned");
                  return;
                }
                
                assignMutation.mutate();
              }}
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

export default BookingDetailsPage;

