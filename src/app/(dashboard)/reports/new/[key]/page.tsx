"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, AlertCircle, FileSearch } from "lucide-react";
import { useReportTemplates, useGenerateReport } from "@/features/report/report.queries";
import { FilterField } from "@/features/report/FilterFields";
import { Button } from "@/components/ui/Button";
import { fieldErrorsFrom, messageFrom } from "@/lib/form-errors";

export default function NewReportPage() {
  const { key } = useParams<{ key: string }>();
  const router = useRouter();
  const { data: templates, isLoading, isError, error, refetch } = useReportTemplates();
  const generate = useGenerateReport();

  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const template = templates?.find((t) => t.key === key);

  const setValue = (field: string, value: string) => {
    setValues((v) => {
      const next = { ...v, [field]: value };
      if (field === "classId") next.sectionId = ""; // a section belongs to one class
      return next;
    });
    setErrors((e) => ({ ...e, [field]: "" }));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!template) return;

    const errs: Record<string, string> = {};
    for (const f of template.filters) {
      if (f.required && !values[f.key]) errs[f.key] = `${f.label} is required.`;
    }
    if (values.from && values.to && values.from > values.to) errs.to = "“From” must not be after “To”.";
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    // Blank optional filters are simply omitted rather than sent as empty strings.
    const filters = Object.fromEntries(Object.entries(values).filter(([, v]) => v !== ""));
    try {
      const report = await generate.mutateAsync({ templateKey: template.key, filters });
      router.push(`/reports/view/${report.id}`);
    } catch (err) {
      setErrors(fieldErrorsFrom(err));
    }
  };

  if (isLoading) return <div className="mx-auto h-64 max-w-xl animate-pulse rounded-[var(--radius-card)] bg-[var(--color-surface-alt)]" />;

  if (isError) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 py-16 text-center">
        <AlertCircle className="h-8 w-8 text-danger" />
        <p className="text-sm text-muted">{messageFrom(error, "Couldn't load this report.")}</p>
        <Button variant="secondary" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  }

  // The catalog only contains reports THIS user may run, so "not in the list" covers both
  // "doesn't exist" and "you don't have access" without revealing which.
  if (!template) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 py-16 text-center">
        <FileSearch className="h-8 w-8 text-muted" />
        <p className="text-sm font-medium text-heading">Report not available</p>
        <p className="text-sm text-muted">It may not exist, or you may not have access to it.</p>
        <Link href="/reports">
          <Button>Back to reports</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-5">
      <div>
        <Link href="/reports" className="inline-flex items-center gap-1 text-sm text-muted hover:text-heading">
          <ArrowLeft className="h-4 w-4" /> All reports
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-heading">{template.title}</h1>
        <p className="mt-1 text-sm text-muted">{template.description}</p>
      </div>

      {generate.isError && Object.keys(errors).length === 0 && (
        <p role="alert" className="rounded-[var(--radius-control)] bg-[var(--color-status-inactive-bg)] px-4 py-3 text-sm text-[var(--color-status-inactive-text)]">
          {messageFrom(generate.error, "We couldn't generate this report. Please try again.")}
        </p>
      )}

      <form onSubmit={submit} noValidate className="flex flex-col gap-4 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface p-6">
        {template.filters.length === 0 ? (
          <p className="text-sm text-muted">This report has no filters — it covers everything.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {template.filters.map((f) => (
              <FilterField key={f.key} def={f} values={values} errors={errors} onChange={setValue} />
            ))}
          </div>
        )}
        <div className="flex justify-end gap-2">
          <Link href="/reports">
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </Link>
          <Button type="submit" isLoading={generate.isPending}>
            {generate.isPending ? "Generating…" : "Generate report"}
          </Button>
        </div>
      </form>
    </div>
  );
}
