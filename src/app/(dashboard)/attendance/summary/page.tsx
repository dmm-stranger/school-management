"use client";

import { useEffect, useState } from "react";
import { BarChart3, AlertCircle } from "lucide-react";
import { attendanceSummaryApi } from "@/features/attendance-summary/attendanceSummary.api";
import type { YearlySummary } from "@/features/attendance-summary/attendanceSummary.types";
import { studentApi } from "@/features/student/student.api";
import type { Student } from "@/features/student/student.types";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { ApiClientError } from "@/lib/api-client";

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = [currentYear - 1, currentYear, currentYear + 1].map((y) => ({
  value: String(y),
  label: String(y),
}));

export default function AttendanceSummaryPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [studentId, setStudentId] = useState("");
  const [year, setYear] = useState(String(currentYear));
  const [summary, setSummary] = useState<YearlySummary | null>(null);
  const [loadState, setLoadState] = useState<"idle" | "loading" | "loaded" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    queueMicrotask(async () => {
      try {
        const result = await studentApi.list({ limit: 300 });
        setStudents(result.data);
      } catch {
        // student dropdown stays empty
      }
    });
  }, []);

  const handleLookup = async () => {
    if (!studentId) return;
    setLoadState("loading");
    setError(null);
    try {
      const data = await attendanceSummaryApi.yearly(studentId, Number(year));
      setSummary(data);
      setLoadState("loaded");
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to load summary.");
      setLoadState("error");
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold text-heading">Attendance Summary</h1>
        <p className="mt-1 text-sm text-muted">View a student&apos;s yearly attendance breakdown by month.</p>
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface p-6">
        <div className="min-w-[240px] flex-1">
          <Select
            label="Student"
            placeholder="Select student"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            options={students.map((s) => ({ value: s._id, label: `${s.personalInfo.fullName} (${s.studentId})` }))}
          />
        </div>
        <div className="w-32">
          <Select label="Year" value={year} onChange={(e) => setYear(e.target.value)} options={YEAR_OPTIONS} />
        </div>
        <Button onClick={handleLookup} isLoading={loadState === "loading"} disabled={!studentId}>
          View Summary
        </Button>
      </div>

      {loadState === "error" && (
        <div className="flex flex-col items-center gap-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface px-6 py-16 text-center">
          <AlertCircle className="h-8 w-8 text-danger" />
          <p className="text-sm text-muted">{error}</p>
        </div>
      )}

      {loadState === "idle" && (
        <div className="flex flex-col items-center gap-2 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface px-6 py-16 text-center">
          <BarChart3 className="h-8 w-8 text-[var(--color-muted-2)]" />
          <p className="text-sm font-medium text-heading">Select a student and year, then view summary</p>
        </div>
      )}

      {loadState === "loaded" && summary && (
        <>
          <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface p-6">
            <p className="text-sm font-medium text-muted">Overall Attendance for {summary.year}</p>
            <p className="mt-1 text-3xl font-semibold text-heading">{summary.overallPercentage}%</p>
            <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted">
              <span>Present: {summary.overallCounts.PRESENT}</span>
              <span>Absent: {summary.overallCounts.ABSENT}</span>
              <span>Late: {summary.overallCounts.LATE}</span>
              <span>Leave: {summary.overallCounts.LEAVE}</span>
              <span>Holiday: {summary.overallCounts.HOLIDAY}</span>
              <span>Half Day: {summary.overallCounts.HALF_DAY}</span>
            </div>
          </div>

          <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] text-left text-xs font-medium uppercase tracking-wide text-muted">
                  <th className="px-4 py-3">Month</th>
                  <th className="px-4 py-3">Present</th>
                  <th className="px-4 py-3">Absent</th>
                  <th className="px-4 py-3">Late</th>
                  <th className="px-4 py-3">Leave</th>
                  <th className="px-4 py-3">Percentage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {summary.monthly.map((m) => (
                  <tr key={m.month}>
                    <td className="px-4 py-3 font-medium text-heading">{MONTH_NAMES[m.month - 1]}</td>
                    <td className="px-4 py-3 text-muted">{m.counts.PRESENT}</td>
                    <td className="px-4 py-3 text-muted">{m.counts.ABSENT}</td>
                    <td className="px-4 py-3 text-muted">{m.counts.LATE}</td>
                    <td className="px-4 py-3 text-muted">{m.counts.LEAVE}</td>
                    <td className="px-4 py-3 font-medium text-heading">{m.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
