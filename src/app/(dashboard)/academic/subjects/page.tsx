"use client";

import { useEffect, useState, useCallback, FormEvent } from "react";
import { BookOpen, Plus, AlertCircle, X } from "lucide-react";
import { subjectApi } from "@/features/subject/subject.api";
import type { Subject } from "@/features/subject/subject.types";
import { academicStructureApi } from "@/features/academic-structure/academicStructure.api";
import type { AcademicClass, AcademicGroup } from "@/features/academic-structure/academicStructure.types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ApiClientError } from "@/lib/api-client";

function ListSkeleton() {
  return (
    <div className="divide-y divide-[var(--color-border)]">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3.5">
          <div className="h-3 w-1/4 animate-pulse rounded bg-[var(--color-surface-alt)]" />
          <div className="h-3 w-1/6 animate-pulse rounded bg-[var(--color-surface-alt)]" />
        </div>
      ))}
    </div>
  );
}

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<AcademicClass[]>([]);
  const [groups, setGroups] = useState<AcademicGroup[]>([]);
  const [classFilter, setClassFilter] = useState("");
  const [groupFilter, setGroupFilter] = useState("");
  const [loadState, setLoadState] = useState<"loading" | "loaded" | "error">("loading");
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [subjectCode, setSubjectCode] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [formClassId, setFormClassId] = useState("");
  const [formGroup, setFormGroup] = useState("");
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    queueMicrotask(async () => {
      try {
        const [classData, groupData] = await Promise.all([
          academicStructureApi.listClasses(),
          academicStructureApi.listGroups(),
        ]);
        setClasses(classData);
        setGroups(groupData);
      } catch {
        // class/group dropdowns will just be empty; main list load still runs
      }
    });
  }, []);

  const fetchSubjects = useCallback(async () => {
    setLoadState("loading");
    try {
      const result = await subjectApi.list({
        limit: 100,
        classId: classFilter || undefined,
        group: groupFilter || undefined,
      });
      setSubjects(result.data);
      setLoadState("loaded");
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to load subjects.");
      setLoadState("error");
    }
  }, [classFilter, groupFilter]);

  useEffect(() => {
    queueMicrotask(() => {
      fetchSubjects();
    });
  }, [fetchSubjects]);

  const resetForm = () => {
    setSubjectCode("");
    setSubjectName("");
    setFormClassId("");
    setFormGroup("");
    setFormErrors({});
    setFormError(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!subjectCode.trim()) errs.subjectCode = "Subject code is required.";
    if (!subjectName.trim()) errs.subjectName = "Subject name is required.";
    if (!formClassId) errs.classId = "Select a class.";
    setFormErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setIsSubmitting(true);
    setFormError(null);
    try {
      await subjectApi.create({
        subjectCode: subjectCode.trim(),
        subjectName: subjectName.trim(),
        classId: formClassId,
        group: formGroup || undefined,
      });
      resetForm();
      setShowForm(false);
      fetchSubjects();
    } catch (err) {
      setFormError(err instanceof ApiClientError ? err.message : "Failed to create subject.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedClass = classes.find((c) => c._id === formClassId);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-heading">Subjects</h1>
          <p className="mt-1 text-sm text-muted">Manage subjects across all classes and groups.</p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "Cancel" : "Add Subject"}
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
              label="Subject Code"
              required
              value={subjectCode}
              onChange={(e) => setSubjectCode(e.target.value)}
              error={formErrors.subjectCode}
              placeholder="9-PHY"
            />
            <Input
              label="Subject Name"
              required
              value={subjectName}
              onChange={(e) => setSubjectName(e.target.value)}
              error={formErrors.subjectName}
              placeholder="Physics"
            />
            <Select
              label="Class"
              required
              placeholder="Select class"
              value={formClassId}
              onChange={(e) => {
                setFormClassId(e.target.value);
                setFormGroup("");
              }}
              error={formErrors.classId}
              options={classes.map((c) => ({ value: c._id, label: c.name }))}
            />
            <Select
              label="Group"
              placeholder={selectedClass?.hasGroups ? "Select group (or leave common)" : "Not applicable"}
              value={formGroup}
              onChange={(e) => setFormGroup(e.target.value)}
              disabled={!selectedClass?.hasGroups}
              options={groups.map((g) => ({ value: g._id, label: g.name }))}
              hint={
                selectedClass?.hasGroups
                  ? "Leave unselected for a subject common to all groups."
                  : "This class doesn't use groups."
              }
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" isLoading={isSubmitting}>
              {isSubmitting ? "Creating…" : "Create Subject"}
            </Button>
          </div>
        </form>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <select
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
          className="rounded-[var(--radius-control)] border border-[var(--color-border)] bg-surface px-3 py-2 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-[var(--color-primary-light)]"
          aria-label="Filter by class"
        >
          <option value="">All Classes</option>
          {classes.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={groupFilter}
          onChange={(e) => setGroupFilter(e.target.value)}
          className="rounded-[var(--radius-control)] border border-[var(--color-border)] bg-surface px-3 py-2 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-[var(--color-primary-light)]"
          aria-label="Filter by group"
        >
          <option value="">All Groups</option>
          {groups.map((g) => (
            <option key={g._id} value={g._id}>
              {g.name}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface">
        {loadState === "loading" && <ListSkeleton />}

        {loadState === "error" && (
          <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
            <AlertCircle className="h-8 w-8 text-danger" />
            <p className="text-sm font-medium text-heading">Couldn&apos;t load subjects</p>
            <p className="text-sm text-muted">{error}</p>
            <Button variant="secondary" onClick={fetchSubjects}>
              Retry
            </Button>
          </div>
        )}

        {loadState === "loaded" && subjects.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
            <BookOpen className="h-8 w-8 text-[var(--color-muted-2)]" />
            <p className="text-sm font-medium text-heading">No subjects found</p>
            <p className="text-sm text-muted">
              Run <code className="rounded bg-[var(--color-surface-alt)] px-1.5 py-0.5">yarn seed:academic</code> on
              the backend, or add one above.
            </p>
          </div>
        )}

        {loadState === "loaded" && subjects.length > 0 && (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-left text-xs font-medium uppercase tracking-wide text-muted">
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Class</th>
                <th className="px-4 py-3">Group</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {subjects.map((s) => (
                <tr key={s._id} className="hover:bg-[var(--color-surface-alt)]">
                  <td className="px-4 py-3 font-medium text-heading">{s.subjectName}</td>
                  <td className="px-4 py-3 text-muted">{s.subjectCode}</td>
                  <td className="px-4 py-3 text-muted">
                    {typeof s.classId === "string" ? s.classId : s.classId.name}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {!s.group ? "Common" : typeof s.group === "string" ? s.group : s.group.name}
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
