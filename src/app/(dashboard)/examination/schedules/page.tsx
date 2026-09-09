"use client";

import { useEffect, useState, useCallback, FormEvent, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { FileText, Plus, AlertCircle, X } from "lucide-react";
import { examScheduleApi } from "@/features/exam-schedule/examSchedule.api";
import type { ExamSchedule } from "@/features/exam-schedule/examSchedule.types";
import { examApi } from "@/features/exam/exam.api";
import type { Exam } from "@/features/exam/exam.types";
import { academicStructureApi } from "@/features/academic-structure/academicStructure.api";
import type { AcademicClass, AcademicSection, AcademicGroup } from "@/features/academic-structure/academicStructure.types";
import { subjectApi } from "@/features/subject/subject.api";
import type { Subject } from "@/features/subject/subject.types";
import { academyApi } from "@/features/academy/academy.api";
import type { Room } from "@/features/academy/academy.types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ApiClientError } from "@/lib/api-client";

function SchedulesContent() {
  const searchParams = useSearchParams();
  const initialExamId = searchParams.get("examId") || "";

  const [schedules, setSchedules] = useState<ExamSchedule[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [classes, setClasses] = useState<AcademicClass[]>([]);
  const [sections, setSections] = useState<AcademicSection[]>([]);
  const [groups, setGroups] = useState<AcademicGroup[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);

  const [examFilter, setExamFilter] = useState(initialExamId);
  const [loadState, setLoadState] = useState<"loading" | "loaded" | "error">("loading");
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [examId, setExamId] = useState(initialExamId);
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [groupId, setGroupId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [examDate, setExamDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [roomId, setRoomId] = useState("");
  const [fullMarks, setFullMarks] = useState("100");
  const [passMarks, setPassMarks] = useState("33");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedClass = classes.find((c) => c._id === classId);
  const sectionsForClass = sections.filter((s) => (typeof s.classId === "string" ? s.classId : s.classId._id) === classId);
  const subjectsForClass = subjects.filter((s) => (typeof s.classId === "string" ? s.classId : s.classId._id) === classId);

  const fetchSchedules = useCallback(async () => {
    setLoadState("loading");
    try {
      const result = await examScheduleApi.list(examFilter || undefined);
      setSchedules(result.data);
      setLoadState("loaded");
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to load exam schedules.");
      setLoadState("error");
    }
  }, [examFilter]);

  useEffect(() => {
    queueMicrotask(async () => {
      try {
        const [examData, classData, sectionData, groupData, subjectData, roomData] = await Promise.all([
          examApi.list(),
          academicStructureApi.listClasses(),
          academicStructureApi.listSections(),
          academicStructureApi.listGroups(),
          subjectApi.list({ limit: 200 }),
          academyApi.list({ limit: 100, roomType: "CLASSROOM" }),
        ]);
        setExams(examData.data);
        setClasses(classData);
        setSections(sectionData);
        setGroups(groupData);
        setSubjects(subjectData.data);
        setRooms(roomData.data);
      } catch {
        // dropdowns stay empty; schedule list still loads
      }
    });
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      fetchSchedules();
    });
  }, [fetchSchedules]);

  const resetForm = () => {
    setClassId("");
    setSectionId("");
    setGroupId("");
    setSubjectId("");
    setExamDate("");
    setStartTime("");
    setEndTime("");
    setRoomId("");
    setFullMarks("100");
    setPassMarks("33");
    setFormErrors({});
    setFormError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!examId) errs.examId = "Select an exam.";
    if (!classId) errs.classId = "Select a class.";
    if (!sectionId) errs.sectionId = "Select a section.";
    if (!subjectId) errs.subjectId = "Select a subject.";
    if (!examDate) errs.examDate = "Select a date.";
    if (!startTime) errs.startTime = "Start time is required.";
    if (!endTime) errs.endTime = "End time is required.";
    if (!roomId) errs.roomId = "Select a room.";
    if (selectedClass?.hasGroups && !groupId) errs.groupId = "This class requires a group.";
    const full = Number(fullMarks);
    const pass = Number(passMarks);
    if (!full || full < 1) errs.fullMarks = "Full marks must be greater than zero.";
    if (pass > full) errs.passMarks = "Pass marks cannot exceed full marks.";
    setFormErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setIsSubmitting(true);
    setFormError(null);
    try {
      await examScheduleApi.create({
        examId,
        classId,
        sectionId,
        groupId: groupId || undefined,
        subjectId,
        examDate,
        startTime,
        endTime,
        roomId,
        fullMarks: full,
        passMarks: pass,
      });
      resetForm();
      setShowForm(false);
      fetchSchedules();
    } catch (err) {
      setFormError(err instanceof ApiClientError ? err.message : "Failed to create exam schedule.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-heading">Exam Schedules</h1>
          <p className="mt-1 text-sm text-muted">Schedule subject exams with a date, room, and mark allocation.</p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "Cancel" : "Add Schedule"}
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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Select
              label="Exam"
              required
              placeholder="Select exam"
              value={examId}
              onChange={(e) => setExamId(e.target.value)}
              error={formErrors.examId}
              options={exams.map((ex) => ({ value: ex._id, label: ex.examName }))}
            />
            <Select
              label="Class"
              required
              placeholder="Select class"
              value={classId}
              onChange={(e) => {
                setClassId(e.target.value);
                setSectionId("");
                setGroupId("");
                setSubjectId("");
              }}
              error={formErrors.classId}
              options={classes.map((c) => ({ value: c._id, label: c.name }))}
            />
            <Select
              label="Section"
              required
              placeholder={classId ? "Select section" : "Select a class first"}
              disabled={!classId}
              value={sectionId}
              onChange={(e) => setSectionId(e.target.value)}
              error={formErrors.sectionId}
              options={sectionsForClass.map((s) => ({ value: s._id, label: `Section ${s.name}` }))}
            />
            <Select
              label="Group"
              placeholder={selectedClass?.hasGroups ? "Select group" : "Not applicable"}
              disabled={!selectedClass?.hasGroups}
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              error={formErrors.groupId}
              options={groups.map((g) => ({ value: g._id, label: g.name }))}
            />
            <Select
              label="Subject"
              required
              placeholder={classId ? "Select subject" : "Select a class first"}
              disabled={!classId}
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              error={formErrors.subjectId}
              options={subjectsForClass.map((s) => ({ value: s._id, label: s.subjectName }))}
            />
            <Select
              label="Room"
              required
              placeholder="Select room"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              error={formErrors.roomId}
              options={rooms.map((r) => ({ value: r._id, label: `${r.buildingName} · ${r.roomNumber}` }))}
            />
            <Input
              label="Exam Date"
              type="date"
              required
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              error={formErrors.examDate}
            />
            <Input
              label="Start Time"
              type="time"
              required
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              error={formErrors.startTime}
            />
            <Input
              label="End Time"
              type="time"
              required
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              error={formErrors.endTime}
            />
            <Input
              label="Full Marks"
              type="number"
              required
              value={fullMarks}
              onChange={(e) => setFullMarks(e.target.value)}
              error={formErrors.fullMarks}
            />
            <Input
              label="Pass Marks"
              type="number"
              required
              value={passMarks}
              onChange={(e) => setPassMarks(e.target.value)}
              error={formErrors.passMarks}
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" isLoading={isSubmitting}>
              {isSubmitting ? "Scheduling…" : "Create Schedule"}
            </Button>
          </div>
        </form>
      )}

      <Select
        label="Filter by Exam"
        placeholder="All exams"
        value={examFilter}
        onChange={(e) => setExamFilter(e.target.value)}
        options={exams.map((ex) => ({ value: ex._id, label: ex.examName }))}
      />

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
            <p className="text-sm font-medium text-heading">Couldn&apos;t load schedules</p>
            <p className="text-sm text-muted">{error}</p>
            <Button variant="secondary" onClick={fetchSchedules}>
              Retry
            </Button>
          </div>
        )}

        {loadState === "loaded" && schedules.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
            <FileText className="h-8 w-8 text-[var(--color-muted-2)]" />
            <p className="text-sm font-medium text-heading">No schedules yet</p>
            <p className="text-sm text-muted">Create an exam schedule to get started.</p>
          </div>
        )}

        {loadState === "loaded" && schedules.length > 0 && (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-left text-xs font-medium uppercase tracking-wide text-muted">
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Class / Section</th>
                <th className="px-4 py-3">Date / Time</th>
                <th className="px-4 py-3">Room</th>
                <th className="px-4 py-3">Marks</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {schedules.map((s) => (
                <tr key={s._id} className="hover:bg-[var(--color-surface-alt)]">
                  <td className="px-4 py-3 font-medium text-heading">
                    {typeof s.subjectId === "string" ? s.subjectId : s.subjectId.subjectName}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {typeof s.classId === "string" ? s.classId : s.classId.name} /{" "}
                    {typeof s.sectionId === "string" ? s.sectionId : s.sectionId.name}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {new Date(s.examDate).toLocaleDateString()} · {s.startTime}–{s.endTime}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {typeof s.roomId === "string" ? s.roomId : s.roomId.roomNumber}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {s.fullMarks} (pass {s.passMarks})
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={s.status} />
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

export default function ExamSchedulesPage() {
  return (
    <Suspense fallback={null}>
      <SchedulesContent />
    </Suspense>
  );
}
