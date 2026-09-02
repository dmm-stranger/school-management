"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Menu, Search, Bell, ChevronDown } from "lucide-react";
import { useAuth } from "@/features/auth/AuthContext";

interface HeaderProps {
  onToggleSidebar: () => void;
  onToggleMobileMenu: () => void;
}

export function Header({ onToggleSidebar, onToggleMobileMenu }: HeaderProps) {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const primaryRole = user?.roles[0]?.label || "";
  const initials = user?.email?.slice(0, 2).toUpperCase() || "??";

  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-[var(--color-border)] bg-surface px-4">
      <button
        onClick={onToggleSidebar}
        className="hidden md:inline-flex rounded-[var(--radius-control)] p-2 text-muted hover:bg-[var(--color-surface-alt)]"
        aria-label="Toggle sidebar"
      >
        <Menu className="h-5 w-5" />
      </button>
      <button
        onClick={onToggleMobileMenu}
        className="md:hidden inline-flex rounded-[var(--radius-control)] p-2 text-muted hover:bg-[var(--color-surface-alt)]"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="relative hidden flex-1 max-w-md sm:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted-2)]" />
        <input
          type="search"
          placeholder="Search students, teachers, classes…"
          className="w-full rounded-[var(--radius-control)] border border-[var(--color-border)] bg-background py-2 pl-9 pr-3 text-sm text-text outline-none placeholder:text-[var(--color-muted-2)] focus:border-primary focus:ring-2 focus:ring-[var(--color-primary-light)]"
          aria-label="Global search"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button
          className="relative rounded-[var(--radius-control)] p-2 text-muted hover:bg-[var(--color-surface-alt)]"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
        </button>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-[var(--radius-control)] px-2 py-1.5 hover:bg-[var(--color-surface-alt)]"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">
              {initials}
            </div>
            <div className="hidden text-left sm:block">
              <p className="text-sm font-medium leading-tight text-heading">{user?.email}</p>
              <p className="text-xs leading-tight text-muted">{primaryRole}</p>
            </div>
            <ChevronDown className="h-4 w-4 text-muted" />
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 mt-2 w-48 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-surface py-1 shadow-lg"
            >
              <Link
                href="/users/profile"
                role="menuitem"
                className="block px-4 py-2 text-sm text-text hover:bg-[var(--color-surface-alt)]"
              >
                Profile
              </Link>
              <Link
                href="/security"
                role="menuitem"
                className="block px-4 py-2 text-sm text-text hover:bg-[var(--color-surface-alt)]"
              >
                Active Sessions
              </Link>
              <button
                role="menuitem"
                onClick={logout}
                className="block w-full px-4 py-2 text-left text-sm text-danger hover:bg-[var(--color-status-inactive-bg)]"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
