"use client";

import { ReactNode, useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { MobileDrawer } from "./MobileDrawer";
import { Breadcrumbs } from "./Breadcrumbs";

export function AppShell({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background print:block print:h-auto print:overflow-visible">
      <Sidebar collapsed={collapsed} />
      <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex flex-1 flex-col overflow-hidden print:block print:overflow-visible">
        <Header
          onToggleSidebar={() => setCollapsed((v) => !v)}
          onToggleMobileMenu={() => setMobileOpen(true)}
        />
        <div className="border-b border-[var(--color-border)] bg-surface px-6 py-3 print:hidden">
          <Breadcrumbs />
        </div>
        <main className="flex-1 overflow-y-auto p-6 print:overflow-visible print:p-0">{children}</main>
      </div>
    </div>
  );
}
