"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  User,
  Calendar,
  Eye,
  Trash2,
  Phone,
  Mail,
  Wallet,
  Car,
  CheckCircle2,
  XCircle,
  Circle,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "../data-table-column-header";
import { DataTableRowActions } from "../data-table-row-actions";
import { Driver } from "@/lib/types/driver.types";

export function getDriverColumns({
  onView,
  onDelete,
}: {
  onView?: (driver: Driver) => void;
  onDelete?: (driver: Driver) => void;
}): ColumnDef<Driver>[] {
  return [
    {
      accessorKey: "profilePicture",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Driver" />
      ),
      cell: ({ row }) => {
        const driver = row.original;
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

        return (
          <div className="flex items-center gap-3 py-2">
            <Avatar className="h-10 w-10 rounded-full border bg-muted">
              {driver.profilePicture ? (
                <AvatarImage
                  src={driver.profilePicture}
                  alt={fullName}
                />
              ) : null}
              <AvatarFallback className="text-sm font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-semibold truncate max-w-[200px]">
                {fullName}
              </span>
              <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                {driver.email}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "phone",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Phone" />
      ),
      cell: ({ row }) => {
        const phone = row.original.phone;
        return (
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground" />
            {phone || "—"}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = row.original.status;
        const statusColors: Record<string, string> = {
          Approved: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
          Pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
          Rejected: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
          Suspended: "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300",
        };
        return (
          <Badge
            variant="outline"
            className={`capitalize ${statusColors[status] || "bg-gray-100 text-gray-700"}`}
          >
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: "isVerified",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Verified" />
      ),
      cell: ({ row }) => {
        const isVerified = row.original.isVerified;
        return (
          <div className="flex items-center gap-2">
            {isVerified ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4 text-gray-400" />
            )}
            <span className="text-sm">{isVerified ? "Verified" : "Not Verified"}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "isOnline",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Online" />
      ),
      cell: ({ row }) => {
        const isOnline = row.original.isOnline;
        return (
          <div className="flex items-center gap-2">
            <Circle
              className={`h-3 w-3 ${isOnline ? "fill-green-500 text-green-500" : "fill-gray-400 text-gray-400"}`}
            />
            <span className="text-sm">{isOnline ? "Online" : "Offline"}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "paidStatus",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Payment" />
      ),
      cell: ({ row }) => {
        const paidStatus = row.original.paidStatus;
        return (
          <Badge
            variant="outline"
            className={
              paidStatus === "Paid"
                ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                : "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
            }
          >
            {paidStatus}
          </Badge>
        );
      },
    },
    {
      accessorKey: "walletBalance",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Wallet" />
      ),
      cell: ({ row }) => {
        const balance = row.original.walletBalance;
        return (
          <div className="flex items-center gap-2 text-sm font-medium">
            <Wallet className="h-4 w-4 text-muted-foreground" />
            ${balance.toFixed(2)}
          </div>
        );
      },
    },
    {
      accessorKey: "vehicleCount",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Vehicles" />
      ),
      cell: ({ row }) => {
        const count = row.original.vehicleCount;
        return (
          <div className="flex items-center gap-2 text-sm">
            <Car className="h-4 w-4 text-muted-foreground" />
            {count}
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Joined" />
      ),
      cell: ({ row }) => {
        const createdAt = row.original.createdAt;
        return (
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            {createdAt ? new Date(createdAt).toLocaleDateString() : "—"}
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
        const driver = row.original;

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
                        onClick: () => onView(driver),
                      },
                    ]
                  : []),
                ...(onDelete
                  ? [
                      {
                        label: "Delete",
                        icon: <Trash2 className="h-4 w-4 text-destructive" />,
                        destructive: true,
                        confirm: true,
                        successMessage: "Driver deleted successfully.",
                        onClick: () => onDelete(driver),
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

export function getDriverFilterColumns(drivers: Driver[]) {
  const statuses = Array.from(
    new Set(drivers.map((d) => d.status).filter(Boolean))
  );
  const paidStatuses = Array.from(
    new Set(drivers.map((d) => d.paidStatus).filter(Boolean))
  );

  return [
    {
      column: "status",
      title: "Status",
      multiple: true,
      options: statuses.map((status) => ({
        label: status,
        value: status,
      })),
    },
    {
      column: "paidStatus",
      title: "Payment Status",
      multiple: true,
      options: paidStatuses.map((status) => ({
        label: status,
        value: status,
      })),
    },
    {
      column: "isVerified",
      title: "Verification",
      multiple: false,
      options: [
        { label: "Verified", value: "true" },
        { label: "Not Verified", value: "false" },
      ],
    },
    {
      column: "isOnline",
      title: "Online Status",
      multiple: false,
      options: [
        { label: "Online", value: "true" },
        { label: "Offline", value: "false" },
      ],
    },
  ];
}


