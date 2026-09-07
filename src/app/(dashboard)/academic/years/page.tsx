"use client";

import { useEffect, useState, useCallback, FormEvent } from "react";
import { Calendar, Plus, AlertCircle, X } from "lucide-react";
import { academicYearApi } from "@/features/academic-year/academicYear.api";
import type { AcademicYear } from "@/features/academic-year/academicYear.types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ApiClientError } from "@/lib/api-client";

function ListSkeleton() {
  return (
    <div className="divide-y divide-[var(--color-border)]">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3.5">
          <div className="h-9 w-9 animate-pulse rounded-[var(--radius-control)] bg-[var(--color-surface-alt)]" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-1/4 animate-pulse rounded bg-[var(--color-surface-alt)]" />
            <div className="h-2.5 w-1/3 animate-pulse rounded bg-[var(--color-surface-alt)]" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AcademicYearsPage() {
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "loaded" | "error">("loading");
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [year, setYear] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchYears = useCallback(async () => {
    setLoadState("loading");
    try {
      const result = await academicYearApi.list();
      setYears(result.data);
      setLoadState("loaded");
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to load academic years.");
      setLoadState("error");
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      fetchYears();
    });
  }, [fetchYears]);

  const resetForm = () => {
    setYear("");
    setStartDate("");
    setEndDate("");
    setFormErrors({});
    setFormError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!year.trim()) errs.year = "Year is required.";
    if (!startDate) errs.startDate = "Start date is required.";
    if (!endDate) errs.endDate = "End date is required.";
    if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
      errs.endDate = "End date must be after start date.";
    }
    setFormErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setIsSubmitting(true);
    setFormError(null);
    try {
      await academicYearApi.create({ year: year.trim(), startDate, endDate });
      resetForm();
      setShowForm(false);
      fetchYears();
    } catch (err) {
      setFormError(err instanceof ApiClientError ? err.message : "Failed to create academic year.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleActivate = async (id: string) => {
    try {
      await academicYearApi.update(id, { status: "ACTIVE" });
      fetchYears();
    } catch {
      // surfaced via list refresh failing silently is acceptable here; a
      // toast system will replace this once built (see FRONTEND-WORKING-FLOW §9)
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-heading">Academic Years</h1>
          <p className="mt-1 text-sm text-muted">Only one academic year can be active at a time.</p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "Cancel" : "Add Academic Year"}
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Input
              label="Year"
              required
              value={year}
              onChange={(e) => setYear(e.target.value)}
              error={formErrors.year}
              placeholder="2027"
            />
            <Input
              label="Start Date"
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              error={formErrors.startDate}
            />
            <Input
              label="End Date"
              type="date"
              required
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              error={formErrors.endDate}
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" isLoading={isSubmitting}>
              {isSubmitting ? "Creating…" : "Create Academic Year"}
            </Button>
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface">
        {loadState === "loading" && <ListSkeleton />}

        {loadState === "error" && (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <AlertCircle className="h-8 w-8 text-danger" />
            <p className="text-sm font-medium text-heading">Couldn&apos;t load academic years</p>
            <p className="text-sm text-muted">{error}</p>
            <Button variant="secondary" onClick={fetchYears}>
              Retry
            </Button>
          </div>
        )}

        {loadState === "loaded" && years.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
            <Calendar className="h-8 w-8 text-[var(--color-muted-2)]" />
            <p className="text-sm font-medium text-heading">No academic years yet</p>
            <p className="text-sm text-muted">Add your first academic year to get started.</p>
          </div>
        )}

        {loadState === "loaded" && years.length > 0 && (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-left text-xs font-medium uppercase tracking-wide text-muted">
                <th className="px-4 py-3">Year</th>
                <th className="px-4 py-3">Start Date</th>
                <th className="px-4 py-3">End Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {years.map((y) => (
                <tr key={y._id} className="hover:bg-[var(--color-surface-alt)]">
                  <td className="px-4 py-3 font-medium text-heading">{y.year}</td>
                  <td className="px-4 py-3 text-muted">{new Date(y.startDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-muted">{new Date(y.endDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={y.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    {y.status !== "ACTIVE" && (
                      <button
                        onClick={() => handleActivate(y._id)}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        Set Active
                      </button>
                    )}
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
