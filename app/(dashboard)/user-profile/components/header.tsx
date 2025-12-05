"use client";
import { Breadcrumbs, BreadcrumbItem } from "@/components/ui/breadcrumbs";
import { Card, CardContent } from "@/components/ui/card";
import { Home } from "lucide-react";
import coverImage from "@/public/images/all-img/user-cover.png"
import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { Fragment } from "react";
import { DriverDetails } from "@/lib/types/driver.types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, BadgeCheck } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface HeaderProps {
  driver?: DriverDetails;
}

const Header = ({ driver }: HeaderProps) => {
  const location = usePathname();
  
  const fullName = driver 
    ? `${driver.firstName || ""} ${driver.lastName || ""}`.trim() || driver.email
    : "Jennyfer Franking";
  
  const initials = driver
    ? fullName
        .split(" ")
        .map((n) => n[0]?.toUpperCase())
        .join("")
        .slice(0, 2)
    : "JF";
  return (
    <Fragment>
      <Breadcrumbs>
        <BreadcrumbItem>
          <Home className="h-4 w-4" />
        </BreadcrumbItem>
        <BreadcrumbItem>Pages</BreadcrumbItem>
        <BreadcrumbItem>Utility</BreadcrumbItem>
        <BreadcrumbItem>User Profile</BreadcrumbItem>
      </Breadcrumbs>
      <Card className="mt-6 rounded-t-2xl ">
        <CardContent className="p-0">
          <div className="relative h-[200px] lg:h-[296px] rounded-t-2xl w-full object-cover bg-no-repeat"
            style={{ backgroundImage: `url(${coverImage.src})` }}
          >
            <div className="flex justify-end pt-6 pr-6  divide-x divide-primary-foreground  gap-4">
              <div>
                <div className="text-xl font-semibold text-primary-foreground">
                  {driver?.stats?.completedRides || 0}
                </div>
                <div className="text-sm text-default-200">Completed Rides</div>
              </div>
              <div className="pl-4">
                <div className="text-xl font-semibold text-primary-foreground">
                  {driver?.walletBalance || 0} {driver?.currency || "EUR"}
                </div>
                <div className="text-sm text-default-200">Wallet Balance</div>
              </div>
            </div>
            <div className="flex items-center gap-4 absolute ltr:left-10 rtl:right-10 -bottom-2 lg:-bottom-8">
              <div className="relative">
                <Avatar className="h-20 w-20 lg:w-32 lg:h-32 rounded-full border-4 border-background shadow-lg">
                  {driver?.profilePicture ? (
                    <AvatarImage
                      src={driver.profilePicture}
                      alt={fullName}
                      className="object-cover"
                    />
                  ) : null}
                  <AvatarFallback className="text-2xl lg:text-4xl font-semibold bg-primary text-primary-foreground">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                {driver?.isOnline && (
                  <div className="absolute bottom-4 right-4" style={{ transform: 'translate(30%, 30%)' }}>
                    <div className="relative">
                      {/* Outer pulsing ring */}
                      <div className="absolute inset-0 h-3 w-3 lg:h-4 lg:w-4 bg-green-500 rounded-full animate-ping opacity-75"></div>
                      {/* Inner solid dot - positioned on the border */}
                      <div className="relative h-3 w-3 lg:h-4 lg:w-4 bg-green-500 border-2 border-background rounded-full shadow-md"></div>
                    </div>
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2.5 flex-wrap">
                  <div className="text-xl lg:text-2xl font-semibold text-primary-foreground">
                    {fullName}
                  </div>
                  {driver && driver.isVerified && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="cursor-pointer">
                            <BadgeCheck 
                              className="h-4 w-4 lg:h-5 lg:w-5 text-white flex-shrink-0" 
                              strokeWidth={2.5}
                            />
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Account is verified</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
                <div className="text-xs lg:text-sm font-medium text-default-100 dark:text-default-900 mt-1">
                  {driver?.email || "Data Analytics"}
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap justify-end gap-4 lg:gap-8 pt-7 lg:pt-5 pb-4 px-6">
            {
              [
                {
                  title: "Overview",
                  link: driver ? `/user-profile/${driver.id}` : "/user-profile",
                  exact: true
                },
                {
                  title: "Documents",
                  link: driver ? `/user-profile/${driver.id}/documents` : "/user-profile/documents",
                  exact: false
                },
                {
                  title: "Activity",
                  link: driver ? `/user-profile/${driver.id}/activity` : "/user-profile/activity",
                  exact: false
                },
                {
                  title: "Vehicles",
                  link: driver ? `/user-profile/${driver.id}/vehicles` : "/user-profile/vehicles",
                  exact: false
                },
                {
                  title: "Settings",
                  link: driver ? `/user-profile/${driver.id}/settings` : "/user-profile/settings",
                  exact: false
                },
              ].map((item, index) => {
                let isActive = false;
                
                if (item.exact) {
                  // For Overview, match exactly - must be the exact path
                  isActive = location === item.link;
                } else {
                  // For other pages (Documents, Activity, Settings), match exactly
                  // or if the path starts with the link (for nested routes)
                  isActive = location === item.link || 
                    (Boolean(location && item.link) && location.startsWith(item.link));
                }
                
                return (
                  <Link
                    key={`user-profile-link-${index}`}
                    href={item.link}
                    className={cn("text-sm font-semibold text-default-500 hover:text-primary relative lg:before:absolute before:-bottom-4 before:left-0 before:w-full lg:before:h-[1px] before:bg-transparent", {
                      "text-primary lg:before:bg-primary": isActive
                    })}
                  >{item.title}</Link>
                );
              })
            }
          </div>

        </CardContent>
      </Card>
    </Fragment>
  );
};

export default Header;