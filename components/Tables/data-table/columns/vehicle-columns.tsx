"use client";

import { ColumnDef } from "@tanstack/react-table";
import {
  Calendar,
  Eye,
  CheckCircle2,
  XCircle,
  Car,
  User,
  Image as ImageIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "../data-table-column-header";
import { DataTableRowActions } from "../data-table-row-actions";
import { Vehicle } from "@/lib/types/vehicle.types";

export function getVehicleColumns({
  onView,
  onApprove,
  onReject,
}: {
  onView?: (vehicle: Vehicle) => void;
  onApprove?: (vehicle: Vehicle) => void;
  onReject?: (vehicle: Vehicle) => void;
}): ColumnDef<Vehicle>[] {
  return [
    {
      accessorKey: "image",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Vehicle" />
      ),
      cell: ({ row }) => {
        const vehicle = row.original;
        const vehicleName = `${vehicle.brand} ${vehicle.model}`;

        return (
          <div className="flex items-center gap-3 py-2">
            <div className="relative">
              {vehicle.image ? (
                <Avatar className="h-10 w-10 rounded-lg border bg-muted">
                  <AvatarImage
                    src={vehicle.image}
                    alt={vehicleName}
                    className="object-cover"
                  />
                  <AvatarFallback className="text-sm font-semibold">
                    <Car className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
              ) : (
                <div className="h-10 w-10 rounded-lg border bg-muted flex items-center justify-center">
                  <ImageIcon className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-semibold truncate max-w-[200px]">
                {vehicleName}
              </span>
              <span className="text-xs text-muted-foreground">
                {vehicle.type}
              </span>
            </div>
          </div>
        );
      },
      filterFn: (row, id, value) => {
        const vehicle = row.original;
        const vehicleName = `${vehicle.brand} ${vehicle.model}`.toLowerCase();
        const searchValue = (value as string)?.toLowerCase() || "";
        return (
          vehicleName.includes(searchValue) ||
          vehicle.type?.toLowerCase().includes(searchValue) ||
          vehicle.plateNumber?.toLowerCase().includes(searchValue)
        );
      },
    },
    {
      accessorKey: "driver",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Driver" />
      ),
      cell: ({ row }) => {
        const driver = row.original.driver;
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
          <div className="flex items-center gap-2 text-sm">
            <Avatar className="h-8 w-8 rounded-full border bg-muted">
              <AvatarFallback className="text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium truncate max-w-[150px]">
                {fullName}
              </span>
              <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                {driver.email}
              </span>
            </div>
          </div>
        );
      },
      filterFn: (row, id, value) => {
        const driver = row.original.driver;
        const fullName = driver.firstName || driver.lastName
          ? `${driver.firstName || ""} ${driver.lastName || ""}`.trim()
          : "N/A";
        const searchValue = (value as string)?.toLowerCase() || "";
        return (
          fullName.toLowerCase().includes(searchValue) ||
          driver.email?.toLowerCase().includes(searchValue) ||
          driver.phone?.toLowerCase().includes(searchValue)
        );
      },
    },
    {
      accessorKey: "brand",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Brand" />
      ),
      cell: ({ row }) => {
        return (
          <span className="text-sm font-medium">
            {row.original.brand}
          </span>
        );
      },
    },
    {
      accessorKey: "model",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Model" />
      ),
      cell: ({ row }) => {
        return (
          <span className="text-sm text-muted-foreground">
            {row.original.model}
          </span>
        );
      },
    },
    {
      accessorKey: "plateNumber",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Plate Number" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center gap-2 text-sm font-mono">
            <Car className="h-4 w-4 text-muted-foreground" />
            {row.original.plateNumber}
          </div>
        );
      },
    },
    {
      accessorKey: "color",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Color" />
      ),
      cell: ({ row }) => {
        const color = row.original.color;
        return (
          <div className="flex items-center gap-2 text-sm">
            <div
              className="h-4 w-4 rounded-full border"
              style={{
                backgroundColor: color?.toLowerCase() || "#gray",
              }}
            />
            <span className="capitalize">{color}</span>
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
          Approved: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
          Pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
          Rejected: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
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
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created" />
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
        const vehicle = row.original;
        const isPending = vehicle.status === "Pending";
        const isApproved = vehicle.status === "Approved";
        const isRejected = vehicle.status === "Rejected";

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
                        onClick: () => onView(vehicle),
                      },
                    ]
                  : []),
                ...(onApprove && isPending
                  ? [
                      {
                        label: "Approve",
                        icon: <CheckCircle2 className="h-4 w-4 text-green-600" />,
                        onClick: () => onApprove(vehicle),
                        successMessage: "Vehicle approved successfully.",
                      },
                    ]
                  : []),
                ...(onReject && (isPending || isApproved)
                  ? [
                      {
                        label: "Reject",
                        icon: <XCircle className="h-4 w-4 text-red-600" />,
                        destructive: true,
                        confirm: true,
                        onClick: () => onReject(vehicle),
                        successMessage: "Vehicle rejected successfully.",
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

export function getVehicleFilterColumns(vehicles: Vehicle[]) {
  const statuses = Array.from(
    new Set(vehicles.map((v) => v.status).filter(Boolean))
  );
  const types = Array.from(
    new Set(vehicles.map((v) => v.type).filter(Boolean))
  );
  const brands = Array.from(
    new Set(vehicles.map((v) => v.brand).filter(Boolean))
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
      column: "type",
      title: "Vehicle Type",
      multiple: true,
      options: types.map((type) => ({
        label: type,
        value: type,
      })),
    },
    {
      column: "brand",
      title: "Brand",
      multiple: true,
      options: brands.map((brand) => ({
        label: brand,
        value: brand,
      })),
    },
  ];
}

