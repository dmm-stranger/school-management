"use client";

import { RequireAuth } from "@/features/auth/RequireAuth";
import { useAuth } from "@/features/auth/AuthContext";
import { Button } from "@/components/ui/Button";

function DashboardContent() {
  const { user, logout } = useAuth();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6">
      <div className="w-full max-w-lg rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface p-8 shadow-sm">
        <span className="inline-block rounded-[var(--radius-pill)] bg-[var(--color-status-active-bg)] px-3 py-1 text-xs font-medium text-[var(--color-status-active-text)]">
          Authenticated
        </span>
        <h1 className="mt-4 text-2xl font-semibold text-heading">
          Welcome, {user?.email}
        </h1>
        <p className="mt-2 text-sm text-muted">
          Roles: {user?.roles.map((r) => r.label).join(", ") || "None assigned"}
        </p>
        <p className="mt-1 text-sm text-muted">
          This is a Phase 1 placeholder. Role-specific dashboard shells (Admin, Teacher,
          Student, Guardian, etc.) are built in Phase 2 per FRONTEND-WORKING-FLOW.md.
        </p>
        <Button variant="secondary" onClick={logout} className="mt-6">
          Sign out
        </Button>
      </div>
    </main>
  );
}

export default function DashboardPage() {
  return (
    <RequireAuth>
      <DashboardContent />
    </RequireAuth>
  );
}
