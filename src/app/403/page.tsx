import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-md text-center">
        <p className="text-sm font-semibold text-primary">403</p>
        <h1 className="mt-2 text-2xl font-semibold text-heading">
          You don&apos;t have permission to view this page
        </h1>
        <p className="mt-2 text-sm text-muted">
          If you think this is a mistake, contact your school administrator.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-flex items-center justify-center rounded-[var(--radius-control)] bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)]"
        >
          Back to sign in
        </Link>
      </div>
    </main>
  );
}
