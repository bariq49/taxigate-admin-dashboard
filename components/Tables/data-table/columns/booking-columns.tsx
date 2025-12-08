"use client";

import { useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import {
  Calendar,
  Eye,
  User,
  MapPin,
  DollarSign,
  Car,
  CheckCircle2,
  XCircle,
  UserX,
  UserPlus,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "../data-table-column-header";
import { DataTableRowActions } from "../data-table-row-actions";
import { Booking } from "@/lib/types/booking.types";
import { format, formatDistanceToNow, isPast } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

/**
 * Expiration Timer Component
 * Shows countdown timer for bookings that are about to expire
 */
const ExpirationTimer = ({ expiresAt }: { expiresAt: string }) => {
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const updateTimer = () => {
      try {
        const expirationDate = new Date(expiresAt);
        const now = new Date();
        
        if (isPast(expirationDate)) {
          setIsExpired(true);
          setTimeRemaining("Expired");
          return;
        }

        const diff = expirationDate.getTime() - now.getTime();
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);

        if (minutes <= 0 && seconds <= 0) {
          setIsExpired(true);
          setTimeRemaining("Expired");
        } else if (minutes < 1) {
          setTimeRemaining(`${seconds}s`);
        } else {
          setTimeRemaining(`${minutes}m ${seconds}s`);
        }
      } catch (error) {
        console.error("Error calculating expiration:", error);
        setTimeRemaining("—");
      }
    };

    // Update immediately
    updateTimer();

    // Update every second
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  const expirationDate = new Date(expiresAt);
  const isUrgent = expirationDate.getTime() - Date.now() < 2 * 60 * 1000; // Less than 2 minutes

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className={`cursor-help ${
              isExpired
                ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                : isUrgent
                ? "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300 animate-pulse"
                : "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
            }`}
          >
            <Clock className="h-3 w-3 mr-1" />
            {timeRemaining}
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          <div className="space-y-1">
            <p className="font-semibold">
              {isExpired ? "Booking Expired" : "Expires In"}
            </p>
            <p className="text-xs text-muted-foreground">
              {isExpired
                ? "This booking has expired. No driver accepted it within 5 minutes."
                : `This booking will expire in ${timeRemaining} if no driver accepts it.`}
            </p>
            <p className="text-xs text-muted-foreground">
              Expires at: {format(expirationDate, "MMM dd, yyyy 'at' HH:mm:ss")}
            </p>
            {!isExpired && (
              <p className="text-xs text-muted-foreground mt-2">
                After expiration, admin can manually assign a driver.
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export function getBookingColumns({
  onView,
  onAssignDriver,
  onUnassignDriver,
  hideExpiration = false,
}: {
  onView?: (booking: Booking) => void;
  onAssignDriver?: (booking: Booking) => void;
  onUnassignDriver?: (booking: Booking) => void;
  hideExpiration?: boolean;
}): ColumnDef<Booking>[] {
  const columns: ColumnDef<Booking>[] = [
    {
      accessorKey: "user_name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Customer" />
      ),
      cell: ({ row }) => {
        const booking = row.original;
        return (
          <div className="flex flex-col">
            <span className="font-semibold truncate max-w-[200px]">
              {booking.user_name}
            </span>
            <span className="text-xs text-muted-foreground truncate max-w-[200px]">
              {booking.email}
            </span>
          </div>
        );
      },
      filterFn: (row, id, value) => {
        const booking = row.original;
        const searchValue = (value as string)?.toLowerCase() || "";
        return (
          booking.user_name?.toLowerCase().includes(searchValue) ||
          booking.email?.toLowerCase().includes(searchValue) ||
          booking.number?.toLowerCase().includes(searchValue) ||
          false
        );
      },
    },
    {
      accessorKey: "from_location",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="From" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2 text-sm max-w-[200px]">
            <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="truncate">{row.original.from_location}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "to_location",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="To" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2 text-sm max-w-[200px]">
            <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="truncate">{row.original.to_location}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "date_time",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Date & Time" />
      ),
      cell: ({ row }) => {
        const dateTime = row.original.date_time;
        try {
          const date = new Date(dateTime);
          return (
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div className="flex flex-col">
                <span>{format(date, "MMM dd, yyyy")}</span>
                <span className="text-xs text-muted-foreground">
                  {format(date, "HH:mm")}
                </span>
              </div>
            </div>
          );
        } catch {
          return <span className="text-sm text-muted-foreground">—</span>;
        }
      },
    },
    {
      accessorKey: "price",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Price" />
      ),
      cell: ({ row }) => {
        const price = parseFloat(row.original.price) || 0;
        return (
          <div className="flex items-center gap-2 text-sm font-medium">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            {price.toFixed(2)}
          </div>
        );
      },
    },
    {
      accessorKey: "distance",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Distance" />
      ),
      cell: ({ row }) => {
        const distance = row.original.distance;
        return (
          <div className="flex items-center gap-2 text-sm">
            <Car className="h-4 w-4 text-muted-foreground" />
            {distance ? `${distance} km` : "—"}
          </div>
        );
      },
      enableHiding: true,
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const booking = row.original;
        const status = booking.status || "pending"; // Default to "pending" if undefined
        
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
        
        return (
          <Badge
            variant="outline"
            className={`capitalize ${statusColors[status] || "bg-gray-100 text-gray-700"}`}
          >
            {status ? status.replace("_", " ") : "Pending"}
          </Badge>
        );
      },
    },
    ...(hideExpiration ? [] : [{
      accessorKey: "expiration",
      header: ({ column }: { column: any }) => (
        <DataTableColumnHeader column={column} title="Expiration" />
      ),
      cell: ({ row }: { row: any }) => {
        const booking = row.original;
        const status = booking.status;
        const isExpired = booking.isExpired === true;
        const expiresAt = booking.expiresAt;
        const expiredAt = booking.expiredAt;
        
        // Don't show expiration for completed bookings
        if (status === "completed") {
          return null;
        }
        
        // Show expiration info only for pending bookings or expired bookings
        if (status !== "pending" && !isExpired) {
          return <span className="text-sm text-muted-foreground">—</span>;
        }
        
        // Show expired badge
        if (isExpired) {
          return (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge
                    variant="outline"
                    className="bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300 cursor-help"
                  >
                    <Clock className="h-3 w-3 mr-1" />
                    Expired
                  </Badge>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <div className="space-y-1">
                    <p className="font-semibold">Booking Expired</p>
                    <p className="text-xs text-muted-foreground">
                      This booking expired after 5 minutes without driver acceptance.
                    </p>
                    {expiredAt && (
                      <p className="text-xs text-muted-foreground">
                        Expired at: {format(new Date(expiredAt), "MMM dd, yyyy 'at' HH:mm")}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      Admin can manually assign a driver to this booking.
                    </p>
                  </div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        }
        
        // Show expiration timer for pending bookings
        if (status === "pending" && expiresAt && !isExpired) {
          return <ExpirationTimer expiresAt={expiresAt} />;
        }
        
        return <span className="text-sm text-muted-foreground">—</span>;
      },
      enableHiding: true,
    }]),
    {
      accessorKey: "driverId",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Driver" />
      ),
      cell: ({ row }) => {
        const booking = row.original;
        const driverId = booking.driverId;
        const driver = booking.driver;
        
        // If driver details are available (from populated query), show them
        if (driver && driver.fullName) {
          return (
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-green-600" />
              <div className="flex flex-col">
                <span className="font-medium">{driver.fullName}</span>
                {driver.phone && (
                  <span className="text-xs text-muted-foreground">{driver.phone}</span>
                )}
                {driver.email && (
                  <span className="text-xs text-muted-foreground">{driver.email}</span>
                )}
              </div>
            </div>
          );
        }
        
        // Fallback to showing driver ID if driver details not available
        return (
          <div className="flex items-center gap-2 text-sm">
            {driverId ? (
              <>
                <User className="h-4 w-4 text-green-600" />
                <span className="text-muted-foreground">Assigned</span>
              </>
            ) : (
              <>
                <UserX className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Not Assigned</span>
              </>
            )}
          </div>
        );
      },
    },
    {
      id: "actions",
      header: ({ column }) => (
        <DataTableColumnHeader
          column={column}
          title="Actions"
          className="justify-end"
        />
      ),
      cell: ({ row }) => {
        const booking = row.original;
        const hasDriver = !!booking.driverId;
        const isPending = booking.status === "pending";
        const isExpired = booking.isExpired === true;
        // Allow assignment for: pending bookings without driver OR expired bookings
        const canAssign = (!hasDriver && isPending) || (isExpired && !hasDriver);

        return (
          <div className="flex justify-end">
            <DataTableRowActions
              row={row}
              actions={[
                ...(onView
                  ? [
                      {
                        label: "View Details",
                        icon: <Eye className="h-4 w-4" />,
                        onClick: () => onView(booking),
                      },
                    ]
                  : []),
                ...(onAssignDriver && canAssign
                  ? [
                      {
                        label: isExpired ? "Assign Driver (Expired)" : "Assign Driver",
                        icon: <UserPlus className="h-4 w-4 text-blue-600" />,
                        onClick: () => onAssignDriver(booking),
                        successMessage: "Driver assignment dialog opened.",
                      },
                    ]
                  : []),
                ...(onUnassignDriver && hasDriver
                  ? [
                      {
                        label: "Unassign Driver",
                        icon: <UserX className="h-4 w-4 text-red-600" />,
                        destructive: true,
                        confirm: true,
                        onClick: () => onUnassignDriver(booking),
                        successMessage: "Driver unassigned successfully.",
                      },
                    ]
                  : []),
              ]}
            />
          </div>
        );
      },
    },
  ];
  
  return columns;
}

export function getBookingFilterColumns(bookings: Booking[]) {
  const statuses = Array.from(
    new Set(bookings.map((b) => b.status).filter(Boolean))
  );

  return [
    {
      column: "status",
      title: "Status",
      multiple: true,
      options: statuses.map((status) => ({
        label: status.replace("_", " ").toUpperCase(),
        value: status,
      })),
    },
  ];
}

