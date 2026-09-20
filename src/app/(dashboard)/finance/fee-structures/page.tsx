"use client";

import { useState, FormEvent } from "react";
import { Wallet, Plus, AlertCircle, X, Trash2 } from "lucide-react";
import {
  useFeeStructures,
  useCreateFeeStructure,
  useDeleteFeeStructure,
} from "@/features/fee-structure/feeStructure.queries";
import { useClasses, useGroups } from "@/features/academic-structure/academicStructure.queries";
import { useAcademicYears } from "@/features/academic-year/academicYear.queries";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ApiClientError } from "@/lib/api-client";

export default function FeeStructuresPage() {
  const { data, isLoading, isError, error, refetch } = useFeeStructures();
  const { data: classes = [] } = useClasses();
  const { data: groups = [] } = useGroups();
  const { data: yearsResult } = useAcademicYears();
  const years = yearsResult?.data ?? [];

  const createStructure = useCreateFeeStructure();
  const deleteStructure = useDeleteFeeStructure();
  const structures = data?.data ?? [];

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [academicYearId, setAcademicYearId] = useState("");
  const [classId, setClassId] = useState("");
  const [groupId, setGroupId] = useState("");
  const [amount, setAmount] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const selectedClass = classes.find((c) => c._id === classId);

  const resetForm = () => {
    setName("");
    setAcademicYearId("");
    setClassId("");
    setGroupId("");
    setAmount("");
    setFormErrors({});
    createStructure.reset();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Name is required.";
    if (!academicYearId) errs.academicYearId = "Select an academic year.";
    if (!classId) errs.classId = "Select a class.";
    const amt = Number(amount);
    if (!amt || amt <= 0) errs.amount = "Amount must be greater than zero.";
    setFormErrors(errs);
    if (Object.keys(errs).length > 0) return;

    try {
      await createStructure.mutateAsync({
        name: name.trim(),
        academicYearId,
        classId,
        groupId: groupId || undefined,
        amount: amt,
      });
      resetForm();
      setShowForm(false);
    } catch {
      // error surfaced via createStructure.error below; form stays open
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-heading">Fee Structures</h1>
          <p className="mt-1 text-sm text-muted">Define fee templates per academic year, class, and group.</p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "Cancel" : "Add Fee Structure"}
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col gap-4 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface p-6"
        >
          {createStructure.isError && (
            <div
              role="alert"
              className="rounded-[var(--radius-control)] bg-[var(--color-status-inactive-bg)] px-4 py-3 text-sm text-[var(--color-status-inactive-text)]"
            >
              {createStructure.error instanceof ApiClientError
                ? createStructure.error.message
                : "Failed to create fee structure."}
            </div>
          )}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={formErrors.name}
              placeholder="Tuition Fee — Term 1"
            />
            <Input
              label="Amount"
              type="number"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              error={formErrors.amount}
              placeholder="5000"
            />
            <Select
              label="Academic Year"
              required
              placeholder="Select year"
              value={academicYearId}
              onChange={(e) => setAcademicYearId(e.target.value)}
              error={formErrors.academicYearId}
              options={years.map((y) => ({ value: y._id, label: y.year }))}
            />
            <Select
              label="Class"
              required
              placeholder="Select class"
              value={classId}
              onChange={(e) => {
                setClassId(e.target.value);
                setGroupId("");
              }}
              error={formErrors.classId}
              options={classes.map((c) => ({ value: c._id, label: c.name }))}
            />
            <Select
              label="Group"
              placeholder={selectedClass?.hasGroups ? "Select group (or leave for all)" : "Not applicable"}
              disabled={!selectedClass?.hasGroups}
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              options={groups.map((g) => ({ value: g._id, label: g.name }))}
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" isLoading={createStructure.isPending}>
              {createStructure.isPending ? "Creating…" : "Create Fee Structure"}
            </Button>
          </div>
        </form>
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
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <AlertCircle className="h-8 w-8 text-danger" />
            <p className="text-sm font-medium text-heading">Couldn&apos;t load fee structures</p>
            <p className="text-sm text-muted">
              {error instanceof ApiClientError ? error.message : "Something went wrong."}
            </p>
            <Button variant="secondary" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        )}

        {!isLoading && !isError && structures.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
            <Wallet className="h-8 w-8 text-[var(--color-muted-2)]" />
            <p className="text-sm font-medium text-heading">No fee structures yet</p>
            <p className="text-sm text-muted">Add your first fee structure to get started.</p>
          </div>
        )}

        {!isLoading && !isError && structures.length > 0 && (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-left text-xs font-medium uppercase tracking-wide text-muted">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Class</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {structures.map((s) => (
                <tr key={s._id} className="hover:bg-[var(--color-surface-alt)]">
                  <td className="px-4 py-3 font-medium text-heading">{s.name}</td>
                  <td className="px-4 py-3 text-muted">
                    {typeof s.classId === "string" ? s.classId : s.classId.name}
                  </td>
                  <td className="px-4 py-3 text-muted">৳{s.amount.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={s.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => deleteStructure.mutate(s._id)}
                      disabled={deleteStructure.isPending}
                      className="text-danger hover:opacity-70 disabled:opacity-40"
                      aria-label="Delete fee structure"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
