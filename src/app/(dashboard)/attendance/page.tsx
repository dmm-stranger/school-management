"use client";

import { useEffect, useState, useCallback } from "react";
import { ClipboardCheck, AlertCircle } from "lucide-react";
import { studentAttendanceApi } from "@/features/student-attendance/studentAttendance.api";
import type { AttendanceStatus } from "@/features/student-attendance/studentAttendance.types";
import { ATTENDANCE_STATUSES } from "@/features/student-attendance/studentAttendance.types";
import { academicStructureApi } from "@/features/academic-structure/academicStructure.api";
import type { AcademicClass, AcademicSection, AcademicGroup } from "@/features/academic-structure/academicStructure.types";
import { academicYearApi } from "@/features/academic-year/academicYear.api";
import type { AcademicYear } from "@/features/academic-year/academicYear.types";
import { studentApi } from "@/features/student/student.api";
import type { Student } from "@/features/student/student.types";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { ApiClientError } from "@/lib/api-client";

const STATUS_LABELS: Record<AttendanceStatus, string> = {
  PRESENT: "Present",
  ABSENT: "Absent",
  LATE: "Late",
  LEAVE: "Leave",
  HOLIDAY: "Holiday",
  HALF_DAY: "Half Day",
};

const STATUS_COLORS: Record<AttendanceStatus, string> = {
  PRESENT: "bg-[var(--color-status-active-bg)] text-[var(--color-status-active-text)]",
  ABSENT: "bg-[var(--color-status-inactive-bg)] text-[var(--color-status-inactive-text)]",
  LATE: "bg-[var(--color-status-pending-bg)] text-[var(--color-status-pending-text)]",
  LEAVE: "bg-[var(--color-status-draft-bg)] text-[var(--color-status-draft-text)]",
  HOLIDAY: "bg-[var(--color-surface-alt)] text-muted",
  HALF_DAY: "bg-[var(--color-status-pending-bg)] text-[var(--color-status-pending-text)]",
};

export default function AttendancePage() {
  const [classes, setClasses] = useState<AcademicClass[]>([]);
  const [sections, setSections] = useState<AcademicSection[]>([]);
  const [groups, setGroups] = useState<AcademicGroup[]>([]);
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  const [academicYearId, setAcademicYearId] = useState("");
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [groupId, setGroupId] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  const [values, setValues] = useState<Record<string, AttendanceStatus>>({});
  const [loadState, setLoadState] = useState<"idle" | "loading" | "loaded" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const selectedClass = classes.find((c) => c._id === classId);
  const sectionsForClass = sections.filter((s) => (typeof s.classId === "string" ? s.classId : s.classId._id) === classId);
  const scopeReady = Boolean(academicYearId && classId && sectionId && date && (!selectedClass?.hasGroups || groupId));

  useEffect(() => {
    queueMicrotask(async () => {
      try {
        const [classData, sectionData, groupData, yearData] = await Promise.all([
          academicStructureApi.listClasses(),
          academicStructureApi.listSections(),
          academicStructureApi.listGroups(),
          academicYearApi.list(),
        ]);
        setClasses(classData);
        setSections(sectionData);
        setGroups(groupData);
        setYears(yearData.data);
      } catch {
        // scope pickers stay empty
      }
    });
  }, []);

  const loadRoster = useCallback(async () => {
    if (!scopeReady) return;
    setLoadState("loading");
    setError(null);
    setSaveMessage(null);
    try {
      const [studentResult, existingResult] = await Promise.all([
        studentApi.list({ limit: 300, status: "ACTIVE" }),
        studentAttendanceApi.listByClassAndDate(classId, sectionId, date),
      ]);
      setStudents(studentResult.data);

      const vals: Record<string, AttendanceStatus> = {};
      existingResult.data.forEach((rec) => {
        const sid = typeof rec.studentId === "string" ? rec.studentId : rec.studentId._id;
        vals[sid] = rec.attendanceStatus;
      });
      setValues(vals);
      setLoadState("loaded");
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to load roster.");
      setLoadState("error");
    }
  }, [scopeReady, classId, sectionId, date]);

  useEffect(() => {
    if (scopeReady) {
      queueMicrotask(() => {
        loadRoster();
      });
    }
  }, [scopeReady, loadRoster]);

  const markAll = (status: AttendanceStatus) => {
    const next: Record<string, AttendanceStatus> = {};
    students.forEach((s) => {
      next[s._id] = status;
    });
    setValues(next);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage(null);
    setError(null);
    try {
      const entries = Object.entries(values).map(([studentId, attendanceStatus]) => ({
        studentId,
        attendanceStatus,
      }));
      const result = await studentAttendanceApi.bulkMark({
        academicYearId,
        classId,
        sectionId,
        groupId: groupId || undefined,
        date,
        entries,
      });
      setSaveMessage(
        `Saved attendance for ${result.created.length} students${
          result.failed.length > 0 ? `, ${result.failed.length} failed` : ""
        }.`
      );
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to save attendance.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold text-heading">Attendance</h1>
        <p className="mt-1 text-sm text-muted">Select a class, section, and date to mark daily attendance.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface p-6 sm:grid-cols-2 lg:grid-cols-5">
        <Select
          label="Academic Year"
          placeholder="Select year"
          value={academicYearId}
          onChange={(e) => setAcademicYearId(e.target.value)}
          options={years.map((y) => ({ value: y._id, label: y.year }))}
        />
        <Select
          label="Class"
          placeholder="Select class"
          value={classId}
          onChange={(e) => {
            setClassId(e.target.value);
            setSectionId("");
            setGroupId("");
          }}
          options={classes.map((c) => ({ value: c._id, label: c.name }))}
        />
        <Select
          label="Section"
          placeholder={classId ? "Select section" : "Select a class first"}
          disabled={!classId}
          value={sectionId}
          onChange={(e) => setSectionId(e.target.value)}
          options={sectionsForClass.map((s) => ({ value: s._id, label: `Section ${s.name}` }))}
        />
        <Select
          label="Group"
          placeholder={selectedClass?.hasGroups ? "Select group" : "Not applicable"}
          disabled={!selectedClass?.hasGroups}
          value={groupId}
          onChange={(e) => setGroupId(e.target.value)}
          options={groups.map((g) => ({ value: g._id, label: g.name }))}
        />
        <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      {saveMessage && (
        <div className="rounded-[var(--radius-control)] bg-[var(--color-status-active-bg)] px-4 py-3 text-sm text-[var(--color-status-active-text)]">
          {saveMessage}
        </div>
      )}
      {error && (
        <div
          role="alert"
          className="rounded-[var(--radius-control)] bg-[var(--color-status-inactive-bg)] px-4 py-3 text-sm text-[var(--color-status-inactive-text)]"
        >
          {error}
        </div>
      )}

      {!scopeReady && (
        <div className="flex flex-col items-center gap-2 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface px-6 py-16 text-center">
          <ClipboardCheck className="h-8 w-8 text-[var(--color-muted-2)]" />
          <p className="text-sm font-medium text-heading">Select a scope above to load the roster</p>
        </div>
      )}

      {scopeReady && loadState === "loading" && (
        <div className="h-64 animate-pulse rounded-[var(--radius-card)] bg-[var(--color-surface-alt)]" />
      )}

      {scopeReady && loadState === "error" && (
        <div className="flex flex-col items-center gap-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface px-6 py-16 text-center">
          <AlertCircle className="h-8 w-8 text-danger" />
          <p className="text-sm text-muted">{error}</p>
        </div>
      )}

      {scopeReady && loadState === "loaded" && (
        <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border)] p-4">
            <span className="text-sm font-medium text-heading">Mark all as:</span>
            <div className="flex flex-wrap gap-2">
              {ATTENDANCE_STATUSES.map((status) => (
                <button
                  key={status}
                  onClick={() => markAll(status)}
                  className={`rounded-[var(--radius-pill)] px-3 py-1.5 text-xs font-medium ${STATUS_COLORS[status]}`}
                >
                  {STATUS_LABELS[status]}
                </button>
              ))}
            </div>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-left text-xs font-medium uppercase tracking-wide text-muted">
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {students.map((student) => (
                <tr key={student._id}>
                  <td className="px-4 py-3 font-medium text-heading">
                    {student.personalInfo.fullName}
                    <span className="ml-2 text-muted">({student.studentId})</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      {ATTENDANCE_STATUSES.map((status) => {
                        const active = values[student._id] === status;
                        return (
                          <button
                            key={status}
                            onClick={() => setValues((prev) => ({ ...prev, [student._id]: status }))}
                            aria-pressed={active}
                            className={`rounded-[var(--radius-pill)] px-2.5 py-1 text-xs font-medium transition-opacity ${
                              STATUS_COLORS[status]
                            } ${active ? "opacity-100 ring-2 ring-primary" : "opacity-50 hover:opacity-80"}`}
                          >
                            {STATUS_LABELS[status]}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end border-t border-[var(--color-border)] p-4">
            <Button onClick={handleSave} isLoading={isSaving}>
              {isSaving ? "Saving…" : "Save Attendance"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
