"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useCreateVehicle, useDrivers } from "@/features/transport/transport.queries";
import type { VehicleType } from "@/features/transport/transport.types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { fieldErrorsFrom, messageFrom } from "@/lib/form-errors";

const VEHICLE_TYPES: VehicleType[] = ["BUS", "MICROBUS", "VAN", "CAR"];

export default function NewVehiclePage() {
  const router = useRouter();
  const createVehicle = useCreateVehicle();
  const { data: drivers } = useDrivers({ status: "ACTIVE" });

  const [form, setForm] = useState({ vehicleNumber: "", type: "BUS" as VehicleType, seatCapacity: "", driverId: "", notes: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (key: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.vehicleNumber.trim()) errs.vehicleNumber = "Vehicle number is required.";
    const capacity = Number(form.seatCapacity);
    if (!Number.isInteger(capacity) || capacity < 1) errs.seatCapacity = "Enter a whole number of at least 1.";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    try {
      const vehicle = await createVehicle.mutateAsync({
        vehicleNumber: form.vehicleNumber.trim(),
        type: form.type,
        seatCapacity: capacity,
        driverId: form.driverId || undefined,
        notes: form.notes.trim() || undefined,
      });
      router.push(`/transport/vehicles/${vehicle._id}`);
    } catch (err) {
      setErrors(fieldErrorsFrom(err));
    }
  };

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-5">
      <div>
        <Link href="/transport" className="inline-flex items-center gap-1 text-sm text-muted hover:text-heading">
          <ArrowLeft className="h-4 w-4" /> Back to fleet
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-heading">Add Vehicle</h1>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface p-6">
        {createVehicle.isError && Object.keys(errors).length === 0 && (
          <div role="alert" className="rounded-[var(--radius-control)] bg-[var(--color-status-inactive-bg)] px-4 py-3 text-sm text-[var(--color-status-inactive-text)]">
            {messageFrom(createVehicle.error, "We couldn't save this vehicle. Please try again.")}
          </div>
        )}
        <Input label="Vehicle / registration number" required value={form.vehicleNumber} onChange={set("vehicleNumber")} error={errors.vehicleNumber} placeholder="Dhaka Metro Ga 1234" />
        <div className="grid grid-cols-2 gap-4">
          <Select label="Type" value={form.type} onChange={set("type")} options={VEHICLE_TYPES.map((t) => ({ value: t, label: t.charAt(0) + t.slice(1).toLowerCase() }))} />
          <Input label="Seat capacity" type="number" min={1} required value={form.seatCapacity} onChange={set("seatCapacity")} error={errors.seatCapacity} />
        </div>
        <Select
          label="Driver (optional)"
          placeholder="Assign later"
          value={form.driverId}
          onChange={set("driverId")}
          options={(drivers?.data ?? []).map((d) => ({ value: d._id, label: `${d.name} · ${d.phone}` }))}
        />
        <Input label="Notes" value={form.notes} onChange={set("notes")} />
        <div className="flex justify-end gap-2">
          <Link href="/transport">
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </Link>
          <Button type="submit" isLoading={createVehicle.isPending}>
            Save Vehicle
          </Button>
        </div>
      </form>
    </div>
  );
}
