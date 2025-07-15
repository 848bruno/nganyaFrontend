// src/components/tables/delivery-columns.tsx
"use client";

import type { ColumnDef } from "@tanstack/react-table";
import  {type Delivery, DeliveryStatus } from "@/lib/types"; // Adjust path
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { format } from 'date-fns'; // Make sure you have date-fns installed: npm install date-fns

export const columns: ColumnDef<Delivery>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        ID
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="lowercase">{row.getValue("id").substring(0, 8)}...</div>,
  },
  {
    accessorKey: "itemType",
    header: "Item Type",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status: DeliveryStatus = row.getValue("status");
      let variant: 'default' | 'secondary' | 'outline' | 'destructive' = 'default'; // Shadcn variant
      let customClass = ''; // Custom tailwind classes for colors

      switch (status) {
        case DeliveryStatus.Pending:
          variant = 'secondary';
          customClass = 'bg-yellow-100 text-yellow-800 border-yellow-300';
          break;
        case DeliveryStatus.PickedUp:
          variant = 'outline';
          customClass = 'bg-blue-100 text-blue-800 border-blue-300';
          break;
        case DeliveryStatus.InTransit:
          variant = 'outline';
          customClass = 'bg-indigo-100 text-indigo-800 border-indigo-300';
          break;
        case DeliveryStatus.Delivered:
          variant = 'default';
          customClass = 'bg-green-100 text-green-800 border-green-300';
          break;
        case DeliveryStatus.Cancelled:
          variant = 'destructive';
          customClass = 'bg-red-100 text-red-800 border-red-300';
          break;
        default:
          variant = 'default';
          customClass = 'bg-gray-100 text-gray-800 border-gray-300';
      }

      return (
        <Badge variant={variant} className={`capitalize ${customClass}`}>
          {status.replace(/_/g, ' ')}
        </Badge>
      );
    },
  },
  {
    accessorKey: "cost",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Cost
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("cost"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "Ksh", // Kenya Shillings
      }).format(amount);

      return <div className="text-right font-medium">{formatted}</div>;
    },
  },
  {
    // Ensure your backend eagerly loads the 'user' relation for this to work
    accessorKey: "user.email",
    header: "Customer Email",
    cell: ({ row }) => {
      const user = row.original.user; // Access the full user object from the row data
      return user ? user.email : "N/A";
    },
  },
  {
    // Ensure your backend eagerly loads 'driver' and 'driver.user' relations for this to work
    accessorKey: "driver.user.firstName", // This will be the key to sort/filter on if needed
    header: "Driver",
    cell: ({ row }) => {
      const driver = row.original.driver;
      // Check if driver and driver.user exist before accessing properties
      return driver?.user ? `${driver.user.firstName} ${driver.user.lastName}` : "Unassigned";
    },
  },
  {
    // Ensure your backend eagerly loads the 'vehicle' relation for this to work
    accessorKey: "vehicle.licensePlate",
    header: "Vehicle",
    cell: ({ row }) => {
      const vehicle = row.original.vehicle;
      return vehicle ? vehicle.licensePlate : "N/A";
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Created At
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => format(new Date(row.getValue("createdAt")), 'MMM dd, yyyy HH:mm'),
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const delivery = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(delivery.id)}
            >
              Copy delivery ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View delivery details</DropdownMenuItem>
            {/* Add more actions here, e.g., "Edit delivery", "Cancel delivery" */}
            {/* Example: <DropdownMenuItem onClick={() => onEdit(delivery)}>Edit</DropdownMenuItem> */}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];