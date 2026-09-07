"use client";

import { useEffect, useState, useCallback, FormEvent } from "react";
import { GraduationCap, Plus, AlertCircle, X, ArrowUpCircle, ArrowRightCircle } from "lucide-react";
import { enrollmentApi } from "@/features/student-enrollment/studentEnrollment.api";
import type { StudentEnrollment } from "@/features/student-enrollment/studentEnrollment.types";
import { academicStructureApi } from "@/features/academic-structure/academicStructure.api";
import type { AcademicClass, AcademicSection, AcademicGroup } from "@/features/academic-structure/academicStructure.types";
import { academicYearApi } from "@/features/academic-year/academicYear.api";
import type { AcademicYear } from "@/features/academic-year/academicYear.types";
import { studentApi } from "@/features/student/student.api";
import type { Student } from "@/features/student/student.types";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ApiClientError } from "@/lib/api-client";

type ActionMode = null | { type: "promote" | "transfer"; enrollment: StudentEnrollment };

export default function StudentEnrollmentsPage() {
  const [enrollments, setEnrollments] = useState<StudentEnrollment[]>([]);
  const [classes, setClasses] = useState<AcademicClass[]>([]);
  const [sections, setSections] = useState<AcademicSection[]>([]);
  const [groups, setGroups] = useState<AcademicGroup[]>([]);
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  const [loadState, setLoadState] = useState<"loading" | "loaded" | "error">("loading");
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [studentId, setStudentId] = useState("");
  const [academicYearId, setAcademicYearId] = useState("");
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [groupId, setGroupId] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [action, setAction] = useState<ActionMode>(null);
  const [actionClassId, setActionClassId] = useState("");
  const [actionSectionId, setActionSectionId] = useState("");
  const [actionGroupId, setActionGroupId] = useState("");
  const [actionYearId, setActionYearId] = useState("");
  const [actionRoll, setActionRoll] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSubmitting, setActionSubmitting] = useState(false);

  const selectedClass = classes.find((c) => c._id === classId);
  const sectionsForClass = (cid: string) =>
    sections.filter((s) => (typeof s.classId === "string" ? s.classId : s.classId._id) === cid);

  const fetchEnrollments = useCallback(async () => {
    setLoadState("loading");
    try {
      const result = await enrollmentApi.list({ limit: 100 });
      setEnrollments(result.data);
      setLoadState("loaded");
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to load enrollments.");
      setLoadState("error");
    }
  }, []);

  useEffect(() => {
    queueMicrotask(async () => {
      try {
        const [classData, sectionData, groupData, yearData, studentData] = await Promise.all([
          academicStructureApi.listClasses(),
          academicStructureApi.listSections(),
          academicStructureApi.listGroups(),
          academicYearApi.list(),
          studentApi.list({ limit: 200 }),
        ]);
        setClasses(classData);
        setSections(sectionData);
        setGroups(groupData);
        setYears(yearData.data);
        setStudents(studentData.data);
      } catch {
        // dropdowns stay empty; main list load still proceeds
      }
      fetchEnrollments();
    });
  }, [fetchEnrollments]);

  const resetForm = () => {
    setStudentId("");
    setAcademicYearId("");
    setClassId("");
    setSectionId("");
    setGroupId("");
    setRollNumber("");
    setFormErrors({});
    setFormError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!studentId) errs.studentId = "Select a student.";
    if (!academicYearId) errs.academicYearId = "Select an academic year.";
    if (!classId) errs.classId = "Select a class.";
    if (!sectionId) errs.sectionId = "Select a section.";
    if (!rollNumber.trim()) errs.rollNumber = "Roll number is required.";
    if (selectedClass?.hasGroups && !groupId) errs.groupId = "This class requires a group.";
    setFormErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setIsSubmitting(true);
    setFormError(null);
    try {
      await enrollmentApi.create({
        studentId,
        academicYearId,
        classId,
        sectionId,
        groupId: groupId || undefined,
        rollNumber: rollNumber.trim(),
      });
      resetForm();
      setShowForm(false);
      fetchEnrollments();
    } catch (err) {
      setFormError(err instanceof ApiClientError ? err.message : "Failed to create enrollment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openAction = (type: "promote" | "transfer", enrollment: StudentEnrollment) => {
    setAction({ type, enrollment });
    setActionClassId("");
    setActionSectionId("");
    setActionGroupId("");
    setActionYearId("");
    setActionRoll("");
    setActionError(null);
  };

  const submitAction = async () => {
    if (!action) return;
    setActionSubmitting(true);
    setActionError(null);
    try {
      if (action.type === "promote") {
        await enrollmentApi.promote({
          enrollmentId: action.enrollment._id,
          toAcademicYearId: actionYearId,
          toClassId: actionClassId,
          toSectionId: actionSectionId,
          toGroupId: actionGroupId || undefined,
          rollNumber: actionRoll.trim(),
        });
      } else {
        await enrollmentApi.transfer({
          enrollmentId: action.enrollment._id,
          toClassId: actionClassId,
          toSectionId: actionSectionId,
          toGroupId: actionGroupId || undefined,
          rollNumber: actionRoll.trim(),
        });
      }
      setAction(null);
      fetchEnrollments();
    } catch (err) {
      setActionError(err instanceof ApiClientError ? err.message : "Action failed.");
    } finally {
      setActionSubmitting(false);
    }
  };

  const actionSelectedClass = classes.find((c) => c._id === actionClassId);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-heading">Student Enrollments</h1>
          <p className="mt-1 text-sm text-muted">
            Enroll students into a class/section, or promote/transfer an existing enrollment.
          </p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "Cancel" : "Enroll Student"}
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
            <Select
              label="Student"
              required
              placeholder="Select student"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              error={formErrors.studentId}
              options={students.map((s) => ({ value: s._id, label: `${s.personalInfo.fullName} (${s.studentId})` }))}
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
                setSectionId("");
                setGroupId("");
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
              options={sectionsForClass(classId).map((s) => ({ value: s._id, label: `Section ${s.name}` }))}
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
            <Input
              label="Roll Number"
              required
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              error={formErrors.rollNumber}
              placeholder="05"
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" isLoading={isSubmitting}>
              {isSubmitting ? "Enrolling…" : "Enroll Student"}
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
            <p className="text-sm font-medium text-heading">Couldn&apos;t load enrollments</p>
            <p className="text-sm text-muted">{error}</p>
            <Button variant="secondary" onClick={fetchEnrollments}>
              Retry
            </Button>
          </div>
        )}

        {loadState === "loaded" && enrollments.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
            <GraduationCap className="h-8 w-8 text-[var(--color-muted-2)]" />
            <p className="text-sm font-medium text-heading">No enrollments yet</p>
            <p className="text-sm text-muted">Enroll a student to get started.</p>
          </div>
        )}

        {loadState === "loaded" && enrollments.length > 0 && (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-left text-xs font-medium uppercase tracking-wide text-muted">
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Class / Section</th>
                <th className="px-4 py-3">Roll</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {enrollments.map((en) => (
                <tr key={en._id} className="hover:bg-[var(--color-surface-alt)]">
                  <td className="px-4 py-3 font-medium text-heading">
                    {typeof en.studentId === "string" ? en.studentId : en.studentId.personalInfo.fullName}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {typeof en.classId === "string" ? en.classId : en.classId.name} /{" "}
                    {typeof en.sectionId === "string" ? en.sectionId : en.sectionId.name}
                  </td>
                  <td className="px-4 py-3 text-muted">{en.rollNumber}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={en.status} />
                  </td>
                  <td className="px-4 py-3">
                    {en.status === "ACTIVE" && (
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => openAction("promote", en)}
                          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                        >
                          <ArrowUpCircle className="h-3.5 w-3.5" />
                          Promote
                        </button>
                        <button
                          onClick={() => openAction("transfer", en)}
                          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                        >
                          <ArrowRightCircle className="h-3.5 w-3.5" />
                          Transfer
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {action && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-[var(--radius-card)] bg-surface p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-heading">
              {action.type === "promote" ? "Promote Student" : "Transfer Student"}
            </h2>
            <p className="mt-1 text-sm text-muted">
              This creates a new enrollment; the current one is preserved as history.
            </p>

            {actionError && (
              <div
                role="alert"
                className="mt-4 rounded-[var(--radius-control)] bg-[var(--color-status-inactive-bg)] px-4 py-3 text-sm text-[var(--color-status-inactive-text)]"
              >
                {actionError}
              </div>
            )}

            <div className="mt-4 flex flex-col gap-3">
              {action.type === "promote" && (
                <Select
                  label="To Academic Year"
                  required
                  placeholder="Select year"
                  value={actionYearId}
                  onChange={(e) => setActionYearId(e.target.value)}
                  options={years.map((y) => ({ value: y._id, label: y.year }))}
                />
              )}
              <Select
                label="To Class"
                required
                placeholder="Select class"
                value={actionClassId}
                onChange={(e) => {
                  setActionClassId(e.target.value);
                  setActionSectionId("");
                  setActionGroupId("");
                }}
                options={classes.map((c) => ({ value: c._id, label: c.name }))}
              />
              <Select
                label="To Section"
                required
                placeholder={actionClassId ? "Select section" : "Select a class first"}
                disabled={!actionClassId}
                value={actionSectionId}
                onChange={(e) => setActionSectionId(e.target.value)}
                options={sectionsForClass(actionClassId).map((s) => ({ value: s._id, label: `Section ${s.name}` }))}
              />
              <Select
                label="To Group"
                placeholder={actionSelectedClass?.hasGroups ? "Select group" : "Not applicable"}
                disabled={!actionSelectedClass?.hasGroups}
                value={actionGroupId}
                onChange={(e) => setActionGroupId(e.target.value)}
                options={groups.map((g) => ({ value: g._id, label: g.name }))}
              />
              <Input
                label="New Roll Number"
                required
                value={actionRoll}
                onChange={(e) => setActionRoll(e.target.value)}
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setAction(null)}>
                Cancel
              </Button>
              <Button onClick={submitAction} isLoading={actionSubmitting}>
                {actionSubmitting ? "Processing…" : action.type === "promote" ? "Promote" : "Transfer"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
