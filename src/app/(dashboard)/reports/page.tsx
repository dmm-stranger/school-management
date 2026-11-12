"use client";

import Link from "next/link";
import { BarChart3, AlertCircle, FileText, Clock } from "lucide-react";
import { useReportTemplates, useReportHistory } from "@/features/report/report.queries";
import type { ReportTemplate } from "@/features/report/report.types";
import { Button } from "@/components/ui/Button";
import { formatDateTime } from "@/lib/format";
import { messageFrom } from "@/lib/form-errors";

/** Group by the module the report reads from, keeping the order the server sent. */
const groupByModule = (templates: ReportTemplate[]) => {
  const groups = new Map<string, ReportTemplate[]>();
  for (const t of templates) groups.set(t.module, [...(groups.get(t.module) ?? []), t]);
  return [...groups.entries()];
};

function RecentReports() {
  const { data, isLoading, isError } = useReportHistory();
  if (isError || (!isLoading && (data?.length ?? 0) === 0)) return null; // optional section: stay out of the way

  return (
    <section aria-labelledby="recent-heading" className="flex flex-col gap-3">
      <h2 id="recent-heading" className="text-base font-semibold text-heading">
        Recent reports
      </h2>
      <p className="-mt-2 text-sm text-muted">Generated reports stay available to download for a limited time.</p>
      <div className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface">
        {isLoading ? (
          <div className="h-16 animate-pulse bg-[var(--color-surface-alt)]" />
        ) : (
          <ul className="divide-y divide-[var(--color-border)]">
            {data!.map((r) => (
              <li key={r.id}>
                <Link href={`/reports/view/${r.id}`} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 hover:bg-[var(--color-surface-alt)]">
                  <span className="min-w-0">
                    <span className="block font-medium text-heading">{r.templateTitle}</span>
                    <span className="block truncate text-xs text-muted">{r.filterSummary.join(" · ") || "No filters"}</span>
                  </span>
                  <span className="flex flex-col items-end text-xs text-muted">
                    <span>{r.rowCount} rows</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Available until {formatDateTime(r.expiresAt)}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export default function ReportsPage() {
  const { data: templates, isLoading, isError, error, refetch } = useReportTemplates();

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-heading">Reports</h1>
        <p className="mt-1 text-sm text-muted">Pick a report, choose what it should cover, then preview and download it. Reports only read your data — they never change it.</p>
      </div>

      {isLoading && (
        <div className="grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-[var(--radius-card)] bg-[var(--color-surface-alt)]" />
          ))}
        </div>
      )}

      {isError && (
        <div className="flex flex-col items-center gap-3 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface px-6 py-14 text-center">
          <AlertCircle className="h-8 w-8 text-danger" />
          <p className="text-sm text-muted">{messageFrom(error, "Couldn't load the reports.")}</p>
          <Button variant="secondary" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      {!isLoading && !isError && (templates?.length ?? 0) === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface px-6 py-14 text-center">
          <BarChart3 className="h-8 w-8 text-[var(--color-muted-2)]" />
          <p className="text-sm font-medium text-heading">No reports available to you</p>
          <p className="text-sm text-muted">Each report needs access to the part of the system it covers. Ask an administrator if you need one.</p>
        </div>
      )}

      {!isLoading &&
        !isError &&
        groupByModule(templates ?? []).map(([module, list]) => (
          <section key={module} aria-label={`${module} reports`} className="flex flex-col gap-3">
            <h2 className="text-base font-semibold text-heading">{module}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {list.map((t) => (
                <Link key={t.key} href={`/reports/new/${t.key}`} className="group flex flex-col gap-1.5 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface p-4 transition-colors hover:border-primary">
                  <span className="flex items-center gap-2 font-medium text-heading group-hover:text-primary">
                    <FileText className="h-4 w-4 text-muted" /> {t.title}
                  </span>
                  <span className="text-sm text-muted">{t.description}</span>
                </Link>
              ))}
            </div>
          </section>
        ))}

      <RecentReports />
    </div>
  );
}
