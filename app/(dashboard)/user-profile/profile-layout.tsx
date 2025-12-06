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
        <Card className="mt-6 rounded-t-2xl">
          <CardContent className="p-0">
            {/* Cover Image Skeleton */}
            <div className="relative h-[200px] lg:h-[296px] rounded-t-2xl w-full overflow-hidden">
              <Skeleton className="h-full w-full rounded-t-2xl" />
              {/* Stats overlay skeleton */}
              <div className="absolute top-6 right-6 flex gap-4">
                <div className="text-right">
                  <Skeleton className="h-6 w-12 mb-1" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="text-right pl-4 border-l border-primary-foreground/20">
                  <Skeleton className="h-6 w-16 mb-1" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
              {/* Avatar and name skeleton */}
              <div className="absolute ltr:left-10 rtl:right-10 -bottom-2 lg:-bottom-8 flex items-center gap-4">
                <Skeleton className="h-20 w-20 lg:w-32 lg:h-32 rounded-full border-4 border-background" />
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-6 w-40 lg:w-48" />
                    <Skeleton className="h-5 w-5 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-32 lg:w-40" />
                </div>
              </div>
            </div>
            {/* Navigation tabs skeleton */}
            <div className="flex flex-wrap justify-end gap-4 lg:gap-8 pt-7 lg:pt-5 pb-4 px-6">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-5 w-20" />
              ))}
            </div>
          </CardContent>
        </Card>
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