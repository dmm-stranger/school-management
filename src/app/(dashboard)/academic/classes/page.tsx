"use client";

import { useEffect, useState } from "react";
import { Building2, AlertCircle, Users } from "lucide-react";
import { academicStructureApi } from "@/features/academic-structure/academicStructure.api";
import type { AcademicClass, AcademicSection } from "@/features/academic-structure/academicStructure.types";
import { Button } from "@/components/ui/Button";
import { ApiClientError } from "@/lib/api-client";

function GridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="h-28 animate-pulse rounded-[var(--radius-card)] bg-[var(--color-surface-alt)]" />
      ))}
    </div>
  );
}

export default function ClassesPage() {
  const [classes, setClasses] = useState<AcademicClass[]>([]);
  const [sections, setSections] = useState<AcademicSection[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "loaded" | "error">("loading");
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoadState("loading");
    try {
      const [classData, sectionData] = await Promise.all([
        academicStructureApi.listClasses(),
        academicStructureApi.listSections(),
      ]);
      setClasses(classData);
      setSections(sectionData);
      setLoadState("loaded");
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Failed to load classes.");
      setLoadState("error");
    }
  };

  useEffect(() => {
    queueMicrotask(() => {
      fetchData();
    });
  }, []);

  const sectionsForClass = (classId: string) =>
    sections.filter((s) => {
      const cid = typeof s.classId === "string" ? s.classId : s.classId._id;
      return cid === classId;
    });

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold text-heading">Classes</h1>
        <p className="mt-1 text-sm text-muted">
          Classes and sections are fixed reference data — seeded once, not editable here.
        </p>
      </div>

      {loadState === "loading" && <GridSkeleton />}

      {loadState === "error" && (
        <div className="flex flex-col items-center gap-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface px-6 py-16 text-center">
          <AlertCircle className="h-8 w-8 text-danger" />
          <p className="text-sm font-medium text-heading">Couldn&apos;t load classes</p>
          <p className="text-sm text-muted">{error}</p>
          <Button variant="secondary" onClick={fetchData}>
            Retry
          </Button>
        </div>
      )}

      {loadState === "loaded" && classes.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface px-6 py-16 text-center">
          <Building2 className="h-8 w-8 text-[var(--color-muted-2)]" />
          <p className="text-sm font-medium text-heading">No classes found</p>
          <p className="text-sm text-muted">
            Run <code className="rounded bg-[var(--color-surface-alt)] px-1.5 py-0.5">yarn seed:academic</code> on
            the backend to populate classes and sections.
          </p>
        </div>
      )}

      {loadState === "loaded" && classes.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((klass) => (
            <div
              key={klass._id}
              className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface p-5"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-heading">{klass.name}</h3>
                {klass.hasGroups && (
                  <span className="rounded-[var(--radius-pill)] bg-[var(--color-status-draft-bg)] px-2 py-0.5 text-[11px] font-medium text-[var(--color-status-draft-text)]">
                    Has Groups
                  </span>
                )}
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {sectionsForClass(klass._id).map((section) => (
                  <span
                    key={section._id}
                    className="inline-flex items-center gap-1 rounded-[var(--radius-control)] bg-[var(--color-surface-alt)] px-2 py-1 text-xs text-text"
                  >
                    <Users className="h-3 w-3 text-muted" />
                    Section {section.name} · {section.capacity}
                  </span>
                ))}
                {sectionsForClass(klass._id).length === 0 && (
                  <span className="text-xs text-muted">No sections seeded</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
