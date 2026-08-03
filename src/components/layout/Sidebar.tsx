"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/config/nav";

export function Sidebar({
  open,
  onNavigate,
}: {
  open: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  return (
    <aside
      className={`
        bg-chalkboard text-chalk shrink-0 w-64
        fixed inset-y-0 left-0 z-40 flex flex-col
        transition-transform duration-200 ease-out
        md:static md:translate-x-0
        ${open ? "translate-x-0" : "-translate-x-full"}
      `}
    >
      <div className="px-6 py-6 border-b border-white/10">
        <span className="font-display text-xl italic tracking-tight">
          Register
        </span>
        <p className="text-xs text-chalk/60 mt-1">School Management</p>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="flex flex-col gap-1 px-3">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  aria-current={isActive ? "page" : undefined}
                  className={`
                    flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium
                    transition-colors
                    ${
                      isActive
                        ? "bg-accent-mustard text-chalkboard"
                        : "text-chalk/85 hover:bg-chalkboard-soft"
                    }
                  `}
                >
                  <Icon size={18} strokeWidth={2} aria-hidden="true" />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="px-6 py-4 border-t border-white/10 text-xs text-chalk/50">
        Classes 1–10 · v0.1
      </div>
    </aside>
  );
}
