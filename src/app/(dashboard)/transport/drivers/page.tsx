"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, Plus, Pencil, Trash2, AlertCircle } from "lucide-react";
import { useDrivers, useCreateDriver, useUpdateDriver, useDeleteDriver } from "@/features/transport/transport.queries";
import type { Driver } from "@/features/transport/transport.types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { messageFrom, fieldErrorsFrom } from "@/lib/form-errors";
import { formatDate } from "@/lib/format";

function DriverForm({ driver, onDone }: { driver: Driver | null; onDone: () => void }) {
  const create = useCreateDriver();
  const update = useUpdateDriver();
  const [form, setForm] = useState({
    name: driver?.name ?? "",
    phone: driver?.phone ?? "",
    licenseNumber: driver?.licenseNumber ?? "",
    licenseExpiry: driver?.licenseExpiry ? driver.licenseExpiry.slice(0, 10) : "",
    address: driver?.address ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const pending = create.isPending || update.isPending;
  const apiError = create.error || update.error;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Name is required.";
    if (!form.phone.trim()) errs.phone = "Phone is required.";
    if (!form.licenseNumber.trim()) errs.licenseNumber = "License number is required.";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const payload = {
      name: form.name.trim(),
      phone: form.phone.trim(),
      licenseNumber: form.licenseNumber.trim(),
      licenseExpiry: form.licenseExpiry || undefined,
      address: form.address.trim() || undefined,
    };
    try {
      if (driver) {
        await update.mutateAsync({ id: driver._id, payload });
      } else {
        await create.mutateAsync(payload);
      }
      onDone();
    } catch (err) {
      setErrors(fieldErrorsFrom(err));
    }
  };

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <Input label="Name" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} error={errors.name} />
      <Input label="Phone" required value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} error={errors.phone} />
      <Input
        label="License number"
        required
        value={form.licenseNumber}
        onChange={(e) => setForm((f) => ({ ...f, licenseNumber: e.target.value }))}
        error={errors.licenseNumber}
      />
      <Input
        label="License expiry"
        type="date"
        value={form.licenseExpiry}
        onChange={(e) => setForm((f) => ({ ...f, licenseExpiry: e.target.value }))}
      />
      <Input label="Address" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
      {apiError && Object.keys(errors).length === 0 && (
        <p role="alert" className="text-sm text-danger">
          {messageFrom(apiError, "That didn't work. Please try again.")}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" isLoading={pending}>
          {driver ? "Save Changes" : "Add Driver"}
        </Button>
      </div>
    </form>
  );
}

export default function DriversPage() {
  const { data, isLoading, isError, error, refetch } = useDrivers();
  const deleteDriver = useDeleteDriver();
  const [modal, setModal] = useState<"create" | Driver | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Driver | null>(null);

  const handleDelete = async (d: Driver) => {
    try {
      await deleteDriver.mutateAsync(d._id);
      setConfirmDelete(null);
    } catch {
      // error banner stays visible via deleteDriver.error
    }
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-5">
      <div>
        <Link href="/transport" className="inline-flex items-center gap-1 text-sm text-muted hover:text-heading">
          <ArrowLeft className="h-4 w-4" /> Back to fleet
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-heading">Drivers</h1>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => setModal("create")}>
          <Plus className="h-4 w-4" /> Add Driver
        </Button>
      </div>

      {deleteDriver.isError && (
        <p role="alert" className="rounded-[var(--radius-control)] bg-[var(--color-status-inactive-bg)] px-4 py-3 text-sm text-[var(--color-status-inactive-text)]">
          {messageFrom(deleteDriver.error, "We couldn't delete this driver.")}
        </p>
      )}

      <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface">
        {isLoading && (
          <div className="divide-y divide-[var(--color-border)]">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse bg-[var(--color-surface-alt)]" />
            ))}
          </div>
        )}

        {isError && (
          <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
            <AlertCircle className="h-8 w-8 text-danger" />
            <p className="text-sm text-muted">{messageFrom(error, "Couldn't load drivers.")}</p>
            <Button variant="secondary" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        )}

        {!isLoading && !isError && (data?.data.length ?? 0) === 0 && (
          <p className="px-6 py-12 text-center text-sm text-muted">No drivers yet. Add the first one above.</p>
        )}

        {!isLoading && !isError && (data?.data.length ?? 0) > 0 && (
          <ul className="divide-y divide-[var(--color-border)]">
            {data!.data.map((d) => (
              <li key={d._id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate font-medium text-heading">{d.name}</p>
                  <p className="truncate text-xs text-muted">
                    {d.phone} · License {d.licenseNumber}
                    {d.licenseExpiry ? ` · expires ${formatDate(d.licenseExpiry)}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <StatusBadge status={d.status} />
                  <button onClick={() => setModal(d)} aria-label={`Edit ${d.name}`} className="rounded p-1.5 text-muted hover:bg-[var(--color-surface-alt)] hover:text-heading">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => setConfirmDelete(d)} aria-label={`Delete ${d.name}`} className="rounded p-1.5 text-muted hover:bg-[var(--color-surface-alt)] hover:text-danger">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Modal open={modal !== null} title={modal === "create" ? "Add Driver" : "Edit Driver"} onClose={() => setModal(null)}>
        <DriverForm driver={modal === "create" ? null : modal} onDone={() => setModal(null)} />
      </Modal>

      <Modal open={confirmDelete !== null} title={`Delete ${confirmDelete?.name ?? ""}?`} onClose={() => setConfirmDelete(null)}>
        <p className="text-sm text-muted">This can&apos;t be undone. Blocked automatically while assigned to an active vehicle.</p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setConfirmDelete(null)}>
            Cancel
          </Button>
          <Button variant="danger" isLoading={deleteDriver.isPending} onClick={() => confirmDelete && handleDelete(confirmDelete)}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
