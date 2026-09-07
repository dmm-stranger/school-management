"use client";

import { useEffect, useState, useCallback } from "react";
import { Calendar, AlertCircle, RefreshCw, CheckCircle2, Lock, Unlock, Sparkles } from "lucide-react";
import { routineApi } from "@/features/routine/routine.api";
import type { Period, RoutineEntry, Conflict } from "@/features/routine/routine.types";
import { WORKING_DAYS } from "@/features/routine/routine.types";
import { academicStructureApi } from "@/features/academic-structure/academicStructure.api";
import type { AcademicClass, AcademicSection, AcademicGroup } from "@/features/academic-structure/academicStructure.types";
import { academicYearApi } from "@/features/academic-year/academicYear.api";
import type { AcademicYear } from "@/features/academic-year/academicYear.types";
import { academyApi } from "@/features/academy/academy.api";
import type { Room } from "@/features/academy/academy.types";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { ApiClientError } from "@/lib/api-client";

const DAY_LABELS: Record<string, string> = {
  SATURDAY: "Sat",
  SUNDAY: "Sun",
  MONDAY: "Mon",
  TUESDAY: "Tue",
  WEDNESDAY: "Wed",
  THURSDAY: "Thu",
  FRIDAY: "Fri",
};

export default function RoutinePage() {
  const [classes, setClasses] = useState<AcademicClass[]>([]);
  const [sections, setSections] = useState<AcademicSection[]>([]);
  const [groups, setGroups] = useState<AcademicGroup[]>([]);
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [periods, setPeriods] = useState<Period[]>([]);

  const [academicYearId, setAcademicYearId] = useState("");
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [groupId, setGroupId] = useState("");
  const [roomId, setRoomId] = useState("");

  const [entries, setEntries] = useState<RoutineEntry[]>([]);
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [loadState, setLoadState] = useState<"idle" | "loading" | "loaded" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const selectedClass = classes.find((c) => c._id === classId);
  const sectionsForClass = sections.filter((s) => {
    const cid = typeof s.classId === "string" ? s.classId : s.classId._id;
    return cid === classId;
  });

  useEffect(() => {
    queueMicrotask(async () => {
      try {
        const [classData, sectionData, groupData, yearData, roomData, periodData] = await Promise.all([
          academicStructureApi.listClasses(),
          academicStructureApi.listSections(),
          academicStructureApi.listGroups(),
          academicYearApi.list(),
          academyApi.list({ limit: 100, roomType: "CLASSROOM" }),
          routineApi.listPeriods(),
        ]);
        setClasses(classData);
        setSections(sectionData);
        setGroups(groupData);
        setYears(yearData.data);
        setRooms(roomData.data);
        setPeriods(periodData.filter((p) => !p.isBreak));
      } catch {
        // scope pickers stay empty; user can still retry via the page
      }
    });
  }, []);

  const scope = { academicYearId, classId, sectionId, groupId: groupId || undefined };
  const scopeReady = Boolean(academicYearId && classId && sectionId && (!selectedClass?.hasGroups || groupId));

  const fetchRoutine = useCallback(async () => {
    if (!classId) return;
    setLoadState("loading");
    setError(null);
    try {
      const data = await routineApi.listByClass(classId);
      const filtered = data.filter(
        (e) =>
          (typeof e.sectionId === "string" ? e.sectionId : e.sectionId._id) === sectionId &&
          (!groupId || (typeof e.groupId === "string" ? e.groupId : e.groupId?._id) === groupId)
      );
      setEntries(filtered);
      setLoadState("loaded");
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to load routine.");
      setLoadState("error");
    }
  }, [classId, sectionId, groupId]);

  useEffect(() => {
    if (scopeReady) {
      queueMicrotask(() => {
        fetchRoutine();
      });
    }
  }, [scopeReady, fetchRoutine]);

  const cellFor = (day: string, periodNumber: number) =>
    entries.find((e) => e.day === day && e.period === periodNumber);

  const runAction = async (action: string, fn: () => Promise<{ message: string }>) => {
    setBusy(action);
    setActionMessage(null);
    setError(null);
    try {
      const result = await fn();
      setActionMessage(result.message);
      await fetchRoutine();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : `Failed to ${action}.`);
    } finally {
      setBusy(null);
    }
  };

  const handleGenerate = () =>
    runAction("generate", async () => {
      if (!roomId) throw new ApiClientError("Select a room before generating.", 400);
      const result = await routineApi.generate({ ...scope, roomId });
      return {
        message: `Generated ${result.created.length} entries${
          result.skipped.length > 0 ? `, ${result.skipped.length} could not be placed` : ""
        }.`,
      };
    });

  const handleCheckConflicts = async () => {
    setBusy("conflicts");
    setError(null);
    try {
      const result = await routineApi.checkConflicts(scope);
      setConflicts(result);
      setActionMessage(result.length === 0 ? "No conflicts found." : `${result.length} conflict(s) found.`);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to check conflicts.");
    } finally {
      setBusy(null);
    }
  };

  const handlePublish = () =>
    runAction("publish", async () => {
      const result = await routineApi.publish(scope);
      return { message: `Published ${result.published} entries.` };
    });

  const handleLock = () =>
    runAction("lock", async () => {
      const result = await routineApi.lock(scope);
      return { message: `Locked ${result.locked} entries.` };
    });

  const handleUnlock = () =>
    runAction("unlock", async () => {
      const result = await routineApi.unlock(scope);
      return { message: `Unlocked ${result.unlocked} entries.` };
    });

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold text-heading">Class Routine</h1>
        <p className="mt-1 text-sm text-muted">
          Build, generate, and publish the weekly class schedule. Locked routines can&apos;t be edited until unlocked.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface p-6 sm:grid-cols-2 lg:grid-cols-4">
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
      </div>

      {scopeReady && (
        <div className="flex flex-wrap items-center gap-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface p-4">
          <div className="min-w-[220px] flex-1">
            <Select
              label="Room (for generating)"
              placeholder="Select a classroom"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              options={rooms.map((r) => ({ value: r._id, label: `${r.buildingName} · ${r.roomNumber}` }))}
            />
          </div>
          <div className="flex flex-wrap gap-2 pt-6">
            <Button variant="secondary" isLoading={busy === "generate"} onClick={handleGenerate}>
              <Sparkles className="h-4 w-4" />
              Generate
            </Button>
            <Button variant="secondary" isLoading={busy === "conflicts"} onClick={handleCheckConflicts}>
              <CheckCircle2 className="h-4 w-4" />
              Check Conflicts
            </Button>
            <Button isLoading={busy === "publish"} onClick={handlePublish}>
              Publish
            </Button>
            <Button variant="secondary" isLoading={busy === "lock"} onClick={handleLock}>
              <Lock className="h-4 w-4" />
              Lock
            </Button>
            <Button variant="secondary" isLoading={busy === "unlock"} onClick={handleUnlock}>
              <Unlock className="h-4 w-4" />
              Unlock
            </Button>
            <Button variant="ghost" onClick={fetchRoutine}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {actionMessage && (
        <div className="rounded-[var(--radius-control)] bg-[var(--color-status-active-bg)] px-4 py-3 text-sm text-[var(--color-status-active-text)]">
          {actionMessage}
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

      {conflicts.length > 0 && (
        <div className="rounded-[var(--radius-card)] border border-[var(--color-status-inactive-text)] bg-[var(--color-status-inactive-bg)] p-4">
          <p className="text-sm font-medium text-[var(--color-status-inactive-text)]">Conflicts found:</p>
          <ul className="mt-2 list-inside list-disc text-sm text-[var(--color-status-inactive-text)]">
            {conflicts.map((c, i) => (
              <li key={i}>
                <span className="font-medium">{c.type.replace(/_/g, " ")}:</span> {c.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {!scopeReady && (
        <div className="flex flex-col items-center gap-2 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface px-6 py-16 text-center">
          <Calendar className="h-8 w-8 text-[var(--color-muted-2)]" />
          <p className="text-sm font-medium text-heading">Select a scope above to view its routine</p>
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
        <div className="overflow-x-auto rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface">
          <table className="w-full min-w-[700px] text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-left text-xs font-medium uppercase tracking-wide text-muted">
                <th className="px-3 py-3">Period</th>
                {WORKING_DAYS.map((day) => (
                  <th key={day} className="px-3 py-3">
                    {DAY_LABELS[day]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {periods.map((period) => (
                <tr key={period._id}>
                  <td className="whitespace-nowrap px-3 py-3 text-xs text-muted">
                    P{period.periodNumber}
                    <br />
                    {period.startTime}–{period.endTime}
                  </td>
                  {WORKING_DAYS.map((day) => {
                    const entry = cellFor(day, period.periodNumber);
                    return (
                      <td key={day} className="px-2 py-2 align-top">
                        {entry ? (
                          <div
                            className={`rounded-[var(--radius-control)] p-2 text-xs ${
                              entry.status === "LOCKED"
                                ? "bg-[var(--color-status-inactive-bg)]"
                                : entry.status === "ACTIVE"
                                  ? "bg-[var(--color-status-active-bg)]"
                                  : "bg-[var(--color-status-draft-bg)]"
                            }`}
                          >
                            <p className="font-medium text-heading">
                              {typeof entry.subjectId === "string" ? entry.subjectId : entry.subjectId.subjectName}
                            </p>
                            <p className="text-muted">
                              {typeof entry.teacherId === "string"
                                ? entry.teacherId
                                : entry.teacherId.personalInfo.fullName}
                            </p>
                            <p className="text-[var(--color-muted-2)]">
                              {typeof entry.roomId === "string" ? entry.roomId : entry.roomId.roomNumber}
                            </p>
                          </div>
                        ) : (
                          <div className="rounded-[var(--radius-control)] border border-dashed border-[var(--color-border)] p-2 text-center text-[var(--color-muted-2)]">
                            —
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
