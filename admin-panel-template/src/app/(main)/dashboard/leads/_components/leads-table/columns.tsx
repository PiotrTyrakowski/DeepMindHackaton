"use client";
"use no memo";

import type { ColumnDef } from "@tanstack/react-table";
import { EllipsisVertical, Facebook, Instagram, MapPin, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { CallButton } from "../call-button";
import { type ScraperLeadRow, STATUS_CONFIG } from "./schema";

export const scraperLeadsColumns: ColumnDef<ScraperLeadRow>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      </div>
    ),
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "Business",
    cell: ({ row }) => (
      <div>
        <p className="font-medium">{row.original.name}</p>
        <p className="text-muted-foreground text-xs">{row.original.category}</p>
      </div>
    ),
    enableHiding: false,
  },
  {
    id: "location",
    header: "Location",
    cell: ({ row }) => {
      const { city, state, location } = row.original;
      const display = city && state ? `${city}, ${state}` : location;
      return (
        <span className="flex items-center gap-1 text-sm">
          <MapPin className="size-3 shrink-0 text-muted-foreground" />
          {display}
        </span>
      );
    },
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) =>
      row.original.phone ? (
        <span className="font-mono text-sm tabular-nums">{row.original.phone}</span>
      ) : (
        <span className="text-muted-foreground text-xs">—</span>
      ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const cfg = STATUS_CONFIG[row.original.status] ?? {
        label: row.original.status,
        className: "bg-muted text-muted-foreground",
      };
      return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.className}`}>
          {cfg.label}
        </span>
      );
    },
  },
  {
    accessorKey: "rating",
    header: "Rating",
    cell: ({ row }) => {
      const { rating, reviews_count } = row.original;
      if (rating == null) return <span className="text-muted-foreground text-xs">—</span>;
      return (
        <span className="flex items-center gap-1 text-sm tabular-nums">
          <Star className="size-3 shrink-0 fill-yellow-400 text-yellow-400" />
          {rating.toFixed(1)}
          {reviews_count != null && (
            <span className="text-muted-foreground text-xs">({reviews_count})</span>
          )}
        </span>
      );
    },
  },
  {
    id: "social",
    header: "Social",
    cell: ({ row }) => {
      const { facebook, instagram } = row.original;
      return (
        <div className="flex items-center gap-1.5">
          {facebook ? (
            <a
              href={facebook.startsWith("http") ? facebook : `https://${facebook}`}
              target="_blank"
              rel="noopener noreferrer"
              title="Facebook"
            >
              <Facebook className="size-4 text-blue-600 hover:opacity-70 transition-opacity" />
            </a>
          ) : (
            <Facebook className="size-4 text-muted-foreground/25" />
          )}
          {instagram ? (
            <a
              href={instagram.startsWith("http") ? instagram : `https://${instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              title="Instagram"
            >
              <Instagram className="size-4 text-pink-500 hover:opacity-70 transition-opacity" />
            </a>
          ) : (
            <Instagram className="size-4 text-muted-foreground/25" />
          )}
        </div>
      );
    },
  },
  {
    id: "call",
    header: "Call",
    cell: ({ row }) => {
      const { phone, name, category } = row.original;
      if (!phone) return <span className="text-muted-foreground text-xs">—</span>;
      return (
        <CallButton
          phone={phone}
          businessName={name}
          businessType={category}
          variant="icon"
        />
      );
    },
    enableHiding: false,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="flex size-8 text-muted-foreground">
            <EllipsisVertical />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuGroup>
            <DropdownMenuItem>View Details</DropdownMenuItem>
            {row.original.google_maps_url && (
              <DropdownMenuItem asChild>
                <a href={row.original.google_maps_url} target="_blank" rel="noopener noreferrer">
                  Open in Maps
                </a>
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem variant="destructive">Remove</DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
    enableHiding: false,
  },
];
