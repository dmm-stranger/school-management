export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <div className="w-full max-w-lg rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface p-8 shadow-sm">
        <span className="inline-block rounded-[var(--radius-pill)] bg-[var(--color-primary-light)] px-3 py-1 text-xs font-medium text-primary">
          Phase 0 — Foundation
        </span>

        <h1 className="mt-4 text-2xl font-semibold text-heading">
          School ERP
        </h1>
        <p className="mt-2 text-sm text-muted">
          Frontend scaffold is running with your design tokens wired in:
          primary blue, Poppins headings, Inter body text, 12px card radius.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          <span className="rounded-[var(--radius-control)] bg-primary px-3 py-1.5 text-sm font-medium text-white">
            Primary
          </span>
          <span className="rounded-[var(--radius-control)] bg-success px-3 py-1.5 text-sm font-medium text-white">
            Success
          </span>
          <span className="rounded-[var(--radius-control)] bg-warning px-3 py-1.5 text-sm font-medium text-white">
            Warning
          </span>
          <span className="rounded-[var(--radius-control)] bg-danger px-3 py-1.5 text-sm font-medium text-white">
            Danger
          </span>
          <span className="rounded-[var(--radius-control)] bg-purple px-3 py-1.5 text-sm font-medium text-white">
            Purple
          </span>
        </div>
      </div>
    </main>
  );
}
