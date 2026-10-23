"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, AlertCircle, MapPinned } from "lucide-react";
import { useRoutes, useCreateRoute, useVehicles } from "@/features/transport/transport.queries";
import type { FeeFrequency, RouteVehicleRef } from "@/features/transport/transport.types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatMoney } from "@/lib/format";
import { messageFrom, fieldErrorsFrom } from "@/lib/form-errors";

const vehicleLabel = (ref: RouteVehicleRef | string) => (typeof ref === "string" ? ref : `${ref.vehicleNumber} (${ref.seatCapacity} seats)`);

function CreateRouteForm({ onDone }: { onDone: (routeId: string) => void }) {
  const createRoute = useCreateRoute();
  const { data: vehicles } = useVehicles({ status: "ACTIVE" });
  const [form, setForm] = useState({ name: "", vehicleId: "", fee: "", feeFrequency: "MONTHLY" as FeeFrequency, description: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Route name is required.";
    if (!form.vehicleId) errs.vehicleId = "Select a vehicle.";
    const fee = Number(form.fee);
    if (!Number.isFinite(fee) || fee < 0) errs.fee = "Enter a valid fee amount.";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    try {
      const route = await createRoute.mutateAsync({
        name: form.name.trim(),
        vehicleId: form.vehicleId,
        fee,
        feeFrequency: form.feeFrequency,
        description: form.description.trim() || undefined,
      });
      onDone(route._id);
    } catch (err) {
      setErrors(fieldErrorsFrom(err));
    }
  };

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <Input label="Route name" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} error={errors.name} placeholder="Route A - Uttara" />
      <Select
        label="Vehicle"
        required
        placeholder="Select vehicle"
        value={form.vehicleId}
        onChange={(e) => setForm((f) => ({ ...f, vehicleId: e.target.value }))}
        error={errors.vehicleId}
        options={(vehicles?.data ?? []).map((v) => ({ value: v._id, label: `${v.vehicleNumber} · ${v.seatCapacity} seats` }))}
      />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Fee" type="number" min={0} required value={form.fee} onChange={(e) => setForm((f) => ({ ...f, fee: e.target.value }))} error={errors.fee} />
        <Select
          label="Frequency"
          value={form.feeFrequency}
          onChange={(e) => setForm((f) => ({ ...f, feeFrequency: e.target.value as FeeFrequency }))}
          options={[
            { value: "MONTHLY", label: "Monthly" },
            { value: "TERM", label: "Per term" },
            { value: "ANNUAL", label: "Annual" },
          ]}
        />
      </div>
      <Input label="Description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
      {createRoute.isError && Object.keys(errors).length === 0 && (
        <p role="alert" className="text-sm text-danger">
          {messageFrom(createRoute.error, "We couldn't create this route. Please try again.")}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={() => onDone("")}>
          Cancel
        </Button>
        <Button type="submit" isLoading={createRoute.isPending}>
          Create Route
        </Button>
      </div>
    </form>
  );
}

export default function RoutesPage() {
  const router = useRouter();
  const { data, isLoading, isError, error, refetch } = useRoutes();
  const [creating, setCreating] = useState(false);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <div>
        <Link href="/transport" className="inline-flex items-center gap-1 text-sm text-muted hover:text-heading">
          <ArrowLeft className="h-4 w-4" /> Back to fleet
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-heading">Routes</h1>
        <p className="mt-1 text-sm text-muted">Each route runs on one vehicle and carries an ordered list of stops.</p>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" /> Create Route
        </Button>
      </div>

      <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface">
        {isLoading && (
          <div className="divide-y divide-[var(--color-border)]">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 animate-pulse bg-[var(--color-surface-alt)]" />
            ))}
          </div>
        )}
        {isError && (
          <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
            <AlertCircle className="h-8 w-8 text-danger" />
            <p className="text-sm text-muted">{messageFrom(error, "Couldn't load routes.")}</p>
            <Button variant="secondary" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        )}
        {!isLoading && !isError && (data?.data.length ?? 0) === 0 && (
          <div className="flex flex-col items-center gap-2 px-6 py-14 text-center">
            <MapPinned className="h-8 w-8 text-[var(--color-muted-2)]" />
            <p className="text-sm font-medium text-heading">No routes yet</p>
            <p className="text-sm text-muted">Create a route, add its stops, then assign students.</p>
          </div>
        )}
        {!isLoading && !isError && (data?.data.length ?? 0) > 0 && (
          <ul className="divide-y divide-[var(--color-border)]">
            {data!.data.map((r) => (
              <li key={r._id}>
                <Link href={`/transport/routes/${r._id}`} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-[var(--color-surface-alt)]">
                  <div className="min-w-0">
                    <p className="font-medium text-heading">{r.name}</p>
                    <p className="text-xs text-muted">
                      {vehicleLabel(r.vehicleId)} · {formatMoney(r.fee)} / {r.feeFrequency.toLowerCase()}
                    </p>
                  </div>
                  <StatusBadge status={r.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Modal open={creating} title="Create Route" onClose={() => setCreating(false)}>
        <CreateRouteForm
          onDone={(routeId) => {
            setCreating(false);
            if (routeId) router.push(`/transport/routes/${routeId}`);
          }}
        />
      </Modal>
    </div>
  );
}

