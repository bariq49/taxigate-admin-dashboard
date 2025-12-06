"use client";

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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "../data-table-column-header";
import { DataTableRowActions } from "../data-table-row-actions";
import { Booking } from "@/lib/types/booking.types";
import { format } from "date-fns";

export function getBookingColumns({
  onView,
  onAssignDriver,
  onUnassignDriver,
}: {
  onView?: (booking: Booking) => void;
  onAssignDriver?: (booking: Booking) => void;
  onUnassignDriver?: (booking: Booking) => void;
}): ColumnDef<Booking>[] {
  return [
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
        const status = row.original.status;
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
            {status.replace("_", " ")}
          </Badge>
        );
      },
    },
    {
      accessorKey: "driverId",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Driver" />
      ),
      cell: ({ row }) => {
        const driverId = row.original.driverId;
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
                ...(onAssignDriver && !hasDriver && isPending
                  ? [
                      {
                        label: "Assign Driver",
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

