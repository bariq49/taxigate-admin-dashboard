"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getVehicleDetails, approveVehicle, rejectVehicle } from "@/lib/api/vehicles";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import ErrorBlock from "@/components/error-block";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Car,
  Calendar,
  Palette,
  Hash,
  User,
  Mail,
  Phone,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Image as ImageIcon,
} from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";

const VehicleDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const vehicleId = params?.vehicleId as string;
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["vehicle-details", vehicleId],
    queryFn: async () => {
      if (!vehicleId) throw new Error("Vehicle ID is required");
      return getVehicleDetails(vehicleId);
    },
    enabled: !!vehicleId,
    staleTime: 30000,
  });

  const vehicle = data?.vehicle;

  const approveMutation = useMutation({
    mutationFn: () => approveVehicle(vehicleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicle-details", vehicleId] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast.success("Vehicle approved successfully!");
      setApproveDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to approve vehicle");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: () => rejectVehicle(vehicleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicle-details", vehicleId] });
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast.success("Vehicle rejected successfully!");
      setRejectDialogOpen(false);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to reject vehicle");
    },
  });

  if (error) {
    return (
      <div className="pt-6">
        <ErrorBlock />
      </div>
    );
  }

  if (isLoading || !vehicle) {
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

  const driver = vehicle.driver;
  const fullName = driver.firstName || driver.lastName
    ? `${driver.firstName || ""} ${driver.lastName || ""}`.trim()
    : "N/A";
  const initials = fullName !== "N/A"
    ? fullName
        .split(" ")
        .map((n) => n[0]?.toUpperCase())
        .join("")
        .slice(0, 2)
    : driver.email[0]?.toUpperCase() || "D";

  const statusColors: Record<string, string> = {
    Approved: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    Pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
    Rejected: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "dd MMM yyyy, HH:mm");
    } catch {
      return dateString;
    }
  };

  const isPending = vehicle.status === "Pending";
  const isApproved = vehicle.status === "Approved";

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
        {/* Main Vehicle Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold">Vehicle Details</CardTitle>
                <Badge
                  variant="outline"
                  className={`capitalize ${statusColors[vehicle.status] || "bg-gray-100 text-gray-700"}`}
                >
                  {vehicle.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Vehicle Image */}
              {vehicle.image ? (
                <div className="relative w-full h-64 rounded-lg overflow-hidden border">
                  <img
                    src={vehicle.image}
                    alt={`${vehicle.brand} ${vehicle.model}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-full h-64 rounded-lg border bg-muted flex items-center justify-center">
                  <ImageIcon className="h-16 w-16 text-muted-foreground" />
                </div>
              )}

              {/* Vehicle Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Brand</div>
                  <div className="text-lg font-semibold flex items-center gap-2">
                    <Car className="h-4 w-4" />
                    {vehicle.brand}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Model</div>
                  <div className="text-lg font-semibold">{vehicle.model}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Type</div>
                  <div className="text-lg font-semibold">{vehicle.type}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Plate Number</div>
                  <div className="text-lg font-semibold flex items-center gap-2 font-mono">
                    <Hash className="h-4 w-4" />
                    {vehicle.plateNumber}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Color</div>
                  <div className="text-lg font-semibold flex items-center gap-2">
                    <Palette className="h-4 w-4" />
                    <span className="capitalize">{vehicle.color}</span>
                    <div
                      className="h-4 w-4 rounded-full border"
                      style={{
                        backgroundColor: vehicle.color?.toLowerCase() || "#gray",
                      }}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Created At</div>
                  <div className="text-lg font-semibold flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {formatDate(vehicle.createdAt)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Driver Info & Actions */}
        <div className="space-y-6">
          {/* Driver Information */}
          <Card>
            <CardHeader>
              <CardTitle>Driver Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="text-sm font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold">{fullName}</div>
                  <div className="text-sm text-muted-foreground">{driver.email}</div>
                </div>
              </div>
              <div className="space-y-2 pt-2 border-t">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{driver.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{driver.phone || "N/A"}</span>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.push(`/user-profile/${driver.id}`)}
              >
                <User className="h-4 w-4 mr-2" />
                View Driver Profile
              </Button>
            </CardContent>
          </Card>

          {/* Actions */}
          {isPending && (
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  className="w-full"
                  onClick={() => setApproveDialogOpen(true)}
                  disabled={approveMutation.isPending}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Approve Vehicle
                </Button>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => setRejectDialogOpen(true)}
                  disabled={rejectMutation.isPending}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Reject Vehicle
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Approve Dialog */}
      <AlertDialog open={approveDialogOpen} onOpenChange={setApproveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Vehicle</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve this vehicle? The driver will be notified.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => approveMutation.mutate()}
              disabled={approveMutation.isPending}
            >
              {approveMutation.isPending ? "Approving..." : "Approve"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <AlertDialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Vehicle</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject this vehicle? The driver will be notified.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => rejectMutation.mutate()}
              disabled={rejectMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {rejectMutation.isPending ? "Rejecting..." : "Reject"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default VehicleDetailsPage;

