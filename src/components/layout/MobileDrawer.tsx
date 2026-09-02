"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { useNavigation } from "@/hooks/useNavigation";

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function MobileDrawer({ open, onClose }: MobileDrawerProps) {
  const groups = useNavigation();
  const pathname = usePathname();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="absolute left-0 top-0 h-full w-72 bg-surface shadow-xl">
        <div className="flex h-16 items-center justify-between border-b border-[var(--color-border)] px-4">
          <span className="font-heading text-base font-semibold text-heading">School ERP</span>
          <button
            onClick={onClose}
            className="rounded-[var(--radius-control)] p-2 text-muted hover:bg-[var(--color-surface-alt)]"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-2 py-4" aria-label="Mobile navigation">
          {groups.map((group) => (
            <div key={group.id} className="mb-4">
              {group.label && (
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
                        onClick={onClose}
                        aria-current={isActive ? "page" : undefined}
                        className={`flex items-center gap-3 rounded-[var(--radius-control)] px-3 py-2.5 text-sm font-medium ${
                          isActive
                            ? "bg-[var(--color-primary-light)] text-primary"
                            : "text-text hover:bg-[var(--color-surface-alt)]"
                        }`}
                      >
                        <Icon className="h-[18px] w-[18px] shrink-0" />
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
}
