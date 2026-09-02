import { ReactNode } from "react";
import { RequireAuth } from "@/features/auth/RequireAuth";
import { AppShell } from "@/components/layout/AppShell";

export default function DashboardGroupLayout({ children }: { children: ReactNode }) {
  return (
    <RequireAuth>
      <AppShell>{children}</AppShell>
    </RequireAuth>
  );
}
