"use client"
import React from "react"
import { usePathname, useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Header from "./components/header";
import SettingsHeader from "./components/settings-header"
import { getDriverDetails } from "@/lib/api/drivers";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

const ProfileLayout = ({ children }: { children: React.ReactNode }) => {
  const location = usePathname();
  const params = useParams();
  const driverId = params?.driverId as string | undefined;

  // Fetch driver data if it's a dynamic route
  const { data: driverData, isLoading: isLoadingDriver } = useQuery({
    queryKey: ["driver-details", driverId],
    queryFn: async () => {
      if (!driverId) return null;
      return getDriverDetails(driverId);
    },
    enabled: !!driverId,
    staleTime: 30000,
  });

  const driver = driverData?.driver;

  if (location?.includes("/settings")) {
    return <React.Fragment>
      <SettingsHeader />
      <div className="mt-6">
        {children}
      </div>
    </React.Fragment>
  }

  if (driverId && isLoadingDriver) {
    return (
      <React.Fragment>
        <div className="mt-6">
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
        <div className="mt-6">
          {children}
        </div>
      </React.Fragment>
    );
  }

  return (
    <React.Fragment>
      <Header driver={driver} />
      {children}
    </React.Fragment>
  );

};

export default ProfileLayout;