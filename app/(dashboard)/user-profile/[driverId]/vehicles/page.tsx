"use client";

import { useQuery } from "@tanstack/react-query";
import { getDriverDetails } from "@/lib/api/drivers";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import ErrorBlock from "@/components/error-block";
import { Badge } from "@/components/ui/badge";
import { Car, Calendar, Eye, Palette, Hash } from "lucide-react";
import { format } from "date-fns";

const DriverVehiclesPage = () => {
  const params = useParams();
  const driverId = params?.driverId as string;

  const { data, isLoading, error } = useQuery({
    queryKey: ["driver-details", driverId],
    queryFn: async () => {
      if (!driverId) throw new Error("Driver ID is required");
      return getDriverDetails(driverId);
    },
    enabled: !!driverId,
    staleTime: 30000,
  });

  const driver = data?.driver;

  if (error) {
    return (
      <div className="pt-6">
        <ErrorBlock />
      </div>
    );
  }

  if (isLoading || !driver) {
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

  const vehicles = driver.vehicles || [];

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "dd MMM yyyy");
    } catch {
      return dateString;
    }
  };

  const getStatusBadgeColor = (status: string): "default" | "warning" | "destructive" | "success" | "secondary" => {
    switch (status) {
      case "Approved":
        return "success";
      case "Pending":
        return "warning";
      case "Rejected":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <div className="pt-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Driver Vehicles</CardTitle>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary">
              {vehicles.length} {vehicles.length === 1 ? "Vehicle" : "Vehicles"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {vehicles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Car className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
              <p className="text-lg font-medium text-muted-foreground mb-2">
                No vehicles registered
              </p>
              <p className="text-sm text-muted-foreground">
                This driver hasn't registered any vehicles yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.map((vehicle) => (
                <Card key={vehicle.id} className="overflow-hidden group hover:shadow-xl transition-all duration-300 border border-default-200 hover:border-primary/20">
                  {/* Vehicle Image Section */}
                  <div className="relative w-full h-52 bg-gradient-to-br from-muted via-muted/80 to-muted/60 overflow-hidden rounded-lg group/image">
                    {vehicle.image ? (
                      <>
                        <img
                          src={vehicle.image}
                          alt={`${vehicle.brand} ${vehicle.model}`}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                          }}
                        />
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        {/* View Image Overlay */}
                        <a
                          href={vehicle.image}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover/image:opacity-100 transition-opacity duration-300 cursor-pointer z-20"
                        >
                          <div className="h-14 w-14 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center shadow-2xl hover:bg-white hover:scale-110 transition-all duration-200 border-2 border-white/50">
                            <Eye className="h-7 w-7 text-gray-900" strokeWidth={2} />
                          </div>
                        </a>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                        <Car className="h-20 w-20 text-muted-foreground opacity-20" />
                      </div>
                    )}
                    {/* Status Badge Overlay */}
                    <div className="absolute top-4 right-4 z-30">
                      <Badge
                        color={getStatusBadgeColor(vehicle.status)}
                        variant="soft"
                        className="shadow-lg backdrop-blur-md border border-white/20"
                      >
                        {vehicle.status}
                      </Badge>
                    </div>
                  </div>

                  {/* Vehicle Details Section */}
                  <CardContent className="p-6">
                    <div className="space-y-5">
                      {/* Title Section */}
                      <div className="space-y-1">
                        <h3 className="text-xl font-bold text-default-900 line-clamp-1 leading-tight">
                          {vehicle.brand} {vehicle.model}
                        </h3>
                        <p className="text-sm font-medium text-muted-foreground capitalize">
                          {vehicle.type || "Vehicle Type"}
                        </p>
                      </div>

                      {/* Details Section */}
                      <div className="space-y-3 pt-3 border-t border-default-200">
                        {/* Color */}
                        <div className="flex items-center justify-between py-1.5">
                          <div className="flex items-center gap-2">
                            <Palette className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium text-muted-foreground">Color</span>
                          </div>
                          <span className="text-sm font-semibold capitalize text-default-900 px-3 py-1 rounded-md bg-muted/60 border border-default-200">
                            {vehicle.color || "N/A"}
                          </span>
                        </div>

                        {/* Plate Number */}
                        <div className="flex items-center justify-between py-1.5">
                          <div className="flex items-center gap-2">
                            <Hash className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium text-muted-foreground">Plate</span>
                          </div>
                          <span className="text-sm font-bold font-mono text-primary bg-primary/10 px-3 py-1.5 rounded-md border border-primary/30 tracking-wider">
                            {vehicle.plateNumber || "N/A"}
                          </span>
                        </div>

                        {/* Registration Date */}
                        <div className="flex items-center justify-between pt-2 border-t border-default-200">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium text-muted-foreground">Registered</span>
                          </div>
                          <span className="text-sm font-semibold text-default-900">
                            {formatDate(vehicle.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DriverVehiclesPage;

