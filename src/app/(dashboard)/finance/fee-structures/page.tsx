"use client";

import { useEffect, useState, useCallback, FormEvent } from "react";
import { Wallet, Plus, AlertCircle, X, Trash2 } from "lucide-react";
import { feeStructureApi } from "@/features/fee-structure/feeStructure.api";
import type { FeeStructure } from "@/features/fee-structure/feeStructure.types";
import { academicStructureApi } from "@/features/academic-structure/academicStructure.api";
import type { AcademicClass, AcademicGroup } from "@/features/academic-structure/academicStructure.types";
import { academicYearApi } from "@/features/academic-year/academicYear.api";
import type { AcademicYear } from "@/features/academic-year/academicYear.types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ApiClientError } from "@/lib/api-client";

export default function FeeStructuresPage() {
  const [structures, setStructures] = useState<FeeStructure[]>([]);
  const [classes, setClasses] = useState<AcademicClass[]>([]);
  const [groups, setGroups] = useState<AcademicGroup[]>([]);
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "loaded" | "error">("loading");
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [name, setName] = useState("");
  const [academicYearId, setAcademicYearId] = useState("");
  const [classId, setClassId] = useState("");
  const [groupId, setGroupId] = useState("");
  const [amount, setAmount] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedClass = classes.find((c) => c._id === classId);

  const fetchStructures = useCallback(async () => {
    setLoadState("loading");
    try {
      const result = await feeStructureApi.list();
      setStructures(result.data);
      setLoadState("loaded");
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to load fee structures.");
      setLoadState("error");
    }
  }, []);

  useEffect(() => {
    queueMicrotask(async () => {
      try {
        const [classData, groupData, yearData] = await Promise.all([
          academicStructureApi.listClasses(),
          academicStructureApi.listGroups(),
          academicYearApi.list(),
        ]);
        setClasses(classData);
        setGroups(groupData);
        setYears(yearData.data);
      } catch {
        // dropdowns stay empty
      }
      fetchStructures();
    });
  }, [fetchStructures]);

  const resetForm = () => {
    setName("");
    setAcademicYearId("");
    setClassId("");
    setGroupId("");
    setAmount("");
    setFormErrors({});
    setFormError(null);
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

    setIsSubmitting(true);
    setFormError(null);
    try {
      await feeStructureApi.create({
        name: name.trim(),
        academicYearId,
        classId,
        groupId: groupId || undefined,
        amount: amt,
      });
      resetForm();
      setShowForm(false);
      fetchStructures();
    } catch (err) {
      setFormError(err instanceof ApiClientError ? err.message : "Failed to create fee structure.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await feeStructureApi.delete(id);
      fetchStructures();
    } catch {
      // list stays as-is
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
          {formError && (
            <div
              role="alert"
              className="rounded-[var(--radius-control)] bg-[var(--color-status-inactive-bg)] px-4 py-3 text-sm text-[var(--color-status-inactive-text)]"
            >
              {formError}
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
            <Button type="submit" isLoading={isSubmitting}>
              {isSubmitting ? "Creating…" : "Create Fee Structure"}
            </Button>
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface">
        {loadState === "loading" && (
          <div className="divide-y divide-[var(--color-border)]">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-14 animate-pulse bg-[var(--color-surface-alt)]" />
            ))}
          </div>
        )}

        {loadState === "error" && (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <AlertCircle className="h-8 w-8 text-danger" />
            <p className="text-sm font-medium text-heading">Couldn&apos;t load fee structures</p>
            <p className="text-sm text-muted">{error}</p>
            <Button variant="secondary" onClick={fetchStructures}>
              Retry
            </Button>
          </div>
        )}

        {loadState === "loaded" && structures.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
            <Wallet className="h-8 w-8 text-[var(--color-muted-2)]" />
            <p className="text-sm font-medium text-heading">No fee structures yet</p>
            <p className="text-sm text-muted">Add your first fee structure to get started.</p>
          </div>
        )}

        {loadState === "loaded" && structures.length > 0 && (
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
                      onClick={() => handleDelete(s._id)}
                      className="text-danger hover:opacity-70"
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
