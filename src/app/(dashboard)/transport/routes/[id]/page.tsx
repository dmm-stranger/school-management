"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, AlertCircle, Plus, Pencil, Trash2, ChevronUp, ChevronDown, Users } from "lucide-react";
import {
  useRoute,
  useCreateStop,
  useUpdateStop,
  useDeleteStop,
  useReorderStops,
  useUpdateRoute,
} from "@/features/transport/transport.queries";
import type { TransportStop } from "@/features/transport/transport.types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatMoney } from "@/lib/format";
import { messageFrom, fieldErrorsFrom } from "@/lib/form-errors";

function StopForm({ routeId, nextSequence, stop, onDone }: { routeId: string; nextSequence: number; stop: TransportStop | null; onDone: () => void }) {
  const create = useCreateStop();
  const update = useUpdateStop();
  const [form, setForm] = useState({
    name: stop?.name ?? "",
    pickupTime: stop?.pickupTime ?? "",
    landmark: stop?.landmark ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const pending = create.isPending || update.isPending;
  const apiError = create.error || update.error;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setErrors({ name: "Stop name is required." });
      return;
    }
    const payload = { name: form.name.trim(), pickupTime: form.pickupTime.trim() || undefined, landmark: form.landmark.trim() || undefined };
    try {
      if (stop) {
        await update.mutateAsync({ id: stop._id, payload });
      } else {
        await create.mutateAsync({ routeId, sequence: nextSequence, ...payload });
      }
      onDone();
    } catch (err) {
      setErrors(fieldErrorsFrom(err));
    }
  };

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <Input label="Stop name" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} error={errors.name} />
      <Input label="Pickup time (24h, optional)" placeholder="07:30" value={form.pickupTime} onChange={(e) => setForm((f) => ({ ...f, pickupTime: e.target.value }))} error={errors.pickupTime} />
      <Input label="Landmark (optional)" value={form.landmark} onChange={(e) => setForm((f) => ({ ...f, landmark: e.target.value }))} />
      {apiError && Object.keys(errors).length === 0 && (
        <p role="alert" className="text-sm text-danger">
          {messageFrom(apiError, "That didn't save. Please try again.")}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" isLoading={pending}>
          {stop ? "Save Changes" : "Add Stop"}
        </Button>
      </div>
    </form>
  );
}

export default function RouteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: route, isLoading, isError, error, refetch } = useRoute(id);
  const updateRoute = useUpdateRoute(id);
  const deleteStop = useDeleteStop();
  const reorderStops = useReorderStops();

  const [modal, setModal] = useState<"create" | TransportStop | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<TransportStop | null>(null);

  if (isLoading) return <div className="mx-auto h-72 max-w-2xl animate-pulse rounded-[var(--radius-card)] bg-[var(--color-surface-alt)]" />;

  if (isError || !route) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 py-16 text-center">
        <AlertCircle className="h-8 w-8 text-danger" />
        <p className="text-sm text-muted">{messageFrom(error, "Couldn't load this route.")}</p>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => refetch()}>
            Retry
          </Button>
          <Link href="/transport/routes">
            <Button variant="ghost">Back to routes</Button>
          </Link>
        </div>
      </div>
    );
  }

  const stops = [...route.stops].sort((a, b) => a.sequence - b.sequence);

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= stops.length) return;
    const swapped = [...stops];
    [swapped[index], swapped[target]] = [swapped[target], swapped[index]];
    reorderStops.mutate({ routeId: id, stops: swapped.map((s, i) => ({ id: s._id, sequence: i + 1 })) });
  };

  const handleDeleteStop = async (stop: TransportStop) => {
    try {
      await deleteStop.mutateAsync(stop._id);
      setConfirmDelete(null);
    } catch {
      // error shown via deleteStop.error below
    }
  };

  const vehicleNumber = typeof route.vehicleId === "string" ? route.vehicleId : route.vehicleId.vehicleNumber;
  const seatCapacity = typeof route.vehicleId === "string" ? undefined : route.vehicleId.seatCapacity;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5">
      <div>
        <Link href="/transport/routes" className="inline-flex items-center gap-1 text-sm text-muted hover:text-heading">
          <ArrowLeft className="h-4 w-4" /> Back to routes
        </Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-2xl font-semibold text-heading">{route.name}</h1>
          <StatusBadge status={route.status} />
        </div>
        <p className="mt-1 text-sm text-muted">
          {vehicleNumber}
          {seatCapacity ? ` · ${seatCapacity} seats` : ""} · {formatMoney(route.fee)} / {route.feeFrequency.toLowerCase()}
        </p>
      </div>

      <div className="flex items-center gap-2 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface px-4 py-3 text-sm">
        <Users className="h-4 w-4 text-muted" />
        <span className="text-heading">{route.assignedCount}</span>
        {seatCapacity && <span className="text-muted">of {seatCapacity} seats filled on this route&apos;s vehicle</span>}
        <span className="ml-auto">
          <Button
            variant="ghost"
            onClick={() => updateRoute.mutate({ status: route.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" })}
            isLoading={updateRoute.isPending}
          >
            {route.status === "ACTIVE" ? "Deactivate route" : "Reactivate route"}
          </Button>
        </span>
      </div>

      {(reorderStops.isError || deleteStop.isError) && (
        <p role="alert" className="rounded-[var(--radius-control)] bg-[var(--color-status-inactive-bg)] px-4 py-3 text-sm text-[var(--color-status-inactive-text)]">
          {messageFrom(reorderStops.error || deleteStop.error, "That didn't work. Please try again.")}
        </p>
      )}

      <section aria-labelledby="stops-heading" className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] p-4">
          <h2 id="stops-heading" className="text-base font-semibold text-heading">
            Stops ({stops.length})
          </h2>
          <Button onClick={() => setModal("create")}>
            <Plus className="h-4 w-4" /> Add Stop
          </Button>
        </div>

        {stops.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-muted">No stops yet. Add stops in pickup order.</p>
        ) : (
          <ol className="divide-y divide-[var(--color-border)]">
            {stops.map((stop, i) => (
              <li key={stop._id} className="flex items-center gap-3 px-4 py-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface-alt)] text-xs font-medium text-heading">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-heading">{stop.name}</p>
                  <p className="truncate text-xs text-muted">
                    {stop.pickupTime ? `${stop.pickupTime} · ` : ""}
                    {stop.landmark ?? ""}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    disabled={i === 0 || reorderStops.isPending}
                    onClick={() => move(i, -1)}
                    aria-label={`Move ${stop.name} up`}
                    className="rounded p-1.5 text-muted hover:bg-[var(--color-surface-alt)] hover:text-heading disabled:opacity-30"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button
                    disabled={i === stops.length - 1 || reorderStops.isPending}
                    onClick={() => move(i, 1)}
                    aria-label={`Move ${stop.name} down`}
                    className="rounded p-1.5 text-muted hover:bg-[var(--color-surface-alt)] hover:text-heading disabled:opacity-30"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  <button onClick={() => setModal(stop)} aria-label={`Edit ${stop.name}`} className="rounded p-1.5 text-muted hover:bg-[var(--color-surface-alt)] hover:text-heading">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => setConfirmDelete(stop)} aria-label={`Delete ${stop.name}`} className="rounded p-1.5 text-muted hover:bg-[var(--color-surface-alt)] hover:text-danger">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>

      <Modal open={modal !== null} title={modal === "create" ? "Add Stop" : "Edit Stop"} onClose={() => setModal(null)}>
        <StopForm routeId={id} nextSequence={stops.length + 1} stop={modal === "create" ? null : modal} onDone={() => setModal(null)} />
      </Modal>

      <Modal open={confirmDelete !== null} title={`Remove ${confirmDelete?.name ?? ""}?`} onClose={() => setConfirmDelete(null)}>
        <p className="text-sm text-muted">Blocked automatically while any student is assigned to this stop.</p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setConfirmDelete(null)}>
            Cancel
          </Button>
          <Button variant="danger" isLoading={deleteStop.isPending} onClick={() => confirmDelete && handleDeleteStop(confirmDelete)}>
            Remove
          </Button>
        </div>
      </Modal>
    </div>
  );
}
