"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { useVehicle, useUpdateVehicle, useDrivers } from "@/features/transport/transport.queries";
import type { VehicleStatus } from "@/features/transport/transport.types";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { messageFrom } from "@/lib/form-errors";

export default function VehicleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: vehicle, isLoading, isError, error, refetch } = useVehicle(id);
  const { data: drivers } = useDrivers({ status: "ACTIVE" });
  const updateVehicle = useUpdateVehicle();
  const [savedField, setSavedField] = useState<string | null>(null);

  if (isLoading) return <div className="mx-auto h-56 max-w-2xl animate-pulse rounded-[var(--radius-card)] bg-[var(--color-surface-alt)]" />;

  if (isError || !vehicle) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 py-16 text-center">
        <AlertCircle className="h-8 w-8 text-danger" />
        <p className="text-sm text-muted">{messageFrom(error, "Couldn't load this vehicle.")}</p>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => refetch()}>
            Retry
          </Button>
          <Link href="/transport">
            <Button variant="ghost">Back to fleet</Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentDriverId = typeof vehicle.driverId === "string" ? vehicle.driverId : (vehicle.driverId?._id ?? "");

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5">
      <div>
        <Link href="/transport" className="inline-flex items-center gap-1 text-sm text-muted hover:text-heading">
          <ArrowLeft className="h-4 w-4" /> Back to fleet
        </Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold text-heading">{vehicle.vehicleNumber}</h1>
          <StatusBadge status={vehicle.status} />
        </div>
      </div>

      {updateVehicle.isError && (
        <p role="alert" className="rounded-[var(--radius-control)] bg-[var(--color-status-inactive-bg)] px-4 py-3 text-sm text-[var(--color-status-inactive-text)]">
          {messageFrom(updateVehicle.error, "That didn't save. Please try again.")}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface p-6 sm:grid-cols-2">
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted">Type</dt>
          <dd className="mt-0.5 text-heading">{vehicle.type}</dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-muted">Seat capacity</dt>
          <dd className="mt-0.5 text-heading">{vehicle.seatCapacity}</dd>
        </div>
        <div>
          <Select
            label="Driver"
            value={currentDriverId}
            placeholder="Unassigned"
            onChange={(e) => {
              updateVehicle.mutate({ id, payload: { driverId: e.target.value || null } });
              setSavedField("driver");
            }}
            options={(drivers?.data ?? []).map((d) => ({ value: d._id, label: `${d.name} · ${d.phone}` }))}
          />
          {savedField === "driver" && updateVehicle.isSuccess && <p className="mt-1 text-xs text-[var(--color-status-active-text)]">Saved</p>}
        </div>
        <div>
          <Select
            label="Status"
            value={vehicle.status}
            onChange={(e) => {
              updateVehicle.mutate({ id, payload: { status: e.target.value as VehicleStatus } });
              setSavedField("status");
            }}
            options={[
              { value: "ACTIVE", label: "Active" },
              { value: "MAINTENANCE", label: "Maintenance" },
              { value: "INACTIVE", label: "Inactive" },
            ]}
          />
        </div>
        {vehicle.notes && (
          <div className="sm:col-span-2">
            <dt className="text-xs uppercase tracking-wide text-muted">Notes</dt>
            <dd className="mt-0.5 text-heading">{vehicle.notes}</dd>
          </div>
        )}
      </div>

      <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface p-4 text-sm text-muted">
        To put this vehicle into service, create a{" "}
        <Link href="/transport/routes" className="font-medium text-primary hover:underline">
          route
        </Link>{" "}
        that uses it, then assign students from{" "}
        <Link href="/transport/assignments" className="font-medium text-primary hover:underline">
          Assign Students
        </Link>
        .
      </div>
    </div>
  );
}
