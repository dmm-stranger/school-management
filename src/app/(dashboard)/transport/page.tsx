"use client";

import { useState } from "react";
import Link from "next/link";
import { Bus, Users, MapPinned, Coins, Plus, AlertCircle, ListTree } from "lucide-react";
import { useVehicles, useTransportSummary } from "@/features/transport/transport.queries";
import { usePermission } from "@/hooks/usePermission";
import { useDebounce } from "@/hooks/useDebounce";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatMoney } from "@/lib/format";
import { messageFrom } from "@/lib/form-errors";
import type { VehicleDriverRef } from "@/features/transport/transport.types";

const driverName = (ref: VehicleDriverRef | string | null) => (ref && typeof ref !== "string" ? ref.name : "Unassigned");

function KpiStrip() {
  const { data, isLoading } = useTransportSummary();
  const cards = [
    { label: "Active vehicles", value: data?.activeVehicles, icon: Bus },
    { label: "Seats filled", value: data ? `${data.activeAssignments} / ${data.totalSeats}` : undefined, icon: Users },
    { label: "Active routes", value: data?.routeCount, icon: MapPinned, href: "/transport/routes" },
    { label: "Unpaid fees", value: data ? formatMoney(data.pendingFeeTotal) : undefined, icon: Coins, href: "/transport/fees" },
  ];
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map(({ label, value, icon: Icon, href }) => {
        const body = (
          <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface p-4">
            <div className="flex items-center justify-between text-sm text-muted">
              {label}
              <Icon className="h-4 w-4 text-primary" />
            </div>
            <p className="mt-2 text-2xl font-semibold text-heading">
              {isLoading ? <span className="inline-block h-7 w-16 animate-pulse rounded bg-[var(--color-surface-alt)]" /> : (value ?? "—")}
            </p>
          </div>
        );
        return href ? (
          <Link key={label} href={href} className="hover:opacity-90">
            {body}
          </Link>
        ) : (
          <div key={label}>{body}</div>
        );
      })}
    </div>
  );
}

export default function TransportPage() {
  const { can } = usePermission();
  const isManager = can("transport:create");

  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search);
  const { data, isLoading, isError, error, refetch } = useVehicles({ search: debouncedSearch || undefined });
  const vehicles = data?.data ?? [];

  if (!isManager) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 py-16 text-center">
        <Bus className="h-8 w-8 text-muted" />
        <p className="text-sm font-medium text-heading">Transport management is for staff</p>
        <p className="text-sm text-muted">You can see your own route and stop instead.</p>
        <Link href="/transport/my">
          <Button>Go to My Transport</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-heading">Transport</h1>
          <p className="mt-1 text-sm text-muted">Vehicles, drivers and the fleet at a glance.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/transport/drivers">
            <Button variant="ghost">Drivers</Button>
          </Link>
          <Link href="/transport/routes">
            <Button variant="ghost">
              <ListTree className="h-4 w-4" /> Routes
            </Button>
          </Link>
          <Link href="/transport/assignments">
            <Button variant="secondary">Assign Students</Button>
          </Link>
          <Link href="/transport/vehicles/new">
            <Button>
              <Plus className="h-4 w-4" /> Add Vehicle
            </Button>
          </Link>
        </div>
      </div>

      <KpiStrip />

      <div className="max-w-md">
        <label htmlFor="vehicle-search" className="sr-only">
          Search vehicles
        </label>
        <input
          id="vehicle-search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by vehicle number…"
          className="w-full rounded-[var(--radius-control)] border border-[var(--color-border)] bg-surface px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-[var(--color-primary-light)]"
        />
      </div>

      <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface">
        {isLoading && (
          <div className="divide-y divide-[var(--color-border)]">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse bg-[var(--color-surface-alt)]" />
            ))}
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
            <AlertCircle className="h-8 w-8 text-danger" />
            <p className="text-sm text-muted">{messageFrom(error, "Couldn't load vehicles.")}</p>
            <Button variant="secondary" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        )}

        {!isLoading && !isError && vehicles.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-6 py-14 text-center">
            <Bus className="h-8 w-8 text-[var(--color-muted-2)]" />
            <p className="text-sm font-medium text-heading">No vehicles yet</p>
            <p className="text-sm text-muted">Add your first vehicle to start building routes.</p>
          </div>
        )}

        {!isLoading && !isError && vehicles.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] text-left text-xs font-medium uppercase tracking-wide text-muted">
                  <th className="px-4 py-3">Vehicle</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Capacity</th>
                  <th className="px-4 py-3">Driver</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {vehicles.map((v) => (
                  <tr key={v._id} className="hover:bg-[var(--color-surface-alt)]">
                    <td className="px-4 py-3">
                      <Link href={`/transport/vehicles/${v._id}`} className="font-medium text-heading hover:text-primary">
                        {v.vehicleNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted">{v.type}</td>
                    <td className="px-4 py-3 text-muted">{v.seatCapacity} seats</td>
                    <td className="px-4 py-3 text-muted">{driverName(v.driverId)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={v.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
