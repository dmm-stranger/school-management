"use client";

import { useEffect, useState, useCallback, FormEvent } from "react";
import Link from "next/link";
import { FileText, Plus, AlertCircle, X } from "lucide-react";
import { examApi } from "@/features/exam/exam.api";
import type { Exam } from "@/features/exam/exam.types";
import { EXAM_TYPES } from "@/features/exam/exam.types";
import type { ExamType } from "@/features/exam/exam.types";
import { academicYearApi } from "@/features/academic-year/academicYear.api";
import type { AcademicYear } from "@/features/academic-year/academicYear.types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ApiClientError } from "@/lib/api-client";

export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "loaded" | "error">("loading");
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [academicYearId, setAcademicYearId] = useState("");
  const [examName, setExamName] = useState("");
  const [examType, setExamType] = useState<ExamType | "">("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchExams = useCallback(async () => {
    setLoadState("loading");
    try {
      const result = await examApi.list();
      setExams(result.data);
      setLoadState("loaded");
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to load exams.");
      setLoadState("error");
    }
  }, []);

  useEffect(() => {
    queueMicrotask(async () => {
      try {
        const yearData = await academicYearApi.list();
        setYears(yearData.data);
      } catch {
        // year dropdown stays empty; list still loads
      }
      fetchExams();
    });
  }, [fetchExams]);

  const resetForm = () => {
    setAcademicYearId("");
    setExamName("");
    setExamType("");
    setStartDate("");
    setEndDate("");
    setFormErrors({});
    setFormError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!academicYearId) errs.academicYearId = "Select an academic year.";
    if (!examName.trim()) errs.examName = "Exam name is required.";
    if (!examType) errs.examType = "Select an exam type.";
    if (!startDate) errs.startDate = "Start date is required.";
    if (!endDate) errs.endDate = "End date is required.";
    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      errs.endDate = "End date must be on or after start date.";
    }
    setFormErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setIsSubmitting(true);
    setFormError(null);
    try {
      await examApi.create({
        academicYearId,
        examName: examName.trim(),
        examType: examType as ExamType,
        startDate,
        endDate,
      });
      resetForm();
      setShowForm(false);
      fetchExams();
    } catch (err) {
      setFormError(err instanceof ApiClientError ? err.message : "Failed to create exam.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-heading">Exams</h1>
          <p className="mt-1 text-sm text-muted">Create and manage exams for each academic year.</p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "Cancel" : "Add Exam"}
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
              label="Exam Name"
              required
              value={examName}
              onChange={(e) => setExamName(e.target.value)}
              error={formErrors.examName}
              placeholder="Half Yearly Examination 2027"
            />
            <Select
              label="Exam Type"
              required
              placeholder="Select type"
              value={examType}
              onChange={(e) => setExamType(e.target.value as ExamType)}
              error={formErrors.examType}
              options={EXAM_TYPES.map((t) => ({ value: t, label: t }))}
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
            <div />
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
              {isSubmitting ? "Creating…" : "Create Exam"}
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
            <p className="text-sm font-medium text-heading">Couldn&apos;t load exams</p>
            <p className="text-sm text-muted">{error}</p>
            <Button variant="secondary" onClick={fetchExams}>
              Retry
            </Button>
          </div>
        )}

        {loadState === "loaded" && exams.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
            <FileText className="h-8 w-8 text-[var(--color-muted-2)]" />
            <p className="text-sm font-medium text-heading">No exams yet</p>
            <p className="text-sm text-muted">Add your first exam to get started.</p>
          </div>
        )}

        {loadState === "loaded" && exams.length > 0 && (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-left text-xs font-medium uppercase tracking-wide text-muted">
                <th className="px-4 py-3">Exam</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Dates</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {exams.map((exam) => (
                <tr key={exam._id} className="hover:bg-[var(--color-surface-alt)]">
                  <td className="px-4 py-3 font-medium text-heading">{exam.examName}</td>
                  <td className="px-4 py-3 text-muted">{exam.examType}</td>
                  <td className="px-4 py-3 text-muted">
                    {new Date(exam.startDate).toLocaleDateString()} – {new Date(exam.endDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={exam.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/examination/schedules?examId=${exam._id}`}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      Schedules
                    </Link>
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
