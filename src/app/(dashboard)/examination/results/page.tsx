"use client";

import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import { examResultApi } from "@/features/exam-result/examResult.api";
import { examApi } from "@/features/exam/exam.api";
import type { Exam } from "@/features/exam/exam.types";
import { academicStructureApi } from "@/features/academic-structure/academicStructure.api";
import type { AcademicClass, AcademicSection, AcademicGroup } from "@/features/academic-structure/academicStructure.types";
import { studentApi } from "@/features/student/student.api";
import type { Student } from "@/features/student/student.types";
import type { ExamResult } from "@/features/exam-result/examResult.types";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ApiClientError } from "@/lib/api-client";

export default function ResultsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [classes, setClasses] = useState<AcademicClass[]>([]);
  const [sections, setSections] = useState<AcademicSection[]>([]);
  const [groups, setGroups] = useState<AcademicGroup[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  const [examId, setExamId] = useState("");
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [groupId, setGroupId] = useState("");
  const [studentId, setStudentId] = useState("");

  const [results, setResults] = useState<ExamResult[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const selectedClass = classes.find((c) => c._id === classId);
  const sectionsForClass = sections.filter((s) => (typeof s.classId === "string" ? s.classId : s.classId._id) === classId);

  useEffect(() => {
    queueMicrotask(async () => {
      try {
        const [examData, classData, sectionData, groupData, studentData] = await Promise.all([
          examApi.list(),
          academicStructureApi.listClasses(),
          academicStructureApi.listSections(),
          academicStructureApi.listGroups(),
          studentApi.list({ limit: 300 }),
        ]);
        setExams(examData.data);
        setClasses(classData);
        setSections(sectionData);
        setGroups(groupData);
        setStudents(studentData.data);
      } catch {
        // pickers stay empty
      }
    });
  }, []);

  const handleGenerate = async () => {
    setBusy("generate");
    setError(null);
    setMessage(null);
    try {
      const result = await examResultApi.generate({
        examId,
        classId,
        sectionId,
        groupId: groupId || undefined,
      });
      setMessage(
        `Generated results for ${result.generated} students${
          result.skipped.length > 0 ? `, ${result.skipped.length} skipped (marks incomplete)` : ""
        }.`
      );
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to generate results.");
    } finally {
      setBusy(null);
    }
  };

  const handlePublish = async () => {
    setBusy("publish");
    setError(null);
    setMessage(null);
    try {
      const result = await examResultApi.publish(examId);
      setMessage(`Published ${result.published} results.`);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to publish results.");
    } finally {
      setBusy(null);
    }
  };

  const handleViewStudent = async () => {
    if (!studentId) return;
    setBusy("view");
    setError(null);
    try {
      const data = await examResultApi.listByStudent(studentId);
      setResults(data);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to load results.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold text-heading">Exam Results</h1>
        <p className="mt-1 text-sm text-muted">
          Generate results from entered marks, then publish. Published results are final.
        </p>
      </div>

      <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface p-6">
        <h2 className="text-sm font-semibold text-heading">Generate &amp; Publish</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Select
            label="Exam"
            placeholder="Select exam"
            value={examId}
            onChange={(e) => setExamId(e.target.value)}
            options={exams.map((ex) => ({ value: ex._id, label: ex.examName }))}
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
        <div className="mt-4 flex gap-3">
          <Button
            variant="secondary"
            isLoading={busy === "generate"}
            disabled={!examId || !classId || !sectionId}
            onClick={handleGenerate}
          >
            Generate Results
          </Button>
          <Button isLoading={busy === "publish"} disabled={!examId} onClick={handlePublish}>
            Publish Results
          </Button>
        </div>
      </div>

      {message && (
        <div className="rounded-[var(--radius-control)] bg-[var(--color-status-active-bg)] px-4 py-3 text-sm text-[var(--color-status-active-text)]">
          {message}
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

      <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface p-6">
        <h2 className="text-sm font-semibold text-heading">View a Student&apos;s Results</h2>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <div className="min-w-[240px] flex-1">
            <Select
              label="Student"
              placeholder="Select student"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              options={students.map((s) => ({ value: s._id, label: `${s.personalInfo.fullName} (${s.studentId})` }))}
            />
          </div>
          <Button variant="secondary" isLoading={busy === "view"} disabled={!studentId} onClick={handleViewStudent}>
            View Results
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface">
        {results.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
            <Trophy className="h-8 w-8 text-[var(--color-muted-2)]" />
            <p className="text-sm font-medium text-heading">No results loaded</p>
            <p className="text-sm text-muted">Select a student above and click &quot;View Results&quot;.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-left text-xs font-medium uppercase tracking-wide text-muted">
                <th className="px-4 py-3">Exam</th>
                <th className="px-4 py-3">Marks</th>
                <th className="px-4 py-3">Percentage</th>
                <th className="px-4 py-3">Grade</th>
                <th className="px-4 py-3">GPA</th>
                <th className="px-4 py-3">Position</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {results.map((r) => (
                <tr key={r._id}>
                  <td className="px-4 py-3 font-medium text-heading">
                    {typeof r.examId === "string" ? r.examId : r.examId.examName}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {r.obtainedMarks} / {r.totalMarks}
                  </td>
                  <td className="px-4 py-3 text-muted">{r.percentage}%</td>
                  <td className="px-4 py-3 font-medium text-heading">{r.grade}</td>
                  <td className="px-4 py-3 text-muted">{r.gpa.toFixed(2)}</td>
                  <td className="px-4 py-3 text-muted">{r.position ?? "—"}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={r.status} />
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
