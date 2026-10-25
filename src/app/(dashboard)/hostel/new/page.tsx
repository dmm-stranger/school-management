"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useCreateHostel } from "@/features/hostel/hostel.queries";
import type { HostelType, FeeFrequency } from "@/features/hostel/hostel.types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { fieldErrorsFrom, messageFrom } from "@/lib/form-errors";

const HOSTEL_TYPES: { value: HostelType; label: string }[] = [
  { value: "BOYS", label: "Boys" },
  { value: "GIRLS", label: "Girls" },
  { value: "MIXED", label: "Mixed" },
];

export default function NewHostelPage() {
  const router = useRouter();
  const createHostel = useCreateHostel();

  const [form, setForm] = useState({ name: "", type: "BOYS" as HostelType, address: "", fee: "", feeFrequency: "MONTHLY" as FeeFrequency });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (key: keyof typeof form) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Hostel name is required.";
    const fee = Number(form.fee);
    if (!Number.isFinite(fee) || fee < 0) errs.fee = "Enter a valid fee amount.";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    try {
      const hostel = await createHostel.mutateAsync({
        name: form.name.trim(),
        type: form.type,
        address: form.address.trim() || undefined,
        fee,
        feeFrequency: form.feeFrequency,
      });
      router.push(`/hostel/${hostel._id}`);
    } catch (err) {
      setErrors(fieldErrorsFrom(err));
    }
  };

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-5">
      <div>
        <Link href="/hostel" className="inline-flex items-center gap-1 text-sm text-muted hover:text-heading">
          <ArrowLeft className="h-4 w-4" /> Back to hostels
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-heading">Add Hostel</h1>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface p-6">
        {createHostel.isError && Object.keys(errors).length === 0 && (
          <div role="alert" className="rounded-[var(--radius-control)] bg-[var(--color-status-inactive-bg)] px-4 py-3 text-sm text-[var(--color-status-inactive-text)]">
            {messageFrom(createHostel.error, "We couldn't save this hostel. Please try again.")}
          </div>
        )}
        <Input label="Hostel name" required value={form.name} onChange={set("name")} error={errors.name} placeholder="North Hostel" />
        <Select label="Type" value={form.type} onChange={set("type")} options={HOSTEL_TYPES} />
        <Input label="Address" value={form.address} onChange={set("address")} />
        <div className="grid grid-cols-2 gap-4">
          <Input label="Fee" type="number" min={0} required value={form.fee} onChange={set("fee")} error={errors.fee} />
          <Select
            label="Frequency"
            value={form.feeFrequency}
            onChange={set("feeFrequency")}
            options={[
              { value: "MONTHLY", label: "Monthly" },
              { value: "TERM", label: "Per term" },
              { value: "ANNUAL", label: "Annual" },
            ]}
          />
        </div>
        <p className="text-xs text-muted">You can assign a warden and add rooms after creating the hostel.</p>
        <div className="flex justify-end gap-2">
          <Link href="/hostel">
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </Link>
          <Button type="submit" isLoading={createHostel.isPending}>
            Save Hostel
          </Button>
        </div>
      </form>
    </div>
  );
}
