"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useNavigation } from "@/hooks/useNavigation";

interface SidebarProps {
  collapsed: boolean;
}

export function Sidebar({ collapsed }: SidebarProps) {
  const groups = useNavigation();
  const pathname = usePathname();

  return (
    <aside
      className={`hidden md:flex h-screen flex-col border-r border-[var(--color-border)] bg-surface transition-all ${
        collapsed ? "w-[72px]" : "w-64"
      }`}
    >
      <div className="flex h-16 items-center gap-2 border-b border-[var(--color-border)] px-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-control)] bg-primary text-sm font-bold text-white">
          S
        </div>
        {!collapsed && <span className="font-heading text-base font-semibold text-heading">School ERP</span>}
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-4" aria-label="Main navigation">
        {groups.map((group) => (
          <div key={group.id} className="mb-4">
            {!collapsed && group.label && (
              <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wide text-[var(--color-muted-2)]">
                {group.label}
              </p>
            )}
            <ul className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const isActive = pathname === item.path || pathname.startsWith(`${item.path}/`);
                const Icon = item.icon;
                return (
                  <li key={item.id}>
                    <Link
                      href={item.path}
                      title={collapsed ? item.label : undefined}
                      aria-current={isActive ? "page" : undefined}
                      className={`flex items-center gap-3 rounded-[var(--radius-control)] px-3 py-2 text-sm font-medium transition-colors ${
                        isActive
                          ? "bg-[var(--color-primary-light)] text-primary"
                          : "text-text hover:bg-[var(--color-surface-alt)]"
                      }`}
                    >
                      <Icon className="h-[18px] w-[18px] shrink-0" />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                      {!collapsed && item.badge ? (
                        <span className="ml-auto rounded-[var(--radius-pill)] bg-danger px-1.5 py-0.5 text-[10px] font-semibold text-white">
                          {item.badge > 99 ? "99+" : item.badge}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
}
