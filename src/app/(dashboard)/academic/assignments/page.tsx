"use client";

import { useEffect, useState, useCallback, FormEvent } from "react";
import { Users, Plus, AlertCircle, X, Trash2 } from "lucide-react";
import { assignmentApi } from "@/features/teacher-assignment/teacherAssignment.api";
import type { TeacherAssignment } from "@/features/teacher-assignment/teacherAssignment.types";
import { academicStructureApi } from "@/features/academic-structure/academicStructure.api";
import type { AcademicClass, AcademicSection, AcademicGroup } from "@/features/academic-structure/academicStructure.types";
import { subjectApi } from "@/features/subject/subject.api";
import type { Subject } from "@/features/subject/subject.types";
import { academicYearApi } from "@/features/academic-year/academicYear.api";
import type { AcademicYear } from "@/features/academic-year/academicYear.types";
import { teacherApi } from "@/features/teacher/teacher.api";
import type { TeacherOption } from "@/features/teacher/teacher.types";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ApiClientError } from "@/lib/api-client";

const teacherLabel = (t: TeacherAssignment["teacherId"]) =>
  typeof t === "string" ? t : `${t.personalInfo.fullName} (${t.employeeId})`;

export default function TeacherAssignmentsPage() {
  const [assignments, setAssignments] = useState<TeacherAssignment[]>([]);
  const [classes, setClasses] = useState<AcademicClass[]>([]);
  const [sections, setSections] = useState<AcademicSection[]>([]);
  const [groups, setGroups] = useState<AcademicGroup[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [teachers, setTeachers] = useState<TeacherOption[]>([]);

  const [loadState, setLoadState] = useState<"loading" | "loaded" | "error">("loading");
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [teacherId, setTeacherId] = useState("");
  const [academicYearId, setAcademicYearId] = useState("");
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [groupId, setGroupId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [isClassTeacher, setIsClassTeacher] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedClass = classes.find((c) => c._id === classId);
  const sectionsForClass = sections.filter((s) => {
    const cid = typeof s.classId === "string" ? s.classId : s.classId._id;
    return cid === classId;
  });
  const subjectsForClass = subjects.filter((s) => {
    const cid = typeof s.classId === "string" ? s.classId : s.classId._id;
    return cid === classId;
  });

  const fetchAssignments = useCallback(async () => {
    setLoadState("loading");
    try {
      const result = await assignmentApi.list({ limit: 100 });
      setAssignments(result.data);
      setLoadState("loaded");
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to load assignments.");
      setLoadState("error");
    }
  }, []);

  useEffect(() => {
    queueMicrotask(async () => {
      try {
        const [classData, sectionData, groupData, subjectData, yearData, teacherData] = await Promise.all([
          academicStructureApi.listClasses(),
          academicStructureApi.listSections(),
          academicStructureApi.listGroups(),
          subjectApi.list({ limit: 200 }),
          academicYearApi.list(),
          teacherApi.list(),
        ]);
        setClasses(classData);
        setSections(sectionData);
        setGroups(groupData);
        setSubjects(subjectData.data);
        setYears(yearData.data);
        setTeachers(teacherData.data);
      } catch {
        // dropdown data failing to load is surfaced implicitly by empty selects
      }
      fetchAssignments();
    });
  }, [fetchAssignments]);

  const resetForm = () => {
    setTeacherId("");
    setAcademicYearId("");
    setClassId("");
    setSectionId("");
    setGroupId("");
    setSubjectId("");
    setIsClassTeacher(false);
    setFormErrors({});
    setFormError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!teacherId) errs.teacherId = "Select a teacher.";
    if (!academicYearId) errs.academicYearId = "Select an academic year.";
    if (!classId) errs.classId = "Select a class.";
    if (!sectionId) errs.sectionId = "Select a section.";
    if (!subjectId) errs.subjectId = "Select a subject.";
    if (selectedClass?.hasGroups && !groupId) errs.groupId = "This class requires a group.";
    setFormErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setIsSubmitting(true);
    setFormError(null);
    try {
      await assignmentApi.create({
        teacherId,
        academicYearId,
        classId,
        sectionId,
        groupId: groupId || undefined,
        subjectId,
        isClassTeacher,
      });
      resetForm();
      setShowForm(false);
      fetchAssignments();
    } catch (err) {
      setFormError(err instanceof ApiClientError ? err.message : "Failed to create assignment.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await assignmentApi.delete(id);
      fetchAssignments();
    } catch {
      // list stays as-is; a toast system will surface this once built
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-heading">Teacher Assignments</h1>
          <p className="mt-1 text-sm text-muted">
            Assign teachers to subjects for a class and section. Each section can have only one class teacher.
          </p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "Cancel" : "Add Assignment"}
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
              label="Teacher"
              required
              placeholder="Select teacher"
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
              error={formErrors.teacherId}
              options={teachers.map((t) => ({ value: t._id, label: `${t.personalInfo.fullName} (${t.employeeId})` }))}
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
          </div>

          <label className="flex items-center gap-2 text-sm text-text">
            <input
              type="checkbox"
              checked={isClassTeacher}
              onChange={(e) => setIsClassTeacher(e.target.checked)}
              className="h-4 w-4 rounded border-[var(--color-border)] text-primary focus:ring-primary"
            />
            Make this teacher the Class Teacher for this section
          </label>

          <div className="flex justify-end">
            <Button type="submit" isLoading={isSubmitting}>
              {isSubmitting ? "Assigning…" : "Create Assignment"}
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
            <p className="text-sm font-medium text-heading">Couldn&apos;t load assignments</p>
            <p className="text-sm text-muted">{error}</p>
            <Button variant="secondary" onClick={fetchAssignments}>
              Retry
            </Button>
          </div>
        )}

        {loadState === "loaded" && assignments.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
            <Users className="h-8 w-8 text-[var(--color-muted-2)]" />
            <p className="text-sm font-medium text-heading">No assignments yet</p>
            <p className="text-sm text-muted">Assign a teacher to a subject to get started.</p>
          </div>
        )}

        {loadState === "loaded" && assignments.length > 0 && (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-left text-xs font-medium uppercase tracking-wide text-muted">
                <th className="px-4 py-3">Teacher</th>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Class / Section</th>
                <th className="px-4 py-3">Class Teacher</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {assignments.map((a) => (
                <tr key={a._id} className="hover:bg-[var(--color-surface-alt)]">
                  <td className="px-4 py-3 font-medium text-heading">{teacherLabel(a.teacherId)}</td>
                  <td className="px-4 py-3 text-muted">
                    {typeof a.subjectId === "string" ? a.subjectId : a.subjectId.subjectName}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {typeof a.classId === "string" ? a.classId : a.classId.name} /{" "}
                    {typeof a.sectionId === "string" ? a.sectionId : a.sectionId.name}
                  </td>
                  <td className="px-4 py-3">{a.isClassTeacher ? "Yes" : "—"}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={a.status} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(a._id)}
                      className="text-danger hover:opacity-70"
                      aria-label="Delete assignment"
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
