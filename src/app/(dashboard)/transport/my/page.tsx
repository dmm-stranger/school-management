"use client";

import { Bus, MapPin, Clock, AlertCircle, Coins } from "lucide-react";
import { useMyAssignment } from "@/features/transport/transport.queries";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDate, formatMoney } from "@/lib/format";
import { messageFrom } from "@/lib/form-errors";

export default function MyTransportPage() {
  const { data, isLoading, isError, error, refetch } = useMyAssignment();

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold text-heading">My Transport</h1>
        <p className="mt-1 text-sm text-muted">Your assigned route, stop and transport fees.</p>
      </div>

      {isLoading && <div className="h-56 animate-pulse rounded-[var(--radius-card)] bg-[var(--color-surface-alt)]" />}

      {isError && (
        <div className="flex flex-col items-center gap-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface px-6 py-14 text-center">
          <AlertCircle className="h-8 w-8 text-danger" />
          <p className="text-sm text-muted">{messageFrom(error, "Couldn't load your transport details.")}</p>
          <Button variant="secondary" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      {!isLoading && !isError && !data?.assignment && (
        <div className="flex flex-col items-center gap-2 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface px-6 py-14 text-center">
          <Bus className="h-8 w-8 text-[var(--color-muted-2)]" />
          <p className="text-sm font-medium text-heading">No transport assigned</p>
          <p className="text-sm text-muted">Contact the school office to be added to a route.</p>
        </div>
      )}

      {!isLoading && !isError && data?.assignment && (
        <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-heading">
              {typeof data.assignment.routeId === "string" ? "Your Route" : data.assignment.routeId.name}
            </h2>
            <StatusBadge status={data.assignment.status} />
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-2">
              <Bus className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
              <div>
                <p className="text-xs uppercase tracking-wide text-muted">Vehicle</p>
                <p className="text-heading">{typeof data.assignment.vehicleId === "string" ? data.assignment.vehicleId : data.assignment.vehicleId.vehicleNumber}</p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
              <div>
                <p className="text-xs uppercase tracking-wide text-muted">Your stop</p>
                <p className="text-heading">{typeof data.assignment.stopId === "string" ? data.assignment.stopId : data.assignment.stopId.name}</p>
              </div>
            </div>
            {typeof data.assignment.stopId !== "string" && data.assignment.stopId.pickupTime && (
              <div className="flex items-start gap-2">
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-muted" />
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted">Pickup time</p>
                  <p className="text-heading">{data.assignment.stopId.pickupTime}</p>
                </div>
              </div>
            )}
            <div>
              <p className="text-xs uppercase tracking-wide text-muted">Since</p>
              <p className="text-heading">{formatDate(data.assignment.startDate)}</p>
            </div>
          </div>
        </div>
      )}

      {!isLoading && !isError && (data?.fees.length ?? 0) > 0 && (
        <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface">
          <div className="flex items-center gap-2 border-b border-[var(--color-border)] px-4 py-3">
            <Coins className="h-4 w-4 text-muted" />
            <h2 className="text-base font-semibold text-heading">Transport Fees</h2>
          </div>
          <ul className="divide-y divide-[var(--color-border)]">
            {data!.fees.map((f) => (
              <li key={f._id} className="flex items-center justify-between px-4 py-3 text-sm">
                <div>
                  <p className="text-heading">
                    {formatMoney(f.amount)} ({f.feeFrequency.toLowerCase()})
                  </p>
                  <p className="text-xs text-muted">{formatDate(f.createdAt)}</p>
                </div>
                <div className="text-right">
                  <StatusBadge status={f.status} />
                  {f.dueAmount > 0 && <p className="mt-1 text-xs text-muted">{formatMoney(f.dueAmount)} due</p>}
                </div>
              </li>
            ))}
          </ul>
          <p className="border-t border-[var(--color-border)] px-4 py-3 text-xs text-muted">Payments are collected at the school office.</p>
        </div>
      )}
    </div>
  );
}
