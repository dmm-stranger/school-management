"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, AlertCircle, Clock, Download, Printer, AlertTriangle, FileX } from "lucide-react";
import { useReportPage, useExportReport, useFetchAllRows } from "@/features/report/report.queries";
import { EXPORT_FORMATS, type ExportFormat, type ReportPage } from "@/features/report/report.types";
import { ReportTable } from "@/features/report/ReportTable";
import { formatReportCell } from "@/features/report/report.format";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { formatDateTime } from "@/lib/format";
import { ApiClientError } from "@/lib/api-client";
import { messageFrom } from "@/lib/form-errors";

const PAGE_SIZE = 50;

export default function ReportViewPage() {
  const { id } = useParams<{ id: string }>();
  const [page, setPage] = useState(1);
  const { data, isLoading, isError, error, isFetching } = useReportPage(id, page, PAGE_SIZE);
  const exportReport = useExportReport();
  const fetchAll = useFetchAllRows();
  const [exporting, setExporting] = useState<ExportFormat | null>(null);
  const [printData, setPrintData] = useState<ReportPage | null>(null);

  // Print: the whole report is fetched first (the on-screen table is paged), rendered into a
  // print-only block, then the browser's print dialog opens. `afterprint` clears the block.
  useEffect(() => {
    if (!printData) return;
    const clear = () => setPrintData(null);
    window.addEventListener("afterprint", clear, { once: true });
    const t = setTimeout(() => window.print(), 50); // let the print block render first
    return () => {
      clearTimeout(t);
      window.removeEventListener("afterprint", clear);
    };
  }, [printData]);

  const handleExport = (format: ExportFormat) => {
    setExporting(format);
    exportReport.mutate({ id, format }, { onSettled: () => setExporting(null) });
  };

  const handlePrint = () => fetchAll.mutate(id, { onSuccess: (all) => setPrintData(all) });

  if (isLoading) return <div className="h-72 animate-pulse rounded-[var(--radius-card)] bg-[var(--color-surface-alt)]" />;

  if (isError || !data) {
    const gone = error instanceof ApiClientError && error.statusCode === 410;
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 py-16 text-center">
        {gone ? <FileX className="h-8 w-8 text-muted" /> : <AlertCircle className="h-8 w-8 text-danger" />}
        <p className="text-sm font-medium text-heading">{gone ? "This report has expired" : "Couldn't open this report"}</p>
        <p className="text-sm text-muted">{messageFrom(error, "Something went wrong.")}</p>
        <Link href="/reports">
          <Button>Back to reports</Button>
        </Link>
      </div>
    );
  }

  const stats = data.summary.filter((s) => s.type !== "string");
  const notes = data.summary.filter((s) => s.type === "string");

  return (
    <>
      <div className="mx-auto flex max-w-5xl flex-col gap-5 print:hidden">
        <div>
          <Link href="/reports" className="inline-flex items-center gap-1 text-sm text-muted hover:text-heading">
            <ArrowLeft className="h-4 w-4" /> All reports
          </Link>
          <h1 className="mt-2 text-2xl font-semibold text-heading">{data.templateTitle}</h1>
          {data.filterSummary.length > 0 && (
            <ul className="mt-2 flex flex-wrap gap-2">
              {data.filterSummary.map((f) => (
                <li key={f} className="rounded-[var(--radius-pill)] bg-[var(--color-surface-alt)] px-2.5 py-0.5 text-xs text-muted">
                  {f}
                </li>
              ))}
            </ul>
          )}
          <p className="mt-2 flex items-center gap-1.5 text-xs text-muted">
            <Clock className="h-3.5 w-3.5" /> Generated {formatDateTime(data.createdAt)} · downloadable until {formatDateTime(data.expiresAt)}
          </p>
        </div>

        {data.truncated && (
          <p role="status" className="flex items-start gap-2 rounded-[var(--radius-control)] bg-[var(--color-status-pending-bg)] px-4 py-3 text-sm text-[var(--color-status-pending-text)]">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            Only the first {data.rowCount.toLocaleString()} rows are included. Narrow the filters (a shorter date range, or one class) to see the rest.
          </p>
        )}

        {stats.length > 0 && (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface p-4">
                <p className="text-sm text-muted">{s.label}</p>
                <p className="mt-1 text-xl font-semibold text-heading">{formatReportCell(s.value, s.type)}</p>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Export this report">
          {EXPORT_FORMATS.map((f) => (
            <Button key={f.value} variant="secondary" isLoading={exporting === f.value} disabled={exporting !== null && exporting !== f.value} onClick={() => handleExport(f.value)}>
              <Download className="h-4 w-4" /> {f.label}
            </Button>
          ))}
          <Button variant="secondary" isLoading={fetchAll.isPending} onClick={handlePrint}>
            <Printer className="h-4 w-4" /> Print
          </Button>
        </div>

        {(exportReport.isError || fetchAll.isError) && (
          <p role="alert" className="rounded-[var(--radius-control)] bg-[var(--color-status-inactive-bg)] px-4 py-3 text-sm text-[var(--color-status-inactive-text)]">
            {messageFrom(exportReport.error || fetchAll.error, "We couldn't prepare that file. Please try again.")}
          </p>
        )}

        <div className={`overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface ${isFetching ? "opacity-70" : ""}`}>
          {data.rows.length === 0 ? (
            <p className="px-6 py-14 text-center text-sm text-muted">No records match these filters.</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <ReportTable columns={data.columns} rows={data.rows} />
              </div>
              <Pagination page={data.pagination.page} pages={data.pagination.pages} total={data.pagination.total} onPageChange={setPage} />
            </>
          )}
        </div>

        {notes.map((n) => (
          <p key={n.label} className="text-xs text-muted">
            <span className="font-medium">{n.label}:</span> {String(n.value)}
          </p>
        ))}
      </div>

      {/* Print-only: every row, no app chrome. Hidden on screen, shown by the browser's print stylesheet. */}
      {printData && (
        <div className="hidden print:block">
          <h1 className="text-lg font-semibold">{printData.templateTitle}</h1>
          {printData.filterSummary.length > 0 && <p className="text-xs">{printData.filterSummary.join(" · ")}</p>}
          <p className="mb-3 text-[10px] text-muted">Generated {formatDateTime(printData.createdAt)}</p>
          {printData.truncated && <p className="mb-2 text-[10px] font-semibold">Showing the first {printData.rowCount} rows — narrow the filters to see the rest.</p>}
          <ReportTable columns={printData.columns} rows={printData.rows} print />
          <div className="mt-3 text-[10px]">
            {printData.summary.map((s) => (
              <p key={s.label}>
                <span className="font-semibold">{s.label}:</span> {formatReportCell(s.value, s.type)}
              </p>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
