"use client";

import { useEffect, useState, useCallback } from "react";
import { ClipboardList, AlertCircle } from "lucide-react";
import { examScheduleApi } from "@/features/exam-schedule/examSchedule.api";
import type { ExamSchedule } from "@/features/exam-schedule/examSchedule.types";
import { examMarkApi } from "@/features/exam-mark/examMark.api";
import type { ExamMark } from "@/features/exam-mark/examMark.types";
import { studentApi } from "@/features/student/student.api";
import type { Student } from "@/features/student/student.types";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { ApiClientError } from "@/lib/api-client";

export default function MarksEntryPage() {
  const [schedules, setSchedules] = useState<ExamSchedule[]>([]);
  const [scheduleId, setScheduleId] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [existingMarks, setExistingMarks] = useState<Record<string, ExamMark>>({});
  const [values, setValues] = useState<Record<string, string>>({});

  const [loadState, setLoadState] = useState<"idle" | "loading" | "loaded" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const selectedSchedule = schedules.find((s) => s._id === scheduleId);

  useEffect(() => {
    queueMicrotask(async () => {
      try {
        const [scheduleData, studentData] = await Promise.all([
          examScheduleApi.list(),
          studentApi.list({ limit: 300 }),
        ]);
        setSchedules(scheduleData.data.filter((s) => s.status !== "DRAFT"));
        setStudents(studentData.data);
      } catch {
        // pickers stay empty; user can retry via scope selection
      }
    });
  }, []);

  const loadMarks = useCallback(async () => {
    if (!scheduleId) return;
    setLoadState("loading");
    setError(null);
    setSaveMessage(null);
    try {
      const result = await examMarkApi.listBySchedule(scheduleId);
      const map: Record<string, ExamMark> = {};
      const vals: Record<string, string> = {};
      result.data.forEach((m) => {
        const sid = typeof m.studentId === "string" ? m.studentId : m.studentId._id;
        map[sid] = m;
        vals[sid] = String(m.obtainedMarks);
      });
      setExistingMarks(map);
      setValues(vals);
      setLoadState("loaded");
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to load marks.");
      setLoadState("error");
    }
  }, [scheduleId]);

  useEffect(() => {
    if (scheduleId) {
      queueMicrotask(() => {
        loadMarks();
      });
    }
  }, [scheduleId, loadMarks]);

  const handleSaveAll = async () => {
    if (!scheduleId) return;
    setIsSaving(true);
    setSaveMessage(null);
    setError(null);
    try {
      const marks = Object.entries(values)
        .filter(([, v]) => v !== "")
        .map(([studentId, v]) => ({ studentId, obtainedMarks: Number(v) }));

      const result = await examMarkApi.bulkCreate(scheduleId, marks);
      setSaveMessage(
        `Saved marks for ${result.created.length} students${
          result.failed.length > 0 ? `, ${result.failed.length} failed` : ""
        }.`
      );
      loadMarks();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to save marks.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold text-heading">Marks Entry</h1>
        <p className="mt-1 text-sm text-muted">Select a finalized exam schedule to enter or update marks.</p>
      </div>

      <Select
        label="Exam Schedule"
        placeholder="Select a schedule"
        value={scheduleId}
        onChange={(e) => setScheduleId(e.target.value)}
        options={schedules.map((s) => ({
          value: s._id,
          label: `${typeof s.subjectId === "string" ? s.subjectId : s.subjectId.subjectName} — ${new Date(
            s.examDate
          ).toLocaleDateString()} (Full: ${s.fullMarks})`,
        }))}
      />

      {error && (
        <div
          role="alert"
          className="rounded-[var(--radius-control)] bg-[var(--color-status-inactive-bg)] px-4 py-3 text-sm text-[var(--color-status-inactive-text)]"
        >
          {error}
        </div>
      )}

      {saveMessage && (
        <div className="rounded-[var(--radius-control)] bg-[var(--color-status-active-bg)] px-4 py-3 text-sm text-[var(--color-status-active-text)]">
          {saveMessage}
        </div>
      )}

      {!scheduleId && (
        <div className="flex flex-col items-center gap-2 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface px-6 py-16 text-center">
          <ClipboardList className="h-8 w-8 text-[var(--color-muted-2)]" />
          <p className="text-sm font-medium text-heading">Select an exam schedule above</p>
        </div>
      )}

      {scheduleId && loadState === "loading" && (
        <div className="h-64 animate-pulse rounded-[var(--radius-card)] bg-[var(--color-surface-alt)]" />
      )}

      {scheduleId && loadState === "error" && (
        <div className="flex flex-col items-center gap-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface px-6 py-16 text-center">
          <AlertCircle className="h-8 w-8 text-danger" />
          <p className="text-sm text-muted">{error}</p>
        </div>
      )}

      {scheduleId && loadState === "loaded" && selectedSchedule && (
        <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-left text-xs font-medium uppercase tracking-wide text-muted">
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Roll / ID</th>
                <th className="px-4 py-3">Marks (out of {selectedSchedule.fullMarks})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {students.map((student) => (
                <tr key={student._id}>
                  <td className="px-4 py-3 font-medium text-heading">{student.personalInfo.fullName}</td>
                  <td className="px-4 py-3 text-muted">{student.studentId}</td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min={0}
                      max={selectedSchedule.fullMarks}
                      value={values[student._id] ?? ""}
                      onChange={(e) =>
                        setValues((prev) => ({ ...prev, [student._id]: e.target.value }))
                      }
                      className="w-24 rounded-[var(--radius-control)] border border-[var(--color-border)] bg-background px-2 py-1.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-[var(--color-primary-light)]"
                    />
                    {existingMarks[student._id] && (
                      <span className="ml-2 text-xs text-muted">saved</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-end border-t border-[var(--color-border)] p-4">
            <Button onClick={handleSaveAll} isLoading={isSaving}>
              {isSaving ? "Saving…" : "Save All Marks"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
